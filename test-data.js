// Full-length GMAT Quant practice test: 21 original GMAT-style questions from MZB Academy Practice Sets 1 & 2.
// Ordered to mix topics, roughly easier to harder. Every answer verified.
module.exports = [
  {
    "id": "t1",
    "source": "Set 2 Q1",
    "category": "Algebra",
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
    "tip": "Any 'huge number squared minus huge number squared' is a factoring question in disguise."
  },
  {
    "id": "t2",
    "source": "Set 2 Q8",
    "category": "Word problems",
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
    "tip": "Multiplier shortcut: 1.5 × 0.8 = 1.2, so a 20% profit whatever the cost."
  },
  {
    "id": "t3",
    "source": "Set 2 Q2",
    "category": "Arithmetic & number properties",
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
    "tip": "Remainder 0 means the LAST item in the cycle (here 1), not the first."
  },
  {
    "id": "t4",
    "source": "Set 2 Q5",
    "category": "Statistics & counting",
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
    "tip": "Draw the two circles and fill the overlap first. It makes the check instant."
  },
  {
    "id": "t5",
    "source": "Set 1 Q6",
    "category": "Algebra",
    "topic": "Algebra · exponents",
    "concept": "Same-base exponents",
    "idea": "Rewrite every term with the same base, then set the exponents equal.",
    "formula": "4 = 2²   16 = 2⁴   (aᵐ)ⁿ = aᵐⁿ   aᵐ · aⁿ = aᵐ⁺ⁿ",
    "q": "If 2ˣ · 4ˣ⁺¹ = 16ˣ⁻¹, what is the value of x?",
    "choices": [
      "3",
      "4",
      "5",
      "6",
      "8"
    ],
    "answer": 3,
    "steps": [
      "Convert to base 2: 4ˣ⁺¹ = 2²⁽ˣ⁺¹⁾ and 16ˣ⁻¹ = 2⁴⁽ˣ⁻¹⁾.",
      "Left side: 2ˣ · 2²ˣ⁺² = 2³ˣ⁺².",
      "Set exponents equal: 3x + 2 = 4x − 4.",
      "Solve: x = 6."
    ],
    "tipLabel": "Quick check",
    "tip": "Check: 2⁶ · 4⁷ = 2⁶ · 2¹⁴ = 2²⁰ and 16⁵ = 2²⁰ ✓"
  },
  {
    "id": "t6",
    "source": "Set 2 Q3",
    "category": "Word problems",
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
    "tip": "Back-solve: try (C) 36. Son 12. In 12 years 48 and 24. Twice ✓"
  },
  {
    "id": "t7",
    "source": "Set 2 Q6",
    "category": "Arithmetic & number properties",
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
    "tip": "Why it works: each divisor picks 0–3 twos, 0–2 threes and 0–1 fives. 4 × 3 × 2 choices."
  },
  {
    "id": "t8",
    "source": "Set 1 Q11",
    "category": "Statistics & counting",
    "topic": "Probability",
    "concept": "Probability without replacement",
    "idea": "Count favorable outcomes over total outcomes, using combinations when order doesn't matter.",
    "formula": "P = favorable ÷ total     C(n, 2) = n(n − 1) ÷ 2",
    "q": "A bag contains 4 red marbles and 5 blue marbles. Two marbles are drawn at random without replacement. What is the probability that the two marbles are different colors?",
    "choices": [
      "1/3",
      "4/9",
      "1/2",
      "5/9",
      "2/3"
    ],
    "answer": 3,
    "steps": [
      "Total ways to choose 2 of 9: C(9, 2) = 36.",
      "Favorable: 1 red × 1 blue = 4 × 5 = 20.",
      "P = 20/36 = 5/9.",
      "Check with a sequence: RB + BR = (4/9)(5/8) + (5/9)(4/8) = 40/72 = 5/9 ✓"
    ],
    "tipLabel": "Quick check",
    "tip": "Two ways to check: the complement 1 − P(same) = 1 − (6 + 10)/36 = 20/36 ✓"
  },
  {
    "id": "t9",
    "source": "Set 1 Q7",
    "category": "Algebra",
    "topic": "Algebra · inequalities",
    "concept": "Absolute-value inequalities",
    "idea": "|expression| < k means the expression lives between −k and k.",
    "formula": "|A| < k  ⇔  −k < A < k",
    "q": "How many integers x satisfy |2x − 3| < 7?",
    "choices": [
      "5",
      "6",
      "7",
      "8",
      "9"
    ],
    "answer": 1,
    "steps": [
      "Unfold the absolute value: −7 < 2x − 3 < 7.",
      "Add 3 to all parts: −4 < 2x < 10.",
      "Divide by 2: −2 < x < 5.",
      "Integers strictly between: −1, 0, 1, 2, 3, 4, so there are 6."
    ],
    "tipLabel": "Trap to avoid",
    "tip": "Strict < means the endpoints −2 and 5 are OUT. Counting them gives 8, a trap choice."
  },
  {
    "id": "t10",
    "source": "Set 2 Q4",
    "category": "Word problems",
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
    "tip": "50 mph (the simple average) is the trap. He spends MORE time at the slower speed, so the answer is below 50."
  },
  {
    "id": "t11",
    "source": "Set 1 Q5",
    "category": "Arithmetic & number properties",
    "topic": "Number properties",
    "concept": "Remainder arithmetic",
    "idea": "Only the remainder matters. Replace n with its remainder and do the arithmetic on that.",
    "formula": "If n leaves remainder r on division by d, then n² + kn leaves the same remainder as r² + kr",
    "q": "When the positive integer n is divided by 6, the remainder is 4. What is the remainder when n² + 5n is divided by 6?",
    "choices": [
      "0",
      "1",
      "2",
      "3",
      "4"
    ],
    "answer": 0,
    "steps": [
      "Write n = 6q + 4, so n behaves like 4 when dividing by 6.",
      "Substitute the remainder: 4² + 5(4) = 16 + 20 = 36.",
      "36 ÷ 6 = 6 with remainder 0.",
      "Test with a real number, n = 10: 100 + 50 = 150 = 6 × 25 ✓"
    ],
    "tipLabel": "Tutor's shortcut",
    "tip": "Smart shortcut: just pick the smallest n that fits (n = 4) and compute."
  },
  {
    "id": "t12",
    "source": "Set 2 Q7",
    "category": "Statistics & counting",
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
    "tip": "Counting 1, 2 and 3 engineers separately also works (40 + 30 + 4 = 74) but takes three times as long."
  },
  {
    "id": "t13",
    "source": "Set 1 Q8",
    "category": "Word problems",
    "topic": "Word problems · mixtures",
    "concept": "Conserve the pure ingredient",
    "idea": "Adding water changes the total, not the amount of acid. Track the part that stays fixed.",
    "formula": "Amount of acid = concentration × total volume",
    "q": "A chemist has 20 liters of a solution that is 30% acid. How many liters of pure water must be added to make a solution that is 12% acid?",
    "choices": [
      "10",
      "20",
      "25",
      "30",
      "40"
    ],
    "answer": 3,
    "steps": [
      "Acid now: 30% of 20 = 6 liters, and that never changes.",
      "In the new mix, 6 liters must be 12% of the total.",
      "Total = 6 ÷ 0.12 = 50 liters.",
      "Water to add: 50 − 20 = 30 liters."
    ],
    "tipLabel": "Read the ask",
    "tip": "Answer check: 6 ÷ 50 = 12% ✓. Don't stop at 50; the question asks for the water ADDED."
  },
  {
    "id": "t14",
    "source": "Set 2 Q11",
    "category": "Arithmetic & number properties",
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
    "tip": "Check with k = 8: 24 + 6 = 30 boys and 40 girls, and 30 : 40 = 3 : 4 ✓"
  },
  {
    "id": "t15",
    "source": "Set 1 Q12",
    "category": "Algebra",
    "topic": "Algebra · quadratics",
    "concept": "Sum & product of roots",
    "idea": "For x² + bx + c = 0, the roots add to −b and multiply to c. No need to solve.",
    "formula": "r + s = −b     r · s = c",
    "q": "The equation x² − 6x + k = 0 has two roots, r and s. If r = 2s, what is the value of k?",
    "choices": [
      "5",
      "6",
      "8",
      "9",
      "12"
    ],
    "answer": 2,
    "steps": [
      "Sum of roots: r + s = 6.",
      "Substitute r = 2s: 3s = 6, so s = 2 and r = 4.",
      "Product of roots: k = r · s = 4 × 2 = 8.",
      "Check: x² − 6x + 8 = (x − 2)(x − 4) ✓"
    ],
    "tipLabel": "Tutor's shortcut",
    "tip": "Vieta's formulas turn a 'solve the quadratic' problem into 20-second arithmetic."
  },
  {
    "id": "t16",
    "source": "Set 2 Q12",
    "category": "Statistics & counting",
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
    "tip": "No calculating needed. The GMAT tests SD as a concept: think 'how spread out?'"
  },
  {
    "id": "t17",
    "source": "Set 2 Q9",
    "category": "Word problems",
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
    "tip": "The extra is just 'interest on the first year's interest': 10% of $500 = $50."
  },
  {
    "id": "t18",
    "source": "Set 2 Q10",
    "category": "Arithmetic & number properties",
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
    "tip": "Alternative: 7 × (1 + 2 + … + 14) = 7 × 105 = 735."
  },
  {
    "id": "t19",
    "source": "Set 1 Q2",
    "category": "Statistics & counting",
    "topic": "Counting & constraints",
    "concept": "Minimizing under constraints",
    "idea": "To make a total as small as possible, give each item the smallest value the rules allow, in order.",
    "formula": "Build greedily: smallest allowed, then next smallest allowed, …",
    "q": "A teacher fills 6 boxes with pencils. Every box gets at least 1 pencil, no two boxes hold the same number of pencils, and no two boxes hold consecutive numbers of pencils. What is the least total number of pencils she can use?",
    "choices": [
      "21",
      "30",
      "36",
      "42",
      "48"
    ],
    "answer": 2,
    "steps": [
      "Start with the smallest possible box: 1 pencil.",
      "The next box can't be 1 (same) or 2 (consecutive), so the smallest is 3.",
      "Continue the pattern: 1, 3, 5, 7, 9, 11, the first six odd numbers.",
      "Sum: the first n odd numbers add to n², so 6² = 36."
    ],
    "tipLabel": "Trap to avoid",
    "tip": "21 = 1+2+…+6 ignores the 'no consecutive' rule. It's the trap answer."
  },
  {
    "id": "t20",
    "source": "Set 1 Q9",
    "category": "Word problems",
    "topic": "Word problems · work",
    "concept": "Combined work rates",
    "idea": "Add rates, not times. A drain works against you, so subtract its rate.",
    "formula": "Rate = 1 ÷ time     Combined rate = Σ rates     Time = 1 ÷ combined rate",
    "q": "Pipe A can fill an empty tank in 6 hours and Pipe B can fill it in 9 hours. Drain C can empty the full tank in 12 hours. If all three are opened at the same time on an empty tank, how many hours will it take to fill the tank?",
    "choices": [
      "4 1/2",
      "5",
      "5 1/7",
      "5 1/2",
      "6"
    ],
    "answer": 2,
    "steps": [
      "Rates in tanks per hour: A = 1/6, B = 1/9, C = −1/12.",
      "Common denominator 36: 6/36 + 4/36 − 3/36 = 7/36.",
      "Time = 1 ÷ (7/36) = 36/7 hours.",
      "36/7 = 5 1/7 hours."
    ],
    "tipLabel": "Quick check",
    "tip": "Sanity check: A and B alone take 3.6 h; the drain must make it slower, so > 3.6 ✓"
  },
  {
    "id": "t21",
    "source": "Set 1 Q10",
    "category": "Statistics & counting",
    "topic": "Statistics",
    "concept": "Mean, median & mode together",
    "idea": "Fix what each statistic forces, then push the remaining values to their limits.",
    "formula": "Sum = mean × count   ·   median = middle value   ·   mode = most frequent (unique)",
    "q": "A list of five positive integers has a mean of 12, a median of 14, and a unique mode of 15. What is the greatest possible value of the smallest number in the list?",
    "choices": [
      "5",
      "6",
      "7",
      "8",
      "9"
    ],
    "answer": 2,
    "steps": [
      "Sum = 5 × 12 = 60. In order: a ≤ b ≤ 14 ≤ d ≤ e.",
      "A unique mode of 15 needs at least two 15s, and both must sit above the median: d = e = 15.",
      "So a + b = 60 − 14 − 30 = 16.",
      "a = b = 8 would make 8 a second mode, so a < b. Largest a: a = 7, b = 9."
    ],
    "tipLabel": "Key word",
    "tip": "'Unique mode' is the key word. It rules out a = b = 8, the trap answer (D)."
  }
];
