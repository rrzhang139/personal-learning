/**
 * Lesson 5.2: Specific Heat Capacity
 *
 * ATOMIC LESSON — one core concept: different materials need different amounts
 * of energy to change temperature. Why? And how do we calculate it? (q = mcDT)
 *
 * Prereqs used: heat vs temperature (5.1), total thermal energy (5.1),
 * hydrogen bonds / IMFs (4.2), molar mass / moles (4.4),
 * exo/endothermic (4.3).
 *
 * Sim: thermoViz in 'specificHeat' mode.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';
import '../sims/thermoViz.js';

export const lesson_5_2 = {
  id: '5.2',
  lessonId: 'lesson_5_2',
  title: 'Specific Heat Capacity',

  sections: [
    // --- RECALL HOOK ---
    {
      id: 'sec-52-hook',
      blocks: [
        new TextBlock({ id: '52-hook-title', tag: 'h2', html: 'A Puzzle From Last Lesson' }),
        new CalloutBlock({ id: '52-hook-recall', html: '<strong>Recall (5.1):</strong> A swimming pool at 30\u00b0C has more total thermal energy than a thimble at 90\u00b0C because total energy depends on <em>both</em> temperature and number of particles.<br><br>But here\u2019s a <strong>new</strong> question: if you add the <em>same</em> amount of energy to 100 g of water and 100 g of iron, which one heats up more?<br><br>Same mass. Same energy input. The answer isn\u2019t equal \u2014 and that\u2019s today\u2019s concept.' }),
      ]
    },

    // --- CONCRETE EXAMPLE ---
    {
      id: 'sec-52-concrete',
      blocks: [
        new TextBlock({ id: '52-conc-title', tag: 'h2', html: 'The Experiment: Water vs Iron' }),
        new CalloutBlock({ id: '52-conc-box', html: 'Pour <strong>1000 J</strong> of energy into 100 g of water \u2192 temperature rises just <strong>2.4\u00b0C</strong>.<br><br>Pour <strong>1000 J</strong> of energy into 100 g of iron \u2192 temperature rises <strong>22.3\u00b0C</strong>!<br><br>Iron heats up nearly <strong>10\u00d7 more</strong> than water with the exact same energy input. Water barely budges. Why?' }),
      ]
    },

    // --- NAME & DEFINE ---
    {
      id: 'sec-52-define',
      blocks: [
        new TextBlock({ id: '52-def-title', tag: 'h2', html: 'Specific Heat Capacity (c)' }),
        new CalloutBlock({ id: '52-def-box', html: '<strong>Specific heat capacity (c)</strong> = the energy needed to raise <strong>1 gram</strong> of a substance by <strong>1\u00b0C</strong>.<br><br>Units: J/(g\u00b7\u00b0C)<br><br><strong>High c</strong> = resists temperature change (lots of energy needed)<br><strong>Low c</strong> = temperature changes easily (little energy needed)' }),
        new TableBlock({ id: '52-def-table', headers: ['Material', 'c [J/(g\u00b7\u00b0C)]', 'Relative'], rows: [
          ['Water (H\u2082O)', '4.18', 'Baseline \u2014 extremely high'],
          ['Aluminum (Al)', '0.897', '~5\u00d7 lower than water'],
          ['Glass (SiO\u2082)', '0.84', '~5\u00d7 lower'],
          ['Iron (Fe)', '0.449', '~9\u00d7 lower'],
          ['Copper (Cu)', '0.385', '~11\u00d7 lower'],
        ]}),
        new CalloutBlock({ id: '52-def-why', html: '<strong>Why does water have such high c?</strong><br>Recall from lesson 4.2: water has strong <em>hydrogen bonds</em>. When you add energy to water, much of it goes into disrupting those H-bonds instead of speeding up the molecules. So the temperature (average KE per particle) barely changes \u2014 the energy is "absorbed" by the intermolecular forces.<br><br>Metals have weaker IMFs (metallic bonding is different), so nearly all added energy goes straight into particle speed \u2192 bigger temperature jump.' }),
      ]
    },

    // --- FORMALIZE ---
    {
      id: 'sec-52-formula',
      blocks: [
        new TextBlock({ id: '52-form-title', tag: 'h2', html: 'The Formula: q = mc\u0394T' }),
        new MathBlock({ id: '52-form-math', label: 'Heat equation:', equation: 'q = m \u00b7 c \u00b7 \u0394T', symbols: [
          { symbol: 'q', name: 'Heat energy', meaning: 'Joules (J) \u2014 total energy transferred' },
          { symbol: 'm', name: 'Mass', meaning: 'grams (g) \u2014 how much material' },
          { symbol: 'c', name: 'Specific heat capacity', meaning: 'J/(g\u00b7\u00b0C) \u2014 the material\'s "resistance to heating"' },
          { symbol: '\u0394T', name: 'Temperature change', meaning: '\u00b0C \u2014 final temp minus initial temp (T_f \u2212 T_i)' },
        ]}),
        new CalloutBlock({ id: '52-form-why', html: '<strong>Why the equation makes sense:</strong><br>\u2022 More mass (m \u2191) = more particles to speed up = need more energy<br>\u2022 Higher c = material resists heating = need more energy<br>\u2022 Bigger \u0394T = bigger temperature jump = need more energy<br><br>All three multiply together: double any one of them and you double the energy required.' }),
      ]
    },

    // --- WORKED EXAMPLE ---
    {
      id: 'sec-52-worked',
      blocks: [
        new TextBlock({ id: '52-work-title', tag: 'h2', html: 'Worked Example' }),
        new CalloutBlock({ id: '52-work-box', html: '<strong>Problem:</strong> How much energy to heat 200 g of water from 20\u00b0C to 50\u00b0C?<br><br><strong>Step 1:</strong> Identify values:<br>\u2003m = 200 g, \u2003c = 4.18 J/(g\u00b7\u00b0C), \u2003\u0394T = 50 \u2212 20 = 30\u00b0C<br><br><strong>Step 2:</strong> Plug into q = mc\u0394T:<br>\u2003q = 200 \u00d7 4.18 \u00d7 30 = <strong>25,080 J = 25.1 kJ</strong><br><br>That\u2019s 25 thousand joules just to warm a glass of water by 30 degrees. Water is an energy sponge!' }),
      ]
    },

    // --- SIM ---
    {
      id: 'sec-52-sim',
      blocks: [
        new TextBlock({ id: '52-sim-title', tag: 'h2', html: 'Try It: Specific Heat Simulation' }),
        new TextBlock({ id: '52-sim-inst', tag: 'p', html: 'Select different materials, adjust the mass, and click "Add 1000 J" repeatedly. Watch how the temperature changes differently for each material. Water barely moves; metals jump quickly.' }),
        new SimBlock({ id: '52-sh-viz', sim: 'thermoViz', width: 900, height: 420, simOptions: { mode: 'specificHeat' } }),
      ]
    },

    // --- REVERSE PROBLEM ---
    {
      id: 'sec-52-reverse',
      blocks: [
        new TextBlock({ id: '52-rev-title', tag: 'h2', html: 'Running the Formula Backwards' }),
        new CalloutBlock({ id: '52-rev-box', html: '<strong>Problem:</strong> 500 J of energy raises 50 g of an unknown metal by 11.1\u00b0C. What\u2019s its specific heat?<br><br><strong>Rearrange:</strong> c = q / (m \u00d7 \u0394T)<br>\u2003c = 500 / (50 \u00d7 11.1) = 500 / 555 = <strong>0.90 J/(g\u00b7\u00b0C)</strong><br><br>Check the table \u2014 that\u2019s aluminum! You just identified a mystery metal using q = mc\u0394T.' }),
      ]
    },

    // --- WHY IT MATTERS ---
    {
      id: 'sec-52-matters',
      blocks: [
        new TextBlock({ id: '52-mat-title', tag: 'h2', html: 'Why Materials Science Cares' }),
        new CalloutBlock({ id: '52-mat-box', html: '\u2022 <strong>Thermal management in electronics:</strong> CPUs generate heat. Copper heatsinks (low c) absorb heat quickly, then transfer it away. Water cooling works because water absorbs enormous energy with little temp rise.<br><br>\u2022 <strong>Why metals feel cold:</strong> Metal has low c AND high thermal conductivity. Heat leaves your hand fast AND the metal heats up fast. Double whammy = feels cold.<br><br>\u2022 <strong>Climate:</strong> Oceans (water, c = 4.18) absorb massive energy from the sun without heating much. Coastal cities have milder climates than inland ones because water moderates temperature swings.<br><br>\u2022 <strong>Cooking:</strong> Cast iron pans (low c) heat up and cool down fast. Water in a pot (high c) takes forever to boil.' }),
      ]
    },

    // --- FORWARD ---
    {
      id: 'sec-52-forward',
      blocks: [
        new TextBlock({ id: '52-fwd-title', tag: 'h2', html: 'Next: Calorimetry' }),
        new TextBlock({ id: '52-fwd-text', tag: 'p', html: 'You now have a quantitative tool: <strong>q = mc\u0394T</strong>. Next lesson, we\u2019ll use this formula inside a <strong>calorimeter</strong> \u2014 a device that measures the energy released or absorbed by actual chemical reactions. The idea: a reaction happens inside water, the water\u2019s temperature changes, and you use q = mc\u0394T to calculate exactly how much energy the reaction released. That\u2019s how chemists measure \u0394H in the real world.' }),
      ]
    },
  ],

  // 19 steps total — must exactly match buildSteps length
  // ~42% quiz/checkpoint (8 out of 19)
  stepMeta: [
    { icon: '\ud83d\udd04', label: 'Recall', kind: 'narrate' },           // 0
    { icon: '\ud83d\udca1', label: 'Concrete', kind: 'narrate' },          // 1
    { icon: '\u2753', label: 'Quiz 1', kind: 'quiz' },                     // 2
    null,                                                                    // 3  (pause)
    { icon: '\ud83d\udcd6', label: 'Define c', kind: 'narrate' },          // 4
    { icon: '\ud83d\udd17', label: 'Why water', kind: 'narrate' },         // 5
    { icon: '\ud83d\udcdd', label: 'Formula', kind: 'narrate' },           // 6
    { icon: '\ud83d\udcda', label: 'Worked Ex', kind: 'narrate' },         // 7
    { icon: '\u2753', label: 'Quiz 2', kind: 'quiz' },                     // 8
    null,                                                                    // 9  (pause)
    { icon: '\ud83c\udfae', label: 'Sim', kind: 'narrate' },               // 10
    { icon: '\ud83c\udfc1', label: 'Checkpoint', kind: 'checkpoint' },      // 11
    null,                                                                    // 12 (pause)
    { icon: '\ud83d\udd00', label: 'Reverse', kind: 'narrate' },           // 13
    { icon: '\u2753', label: 'Quiz 3', kind: 'quiz' },                     // 14
    { icon: '\u2753', label: 'Quiz 4', kind: 'quiz' },                     // 15
    null,                                                                    // 16 (pause)
    { icon: '\ud83c\udf0d', label: 'Why it matters', kind: 'narrate' },    // 17
    { icon: '\ud83c\udf89', label: 'Next', kind: 'narrate' },              // 18
  ],

  buildSteps(showSection, runner) {
    const shViz = runner.blockInstances.find(b => b.id === '52-sh-viz');

    // 19 steps — must match stepMeta length
    return [
      // 0: Recall hook — use prior knowledge as a tool
      { type: 'show', action: () => showSection('sec-52-hook'),
        text: "In lesson 5.1, you learned that a swimming pool at 30 degrees has more total thermal energy than a thimble of water at 90 degrees. That's because total energy depends on both temperature and number of particles. But here's a new question that 5.1 can't answer: if you add the same amount of energy — say, 1000 joules — to 100 grams of water and 100 grams of iron, which one heats up more? Same mass. Same energy. The answer is NOT equal. And understanding why is today's entire lesson." },

      // 1: Concrete example — specific numbers first
      { type: 'show', action: () => showSection('sec-52-concrete'),
        text: "Let's do the experiment. Pour 1000 joules into 100 grams of water. The temperature rises just 2.4 degrees Celsius. Now pour 1000 joules into 100 grams of iron. The temperature rises 22.3 degrees! Iron heats up nearly 10 times more than water with the exact same energy input. Water barely budges. This isn't about mass — they're both 100 grams. It's not about energy — they both got 1000 joules. Something about the MATERIAL itself determines how much the temperature changes. That something is called specific heat capacity." },

      // 2: Quiz 1 — direct recall of concrete example
      { type: 'quiz',
        text: "Quick check on what you just heard.",
        question: "You add the same 1000 J of energy to 100 g of water and 100 g of iron. Which heats up more?",
        options: [
          "Water — it's a liquid so it flows faster",
          "They heat up equally — same mass and same energy",
          "Iron — it heats up nearly 10\u00d7 more than water",
          "Cannot be determined without more information"
        ],
        correctIndex: 2,
        correctFeedback: "Right! Iron rises 22.3\u00b0C while water rises only 2.4\u00b0C. Same mass, same energy, wildly different temperature changes. The material matters \u2014 and that property is specific heat capacity.",
        wrongFeedback: "Think back to the numbers: water rose 2.4\u00b0C, iron rose 22.3\u00b0C. Same mass, same energy \u2014 the difference is the material itself." },

      // 3: pause
      { type: 'pause' },

      // 4: Name and define specific heat capacity
      { type: 'show', action: () => showSection('sec-52-define'),
        text: "This property has a name: specific heat capacity, written as lowercase c. It's the amount of energy needed to raise 1 gram of a substance by 1 degree Celsius. Units are joules per gram per degree C. Water has a specific heat of 4.18 — meaning you need 4.18 joules to raise just 1 gram by 1 degree. Iron is 0.449. Copper is 0.385. Aluminum is 0.897. Notice the pattern: water is enormously higher than all the metals. High c means the material resists temperature change — it's an energy sponge. Low c means temperature changes easily." },

      // 5: Why water has such high c — callback to 4.2
      { type: 'narrate',
        text: "But WHY does water have such a high specific heat? Remember lesson 4.2 — water has strong hydrogen bonds between its molecules. When you pour energy into water, a huge fraction of that energy goes into disrupting and stretching those hydrogen bonds instead of speeding up the molecules. Since temperature measures average kinetic energy — average speed — the temperature barely changes. The energy is being absorbed by the intermolecular forces. Metals don't have hydrogen bonds. Their metallic bonding is different — when you add energy, it goes almost directly into making atoms vibrate faster. So the temperature shoots up. Hydrogen bonds from 4.2 explain specific heat in 5.2. Everything connects." },

      // 6: Formalize — q = mcDT
      { type: 'show', action: () => showSection('sec-52-formula'),
        text: "Now let's formalize this into an equation. q equals m times c times delta T. q is the heat energy in joules — how much energy is transferred. m is the mass in grams. c is the specific heat capacity — the material's resistance to heating. And delta T is the temperature change: final temperature minus initial temperature. Why does the equation look like this? More mass means more particles to speed up, so you need more energy. Higher c means the material resists heating more, so you need more energy. Bigger delta T means a bigger temperature jump, so you need more energy. All three multiply together — double any one of them and you double the energy required." },

      // 7: Worked example
      { type: 'show', action: () => showSection('sec-52-worked'),
        text: "Let's work through a problem together. How much energy do you need to heat 200 grams of water from 20 degrees to 50 degrees Celsius? Step 1: identify the values. m is 200 grams. c for water is 4.18 joules per gram per degree C. Delta T is 50 minus 20, which equals 30 degrees. Step 2: plug into q equals m c delta T. q equals 200 times 4.18 times 30. That gives us 25,080 joules, or about 25.1 kilojoules. That's 25 thousand joules just to warm a glass of water by 30 degrees! Water is truly an energy sponge. Now it's your turn." },

      // 8: Quiz 2 — student calculates a similar problem
      { type: 'quiz',
        text: "Your turn to calculate. Use q = mc\u0394T.",
        question: "How much energy (in joules) is needed to heat 150 g of iron (c = 0.449) from 25\u00b0C to 75\u00b0C?",
        options: [
          "3,368 J",
          "6,735 J",
          "33,675 J",
          "449 J"
        ],
        correctIndex: 0,
        correctFeedback: "Correct! q = 150 \u00d7 0.449 \u00d7 50 = 3,367.5 J, which rounds to 3,368 J. Compare that to the 25,080 J we needed for water \u2014 iron needs way less energy for the same temperature change because its c is so much lower.",
        wrongFeedback: "Use q = m \u00d7 c \u00d7 \u0394T. m = 150 g, c = 0.449, \u0394T = 75 \u2212 25 = 50\u00b0C. Multiply them together." },

      // 9: pause
      { type: 'pause' },

      // 10: Sim intro
      { type: 'show', action: () => showSection('sec-52-sim'),
        text: "Time to see this in action. Here's a simulation where you can select different materials, adjust the mass with the slider, and click Add 1000 J to pour energy in. Watch the temperature readout and the particles. Try this: start with water, click Add 1000 J a few times, and notice how slowly the temperature climbs. Then switch to iron or copper and do the same thing. The temperature rockets up. That's specific heat in action — same energy, different materials, wildly different temperature responses." },

      // 11: Checkpoint — interact with sim
      { type: 'checkpoint',
        instruction: 'Click "Add 1000 J" at least 3 times to see the temperature change',
        text: "Go ahead — select a material and click Add 1000 J at least three times. Watch the temperature and particle speed change. Try switching between water and a metal to see the dramatic difference.",
        check: () => shViz?.renderer?.shEnergyAdded >= 3000,
        checkInterval: 500,
        confirmText: "See the difference? With water, 3000 joules barely raises the temperature. With iron or copper, the same 3000 joules causes a huge temperature jump. That's specific heat capacity in action — the c value determines how resistant a material is to temperature change." },

      // 12: pause
      { type: 'pause' },

      // 13: Reverse problem — rearranging the formula
      { type: 'show', action: () => showSection('sec-52-reverse'),
        text: "Now let's run the formula backwards. You can rearrange q equals m c delta T to solve for any variable. Here's a classic problem: 500 joules of energy raises 50 grams of an unknown metal by 11.1 degrees. What's its specific heat? Rearrange: c equals q divided by m times delta T. c equals 500 divided by 50 times 11.1, which is 500 divided by 555, which equals 0.90 joules per gram per degree C. Check the table — that's aluminum! You just identified a mystery metal using q equals m c delta T. This is actually how scientists identify unknown materials in the real world." },

      // 14: Quiz 3 — reverse problem for student
      { type: 'quiz',
        text: "Now you try a reverse problem.",
        question: "2000 J of energy raises 100 g of a mystery substance by 4.79\u00b0C. What is its specific heat, and what material is it?",
        options: [
          "c = 4.18 J/(g\u00b7\u00b0C) \u2014 Water",
          "c = 0.449 J/(g\u00b7\u00b0C) \u2014 Iron",
          "c = 0.897 J/(g\u00b7\u00b0C) \u2014 Aluminum",
          "c = 0.385 J/(g\u00b7\u00b0C) \u2014 Copper"
        ],
        correctIndex: 0,
        correctFeedback: "Yes! c = 2000 / (100 \u00d7 4.79) = 2000 / 479 = 4.18 J/(g\u00b7\u00b0C). That's water! Only water has such a high specific heat. You can identify materials by measuring how they respond to energy.",
        wrongFeedback: "Use c = q / (m \u00d7 \u0394T) = 2000 / (100 \u00d7 4.79). Calculate the result and compare it to the table of specific heats." },

      // 15: Quiz 4 — interleaved: combines c with molar mass from 4.4
      { type: 'quiz',
        text: "This one combines specific heat with molar mass from lesson 4.4.",
        question: "Water has molar mass 18 g/mol and c = 4.18 J/(g\u00b7\u00b0C). How much energy is needed to heat 1 mole (18 g) of water by 10\u00b0C?",
        options: [
          "41.8 J",
          "752.4 J",
          "4,180 J",
          "75.24 J"
        ],
        correctIndex: 1,
        correctFeedback: "Right! 1 mole of water = 18 g (from 4.4). q = 18 \u00d7 4.18 \u00d7 10 = 752.4 J. You just combined molar mass from 4.4 with specific heat from 5.2. See how everything builds on everything else?",
        wrongFeedback: "1 mole of water = 18 g (molar mass from lesson 4.4). Use q = m \u00d7 c \u00d7 \u0394T with m = 18 g, c = 4.18, \u0394T = 10\u00b0C." },

      // 16: pause
      { type: 'pause' },

      // 17: Materials science connection
      { type: 'show', action: () => showSection('sec-52-matters'),
        text: "Let's connect this to the real world, because specific heat capacity shows up everywhere in materials science. Thermal management in electronics: CPUs generate heat. Copper heatsinks have low c, so they heat up quickly to absorb heat from the chip, then conduct it away. Water cooling works because water absorbs enormous energy with barely any temperature rise. Why do metals feel cold to the touch? Two reasons: low specific heat means they change temperature fast, AND high thermal conductivity means heat leaves your hand quickly. Double whammy. Climate: oceans are water, c equals 4.18, so they absorb massive solar energy without heating much. Coastal cities have milder climates because the ocean is a temperature buffer." },

      // 18: Forward tease
      { type: 'show', action: () => showSection('sec-52-forward'),
        text: "You now own a quantitative tool: q equals m c delta T. You can calculate how much energy any material absorbs or releases for any temperature change. Next lesson, we'll put this formula to work inside a calorimeter — a device that measures the energy of actual chemical reactions. The idea is elegant: a reaction happens inside water. The water's temperature changes. You measure delta T, you know m and c for water, so you calculate q. And that q IS the energy of the reaction — that's how chemists measure delta H in the real world. See you in lesson 5.3!" },
    ];
  },
};
