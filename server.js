require('./load-env');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieSession = require('cookie-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const db = require('./db');
// Styles are inlined into every page so school/corporate web filters that break separate CSS requests can't unstyle the site.
const INLINE_CSS = fs.readFileSync(path.join(__dirname, 'public', 'styles.css'), 'utf8');

const IS_PROD = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
const SITE = {
  name: process.env.SITE_NAME || 'QuantEdge GMAT',
  bootcampPrice: process.env.BOOTCAMP_PRICE || '$349',
  paymentLink: process.env.PAYMENT_LINK || '', // e.g. a Stripe Payment Link
  contactEmail: process.env.CONTACT_EMAIL || 'hello@example.com',
};
if (IS_PROD && !process.env.SESSION_SECRET) console.error('WARNING: SESSION_SECRET is not set. Set it in Vercel → Settings → Environment Variables.');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public'))); // local dev only; Vercel serves /public from its CDN
// Signed-cookie sessions: stateless, so they work across Vercel's serverless instances.
app.use(cookieSession({
  name: 'qe_session',
  keys: [process.env.SESSION_SECRET || 'dev-only-secret-change-me'],
  httpOnly: true, sameSite: 'lax', secure: IS_PROD, maxAge: 1000 * 60 * 60 * 24 * 7,
}));

// ---------- helpers ----------
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const clean = (s, max = 2000) => String(s || '').trim().slice(0, max);
const safeUrl = (s) => { const v = clean(s, 500); return /^https?:\/\//i.test(v) ? v : ''; };
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const flash = (req, type, msg) => { req.session.flash = { type, msg }; };
const login = (req, user) => { req.session = { uid: user.id, csrf: crypto.randomBytes(24).toString('hex') }; };

app.use(wrap(async (req, res, next) => {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  req.user = req.session.uid ? await db.get('users', req.session.uid) : null;
  res.locals.user = req.user;
  res.locals.site = SITE;
  res.locals.inlineCss = INLINE_CSS;
  res.locals.flash = req.session.flash || null;
  req.session.flash = null;
  res.locals.csrf = req.session.csrf;
  res.locals.path = req.path;
  next();
}));
app.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  const sent = String((req.body && req.body._csrf) || '');
  const ok = sent.length === req.session.csrf.length && crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(req.session.csrf));
  if (!ok) return res.status(403).render('error', { title: 'Session expired', message: 'Your form expired. Please go back, refresh, and try again.' });
  next();
});
const requireAuth = (req, res, next) => {
  if (!req.user) { flash(req, 'info', 'Please log in to continue.'); return res.redirect('/login'); }
  next();
};
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).render('error', { title: 'Not allowed', message: 'This page is for the tutor only.' });
  next();
};
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  handler: (req, res) => res.status(429).render('error', { title: 'Too many attempts', message: 'Please wait 15 minutes and try again.' }) });

// ---------- public ----------
app.get('/', (req, res) => res.render('home', { title: 'GMAT Quant Coaching' }));

app.get('/register', (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.render('register', { title: 'Create account', form: {}, error: null, next: req.query.next === 'free' ? 'free' : '' });
});
app.post('/register', authLimiter, wrap(async (req, res) => {
  const form = { name: clean(req.body.name, 100), email: clean(req.body.email, 200).toLowerCase(), phone: clean(req.body.phone, 40), testDate: clean(req.body.testDate, 20), targetScore: clean(req.body.targetScore, 10) };
  const next = req.body.next === 'free' ? 'free' : '';
  const password = String(req.body.password || '');
  let error = null;
  if (!form.name) error = 'Please enter your name.';
  else if (!isEmail(form.email)) error = 'Please enter a valid email.';
  else if (password.length < 8) error = 'Password must be at least 8 characters.';
  else if (password !== req.body.confirm) error = 'Passwords do not match.';
  else if ((await db.where('users', 'email', form.email)).length) error = 'An account with that email already exists. Try logging in.';
  if (error) return res.status(400).render('register', { title: 'Create account', form, error, next });

  const user = await db.insert('users', {
    id: db.id(), ...form,
    passwordHash: await bcrypt.hash(password, 12),
    role: ADMIN_EMAILS.includes(form.email) ? 'admin' : 'student',
    createdAt: db.now(),
  });
  login(req, user);
  flash(req, 'success', `Welcome, ${user.name.split(' ')[0]}! Your account is ready.`);
  res.redirect(next === 'free' ? '/dashboard#free-session' : '/dashboard');
}));

app.get('/login', (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.render('login', { title: 'Log in', email: '', error: null });
});
app.post('/login', authLimiter, wrap(async (req, res) => {
  const email = clean(req.body.email, 200).toLowerCase();
  const [user] = await db.where('users', 'email', email);
  const ok = user && await bcrypt.compare(String(req.body.password || ''), user.passwordHash);
  if (!ok) return res.status(401).render('login', { title: 'Log in', email, error: 'Email or password is incorrect.' });
  const isAdmin = ADMIN_EMAILS.includes(user.email) || user.role === 'admin';
  if (isAdmin && user.role !== 'admin') await db.update('users', user.id, { role: 'admin' });
  login(req, user);
  res.redirect(isAdmin ? '/admin' : '/dashboard');
}));
app.post('/logout', (req, res) => { req.session = null; res.redirect('/'); });

// ---------- student area ----------
app.get('/dashboard', requireAuth, wrap(async (req, res) => {
  const [enrollment] = await db.where('enrollments', 'userId', req.user.id);
  const [freeSession] = await db.where('bookings', 'userId', req.user.id);
  const active = (enrollment && enrollment.status === 'active') || req.user.role === 'admin';
  const posts = (await db.all('posts')).filter(p => p.audience === 'all' || (p.audience === 'bootcamp' && active));
  const questions = await db.where('questions', 'userId', req.user.id);
  res.render('dashboard', { title: 'My dashboard', enrollment, freeSession, posts, questions });
}));

app.post('/free-session', requireAuth, wrap(async (req, res) => {
  const [existing] = await db.where('bookings', 'userId', req.user.id);
  if (existing && existing.status !== 'cancelled') { flash(req, 'info', 'You already have a free session request.'); return res.redirect('/dashboard#free-session'); }
  await db.insert('bookings', {
    id: db.id(), userId: req.user.id, status: 'requested',
    preferred1: clean(req.body.preferred1, 40), preferred2: clean(req.body.preferred2, 40),
    timezone: clean(req.body.timezone, 60), notes: clean(req.body.notes, 1000),
    zoomLink: '', scheduledFor: '', createdAt: db.now(),
  });
  flash(req, 'success', 'Request received! You\'ll see your Zoom link here once your session is confirmed.');
  res.redirect('/dashboard#free-session');
}));

app.post('/enroll', requireAuth, wrap(async (req, res) => {
  let [e] = await db.where('enrollments', 'userId', req.user.id);
  if (!e) e = await db.insert('enrollments', { id: db.id(), userId: req.user.id, cohort: clean(req.body.cohort, 60), status: 'pending_payment', createdAt: db.now() });
  else if (e.status === 'cancelled') e = await db.update('enrollments', e.id, { status: 'pending_payment', cohort: clean(req.body.cohort, 60) || e.cohort });
  if (SITE.paymentLink && e.status === 'pending_payment') {
    const url = new URL(SITE.paymentLink);
    url.searchParams.set('prefilled_email', req.user.email);
    url.searchParams.set('client_reference_id', e.id);
    return res.redirect(url.toString());
  }
  flash(req, 'success', 'You\'re registered for the bootcamp! We\'ll email payment instructions and confirm your seat.');
  res.redirect('/dashboard#bootcamp');
}));

app.post('/questions', requireAuth, wrap(async (req, res) => {
  const body = clean(req.body.body, 3000);
  if (body) {
    await db.insert('questions', { id: db.id(), userId: req.user.id, topic: clean(req.body.topic, 60), body, reply: '', createdAt: db.now() });
    flash(req, 'success', 'Question sent to your tutor.');
  }
  res.redirect('/dashboard#ask');
}));

// ---------- tutor/admin ----------
app.get('/admin', requireAuth, requireAdmin, wrap(async (req, res) => {
  const users = await db.all('users');
  const byId = Object.fromEntries(users.map(u => [u.id, u]));
  const withStudent = (x) => ({ ...x, student: byId[x.userId] || { name: '(deleted)', email: '' } });
  res.render('admin', {
    title: 'Tutor admin',
    students: users.filter(x => x.role !== 'admin'),
    sessions: (await db.all('bookings')).map(withStudent),
    enrollments: (await db.all('enrollments')).map(withStudent),
    posts: await db.all('posts'),
    questions: (await db.all('questions')).map(withStudent),
  });
}));
app.post('/admin/session/:id', requireAuth, requireAdmin, wrap(async (req, res) => {
  const patch = { scheduledFor: clean(req.body.scheduledFor, 60), zoomLink: safeUrl(req.body.zoomLink) };
  if (['requested', 'scheduled', 'completed', 'cancelled'].includes(req.body.status)) patch.status = req.body.status;
  await db.update('bookings', req.params.id, patch);
  flash(req, 'success', 'Free session updated.');
  res.redirect('/admin#sessions');
}));
app.post('/admin/enrollment/:id', requireAuth, requireAdmin, wrap(async (req, res) => {
  if (['pending_payment', 'active', 'cancelled'].includes(req.body.status)) await db.update('enrollments', req.params.id, { status: req.body.status });
  flash(req, 'success', 'Enrollment updated.');
  res.redirect('/admin#enrollments');
}));
app.post('/admin/post', requireAuth, requireAdmin, wrap(async (req, res) => {
  const title = clean(req.body.title, 150);
  if (title) {
    await db.insert('posts', {
      id: db.id(), title, body: clean(req.body.body, 5000), link: safeUrl(req.body.link),
      kind: ['announcement', 'resource', 'class'].includes(req.body.kind) ? req.body.kind : 'announcement',
      audience: req.body.audience === 'bootcamp' ? 'bootcamp' : 'all', createdAt: db.now(),
    });
    flash(req, 'success', 'Posted to student dashboards.');
  }
  res.redirect('/admin#posts');
}));
app.post('/admin/post/:id/delete', requireAuth, requireAdmin, wrap(async (req, res) => {
  await db.remove('posts', req.params.id);
  res.redirect('/admin#posts');
}));
app.post('/admin/question/:id/reply', requireAuth, requireAdmin, wrap(async (req, res) => {
  await db.update('questions', req.params.id, { reply: clean(req.body.reply, 5000), repliedAt: db.now() });
  flash(req, 'success', 'Reply saved.');
  res.redirect('/admin#questions');
}));

app.use((req, res) => res.status(404).render('error', { title: 'Not found', message: 'That page doesn\'t exist.' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).render('error', { title: 'Error', message: 'Something went wrong. Please try again.' }); });

// Vercel imports the app; locally we start a server.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`${SITE.name} running at http://localhost:${PORT}`));
}
module.exports = app;
