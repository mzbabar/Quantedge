// Public, anonymous running totals for the home-page counters. Returns only four numbers.
// The counters stay hidden until PUBLIC_STATS_MIN practice questions have been answered
// (default 1,000), so the section never shows small or empty figures.
import { store } from "./_store.js";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Robots-Tag", "noindex");
  const send = (o, cache) => { res.setHeader("Cache-Control", cache); res.end(JSON.stringify(o)); };
  const pipeline = store();
  if (!pipeline) return send({ show: false }, "public, max-age=300");
  try {
    const [ans, fcFlips, rqDone, tDoneN] = await pipeline([["GET", "s7:t:ans:total"], ["GET", "s7:fc:flips"], ["GET", "s7:rq:done"], ["HGETALL", "s7:t:donen"]]);
    let tests = 0;
    for (let i = 1; tDoneN && i < tDoneN.length; i += 2) tests += Number(tDoneN[i]) || 0;
    const questions = Number(ans) || 0;
    const min = Number(process.env.PUBLIC_STATS_MIN || 1000);
    const out = { show: questions >= min, questions, tests, quizzes: Number(rqDone) || 0, flips: Number(fcFlips) || 0 };
    send(out.show ? out : { show: false }, "public, max-age=60, s-maxage=600, stale-while-revalidate=3600");
  } catch {
    send({ show: false }, "public, max-age=60");
  }
}
