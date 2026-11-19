// Short links: /go/kindle, /go/paperback, /go/hardcover, /go/academy, /go/report-error
// Redirect to the URLs set in Vercel environment variables. Handy for QR codes
// and links printed in the book, which can then never go stale.
const LINKS = {
  kindle: ["KINDLE_URL", "https://www.amazon.com/s?k=Series+7+Mastery+Muhammad+Babar&i=digital-text"],
  paperback: ["PAPERBACK_URL", "https://www.amazon.com/s?k=Series+7+Mastery+Muhammad+Babar&i=stripbooks"],
  hardcover: ["HARDCOVER_URL", "https://www.amazon.com/s?k=Series+7+Mastery+Muhammad+Babar&i=stripbooks"],
  amazon: ["PAPERBACK_URL", "https://www.amazon.com/s?k=Series+7+Mastery+Muhammad+Babar"],
  academy: ["ACADEMY_URL", "https://mzbacademy.com"],
  "report-error": ["REPORT_ERROR_URL", null],
};

const ok = (u) => typeof u === "string" && /^(https:\/\/|mailto:)\S+$/i.test(u.trim());

function resolve(name) {
  const link = LINKS[name];
  if (!link) return null;
  const v = process.env[link[0]];
  if (ok(v)) return v.trim();
  return link[1] || resolve("academy");
}

export default function handler(req, res) {
  const target = resolve(String((req.query && req.query.name) || "").toLowerCase());
  if (!target) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Unknown link.");
  }
  res.statusCode = 302;
  res.setHeader("Location", target);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  res.end();
}
