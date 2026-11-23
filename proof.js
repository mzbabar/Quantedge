// Social proof (testimonials, rating, results stats, student video, schools) edited from /admin.
// Every section on the site stays hidden until real data is added here — nothing is ever made up.
const db = require('./db');
const ID = 'settings:proof';
const EMPTY = { rating: '', ratingCount: '', statStudents: '', statYears: '', statGain: '', statGainLabel: '', videoUrl: '', videoTitle: '', schools: '', testimonials: [],
  // Tutor profile (front and center on the home page once a name is set)
  tutorName: '', tutorTitle: '', tutorPhoto: '', tutorScore: '', tutorBio: '', tutorStory: '', tutorCreds: '', tutorVideoUrl: '',
  // Next bootcamp cohort (drives the countdown and "seats left"; hidden when no future date is set)
  cohortStart: '', cohortSeats: '', cohortTaken: '', cohortSchedule: '' };

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
    tutor: tutorView(p), cohort: cohortView(p),
  };
}
function tutorView(p) {
  if (!p.tutorName) return null;
  return { name: p.tutorName, first: p.tutorName.split(' ')[0], title: p.tutorTitle || 'Your GMAT Quant tutor', photo: p.tutorPhoto,
    score: p.tutorScore, bio: p.tutorBio, story: String(p.tutorStory || '').split(/\r?\n\s*\r?\n/).map(x => x.trim()).filter(Boolean),
    creds: String(p.tutorCreds || '').split(/\n/).map(x => x.trim()).filter(Boolean).slice(0, 6), video: youtubeId(p.tutorVideoUrl) };
}
// Cohort: only shown when the start date is in the future. Seats left = seats - taken (never below 0).
function cohortView(p) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.cohortStart || '')) return null;
  const start = new Date(p.cohortStart + 'T09:00:00-05:00');
  if (isNaN(start) || start.getTime() < Date.now()) return null;
  const seats = parseInt(p.cohortSeats, 10), taken = parseInt(p.cohortTaken, 10) || 0;
  const left = Number.isInteger(seats) && seats > 0 ? Math.max(0, seats - taken) : null;
  return { iso: start.toISOString(), date: start.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', timeZone: 'America/New_York' }),
    days: Math.ceil((start.getTime() - Date.now()) / 864e5), seats: Number.isInteger(seats) ? seats : null, left, full: left === 0, schedule: p.cohortSchedule };
}
module.exports = { getProof, saveProof, youtubeId, view };
