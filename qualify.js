// GMAT score-plan quiz: a few questions -> the Quant score the student should aim for, the gap,
// the time they have, and the recommended next step (free guide -> free account + call -> cohort).
//
// Target Quant ranges are a rough guide, not an official conversion: GMAC doesn't publish one.
// They're anchored on published GMAT Focus examples (sections averaging ~80 -> 645, ~81 -> 655),
// Quant percentiles (80 ≈ 66th, 82 ≈ 76th, 85 ≈ 89th, 88 ≈ 95th) and estimated top-MBA averages
// of roughly 675–715. Sources: stacyblackman.com score chart, menlocoaching.com score table (2026).
const QUESTIONS = [
  { id: 'target', q: 'What total GMAT score are you aiming for?', options: [
    ['605', '605–645'], ['655', '655–695'], ['705', '705–745'], ['755', '755 or higher'], ['unsure', "Not sure yet"] ] },
  { id: 'programs', q: 'Which programs are you applying to?', options: [
    ['top15', 'Top-15 MBA programs (e.g. M7, INSEAD, LBS)'], ['top50', 'MBA programs ranked about 16–50'], ['other', 'Other MBA, specialized master’s or other programs'], ['unsure', 'Still deciding'] ] },
  { id: 'level', q: 'What was your latest Quant section score?', options: [
    ['none', "I haven't taken a practice test yet"], ['lt70', 'Below 70'], ['70', '70–75'], ['76', '76–80'], ['81', '81–85'], ['86', '86 or higher'] ] },
  { id: 'date', q: 'When are you taking the GMAT?', options: [
    ['4w', 'Within 4 weeks'], ['8w', 'In 1–2 months'], ['12w', 'In 2–3 months'], ['16w', 'More than 3 months away'], ['none', 'Not booked yet'] ] },
  { id: 'hours', q: 'How many hours a week can you study?', options: [
    ['lt5', 'Less than 5'], ['5to10', '5–10 hours'], ['gt10', 'More than 10'] ] },
  { id: 'struggle', q: "What's your biggest Quant challenge?", options: [
    ['timing', 'Running out of time'], ['topics', 'Topics I never learned well'], ['careless', 'Careless mistakes'],
    ['rusty', "Math feels rusty; I'm starting over"], ['plateau', "My score won't move"] ] },
];
const label = (qid, v) => { const q = QUESTIONS.find(x => x.id === qid); const o = q && q.options.find(x => x[0] === v); return o ? o[1] : ''; };

// Target Quant range for each total-score goal.
const TARGET = { '605': [79, 81], '655': [81, 84], '705': [84, 87], '755': [87, 90] };
const FROM_PROGRAMS = { top15: '705', top50: '655', other: '605', unsure: '655' };
const LEVEL_MID = { lt70: 67, '70': 73, '76': 78, '81': 83, '86': 87 };
const WEEKS = { '4w': 4, '8w': 8, '12w': 12, '16w': 16, none: null };
const PCTL = [[70, 14], [75, 35], [78, 52], [80, 66], [82, 76], [84, 85], [85, 89], [86, 92], [88, 95], [90, 100]];
const percentile = (q) => { let p = PCTL[0][1]; for (const [s, v] of PCTL) if (q >= s) p = v; return p; };

function plan(a, cohort) {
  const goal = a.target !== 'unsure' ? a.target : (FROM_PROGRAMS[a.programs] || '655');
  const [lo, hi] = TARGET[goal];
  const current = LEVEL_MID[a.level] || null;
  const gap = current ? Math.max(0, lo - current) : null;
  const weeks = WEEKS[a.date];

  let gapText, gapLevel;
  if (current === null) { gapText = "Take the free practice test to measure your starting point. Then we'll know exactly how far you are from your target."; gapLevel = 'unknown'; }
  else if (gap === 0) { gapText = "You're already in your target range. The work now is consistency and pacing, so it holds on test day."; gapLevel = 'there'; }
  else if (gap <= 3) { gapText = `About ${gap} point${gap > 1 ? 's' : ''} to go. That's very reachable with focused practice on your weakest topics and better pacing.`; gapLevel = 'close'; }
  else if (gap <= 7) { gapText = `About ${gap} points to go. That's a real climb, and exactly what a structured 4-week bootcamp is built for.`; gapLevel = 'mid'; }
  else { gapText = `About ${gap} points to go. That's a big climb, so start now: rebuild the fundamentals first, then add speed.`; gapLevel = 'far'; }

  const steps = [];
  steps.push({ t: 'Read the free GMAT Quant Playbook', d: 'A 20-minute read: how the Quant section works, the pacing plan, and the 8 concepts that show up most. Start here before your call.' });
  if (current === null) steps.push({ t: 'Take the free full-length practice test', d: '21 questions, 45 minutes, real test rules. You get a score range, topic breakdown and pacing chart.' });
  steps.push({ t: 'Create your free account and book your 1-on-1 call', d: '30 minutes with your tutor to review this plan and work a few timed questions together. You also get the option to set up your bootcamp sessions.' });
  steps.push({ t: cohort ? `Join the next cohort (${cohort.date})` : 'Join the 4-week bootcamp',
    d: 'Eight live classes in a small group, weekly timed practice sets, and a full Quant review before test day.' });

  let timing;
  if (weeks === null) timing = 'Book your test for about 6–8 weeks out. That leaves time for the bootcamp plus two full practice tests.';
  else if (weeks <= 4) timing = 'Your test is close. Book your free call this week so we can prioritize the topics worth the most points.';
  else if (cohort && cohort.days / 7 + 4 > weeks) timing = 'The next cohort may finish after your test date. Mention it on your call and we will plan a faster route.';
  else timing = `You have about ${weeks} weeks. That fits the 4-week bootcamp with time left for full practice tests.`;

  const hours = a.hours === 'lt5' ? 'Under 5 hours a week is tight. Plan for the live classes plus 20–30 minutes of practice on most days.'
    : a.hours === 'gt10' ? 'With 10+ hours a week, add a full timed Quant section every weekend.'
    : '5–10 hours a week is a good fit: two live classes plus two or three short practice sessions.';

  const focus = { timing: 'Pacing: per-question time targets and the 2-minute "move on" rule.',
    topics: 'Topic gaps: a diagnostic first, then the bootcamp covers each topic in order.',
    careless: 'Accuracy: an error log and a quick answer-check routine.',
    rusty: 'Fundamentals: week 1 rebuilds number properties and mental math from the ground up.',
    plateau: 'Breaking the plateau: harder question sets and a review of the traps you keep falling into.' }[a.struggle];

  return { goal, goalLabel: label('target', goal), lo, hi, pLo: percentile(lo), pHi: percentile(hi), current, gap, gapText, gapLevel,
    weeks, timing, hours, focus, steps };
}
module.exports = { QUESTIONS, label, plan, percentile };
