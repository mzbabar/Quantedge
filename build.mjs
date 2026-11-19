// Build step for Vercel: copies src/ to public/ and fills in values from
// environment variables (Vercel → Project → Settings → Environment Variables).
// No dependencies. Run locally with:  KINDLE_URL=https://... node build.mjs
//
// In the HTML:
//   %%NAME%%                                   replaced with the variable's value
//   <!--if:NAME-->A<!--else:NAME-->B<!--endif:NAME-->   A if NAME is set, otherwise B
import { readdir, readFile, writeFile, mkdir, copyFile, rm } from "node:fs/promises";
import { join, extname } from "node:path";
import { createHash } from "node:crypto";

const env = (k) => (process.env[k] || "").trim();
const isUrl = (v) => /^https:\/\/[^\s"'<>]+$/i.test(v);
const isMail = (v) => /^mailto:[^\s"'<>]+$/i.test(v);
const isToken = (v) => /^[A-Za-z0-9_\-.:]+$/.test(v);

function pick(name, test, fallback = "") {
  const v = env(name);
  if (!v) return fallback;
  if (test(v)) return v;
  console.warn(`! Ignoring ${name}: "${v}" is not valid.`);
  return fallback;
}

const V = {
  // Amazon product pages. Leave empty until the book is live; the site shows "coming soon".
  KINDLE_URL: pick("KINDLE_URL", isUrl),
  PAPERBACK_URL: pick("PAPERBACK_URL", isUrl),
  HARDCOVER_URL: pick("HARDCOVER_URL", isUrl),
  // Other links
  ACADEMY_URL: pick("ACADEMY_URL", isUrl, "https://mzbacademy.com"),
  REPORT_ERROR_URL: "",
  AUTHOR_CENTRAL_URL: pick("AUTHOR_CENTRAL_URL", isUrl),
  GOODREADS_URL: pick("GOODREADS_URL", isUrl),
  LINKEDIN_URL: pick("LINKEDIN_URL", isUrl),
  // Identifiers and prices (optional; used in search-engine structured data)
  KINDLE_ASIN: pick("KINDLE_ASIN", isToken),
  PAPERBACK_ISBN: pick("PAPERBACK_ISBN", isToken),
  HARDCOVER_ISBN: pick("HARDCOVER_ISBN", isToken),
  KINDLE_PRICE: pick("KINDLE_PRICE", (v) => /^\d+(\.\d{2})?$/.test(v)),
  PAPERBACK_PRICE: pick("PAPERBACK_PRICE", (v) => /^\d+(\.\d{2})?$/.test(v)),
  HARDCOVER_PRICE: pick("HARDCOVER_PRICE", (v) => /^\d+(\.\d{2})?$/.test(v)),
  // Search console verification and analytics (optional)
  GOOGLE_SITE_VERIFICATION: pick("GOOGLE_SITE_VERIFICATION", isToken),
  BING_SITE_VERIFICATION: pick("BING_SITE_VERIFICATION", isToken),
  GA_MEASUREMENT_ID: pick("GA_MEASUREMENT_ID", (v) => /^G-[A-Z0-9]+$/i.test(v)),
  // Social proof. Leave these EMPTY until you have real figures: each section stays hidden until set.
  AMAZON_RATING: pick("AMAZON_RATING", (v) => /^[1-5](\.\d)?$/.test(v)),
  AMAZON_REVIEW_COUNT: pick("AMAZON_REVIEW_COUNT", (v) => /^[\d,]{1,9}$/.test(v)),
  TESTIMONIAL_VIDEO: pick("TESTIMONIAL_VIDEO", (v) => /^[\w-]{11}$/.test(v)),
  // Contact and social links (footer)
  CONTACT_EMAIL: pick("CONTACT_EMAIL", (v) => /^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i.test(v)),
  YOUTUBE_URL: pick("YOUTUBE_URL", isUrl),
  TIKTOK_URL: pick("TIKTOK_URL", isUrl),
  INSTAGRAM_URL: pick("INSTAGRAM_URL", isUrl),
  FACEBOOK_URL: pick("FACEBOOK_URL", isUrl),
};
// Testimonials: quote text and the name line under it (for example "Priya S., passed June 2027").
for (const i of [1, 2, 3]) {
  V[`TESTIMONIAL_${i}`] = pick(`TESTIMONIAL_${i}`, (v) => v.length <= 600);
  V[`TESTIMONIAL_${i}_NAME`] = V[`TESTIMONIAL_${i}`] ? pick(`TESTIMONIAL_${i}_NAME`, (v) => v.length <= 120) : "";
}
V.SOCIAL = V.YOUTUBE_URL || V.TIKTOK_URL || V.INSTAGRAM_URL || V.FACEBOOK_URL || V.LINKEDIN_URL ? "1" : "";
V.REPORT_ERROR_URL = pick("REPORT_ERROR_URL", (v) => isUrl(v) || isMail(v), V.ACADEMY_URL);

// Structured data for each format that is live on Amazon.
function editions() {
  const out = [];
  const add = (fmt, name, url, idName, id, price) => {
    if (!url) return;
    const e = { "@type": "Book", name: `Series 7 Mastery (${name})`, bookFormat: `https://schema.org/${fmt}`, url };
    if (id) e[idName] = id;
    e.offers = { "@type": "Offer", url, availability: "https://schema.org/InStock", seller: { "@type": "Organization", name: "Amazon" } };
    if (price) { e.offers.price = price; e.offers.priceCurrency = "USD"; }
    out.push(e);
  };
  add("EBook", "Kindle Edition", V.KINDLE_URL, "identifier", V.KINDLE_ASIN, V.KINDLE_PRICE);
  add("Paperback", "Paperback", V.PAPERBACK_URL, "isbn", V.PAPERBACK_ISBN, V.PAPERBACK_PRICE);
  add("Hardcover", "Hardcover", V.HARDCOVER_URL, "isbn", V.HARDCOVER_ISBN, V.HARDCOVER_PRICE);
  return out;
}
const JSONV = {
  BOOK_EDITIONS_JSON: editions(),
  BOOK_SAMEAS_JSON: [V.KINDLE_URL, V.PAPERBACK_URL, V.HARDCOVER_URL, V.GOODREADS_URL].filter(Boolean),
  AUTHOR_SAMEAS_JSON: [V.AUTHOR_CENTRAL_URL, V.LINKEDIN_URL, V.ACADEMY_URL].filter(Boolean),
};

const escAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function render(text) {
  // Conditionals (repeat so nested/adjacent blocks resolve).
  const re = /<!--if:([A-Z0-9_]+)-->([\s\S]*?)(?:<!--else:\1-->([\s\S]*?))?<!--endif:\1-->/g;
  let prev;
  do { prev = text; text = text.replace(re, (_, k, a, b = "") => (V[k] ? a : b)); } while (text !== prev);
  // JSON values inside JSON-LD: "%%NAME%%" (with quotes) becomes a JSON array.
  text = text.replace(/"%%([A-Z_]+_JSON)%%"/g, (m, k) =>
    k in JSONV ? JSON.stringify(JSONV[k]).replace(/</g, "\\u003c") : m);
  // Drop empty arrays from JSON-LD so validators stay quiet.
  text = text.replace(/,\s*"(workExample|sameAs)":\s*\[\]/g, "");
  // Cache-busting: each deploy points pages at the current CSS/JS.
  text = text.replace(/\/assets\/([\w-]+\.(?:css|js))"/g, (m, f) => (VERSION[f] ? `/assets/${f}?v=${VERSION[f]}"` : m));
  text = text.replace(/%%([A-Z0-9_]+)%%/g, (m, k) => (k in V ? escAttr(V[k]) : m));
  // Inline the (small) stylesheet so the first paint never waits for a second request.
  return text.replace(/<link rel="stylesheet" href="\/assets\/styles\.css(\?v=\w+)?">/, () => `<style>${CSS}</style>`);
}

const SRC = "src", OUT = "public";
const VERSION = {};
for (const f of (await readdir(join(SRC, "assets"))).filter((n) => /\.(css|js)$/.test(n)))
  VERSION[f] = createHash("sha1").update(await readFile(join(SRC, "assets", f))).digest("hex").slice(0, 10);
const CSS = (await readFile(join(SRC, "assets", "styles.css"), "utf8"))
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{};:,>])\s*/g, "$1").replace(/;}/g, "}").trim();
const TEXT = new Set([".html", ".xml", ".txt", ".webmanifest", ".json", ".css", ".js", ".svg"]);
let pages = 0;

async function walk(dir) {
  for (const ent of await readdir(join(SRC, dir), { withFileTypes: true })) {
    const rel = join(dir, ent.name), from = join(SRC, rel), to = join(OUT, rel);
    if (ent.isDirectory()) { await mkdir(to, { recursive: true }); await walk(rel); continue; }
    if (TEXT.has(extname(ent.name))) {
      let out = render(await readFile(from, "utf8"));
      const left = out.match(/%%[A-Z0-9_]+%%|<!--(if|else|endif):/);
      if (left) throw new Error(`Unfilled placeholder ${left[0]} in ${rel}`);
      await writeFile(to, out);
      if (ent.name.endsWith(".html")) pages++;
    } else await copyFile(from, to);
  }
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await walk("");
const live = ["KINDLE_URL", "PAPERBACK_URL", "HARDCOVER_URL"].map((k) => `${k}=${V[k] ? "set" : "not set"}`).join(", ");
console.log(`Built ${pages} pages into ${OUT}/ (${live})`);
