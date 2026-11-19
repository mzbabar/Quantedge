// Private stats page: https://series7.mzbacademy.com/admin
// Sign in with the password set as STATS_KEY in Vercel → Settings → Environment Variables.
// After sign-in a secure cookie keeps you signed in on that browser for 90 days.
// Opening the page also stops your own browser from being counted (see the script below).
import { timingSafeEqual, createHmac } from "node:crypto";
import { store, day, storageEnvNames } from "./_store.js";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const n = (v) => Number(v || 0).toLocaleString("en-US");

function keyOk(given) {
  const w = (process.env.STATS_KEY || "").trim();
  if (w.length < 8 || !given) return false;
  const a = Buffer.from(String(given)), b = Buffer.from(w);
  return a.length === b.length && timingSafeEqual(a, b);
}

const want = () => (process.env.STATS_KEY || "").trim();
const token = () => createHmac("sha256", want()).update("s7-admin-v1").digest("hex");
const COOKIE = "s7admin";

function signedIn(req) {
  if (want().length < 8) return false;
  const m = (req.headers.cookie || "").match(/(?:^|;\s*)s7admin=([a-f0-9]{64})/);
  if (!m) return false;
  const a = Buffer.from(m[1]), b = Buffer.from(token());
  return a.length === b.length && timingSafeEqual(a, b);
}

async function formPassword(req) {
  let raw = "";
  if (typeof req.body === "string") raw = req.body;
  else if (req.body && typeof req.body === "object") return String(req.body.password || "");
  else for await (const c of req) { raw += c; if (raw.length > 1000) break; }
  return new URLSearchParams(raw).get("password") || "";
}

function login(res, msg = "") {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(page(`<header><h1>Series 7 Mastery · admin</h1></header><main>
<form method="post" action="/admin" class="login">
<label for="pw">Password</label>
<input id="pw" name="password" type="password" autocomplete="current-password" autofocus required>
<button type="submit">Sign in</button>
${msg ? `<p class="err">${esc(msg)}</p>` : ""}
${want().length < 8 ? `<p class="note">No password is set yet. In Vercel add an environment variable named <code>STATS_KEY</code> (at least 8 letters and numbers), then redeploy.</p>` : ""}
</form></main>`, false));
}

const pairs = (arr) => {
  const out = [];
  for (let i = 0; arr && i < arr.length; i += 2) out.push([arr[i], Number(arr[i + 1])]);
  return out.sort((x, y) => y[1] - x[1]);
};

function page(body, dontCount = true) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Site stats · Series 7 Mastery</title>
<style>
:root{--navy:#0B1F3A;--gold:#C9A24A;--ink:#1d2433;--muted:#667085;--rule:#e6e1d3;--bg:#faf8f3}
*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);background:var(--bg)}
header{background:var(--navy);color:#fff;padding:20px 16px}header h1{margin:0;font-size:20px}header p{margin:4px 0 0;color:#c9d3e3;font-size:13px}
main{max-width:920px;margin:0 auto;padding:20px 16px 48px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:24px}
.tile{background:#fff;border:1px solid var(--rule);border-radius:10px;padding:14px}
.tile b{display:block;font-size:28px;color:var(--navy);font-variant-numeric:tabular-nums}.tile span{color:var(--muted);font-size:13px}
h2{font-size:16px;margin:28px 0 10px;color:var(--navy)}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--rule);border-radius:10px;overflow:hidden}
td,th{padding:7px 10px;border-bottom:1px solid var(--rule);text-align:left;font-size:14px}th{background:#f3efe4;font-weight:600}
td.r,th.r{text-align:right;font-variant-numeric:tabular-nums}.bar{display:inline-block;height:8px;background:var(--gold);border-radius:4px;vertical-align:middle}
.note{color:var(--muted);font-size:13px}code{background:#f0ece0;padding:1px 5px;border-radius:4px}
.login{max-width:340px;margin:40px auto;background:#fff;border:1px solid var(--rule);border-radius:12px;padding:22px}
.login label{display:block;font-weight:600;margin-bottom:6px}.login input{width:100%;font:inherit;padding:10px 12px;border:1px solid #cfc8b6;border-radius:8px}
.login button{margin-top:12px;width:100%;font:600 15px system-ui,sans-serif;padding:10px;border:0;border-radius:8px;background:var(--navy);color:#fff;cursor:pointer}
.err{color:#b42318;font-size:14px;margin:10px 0 0}
h3{font-size:14px;margin:18px 0 8px;color:var(--ink)}
.jump{margin-top:12px;display:flex;flex-wrap:wrap;gap:6px 14px}.jump a{color:#E9D9A6;font-size:13px;text-decoration:none;float:none}
.tw{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px}.tw table{min-width:100%}
td.bc{width:28%;min-width:80px}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:0 20px}
h2{scroll-margin-top:12px}header a{color:#E9D9A6;font-size:13px;float:right}
</style></head><body>${body}
${dontCount ? "<script>try{localStorage.setItem('s7nc','1')}catch(e){}</script>" : ""}</body></html>`;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("X-Frame-Options", "DENY");
  const q = req.query || {};
  if (q.logout !== undefined) {
    res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
    res.statusCode = 303; res.setHeader("Location", "/admin"); return res.end();
  }
  if (req.method === "POST") {
    if (keyOk(await formPassword(req))) {
      res.setHeader("Set-Cookie", `${COOKIE}=${token()}; Path=/; Max-Age=${90 * 86400}; HttpOnly; Secure; SameSite=Strict`);
      res.statusCode = 303; res.setHeader("Location", "/admin"); return res.end();
    }
    await new Promise((r) => setTimeout(r, 1200)); // slow down password guessing
    res.statusCode = 401; return login(res, "Wrong password.");
  }
  if (!signedIn(req)) return login(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const pipeline = store();
  if (!pipeline) {
    const names = storageEnvNames();
    return res.end(page(`<header><a href="/admin?logout">Sign out</a><h1>Site stats</h1></header><main>
<p>You are signed in, but the counter cannot find its database connection.</p>
<p>In Vercel open this project → <b>Storage</b>, make sure your Upstash database is <b>connected to this project</b> for the <b>Production</b> environment, then go to <b>Deployments</b> and <b>Redeploy</b> the latest deployment. New settings only reach the site after a redeploy.</p>
<p class="note">Database settings this deployment can see: ${names.length ? names.map((n) => `<code>${esc(n)}</code>`).join(" ") : "<b>none</b>"}. The counter needs one ending in <code>KV_REST_API_URL</code> and one ending in <code>KV_REST_API_TOKEN</code>.</p></main>`));
  }
  const [y, m, d0] = day().split("-").map(Number);
  const uniq = [];
  for (let i = 0; i < 30; i++) uniq.push(new Date(Date.UTC(y, m - 1, d0 - i)).toISOString().slice(0, 10));
  const daily = (k) => ["MGET", ...uniq.map((d) => `s7:${k}:${d}`)];
  const HG = (k) => ["HGETALL", `s7:${k}`];
  const SPEC = [
    ["views", ["GET", "s7:views"]], ["visitors", ["GET", "s7:visitors"]], ["ansTotal", ["GET", "s7:t:ans:total"]],
    ["fcFlips", ["GET", "s7:fc:flips"]], ["fcKnown", ["GET", "s7:fc:known"]],
    ["rqStart", ["GET", "s7:rq:start"]], ["rqDone", ["GET", "s7:rq:done"]], ["rqScore", ["GET", "s7:rq:score"]], ["rqBand", HG("rq:band")],
    ["dRqStart", daily("rq:start")], ["dRqDone", daily("rq:done")],
    ["dViews", daily("views")], ["dVisitors", daily("visitors")], ["dNew", daily("new")], ["dReturning", daily("returning")],
    ["dSessions", daily("sessions")], ["dTime", daily("time")], ["dClicks", daily("clicks")],
    ["dTStart", daily("t:start")], ["dTDone", daily("t:done")], ["dTAns", daily("t:ans")],
    ["dFc", daily("fc:sessions")], ["dAu", daily("au:play")],
    ["pages", HG("pages")], ["referrers", HG("referrers")], ["buy", HG("buy")], ["clicks", HG("clicks")],
    ["clickpages", HG("clickpages")], ["time", HG("time")], ["engn", HG("engn")], ["depth", HG("depth")],
    ["landing", HG("landing")], ["utm", HG("utm")], ["device", HG("device")], ["country", HG("country")],
    ["usstate", HG("usstate")], ["hours", HG("hours")],
    ["tStart", HG("t:start")], ["tDone", HG("t:done")], ["tDoneN", HG("t:donen")], ["tScore", HG("t:score")],
    ["tPass", HG("t:pass")], ["tAns", HG("t:ans")], ["tBand", HG("t:band")],
    ["fcDeck", HG("fc:deck")], ["bookFlip", HG("bookflip")], ["auPlay", HG("au:play")], ["auDone", HG("au:done")],
  ];
  try {
    const out = await pipeline(SPEC.map((x) => x[1]));
    const R = Object.fromEntries(SPEC.map((x, i) => [x[0], out[i]]));
    const obj = (arr) => { const o = {}; for (let i = 0; arr && i < arr.length; i += 2) o[arr[i]] = Number(arr[i + 1]); return o; };
    const N = (v) => Number(v || 0);
    const rows = uniq.map((d, i) => ({ d, views: N(R.dViews[i]), visitors: N(R.dVisitors[i]), newV: N(R.dNew[i]), ret: N(R.dReturning[i]),
      sessions: N(R.dSessions[i]), time: N(R.dTime[i]), clicks: N(R.dClicks[i]), tStart: N(R.dTStart[i]), tDone: N(R.dTDone[i]),
      tAns: N(R.dTAns[i]), fc: N(R.dFc[i]), au: N(R.dAu[i]), rqStart: N(R.dRqStart[i]), rqDone: N(R.dRqDone[i]) }));
    const sum = (k, days) => rows.slice(0, days).reduce((s, x) => s + x[k], 0);

    // Practice tests: one row per test, timed and study mode combined.
    const tStart = obj(R.tStart), tDone = obj(R.tDone), tDoneN = obj(R.tDoneN), tScore = obj(R.tScore), tPass = obj(R.tPass), tAns = obj(R.tAns);
    const ids = [...Array(6)].map((_, i) => `exam-${i + 1}`).concat([...Array(19)].map((_, i) => `quiz-${String(i + 1).padStart(2, "0")}`));
    const tests = ids.map((id) => {
      const st = N(tStart[`${id}|timed`]) + N(tStart[`${id}|study`]), dn = N(tDoneN[id]);
      return { id, name: id.startsWith("exam") ? `Practice Exam ${id.slice(5)}` : `Chapter ${Number(id.slice(5))} quiz`,
        timed: N(tStart[`${id}|timed`]), study: N(tStart[`${id}|study`]), started: st, finished: dn,
        avg: dn ? Math.round(N(tScore[id]) / dn) : null, pass: dn ? Math.round((N(tPass[id]) / dn) * 100) : null, answers: N(tAns[id]) };
    }).filter((t) => t.started || t.finished || t.answers);
    const totStart = tests.reduce((s, t) => s + t.started, 0), totDone = tests.reduce((s, t) => s + t.finished, 0);
    const totScore = Object.values(tScore).reduce((a, b) => a + b, 0), totPass = Object.values(tPass).reduce((a, b) => a + b, 0);

    // Pages with engagement.
    const pages = obj(R.pages), time = obj(R.time), engn = obj(R.engn), depthRaw = obj(R.depth);
    const deep = {};
    for (const [k, c] of Object.entries(depthRaw)) { const [pth, b] = k.split("|"); if (b === "75" || b === "100") deep[pth] = (deep[pth] || 0) + c; }
    const pageRows = Object.keys(pages).map((pth) => ({ pth, views: pages[pth], avg: engn[pth] ? Math.round(N(time[pth]) / engn[pth]) : null,
      deep: engn[pth] ? Math.round((N(deep[pth]) / engn[pth]) * 100) : null })).sort((a, b) => b.views - a.views);

    const clickRows = Object.entries(obj(R.clicks)).map(([k, c]) => { const at = k.lastIndexOf("|"); return { l: k.slice(0, at), to: k.slice(at + 1), c }; }).sort((a, b) => b.c - a.c);
    const clickPageRows = Object.entries(obj(R.clickpages)).map(([k, c]) => { const at = k.indexOf("|"); return { pth: k.slice(0, at), l: k.slice(at + 1), c }; }).sort((a, b) => b.c - a.c);

    const data = { generated: new Date().toISOString(), totals: { views: N(R.views), visitors: N(R.visitors), testStarts: totStart, testsFinished: totDone,
        questionsAnswered: N(R.ansTotal), flashcardFlips: N(R.fcFlips), flashcardsKnown: N(R.fcKnown),
        readinessStarted: N(R.rqStart), readinessFinished: N(R.rqDone), readinessAvg: N(R.rqDone) ? Math.round(N(R.rqScore) / N(R.rqDone)) : null },
      readinessBands: obj(R.rqBand),
      days: rows, tests, scoreBands: obj(R.tBand), pages: pageRows, clicks: clickRows, clicksByPage: clickPageRows, buyClicks: obj(R.buy),
      landing: obj(R.landing), referrers: obj(R.referrers), utm: obj(R.utm), device: obj(R.device), country: obj(R.country),
      usState: obj(R.usstate), bookFlips: obj(R.bookFlip), hours: obj(R.hours), flashcardDecks: obj(R.fcDeck), audioPlays: obj(R.auPlay), audioCompleted: obj(R.auDone) };
    if (q.format === "json") { res.setHeader("Content-Type", "application/json"); return res.end(JSON.stringify(data, null, 2)); }

    // ---------- HTML ----------
    const pct = (a, b) => (b ? Math.round((a / b) * 100) + "%" : "–");
    const mins = (sec) => (sec == null ? "–" : sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, "0")}s`);
    const bar = (v, max) => `<span class="bar" style="width:${Math.max(2, Math.round((v / Math.max(1, max)) * 100))}%"></span>`;
    const table = (head, rowsHtml, empty = "Nothing yet.") => rowsHtml.length
      ? `<div class="tw"><table><tr>${head.map((h, i) => `<th${i ? ' class="r"' : ""}>${h}</th>`).join("")}</tr>${rowsHtml.join("")}</table></div>` : `<p class="note">${empty}</p>`;
    const ranked = (o, label, limit = 15, fmtKey = (k) => esc(k)) => {
      const e = Object.entries(o).sort((a, b) => b[1] - a[1]); const tot = e.reduce((s, x) => s + x[1], 0); const mx = e.length ? e[0][1] : 1;
      return table([label, "Count", "Share", ""], e.slice(0, limit).map(([k, c]) => `<tr><td>${fmtKey(k)}</td><td class="r">${n(c)}</td><td class="r">${pct(c, tot)}</td><td class="bc">${bar(c, mx)}</td></tr>`));
    };
    const tile = (big, small) => `<div class="tile"><b>${big}</b><span>${small}</span></div>`;
    const COUNTRY = new Intl.DisplayNames(["en"], { type: "region" });
    const cname = (c) => { try { return esc(COUNTRY.of(c) || c); } catch { return esc(c); } };
    const deckName = (k) => (k === "all" ? "All chapters" : k === "0" ? "Glossary" : `Chapter ${esc(k)}`);
    const maxV = Math.max(1, ...rows.map((x) => x.views));
    const hours = obj(R.hours); const hMax = Math.max(1, ...Object.values(hours));
    const label12 = (h) => `${(h % 12) || 12} ${h < 12 ? "a.m." : "p.m."}`;
    const auPlay = obj(R.auPlay), auDone = obj(R.auDone);

    const body = `<header><a href="/admin?logout">Sign out</a><h1>Series 7 Mastery · site stats</h1><p>Updated ${esc(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }))} (New York time). Refresh for the latest.</p>
<nav class="jump"><a href="#overview">Overview</a><a href="#readiness">Readiness quiz</a><a href="#tests">Practice tests</a><a href="#clicks">Clicks</a><a href="#pages">Pages</a><a href="#audience">Audience</a><a href="#sources">Sources</a><a href="#study">Flashcards &amp; audio</a><a href="#daily">Daily</a></nav></header><main>

<h2 id="overview">Overview</h2>
<div class="tiles">
${tile(n(data.totals.views), "page views, all time")}
${tile(n(data.totals.visitors), "unique visitors, all time")}
${tile(n(rows[0].views), `views today · ${n(rows[0].visitors)} visitors`)}
${tile(n(sum("views", 7)), `views, last 7 days · ${n(sum("visitors", 7))} visitors`)}
${tile(n(sum("views", 30)), `views, last 30 days · ${n(sum("visitors", 30))} visitors`)}
${tile(mins(sum("sessions", 30) ? Math.round(sum("time", 30) / sum("sessions", 30)) : null), "average time per visit (30 days)")}
${tile(n(data.totals.readinessFinished), `readiness quizzes finished · ${n(data.totals.readinessStarted)} started`)}
${tile(n(totStart), "practice tests started")}
${tile(n(totDone), `tests finished · ${pct(totDone, totStart)} completion`)}
${tile(totDone ? Math.round(totScore / totDone) + "%" : "–", `average score · ${pct(totPass, totDone)} scored 72%+`)}
${tile(n(data.totals.questionsAnswered), "practice questions answered")}
${tile(n(Object.values(data.buyClicks).reduce((a, b) => a + b, 0)), "Amazon button clicks")}
${tile(n(obj(R.bookFlip).back || 0), "times the book was flipped to its back cover")}
${tile(n(Object.values(auPlay).reduce((a, b) => a + b, 0)), `audio lessons played · ${n(data.totals.flashcardFlips)} flashcards flipped`)}
</div>

<h2 id="readiness">Readiness quiz</h2>
<p class="note">The free 20-question quiz at /series-7-readiness-quiz. Each result recommends a study plan: <b>ready</b> 80%+ (2-week), <b>close</b> 65–79% (4-week), <b>building</b> 45–64% and <b>starting</b> under 45% (8-week).</p>
<div class="tiles">
${tile(n(data.totals.readinessStarted), "quizzes started")}
${tile(n(data.totals.readinessFinished), `quizzes finished · ${pct(data.totals.readinessFinished, data.totals.readinessStarted)} completion`)}
${tile(data.totals.readinessAvg == null ? "–" : data.totals.readinessAvg + "%", "average score")}
${tile(n(sum("rqDone", 7)), `finished, last 7 days · ${n(sum("rqStart", 7))} started`)}
</div>
${(() => { const b = data.readinessBands; const order = ["starting", "building", "close", "ready"]; const mx = Math.max(1, ...order.map((k) => b[k] || 0)); const tot = order.reduce((s, k) => s + (b[k] || 0), 0);
  return tot ? table(["Result", "Quizzes", "Share", ""], order.map((k) => `<tr><td>${k}</td><td class="r">${n(b[k])}</td><td class="r">${pct(b[k] || 0, tot)}</td><td class="bc">${bar(b[k] || 0, mx)}</td></tr>`)) : '<p class="note">No readiness quizzes finished yet.</p>'; })()}

<h2 id="tests">Practice tests</h2>
<p class="note">"Started" counts each time someone opens a test fresh (timed or study mode). "Finished" counts submitted tests. Scores are the percentage correct; 72% is the passing line.</p>
${table(["Test", "Started", "Timed / study", "Finished", "Completion", "Avg score", "Scored 72%+", "Questions answered"],
  tests.map((t) => `<tr><td>${t.name}</td><td class="r">${n(t.started)}</td><td class="r">${n(t.timed)} / ${n(t.study)}</td><td class="r">${n(t.finished)}</td><td class="r">${pct(t.finished, t.started)}</td><td class="r">${t.avg == null ? "–" : t.avg + "%"}</td><td class="r">${t.pass == null ? "–" : t.pass + "%"}</td><td class="r">${n(t.answers)}</td></tr>`),
  "No practice tests have been started yet.")}
<h3>Score distribution (finished tests)</h3>
${(() => { const b = data.scoreBands; const order = ["0-49", "50-59", "60-71", "72-79", "80-100"]; const mx = Math.max(1, ...order.map((k) => b[k] || 0)); const tot = order.reduce((s, k) => s + (b[k] || 0), 0);
  return tot ? table(["Score", "Tests", "Share", ""], order.map((k) => `<tr><td>${k}%</td><td class="r">${n(b[k])}</td><td class="r">${pct(b[k] || 0, tot)}</td><td class="bc">${bar(b[k] || 0, mx)}</td></tr>`)) : '<p class="note">No finished tests yet.</p>'; })()}

<h2 id="clicks">Where visitors click</h2>
<h3>Amazon buttons</h3>${ranked(data.buyClicks, "Format")}
<h3>Most-clicked links and buttons</h3>
${table(["Link or button", "Goes to", "Clicks"], clickRows.slice(0, 40).map((x) => `<tr><td>${esc(x.l)}</td><td class="r">${esc(x.to || "–")}</td><td class="r">${n(x.c)}</td></tr>`))}
<h3>Clicks by page</h3>
${table(["Page", "Link or button", "Clicks"], clickPageRows.slice(0, 40).map((x) => `<tr><td>${esc(x.pth)}</td><td class="r">${esc(x.l)}</td><td class="r">${n(x.c)}</td></tr>`))}

<h2 id="pages">Pages</h2>
<p class="note">Average time counts only time the page was actually on screen. "Read 75%+" is the share of visits that scrolled at least three-quarters of the way down.</p>
${table(["Page", "Views", "Avg time on page", "Read 75%+", ""], pageRows.slice(0, 30).map((x) => `<tr><td>${esc(x.pth)}</td><td class="r">${n(x.views)}</td><td class="r">${mins(x.avg)}</td><td class="r">${x.deep == null ? "–" : x.deep + "%"}</td><td class="bc">${bar(x.views, pageRows[0] ? pageRows[0].views : 1)}</td></tr>`))}
<h3>Landing pages (first page of a visit)</h3>${ranked(data.landing, "Page")}

<h2 id="audience">Audience</h2>
<div class="two">
<div><h3>Device</h3>${ranked(data.device, "Device", 3, (k) => esc(k[0].toUpperCase() + k.slice(1)))}</div>
<div><h3>New vs. returning (30 days)</h3>${table(["Type", "Visitors", "Share"], (() => { const nw = sum("newV", 30), rt = sum("ret", 30), t = nw + rt; return t ? [`<tr><td>New</td><td class="r">${n(nw)}</td><td class="r">${pct(nw, t)}</td></tr>`, `<tr><td>Returning</td><td class="r">${n(rt)}</td><td class="r">${pct(rt, t)}</td></tr>`] : []; })())}</div>
</div>
<div class="two">
<div><h3>Countries</h3>${ranked(data.country, "Country", 15, cname)}</div>
<div><h3>U.S. states</h3>${ranked(data.usState, "State", 15)}</div>
</div>
<h3>Time of day (New York time)</h3>
${table(["Hour", "Views", ""], [...Array(24)].map((_, h) => [h, hours[h] || 0]).filter(([, v]) => v).map(([h, v]) => `<tr><td>${label12(h)}</td><td class="r">${n(v)}</td><td class="bc">${bar(v, hMax)}</td></tr>`))}

<h2 id="sources">Traffic sources</h2>
<div class="two">
<div><h3>Referring websites</h3>${ranked(data.referrers, "Website")}</div>
<div><h3>Campaigns (utm_source)</h3>${ranked(data.utm, "Source")}</div>
</div>
<p class="note">Visits with no referring website (typed addresses, bookmarks, many apps) are not listed. Add <code>?utm_source=linkedin</code> (or similar) to links you share to see them here.</p>

<h2 id="study">Flashcards and audio lessons</h2>
<div class="two">
<div><h3>Flashcard decks opened</h3>${ranked(data.flashcardDecks, "Deck", 21, deckName)}
<p class="note">${n(data.totals.flashcardFlips)} cards flipped · ${n(data.totals.flashcardsKnown)} marked "I know it"</p></div>
<div><h3>Audio lessons</h3>${table(["Lesson", "Plays", "Listened to the end"], Object.keys(auPlay).sort((a, b) => a - b).map((ch) => `<tr><td>Chapter ${esc(ch)}</td><td class="r">${n(auPlay[ch])}</td><td class="r">${n(auDone[ch])} (${pct(auDone[ch] || 0, auPlay[ch])})</td></tr>`))}</div>
</div>

<h2 id="daily">Last 30 days</h2>
${table(["Day", "Views", "Visitors", "New", "Tests started", "Tests finished", "Questions", "Clicks", ""],
  rows.map((x) => `<tr><td>${x.d}</td><td class="r">${n(x.views)}</td><td class="r">${n(x.visitors)}</td><td class="r">${n(x.newV)}</td><td class="r">${n(x.tStart)}</td><td class="r">${n(x.tDone)}</td><td class="r">${n(x.tAns)}</td><td class="r">${n(x.clicks)}</td><td class="bc">${bar(x.views, maxV)}</td></tr>`))}

<p class="note">Bots are not counted, and neither is any browser that has opened this page. A "visitor" is one browser; the same person on a phone and a laptop counts twice. Engagement figures (time, scrolling, clicks, tests) start from the day this version was deployed. Raw data: <code>/admin?format=json</code></p>
</main>`;
    res.end(page(body));
  } catch (e) {
    res.statusCode = 502;
    res.end(page(`<main><p>Could not read the stats database. Try again in a minute.</p></main>`));
  }
}
