// Data store with two interchangeable backends:
//  - Postgres (used when DATABASE_URL is set — e.g. Neon from the Vercel Marketplace). Required on Vercel.
//  - Local JSON file (used for local development when DATABASE_URL is not set).
// Every record is a JSON document in a named collection: users, bookings, enrollments, posts, questions.
const crypto = require('crypto');

const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

let backend;

if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  // Use full certificate verification for hosted databases (Neon etc.) and say so explicitly,
  // which also silences pg's "sslmode=require is treated as verify-full" warning.
  const dbUrl = new URL(process.env.DATABASE_URL);
  const isLocal = /^(localhost|127\.0\.0\.1|::1)$/.test(dbUrl.hostname);
  if (isLocal) dbUrl.searchParams.delete('sslmode');
  else dbUrl.searchParams.set('sslmode', 'verify-full');
  const pool = new Pool({ connectionString: dbUrl.toString(), max: 3 });
  let ready;
  const init = () => ready || (ready = pool.query(`
    CREATE TABLE IF NOT EXISTS docs (
      collection TEXT NOT NULL,
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS docs_collection_idx ON docs (collection);
    CREATE UNIQUE INDEX IF NOT EXISTS docs_user_email_idx ON docs ((data->>'email')) WHERE collection = 'users';
  `).catch(e => { ready = null; throw e; }));
  const q = async (sql, params) => { await init(); return pool.query(sql, params); };

  backend = {
    all: async (c) => (await q('SELECT data FROM docs WHERE collection=$1 ORDER BY created_at DESC', [c])).rows.map(r => r.data),
    get: async (c, docId) => (await q('SELECT data FROM docs WHERE collection=$1 AND id=$2', [c, docId])).rows[0]?.data || null,
    where: async (c, field, value) => (await q(`SELECT data FROM docs WHERE collection=$1 AND data->>$2 = $3 ORDER BY created_at DESC`, [c, field, value])).rows.map(r => r.data),
    insert: async (c, doc) => { await q('INSERT INTO docs (collection, id, data, created_at) VALUES ($1,$2,$3,$4)', [c, doc.id, doc, doc.createdAt]); return doc; },
    update: async (c, docId, patch) => (await q('UPDATE docs SET data = data || $3::jsonb WHERE collection=$1 AND id=$2 RETURNING data', [c, docId, JSON.stringify(patch)])).rows[0]?.data || null,
    remove: async (c, docId) => { await q('DELETE FROM docs WHERE collection=$1 AND id=$2', [c, docId]); },
  };
} else {
  if (process.env.VERCEL) {
    console.error('DATABASE_URL is not set. On Vercel you must connect a Postgres database (Storage → Neon).');
  }
  const fs = require('fs');
  const path = require('path');
  const DIR = path.join(__dirname, 'data');
  const FILE = path.join(DIR, 'db.json');
  let data = {};
  if (fs.existsSync(FILE)) data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const save = () => { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(FILE + '.tmp', JSON.stringify(data, null, 2)); fs.renameSync(FILE + '.tmp', FILE); };
  const col = (c) => (data[c] = data[c] || []);
  const byNew = (a, b) => b.createdAt.localeCompare(a.createdAt);

  backend = {
    all: async (c) => [...col(c)].sort(byNew),
    get: async (c, docId) => col(c).find(d => d.id === docId) || null,
    where: async (c, field, value) => col(c).filter(d => String(d[field]) === String(value)).sort(byNew),
    insert: async (c, doc) => { col(c).push(doc); save(); return doc; },
    update: async (c, docId, patch) => { const d = col(c).find(x => x.id === docId); if (!d) return null; Object.assign(d, patch); save(); return d; },
    remove: async (c, docId) => { data[c] = col(c).filter(d => d.id !== docId); save(); },
  };
}

module.exports = { ...backend, id, now };
