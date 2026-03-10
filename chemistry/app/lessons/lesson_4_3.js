/**
 * Lesson 4.3: Chemical Reactions
 *
 * Picks up from 4.2 (molecular shape & IMFs). Now: what happens when bonds
 * break and new bonds form? Covers what a reaction is, conservation of mass,
 * chemical equations, balancing, exo/endothermic energy, activation energy,
 * and reaction rates. Three interactive sims: collision animation, interactive
 * balancer, and exo/endo energy diagram.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';

// Import sim (self-registers)
import '../sims/reactionViz.js';

export const lesson_4_3 = {
  id: '4.3',
  lessonId: 'lesson_4_3',
  title: 'Chemical Reactions',

  sections: [
    // --- RECAP & HOOK ---
    {
      id: 'sec-43-hook',
      blocks: [
        new TextBlock({ id: '43-hook-title', tag: 'h2', html: 'From Structure to Action' }),
        new CalloutBlock({ id: '43-hook-recap', html: '<strong>Where we are:</strong> You know how atoms bond (4.1) — ionic, covalent, metallic. You know that molecular shape determines polarity and intermolecular forces (4.2), which explains boiling point and material properties. But so far, everything has been <em>static</em> — molecules sitting still. Now: what happens when molecules <strong>collide</strong> and <strong>rearrange</strong>?' }),
        new TextBlock({ id: '43-hook-text', tag: 'p', html: "When you light a match, iron rusts, or your body digests food — old bonds <strong>break</strong> and new bonds <strong>form</strong>. The atoms don't disappear. They <em>rearrange</em>. That's a <strong>chemical reaction</strong>." }),
      ]
    },

    // --- WHAT IS A REACTION ---
    {
      id: 'sec-43-what',
      blocks: [
        new TextBlock({ id: '43-what-title', tag: 'h2', html: 'What Is a Chemical Reaction?' }),
        new CalloutBlock({ id: '43-what-key', html: '<strong>The key insight:</strong> In a chemical reaction, atoms rearrange into new combinations. No atoms are created or destroyed — every atom that enters a reaction comes out the other side.<br><br>This is the <strong>Law of Conservation of Mass</strong>, proven by Antoine Lavoisier in the 1770s. He weighed everything before and after reactions and showed the total mass never changes.' }),
        new MathBlock({ id: '43-what-math', label: 'Conservation of Mass:', equation: 'Total mass of reactants = Total mass of products', symbols: [
          { symbol: 'Reactants', name: 'Starting materials', meaning: 'Substances you begin with (left side of equation)' },
          { symbol: 'Products', name: 'New substances', meaning: 'Substances formed by the reaction (right side of equation)' },
        ]}),
      ]
    },

    // --- COLLISION VIZ ---
    {
      id: 'sec-43-collision',
      blocks: [
        new TextBlock({ id: '43-coll-title', tag: 'h2', html: 'Watching a Reaction Happen' }),
        new TextBlock({ id: '43-coll-text', tag: 'p', html: "Watch this: hydrogen gas (H₂) reacts with chlorine gas (Cl₂) to form hydrogen chloride (HCl). The old H—H and Cl—Cl bonds break, and new H—Cl bonds form. Same atoms, completely different molecules:" }),
        new SimBlock({ id: '43-collision-viz', sim: 'reactionViz', width: 900, height: 420, simOptions: { mode: 'collision' } }),
      ]
    },

    // --- CHEMICAL EQUATIONS ---
    {
      id: 'sec-43-equations',
      blocks: [
        new TextBlock({ id: '43-eq-title', tag: 'h2', html: 'Chemical Equations' }),
        new TextBlock({ id: '43-eq-text', tag: 'p', html: "We write reactions as <strong>chemical equations</strong>. Reactants on the left, an arrow meaning \"yields,\" products on the right:" }),
        new MathBlock({ id: '43-eq-example', label: 'Hydrogen burns in oxygen to form water:', equation: '2H₂ + O₂ → 2H₂O', symbols: [
          { symbol: '2H₂', name: 'Coefficient + formula', meaning: '2 molecules of H₂ = 4 hydrogen atoms total' },
          { symbol: 'O₂', name: '1 molecule of oxygen', meaning: '2 oxygen atoms' },
          { symbol: '→', name: 'Yields', meaning: 'Reactants transform into products' },
          { symbol: '2H₂O', name: '2 molecules of water', meaning: '4 H + 2 O — same atoms, new arrangement' },
        ]}),
        new CalloutBlock({ id: '43-eq-count', html: 'Count the atoms: <strong>Left:</strong> 4 H + 2 O. <strong>Right:</strong> 4 H + 2 O. Same atoms in, same atoms out. The equation is <strong>balanced</strong>.<br><br><strong>Coefficients</strong> (big numbers in front) = how many molecules<br><strong>Subscripts</strong> (small numbers in formula) = how many atoms per molecule<br><br>You can change coefficients to balance. Never change subscripts — that changes the molecule itself!' }),
      ]
    },

    // --- INTERACTIVE BALANCER ---
    {
      id: 'sec-43-balance',
      blocks: [
        new TextBlock({ id: '43-bal-title', tag: 'h2', html: 'Balance It Yourself' }),
        new TextBlock({ id: '43-bal-text', tag: 'p', html: "Use the + and − buttons to adjust coefficients until every element has the same count on both sides. Try balancing methane combustion: CH₄ + O₂ → CO₂ + H₂O" }),
        new SimBlock({ id: '43-balance-viz', sim: 'reactionViz', width: 900, height: 420, simOptions: { mode: 'balance' } }),
      ]
    },

    // --- BALANCING STRATEGY ---
    {
      id: 'sec-43-strategy',
      blocks: [
        new TextBlock({ id: '43-strat-title', tag: 'h2', html: 'The Balancing Strategy' }),
        new CalloutBlock({ id: '43-strat-explain', html: '<strong>Step-by-step method:</strong><br><br>1. Write the unbalanced equation: CH₄ + O₂ → CO₂ + H₂O<br>2. Pick one element at a time:<br>&nbsp;&nbsp;• Carbon: 1 on each side ✓<br>&nbsp;&nbsp;• Hydrogen: 4 on left, 2 on right ✗ → put <strong style="color:var(--accent)">2</strong> in front of H₂O<br>&nbsp;&nbsp;• Now oxygen: CO₂ has 2, 2H₂O has 2 = 4 total on right. Need 4 on left → put <strong style="color:var(--accent)">2</strong> in front of O₂<br>3. Final check: CH₄ + 2O₂ → CO₂ + 2H₂O → 1C, 4H, 4O on each side ✓<br><br><strong>Rule:</strong> Only change coefficients (the big numbers in front). Never change subscripts — H₂O is water, H₂O₂ is hydrogen peroxide!' }),
      ]
    },

    // --- REACTION TYPES ---
    {
      id: 'sec-43-types',
      blocks: [
        new TextBlock({ id: '43-types-title', tag: 'h2', html: 'Five Types of Reactions' }),
        new TextBlock({ id: '43-types-text', tag: 'p', html: "Most reactions fall into five patterns. Recognizing the pattern helps you predict products:" }),
        new TableBlock({ id: '43-types-table', maxWidth: '950px',
          headers: ['Type', 'Pattern', 'Example', 'Key idea'],
          rows: [
            [{ text: 'Synthesis', style: 'color:var(--green);font-weight:bold' }, 'A + B → AB', '2Na + Cl₂ → 2NaCl', 'Small things combine into one'],
            [{ text: 'Decomposition', style: 'color:var(--red);font-weight:bold' }, 'AB → A + B', '2H₂O₂ → 2H₂O + O₂', 'One thing breaks apart'],
            [{ text: 'Single replacement', style: 'color:var(--accent);font-weight:bold' }, 'A + BC → AC + B', 'Zn + CuSO₄ → ZnSO₄ + Cu', 'One element kicks another out'],
            [{ text: 'Double replacement', style: 'color:var(--orange);font-weight:bold' }, 'AB + CD → AD + CB', 'NaCl + AgNO₃ → AgCl↓ + NaNO₃', 'Two compounds swap partners'],
            [{ text: 'Combustion', style: 'color:#ff6f00;font-weight:bold' }, 'Fuel + O₂ → CO₂ + H₂O', 'CH₄ + 2O₂ → CO₂ + 2H₂O', 'Burns in oxygen'],
          ]
        }),
      ]
    },

    // --- ENERGY ---
    {
      id: 'sec-43-energy',
      blocks: [
        new TextBlock({ id: '43-nrg-title', tag: 'h2', html: 'Energy in Reactions' }),
        new TextBlock({ id: '43-nrg-text', tag: 'p', html: "Every reaction involves energy. Breaking bonds <strong>costs</strong> energy. Forming bonds <strong>releases</strong> energy. The balance determines whether the reaction heats up or cools down:" }),
        new SimBlock({ id: '43-energy-viz', sim: 'reactionViz', width: 900, height: 420, simOptions: { mode: 'energy' } }),
        new CalloutBlock({ id: '43-nrg-explain', html: '<strong>Exothermic</strong> (ΔH < 0): Energy released by new bonds > energy to break old bonds.<br>Releases heat. Products are lower energy = more stable.<br>Examples: combustion, rusting, neutralization.<br><br><strong>Endothermic</strong> (ΔH > 0): Energy to break old bonds > energy released by new bonds.<br>Absorbs heat. Must supply energy to keep going.<br>Examples: photosynthesis, cooking an egg, cold packs.' }),
        new MathBlock({ id: '43-nrg-math', label: 'Enthalpy change:', equation: 'ΔH = H_products − H_reactants', symbols: [
          { symbol: 'ΔH < 0', name: 'Exothermic', meaning: 'Products lower energy → heat flows out → feels hot' },
          { symbol: 'ΔH > 0', name: 'Endothermic', meaning: 'Products higher energy → heat flows in → feels cold' },
        ]}),
      ]
    },

    // --- ACTIVATION ENERGY ---
    {
      id: 'sec-43-activation',
      blocks: [
        new TextBlock({ id: '43-act-title', tag: 'h2', html: "Activation Energy: Why Wood Doesn't Spontaneously Combust" }),
        new CalloutBlock({ id: '43-act-explain', html: '<strong>Activation energy (Eₐ)</strong> is the minimum energy molecules need to start reacting.<br><br>Think of pushing a boulder over a hill. Even if the other side is lower (exothermic), you must push it over the top first. That peak is the <strong>transition state</strong> — where old bonds are partially broken and new bonds are partially formed.<br><br>• A match provides Eₐ for wood combustion<br>• A spark provides Eₐ for gasoline ignition<br>• Body temperature + enzymes provide Eₐ for metabolic reactions' }),
        new CalloutBlock({ id: '43-cat-explain', html: '<strong>Catalysts</strong> lower the activation energy without being consumed. They provide a shortcut over a lower hill. Same reaction, same energy change — just easier to start.<br><br>• <strong>Enzymes</strong> are biological catalysts — they make reactions happen at 37°C that would otherwise need hundreds of degrees<br>• <strong>Catalytic converters</strong> in cars convert toxic exhaust to harmless gases<br>• Without enzymes, you couldn\'t digest food, replicate DNA, or think' }),
      ]
    },

    // --- REACTION RATES ---
    {
      id: 'sec-43-rates',
      blocks: [
        new TextBlock({ id: '43-rates-title', tag: 'h2', html: 'What Controls Reaction Speed?' }),
        new TableBlock({ id: '43-rates-table', maxWidth: '900px',
          headers: ['Factor', 'Effect', 'Why?', 'Real example'],
          rows: [
            [{ text: 'Temperature ↑', style: 'color:var(--red);font-weight:bold' }, 'Faster', 'More energy → more collisions above Eₐ', 'Food spoils faster outside the fridge'],
            [{ text: 'Concentration ↑', style: 'color:var(--accent);font-weight:bold' }, 'Faster', 'More molecules → more collisions/sec', 'Pure O₂ makes fires burn fiercely'],
            [{ text: 'Surface area ↑', style: 'color:var(--green);font-weight:bold' }, 'Faster', 'More exposed surface → more contact', 'Powdered sugar dissolves instantly'],
            [{ text: 'Catalyst', style: 'color:var(--orange);font-weight:bold' }, 'Faster', 'Lowers Eₐ → easier to react', 'Enzymes in your body'],
          ]
        }),
        new CalloutBlock({ id: '43-rates-key', html: '<strong>The unifying idea:</strong> For a reaction to happen, molecules must collide with enough energy AND in the right orientation. Anything that increases the number of effective collisions speeds up the reaction.' }),
      ]
    },

    // --- BIG PICTURE ---
    {
      id: 'sec-43-bigpicture',
      blocks: [
        new TextBlock({ id: '43-big-title', tag: 'h2', html: 'The Complete Chain' }),
        new CalloutBlock({ id: '43-big-summary', html: 'You can now follow the complete journey:<br><br><strong>Module 2:</strong> Atoms have electrons in shells → electron configuration<br><strong>4.1:</strong> Atoms bond by transferring or sharing electrons<br><strong>4.2:</strong> Shape → polarity → IMFs → physical properties (boiling point, phase)<br><strong>4.3:</strong> Bonds break and reform → chemical reactions → energy changes → reaction rates<br><br>You now understand both <strong>structure</strong> (how matter is built) and <strong>dynamics</strong> (how it changes). This is the core of chemistry.' }),
      ]
    },

    // --- FORWARD ---
    {
      id: 'sec-43-forward',
      blocks: [
        new TextBlock({ id: '43-fwd-title', tag: 'h2', html: "What's Next" }),
        new TextBlock({ id: '43-fwd-text', tag: 'p', html: "With reactions under your belt, we can explore <strong>stoichiometry</strong> — using balanced equations to calculate exactly how much product you get from a given amount of reactant. And <strong>acids & bases</strong> — a special class of reactions that's everywhere from your stomach to batteries. Chemistry is about to become quantitative." }),
      ]
    },
  ],

  // stepMeta count MUST match the number of entries returned by buildSteps.
  // Each non-null entry is a progress bar node. null = separator.
  stepMeta: [
    { icon: '🔄', label: 'Recap', kind: 'narrate' },         // 0
    null,                                                       // 1
    { icon: '⚗️', label: 'Reactions', kind: 'narrate' },       // 2
    { icon: '⚖️', label: 'Conservation', kind: 'narrate' },    // 3
    null,                                                       // 4
    { icon: '💥', label: 'Collision', kind: 'narrate' },        // 5
    { icon: '🎮', label: 'Watch', kind: 'checkpoint' },         // 6
    null,                                                       // 7
    { icon: '📝', label: 'Equations', kind: 'narrate' },        // 8
    { icon: '🔢', label: 'Counting', kind: 'narrate' },         // 9
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },              // 10
    null,                                                       // 11
    { icon: '⚖️', label: 'Balance it', kind: 'checkpoint' },    // 12
    { icon: '💡', label: 'Strategy', kind: 'narrate' },         // 13
    null,                                                       // 14
    { icon: '📋', label: 'Types', kind: 'narrate' },            // 15
    { icon: '💡', label: 'Patterns', kind: 'narrate' },         // 16
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },              // 17
    null,                                                       // 18
    { icon: '🔥', label: 'Exo/Endo', kind: 'narrate' },         // 19
    { icon: '📐', label: 'ΔH Math', kind: 'narrate' },          // 20
    { icon: '🎮', label: 'Explore', kind: 'checkpoint' },       // 21
    { icon: '❓', label: 'Quiz 3', kind: 'quiz' },              // 22
    null,                                                       // 23
    { icon: '⚡', label: 'Eₐ', kind: 'narrate' },               // 24
    { icon: '🧪', label: 'Catalysts', kind: 'narrate' },        // 25
    null,                                                       // 26
    { icon: '⏱', label: 'Speed', kind: 'narrate' },             // 27
    { icon: '💡', label: 'Factors', kind: 'narrate' },           // 28
    null,                                                       // 29
    { icon: '🔗', label: 'Big picture', kind: 'narrate' },      // 30
    { icon: '❓', label: 'Quiz 4', kind: 'quiz' },              // 31
    { icon: '🎉', label: 'Done!', kind: 'narrate' },            // 32
  ],

  buildSteps(showSection, runner) {
    const balanceViz = runner.blockInstances.find(b => b.id === '43-balance-viz');
    const energyViz = runner.blockInstances.find(b => b.id === '43-energy-viz');

    // 33 steps total — must match stepMeta length (33)
    return [
      // 0: Hook
      { type: 'show', action: () => showSection('sec-43-hook'),
        text: "Welcome to lesson 4.3. Up to now, we've studied the structure of matter — how atoms bond, how molecular shape determines polarity and intermolecular forces, and how those forces explain boiling point and phase. But everything so far has been static. Molecules just sitting there. Now we're going to make chemistry dynamic. What happens when molecules collide and rearrange? That's a chemical reaction — and it's happening everywhere, all the time. When you light a match, when iron rusts, when your body digests food." },
      // 1: pause
      { type: 'pause' },

      // 2: What is a reaction
      { type: 'show', action: () => showSection('sec-43-what'),
        text: "A chemical reaction is a process where substances transform into different substances. Reactants go in, products come out. But here's the crucial insight that took centuries to figure out: no atoms are created or destroyed. Every single atom that enters the reaction must come out the other side. They just rearrange into new combinations. This is the Law of Conservation of Mass." },
      // 3: Conservation detail
      { type: 'narrate',
        text: "Antoine Lavoisier proved this in the 1770s. When wood burns, it looks like it disappears — but it doesn't. The carbon atoms combine with oxygen from the air to form CO2 gas. The hydrogen atoms form water vapor. If you captured every gas molecule and weighed them, the total mass would exactly equal the wood plus the oxygen consumed. Nothing was lost. It changed form. This law is the foundation of all chemical equations." },
      // 4: pause
      { type: 'pause' },

      // 5: Collision viz
      { type: 'show', action: () => showSection('sec-43-collision'),
        text: "Watch this animation of a real reaction at the molecular level. Hydrogen gas — H2 — meets chlorine gas — Cl2. For a reaction to happen, the molecules need to collide with enough energy. Then the old H-H bond and the Cl-Cl bond break — this costs energy. Then new H-Cl bonds form — this releases energy. Watch the whole cycle: approach, collision, bond breaking, bond forming, products flying apart." },
      // 6: Checkpoint — watch it
      { type: 'checkpoint',
        instruction: 'Watch the collision animation play through. Click Replay to see it again.',
        text: "Notice: the same atoms go in and come out. Two hydrogens and two chlorines on the left. Two hydrogens and two chlorines on the right, just rearranged into two HCl molecules. This is what every chemical reaction looks like at the atomic level — bonds breaking and new bonds forming. Click replay to watch it again if you want.",
        check: () => true,
        checkInterval: 8000,
        confirmText: "See the key steps? Molecules approach with energy. Old bonds stretch and break. New bonds form. Products fly apart. The atoms are conserved — only the arrangement changes. That's the essence of every chemical reaction." },
      // 7: pause
      { type: 'pause' },

      // 8: Chemical equations
      { type: 'show', action: () => showSection('sec-43-equations'),
        text: "We write reactions as chemical equations. Reactants on the left, an arrow meaning yields, products on the right. Here's a classic: 2 H2 plus O2 yields 2 H2O. The big number in front — the coefficient — tells you how many molecules. Two H2 means two molecules of hydrogen. The small subscript in the formula tells you how many atoms per molecule. H2O means two hydrogens and one oxygen in each water molecule. Coefficients and subscripts do completely different jobs." },
      // 9: Counting
      { type: 'narrate',
        text: "Let's verify this equation is balanced. Left side: 2 H2 means 4 hydrogen atoms. O2 means 2 oxygen atoms. Right side: 2 H2O means 4 hydrogens and 2 oxygens. Four H and two O on each side — balanced! Every atom is accounted for. An equation MUST be balanced because of the law of conservation of mass. If the atoms don't match, the equation is wrong." },
      // 10: Quiz 1
      { type: 'quiz',
        text: "Quick check on chemical equations.",
        question: "In the equation 2H₂ + O₂ → 2H₂O, what does the '2' in front of H₂O mean?",
        options: [
          "Each water molecule has 2 oxygen atoms",
          "There are 2 molecules of water produced",
          "Water has 2 hydrogen bonds",
          "The reaction happens twice"
        ],
        correctIndex: 1,
        correctFeedback: "Right! The coefficient '2' means 2 molecules of water. The subscript '2' in H₂O means each molecule has 2 hydrogen atoms. Coefficients count molecules. Subscripts count atoms within a molecule.",
        wrongFeedback: "The big number in front (coefficient) counts molecules. The small number below (subscript) counts atoms within each molecule. 2H₂O means two molecules, each with 2 hydrogens and 1 oxygen." },
      // 11: pause
      { type: 'pause' },

      // 12: Balance checkpoint
      { type: 'show', action: () => showSection('sec-43-balance'),
        text: "Now try it yourself! This interactive balancer shows methane combustion: CH4 plus O2 yields CO2 plus H2O. Your job is to adjust the coefficients until every element has the same count on both sides. Start with carbon — it's already one on each side. Then fix hydrogen — there are 4 on the left but only 2 on the right, so put a 2 in front of H2O. Then check oxygen — you need 4 on the left to match the right, so put 2 in front of O2. Use the plus and minus buttons." },
      // 13: Strategy
      { type: 'show', action: () => showSection('sec-43-strategy'),
        text: "Here's the balancing method laid out step by step. The key rule: only change coefficients — the big numbers in front. Never change subscripts — that would change the molecule itself. H2O is water, but H2O2 is hydrogen peroxide, a completely different substance. To balance, pick one element at a time, adjust coefficients until it matches, then move to the next element. With practice this becomes second nature." },
      // 14: pause
      { type: 'pause' },

      // 15: Reaction types
      { type: 'show', action: () => showSection('sec-43-types'),
        text: "There are five main types of chemical reactions, and they follow recognizable patterns. Synthesis: two small things combine into one bigger thing — like sodium plus chlorine forming table salt. Decomposition: one thing breaks into smaller pieces — like hydrogen peroxide breaking down into water and oxygen gas. Single replacement: one element kicks another out. Double replacement: two compounds swap partners. And combustion: a fuel burns in oxygen to produce CO2 and water." },
      // 16: Patterns
      { type: 'narrate',
        text: "The beauty of these patterns is prediction. If you see something combining, it's synthesis. If one substance breaks down, it's decomposition. If something burns in oxygen and produces CO2 and water, it's combustion. Recognizing the pattern tells you what's happening and lets you predict the products before you even do the experiment. Chemists have used these patterns for centuries." },
      // 17: Quiz 2
      { type: 'quiz',
        text: "Let's see if you can identify reaction types.",
        question: "2H₂O₂ → 2H₂O + O₂. What type of reaction is this?",
        options: [
          "Synthesis — things combine",
          "Decomposition — one substance breaks into simpler ones",
          "Combustion — something burns",
          "Single replacement — one element replaces another"
        ],
        correctIndex: 1,
        correctFeedback: "Correct! Hydrogen peroxide (one substance) breaks down into water and oxygen (two simpler substances). AB → A + B = decomposition. This is why H₂O₂ slowly loses its potency over time — it decomposes on its own!",
        wrongFeedback: "Look at the pattern: one substance on the left, two on the right. AB → A + B. Which type matches?" },
      // 18: pause
      { type: 'pause' },

      // 19: Energy
      { type: 'show', action: () => showSection('sec-43-energy'),
        text: "Now the energy story. Every reaction involves energy because breaking bonds costs energy and forming bonds releases energy. If the new bonds release MORE energy than it cost to break the old bonds, the reaction is exothermic — delta H is negative — energy comes out and the surroundings heat up. Combustion is the classic example. Burning methane releases 890 kilojoules per mole. That's why fire is hot." },
      // 20: Endo
      { type: 'narrate',
        text: "If the old bonds cost MORE energy to break than the new bonds release, the reaction is endothermic — delta H is positive — energy goes in and the surroundings cool down. Photosynthesis is the prime example: plants absorb sunlight energy to build glucose from CO2 and water. That energy gets stored in the glucose bonds. When you eat the plant and your body breaks down the glucose, the stored energy releases as an exothermic reaction. Life is a cycle of endothermic and exothermic reactions, powered by sunlight." },
      // 21: Energy checkpoint
      { type: 'checkpoint',
        instruction: 'Click "Show Endothermic" on the energy diagram to see both types',
        text: "Explore the energy diagram. Click the toggle button to switch between exothermic and endothermic. In exothermic, products sit LOWER than reactants — energy was released. In endothermic, products sit HIGHER — energy was absorbed. The purple arrow shows activation energy — the hill molecules must climb to start reacting.",
        check: () => energyViz?.renderer?.showExo === false,
        checkInterval: 500,
        confirmText: "See the difference? In exothermic, products are at lower energy — like rolling downhill. In endothermic, products are at higher energy — like pushing uphill. Both still need activation energy to get started. That's the hill you have to push molecules over." },
      // 22: Quiz 3
      { type: 'quiz',
        text: "Check your understanding of reaction energy.",
        question: "An instant cold pack feels cold when activated. What's happening inside?",
        options: [
          "Exothermic — releases heat into your hand",
          "Endothermic — the reaction absorbs heat from your skin",
          "No reaction — it's just ice melting",
          "Combustion — something burns inside"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! Dissolving ammonium nitrate in water is endothermic — it absorbs heat from the surroundings. Your skin loses heat → feels cold. The energy goes INTO the reaction.",
        wrongFeedback: "If something feels cold, energy is being taken away from your skin. Is the reaction putting energy out or pulling energy in?" },
      // 23: pause
      { type: 'pause' },

      // 24: Activation energy
      { type: 'show', action: () => showSection('sec-43-activation'),
        text: "Here's a puzzle: if burning wood is exothermic and releases energy, why doesn't wood spontaneously burst into flames? Because every reaction needs an initial push — the activation energy, written as E sub a. Think of a boulder on a hill. Even if the other side is much lower, you still have to push the boulder over the top first. That initial push is the activation energy. A match provides the activation energy for wood combustion. Once the reaction starts, the energy it releases keeps it going." },
      // 25: Catalysts
      { type: 'narrate',
        text: "Catalysts are substances that lower the activation energy — they provide a shortcut over a shorter hill. The reaction still releases or absorbs the same total energy, but it starts much more easily. Enzymes are biological catalysts — they make reactions happen at body temperature that would otherwise need extreme heat. Without enzymes, you couldn't digest food, replicate DNA, or even think. A single enzyme molecule can catalyze thousands of reactions per second. Life is literally impossible without catalysis." },
      // 26: pause
      { type: 'pause' },

      // 27: Rates
      { type: 'show', action: () => showSection('sec-43-rates'),
        text: "What controls how fast a reaction goes? Four main factors. Temperature: hotter molecules move faster and more of them have enough energy to clear the activation energy barrier. A rough rule of thumb: raising temperature by 10 degrees celsius roughly doubles the reaction rate. Concentration: more molecules packed into the same space means more collisions per second, so more chances for a reaction." },
      // 28: More factors
      { type: 'narrate',
        text: "Surface area: a powder reacts much faster than a solid chunk because more molecules are exposed to react. That's why flour dust can actually explode — the enormous surface area allows extremely rapid combustion. And catalysts: they lower the activation energy, so more molecules can react at any given temperature. All four factors come back to one unifying idea — collision theory. Molecules must collide with enough energy and the right orientation. Anything that increases the number of effective collisions speeds up the reaction." },
      // 29: pause
      { type: 'pause' },

      // 30: Big picture
      { type: 'show', action: () => showSection('sec-43-bigpicture'),
        text: "Let's zoom all the way out. You started with electrons in shells. You learned how atoms bond by sharing or transferring those electrons. You saw that molecular shape determines polarity and intermolecular forces, which explain physical properties. And now you understand chemical reactions — how bonds break and reform, the energy involved, what controls the speed. You can follow the chain from subatomic particles all the way to observable changes in the real world. This is the core of chemistry." },
      // 31: Quiz 4
      { type: 'quiz',
        text: "Final comprehensive question.",
        question: "A catalyst speeds up a reaction by:",
        options: [
          "Increasing the temperature of the reaction",
          "Adding more reactant molecules",
          "Lowering the activation energy so more molecules can react",
          "Making the reaction more exothermic"
        ],
        correctIndex: 2,
        correctFeedback: "Perfect! A catalyst lowers Eₐ — providing an easier path over a lower energy hill. It doesn't change temperature, concentration, or the total energy change ΔH. And it's not consumed — it comes out unchanged. Enzymes do this billions of times per second in your body!",
        wrongFeedback: "A catalyst doesn't change temperature or add more reactants. Think about the energy diagram — what does a catalyst change about the hill molecules have to climb?" },

      // 32: Forward
      { type: 'show', action: () => showSection('sec-43-forward'),
        text: "Outstanding work! You've completed lesson 4.3 on chemical reactions. You understand conservation of mass, balanced equations, the five reaction types, exothermic versus endothermic energy changes, activation energy, catalysts, and reaction rates. This is where chemistry gets dynamic. Coming up: stoichiometry — using balanced equations to make quantitative predictions about how much product you get — and acids and bases, a special class of reactions that's everywhere in daily life. See you there!" },
    ];
  },
};
