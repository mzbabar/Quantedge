// Social proof (testimonials, rating, results stats, student video, schools) edited from /admin.
// Every section on the site stays hidden until real data is added here — nothing is ever made up.
const db = require('./db');
const ID = 'settings:proof';
const EMPTY = { rating: '', ratingCount: '', statStudents: '', statYears: '', statGain: '', statGainLabel: '', videoUrl: '', videoTitle: '', schools: '', testimonials: [] };

async function getProof() {
  const doc = await db.get('settings', ID);
  return { ...EMPTY, ...(doc || {}), testimonials: (doc && doc.testimonials) || [] };
}
async function saveProof(patch) {
  const cur = await db.get('settings', ID);
  if (cur) return db.update('settings', ID, patch);
  return db.insert('settings', { id: ID, createdAt: new Date().toISOString(), ...EMPTY, ...patch });
}
// Accepts any common YouTube link and returns just the video id (or '').
function youtubeId(url) {
  const m = String(url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}
// What the home page shows, computed once per request.
function view(p) {
  const schools = String(p.schools || '').split(/\n|,/).map(s => s.trim()).filter(Boolean).slice(0, 16);
  const stats = [
    p.statStudents && { value: p.statStudents, label: 'students coached' },
    p.statYears && { value: p.statYears, label: 'years teaching GMAT math' },
    p.statGain && { value: p.statGain, label: p.statGainLabel || 'average Quant improvement' },
    p.rating && { value: `${p.rating}/5`, label: p.ratingCount ? `rating from ${p.ratingCount} students` : 'student rating' },
  ].filter(Boolean);
  return {
    hasAny: !!(p.testimonials.length || stats.length || youtubeId(p.videoUrl) || schools.length),
    rating: p.rating, ratingCount: p.ratingCount, stats, schools,
    video: youtubeId(p.videoUrl), videoTitle: p.videoTitle || 'Hear from a student',
    testimonials: p.testimonials, faces: p.testimonials.filter(t => t.photo).slice(0, 5),
  };
}
module.exports = { getProof, saveProof, youtubeId, view };
