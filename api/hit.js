// Hidden visit and engagement counter. Pages send small beacons here; nothing is shown to visitors.
// Stores only counts: no IP addresses, no cookies, no personal data. Country and US state come from
// Vercel's geolocation headers and are stored only as totals.
import { store, day } from "./_store.js";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|mediapartners/i;
const clean = (s, n) => String(s ?? "").replace(/[^\w\-./#:, ]/g, "").trim().slice(0, n);
const label = (s, n) => String(s ?? "").replace(/[\u0000-\u001f<>"|]/g, "").replace(/\s+/g, " ").trim().slice(0, n);
const num = (v, lo, hi) => { const x = Math.round(Number(v)); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : null; };
const TEST = /^(exam-[1-6]|quiz-(0[1-9]|1[0-9]))$/;

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  let raw = "";
  for await (const chunk of req) { raw += chunk; if (raw.length > 4000) break; }
  return JSON.parse(raw || "{}");
}

function hourNY() {
  return Number(new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour: "numeric", hour12: false })) % 24;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  res.statusCode = 204;
  if (req.method !== "POST" || BOT.test(req.headers["user-agent"] || "")) return res.end();
  const pipeline = store();
  if (!pipeline) return res.end();
  try {
    const b = await readBody(req);
    const d = day();
    const path = clean(b.p, 120) || "/";
    const H = (key, field, by = 1) => ["HINCRBY", key, field, by];
    const cmds = [];
    switch (b.e) {
      case "buy": {
        const f = clean(b.f, 20) || "unknown";
        cmds.push(H("s7:buy", f), H(`s7:buy:${d}`, f));
        break;
      }
      case "click": {
        const l = label(b.l, 60) || "(no text)";
        const to = clean(b.to, 100);
        cmds.push(H("s7:clicks", `${l}|${to}`), H("s7:clickpages", `${path}|${l}`), ["INCR", `s7:clicks:${d}`]);
        break;
      }
      case "eng": {
        const s = num(b.s, 0, 1800), dep = num(b.d, -1, 100);
        if (s) cmds.push(H("s7:time", path, s), ["INCRBY", `s7:time:${d}`, s]);
        if (dep !== null && dep >= 0) {
          cmds.push(H("s7:engn", path));
          const bucket = dep >= 90 ? "100" : dep >= 75 ? "75" : dep >= 50 ? "50" : dep >= 25 ? "25" : "0";
          cmds.push(H("s7:depth", `${path}|${bucket}`));
        }
        break;
      }
      case "test_start": {
        if (!TEST.test(b.id)) break;
        const m = b.m === "study" ? "study" : "timed";
        cmds.push(H("s7:t:start", `${b.id}|${m}`), ["INCR", `s7:t:start:${d}`]);
        break;
      }
      case "test_answer": {
        if (!TEST.test(b.id)) break;
        cmds.push(H("s7:t:ans", b.id), ["INCR", "s7:t:ans:total"], ["INCR", `s7:t:ans:${d}`]);
        break;
      }
      case "test_finish": {
        if (!TEST.test(b.id)) break;
        const pct = num(b.pct, 0, 100);
        if (pct === null) break;
        const m = b.m === "study" ? "study" : "timed";
        const band = pct >= 80 ? "80-100" : pct >= 72 ? "72-79" : pct >= 60 ? "60-71" : pct >= 50 ? "50-59" : "0-49";
        cmds.push(H("s7:t:done", `${b.id}|${m}`), H("s7:t:score", b.id, pct), H("s7:t:donen", b.id),
          H("s7:t:band", band), ["INCR", `s7:t:done:${d}`]);
        if (pct >= 72) cmds.push(H("s7:t:pass", b.id));
        break;
      }
      case "rq_start":
        cmds.push(["INCR", "s7:rq:start"], ["INCR", `s7:rq:start:${d}`]);
        break;
      case "rq_finish": {
        const pct = num(b.pct, 0, 100);
        if (pct === null) break;
        const band = ["ready", "close", "building", "starting"].includes(b.band) ? b.band : "other";
        cmds.push(["INCR", "s7:rq:done"], ["INCR", `s7:rq:done:${d}`], ["INCRBY", "s7:rq:score", pct], H("s7:rq:band", band));
        break;
      }
      case "book_flip":
        cmds.push(H("s7:bookflip", b.side === "front" ? "front" : "back"), ["INCR", `s7:bookflip:${d}`]);
        break;
      case "fc_deck":
        cmds.push(H("s7:fc:deck", clean(b.d, 6) || "all"), ["INCR", `s7:fc:sessions:${d}`]);
        break;
      case "fc_session": {
        const flips = num(b.flips, 0, 5000) || 0, known = num(b.known, 0, 5000) || 0;
        if (flips) cmds.push(["INCRBY", "s7:fc:flips", flips]);
        if (known) cmds.push(["INCRBY", "s7:fc:known", known]);
        break;
      }
      case "audio_play": {
        const ch = num(b.ch, 1, 19);
        if (ch) cmds.push(H("s7:au:play", String(ch)), ["INCR", `s7:au:play:${d}`]);
        break;
      }
      case "audio_done": {
        const ch = num(b.ch, 1, 19);
        if (ch) cmds.push(H("s7:au:done", String(ch)));
        break;
      }
      case "pv":
      default: {
        if (b.e && b.e !== "pv") break;
        cmds.push(["INCR", "s7:views"], ["INCR", `s7:views:${d}`], H("s7:pages", path), H("s7:hours", String(hourNY())));
        if (b.n) cmds.push(["INCR", "s7:visitors"], ["INCR", `s7:new:${d}`]);
        if (b.t) cmds.push(["INCR", `s7:visitors:${d}`]);
        if (b.t && !b.n) cmds.push(["INCR", `s7:returning:${d}`]);
        if (b.land) cmds.push(H("s7:landing", path), ["INCR", `s7:sessions:${d}`]);
        const dev = ["mobile", "tablet", "desktop"].includes(b.dev) ? b.dev : "";
        if (dev && b.t) cmds.push(H("s7:device", dev));
        const country = clean(req.headers["x-vercel-ip-country"], 2).toUpperCase();
        if (country && b.t) {
          cmds.push(H("s7:country", country));
          const region = clean(req.headers["x-vercel-ip-country-region"], 3).toUpperCase();
          if (country === "US" && region) cmds.push(H("s7:usstate", region));
        }
        let host = "";
        try { host = new URL(b.r).hostname.replace(/^www\./, ""); } catch {}
        if (host && !/mzbacademy\.com$/.test(host)) cmds.push(H("s7:referrers", clean(host, 60)), H(`s7:referrers:${d}`, clean(host, 60)));
        const utm = clean(b.utm, 40);
        if (utm) cmds.push(H("s7:utm", utm));
      }
    }
    if (cmds.length) await pipeline(cmds);
  } catch {}
  res.end();
}
