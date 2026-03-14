/**
 * Lesson 5.4: Hess's Law — Energy Doesn't Care About the Path
 *
 * ATOMIC LESSON — one core concept: total ΔH for a reaction is the same
 * whether it happens in one step or many. You can add ΔH values of
 * intermediate reactions to find ΔH for a reaction you've never measured.
 *
 * Prereqs used: calorimetry / q_rxn (5.3), conservation of energy (5.1),
 * exo/endothermic sign conventions (4.3, 5.3), moles & molar mass (4.4).
 *
 * Sim: thermoViz in 'hessLaw' mode — energy level diagram with
 * direct vs multi-step animated paths.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';
import '../sims/thermoViz.js';

export const lesson_5_4 = {
  id: '5.4',
  lessonId: 'lesson_5_4',
  title: "Hess's Law",

  sections: [
    // --- RECALL HOOK ---
    {
      id: 'sec-54-hook',
      blocks: [
        new TextBlock({ id: '54-hook-title', tag: 'h2', html: 'A Problem Calorimetry Can\u2019t Solve' }),
        new CalloutBlock({ id: '54-hook-recall', html: '<strong>Recall (5.3):</strong> You can measure \u0394H by running a reaction in a calorimeter and using <strong>q<sub>rxn</sub> = \u2212mc\u0394T</strong>. That works great \u2014 when you CAN run the reaction.<br><br>But what about reactions that are too slow, too dangerous, or impossible to isolate? You can\u2019t put the formation of diamond from graphite in a coffee cup.<br><br><strong>Recall (5.1):</strong> Energy is conserved. It can\u2019t be created or destroyed.<br><br>That conservation law leads to a stunning shortcut: if you know the \u0394H of a few <em>related</em> reactions, you can <strong>calculate</strong> the \u0394H of a reaction you\u2019ve never run. That\u2019s Hess\u2019s Law.' }),
      ]
    },

    // --- ANALOGY ---
    {
      id: 'sec-54-analogy',
      blocks: [
        new TextBlock({ id: '54-anal-title', tag: 'h2', html: 'The Mountain Analogy' }),
        new CalloutBlock({ id: '54-anal-box', html: 'Imagine you want to know the height difference between a valley and a mountain peak. You could:<br><br>\u2022 <strong>Path 1:</strong> Climb straight up (one step) and read the altimeter \u2192 +2000 m<br>\u2022 <strong>Path 2:</strong> Hike to a plateau (+800 m), then climb to the peak (+1200 m) \u2192 total: +2000 m<br>\u2022 <strong>Path 3:</strong> Go around the long way with three stops \u2192 still +2000 m<br><br>The height difference doesn\u2019t care which path you took. <strong>Only the start and end matter.</strong><br><br>Energy works the same way. \u0394H depends only on reactants (start) and products (end) \u2014 not on how you get there.' }),
      ]
    },

    // --- FORMALIZE ---
    {
      id: 'sec-54-law',
      blocks: [
        new TextBlock({ id: '54-law-title', tag: 'h2', html: "Hess\u2019s Law" }),
        new MathBlock({ id: '54-law-math', label: "Hess\u2019s Law:", equation: '\u0394H_total = \u0394H\u2081 + \u0394H\u2082 + \u0394H\u2083 + \u2026', symbols: [
          { symbol: '\u0394H_total', name: 'Enthalpy change of target reaction', meaning: 'The reaction you WANT the energy for' },
          { symbol: '\u0394H\u2081, \u0394H\u2082, \u2026', name: 'Enthalpy changes of known steps', meaning: 'Intermediate reactions whose \u0394H you measured (e.g. via calorimetry)' },
        ]}),
        new CalloutBlock({ id: '54-law-why', html: '<strong>Why it works:</strong> Enthalpy is a <em>state function</em>. That means \u0394H depends only on the initial state (reactants) and the final state (products), not the path. This is a direct consequence of conservation of energy (lesson 5.1). If the total energy changed depending on the path, you could create energy from nothing by going one way and coming back another \u2014 violating the first law of thermodynamics.' }),
      ]
    },

    // --- CONCRETE EXAMPLE ---
    {
      id: 'sec-54-example',
      blocks: [
        new TextBlock({ id: '54-ex-title', tag: 'h2', html: 'Worked Example: Burning Carbon' }),
        new CalloutBlock({ id: '54-ex-box', html: '<strong>Target:</strong> C(s) + O\u2082(g) \u2192 CO\u2082(g) \u2003\u0394H = ?<br><br><strong>Given reactions (measured by calorimetry):</strong><br>Step 1: C(s) + \u00bdO\u2082(g) \u2192 CO(g) \u2003\u0394H\u2081 = \u2212110.5 kJ<br>Step 2: CO(g) + \u00bdO\u2082(g) \u2192 CO\u2082(g) \u2003\u0394H\u2082 = \u2212282.5 kJ<br><br><strong>Notice:</strong> Step 1 takes C to CO. Step 2 takes CO to CO\u2082. Together they take C all the way to CO\u2082 \u2014 same start and end as the target!<br><br><strong>Apply Hess\u2019s Law:</strong><br>\u0394H = \u0394H\u2081 + \u0394H\u2082 = (\u2212110.5) + (\u2212282.5) = <strong>\u2212393 kJ</strong><br><br>You just found \u0394H for burning carbon without needing to measure it directly.' }),
      ]
    },

    // --- SIM ---
    {
      id: 'sec-54-sim',
      blocks: [
        new TextBlock({ id: '54-sim-title', tag: 'h2', html: 'See It: Energy Level Diagram' }),
        new TextBlock({ id: '54-sim-inst', tag: 'p', html: 'Click "Direct Path" to see the one-step reaction. Then click "Two-Step Path" to see the same reaction broken into two stages. Watch the energy levels: the total drop is identical either way. That\u2019s Hess\u2019s Law visualized.' }),
        new SimBlock({ id: '54-hl-viz', sim: 'thermoViz', width: 900, height: 420, simOptions: { mode: 'hessLaw' } }),
      ]
    },

    // --- RULES ---
    {
      id: 'sec-54-rules',
      blocks: [
        new TextBlock({ id: '54-rules-title', tag: 'h2', html: 'Two Manipulation Rules' }),
        new CalloutBlock({ id: '54-rules-box', html: 'Sometimes the given reactions don\u2019t line up perfectly with the target. You\u2019re allowed two moves:<br><br><strong>Rule 1 \u2014 Flip a reaction:</strong> Reverse the direction \u2192 flip the sign of \u0394H.<br>\u2003If A \u2192 B has \u0394H = \u2212100 kJ, then B \u2192 A has \u0394H = <strong>+100 kJ</strong><br><br><strong>Rule 2 \u2014 Scale a reaction:</strong> Multiply all coefficients by a factor \u2192 multiply \u0394H by the same factor.<br>\u2003If A \u2192 B has \u0394H = \u2212100 kJ, then 2A \u2192 2B has \u0394H = <strong>\u2212200 kJ</strong><br><br>These two rules let you rearrange any set of given reactions to match your target.' }),
        new TableBlock({ id: '54-rules-table', headers: ['Manipulation', 'Effect on \u0394H', 'Example'], rows: [
          ['Reverse reaction', 'Flip sign (\u00d7 \u22121)', '\u0394H = \u2212100 \u2192 +100 kJ'],
          ['Multiply by n', 'Multiply \u0394H by n', '\u0394H = \u2212100 \u2192 \u2212200 kJ (\u00d72)'],
          ['Divide by n', 'Divide \u0394H by n', '\u0394H = \u2212100 \u2192 \u221250 kJ (\u00f72)'],
        ]}),
      ]
    },

    // --- HARDER EXAMPLE ---
    {
      id: 'sec-54-hard',
      blocks: [
        new TextBlock({ id: '54-hard-title', tag: 'h2', html: 'Worked Example: Using the Rules' }),
        new CalloutBlock({ id: '54-hard-box', html: '<strong>Target:</strong> 2C(s) + H\u2082(g) \u2192 C\u2082H\u2082(g) \u2003\u0394H = ?<br><br><strong>Given:</strong><br>(a) C\u2082H\u2082(g) + \u2075\u2044\u2082 O\u2082(g) \u2192 2CO\u2082(g) + H\u2082O(l) \u2003\u0394H = \u22121300 kJ<br>(b) C(s) + O\u2082(g) \u2192 CO\u2082(g) \u2003\u0394H = \u2212393.5 kJ<br>(c) H\u2082(g) + \u00bdO\u2082(g) \u2192 H\u2082O(l) \u2003\u0394H = \u2212286 kJ<br><br><strong>Strategy:</strong> We need C\u2082H\u2082 on the RIGHT (it\u2019s a product in the target\u2019s reverse\u2026 wait, no \u2014 C\u2082H\u2082 is a PRODUCT in the target). Reaction (a) has C\u2082H\u2082 as a reactant. <strong>Flip (a)</strong>: \u0394H becomes <strong>+1300 kJ</strong>. We need 2C, and (b) gives 1C. <strong>Multiply (b) by 2</strong>: \u0394H becomes <strong>\u2212787 kJ</strong>. Keep (c) as is: \u0394H = \u2212286 kJ.<br><br>\u0394H = +1300 + (\u2212787) + (\u2212286) = <strong>+227 kJ</strong> (endothermic!)' }),
      ]
    },

    // --- FORWARD ---
    {
      id: 'sec-54-forward',
      blocks: [
        new TextBlock({ id: '54-fwd-title', tag: 'h2', html: 'What\u2019s Next?' }),
        new TextBlock({ id: '54-fwd-text', tag: 'p', html: 'You now have the complete energy toolkit: <strong>q = mc\u0394T</strong> to measure energy, and <strong>Hess\u2019s Law</strong> to calculate energy for reactions you can\u2019t measure. Together, they let you find \u0394H for virtually any reaction. This is the foundation of thermochemistry \u2014 and it connects directly to materials science: predicting whether a material synthesis is energetically favorable, calculating fuel efficiencies, and designing reactions that release or absorb just the right amount of energy.' }),
      ]
    },
  ],

  // 19 steps total — must exactly match buildSteps length
  // 8 quiz/checkpoint steps = ~42%
  stepMeta: [
    { icon: '\ud83d\udd04', label: 'Recall', kind: 'narrate' },           // 0
    { icon: '\u2753', label: 'Recall Q', kind: 'quiz' },                   // 1
    null,                                                                    // 2  (pause)
    { icon: '\u26f0\ufe0f', label: 'Analogy', kind: 'narrate' },           // 3
    { icon: '\ud83d\udcdd', label: 'The Law', kind: 'narrate' },           // 4
    { icon: '\u2753', label: 'Quiz 1', kind: 'quiz' },                     // 5
    null,                                                                    // 6  (pause)
    { icon: '\ud83d\udcda', label: 'Worked Ex', kind: 'narrate' },         // 7
    { icon: '\u2753', label: 'Quiz 2', kind: 'quiz' },                     // 8
    null,                                                                    // 9  (pause)
    { icon: '\ud83c\udfae', label: 'Sim', kind: 'narrate' },               // 10
    { icon: '\ud83c\udfc1', label: 'Checkpoint', kind: 'checkpoint' },      // 11
    null,                                                                    // 12 (pause)
    { icon: '\ud83d\udd27', label: 'Rules', kind: 'narrate' },             // 13
    { icon: '\u2753', label: 'Quiz 3', kind: 'quiz' },                     // 14
    null,                                                                    // 15 (pause)
    { icon: '\ud83d\udcda', label: 'Hard Ex', kind: 'narrate' },           // 16
    { icon: '\u2753', label: 'Interleave', kind: 'quiz' },                 // 17
    { icon: '\ud83c\udf89', label: 'Next', kind: 'narrate' },              // 18
  ],

  buildSteps(showSection, runner) {
    const hlViz = runner.blockInstances.find(b => b.id === '54-hl-viz');

    // 19 steps — must match stepMeta length
    return [
      // 0: Recall hook
      { type: 'show', action: () => showSection('sec-54-hook'),
        text: "In lesson 5.3, you learned to measure delta H using a calorimeter: run a reaction in water, measure the temperature change, calculate q reaction equals negative m c delta T. That works beautifully — when you CAN run the reaction. But what if the reaction is too dangerous? Too slow? Or simply impossible to isolate in a lab? You can't put the formation of diamond from graphite in a coffee cup. And yet, from lesson 5.1, you know that energy is conserved — it can never be created or destroyed. That conservation law leads to a stunning shortcut. If you know the delta H of a few related reactions, you can CALCULATE the delta H of a reaction you've never run. That shortcut has a name: Hess's Law." },

      // 1: Recall quiz — interleaved from 5.3
      { type: 'quiz',
        text: "Quick recall from last lesson.",
        question: "From lesson 5.3: In a calorimeter, a reaction causes the water temperature to DROP. What is the sign of q_rxn?",
        options: [
          "Negative — exothermic",
          "Positive — endothermic",
          "Zero — no energy change",
          "Cannot determine without mass"
        ],
        correctIndex: 1,
        correctFeedback: "Right! Water cools down \u2192 \u0394T negative \u2192 q_water negative \u2192 q_rxn = \u2212(negative) = positive \u2192 endothermic. The reaction absorbed energy from the water. That sign convention from 5.3 is a tool you'll keep using.",
        wrongFeedback: "Remember: q_rxn = \u2212q_water. If water cools down, q_water is negative. So q_rxn = \u2212(negative) = positive. Positive means the reaction absorbed energy." },

      // 2: pause
      { type: 'pause' },

      // 3: Mountain analogy
      { type: 'show', action: () => showSection('sec-54-analogy'),
        text: "Let me give you the intuition before the formula. Imagine you want to know the height difference between a valley and a mountain peak. You could climb straight up — one step — and read the altimeter: plus 2000 meters. Or you could hike to a plateau first — plus 800 meters — then climb to the peak from there — plus 1200 meters — for a total of plus 2000 meters. Or take the long scenic route with three stops. Doesn't matter. The height difference is always the same: 2000 meters. Only the starting point and ending point determine the height difference. The path is irrelevant. Energy works the exact same way. Delta H depends only on the reactants — the start — and the products — the end. Not on how you get there. That's the core of Hess's Law." },

      // 4: Formalize
      { type: 'show', action: () => showSection('sec-54-law'),
        text: "Here's the formal statement. Hess's Law: the total enthalpy change for a reaction equals the sum of the enthalpy changes for any set of steps that lead from the same reactants to the same products. Delta H total equals delta H 1 plus delta H 2 plus delta H 3 and so on. Why does this work? Because enthalpy is what physicists call a state function — its value depends only on the current state of the system, not on how it got there. This is a direct consequence of conservation of energy from lesson 5.1. If delta H depended on the path, you could create energy from nothing by going one way and coming back another. That would violate the first law of thermodynamics. Since energy can't be created or destroyed, the total must be path-independent." },

      // 5: Quiz 1 — core concept check
      { type: 'quiz',
        text: "Check the core idea.",
        question: "Why does Hess's Law work?",
        options: [
          "Because reactions always happen in one step",
          "Because enthalpy is a state function — it depends only on start and end states, not the path (conservation of energy)",
          "Because all reactions are exothermic",
          "Because calorimeters are perfectly insulated"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! Enthalpy is a state function. The total \u0394H from reactants to products is the same regardless of whether the reaction happens in one step, two steps, or a hundred steps. Conservation of energy guarantees it.",
        wrongFeedback: "Think about the mountain analogy: the height difference doesn't depend on which path you climb. The same is true for energy. What physical law guarantees this?" },

      // 6: pause
      { type: 'pause' },

      // 7: Worked example — carbon combustion
      { type: 'show', action: () => showSection('sec-54-example'),
        text: "Let's see this in action with a real example. Target reaction: solid carbon plus O 2 gas goes to CO 2 gas. What's delta H? Suppose you don't have a calorimeter for this, but you DO have calorimeter data for two related reactions. Step 1: carbon plus half O 2 goes to carbon monoxide. Delta H 1 equals negative 110.5 kilojoules. Step 2: carbon monoxide plus half O 2 goes to CO 2. Delta H 2 equals negative 282.5 kilojoules. Now look: step 1 takes carbon to CO. Step 2 takes CO to CO 2. Together, they take carbon all the way to CO 2 — the same start and end as the target reaction! By Hess's Law: delta H equals delta H 1 plus delta H 2. That's negative 110.5 plus negative 282.5 equals negative 393 kilojoules. You found delta H for burning carbon without ever measuring it directly." },

      // 8: Quiz 2 — student applies Hess's Law
      { type: 'quiz',
        text: "Your turn to apply Hess's Law.",
        question: "Given: (1) A \u2192 B, \u0394H\u2081 = \u221250 kJ and (2) B \u2192 C, \u0394H\u2082 = \u2212120 kJ. What is \u0394H for A \u2192 C?",
        options: [
          "\u221270 kJ",
          "+170 kJ",
          "\u2212170 kJ",
          "\u221260 kJ"
        ],
        correctIndex: 2,
        correctFeedback: "Yes! A \u2192 B \u2192 C. \u0394H = \u0394H\u2081 + \u0394H\u2082 = (\u221250) + (\u2212120) = \u2212170 kJ. The intermediate B cancels out. The total energy change from A to C is the same whether you go through B or go directly.",
        wrongFeedback: "A goes to B (\u0394H\u2081), then B goes to C (\u0394H\u2082). Add them: \u0394H = \u0394H\u2081 + \u0394H\u2082 = (\u221250) + (\u2212120)." },

      // 9: pause
      { type: 'pause' },

      // 10: Sim intro
      { type: 'show', action: () => showSection('sec-54-sim'),
        text: "Here's an energy level diagram for the carbon example. Click Direct Path to see the one-step reaction: carbon plus O 2 drops straight down to CO 2, releasing 393 kilojoules. Then click Two-Step Path to see the same reaction broken into two stages: first carbon drops to CO, releasing 110.5 kilojoules, then CO drops to CO 2, releasing 282.5 more. Watch carefully: the total energy drop is identical in both cases. The starting level and ending level are the same — only the path differs. That's Hess's Law visualized." },

      // 11: Checkpoint — try both paths
      { type: 'checkpoint',
        instruction: 'Click "Two-Step Path" to see the multi-step route',
        text: "Click the Two-Step Path button and watch the animation. See how the energy drops in two stages but lands at the exact same final level. The total delta H is negative 393 kilojoules either way.",
        check: () => hlViz?.renderer?.hlPath === 'steps' && hlViz?.renderer?.hlAnimProgress >= 0.9,
        checkInterval: 500,
        confirmText: "See it? The direct path drops 393 kilojoules in one shot. The two-step path drops 110.5, then 282.5 — totaling exactly 393 kilojoules. Same start, same end, same total energy change. The path doesn't matter. That's the power of Hess's Law." },

      // 12: pause
      { type: 'pause' },

      // 13: Manipulation rules
      { type: 'show', action: () => showSection('sec-54-rules'),
        text: "In real problems, the given reactions don't always line up perfectly with the target. You're allowed two manipulations. Rule 1: flip a reaction. If you reverse the direction, flip the sign of delta H. If A goes to B has delta H of negative 100 kilojoules, then B goes to A has delta H of positive 100 kilojoules. Makes sense — if going forward releases energy, going backward must absorb the same amount. Rule 2: scale a reaction. If you multiply all coefficients by a factor, multiply delta H by the same factor. If A goes to B has delta H of negative 100, then 2A goes to 2B has delta H of negative 200 — double the amount reacting, double the energy. These two rules let you rearrange any set of given reactions to match your target." },

      // 14: Quiz 3 — manipulation rules
      { type: 'quiz',
        text: "Test the manipulation rules.",
        question: "Given: A \u2192 B has \u0394H = \u2212200 kJ. What is \u0394H for 3B \u2192 3A?",
        options: [
          "\u2212600 kJ",
          "+600 kJ",
          "+200 kJ",
          "\u2212200 kJ"
        ],
        correctIndex: 1,
        correctFeedback: "Right! Two manipulations: first FLIP (A \u2192 B becomes B \u2192 A, \u0394H goes from \u2212200 to +200). Then SCALE by 3 (3B \u2192 3A, \u0394H = +200 \u00d7 3 = +600 kJ). Flip the sign, then multiply.",
        wrongFeedback: "Two steps: (1) Reverse the reaction \u2192 flip the sign: +200 kJ. (2) Multiply by 3 \u2192 multiply \u0394H by 3: +200 \u00d7 3 = ?" },

      // 15: pause
      { type: 'pause' },

      // 16: Harder worked example
      { type: 'show', action: () => showSection('sec-54-hard'),
        text: "Let's do a harder problem that uses the manipulation rules. Target: 2 carbons solid plus H 2 gas goes to acetylene, C 2 H 2 gas. Delta H equals question mark. Given three reactions from calorimetry. Reaction A: acetylene plus five halves O 2 goes to 2 CO 2 plus water. Delta H equals negative 1300 kilojoules. Reaction B: carbon plus O 2 goes to CO 2. Delta H equals negative 393.5 kilojoules. Reaction C: H 2 plus half O 2 goes to water. Delta H equals negative 286 kilojoules. Strategy: we need acetylene as a PRODUCT. But in reaction A, acetylene is a reactant. So FLIP reaction A — delta H becomes positive 1300. We need 2 carbons, and reaction B gives 1 carbon. So MULTIPLY B by 2 — delta H becomes negative 787. Keep reaction C as is — delta H equals negative 286. Now add them up: positive 1300 plus negative 787 plus negative 286 equals positive 227 kilojoules. The reaction is endothermic! Making acetylene requires energy input. We found that without ever running the reaction." },

      // 17: Interleaved quiz — combines Hess's Law with calorimetry from 5.3
      { type: 'quiz',
        text: "This combines Hess's Law with calorimetry from lesson 5.3.",
        question: "You measure two reactions by calorimetry: (1) X \u2192 Y, \u0394H\u2081 = \u221280 kJ. (2) Y \u2192 Z, \u0394H\u2082 = +30 kJ. What is \u0394H for X \u2192 Z, and is it exo- or endothermic?",
        options: [
          "\u221250 kJ, exothermic",
          "+50 kJ, endothermic",
          "\u2212110 kJ, exothermic",
          "+110 kJ, endothermic"
        ],
        correctIndex: 0,
        correctFeedback: "Correct! \u0394H = (\u221280) + (+30) = \u221250 kJ. Negative means exothermic \u2014 the overall reaction from X to Z releases 50 kJ. You used calorimetry (5.3) to measure each step, then Hess's Law (today) to combine them. The full toolkit in action!",
        wrongFeedback: "\u0394H = \u0394H\u2081 + \u0394H\u2082 = (\u221280) + (+30). Add them. Is the result positive or negative? Negative = exothermic, positive = endothermic." },

      // 18: Forward tease
      { type: 'show', action: () => showSection('sec-54-forward'),
        text: "You now have the complete energy toolkit. q equals m c delta T to measure energy from calorimetry. Hess's Law to calculate energy for reactions you can't measure directly. Two manipulation rules — flip and scale — to rearrange given reactions to match any target. Together, these let you find delta H for virtually any reaction. This is the foundation of thermochemistry. And it connects directly to materials science: predicting whether a material synthesis is energetically favorable, calculating fuel efficiencies, and designing reactions that release or absorb just the right amount of energy. Module 5 is complete. Everything you've learned — from atoms to bonds to energy — is building toward understanding how and why materials behave the way they do." },
    ];
  },
};
