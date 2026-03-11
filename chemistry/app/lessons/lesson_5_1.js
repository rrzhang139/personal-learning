/**
 * Lesson 5.1: Energy, Heat & Thermochemistry
 *
 * Picks up from 4.3/4.4 (reactions, stoichiometry). Formalizes the energy concepts
 * introduced in 4.3 (exo/endothermic). Covers: what is energy, heat vs temperature,
 * specific heat capacity (q=mcΔT), calorimetry, enthalpy (ΔH), bond energies,
 * Hess's Law, standard enthalpies of formation, and why this matters for materials.
 *
 * Four sim modes: heatTransfer, specificHeat, bondEnergy, hessLaw
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';

// Import sim (self-registers)
import '../sims/thermoViz.js';

export const lesson_5_1 = {
  id: '5.1',
  lessonId: 'lesson_5_1',
  title: 'Energy, Heat & Thermochemistry',

  sections: [
    // --- RECAP & HOOK ---
    {
      id: 'sec-51-hook',
      blocks: [
        new TextBlock({ id: '51-hook-title', tag: 'h2', html: 'The Energy Behind the Chemistry' }),
        new CalloutBlock({ id: '51-hook-recap', html: '<strong>Where we are:</strong> You know atoms bond (4.1), molecular shape determines physical properties (4.2), reactions break and form bonds with energy changes (4.3), and stoichiometry lets you calculate amounts (4.4). In 4.3, we introduced exothermic and endothermic reactions. Now we dig much deeper: what exactly IS energy? How do we measure it? Where does it come from in a reaction? This is the physics under the chemistry.' }),
        new TextBlock({ id: '51-hook-why', tag: 'p', html: "Understanding energy is essential. It determines which reactions happen spontaneously, why materials melt at specific temperatures, why some substances are stable and others aren't, and how we engineer materials with desired properties. Energy is the <strong>master key</strong> to chemistry and materials science." }),
      ]
    },

    // --- WHAT IS ENERGY ---
    {
      id: 'sec-51-energy',
      blocks: [
        new TextBlock({ id: '51-nrg-title', tag: 'h2', html: 'What Is Energy?' }),
        new TextBlock({ id: '51-nrg-text', tag: 'p', html: "Energy is the <strong>capacity to do work</strong> — to move things, break bonds, change temperature. It comes in two fundamental flavors:" }),
        new CalloutBlock({ id: '51-nrg-types', html: '<strong>Kinetic Energy</strong> — energy of motion. Atoms vibrating, molecules flying through space, electrons orbiting. In chemistry, kinetic energy of molecules = what we measure as <em>temperature</em>.<br><br><strong>Potential Energy</strong> — stored energy. Chemical bonds store energy. A ball on a shelf has gravitational potential energy. A compressed spring stores elastic energy. In chemistry, the energy stored in chemical bonds = what gets released or absorbed in reactions.' }),
        new MathBlock({ id: '51-nrg-law', label: 'First Law of Thermodynamics (Conservation of Energy):', equation: 'Energy cannot be created or destroyed — only transformed', symbols: [
          { symbol: 'KE', name: 'Kinetic Energy', meaning: 'Energy of motion (½mv²)' },
          { symbol: 'PE', name: 'Potential Energy', meaning: 'Stored energy (bonds, position, fields)' },
          { symbol: 'Total E', name: 'Total Energy', meaning: 'KE + PE = constant in an isolated system' },
        ]}),
      ]
    },

    // --- HEAT VS TEMPERATURE ---
    {
      id: 'sec-51-heatvstemp',
      blocks: [
        new TextBlock({ id: '51-hvt-title', tag: 'h2', html: 'Heat vs Temperature — The Critical Distinction' }),
        new TextBlock({ id: '51-hvt-text', tag: 'p', html: "These two words are NOT the same thing, and confusing them is one of the most common mistakes in science:" }),
        new CalloutBlock({ id: '51-hvt-key', html: '<strong>Temperature</strong> = the <em>average</em> kinetic energy of particles. It tells you how fast particles are moving on average. Measured in °C, K, or °F.<br><br><strong>Heat</strong> = the <em>transfer</em> of thermal energy between objects at different temperatures. Heat always flows from hot → cold until equilibrium.<br><br><strong>Analogy:</strong> Temperature is like the height of water in a pool. Heat is like pouring water from one pool to another. A huge swimming pool at 30°C has vastly more total thermal energy than a tiny cup at 80°C — even though the cup is "hotter."' }),
        new SimBlock({ id: '51-ht-viz', sim: 'thermoViz', width: 900, height: 420, simOptions: { mode: 'heatTransfer' } }),
      ]
    },

    // --- SPECIFIC HEAT CAPACITY ---
    {
      id: 'sec-51-specificheat',
      blocks: [
        new TextBlock({ id: '51-sh-title', tag: 'h2', html: 'Specific Heat Capacity' }),
        new TextBlock({ id: '51-sh-text', tag: 'p', html: "Different materials need different amounts of energy to heat up by the same amount. Water is exceptional — it takes a LOT of energy to heat water even a little bit. Metals, by contrast, heat up quickly. This property is called <strong>specific heat capacity</strong>." }),
        new MathBlock({ id: '51-sh-math', label: 'The heat equation:', equation: 'q = m · c · ΔT', symbols: [
          { symbol: 'q', name: 'Heat', units: 'Joules (J)', meaning: 'Energy transferred to/from the substance' },
          { symbol: 'm', name: 'Mass', units: 'grams (g)', meaning: 'How much substance' },
          { symbol: 'c', name: 'Specific heat', units: 'J/(g·°C)', meaning: 'Energy per gram per degree — material property' },
          { symbol: 'ΔT', name: 'Temperature change', units: '°C', meaning: 'T_final − T_initial' },
        ]}),
        new CalloutBlock({ id: '51-sh-why', html: '<strong>Why q = mcΔT makes sense:</strong><br>• More mass (m↑) → need more energy to heat it all<br>• Higher specific heat (c↑) → material resists temperature change<br>• Bigger temperature change (ΔT↑) → need more energy<br><br>Water: c = 4.18 J/(g·°C) — very high! This is why oceans moderate climate, why coastal cities are milder, and why water is used as a coolant in engines and nuclear reactors.' }),
        new SimBlock({ id: '51-sh-viz', sim: 'thermoViz', width: 900, height: 420, simOptions: { mode: 'specificHeat' } }),
      ]
    },

    // --- CALORIMETRY ---
    {
      id: 'sec-51-calorimetry',
      blocks: [
        new TextBlock({ id: '51-cal-title', tag: 'h2', html: 'Calorimetry — Measuring Reaction Energy' }),
        new TextBlock({ id: '51-cal-text', tag: 'p', html: "How do chemists actually measure the energy of reactions? Simple but clever: run the reaction inside water and measure how much the water temperature changes." }),
        new CalloutBlock({ id: '51-cal-method', html: '<strong>Coffee-cup calorimetry:</strong><br><br>1. Put a known mass of water in an insulated cup (the "calorimeter")<br>2. Measure initial temperature<br>3. Run the reaction in the water<br>4. Measure final temperature<br>5. Calculate: q_water = m_water × c_water × ΔT<br><br>Since energy is conserved: <strong>q_reaction = −q_water</strong><br><br>If the water heats up (+ΔT), the reaction released energy (exothermic, q_reaction is negative).<br>If the water cools down (−ΔT), the reaction absorbed energy (endothermic, q_reaction is positive).' }),
        new MathBlock({ id: '51-cal-math', label: 'Calorimetry equation:', equation: 'q_reaction = −q_water = −(m · c · ΔT)', symbols: [
          { symbol: 'q_reaction', name: 'Reaction energy', meaning: 'What we want to find' },
          { symbol: '−', name: 'Negative sign', meaning: 'Energy the water gains = energy the reaction lost (and vice versa)' },
          { symbol: 'c_water', name: '4.18 J/(g·°C)', meaning: 'Specific heat of water — always this value' },
        ]}),
      ]
    },

    // --- ENTHALPY ---
    {
      id: 'sec-51-enthalpy',
      blocks: [
        new TextBlock({ id: '51-enth-title', tag: 'h2', html: 'Enthalpy (ΔH) — The Energy Bookkeeping' }),
        new TextBlock({ id: '51-enth-text', tag: 'p', html: "In 4.3 we introduced ΔH briefly. Now let's formalize it. <strong>Enthalpy (H)</strong> is the total heat content of a system at constant pressure. We can't measure absolute enthalpy — but we CAN measure the <strong>change</strong> (ΔH)." }),
        new MathBlock({ id: '51-enth-math', label: 'Enthalpy change:', equation: 'ΔH = H_products − H_reactants', symbols: [
          { symbol: 'ΔH < 0', name: 'Exothermic', meaning: 'Products have LESS energy → heat released → surroundings warm up' },
          { symbol: 'ΔH > 0', name: 'Endothermic', meaning: 'Products have MORE energy → heat absorbed → surroundings cool down' },
          { symbol: 'Units', name: 'kJ/mol', meaning: 'Kilojoules per mole of reaction as written' },
        ]}),
        new CalloutBlock({ id: '51-enth-connect', html: '<strong>Connecting to bonds:</strong> ΔH comes from bond energies. Breaking bonds costs energy (endothermic). Forming bonds releases energy (exothermic). The NET ΔH = energy to break all old bonds − energy released by forming all new bonds.<br><br>If forming new bonds releases MORE than breaking old bonds costs → exothermic (ΔH < 0)<br>If breaking old bonds costs MORE than forming new bonds releases → endothermic (ΔH > 0)' }),
      ]
    },

    // --- BOND ENERGIES ---
    {
      id: 'sec-51-bondenergy',
      blocks: [
        new TextBlock({ id: '51-be-title', tag: 'h2', html: 'Bond Energies — Where ΔH Comes From' }),
        new TextBlock({ id: '51-be-text', tag: 'p', html: "Every chemical bond has a specific energy. It takes exactly that much energy to break it, and exactly that much is released when it forms. Here are some common values:" }),
        new TableBlock({ id: '51-be-table', maxWidth: '700px',
          headers: ['Bond', 'Energy (kJ/mol)', 'Found in'],
          rows: [
            [{ text: 'C—H', style: 'font-weight:bold' }, '413', 'Methane, all organics'],
            [{ text: 'O═O', style: 'font-weight:bold' }, '498', 'Oxygen gas (O₂)'],
            [{ text: 'C═O', style: 'font-weight:bold' }, '799', 'Carbon dioxide (CO₂)'],
            [{ text: 'O—H', style: 'font-weight:bold' }, '463', 'Water (H₂O)'],
            [{ text: 'C—C', style: 'font-weight:bold' }, '348', 'Diamond, polymers'],
            [{ text: 'C═C', style: 'font-weight:bold' }, '614', 'Ethylene, plastics'],
            [{ text: 'N≡N', style: 'font-weight:bold' }, '941', 'Nitrogen gas (N₂) — very strong!'],
            [{ text: 'H—H', style: 'font-weight:bold' }, '436', 'Hydrogen gas (H₂)'],
          ]
        }),
        new CalloutBlock({ id: '51-be-calc', html: '<strong>Calculating ΔH from bond energies:</strong><br><br>ΔH_rxn ≈ Σ(energy of bonds broken) − Σ(energy of bonds formed)<br><br>Example: CH₄ + 2O₂ → CO₂ + 2H₂O<br>Breaking: 4(C—H) + 2(O═O) = 4(413) + 2(498) = 2648 kJ<br>Forming: 2(C═O) + 4(O—H) = 2(799) + 4(463) = 3450 kJ<br>ΔH = 2648 − 3450 = <strong>−802 kJ</strong> (exothermic!)<br><br>Try it yourself in the sim below:' }),
        new SimBlock({ id: '51-be-viz', sim: 'thermoViz', width: 900, height: 420, simOptions: { mode: 'bondEnergy' } }),
      ]
    },

    // --- HESS'S LAW ---
    {
      id: 'sec-51-hess',
      blocks: [
        new TextBlock({ id: '51-hess-title', tag: 'h2', html: "Hess's Law — Energy is Path-Independent" }),
        new TextBlock({ id: '51-hess-text', tag: 'p', html: "Here's a powerful principle: the total ΔH for a reaction is the same regardless of whether it happens in one step or multiple steps. It only depends on the starting and ending points — not the path taken." }),
        new CalloutBlock({ id: '51-hess-analogy', html: "<strong>Analogy:</strong> Like elevation change on a hike. Whether you take the direct steep trail or the winding switchback, the altitude difference between base and summit is the same. Energy works the same way.<br><br>This is incredibly useful: you can calculate ΔH for reactions you can't easily run directly, by combining simpler reactions whose ΔH values are known." }),
        new SimBlock({ id: '51-hess-viz', sim: 'thermoViz', width: 900, height: 420, simOptions: { mode: 'hessLaw' } }),
        new MathBlock({ id: '51-hess-math', label: "Hess's Law:", equation: 'ΔH_total = ΔH₁ + ΔH₂ + ΔH₃ + ...', symbols: [
          { symbol: 'ΔH_total', name: 'Overall enthalpy change', meaning: 'Same as if reaction happened directly' },
          { symbol: 'ΔH₁, ΔH₂...', name: 'Individual step enthalpies', meaning: 'Each intermediate step contributes to the total' },
        ]}),
      ]
    },

    // --- STANDARD ENTHALPIES OF FORMATION ---
    {
      id: 'sec-51-formation',
      blocks: [
        new TextBlock({ id: '51-form-title', tag: 'h2', html: 'Standard Enthalpies of Formation (ΔH°f)' }),
        new TextBlock({ id: '51-form-text', tag: 'p', html: "To avoid recalculating from bond energies every time, chemists defined a reference system. The <strong>standard enthalpy of formation</strong> (ΔH°f) is the enthalpy change when 1 mole of a compound forms from its elements in their standard states (25°C, 1 atm)." }),
        new CalloutBlock({ id: '51-form-convention', html: '<strong>Convention:</strong> Elements in their standard state (O₂ gas, C graphite, Fe solid, etc.) have ΔH°f = 0 by definition. This gives us a universal reference point.' }),
        new TableBlock({ id: '51-form-table', maxWidth: '650px',
          headers: ['Substance', 'Formula', 'ΔH°f (kJ/mol)'],
          rows: [
            [{ text: 'Water (liquid)', style: 'font-weight:bold' }, 'H₂O(l)', '−285.8'],
            [{ text: 'Carbon dioxide', style: 'font-weight:bold' }, 'CO₂(g)', '−393.5'],
            [{ text: 'Methane', style: 'font-weight:bold' }, 'CH₄(g)', '−74.8'],
            [{ text: 'Iron(III) oxide (rust)', style: 'font-weight:bold' }, 'Fe₂O₃(s)', '−824.2'],
            [{ text: 'Glucose', style: 'font-weight:bold' }, 'C₆H₁₂O₆(s)', '−1274'],
            [{ text: 'Sodium chloride', style: 'font-weight:bold' }, 'NaCl(s)', '−411.2'],
            [{ text: 'Oxygen gas', style: 'font-weight:bold;color:var(--accent)' }, 'O₂(g)', { text: '0', style: 'color:var(--accent)' }],
            [{ text: 'Carbon (graphite)', style: 'font-weight:bold;color:var(--accent)' }, 'C(s)', { text: '0', style: 'color:var(--accent)' }],
          ]
        }),
        new MathBlock({ id: '51-form-math', label: 'Using ΔH°f to calculate reaction enthalpy:', equation: 'ΔH°_rxn = Σ ΔH°f(products) − Σ ΔH°f(reactants)', symbols: [
          { symbol: 'Σ', name: 'Sum', meaning: 'Add up all products (or reactants), each multiplied by its coefficient' },
          { symbol: 'ΔH°f', name: 'Standard enthalpy of formation', meaning: 'From tables — looked up, not calculated each time' },
        ]}),
      ]
    },

    // --- MATERIALS CONNECTION ---
    {
      id: 'sec-51-materials',
      blocks: [
        new TextBlock({ id: '51-mat-title', tag: 'h2', html: 'Why This Matters for Materials Science' }),
        new CalloutBlock({ id: '51-mat-connect', html: '<strong>Everything connects:</strong><br><br>• <strong>Specific heat</strong> determines how materials respond to heating during manufacturing. Metals with low specific heat heat up fast — good for welding, challenging for thermal stability.<br><br>• <strong>Bond energies</strong> determine material strength. Diamond (C—C network) is hard because those bonds are strong. Weak IMFs make materials soft and low-melting.<br><br>• <strong>ΔH°f</strong> determines stability. Very negative ΔH°f = very stable compound. Fe₂O₃ (rust) has ΔH°f = −824 kJ/mol, which is why iron naturally rusts — it\'s energetically favorable to form the oxide.<br><br>• <strong>Phase transitions</strong> are enthalpy changes: ΔH_fus (melting) and ΔH_vap (boiling). More energy required = stronger intermolecular forces = higher melting/boiling point.<br><br>The energy landscape determines what materials exist and how they behave.' }),
      ]
    },

    // --- FORWARD ---
    {
      id: 'sec-51-forward',
      blocks: [
        new TextBlock({ id: '51-fwd-title', tag: 'h2', html: "What's Next" }),
        new TextBlock({ id: '51-fwd-text', tag: 'p', html: "You now understand the energy side of chemistry. But there's a mystery: some endothermic processes happen spontaneously. Ice melts at room temperature even though melting absorbs energy. How? There's another factor we haven't met yet: <strong>entropy</strong> — the tendency toward disorder. Together, energy and entropy combine into <strong>Gibbs free energy</strong>, which tells us what actually happens in nature. That's coming in 5.2." }),
      ]
    },
  ],

  // stepMeta count MUST match the number of entries returned by buildSteps.
  // Each non-null entry is a progress bar node. null = separator (pause).
  stepMeta: [
    { icon: '🔄', label: 'Recap', kind: 'narrate' },           // 0
    null,                                                         // 1
    { icon: '⚡', label: 'Energy', kind: 'narrate' },            // 2
    { icon: '🔬', label: 'KE & PE', kind: 'narrate' },           // 3
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },               // 4
    null,                                                         // 5
    { icon: '🌡️', label: 'Heat vs T', kind: 'narrate' },        // 6
    { icon: '🎮', label: 'Explore', kind: 'checkpoint' },         // 7
    null,                                                         // 8
    { icon: '🔥', label: 'Spec Heat', kind: 'narrate' },          // 9
    { icon: '📐', label: 'q=mcΔT', kind: 'narrate' },            // 10
    { icon: '🎮', label: 'Try it', kind: 'checkpoint' },          // 11
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },               // 12
    null,                                                         // 13
    { icon: '🧪', label: 'Calorim.', kind: 'narrate' },           // 14
    { icon: '📐', label: 'q_rxn', kind: 'narrate' },              // 15
    null,                                                         // 16
    { icon: '📊', label: 'Enthalpy', kind: 'narrate' },           // 17
    { icon: '🔗', label: 'Bonds↔ΔH', kind: 'narrate' },          // 18
    { icon: '❓', label: 'Quiz 3', kind: 'quiz' },               // 19
    null,                                                         // 20
    { icon: '⚡', label: 'Bond E', kind: 'narrate' },             // 21
    { icon: '📋', label: 'Table', kind: 'narrate' },              // 22
    { icon: '🎮', label: 'Break/Form', kind: 'checkpoint' },      // 23
    null,                                                         // 24
    { icon: '🥾', label: "Hess's Law", kind: 'narrate' },         // 25
    { icon: '🎮', label: 'Paths', kind: 'checkpoint' },           // 26
    { icon: '❓', label: 'Quiz 4', kind: 'quiz' },               // 27
    null,                                                         // 28
    { icon: '📋', label: 'ΔH°f', kind: 'narrate' },               // 29
    { icon: '📐', label: 'Formula', kind: 'narrate' },            // 30
    { icon: '❓', label: 'Quiz 5', kind: 'quiz' },               // 31
    null,                                                         // 32
    { icon: '🔩', label: 'Materials', kind: 'narrate' },          // 33
    { icon: '🎉', label: 'Done!', kind: 'narrate' },             // 34
  ],

  buildSteps(showSection, runner) {
    const htViz  = runner.blockInstances.find(b => b.id === '51-ht-viz');
    const shViz  = runner.blockInstances.find(b => b.id === '51-sh-viz');
    const beViz  = runner.blockInstances.find(b => b.id === '51-be-viz');
    const hlViz  = runner.blockInstances.find(b => b.id === '51-hess-viz');

    // 35 steps total — must match stepMeta length (35)
    return [
      // 0: Recap & Hook
      { type: 'show', action: () => showSection('sec-51-hook'),
        text: "Welcome to lesson 5.1 — Energy, Heat, and Thermochemistry. This is where we put the physics under the chemistry. You already know that reactions break and form bonds, and that some reactions release energy while others absorb it. In lesson 4.3, we introduced exothermic and endothermic reactions. But we only scratched the surface. Now we're going to ask the deeper questions: what exactly IS energy? How do we measure it precisely? Where does it come from in a chemical reaction? And why does this matter for understanding materials? Understanding energy is the master key to all of chemistry and materials science." },

      // 1: pause
      { type: 'pause' },

      // 2: What is energy
      { type: 'show', action: () => showSection('sec-51-energy'),
        text: "Energy is the capacity to do work — to move things, break bonds, change temperature. It comes in two fundamental flavors. Kinetic energy is the energy of motion — atoms vibrating, molecules flying through the air, electrons orbiting nuclei. In chemistry, kinetic energy of molecules is what we measure as temperature. Potential energy is stored energy — chemical bonds store energy, a ball on a shelf has gravitational potential energy. In chemistry, the potential energy stored in bonds is what gets released or absorbed during reactions." },

      // 3: First law
      { type: 'narrate',
        text: "Here's the most important law in all of physics: the First Law of Thermodynamics. Energy cannot be created or destroyed — only transformed from one form to another. When you burn methane, the potential energy stored in C-H and O=O bonds transforms into kinetic energy of the product molecules — they fly apart fast, and fast molecules means high temperature means heat. The total energy before and after is exactly the same. It just changed form. This law is so fundamental that no exception has ever been found in the history of science." },

      // 4: Quiz 1
      { type: 'quiz',
        text: "Quick check on energy basics.",
        question: "When wood burns, what happens to the energy stored in the chemical bonds?",
        options: [
          "It is destroyed — that's why the wood disappears",
          "It transforms into heat and light — same total amount, different form",
          "New energy is created by the fire",
          "It stays in the same bonds, just rearranged"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! Energy is conserved. The potential energy in wood's bonds transforms into kinetic energy (heat) and light. Same total energy, different form. This is the First Law of Thermodynamics.",
        wrongFeedback: "Remember the First Law: energy cannot be created or destroyed. The wood's chemical bond energy must go somewhere..." },

      // 5: pause
      { type: 'pause' },

      // 6: Heat vs Temperature
      { type: 'show', action: () => showSection('sec-51-heatvstemp'),
        text: "Now a critical distinction that trips up even science students: heat and temperature are NOT the same thing. Temperature measures the average kinetic energy of particles — how fast they're moving on average. Heat is the transfer of energy between objects at different temperatures. Think of it this way: temperature is like the height of water in a pool. Heat is like pouring water from one pool to another. A huge swimming pool at 30 degrees Celsius has vastly more total thermal energy than a tiny cup at 80 degrees — even though the cup is hotter. Heat always flows from hot to cold, until both reach the same temperature — thermal equilibrium." },

      // 7: Heat transfer checkpoint
      { type: 'checkpoint',
        instruction: 'Click "Transfer Heat" to watch heat flow from hot to cold',
        text: "Explore this simulation. Container A is hot, Container B is cold. Watch the particles — fast particles in A, slow in B. Click Transfer Heat and watch what happens. Heat flows from A to B. The particles in A slow down and the particles in B speed up until they reach the same average speed — the same temperature. Try changing the sizes too. A bigger container at the same temperature has more total energy — more particles moving at the same speed.",
        check: () => htViz?.renderer?.htEquilibrium === true,
        checkInterval: 500,
        confirmText: "See? They reached thermal equilibrium — same temperature. But notice: the TOTAL energy bars depend on size. A huge container at 30 degrees has way more total thermal energy than a small one at 30 degrees. Temperature is intensity. Heat is the flow. Total thermal energy depends on both temperature AND amount of substance." },

      // 8: pause
      { type: 'pause' },

      // 9: Specific heat
      { type: 'show', action: () => showSection('sec-51-specificheat'),
        text: "Different materials need different amounts of energy to heat up by the same amount. This property is called specific heat capacity, and it varies enormously. Water is exceptional — its specific heat is 4.18 joules per gram per degree celsius. That's way higher than most materials. Iron is only 0.449, copper is 0.385. This means water is incredibly resistant to temperature changes. That's why oceans moderate climate — they absorb enormous amounts of energy without heating up much. It's why coastal cities have milder weather than inland cities. And it's why your body, which is mostly water, can maintain a stable temperature." },

      // 10: q = mcΔT
      { type: 'narrate',
        text: "The formula is beautifully simple: q equals m times c times delta T. q is the heat energy transferred, in joules. m is the mass in grams. c is the specific heat — a number unique to each material. And delta T is the temperature change. This equation makes intuitive sense: more mass means more energy needed. Higher specific heat means the material resists temperature change more. And a bigger temperature change requires more energy. It's all proportional." },

      // 11: Specific heat checkpoint
      { type: 'checkpoint',
        instruction: 'Select different materials and click "Add 1000 J" to compare heating rates',
        text: "Try this simulation. Select different materials and add energy by clicking Add 1000 J. Watch how the temperature changes differently for each material. Water barely budges — high specific heat. Iron and copper heat up fast — low specific heat. Try changing the mass with the slider too. More mass means the same energy causes a smaller temperature change. This is q equals m c delta T in action.",
        check: () => shViz?.renderer?.shEnergyAdded >= 3000,
        checkInterval: 500,
        confirmText: "You can see it clearly: water needs about ten times more energy than iron to reach the same temperature. This has huge practical implications. Engineers choose materials partly based on specific heat — you want high specific heat for thermal storage, low specific heat for materials that need to heat up quickly." },

      // 12: Quiz 2
      { type: 'quiz',
        text: "Let's test specific heat understanding.",
        question: "You add 1000 J of energy to 100 g of water (c = 4.18) and 100 g of iron (c = 0.449). Which heats up more?",
        options: [
          "Water — it absorbs more energy",
          "Iron — its lower specific heat means temperature changes more per joule",
          "Both heat up the same — same energy, same mass",
          "Neither — they're both at room temperature"
        ],
        correctIndex: 1,
        correctFeedback: "Right! ΔT = q/(mc). For water: 1000/(100×4.18) = 2.4°C. For iron: 1000/(100×0.449) = 22.3°C. Iron heats up nearly 10 times more! Low c means temperature changes easily.",
        wrongFeedback: "Use ΔT = q/(mc). Same q and m, but different c. Lower c means bigger ΔT for the same energy input." },

      // 13: pause
      { type: 'pause' },

      // 14: Calorimetry
      { type: 'show', action: () => showSection('sec-51-calorimetry'),
        text: "How do chemists actually measure the energy of reactions? With a technique called calorimetry. The idea is simple but clever: run the reaction inside water and measure how much the water temperature changes. If the water heats up, the reaction released energy — exothermic. If the water cools down, the reaction absorbed energy — endothermic. Since energy is conserved, whatever the reaction releases, the water absorbs. So q reaction equals negative q water. The negative sign means energy flows from one to the other." },

      // 15: Calorimetry math
      { type: 'narrate',
        text: "Here's a concrete example. You dissolve some sodium hydroxide in 200 grams of water, and the temperature rises from 22 degrees to 28 degrees. Delta T is 6 degrees. q water equals 200 times 4.18 times 6, which equals 5016 joules, or about 5 kilojoules. Since the water heated up, the reaction was exothermic: q reaction equals negative 5 kilojoules. The dissolving process released 5 kilojoules of energy into the water. This is the foundation of experimental thermochemistry — measuring energy changes by measuring temperature changes." },

      // 16: pause
      { type: 'pause' },

      // 17: Enthalpy
      { type: 'show', action: () => showSection('sec-51-enthalpy'),
        text: "Now let's formalize the energy bookkeeping. Enthalpy, symbolized H, is the total heat content of a system at constant pressure — which is how most reactions happen, in open containers at atmospheric pressure. We can't measure absolute enthalpy, but we CAN measure the change: delta H equals H products minus H reactants. If delta H is negative, products have less energy than reactants — energy was released — exothermic. If delta H is positive, products have more energy — energy was absorbed — endothermic." },

      // 18: Bond-enthalpy connection
      { type: 'narrate',
        text: "Where does delta H come from physically? It comes from bond energies. Breaking bonds always costs energy — it's always endothermic. Forming bonds always releases energy — it's always exothermic. The net delta H is the balance. If forming the new bonds releases more energy than breaking the old bonds costs, the overall reaction is exothermic. If breaking the old bonds costs more than forming new bonds releases, it's endothermic. This is the physical reality behind the numbers. Every delta H value traces back to which bonds break and which bonds form." },

      // 19: Quiz 3
      { type: 'quiz',
        text: "Check your understanding of enthalpy.",
        question: "A reaction has ΔH = −250 kJ/mol. This means:",
        options: [
          "The reaction absorbs 250 kJ from the surroundings",
          "The products have 250 kJ MORE energy than the reactants",
          "The products have 250 kJ LESS energy than reactants — energy was released",
          "250 kJ of energy was destroyed"
        ],
        correctIndex: 2,
        correctFeedback: "Correct! Negative ΔH = exothermic. Products are lower energy, and the difference (250 kJ) was released as heat. The products are more stable because they sit at a lower energy level.",
        wrongFeedback: "Negative ΔH means H_products < H_reactants. Energy went out of the system into the surroundings. Was energy released or absorbed?" },

      // 20: pause
      { type: 'pause' },

      // 21: Bond energies
      { type: 'show', action: () => showSection('sec-51-bondenergy'),
        text: "Every chemical bond has a specific energy — the amount of energy needed to break it apart. A C-H bond in methane takes 413 kilojoules per mole to break. An O double bond O takes 498. A C double bond O takes 799. An O-H bond takes 463. These are like the price tags on each bond. And the beautiful thing is: you can USE these numbers to calculate the energy change of any reaction. Delta H approximately equals the sum of bonds broken minus the sum of bonds formed." },

      // 22: Bond energy table
      { type: 'narrate',
        text: "Let's calculate the delta H for methane combustion: CH4 plus 2 O2 yields CO2 plus 2 H2O. On the breaking side: 4 C-H bonds at 413 each, plus 2 O double bond O at 498 each. That's 1652 plus 996 equals 2648 kilojoules to break everything apart. On the forming side: 2 C double bond O at 799 each, plus 4 O-H bonds at 463 each. That's 1598 plus 1852 equals 3450 kilojoules released. Delta H equals 2648 minus 3450 equals negative 802 kilojoules. Exothermic! The new bonds released 802 kilojoules more energy than it cost to break the old bonds. That's why fire is hot." },

      // 23: Bond energy checkpoint
      { type: 'checkpoint',
        instruction: 'Click each bond to break it (red), then form new bonds (green) to calculate ΔH',
        text: "Try it yourself in this interactive simulation. Click each bond on the left to break it — watch the energy cost add up in red. Once all old bonds are broken, click the bonds on the right to form them — watch the energy released add up in green. When you've done both sides, you'll see the final delta H calculation.",
        check: () => beViz?.renderer?.bePhase === 'done',
        checkInterval: 500,
        confirmText: "You calculated it! Breaking costs 2648 kilojoules, forming releases 3450 kilojoules. The difference is negative 802 kilojoules per mole — strongly exothermic. That's where the heat of combustion comes from. Every time you light a stove, you're releasing this stored bond energy." },

      // 24: pause
      { type: 'pause' },

      // 25: Hess's Law
      { type: 'show', action: () => showSection('sec-51-hess'),
        text: "Now here's a powerful principle called Hess's Law: the total delta H for a reaction is the same regardless of whether it happens in one step or multiple steps. Think of hiking — whether you take the direct steep trail or the winding switchback path, the elevation change between base camp and summit is exactly the same. Energy works the same way. The starting and ending energy levels are fixed. The path doesn't matter. This is incredibly useful because you can calculate delta H for reactions you can't easily run directly, by combining simpler reactions." },

      // 26: Hess's Law checkpoint
      { type: 'checkpoint',
        instruction: 'Click "Two-Step Path" to compare direct vs multi-step and verify the same ΔH',
        text: "Look at this energy level diagram. Carbon plus O2 going to CO2 directly: delta H equals negative 393 kilojoules. Now click the Two-Step Path button. Step 1: carbon plus half O2 forms CO, delta H1 equals negative 110.5. Step 2: CO plus half O2 forms CO2, delta H2 equals negative 282.5. Add them up: negative 110.5 plus negative 282.5 equals negative 393. Exactly the same! The path doesn't matter — only the start and end points.",
        check: () => hlViz?.renderer?.hlPath === 'steps' && hlViz?.renderer?.hlAnimProgress >= 0.9,
        checkInterval: 500,
        confirmText: "You can see it clearly — both paths arrive at the same total delta H of negative 393 kilojoules. This is Hess's Law in action. It works because energy is a state function — it depends only on the current state, not on how you got there. This is directly analogous to altitude: the height of a mountain peak doesn't depend on which trail you took." },

      // 27: Quiz 4
      { type: 'quiz',
        text: "Test your understanding of Hess's Law.",
        question: "If A → B has ΔH = −100 kJ, and B → C has ΔH = −50 kJ, what is ΔH for A → C?",
        options: [
          "−50 kJ",
          "+150 kJ",
          "−150 kJ",
          "Cannot be determined"
        ],
        correctIndex: 2,
        correctFeedback: "Right! By Hess's Law, ΔH(A→C) = ΔH(A→B) + ΔH(B→C) = −100 + (−50) = −150 kJ. The total change is the sum of the steps, regardless of the path.",
        wrongFeedback: "Hess's Law says: add up the ΔH values for each step. A→B is −100 and B→C is −50. What's the sum?" },

      // 28: pause
      { type: 'pause' },

      // 29: Standard enthalpies of formation
      { type: 'show', action: () => showSection('sec-51-formation'),
        text: "To avoid recalculating from bond energies every time, chemists created a reference system: standard enthalpies of formation. Delta H degree f is the enthalpy change when one mole of a compound forms from its elements in their standard states — meaning 25 degrees celsius and 1 atmosphere of pressure. By convention, elements in their standard state — like O2 gas, carbon as graphite, iron as solid metal — have delta H degree f equal to zero. This gives us a universal reference point." },

      // 30: Formation formula
      { type: 'narrate',
        text: "The power of this system is the formula: delta H degree of a reaction equals the sum of delta H degree f of products minus the sum of delta H degree f of reactants. You just look up the values in a table, plug them in, and calculate. For example, burning methane: CH4 plus 2 O2 yields CO2 plus 2 H2O. Products: 1 times negative 393.5 for CO2 plus 2 times negative 285.8 for water equals negative 965.1. Reactants: 1 times negative 74.8 for methane plus 2 times zero for O2 equals negative 74.8. Delta H equals negative 965.1 minus negative 74.8 equals negative 890.3 kilojoules per mole. A very exothermic reaction." },

      // 31: Quiz 5
      { type: 'quiz',
        text: "Final calculation question.",
        question: "Given: ΔH°f(CO₂) = −393.5 kJ/mol, ΔH°f(H₂O) = −285.8 kJ/mol, ΔH°f(C₂H₂) = +227 kJ/mol. For 2C₂H₂ + 5O₂ → 4CO₂ + 2H₂O, is the reaction exothermic or endothermic?",
        options: [
          "Endothermic — acetylene has positive ΔH°f",
          "Exothermic — products have very negative ΔH°f values, so they're much lower energy",
          "Cannot tell without knowing all bond energies",
          "Neither — it's at equilibrium"
        ],
        correctIndex: 1,
        correctFeedback: "Correct! Products: 4(−393.5) + 2(−285.8) = −2145.6. Reactants: 2(+227) + 5(0) = +454. ΔH = −2145.6 − 454 = −2599.6 kJ. Massively exothermic! That's why acetylene torches burn so hot.",
        wrongFeedback: "Calculate: ΔH = Σ ΔH°f(products) − Σ ΔH°f(reactants). The products (CO₂ and H₂O) have very negative formation enthalpies, meaning they're very low energy, very stable." },

      // 32: pause
      { type: 'pause' },

      // 33: Materials connection
      { type: 'show', action: () => showSection('sec-51-materials'),
        text: "Let's connect everything to materials science — because that's where you're headed. Specific heat determines how materials respond during manufacturing. When you heat a metal to forge it, a low specific heat means it heats up fast. Bond energies determine material strength — diamond is hard because carbon-carbon bonds are strong and connected in a continuous network. Enthalpy of formation determines stability. Rust, iron oxide, has a very negative delta H f of negative 824, which tells you iron naturally wants to rust — it's energetically downhill. Phase transitions — melting and boiling — are enthalpy changes too. The energy required to melt a material depends directly on the strength of the forces holding it together. Everything in materials science connects back to energy." },

      // 34: Forward
      { type: 'show', action: () => showSection('sec-51-forward'),
        text: "Excellent work! You've completed lesson 5.1 on energy, heat, and thermochemistry. You understand what energy is, the critical difference between heat and temperature, specific heat capacity and q equals m c delta T, calorimetry, enthalpy and delta H, bond energies and how to calculate reaction energy, Hess's Law, and standard enthalpies of formation. But here's a teaser: energy alone doesn't tell the whole story. Ice melts spontaneously at room temperature — an endothermic process. How? There's another factor called entropy — the tendency toward disorder. In lesson 5.2, we'll combine energy and entropy into Gibbs free energy, which finally tells us what actually happens in nature. See you there!" },
    ];
  },
};
