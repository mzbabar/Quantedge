// Free Quant score check: 12 original GMAT-style questions (QuantEdge Practice Set 2). Answers verified.
module.exports = [
  {
    "id": "q1",
    "topic": "Algebra · factoring",
    "concept": "Difference of squares",
    "idea": "Big squares minus big squares: factor instead of multiplying.",
    "formula": "a² − b² = (a + b)(a − b)",
    "q": "What is the value of 1001² − 999²?",
    "choices": [
      "2,000",
      "4,000",
      "20,000",
      "40,000",
      "400,000"
    ],
    "answer": 1,
    "steps": [
      "Spot the pattern a² − b² with a = 1001 and b = 999.",
      "Factor: (1001 + 999)(1001 − 999).",
      "That is 2000 × 2.",
      "= 4,000. No squaring of four-digit numbers needed."
    ],
    "tipLabel": "Pattern to spot",
    "tip": "Any 'huge number squared minus huge number squared' is a factoring question in disguise.",
    "time": "0:45"
  },
  {
    "id": "q2",
    "topic": "Number properties",
    "concept": "Units-digit cycles",
    "idea": "Units digits of powers repeat in short cycles. Find the cycle, then use the remainder.",
    "formula": "7 → 7, 9, 3, 1, 7, 9, 3, 1 … (cycle of 4)",
    "q": "What is the units digit of 7⁸³?",
    "choices": [
      "1",
      "3",
      "5",
      "7",
      "9"
    ],
    "answer": 1,
    "steps": [
      "List units digits: 7¹→7, 7²→9, 7³→3, 7⁴→1, then it repeats.",
      "The cycle length is 4.",
      "83 ÷ 4 = 20 remainder 3, so 7⁸³ is in position 3 of the cycle.",
      "Position 3 is 3, so the units digit is 3."
    ],
    "tipLabel": "Trap to avoid",
    "tip": "Remainder 0 means the LAST item in the cycle (here 1), not the first.",
    "time": "1:00"
  },
  {
    "id": "q3",
    "topic": "Word problems · ages",
    "concept": "Age equations",
    "idea": "Everyone ages the same number of years. Write 'now' and 'later' equations with one variable.",
    "formula": "Later age = current age + years passed (for every person)",
    "q": "Maya is 3 times as old as her son. In 12 years, she will be twice as old as her son. How old is Maya now?",
    "choices": [
      "24",
      "30",
      "36",
      "42",
      "48"
    ],
    "answer": 2,
    "steps": [
      "Let the son's age now be s, so Maya is 3s.",
      "In 12 years: Maya 3s + 12, son s + 12.",
      "Set up: 3s + 12 = 2(s + 12), so 3s + 12 = 2s + 24.",
      "s = 12, so Maya is 3 × 12 = 36."
    ],
    "tipLabel": "Back-solve check",
    "tip": "Back-solve: try (C) 36. Son 12. In 12 years 48 and 24. Twice ✓",
    "time": "1:15"
  },
  {
    "id": "q4",
    "topic": "Word problems · rates",
    "concept": "Average speed",
    "idea": "Average speed = total distance ÷ total time, never the average of the two speeds.",
    "formula": "Average speed = total distance ÷ total time",
    "q": "Leo drives 120 miles to a conference at 40 mph and drives the same 120 miles home at 60 mph. What is his average speed for the whole trip?",
    "choices": [
      "45 mph",
      "48 mph",
      "50 mph",
      "52 mph",
      "55 mph"
    ],
    "answer": 1,
    "steps": [
      "Time there: 120 ÷ 40 = 3 hours.",
      "Time back: 120 ÷ 60 = 2 hours.",
      "Total: 240 miles in 5 hours.",
      "Average speed = 240 ÷ 5 = 48 mph."
    ],
    "tipLabel": "Trap to avoid",
    "tip": "50 mph (the simple average) is the trap. He spends MORE time at the slower speed, so the answer is below 50.",
    "time": "1:00"
  },
  {
    "id": "q5",
    "topic": "Sets",
    "concept": "Overlapping sets (Venn)",
    "idea": "Add the groups, subtract the overlap once, add the 'neither' group.",
    "formula": "Total = A + B − Both + Neither",
    "q": "Of 80 students, 45 take French, 38 take Spanish, and 12 take neither language. How many students take both French and Spanish?",
    "choices": [
      "10",
      "12",
      "15",
      "18",
      "20"
    ],
    "answer": 2,
    "steps": [
      "Students taking at least one language: 80 − 12 = 68.",
      "Adding French and Spanish counts the overlap twice: 45 + 38 = 83.",
      "Both = 83 − 68 = 15.",
      "Check: French only 30, Spanish only 23, both 15, neither 12, total 80 ✓"
    ],
    "tipLabel": "Tutor's habit",
    "tip": "Draw the two circles and fill the overlap first. It makes the check instant.",
    "time": "1:15"
  },
  {
    "id": "q6",
    "topic": "Number properties · primes",
    "concept": "Counting divisors",
    "idea": "Prime-factorize, add 1 to each exponent, multiply.",
    "formula": "n = pᵃ · qᵇ · rᶜ  →  divisors = (a+1)(b+1)(c+1)",
    "q": "How many positive divisors does 360 have?",
    "choices": [
      "12",
      "18",
      "20",
      "24",
      "36"
    ],
    "answer": 3,
    "steps": [
      "Prime factorization: 360 = 8 × 45 = 2³ × 3² × 5¹.",
      "Add 1 to each exponent: 3+1, 2+1, 1+1.",
      "Multiply: 4 × 3 × 2.",
      "= 24 divisors."
    ],
    "tipLabel": "Why it works",
    "tip": "Why it works: each divisor picks 0–3 twos, 0–2 threes and 0–1 fives. 4 × 3 × 2 choices.",
    "time": "1:00"
  },
  {
    "id": "q7",
    "topic": "Counting",
    "concept": "'At least one' = total − none",
    "idea": "When a question says 'at least one', count everything and subtract the cases with none.",
    "formula": "C(n, k) = n! ÷ (k!(n − k)!)",
    "q": "A committee of 3 people is chosen from 5 managers and 4 engineers. How many different committees include at least one engineer?",
    "choices": [
      "40",
      "60",
      "70",
      "74",
      "84"
    ],
    "answer": 3,
    "steps": [
      "All committees of 3 from 9 people: C(9, 3) = 84.",
      "Committees with NO engineer (all managers): C(5, 3) = 10.",
      "At least one engineer = 84 − 10.",
      "= 74."
    ],
    "tipLabel": "Tutor's shortcut",
    "tip": "Counting 1, 2 and 3 engineers separately also works (40 + 30 + 4 = 74) but takes three times as long.",
    "time": "1:30"
  },
  {
    "id": "q8",
    "topic": "Word problems · profit",
    "concept": "Markup then discount",
    "idea": "Markups and discounts are multipliers on different bases. Chain them from the cost.",
    "formula": "Selling price = cost × (1 + markup) × (1 − discount)",
    "q": "A store buys a lamp for $80, marks the price up 50%, and later sells it at 20% off the marked price. What is the store's profit as a percent of its cost?",
    "choices": [
      "10%",
      "15%",
      "20%",
      "25%",
      "30%"
    ],
    "answer": 2,
    "steps": [
      "Marked price: $80 × 1.5 = $120.",
      "Sale price: $120 × 0.8 = $96.",
      "Profit: $96 − $80 = $16.",
      "As a percent of cost: 16 ÷ 80 = 20%."
    ],
    "tipLabel": "Tutor's shortcut",
    "tip": "Multiplier shortcut: 1.5 × 0.8 = 1.2, so a 20% profit whatever the cost.",
    "time": "1:00"
  },
  {
    "id": "q9",
    "topic": "Word problems · interest",
    "concept": "Compound vs simple interest",
    "idea": "Simple interest earns on the principal only; compound interest also earns on past interest.",
    "formula": "Simple: P·r·t     Compound: P(1 + r)ᵗ − P",
    "q": "$5,000 is invested for 2 years at 10% annual interest. How much more interest is earned if the interest is compounded annually rather than simple?",
    "choices": [
      "$0",
      "$25",
      "$50",
      "$100",
      "$500"
    ],
    "answer": 2,
    "steps": [
      "Simple interest: 5,000 × 0.10 × 2 = $1,000.",
      "Compound, year 1: $500, balance $5,500.",
      "Compound, year 2: 10% of 5,500 = $550, so $1,050 in total.",
      "Difference: 1,050 − 1,000 = $50."
    ],
    "tipLabel": "Tutor's shortcut",
    "tip": "The extra is just 'interest on the first year's interest': 10% of $500 = $50.",
    "time": "1:15"
  },
  {
    "id": "q10",
    "topic": "Sequences",
    "concept": "Sum of an evenly spaced list",
    "idea": "For evenly spaced numbers, the average is the midpoint of the first and last terms.",
    "formula": "Sum = number of terms × (first + last) ÷ 2",
    "q": "What is the sum of all multiples of 7 between 1 and 100?",
    "choices": [
      "700",
      "707",
      "735",
      "749",
      "770"
    ],
    "answer": 2,
    "steps": [
      "First multiple: 7. Last below 100: 98 (7 × 14).",
      "Number of terms: 14.",
      "Average term: (7 + 98) ÷ 2 = 52.5.",
      "Sum = 14 × 52.5 = 735."
    ],
    "tipLabel": "Second method",
    "tip": "Alternative: 7 × (1 + 2 + … + 14) = 7 × 105 = 735.",
    "time": "1:15"
  },
  {
    "id": "q11",
    "topic": "Arithmetic · ratios",
    "concept": "Ratios that change",
    "idea": "Write each group as a multiple of one unknown k, then apply the change.",
    "formula": "3 : 5 → 3k and 5k",
    "q": "The ratio of boys to girls in a class is 3 : 5. After 6 more boys join, the ratio becomes 3 : 4. How many students were in the class originally?",
    "choices": [
      "40",
      "48",
      "56",
      "64",
      "72"
    ],
    "answer": 3,
    "steps": [
      "Originally: 3k boys and 5k girls (8k students).",
      "After the change: (3k + 6) : 5k = 3 : 4.",
      "Cross-multiply: 4(3k + 6) = 15k, so 12k + 24 = 15k and k = 8.",
      "Original class size: 8k = 64."
    ],
    "tipLabel": "Quick check",
    "tip": "Check with k = 8: 24 + 6 = 30 boys and 40 girls, and 30 : 40 = 3 : 4 ✓",
    "time": "1:30"
  },
  {
    "id": "q12",
    "topic": "Statistics",
    "concept": "What changes standard deviation",
    "idea": "Standard deviation measures spread. Shifting every value leaves spread unchanged; scaling or reshaping changes it.",
    "formula": "Add c to all → SD same     Multiply all by c → SD × |c|",
    "q": "The set S = {4, 8, 12, 16, 20} has standard deviation d. Which change to S leaves the standard deviation equal to d?",
    "choices": [
      "Multiply each number by 2",
      "Add 5 to each number",
      "Remove the number 12",
      "Add another 12 to the set",
      "Replace 20 with 24"
    ],
    "answer": 1,
    "steps": [
      "(B) Adding 5 shifts every value; the gaps stay the same, so SD stays d.",
      "(A) Multiplying by 2 doubles every gap: SD becomes 2d.",
      "(C) Removing 12, the mean, leaves only far-out values: SD goes up.",
      "(D) Another 12 at the mean pulls SD down; (E) 24 stretches the set: SD goes up."
    ],
    "tipLabel": "Concept, not arithmetic",
    "tip": "No calculating needed. The GMAT tests SD as a concept: think 'how spread out?'",
    "time": "1:15"
  }
];
