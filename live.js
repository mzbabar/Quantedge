// Live activity for /admin: who is on the site right now, pages viewed, scroll depth, clicks and key actions.
// - Page views, scroll depth (25/50/75/100%) and button clicks come from /track.js via a small beacon to POST /t.
// - Key actions (score plan, Playbook, sign-up, free-call request, bootcamp, contact) are logged by the server.
// - Location is the approximate city from Vercel's request headers. No IP address is stored.
// - Events are kept for 48 hours, then deleted automatically.
const crypto = require('crypto');
const db = require('./db');

const KEEP_MS = 48 * 3600 * 1000;
const ACTIVE_MS = 5 * 60 * 1000;
const TYPES = new Set(['view', 'scroll', 'click']);
const BOT_RE = /bot|crawl|spider|slurp|preview|monitor|lighthouse|headless|curl|wget|python|axios|node-fetch|go-http|scrapy|facebookexternalhit|embedly|whatsapp|vercel/i;
const clean = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const dec = (s) => { try { return decodeURIComponent(s || ''); } catch { return s || ''; } };

function where(req) {
  return {
    city: clean(dec(req.get('x-vercel-ip-city')), 60),
    region: clean(req.get('x-vercel-ip-country-region'), 10),
    country: clean(req.get('x-vercel-ip-country'), 2).toUpperCase(),
  };
}
function sid(req) {
  if (!req.session.vid) req.session.vid = crypto.randomBytes(8).toString('hex');
  return req.session.vid;
}
const skip = (req) => !req.get('user-agent') || BOT_RE.test(req.get('user-agent')) || (req.user && req.user.role === 'admin');

async function save(req, ev) {
  await db.insert('activity', { id: db.id(), createdAt: db.now(), sid: sid(req), ...where(req), ...ev });
}

// Server-side key actions, e.g. live.action(req, 'plan', '/plan', 'Score plan: goal 705–745').
async function action(req, type, path, detail) {
  try { if (!skip(req)) await save(req, { type, path: clean(path, 200), detail: clean(detail, 120) }); }
  catch (e) { console.error('live action:', e.message); }
}

// Beacon endpoint used by /track.js.
async function beacon(req, res) {
  try {
    const b = req.body || {};
    const type = String(b.type || '');
    const path = clean(b.path, 200);
    if (skip(req) || !TYPES.has(type) || !path.startsWith('/') || path.startsWith('/admin')) return res.status(204).end();
    const ev = { type, path };
    if (type === 'view') ev.title = clean(b.title, 150);
    if (type === 'scroll') { const d = parseInt(b.depth, 10); if (![25, 50, 75, 100].includes(d)) return res.status(204).end(); ev.depth = d; }
    if (type === 'click') ev.detail = clean(b.label, 60);
    await save(req, ev);
  } catch (e) { console.error('live beacon:', e.message); }
  res.status(204).end();
}

let lastPrune = 0;
async function feed() {
  const now = Date.now();
  if (now - lastPrune > 10 * 60 * 1000) { lastPrune = now; db.prune('activity', new Date(now - KEEP_MS).toISOString()).catch(e => console.error('live prune:', e.message)); }
  const events = await db.recent('activity', new Date(now - 60 * 60 * 1000).toISOString(), 400); // last hour, newest first
  const visitors = new Map();
  for (const e of events) {
    let v = visitors.get(e.sid);
    if (!v) { v = { sid: e.sid.slice(0, 6), city: e.city, region: e.region, country: e.country, page: e.path, title: e.title || '', last: e.createdAt, first: e.createdAt, views: 0 }; visitors.set(e.sid, v); }
    if (e.type === 'view') { v.views++; if (!v.title && v.page === e.path) v.title = e.title || ''; }
    v.first = e.createdAt; // events are newest first, so the last one seen is the earliest
  }
  const active = [...visitors.values()].filter(v => now - Date.parse(v.last) < ACTIVE_MS);
  const lastHour = visitors.size;
  const strip = (e) => ({ t: e.createdAt, type: e.type, path: e.path, title: e.title, depth: e.depth, detail: e.detail, city: e.city, region: e.region, country: e.country, sid: e.sid.slice(0, 6) });
  return { now: new Date(now).toISOString(), activeCount: active.length, lastHour, active, events: events.slice(0, 80).map(strip) };
}

module.exports = { beacon, action, feed };
