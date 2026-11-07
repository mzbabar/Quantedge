// SEO + AI-crawler support: per-page titles/descriptions, canonical URLs, index rules,
// Open Graph / Twitter cards, JSON-LD structured data, robots.txt, sitemap.xml and llms.txt.
const QUIZ = require('./quiz-data');
const TEST = require('./test-data');

// Set SITE_URL in Vercel to your live address (e.g. https://mzbacademy.com) so canonical links,
// the sitemap and share previews always point to one domain. Falls back to the request's host.
const IS_PREVIEW = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const FAQ = [
  ['How many math questions are on the GMAT?', 'The Quantitative Reasoning section has 21 Problem Solving questions in 45 minutes. Data Insights (20 questions) also uses math skills, especially Data Sufficiency and table and graph questions.'],
  ['Can I use a calculator on GMAT Quant?', 'No. A calculator is not allowed on the Quantitative Reasoning section. An on-screen calculator is available only in Data Insights, so we train fast mental math and estimation.'],
  ['What topics does GMAT Quant cover?', 'Arithmetic and number properties, algebra (including coordinate geometry), word problems such as rates, work, mixtures, percents and interest, and statistics, counting and probability. Plane geometry is no longer tested.'],
  ['How is the GMAT Quant section scored?', 'The Quant section is scored from 60 to 90, and the total GMAT score ranges from 205 to 805. All three sections count equally toward the total.'],
  ['Is the free session really free?', "Yes. It's a 30-minute 1-on-1 Zoom call with no payment details and no obligation to join the bootcamp."],
  ['What if I miss a live class?', 'Recordings and practice sets are posted to your secure student dashboard.'],
  ['When should I start preparing?', 'Ideally 6 to 10 weeks before your test date, so you finish the bootcamp with time left for full-length practice tests.'],
];

// Public pages that should be indexed, with their search titles and descriptions.
const PAGES = {
  '/': {
    title: 'GMAT Quant Tutoring & 4-Week Bootcamp on Zoom | MZB Academy',
    description: 'Live GMAT Quant coaching on Zoom. Free 1-on-1 session, free Quant score check, a full-length timed practice test, and a 4-week GMAT Focus bootcamp.',
    priority: '1.0', changefreq: 'weekly',
  },
  '/practice-test': {
    title: 'Free Full-Length GMAT Quant Practice Test (21 Questions, 45 Min) | MZB Academy',
    description: 'Take a free, timed GMAT Focus Quant practice test: 21 questions in 45 minutes with real test rules, a score estimate, topic breakdown, pacing chart and solutions.',
    priority: '0.9', changefreq: 'monthly',
  },
  '/quiz': {
    title: 'Free GMAT Quant Score Check: 12 Practice Questions | MZB Academy',
    description: 'Check your GMAT Quant level in about 25 minutes. 12 GMAT-style questions with a practice score range, your weak topics and step-by-step solutions. No sign-up.',
    priority: '0.8', changefreq: 'monthly',
  },
};
// Anything under these paths is private or thin, so it's kept out of search and AI indexes.
const PRIVATE = ['/admin', '/dashboard', '/login', '/register', '/free', '/practice-test/', '/quiz/', '/enroll', '/questions', '/free-session', '/logout'];
const isPrivate = (p) => PRIVATE.some(x => (x.endsWith('/') ? p.startsWith(x) : p === x || p.startsWith(x + '/')));

function baseUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0];
  return `${proto}://${req.get('x-forwarded-host') || req.get('host')}`;
}

function orgLd(base, site) {
  return {
    '@type': 'EducationalOrganization', '@id': `${base}/#org`, name: site.name, url: `${base}/`,
    logo: { '@type': 'ImageObject', url: `${base}/brand/mzb-academy-logo.png`, width: 800, height: 634 },
    image: `${base}/brand/og-image.png`, slogan: 'Math Mastery · Test Prep',
    description: 'Live online GMAT Quantitative Reasoning coaching on Zoom: free intro sessions, practice tests and a 4-week bootcamp.',
    email: site.contactEmail, knowsAbout: ['GMAT', 'GMAT Focus Edition', 'GMAT Quantitative Reasoning', 'Test preparation', 'Mathematics'],
  };
}

function pageLd(path, base, site) {
  const org = { '@id': `${base}/#org` };
  const graph = [orgLd(base, site), { '@type': 'WebSite', '@id': `${base}/#website`, url: `${base}/`, name: site.name, publisher: org, inLanguage: 'en' }];
  const price = String(site.bootcampPrice || '').replace(/[^0-9.]/g, '');
  if (path === '/') {
    graph.push({
      '@type': 'Course', '@id': `${base}/#bootcamp`, name: 'GMAT Quant Bootcamp (4 weeks, live on Zoom)',
      description: 'A 4-week live online course covering every GMAT Focus Quantitative Reasoning topic: arithmetic and number properties, algebra, word problems, and statistics, counting and probability, with timed practice and no-calculator strategies.',
      provider: org, educationalLevel: 'Graduate admissions test preparation', inLanguage: 'en',
      teaches: ['GMAT Quantitative Reasoning', 'Number properties', 'Algebra', 'Word problems', 'Statistics and probability', 'Test pacing'],
      offers: price ? { '@type': 'Offer', price, priceCurrency: 'USD', category: 'Paid', availability: 'https://schema.org/InStock', url: `${base}/#bootcamp` } : undefined,
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', location: { '@type': 'VirtualLocation', url: `${base}/` }, courseSchedule: { '@type': 'Schedule', duration: 'PT1H', repeatFrequency: 'P1W', repeatCount: 8 }, courseWorkload: 'P4W' },
    });
    graph.push({ '@type': 'FAQPage', '@id': `${base}/#faq`, mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  }
  if (path === '/quiz' || path === '/practice-test') {
    const isTest = path === '/practice-test';
    graph.push({
      '@type': 'Quiz', '@id': `${base}${path}#quiz`, name: isTest ? 'Full-length GMAT Quant practice test' : 'GMAT Quant score check',
      description: PAGES[path].description, url: `${base}${path}`, provider: org, isAccessibleForFree: true, inLanguage: 'en',
      educationalLevel: 'Graduate admissions test preparation', timeRequired: isTest ? 'PT45M' : 'PT25M',
      about: { '@type': 'Thing', name: 'GMAT Quantitative Reasoning' },
      educationalAlignment: { '@type': 'AlignmentObject', alignmentType: 'educationalSubject', targetName: 'GMAT Focus Edition: Quantitative Reasoning' },
      numberOfQuestions: isTest ? TEST.length : QUIZ.length,
    });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: isTest ? 'Practice test' : 'Quant score check', item: `${base}${path}` },
    ] });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

// Middleware: puts everything the <head> needs into res.locals, and sends X-Robots-Tag for private pages.
function seoLocals(site) {
  return (req, res, next) => {
    const base = baseUrl(req);
    const page = PAGES[req.path];
    const noindex = IS_PREVIEW || !page || isPrivate(req.path);
    res.locals.seo = {
      base, canonical: `${base}${req.path === '/' ? '/' : req.path}`,
      title: page ? page.title : null, description: page ? page.description : 'Live GMAT Quant coaching on Zoom from MZB Academy.',
      robots: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1',
      indexable: !noindex, jsonld: page ? pageLd(req.path, base, site) : null,
    };
    if (noindex) res.set('X-Robots-Tag', 'noindex, nofollow');
    next();
  };
}

// AI and search crawlers we explicitly welcome on public pages. Private paths are closed to everyone.
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', // OpenAI: training, ChatGPT search, user-requested fetches
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', // Anthropic
  'PerplexityBot', 'Perplexity-User', // Perplexity
  'Google-Extended', 'Applebot', 'Applebot-Extended', // Gemini / Apple Intelligence usage tokens
  'meta-externalagent', 'meta-externalfetcher', 'Amazonbot', 'DuckAssistBot', 'MistralAI-User', 'CCBot',
];

function routes(app, site) {
  app.get('/robots.txt', (req, res) => {
    const base = baseUrl(req);
    res.type('text/plain').set('Cache-Control', 'public, max-age=3600');
    if (IS_PREVIEW) return res.send('User-agent: *\nDisallow: /\n');
    const disallow = ['/admin', '/dashboard', '/login', '/register', '/free', '/practice-test/', '/quiz/result/'].map(p => `Disallow: ${p}`).join('\n');
    res.send([
      '# MZB Academy: search engines and AI assistants are welcome on public pages.',
      'User-agent: *', 'Allow: /', disallow, '',
      '# AI crawlers (named explicitly so the policy is unambiguous)',
      ...AI_BOTS.map(b => `User-agent: ${b}`), 'Allow: /', disallow, '',
      `Sitemap: ${base}/sitemap.xml`, '',
    ].join('\n'));
  });

  app.get('/sitemap.xml', (req, res) => {
    const base = baseUrl(req);
    const urls = Object.entries(PAGES).map(([p, m]) =>
      `  <url><loc>${base}${p}</loc><lastmod>${BUILD_DATE}</lastmod><changefreq>${m.changefreq}</changefreq><priority>${m.priority}</priority></url>`).join('\n');
    res.type('application/xml').set('Cache-Control', 'public, max-age=3600')
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  });

  // llms.txt: a plain-language summary for AI assistants and agents (llmstxt.org format).
  app.get('/llms.txt', (req, res) => {
    const base = baseUrl(req);
    res.type('text/plain; charset=utf-8').set('Cache-Control', 'public, max-age=3600').send(`# ${site.name}

> ${site.name} ("Math Mastery · Test Prep") offers live, online GMAT Quantitative Reasoning coaching on Zoom: a free 30-minute 1-on-1 intro session, a free 12-question Quant score check, a free full-length timed Quant practice test, and a 4-week live bootcamp (${site.bootcampPrice}).

## Key pages
- [Home: GMAT Quant coaching and bootcamp](${base}/): what the GMAT Quant section tests, how coaching works, the 4-week bootcamp curriculum and price, FAQ.
- [Free full-length GMAT Quant practice test](${base}/practice-test): 21 questions, 45 minutes, real test rules (one question at a time, bookmarks, review and edit up to 3 answers). Free account required.
- [Free GMAT Quant score check](${base}/quiz): 12 timed questions with a practice score range, weak topics and step-by-step solutions. No sign-up.
- [Book a free 1-on-1 Zoom session](${base}/free)

## GMAT Quant facts (GMAT Focus Edition)
- 21 Problem Solving questions in 45 minutes (about 2 minutes 8 seconds each); no calculator.
- Topics: arithmetic and number properties, algebra, word problems, statistics, counting and probability. Plane geometry was removed; Data Sufficiency moved to Data Insights.
- Quant section score 60 to 90; total GMAT score 205 to 805.

## 4-week GMAT Quant bootcamp (${site.bootcampPrice})
- Week 1: number properties, arithmetic, mental math shortcuts
- Week 2: algebra, inequalities, functions, exponents and roots
- Week 3: word problems (rates, work, mixtures, percents, ratios)
- Week 4: statistics, counting and probability, full timed sections, pacing plan
- 8 live Zoom classes, weekly timed practice sets with solutions, class recordings, ask-the-tutor support.

## FAQ
${FAQ.map(([q, a]) => `- **${q}** ${a}`).join('\n')}

## Contact
- Email: ${site.contactEmail}

GMAT is a trademark of GMAC. ${site.name} is not affiliated with or endorsed by GMAC.
`);
  });
}

module.exports = { seoLocals, routes, FAQ, PAGES, BUILD_DATE };
