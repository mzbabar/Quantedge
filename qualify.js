// "Find your plan" quiz: five quick questions, then a personalized GMAT Quant plan and a free-session invite.
const QUESTIONS = [
  { id: 'date', q: 'When is your GMAT test date?', options: [
    ['4w', 'Within 4 weeks'], ['8w', 'In 1–2 months'], ['16w', 'In 2–4 months'], ['none', "Not booked yet"] ] },
  { id: 'target', q: 'What total GMAT score are you aiming for?', options: [
    ['605', '605–645'], ['655', '655–695'], ['705', '705 or higher'], ['unsure', "I'm not sure yet"] ] },
  { id: 'level', q: 'Where is your Quant level today?', options: [
    ['new', "I haven't taken a practice test"], ['low', 'Below 75 in Quant'], ['mid', '75–80 in Quant'], ['high', 'Above 80 in Quant'] ] },
  { id: 'hours', q: 'How many hours a week can you study?', options: [
    ['lt5', 'Less than 5'], ['5to10', '5–10 hours'], ['gt10', 'More than 10'] ] },
  { id: 'struggle', q: "What's your biggest Quant challenge?", options: [
    ['timing', 'Running out of time'], ['topics', 'Specific topics I never learned well'], ['careless', 'Careless mistakes'],
    ['anxiety', 'Nerves on test day'], ['scratch', "Math feels rusty; I'm starting from scratch"] ] },
];
const label = (qid, v) => { const q = QUESTIONS.find(x => x.id === qid); const o = q && q.options.find(x => x[0] === v); return o ? o[1] : ''; };

function plan(a) {
  const urgent = a.date === '4w';
  const ambitious = a.target === '705' || a.level === 'high';
  const fromScratch = a.level === 'new' || a.struggle === 'scratch' || a.level === 'low';
  const steps = [];
  let headline, fit;
  if (urgent) {
    headline = 'Fast-track plan: your test is close, so every week counts.';
    fit = 'Start this week: free session, then a compressed bootcamp schedule.';
  } else if (a.date === 'none') {
    headline = 'Foundation plan: build Quant skills first, then book your test date.';
    fit = 'The 4-week bootcamp, then a test date about 2–4 weeks after it.';
  } else {
    headline = 'Bootcamp plan: four weeks of live classes, timed to finish before test day.';
    fit = 'The 4-week bootcamp, starting soon enough to leave time for full practice tests.';
  }
  steps.push(a.level === 'new'
    ? 'Take the free full-length practice test this week to get your starting score range and pacing.'
    : 'Retake a timed practice section to confirm your weakest topics before your free session.');
  if (fromScratch) steps.push('Week 1 of the bootcamp rebuilds number properties and mental math, so nothing later feels rushed.');
  if (a.struggle === 'timing') steps.push('We will set per-question time targets and practice the 2-minute "move on" rule in every class.');
  if (a.struggle === 'careless') steps.push('You will learn a quick error log and answer-check routine to cut careless mistakes.');
  if (a.struggle === 'anxiety') steps.push('Full timed sections under real test rules make test day feel familiar, not stressful.');
  if (a.struggle === 'topics') steps.push('Your free session pinpoints the exact topics to fix, and the bootcamp covers each one in order.');
  if (ambitious) steps.push('For a top score, we add harder question sets and pacing work in weeks 3 and 4.');
  if (a.hours === 'lt5') steps.push('With under 5 hours a week, plan for the bootcamp plus short daily practice sets (20–30 minutes).');
  if (a.hours === 'gt10') steps.push('With 10+ hours a week, you can add a full practice section every weekend.');
  steps.push('In your free 1-on-1 session you get the option to set up your bootcamp sessions at times that fit you.');
  return { headline, fit, steps: steps.slice(0, 6) };
}
module.exports = { QUESTIONS, label, plan };
