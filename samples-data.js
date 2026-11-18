// The two free sample questions shown on the home page (from MZB Academy Practice Set 1).
module.exports = [
    { n: 1, topic: 'Word problems · rates', time: '2:00',
      q: 'Towns A and B are 270 miles apart. Priya leaves A at 9:00 a.m., driving toward B at 50 mph. At 10:00 a.m., Omar leaves B, driving toward A at 60 mph. How far from Town A are they when they meet?',
      choices: ['120 miles', '135 miles', '150 miles', '160 miles', '170 miles'], ans: 2,
      concept: 'Relative speed (closing speed)',
      idea: 'Two objects moving toward each other close the gap at the sum of their speeds: time to meet = gap ÷ (speed₁ + speed₂).',
      steps: ['Head start first: by 10:00 Priya has driven 50 × 1 = 50 miles.', 'Gap left when both are moving: 270 − 50 = 220 miles.', 'They close the gap at 50 + 60 = 110 mph, so they meet 220 ÷ 110 = 2 hours later.', 'Priya\'s distance from A: 50 + (50 × 2) = 150 miles.'],
      tipLabel: 'Quick check', tip: 'Omar drives 60 × 2 = 120 miles, and 150 + 120 = 270 ✓. Forgetting the head start gives messy numbers, which is a sign the setup is wrong.' },
    { n: 2, topic: 'Arithmetic · percents', time: '1:30',
      q: 'The price of a jacket is increased by 20%, then decreased by 25%, and then increased by 10%. What is the overall change from the original price?',
      choices: ['5% increase', '1% increase', 'No change', '1% decrease', '5% decrease'], ans: 3,
      concept: 'Successive percent changes',
      idea: 'Percent changes multiply; they don\'t add. Turn each change into a multiplier: +20% → ×1.20, −25% → ×0.75, +10% → ×1.10.',
      steps: ['Pick a smart number: let the original price be $100.', 'After +20%: 100 × 1.2 = 120.', 'After −25%: 120 × 0.75 = 90.', 'After +10%: 90 × 1.1 = 99, so the price is 1% lower than at the start.'],
      tipLabel: 'Trap to avoid', tip: 'Adding 20 − 25 + 10 = +5% is the classic trap answer. Multipliers, always.' },
  ];
