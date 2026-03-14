/**
 * Lesson 5.3: Calorimetry — Measuring Reaction Energy
 *
 * ATOMIC LESSON — one core concept: using q = mcΔT inside a calorimeter
 * to measure the energy (ΔH) of a chemical reaction.
 *
 * Prereqs used: q = mcΔT (5.2), exo/endothermic (4.3), specific heat (5.2),
 * conservation of energy (5.1), moles & molar mass (4.4).
 *
 * Sim: calorimetryViz — interactive coffee-cup calorimeter.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';
import '../sims/calorimetryViz.js';

export const lesson_5_3 = {
  id: '5.3',
  lessonId: 'lesson_5_3',
  title: 'Calorimetry — Measuring Reaction Energy',

  sections: [
    // --- RECALL HOOK ---
    {
      id: 'sec-53-hook',
      blocks: [
        new TextBlock({ id: '53-hook-title', tag: 'h2', html: 'From Calculating to Measuring' }),
        new CalloutBlock({ id: '53-hook-recall', html: '<strong>Recall (5.2):</strong> You learned <strong>q = mc\u0394T</strong> \u2014 given mass, specific heat, and temperature change, you can calculate the energy transferred.<br><br><strong>Recall (4.3):</strong> Exothermic reactions release energy (\u0394H &lt; 0). Endothermic reactions absorb energy (\u0394H &gt; 0).<br><br>But here\u2019s the question: if a reaction releases energy, <em>how do chemists actually measure how much?</em> You can\u2019t stick a thermometer in a molecule. The trick is elegant \u2014 and it uses the exact formula you just learned.' }),
      ]
    },

    // --- THE IDEA ---
    {
      id: 'sec-53-idea',
      blocks: [
        new TextBlock({ id: '53-idea-title', tag: 'h2', html: 'The Trick: Let Water Be Your Thermometer' }),
        new CalloutBlock({ id: '53-idea-box', html: 'A <strong>calorimeter</strong> is just an insulated container filled with water. You run a reaction <em>inside</em> the water. If the reaction is exothermic, it dumps energy into the water \u2192 water heats up. If endothermic, it pulls energy from the water \u2192 water cools down.<br><br>You measure the water\u2019s temperature change (\u0394T). You know the water\u2019s mass (m) and its specific heat (c = 4.18). So you calculate:<br><br><strong>q<sub>water</sub> = m \u00d7 c \u00d7 \u0394T</strong><br><br>By conservation of energy (lesson 5.1): the energy the water gained = the energy the reaction released. That\u2019s the whole idea.' }),
        new CalloutBlock({ id: '53-idea-key', html: '<strong>Key insight:</strong> q<sub>reaction</sub> = \u2212q<sub>water</sub><br><br>The negative sign matters! If the water gains energy (+q), the reaction lost it (\u2212q). Energy is conserved \u2014 what the water gains, the reaction gives up.' }),
      ]
    },

    // --- WORKED EXAMPLE ---
    {
      id: 'sec-53-worked',
      blocks: [
        new TextBlock({ id: '53-work-title', tag: 'h2', html: 'Worked Example: Dissolving NaOH' }),
        new CalloutBlock({ id: '53-work-box', html: '<strong>Problem:</strong> You dissolve 40 g of NaOH (1 mole, molar mass = 40 g/mol) in 100 g of water inside a calorimeter. The temperature rises from 25.0\u00b0C to 38.7\u00b0C. Calculate \u0394H per mole.<br><br><strong>Step 1:</strong> Find \u0394T<br>\u2003\u0394T = 38.7 \u2212 25.0 = 13.7\u00b0C<br><br><strong>Step 2:</strong> Calculate q<sub>water</sub><br>\u2003q = m \u00d7 c \u00d7 \u0394T = 100 \u00d7 4.18 \u00d7 13.7 = <strong>5,727 J</strong><br><br><strong>Step 3:</strong> Find q<sub>reaction</sub><br>\u2003q<sub>rxn</sub> = \u2212q<sub>water</sub> = \u22125,727 J<br>\u2003(Negative because the reaction RELEASED energy \u2192 exothermic)<br><br><strong>Step 4:</strong> Convert to kJ/mol<br>\u2003We used 1 mole of NaOH, so:<br>\u2003\u0394H = \u22125,727 J / 1 mol = \u22125.73 kJ/mol' }),
      ]
    },

    // --- FORMULA ---
    {
      id: 'sec-53-formula',
      blocks: [
        new TextBlock({ id: '53-form-title', tag: 'h2', html: 'The Calorimetry Method' }),
        new MathBlock({ id: '53-form-math', label: 'Calorimetry equation:', equation: 'q_rxn = \u2212(m \u00d7 c \u00d7 \u0394T)', symbols: [
          { symbol: 'q_rxn', name: 'Reaction energy', meaning: 'Joules \u2014 energy released (\u2212) or absorbed (+) by the reaction' },
          { symbol: 'm', name: 'Mass of water', meaning: 'grams \u2014 the water in the calorimeter' },
          { symbol: 'c', name: 'Specific heat of water', meaning: '4.18 J/(g\u00b7\u00b0C) \u2014 always this value for water' },
          { symbol: '\u0394T', name: 'Temperature change', meaning: '\u00b0C \u2014 measured by the thermometer (T_final \u2212 T_initial)' },
        ]}),
        new CalloutBlock({ id: '53-form-sign', html: '<strong>Sign convention cheat sheet:</strong><br><br>\u2022 Water heats up (\u0394T > 0) \u2192 q<sub>water</sub> positive \u2192 q<sub>rxn</sub> <strong>negative</strong> \u2192 <strong>exothermic</strong><br>\u2022 Water cools down (\u0394T < 0) \u2192 q<sub>water</sub> negative \u2192 q<sub>rxn</sub> <strong>positive</strong> \u2192 <strong>endothermic</strong><br><br>The negative sign flips the perspective: from what the <em>water</em> experiences to what the <em>reaction</em> does.' }),
      ]
    },

    // --- SIM ---
    {
      id: 'sec-53-sim',
      blocks: [
        new TextBlock({ id: '53-sim-title', tag: 'h2', html: 'Try It: Virtual Calorimeter' }),
        new TextBlock({ id: '53-sim-inst', tag: 'p', html: 'Select a reaction, click "Run Reaction," and watch the water temperature change. The calculation updates live \u2014 q = mc\u0394T applied in real time. Try both an exothermic and an endothermic reaction.' }),
        new SimBlock({ id: '53-cal-viz', sim: 'calorimetryViz', width: 900, height: 420, simOptions: {} }),
      ]
    },

    // --- ENDO EXAMPLE ---
    {
      id: 'sec-53-endo',
      blocks: [
        new TextBlock({ id: '53-endo-title', tag: 'h2', html: 'The Other Direction: Endothermic' }),
        new CalloutBlock({ id: '53-endo-box', html: '<strong>Instant cold packs</strong> use ammonium nitrate (NH\u2084NO\u2083). When you snap the pack, the salt dissolves in water. The temperature <em>drops</em> \u2014 the dissolution is endothermic.<br><br>In a calorimeter: 80 g of NH\u2084NO\u2083 dissolves in 100 g of water. Temperature drops from 25.0\u00b0C to 18.9\u00b0C.<br><br>\u0394T = 18.9 \u2212 25.0 = \u22126.1\u00b0C (negative!)<br>q<sub>water</sub> = 100 \u00d7 4.18 \u00d7 (\u22126.1) = \u22122,550 J<br>q<sub>rxn</sub> = \u2212(\u22122,550) = <strong>+2,550 J</strong><br><br>Positive q<sub>rxn</sub> = the reaction <em>absorbed</em> energy from the water. That\u2019s why the water got colder \u2014 the dissolving process stole its thermal energy.' }),
      ]
    },

    // --- FORWARD ---
    {
      id: 'sec-53-forward',
      blocks: [
        new TextBlock({ id: '53-fwd-title', tag: 'h2', html: 'Next: Hess\u2019s Law' }),
        new TextBlock({ id: '53-fwd-text', tag: 'p', html: 'You can now <strong>measure</strong> \u0394H for any reaction using a calorimeter. But what if a reaction is too dangerous, too slow, or impossible to run directly? Next lesson: <strong>Hess\u2019s Law</strong> \u2014 the idea that you can calculate \u0394H for a reaction you\u2019ve never run by combining \u0394H values from reactions you <em>have</em> measured. It\u2019s like solving a puzzle: if you know the energy of each step, you know the energy of the whole path. Conservation of energy guarantees it.' }),
      ]
    },
  ],

  // 19 steps total — must exactly match buildSteps length
  // ~42% quiz/checkpoint (8 out of 19)
  stepMeta: [
    { icon: '\ud83d\udd04', label: 'Recall', kind: 'narrate' },           // 0
    { icon: '\u2753', label: 'Recall Q', kind: 'quiz' },                   // 1
    null,                                                                    // 2  (pause)
    { icon: '\ud83d\udca1', label: 'The Idea', kind: 'narrate' },          // 3
    { icon: '\ud83d\udcdd', label: 'Key Insight', kind: 'narrate' },       // 4
    { icon: '\u2753', label: 'Quiz 1', kind: 'quiz' },                     // 5
    null,                                                                    // 6  (pause)
    { icon: '\ud83d\udcda', label: 'Worked Ex', kind: 'narrate' },         // 7
    { icon: '\ud83d\udcdd', label: 'Formula', kind: 'narrate' },           // 8
    { icon: '\u2753', label: 'Quiz 2', kind: 'quiz' },                     // 9
    null,                                                                    // 10 (pause)
    { icon: '\ud83c\udfae', label: 'Sim', kind: 'narrate' },               // 11
    { icon: '\ud83c\udfc1', label: 'Checkpoint', kind: 'checkpoint' },      // 12
    null,                                                                    // 13 (pause)
    { icon: '\u2744\ufe0f', label: 'Endo', kind: 'narrate' },              // 14
    { icon: '\u2753', label: 'Quiz 3', kind: 'quiz' },                     // 15
    { icon: '\u2753', label: 'Interleave', kind: 'quiz' },                 // 16
    null,                                                                    // 17 (pause)
    { icon: '\ud83c\udf89', label: 'Next', kind: 'narrate' },              // 18
  ],

  buildSteps(showSection, runner) {
    const calViz = runner.blockInstances.find(b => b.id === '53-cal-viz');

    // 19 steps — must match stepMeta length
    return [
      // 0: Recall hook — use q = mcΔT and exo/endo as entry
      { type: 'show', action: () => showSection('sec-53-hook'),
        text: "In lesson 5.2, you mastered q equals m c delta T — given the mass of a material, its specific heat, and the temperature change, you can calculate the total energy transferred. And back in lesson 4.3, you learned that exothermic reactions release energy — delta H is negative — while endothermic reactions absorb energy — delta H is positive. But here's the question those lessons leave unanswered: if a chemical reaction releases energy, how do chemists actually MEASURE how much? You can't stick a thermometer inside a molecule. The solution is elegant — and it uses the exact formula you just learned." },

      // 1: Recall quiz — interleaved from 5.2
      { type: 'quiz',
        text: "Quick check on the tool you'll need today.",
        question: "From lesson 5.2: How much energy is needed to raise 100 g of water (c = 4.18) by 10\u00b0C?",
        options: [
          "418 J",
          "4,180 J",
          "41.8 J",
          "41,800 J"
        ],
        correctIndex: 1,
        correctFeedback: "Correct! q = 100 \u00d7 4.18 \u00d7 10 = 4,180 J. You'll use this exact calculation inside a calorimeter today — but in reverse. Instead of asking 'how much energy for this temperature change,' you'll ask 'the temperature changed by this much, so how much energy did the reaction produce?'",
        wrongFeedback: "Use q = m \u00d7 c \u00d7 \u0394T. m = 100 g, c = 4.18, \u0394T = 10\u00b0C. Multiply them together." },

      // 2: pause
      { type: 'pause' },

      // 3: The idea — calorimeter concept
      { type: 'show', action: () => showSection('sec-53-idea'),
        text: "Here's the trick. A calorimeter is just an insulated container — a fancy word for what's essentially a coffee cup — filled with water. You run a chemical reaction INSIDE the water. If the reaction is exothermic, it dumps energy into the surrounding water. The water heats up. If the reaction is endothermic, it pulls energy FROM the water. The water cools down. Now you just measure the water's temperature change — delta T. You know the water's mass — m. You know water's specific heat — c equals 4.18. So you calculate q water equals m times c times delta T. And by conservation of energy from lesson 5.1, the energy the water gained is exactly the energy the reaction released. You've just measured a reaction's energy using a thermometer and a formula you already know." },

      // 4: Key insight — the sign flip
      { type: 'narrate',
        text: "There's one critical detail: the sign. The energy the WATER gains is the energy the REACTION loses. So q reaction equals NEGATIVE q water. If the water heats up, q water is positive — the water gained energy. That means q reaction is negative — the reaction released energy. Exothermic, delta H less than zero. If the water cools down, q water is negative — the water lost energy. That means q reaction is positive — the reaction absorbed energy. Endothermic, delta H greater than zero. The negative sign flips the perspective: from what the water experiences to what the reaction does. It's conservation of energy in action — the total is always zero." },

      // 5: Quiz 1 — direct application of the concept
      { type: 'quiz',
        text: "Let's check the core idea.",
        question: "In a calorimeter, a reaction causes the water temperature to RISE by 8\u00b0C. What can you conclude about the reaction?",
        options: [
          "It's endothermic — it absorbed energy",
          "It's exothermic — it released energy into the water, heating it up",
          "The reaction didn't involve energy",
          "You need more information to tell"
        ],
        correctIndex: 1,
        correctFeedback: "Right! Water got hotter \u2192 water gained energy \u2192 the reaction released that energy \u2192 exothermic. The calorimeter lets you SEE exothermic vs endothermic just by watching a thermometer.",
        wrongFeedback: "If the water heated up, something gave it energy. What gave it energy? The reaction happening inside it." },

      // 6: pause
      { type: 'pause' },

      // 7: Worked example
      { type: 'show', action: () => showSection('sec-53-worked'),
        text: "Let's work through a full problem. You dissolve 40 grams of sodium hydroxide — that's 1 mole, since NaOH has a molar mass of 40 grams per mole from lesson 4.4 — in 100 grams of water inside a calorimeter. The temperature rises from 25.0 degrees to 38.7 degrees. Step 1: find delta T. 38.7 minus 25.0 equals 13.7 degrees. Step 2: calculate q water. q equals 100 times 4.18 times 13.7, which gives us 5,727 joules. Step 3: find q reaction. q reaction equals negative q water, which is negative 5,727 joules. The negative sign tells us the reaction is exothermic — it released energy. Step 4: convert to kilojoules per mole. We used 1 mole, so delta H equals negative 5.73 kilojoules per mole. That's how chemists measure reaction energies in the real world." },

      // 8: Formalize — show the formula and sign convention
      { type: 'show', action: () => showSection('sec-53-formula'),
        text: "Let's formalize the method. q reaction equals negative m times c times delta T. m is the mass of water in the calorimeter — in grams. c is water's specific heat — always 4.18 joules per gram per degree C. delta T is the measured temperature change. And the negative sign flips the perspective from water to reaction. Here's the cheat sheet for signs: water heats up means delta T is positive, q water is positive, so q reaction is NEGATIVE — exothermic. Water cools down means delta T is negative, q water is negative, so q reaction is POSITIVE — endothermic. The negative sign does the work for you — just trust the math." },

      // 9: Quiz 2 — student calculates a calorimetry problem
      { type: 'quiz',
        text: "Your turn. Solve this calorimetry problem.",
        question: "A reaction in 200 g of water causes the temperature to rise from 22.0\u00b0C to 28.5\u00b0C. What is q_rxn?",
        options: [
          "+5,434 J (endothermic)",
          "\u22125,434 J (exothermic)",
          "+2,717 J (endothermic)",
          "\u22122,717 J (exothermic)"
        ],
        correctIndex: 1,
        correctFeedback: "Correct! \u0394T = 28.5 \u2212 22.0 = 6.5\u00b0C. q_water = 200 \u00d7 4.18 \u00d7 6.5 = 5,434 J. q_rxn = \u22125,434 J. Water heated up \u2192 reaction released energy \u2192 exothermic.",
        wrongFeedback: "\u0394T = 28.5 \u2212 22.0 = 6.5\u00b0C. q_water = m \u00d7 c \u00d7 \u0394T = 200 \u00d7 4.18 \u00d7 6.5. Then q_rxn = \u2212q_water. Remember: water heated up means exothermic." },

      // 10: pause
      { type: 'pause' },

      // 11: Sim intro
      { type: 'show', action: () => showSection('sec-53-sim'),
        text: "Time to see this in action. Here's a virtual coffee-cup calorimeter. You can select different reactions — some exothermic, some endothermic — and click Run Reaction to watch what happens. The thermometer updates in real time, and the q equals m c delta T calculation builds live as the reaction proceeds. Try running the NaOH dissolving first — that's exothermic. Watch the water temperature rise and the energy calculation appear. Then reset and try ammonium nitrate — that's endothermic. Watch the temperature DROP. Same formula, opposite direction." },

      // 12: Checkpoint — interact with sim
      { type: 'checkpoint',
        instruction: 'Run at least 2 different reactions to see both exothermic and endothermic effects',
        text: "Go ahead — run at least two different reactions. Watch the thermometer and the calculation. Pay attention to the sign of q reaction: negative for exothermic, positive for endothermic.",
        check: () => calViz?.renderer?.reactionsRun >= 2,
        checkInterval: 500,
        confirmText: "Great! You've seen both directions. When the reaction is exothermic, the water heats up and q reaction is negative. When it's endothermic, the water cools and q reaction is positive. The calorimeter turns a temperature reading into an energy measurement — that's the power of q equals m c delta T." },

      // 13: pause
      { type: 'pause' },

      // 14: Endothermic example — cold packs
      { type: 'show', action: () => showSection('sec-53-endo'),
        text: "Let's look at the endothermic case in detail. Instant cold packs — the ones you crack and they get freezing cold — use ammonium nitrate. When the salt dissolves in water, it's endothermic: the dissolution absorbs energy FROM the water. In a calorimeter experiment: 80 grams of ammonium nitrate dissolves in 100 grams of water. Temperature drops from 25.0 to 18.9 degrees. Delta T equals 18.9 minus 25.0 which is negative 6.1 degrees. q water equals 100 times 4.18 times negative 6.1 equals negative 2,550 joules. The water LOST energy. q reaction equals negative of negative 2,550 which equals positive 2,550 joules. Positive means endothermic — the reaction absorbed energy from the water. That's literally why the cold pack feels cold: the dissolving process steals thermal energy from its surroundings." },

      // 15: Quiz 3 — sign convention mastery
      { type: 'quiz',
        text: "Test your understanding of the sign convention.",
        question: "In a calorimeter, the water temperature drops from 25\u00b0C to 19\u00b0C. What is the sign of q_rxn, and what type of reaction is it?",
        options: [
          "q_rxn is negative — exothermic",
          "q_rxn is positive — endothermic",
          "q_rxn is zero — no energy change",
          "q_rxn is negative — endothermic"
        ],
        correctIndex: 1,
        correctFeedback: "Yes! Water cooled down \u2192 \u0394T is negative \u2192 q_water is negative (water lost energy) \u2192 q_rxn = \u2212(negative) = positive \u2192 endothermic. The reaction absorbed energy from the water, making it colder.",
        wrongFeedback: "The water cooled down, so \u0394T is negative. q_water = m\u00d7c\u00d7(\u2212) = negative. Then q_rxn = \u2212q_water = \u2212(negative) = positive. Positive q_rxn = endothermic." },

      // 16: Interleaved quiz — combines calorimetry with moles from 4.4
      { type: 'quiz',
        text: "This combines calorimetry with molar mass from lesson 4.4.",
        question: "You dissolve 20 g of NaOH (molar mass 40 g/mol) in 100 g of water. Temperature rises by 6.85\u00b0C. What is \u0394H in kJ/mol?",
        options: [
          "\u22122.86 kJ/mol",
          "\u22125.73 kJ/mol",
          "+5.73 kJ/mol",
          "\u221211.46 kJ/mol"
        ],
        correctIndex: 1,
        correctFeedback: "Right! q_water = 100 \u00d7 4.18 \u00d7 6.85 = 2,863 J. q_rxn = \u22122,863 J. Moles of NaOH = 20/40 = 0.5 mol. \u0394H = \u22122,863 / 0.5 = \u22125,726 J/mol = \u22125.73 kJ/mol. You used molar mass from 4.4 AND calorimetry from today. Everything connects!",
        wrongFeedback: "Step by step: q_water = 100 \u00d7 4.18 \u00d7 6.85. q_rxn = \u2212q_water. Moles = mass/molar mass = 20/40. \u0394H = q_rxn / moles." },

      // 17: pause
      { type: 'pause' },

      // 18: Forward tease
      { type: 'show', action: () => showSection('sec-53-forward'),
        text: "You can now MEASURE delta H for any reaction using a calorimeter, a thermometer, and q equals m c delta T. But what if a reaction is too dangerous to run, or too slow, or impossible to isolate in a calorimeter? Next lesson: Hess's Law. The idea is that energy is a state function — the total delta H depends only on where you start and where you end, not the path you take. So you can calculate delta H for a reaction you've never run by adding up delta H values from reactions you HAVE measured. It's like finding the height of a mountain by climbing three smaller hills that get you to the same summit. Conservation of energy guarantees the total is the same. See you in lesson 5.4!" },
    ];
  },
};
