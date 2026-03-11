/**
 * Lesson 4.4: The Mole & Stoichiometry
 *
 * Picks up from 4.3 (chemical reactions, balanced equations). Now: how do you
 * use balanced equations to predict actual amounts? Covers the mole concept,
 * Avogadro's number, molar mass, the mole map, stoichiometry calculations,
 * limiting reagent, and percent yield. Three interactive sims: mole converter,
 * stoichiometry step-by-step solver, and limiting reagent explorer.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';

// Import sim (self-registers)
import '../sims/stoichiometryViz.js';

export const lesson_4_4 = {
  id: '4.4',
  lessonId: 'lesson_4_4',
  title: 'The Mole & Stoichiometry',

  sections: [
    // --- RECAP & HOOK ---
    {
      id: 'sec-44-hook',
      blocks: [
        new TextBlock({ id: '44-hook-title', tag: 'h2', html: 'From Equations to Predictions' }),
        new CalloutBlock({ id: '44-hook-recap', html: '<strong>Where we are:</strong> You can write and balance chemical equations (4.3). You know that 2H₂ + O₂ → 2H₂O means atoms rearrange — the coefficients tell you the ratio. But so far, the equations just say <em>"2 molecules of this react with 1 molecule of that."</em><br><br>Problem: you can\'t count individual molecules. They\'re too small. You can\'t grab 2 molecules of hydrogen and 1 molecule of oxygen. In the real world, you measure things by <strong>mass</strong> — grams on a scale. So how do you go from a balanced equation to an actual amount you can weigh?' }),
        new TextBlock({ id: '44-hook-text', tag: 'p', html: "You need a <strong>bridge</strong> between the molecular world (where equations live) and the macroscopic world (where scales live). That bridge has a name: <strong>the mole</strong>." }),
      ]
    },

    // --- THE COUNTING PROBLEM ---
    {
      id: 'sec-44-counting',
      blocks: [
        new TextBlock({ id: '44-count-title', tag: 'h2', html: 'The Counting Problem' }),
        new TextBlock({ id: '44-count-text', tag: 'p', html: "Atoms are absurdly small. A single drop of water contains roughly <strong>1,500,000,000,000,000,000,000</strong> molecules — that's 1.5 sextillion. If you counted one molecule per second, it would take about 50 trillion years. The universe is only 13.8 billion years old." }),
        new CalloutBlock({ id: '44-count-analogy', html: '<strong>Analogy:</strong> We already use counting units for big numbers. A <strong>dozen</strong> = 12. A <strong>ream</strong> of paper = 500 sheets. A <strong>gross</strong> = 144. You don\'t say "give me 144 pencils" — you say "give me a gross." Chemistry needs the same thing, but for a number so huge it can bridge the gap between single atoms and grams you can hold.' }),
      ]
    },

    // --- THE MOLE ---
    {
      id: 'sec-44-mole',
      blocks: [
        new TextBlock({ id: '44-mole-title', tag: 'h2', html: 'The Mole' }),
        new CalloutBlock({ id: '44-mole-def', html: '<strong>One mole = 6.022 × 10²³ particles.</strong><br><br>That\'s Avogadro\'s number, named after Amedeo Avogadro. It\'s approximately 602,200,000,000,000,000,000,000.<br><br>A mole is just a <strong>counting unit</strong>. It works for anything:<br>• 1 mole of carbon atoms = 6.022 × 10²³ carbon atoms<br>• 1 mole of water molecules = 6.022 × 10²³ water molecules<br>• 1 mole of basketballs = 6.022 × 10²³ basketballs (would fill the solar system)' }),
        new MathBlock({ id: '44-mole-math', label: "Avogadro's Number:", equation: 'N_A = 6.022 × 10²³  mol⁻¹', symbols: [
          { symbol: 'N_A', name: "Avogadro's number", meaning: 'Number of particles in one mole' },
          { symbol: 'mol⁻¹', name: 'Per mole', meaning: 'This many particles for every mole' },
        ]}),
        new TextBlock({ id: '44-mole-why', tag: 'p', html: "<strong>Why this specific number?</strong> It was chosen so that 1 mole of any element weighs exactly its atomic mass in grams. That's the genius — and it's the bridge we need." }),
      ]
    },

    // --- MOLAR MASS ---
    {
      id: 'sec-44-molarmass',
      blocks: [
        new TextBlock({ id: '44-mm-title', tag: 'h2', html: 'Molar Mass — The Bridge' }),
        new CalloutBlock({ id: '44-mm-explain', html: '<strong>Molar mass</strong> is the mass of one mole of a substance, in grams per mole (g/mol).<br><br>The beautiful fact: the molar mass of an element in g/mol equals its atomic mass in amu (the number on the periodic table).<br><br>• Carbon: atomic mass = 12.01 amu → molar mass = <strong>12.01 g/mol</strong><br>• Oxygen: 16.00 amu → <strong>16.00 g/mol</strong><br>• Iron: 55.85 amu → <strong>55.85 g/mol</strong><br><br>For molecules, add up the atoms: H₂O = 2(1.01) + 16.00 = <strong>18.02 g/mol</strong>' }),
        new MathBlock({ id: '44-mm-math', label: 'Molar Mass:', equation: 'M = mass of one mole in grams', symbols: [
          { symbol: 'M', name: 'Molar mass', meaning: 'Grams per mole (g/mol) — look up atomic masses and add' },
          { symbol: 'n = m / M', name: 'Moles from mass', meaning: 'Divide grams by molar mass to get moles' },
          { symbol: 'm = n × M', name: 'Mass from moles', meaning: 'Multiply moles by molar mass to get grams' },
        ]}),
        new TextBlock({ id: '44-mm-bridge', tag: 'p', html: "This is the bridge: <strong>weigh something on a scale (grams) → divide by molar mass → get moles (a count of particles)</strong>. You can now go from something you can measure to something you can use in equations." }),
      ]
    },

    // --- MOLE MAP SIM ---
    {
      id: 'sec-44-molemap',
      blocks: [
        new TextBlock({ id: '44-map-title', tag: 'h2', html: 'The Mole Map — Try It Yourself' }),
        new TextBlock({ id: '44-map-text', tag: 'p', html: "Here's your conversion toolkit. Click any box and type a number — the other values update instantly. Try entering 18.02 grams of H₂O and see that it's exactly 1 mole. Then try different substances." }),
        new SimBlock({ id: '44-molemap-viz', sim: 'stoichiometryViz', width: 900, height: 420, simOptions: { mode: 'moleMap' } }),
      ]
    },

    // --- STOICHIOMETRY INTRO ---
    {
      id: 'sec-44-stoich-intro',
      blocks: [
        new TextBlock({ id: '44-si-title', tag: 'h2', html: 'Stoichiometry — Reading the Recipe' }),
        new CalloutBlock({ id: '44-si-explain', html: '<strong>Stoichiometry</strong> (stoy-kee-AH-meh-tree) is the math of chemical reactions. A balanced equation is a recipe — the coefficients tell you the <strong>mole ratios</strong>.<br><br><span style="font-family:monospace;font-size:15px">2H₂ + O₂ → 2H₂O</span><br><br>This means:<br>• 2 <strong>moles</strong> of H₂ react with 1 <strong>mole</strong> of O₂<br>• to produce 2 <strong>moles</strong> of H₂O<br>• The ratio is always 2 : 1 : 2<br><br>Not 2 grams! Not 2 liters! <strong>2 moles.</strong> Coefficients are mole ratios.' }),
        new TableBlock({ id: '44-si-table', maxWidth: '850px',
          headers: ['What you read', 'What it means', 'In moles'],
          rows: [
            ['2H₂', '2 molecules of hydrogen gas', '2 mol H₂ = 4.03 g'],
            ['O₂', '1 molecule of oxygen gas', '1 mol O₂ = 32.00 g'],
            ['→', 'yields (transforms into)', '—'],
            ['2H₂O', '2 molecules of water', '2 mol H₂O = 36.04 g'],
          ]
        }),
      ]
    },

    // --- STOICH PROBLEM SOLVING SIM ---
    {
      id: 'sec-44-stoich-solve',
      blocks: [
        new TextBlock({ id: '44-ss-title', tag: 'h2', html: 'Stoichiometry in Action' }),
        new TextBlock({ id: '44-ss-text', tag: 'p', html: 'The classic question: <em>"How many grams of water can I make from 10 grams of hydrogen gas?"</em> Watch the four-step chain: <strong>grams → moles → mole ratio → grams of product</strong>. Drag the slider to change the input and see every step update live.' }),
        new SimBlock({ id: '44-stoich-viz', sim: 'stoichiometryViz', width: 900, height: 420, simOptions: { mode: 'stoich' } }),
      ]
    },

    // --- STOICH RECIPE ---
    {
      id: 'sec-44-recipe',
      blocks: [
        new TextBlock({ id: '44-recipe-title', tag: 'h2', html: 'The Four-Step Recipe' }),
        new CalloutBlock({ id: '44-recipe-steps', html: '<strong>Every stoichiometry problem follows the same four steps:</strong><br><br>1. <span style="color:#ffa726"><strong>Start with grams</strong></span> of your known substance<br>2. <span style="color:#00d4ff"><strong>Convert to moles</strong></span> by dividing by molar mass<br>3. <span style="color:#ab47bc"><strong>Apply the mole ratio</strong></span> from the balanced equation<br>4. <span style="color:#81c784"><strong>Convert to grams</strong></span> of the desired substance by multiplying by its molar mass<br><br><strong>grams known → moles known → moles wanted → grams wanted</strong><br><br>This pattern works for ANY stoichiometry problem. Learn it once, use it forever.' }),
        new MathBlock({ id: '44-recipe-math', label: 'The stoichiometry chain:', equation: 'grams_A  ×  (1 / M_A)  ×  (coeff_B / coeff_A)  ×  M_B  =  grams_B', symbols: [
          { symbol: 'grams_A', name: 'Given mass', meaning: 'Mass of the substance you start with' },
          { symbol: 'M_A', name: 'Molar mass of A', meaning: 'Converts grams to moles' },
          { symbol: 'coeff_B / coeff_A', name: 'Mole ratio', meaning: 'From balanced equation coefficients' },
          { symbol: 'M_B', name: 'Molar mass of B', meaning: 'Converts moles back to grams' },
        ]}),
      ]
    },

    // --- LIMITING REAGENT ---
    {
      id: 'sec-44-limiting',
      blocks: [
        new TextBlock({ id: '44-lim-title', tag: 'h2', html: 'Limiting Reagent' }),
        new CalloutBlock({ id: '44-lim-explain', html: '<strong>The sandwich analogy:</strong> You have 10 slices of bread and 8 slices of cheese. Each sandwich needs 2 slices of bread and 1 slice of cheese. You can make 5 sandwiches (using all 10 bread slices). You have 3 leftover cheese slices. <strong>Bread is the limiting reagent</strong> — it runs out first and determines how many sandwiches you can make.<br><br>Same idea in chemistry: if your reactants aren\'t in the perfect mole ratio, one runs out first. That\'s the <strong>limiting reagent</strong> — it determines how much product you can make. The other reactant is in <strong>excess</strong>.' }),
        new TextBlock({ id: '44-lim-text', tag: 'p', html: 'For 2H₂ + O₂ → 2H₂O: the equation needs 2 moles H₂ for every 1 mole O₂. If you have 6 mol H₂ and 2 mol O₂, the H₂ needs 3 mol O₂ but you only have 2. So O₂ limits! You make 4 mol H₂O (from 2 mol O₂), with 2 mol H₂ left over.' }),
        new SimBlock({ id: '44-limiting-viz', sim: 'stoichiometryViz', width: 900, height: 420, simOptions: { mode: 'limiting' } }),
      ]
    },

    // --- PERCENT YIELD ---
    {
      id: 'sec-44-yield',
      blocks: [
        new TextBlock({ id: '44-yield-title', tag: 'h2', html: 'Percent Yield — Theory vs Reality' }),
        new CalloutBlock({ id: '44-yield-explain', html: '<strong>Theoretical yield</strong> is the maximum product you\'d get if everything reacted perfectly — the number stoichiometry predicts.<br><br><strong>Actual yield</strong> is what you really get in the lab. It\'s almost always less, because:<br>• Some product spills or sticks to equipment<br>• Side reactions produce unwanted byproducts<br>• The reaction doesn\'t go to completion<br>• You lose some during purification' }),
        new MathBlock({ id: '44-yield-math', label: 'Percent Yield:', equation: '% Yield = (Actual yield / Theoretical yield) × 100%', symbols: [
          { symbol: 'Actual yield', name: 'What you got', meaning: 'Mass of product actually collected in lab' },
          { symbol: 'Theoretical yield', name: 'What math predicts', meaning: 'Maximum possible from stoichiometry' },
          { symbol: '% Yield', name: 'Efficiency', meaning: '100% = perfect. Real reactions: often 60-95%' },
        ]}),
        new TextBlock({ id: '44-yield-example', tag: 'p', html: '<strong>Example:</strong> Stoichiometry says you should get 90 g of product. You actually collect 72 g. Percent yield = (72 / 90) × 100% = <strong>80%</strong>. That\'s a respectable yield for a lab reaction. Pharmaceutical companies optimize for years to push yields above 90%.' }),
      ]
    },

    // --- BIG PICTURE ---
    {
      id: 'sec-44-bigpicture',
      blocks: [
        new TextBlock({ id: '44-big-title', tag: 'h2', html: 'The Complete Quantitative Chain' }),
        new CalloutBlock({ id: '44-big-summary', html: 'You can now go all the way from a balanced equation to a real prediction:<br><br><strong>4.3:</strong> Write and balance the equation (atom conservation)<br><strong>4.4:</strong> Use molar mass to convert grams ↔ moles<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Use mole ratios to connect reactants to products<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Identify the limiting reagent<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Calculate theoretical and percent yield<br><br>This is how chemists plan experiments. This is how pharmaceutical companies manufacture drugs. This is how rocket engineers calculate fuel loads. <strong>Stoichiometry is the quantitative backbone of all chemistry.</strong>' }),
      ]
    },

    // --- FORWARD ---
    {
      id: 'sec-44-forward',
      blocks: [
        new TextBlock({ id: '44-fwd-title', tag: 'h2', html: "What's Next" }),
        new TextBlock({ id: '44-fwd-text', tag: 'p', html: "Now that you can make quantitative predictions from chemical equations, we can explore <strong>solutions and concentration</strong> — what happens when substances dissolve in water. You'll learn about molarity, dilutions, and why concentration matters for reaction speed and biological processes. Chemistry is about to get practical." }),
      ]
    },
  ],

  // stepMeta count MUST match the number of entries returned by buildSteps.
  // Each non-null entry is a progress bar node. null = separator.
  // Total: 33 steps (0-32)
  stepMeta: [
    { icon: '🔄', label: 'Recap', kind: 'narrate' },          // 0
    null,                                                        // 1
    { icon: '🔢', label: 'Counting', kind: 'narrate' },         // 2
    { icon: '🧮', label: 'Scale', kind: 'narrate' },            // 3
    null,                                                        // 4
    { icon: '⚗️', label: 'The Mole', kind: 'narrate' },         // 5
    { icon: '📐', label: 'Avogadro', kind: 'narrate' },         // 6
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },               // 7
    null,                                                        // 8
    { icon: '⚖️', label: 'Molar Mass', kind: 'narrate' },       // 9
    { icon: '🌉', label: 'Bridge', kind: 'narrate' },            // 10
    null,                                                        // 11
    { icon: '🗺️', label: 'Mole Map', kind: 'narrate' },         // 12
    { icon: '🎮', label: 'Convert!', kind: 'checkpoint' },       // 13
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },               // 14
    null,                                                        // 15
    { icon: '📋', label: 'Stoich', kind: 'narrate' },            // 16
    { icon: '📊', label: 'Ratios', kind: 'narrate' },            // 17
    null,                                                        // 18
    { icon: '🔬', label: 'In Action', kind: 'narrate' },         // 19
    { icon: '🎮', label: 'Solve!', kind: 'checkpoint' },         // 20
    { icon: '📝', label: 'Recipe', kind: 'narrate' },            // 21
    { icon: '❓', label: 'Quiz 3', kind: 'quiz' },               // 22
    null,                                                        // 23
    { icon: '🥪', label: 'Limiting', kind: 'narrate' },          // 24
    { icon: '🎮', label: 'Explore', kind: 'checkpoint' },        // 25
    { icon: '❓', label: 'Quiz 4', kind: 'quiz' },               // 26
    null,                                                        // 27
    { icon: '📊', label: 'Yield', kind: 'narrate' },             // 28
    { icon: '📐', label: 'Math', kind: 'narrate' },              // 29
    null,                                                        // 30
    { icon: '🔗', label: 'Big picture', kind: 'narrate' },       // 31
    { icon: '🎉', label: 'Done!', kind: 'narrate' },             // 32
  ],

  buildSteps(showSection, runner) {
    const moleMapViz = runner.blockInstances.find(b => b.id === '44-molemap-viz');
    const stoichViz = runner.blockInstances.find(b => b.id === '44-stoich-viz');
    const limitingViz = runner.blockInstances.find(b => b.id === '44-limiting-viz');

    // 33 steps total (0–32) — must match stepMeta length (33)
    return [
      // 0: Hook & recap
      { type: 'show', action: () => showSection('sec-44-hook'),
        text: "Welcome to lesson 4.4. In the last lesson, you learned to write and balance chemical equations. You know that 2 H 2 plus O 2 yields 2 H 2 O, and you know the coefficients represent the ratio. But there's a problem. Equations talk about molecules — but you can't count individual molecules. They're way too small. In the real world, you measure things by mass — grams on a scale. So how do you go from a balanced equation to an actual amount you can weigh? You need a bridge between the molecular world and the macroscopic world. That bridge is called the mole." },

      // 1: pause
      { type: 'pause' },

      // 2: The counting problem
      { type: 'show', action: () => showSection('sec-44-counting'),
        text: "Let's understand why we need a special counting unit. Atoms and molecules are absurdly small. A single drop of water — just one drop from an eyedropper — contains roughly 1.5 sextillion molecules. That's a 1 followed by 21 zeros. If you tried to count them one per second, it would take 50 trillion years. The universe is only 13.8 billion years old. Clearly, counting individual molecules is not going to work." },

      // 3: Counting unit analogy
      { type: 'narrate',
        text: "But we already solve this kind of problem in everyday life. We use counting units. A dozen equals 12 — you don't say 12 eggs, you say a dozen eggs. A ream of paper is 500 sheets. A gross is 144. Chemistry needs the same trick, but for a number so incredibly large that it bridges the gap between single atoms and grams you can hold in your hand." },

      // 4: pause
      { type: 'pause' },

      // 5: The mole definition
      { type: 'show', action: () => showSection('sec-44-mole'),
        text: "Here it is: one mole equals 6.022 times 10 to the 23rd particles. That number is called Avogadro's number, named after the Italian scientist Amedeo Avogadro. Written out, it's approximately 602 sextillion. A mole is just a counting unit — like a dozen, but instead of 12, it's 6.022 times 10 to the 23rd. And it works for anything: one mole of carbon atoms is 6.022 times 10 to the 23rd carbon atoms. One mole of water molecules is 6.022 times 10 to the 23rd water molecules. One mole of basketballs would fill the entire solar system." },

      // 6: Why this number
      { type: 'narrate',
        text: "Why this specific number and not some rounder number? Because of a beautiful design choice: Avogadro's number was chosen so that one mole of any element weighs exactly its atomic mass in grams. Carbon's atomic mass is 12.01 A M U. One mole of carbon weighs 12.01 grams. Oxygen is 16.00 A M U. One mole of oxygen atoms weighs 16.00 grams. The number connects the atomic scale to the human scale. This is the bridge we've been looking for." },

      // 7: Quiz 1
      { type: 'quiz',
        text: "Quick check on the mole concept.",
        question: "What is one mole?",
        options: [
          "A unit of mass equal to 1 gram",
          "A counting unit equal to 6.022 × 10²³ particles",
          "The number of atoms in one gram of any element",
          "A unit of volume for gases"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! A mole is a counting unit — just like a dozen means 12, a mole means 6.022 × 10²³. It works for atoms, molecules, ions — any kind of particle.",
        wrongFeedback: "A mole is a counting unit, not a unit of mass or volume. Think of it like 'a dozen' but for a much larger number. How many particles are in one mole?" },

      // 8: pause
      { type: 'pause' },

      // 9: Molar mass
      { type: 'show', action: () => showSection('sec-44-molarmass'),
        text: "Now for the bridge itself: molar mass. The molar mass of a substance is the mass of one mole of that substance, measured in grams per mole. And here's the beautiful part: for any element, the molar mass in grams per mole equals its atomic mass in A M U — the number you find on the periodic table. Carbon: 12.01 A M U on the table, so 12.01 grams per mole. Iron: 55.85 A M U, so 55.85 grams per mole. For molecules, just add up the atoms. H 2 O: 2 times 1.01 for hydrogen plus 16.00 for oxygen equals 18.02 grams per mole." },

      // 10: The bridge connection
      { type: 'narrate',
        text: "This is the conversion that makes all of chemistry quantitative. You weigh something on a scale — that gives you grams. You divide by the molar mass — that gives you moles. And moles is a count of particles — so now you know exactly how many molecules you have. The formula is simple: moles equals mass divided by molar mass. Or rearranged: mass equals moles times molar mass. These two conversions let you move freely between the world of grams and the world of molecules." },

      // 11: pause
      { type: 'pause' },

      // 12: Mole Map sim
      { type: 'show', action: () => showSection('sec-44-molemap'),
        text: "Here's the mole map — your conversion toolkit. You can convert between grams, moles, and particles. Click on any box and type a number to see the other values update instantly. Start by clicking the grams box and typing 18.02. Since the molar mass of water is 18.02 grams per mole, you should see exactly 1 mole and 6.022 times 10 to the 23rd particles. Then try switching substances and exploring." },

      // 13: Checkpoint — use the mole map
      { type: 'checkpoint',
        instruction: 'Click a box on the Mole Map and try converting a value. Change the substance too!',
        text: "Go ahead and explore the converter. Try entering different values — start with grams and see the moles and particles. Then click a different substance like C O 2 or iron. Notice how the molar mass changes the conversion. 18 grams of water is 1 mole, but 18 grams of iron is only about 0.32 moles because iron is heavier per atom.",
        check: () => moleMapViz?.renderer?.moleMapInteracted === true,
        checkInterval: 500,
        confirmText: "Great! You can see how grams, moles, and particles are all connected through molar mass. This three-way conversion is the foundation of every calculation in chemistry." },

      // 14: Quiz 2
      { type: 'quiz',
        text: "Let's check your molar mass understanding.",
        question: "How many moles are in 44.01 grams of CO₂? (Molar mass of CO₂ = 44.01 g/mol)",
        options: [
          "0.5 moles",
          "1 mole",
          "2 moles",
          "44.01 moles"
        ],
        correctIndex: 1,
        correctFeedback: "Perfect! 44.01 g ÷ 44.01 g/mol = exactly 1 mole. When the mass in grams equals the molar mass, you always have exactly 1 mole. That's the whole point of molar mass!",
        wrongFeedback: "Use the formula: moles = grams ÷ molar mass. What's 44.01 ÷ 44.01?" },

      // 15: pause
      { type: 'pause' },

      // 16: Stoichiometry intro
      { type: 'show', action: () => showSection('sec-44-stoich-intro'),
        text: "Now for the payoff: stoichiometry. Pronounced stoy-kee-AH-meh-tree. It comes from Greek words meaning 'measuring elements.' A balanced equation is a recipe, and the coefficients are mole ratios. Look at 2 H 2 plus O 2 yields 2 H 2 O. This says: 2 moles of hydrogen gas react with 1 mole of oxygen gas to produce 2 moles of water. The ratio is always 2 to 1 to 2. Not 2 grams! Not 2 liters! 2 moles. This is critical: coefficients give you mole ratios." },

      // 17: Mole ratio detail
      { type: 'narrate',
        text: "Let's be really precise about what the equation tells us. 2 moles of H 2 weigh 4.03 grams — that's 2 times 2.016. 1 mole of O 2 weighs 32.00 grams. 2 moles of H 2 O weigh 36.04 grams — that's 2 times 18.02. So you need only 4 grams of hydrogen but 32 grams of oxygen to make 36 grams of water. The gram amounts are very different even though the mole ratio is simple. That's why you must always work in moles first, then convert to grams." },

      // 18: pause
      { type: 'pause' },

      // 19: Stoich sim
      { type: 'show', action: () => showSection('sec-44-stoich-solve'),
        text: "Here's stoichiometry in action with a classic problem: how many grams of water can you make from a given mass of hydrogen gas? Watch the four-step chain: grams of H 2, divide by molar mass to get moles of H 2, apply the mole ratio to get moles of H 2 O, then multiply by the molar mass of water to get grams of H 2 O. Drag the slider to change the starting amount and watch every step update live." },

      // 20: Checkpoint — use stoich
      { type: 'checkpoint',
        instruction: 'Drag the slider to set 10 g of H₂ and watch the calculation chain.',
        text: "Try it out. Drag the slider to about 10 grams of hydrogen. You should see: 10 grams divided by 2.016 gives about 4.96 moles of H 2. The mole ratio is 1 to 1 since both coefficients are 2. So 4.96 moles of H 2 O, times 18.02 grams per mole, gives about 89.4 grams of water. From just 10 grams of hydrogen! That's because water is mostly oxygen by mass.",
        check: () => stoichViz?.renderer?.stoichInteracted === true,
        checkInterval: 500,
        confirmText: "Excellent! See how the four steps work like a chain? Grams to moles, mole ratio, moles to grams. This same pattern works for every stoichiometry problem you'll ever encounter." },

      // 21: Recipe summary
      { type: 'show', action: () => showSection('sec-44-recipe'),
        text: "Let me give you the universal recipe. Every stoichiometry problem follows these four steps. Step 1: start with grams of your known substance. Step 2: convert to moles by dividing by its molar mass. Step 3: apply the mole ratio from the balanced equation. Step 4: convert to grams of the desired substance by multiplying by its molar mass. Grams known, moles known, moles wanted, grams wanted. Learn this pattern once, use it forever." },

      // 22: Quiz 3
      { type: 'quiz',
        text: "Test your stoichiometry skills.",
        question: "In 2H₂ + O₂ → 2H₂O, if you start with 4 grams of H₂ (molar mass 2.016 g/mol), how many moles of H₂O can you make?",
        options: [
          "About 1 mole",
          "About 2 moles",
          "About 4 moles",
          "About 8 moles"
        ],
        correctIndex: 1,
        correctFeedback: "Right! 4g ÷ 2.016 g/mol ≈ 1.98 mol H₂. The mole ratio of H₂ to H₂O is 2:2 = 1:1. So you get about 1.98 mol H₂O ≈ 2 moles. The four-step chain works!",
        wrongFeedback: "Follow the chain: 4g ÷ 2.016 g/mol ≈ 2 mol H₂. Mole ratio 2H₂ : 2H₂O = 1:1. So how many moles of H₂O?" },

      // 23: pause
      { type: 'pause' },

      // 24: Limiting reagent
      { type: 'show', action: () => showSection('sec-44-limiting'),
        text: "Now, what happens when your reactants aren't in the perfect ratio? One reactant will run out first — that's the limiting reagent. Think of making sandwiches. If you have 10 slices of bread and 8 slices of cheese, and each sandwich needs 2 bread plus 1 cheese, you can only make 5 sandwiches. You run out of bread first. Bread is the limiting reagent. The leftover cheese is in excess. Same thing in chemistry: the reactant that runs out first determines how much product you can make." },

      // 25: Limiting checkpoint
      { type: 'checkpoint',
        instruction: 'Drag both sliders on the limiting reagent sim to see which reactant limits.',
        text: "Try the explorer. Set H 2 to 6 moles and O 2 to 2 moles. The reaction needs 2 H 2 for every 1 O 2. So 6 moles of H 2 would need 3 moles of O 2, but you only have 2. O 2 is limiting! You can only make 4 moles of water, and 2 moles of H 2 are left over. Try different combinations and watch which one limits.",
        check: () => limitingViz?.renderer?.limitInteracted === true,
        checkInterval: 500,
        confirmText: "You can see it: whichever reactant runs out first is the limiting reagent. The faded molecules are consumed and the bright ones are leftover excess. The limiting reagent controls the maximum product." },

      // 26: Quiz 4
      { type: 'quiz',
        text: "Check your understanding of limiting reagent.",
        question: "For 2H₂ + O₂ → 2H₂O: if you have 4 mol H₂ and 4 mol O₂, which is limiting?",
        options: [
          "H₂ — it has fewer moles",
          "O₂ — it needs more to react",
          "H₂ — you need 2 mol H₂ per 1 mol O₂, so 4 mol H₂ only pairs with 2 mol O₂",
          "Neither — they're equal"
        ],
        correctIndex: 2,
        correctFeedback: "Correct! The ratio is 2H₂ : 1O₂. 4 mol H₂ needs only 2 mol O₂. You have 4 mol O₂ — plenty! H₂ is limiting. You make 4 mol H₂O with 2 mol O₂ left over. Always compare using the mole ratio, not just the raw number of moles.",
        wrongFeedback: "Don't just compare mole counts directly! Use the ratio from the equation. 2H₂ : 1O₂ means each mole of O₂ needs 2 moles of H₂. With 4 mol H₂, how much O₂ do you need?" },

      // 27: pause
      { type: 'pause' },

      // 28: Percent yield
      { type: 'show', action: () => showSection('sec-44-yield'),
        text: "One more concept: percent yield. Stoichiometry tells you the theoretical yield — the maximum product you'd get if everything reacted perfectly. But real labs aren't perfect. Some product spills. Side reactions produce unwanted byproducts. The reaction might not go to completion. So the actual yield — what you actually collect — is almost always less than the theoretical yield." },

      // 29: Yield math
      { type: 'narrate',
        text: "The formula is simple: percent yield equals actual yield divided by theoretical yield, times 100 percent. If stoichiometry predicts 90 grams but you collect 72 grams, your percent yield is 72 over 90 times 100, which is 80 percent. That's actually pretty good for most lab reactions. Pharmaceutical companies spend years optimizing synthesis routes to push yields above 90 percent, because even a small improvement means millions of dollars in savings when you're making tons of a drug." },

      // 30: pause
      { type: 'pause' },

      // 31: Big picture
      { type: 'show', action: () => showSection('sec-44-bigpicture'),
        text: "Let's zoom out. Look at what you can do now. From lesson 4.3 you can write and balance chemical equations. Now from 4.4 you can convert grams to moles using molar mass, use mole ratios from the balanced equation to connect reactants to products, identify which reagent is limiting, and calculate theoretical and percent yield. This is the quantitative backbone of chemistry. This is how chemists plan experiments, how pharmaceutical companies manufacture drugs, and how rocket engineers calculate fuel loads. You've just unlocked the ability to make real predictions from equations." },

      // 32: Forward
      { type: 'show', action: () => showSection('sec-44-forward'),
        text: "Outstanding work! You've completed lesson 4.4 on the mole and stoichiometry. You understand Avogadro's number, molar mass, the mole map, stoichiometry calculations, limiting reagents, and percent yield. Chemistry is now fully quantitative. Coming up: solutions and concentration — what happens when substances dissolve in water, and how concentration affects reactions and biological processes. See you there!" },
    ];
  },
};
