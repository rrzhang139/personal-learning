/**
 * Lesson 3.1: The Periodic Table — Organization, Electron Configs, and Trends
 *
 * Focus: WHY the table is organized this way, HOW electron configurations
 * drive everything, and the math/physics behind periodic trends.
 * Goes beyond high school basics into effective nuclear charge and shielding.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock, SliderBlock } from '../blocks/Block.js';

// Import sims so they self-register
import '../sims/periodicTable.js';
import '../sims/trendViz.js';
import '../sims/electronConfig.js';

export const lesson_3_1 = {
  id: '3.1',
  lessonId: 'lesson_3_1',
  title: 'The Periodic Table — Why It Works',

  sections: [
    // --- RECAP ---
    {
      id: 'sec-3-recap',
      blocks: [
        new TextBlock({ id: '3-recap-title', tag: 'h2', html: 'Quick Recap' }),
        new CalloutBlock({ id: '3-recap-callout', html: '<strong>What we know:</strong> Atoms have protons (define the element, Z), neutrons (add mass), and electrons (determine chemistry). Electrons live in shells around the nucleus. The atomic number Z = number of protons = number of electrons in a neutral atom.' }),
        new TextBlock({ id: '3-recap-q', tag: 'p', html: "You've seen the periodic table before. But have you ever wondered <em>why</em> it's shaped that way? Why are some elements in the same column? Why do elements in a column behave similarly? The answer is <strong>electrons</strong> — specifically, how they fill orbitals." }),
      ]
    },

    // --- INTERACTIVE PERIODIC TABLE ---
    {
      id: 'sec-3-table',
      blocks: [
        new TextBlock({ id: '3-table-title', tag: 'h2', html: '3.1 The Periodic Table' }),
        new TextBlock({ id: '3-table-text', tag: 'p', html: 'Explore the table. Hover over elements to see their properties. Click to select.' }),
        new SimBlock({ id: '3-periodic-table', sim: 'periodicTable', width: 1100, height: 580 }),
      ]
    },

    // --- WHY ROWS AND COLUMNS ---
    {
      id: 'sec-3-structure',
      blocks: [
        new TextBlock({ id: '3-struct-title', tag: 'h2', html: 'Rows = Shells, Columns = Valence Electrons' }),
        new TextBlock({ id: '3-struct-text', tag: 'p', html: "The table isn't arranged randomly. Each <strong>row</strong> (period) corresponds to filling a new electron shell. Each <strong>column</strong> (group) has the same number of valence electrons — the outermost electrons that determine how an element behaves chemically." }),
        new CalloutBlock({ id: '3-struct-callout', html: '<strong>Period 1:</strong> Filling the 1s orbital (2 elements: H, He)<br><strong>Period 2:</strong> Filling 2s and 2p (8 elements: Li → Ne)<br><strong>Period 3:</strong> Filling 3s and 3p (8 elements: Na → Ar)<br><strong>Period 4:</strong> Filling 4s, 3d, and 4p (18 elements: K → Kr — this is where transition metals appear!)' }),
        new TextBlock({ id: '3-struct-key', tag: 'p', html: "Elements in the same <strong>group</strong> (column) react similarly because they have the same valence electron configuration. Lithium, sodium, and potassium are all in Group 1 — they all have <strong>one</strong> valence electron they're eager to lose." }),
      ]
    },

    // --- ELECTRON CONFIGURATIONS ---
    {
      id: 'sec-3-econfig',
      blocks: [
        new TextBlock({ id: '3-econfig-title', tag: 'h2', html: 'Electron Configurations — The Filling Rules' }),
        new TextBlock({ id: '3-econfig-text', tag: 'p', html: "Watch how electrons fill orbitals. The rules are simple but powerful:" }),
        new CalloutBlock({ id: '3-econfig-rules', html: '<strong>1. Aufbau Principle:</strong> Fill lowest-energy orbitals first (1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p)<br><br><strong>2. Pauli Exclusion:</strong> Each orbital holds max 2 electrons (one spin-up ↑, one spin-down ↓)<br><br><strong>3. Hund\'s Rule:</strong> When filling degenerate orbitals (same energy, like the three 2p orbitals), put one electron in each first (all ↑), then go back and pair them. Electrons repel each other — they spread out first.' }),
        new SimBlock({ id: '3-econfig-viz', sim: 'electronConfig', width: 700, height: 450, simOptions: { element: 6 } }),
        new SliderBlock({ id: '3-element-slider', label: 'Element (Z):', min: 1, max: 36, value: 6, color: '#00d4ff', gradient: 'linear-gradient(to right, #4fc3f7, #ffa726, #ef5350)' }),
        new TextBlock({ id: '3-econfig-label', tag: 'p', html: '<span id="eConfigLabel" style="text-align:center;display:block;font-size:1.2em;color:var(--accent)">Carbon (Z=6): 1s² 2s² 2p²</span>' }),
      ]
    },

    // --- EFFECTIVE NUCLEAR CHARGE (the WHY) ---
    {
      id: 'sec-3-zeff',
      blocks: [
        new TextBlock({ id: '3-zeff-title', tag: 'h2', html: 'Effective Nuclear Charge — Why Trends Exist' }),
        new TextBlock({ id: '3-zeff-text', tag: 'p', html: "Here's the key concept that explains <em>all</em> periodic trends. It's not taught well in most classes, but once you get it, everything clicks." }),
        new CalloutBlock({ id: '3-zeff-intro', html: "The nucleus has Z protons pulling electrons in. But inner-shell electrons <strong>shield</strong> outer electrons from the full nuclear charge. The <em>effective</em> nuclear charge (Z<sub>eff</sub>) is what an outer electron actually feels." }),
        new MathBlock({ id: '3-zeff-math', label: 'Effective Nuclear Charge:', equation: 'Z<sub>eff</sub> = Z − σ', symbols: [
          { symbol: 'Z<sub>eff</sub>', name: 'Effective nuclear charge', meaning: 'The net positive charge felt by a valence electron' },
          { symbol: 'Z', name: 'Atomic number', meaning: 'Total protons in the nucleus' },
          { symbol: 'σ', name: 'Shielding constant', meaning: 'How much the inner electrons block the nuclear charge (≈ number of core electrons)' },
        ]}),
        new CalloutBlock({ id: '3-zeff-example', html: '<strong>Example — Sodium (Na, Z=11):</strong><br>Electron config: 1s² 2s² 2p⁶ 3s¹<br>The valence electron (3s¹) has 10 inner electrons shielding it.<br>Z<sub>eff</sub> ≈ 11 − 10 = <strong>+1</strong><br>That lone valence electron feels only ~1 proton of pull. It\'s loosely held → easily lost → Na⁺ ion.<br><br><strong>Example — Chlorine (Cl, Z=17):</strong><br>Electron config: 1s² 2s² 2p⁶ 3s² 3p⁵<br>Valence electrons (3s² 3p⁵) have 10 inner electrons shielding.<br>Z<sub>eff</sub> ≈ 17 − 10 = <strong>+7</strong><br>Valence electrons feel 7 protons of pull. Held tightly → wants to <em>gain</em> one more electron.' }),
        new TextBlock({ id: '3-zeff-key', tag: 'p', html: '<strong>This is the single most important concept for understanding trends:</strong> As you move <em>across</em> a period (left to right), Z increases but shielding stays roughly the same (same shell). So Z<sub>eff</sub> increases → electrons are pulled in tighter.' }),
      ]
    },

    // --- ATOMIC RADIUS TREND ---
    {
      id: 'sec-3-radius',
      blocks: [
        new TextBlock({ id: '3-radius-title', tag: 'h2', html: 'Trend 1: Atomic Radius' }),
        new TextBlock({ id: '3-radius-text', tag: 'p', html: "Now watch what Z<sub>eff</sub> does to atom size:" }),
        new SimBlock({ id: '3-trend-radius', sim: 'trendViz', width: 900, height: 400, simOptions: { trend: 'atomicRadius' } }),
        new CalloutBlock({ id: '3-radius-explain', html: '<strong>Across a period (→):</strong> Atomic radius <em>decreases</em>. Why? More protons pulling on the same shell, same shielding → higher Z<sub>eff</sub> → electrons squeezed closer to nucleus.<br><br><strong>Down a group (↓):</strong> Atomic radius <em>increases</em>. Why? You\'re adding entire new shells. Each new shell is farther from the nucleus, even though Z<sub>eff</sub> also increases.' }),
        new MathBlock({ id: '3-radius-math', label: 'Why radius shrinks across a period:', equation: 'Z<sub>eff</sub> ↑ → F<sub>pull</sub> ↑ → r ↓', symbols: [
          { symbol: 'F<sub>pull</sub>', name: 'Electrostatic pull', meaning: 'Force on valence electron = k · Z<sub>eff</sub> · e / r²' },
          { symbol: 'r', name: 'Atomic radius', meaning: 'Distance of valence electron from nucleus' },
        ]}),
      ]
    },

    // --- IONIZATION ENERGY TREND ---
    {
      id: 'sec-3-ie',
      blocks: [
        new TextBlock({ id: '3-ie-title', tag: 'h2', html: 'Trend 2: Ionization Energy' }),
        new TextBlock({ id: '3-ie-text', tag: 'p', html: "Ionization energy (IE) is the energy needed to <strong>rip away</strong> the outermost electron. It's the atom's grip strength." }),
        new SimBlock({ id: '3-trend-ie', sim: 'trendViz', width: 900, height: 400, simOptions: { trend: 'ionizationEnergy' } }),
        new CalloutBlock({ id: '3-ie-explain', html: '<strong>Across a period (→):</strong> IE <em>increases</em>. Higher Z<sub>eff</sub> → electron held more tightly → harder to remove.<br><br><strong>Down a group (↓):</strong> IE <em>decreases</em>. Valence electron is farther from nucleus in a higher shell → easier to remove.<br><br><strong>Notice the saw-tooth pattern!</strong> Noble gases (He, Ne, Ar, Kr) have the highest IE in each period — full shells are very stable. Alkali metals (Li, Na, K) have the lowest — they WANT to lose that one electron.' }),
        new MathBlock({ id: '3-ie-math', label: 'First Ionization Energy:', equation: 'X(g) → X⁺(g) + e⁻ &nbsp;&nbsp; ΔE = IE₁', symbols: [
          { symbol: 'IE₁', name: 'First ionization energy', units: 'kJ/mol', meaning: 'Energy to remove the least tightly bound electron' },
          { symbol: 'X(g)', name: 'Gaseous atom', meaning: 'Isolated atom in gas phase' },
        ]}),
      ]
    },

    // --- ELECTRONEGATIVITY TREND ---
    {
      id: 'sec-3-en',
      blocks: [
        new TextBlock({ id: '3-en-title', tag: 'h2', html: 'Trend 3: Electronegativity' }),
        new TextBlock({ id: '3-en-text', tag: 'p', html: "Electronegativity is how strongly an atom <strong>pulls on shared electrons</strong> when bonded to another atom. This is crucial for understanding bonding (Module 4)." }),
        new SimBlock({ id: '3-trend-en', sim: 'trendViz', width: 900, height: 400, simOptions: { trend: 'electronegativity' } }),
        new CalloutBlock({ id: '3-en-explain', html: '<strong>Across a period (→):</strong> Electronegativity <em>increases</em>. Same reason: higher Z<sub>eff</sub> → atom pulls harder on electrons.<br><br><strong>Down a group (↓):</strong> Electronegativity <em>decreases</em>. Valence shell is farther from nucleus → weaker pull.<br><br><strong>Fluorine (F) is the most electronegative element</strong> at 3.98. It has a small radius and high Z<sub>eff</sub> — it desperately wants one more electron to complete its shell.' }),
        new MathBlock({ id: '3-en-math', label: 'Pauling Electronegativity Scale:', equation: 'χ ∝ (IE + EA) / 2', symbols: [
          { symbol: 'χ', name: 'Electronegativity', meaning: 'Tendency to attract shared electrons in a bond (dimensionless, 0–4 scale)' },
          { symbol: 'IE', name: 'Ionization energy', meaning: 'How tightly the atom holds its own electrons' },
          { symbol: 'EA', name: 'Electron affinity', meaning: 'How much energy is released when gaining an electron' },
        ]}),
      ]
    },

    // --- UNIFIED VIEW ---
    {
      id: 'sec-3-unified',
      blocks: [
        new TextBlock({ id: '3-unified-title', tag: 'h2', html: 'The Unified Picture' }),
        new CalloutBlock({ id: '3-unified-callout', html: '<strong>All three trends have the same root cause: Z<sub>eff</sub></strong><br><br>Across a period → Z<sub>eff</sub> ↑ → atoms get smaller, hold electrons tighter, pull harder on shared electrons<br><br>Down a group → new shells → atoms get bigger, hold electrons looser, pull less on shared electrons<br><br>This is the <em>one concept</em> that explains atomic radius, ionization energy, AND electronegativity. Master Z<sub>eff</sub> and you understand the periodic table.' }),
        new TableBlock({ id: '3-unified-table', maxWidth: '800px',
          headers: ['Trend', 'Across Period (→)', 'Down Group (↓)', 'Root Cause'],
          rows: [
            ['Atomic Radius', { text: '↓ Decreases', style: 'color:#4fc3f7' }, { text: '↑ Increases', style: 'color:#ef5350' }, 'Z<sub>eff</sub> vs. shell number'],
            ['Ionization Energy', { text: '↑ Increases', style: 'color:#ef5350' }, { text: '↓ Decreases', style: 'color:#4fc3f7' }, 'Z<sub>eff</sub> → grip on electrons'],
            ['Electronegativity', { text: '↑ Increases', style: 'color:#ef5350' }, { text: '↓ Decreases', style: 'color:#4fc3f7' }, 'Z<sub>eff</sub> → pull on shared e⁻'],
          ]
        }),
      ]
    },

    // --- WHY THIS MATTERS ---
    {
      id: 'sec-3-forward',
      blocks: [
        new TextBlock({ id: '3-fwd-title', tag: 'h2', html: 'Coming Up: Chemical Bonding' }),
        new TextBlock({ id: '3-fwd-text', tag: 'p', html: "Now you understand <em>why</em> atoms behave differently. In Module 4, we'll see how this drives <strong>bonding</strong>:" }),
        new CalloutBlock({ id: '3-fwd-callout', html: '• Low electronegativity elements (metals) <strong>lose electrons</strong> → metallic and ionic bonds<br>• High electronegativity elements (nonmetals) <strong>share or steal electrons</strong> → covalent and ionic bonds<br>• The electronegativity <em>difference</em> between two bonded atoms determines what type of bond forms<br><br>This is where chemistry gets really interesting — and it connects directly to <strong>materials science</strong> (why steel is strong, why glass is transparent, why semiconductors work).' }),
      ]
    },
  ],

  stepMeta: [
    { icon: '📋', label: 'Recap', kind: 'narrate' },
    null,
    // Periodic table
    { icon: '🗂', label: 'Table', kind: 'narrate' },
    { icon: '🔍', label: 'Explore', kind: 'checkpoint' },
    null,
    // Structure
    { icon: '📊', label: 'Rows/Cols', kind: 'narrate' },
    { icon: '💡', label: 'Groups', kind: 'narrate' },
    null,
    // Electron configs
    { icon: '⚛', label: 'Config', kind: 'narrate' },
    { icon: '🎮', label: 'Fill e⁻', kind: 'checkpoint' },
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },
    null,
    // Zeff
    { icon: '🎯', label: 'Z_eff', kind: 'narrate' },
    { icon: '📐', label: 'Math', kind: 'narrate' },
    { icon: '💡', label: 'Examples', kind: 'narrate' },
    null,
    // Radius
    { icon: '📏', label: 'Radius', kind: 'narrate' },
    { icon: '📐', label: 'Why', kind: 'narrate' },
    null,
    // IE
    { icon: '⚡', label: 'IE', kind: 'narrate' },
    { icon: '🔍', label: 'Pattern', kind: 'narrate' },
    null,
    // EN
    { icon: '🧲', label: 'EN', kind: 'narrate' },
    { icon: '💡', label: 'Fluorine', kind: 'narrate' },
    null,
    // Unified + quiz
    { icon: '🔗', label: 'Unified', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },
    { icon: '🎉', label: 'Done!', kind: 'narrate' },
  ],

  buildSteps(showSection, runner) {
    const eConfigViz = runner.blockInstances.find(b => b.id === '3-econfig-viz');
    const elementSlider = runner.blockInstances.find(b => b.id === '3-element-slider');

    // Element names for slider label
    const ELEM_NAMES = [null,'Hydrogen','Helium','Lithium','Beryllium','Boron','Carbon','Nitrogen','Oxygen','Fluorine','Neon','Sodium','Magnesium','Aluminum','Silicon','Phosphorus','Sulfur','Chlorine','Argon','Potassium','Calcium','Scandium','Titanium','Vanadium','Chromium','Manganese','Iron','Cobalt','Nickel','Copper','Zinc','Gallium','Germanium','Arsenic','Selenium','Bromine','Krypton'];
    const ELEM_SYMS = [null,'H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'];

    // Wire slider to electron config viz
    if (elementSlider && eConfigViz) {
      elementSlider.onChange = (v) => {
        if (eConfigViz.renderer?.setElement) {
          eConfigViz.renderer.setElement(v);
        }
        const label = document.getElementById('eConfigLabel');
        if (label) label.textContent = `${ELEM_NAMES[v] || '?'} (Z=${v}): ${ELEM_SYMS[v] || '?'}`;
      };
    }

    return [
      // Recap
      { type: 'show', action: () => showSection('sec-3-recap'),
        text: "Let's build on what we know. Atoms have protons, neutrons, and electrons. The atomic number Z tells you how many protons, and in a neutral atom, that's also the number of electrons. Electrons fill shells around the nucleus. Now we're going to see why the periodic table is structured the way it is — and it all comes down to how those electrons arrange themselves." },
      { type: 'pause' },

      // Periodic table
      { type: 'show', action: () => showSection('sec-3-table'),
        text: "Here's the full periodic table. Go ahead and explore it — hover over elements to see their properties, click to select one. You'll notice elements are color-coded by category." },
      { type: 'checkpoint',
        instruction: 'Hover over and explore at least 3 different elements on the periodic table',
        text: "Take a moment to explore. Hover over a few elements across different rows and columns. Notice how properties change as you move around the table.",
        check: () => {
          const ptSim = runner.blockInstances.find(b => b.id === '3-periodic-table');
          return ptSim?.renderer?.selectedElement != null;
        },
        confirmText: "Great. Notice anything? Elements in the same column tend to have similar properties. That's not a coincidence — it's because of their electron configurations." },
      { type: 'pause' },

      // Structure
      { type: 'show', action: () => showSection('sec-3-structure'),
        text: "Here's the big insight: rows correspond to electron shells, and columns correspond to valence electrons. Period 1 fills the 1s orbital — just 2 elements. Period 2 fills 2s and 2p — 8 elements. Period 3 does the same for shell 3. Then Period 4 gets interesting — it fills 4s, then jumps back to 3d for the transition metals, then finishes with 4p. That's why the transition metals sit in the middle." },
      { type: 'narrate',
        text: "Elements in the same group react similarly because they have the same number of valence electrons. Group 1 — lithium, sodium, potassium — all have one valence electron. Group 17 — the halogens — all have seven. Group 18 — the noble gases — have a full outer shell. Same valence electrons, same chemical personality." },
      { type: 'pause' },

      // Electron configs
      { type: 'show', action: () => showSection('sec-3-econfig'),
        text: "Let's watch electrons fill orbitals in real time. There are three rules. First, the Aufbau principle: fill from lowest energy up. Second, Pauli exclusion: each orbital holds max 2 electrons, and they must have opposite spin. Third, Hund's rule: when you have multiple orbitals at the same energy, like the three 2p orbitals, spread the electrons out before pairing them up." },
      { type: 'checkpoint',
        instruction: 'Use the Element slider to explore electron configurations. Try Z=10 (Neon) to see a full shell.',
        text: "Use the slider to change the element and watch the electrons fill. Try setting it to 10 for Neon — a noble gas with a completely full second shell. Then try 11 for Sodium — see how that one extra electron starts a new shell.",
        check: () => elementSlider && (elementSlider.getValue() === 10 || elementSlider.getValue() === 11),
        confirmText: "See the difference? Neon has a perfectly full set of orbitals. Sodium has that one lonely electron in a brand new shell. That's why sodium is so reactive — it wants to dump that electron and have neon's stable configuration." },
      { type: 'quiz',
        text: "Quick check on electron configurations.",
        question: "Why does Potassium (Z=19) fill the 4s orbital before 3d?",
        options: ["Because 4 is bigger than 3", "Because 4s has lower energy than 3d", "Because 3d is already full", "It doesn't — 3d fills first"],
        correctIndex: 1,
        correctFeedback: "Right! The 4s orbital is slightly lower in energy than 3d, so by the Aufbau principle it fills first. This is why potassium and calcium are in periods before the transition metals.",
        wrongFeedback: "Think about the Aufbau principle: electrons fill the lowest-energy orbital first. It turns out 4s has slightly lower energy than 3d." },
      { type: 'pause' },

      // Zeff
      { type: 'show', action: () => showSection('sec-3-zeff'),
        text: "Now here's the concept that unlocks everything about periodic trends: effective nuclear charge, Z eff. The nucleus has Z protons pulling electrons toward it. But the inner electrons shield the outer electrons from feeling the full pull. What the outer electron actually feels — the effective nuclear charge — is Z minus the shielding." },
      { type: 'narrate',
        text: "The formula is beautifully simple. Z eff equals Z minus sigma, where sigma is the shielding constant — roughly equal to the number of core electrons. This one equation explains why atoms shrink across a period, why ionization energy increases, and why electronegativity goes up." },
      { type: 'narrate',
        text: "Let's see it in action. Sodium has Z equals 11, with 10 core electrons shielding. So its valence electron feels only about plus 1. That electron is barely held — sodium easily loses it. Chlorine has Z equals 17, same 10 core electrons. Its valence electrons feel about plus 7. They're gripped tightly. And chlorine wants one MORE electron to complete its shell. This difference in Z eff is why sodium gives an electron to chlorine when they meet — forming table salt, NaCl." },
      { type: 'pause' },

      // Atomic radius
      { type: 'show', action: () => showSection('sec-3-radius'),
        text: "Now let's see the three big periodic trends, starting with atomic radius. Watch the pattern in this chart. Across each period — left to right — radius decreases. The atoms get smaller! Down each group, they get bigger." },
      { type: 'narrate',
        text: "Why does this happen? Across a period, you're adding protons to the nucleus and electrons to the SAME shell. The shielding stays roughly the same, but Z goes up. So Z eff increases — the electrons are pulled in tighter, and the atom shrinks. Down a group, you're adding entire new shells. Even though Z eff also increases, the new shell is physically farther from the nucleus. Shell number wins — atoms get bigger." },
      { type: 'pause' },

      // Ionization energy
      { type: 'show', action: () => showSection('sec-3-ie'),
        text: "Next: ionization energy — the energy it takes to rip away the outermost electron. This is basically asking: how tightly is the atom holding onto its valence electron?" },
      { type: 'narrate',
        text: "See the saw-tooth pattern? The noble gases — helium, neon, argon, krypton — spike up. Full shells are incredibly stable. The alkali metals — lithium, sodium, potassium — dip down. They have just one loosely held electron. Across each period, ionization energy generally increases because Z eff increases — the grip gets tighter. Down each group, it decreases because the valence electron is farther away and easier to pull off." },
      { type: 'pause' },

      // Electronegativity
      { type: 'show', action: () => showSection('sec-3-en'),
        text: "Finally, electronegativity — how strongly an atom pulls on SHARED electrons when bonded to another atom. This is the trend that matters most for understanding chemical bonds." },
      { type: 'narrate',
        text: "Same pattern as ionization energy. Increases across a period, decreases down a group. Fluorine is the champion at 3.98 — it's small, with a high Z eff, and it desperately wants one more electron. This is why fluorine is the most reactive nonmetal. On the other end, cesium and francium at the bottom left have the lowest electronegativity — they practically throw their electron at anything nearby." },
      { type: 'pause' },

      // Unified
      { type: 'show', action: () => showSection('sec-3-unified'),
        text: "Here's the beautiful thing: all three trends come from the same root cause. Z eff. Across a period, Z eff goes up, so atoms shrink, hold electrons tighter, and pull harder on shared electrons. Down a group, new shells dominate, so atoms expand, hold electrons looser, and pull less. One concept explains everything." },
      { type: 'quiz',
        text: "Final question to test your understanding of periodic trends.",
        question: "Sulfur (S, Z=16) and Oxygen (O, Z=8) are in the same group. Which has a HIGHER ionization energy, and why?",
        options: [
          "Sulfur — it has more protons",
          "Oxygen — its valence electrons are closer to the nucleus (smaller atom, higher Z_eff felt)",
          "They're the same — same group means same IE",
          "Sulfur — more electrons means more energy"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! Oxygen is higher in the group (Period 2 vs 3). Its valence electrons are in a closer shell, so despite fewer protons, the Z_eff they feel per unit distance is greater. Smaller atom + closer electrons = harder to ionize.",
        wrongFeedback: "Think about position in the group. Oxygen is ABOVE sulfur. Its valence electrons are in shell 2 (closer to nucleus) vs sulfur's shell 3 (farther). Which would be harder to pull away?" },

      // Forward
      { type: 'show', action: () => showSection('sec-3-forward'),
        text: "Outstanding work! You now understand the periodic table at a deeper level than most people. You know that rows are shells, columns are valence electrons, and all the major trends — radius, ionization energy, electronegativity — are driven by effective nuclear charge. Next up in Module 4: chemical bonding. We'll see how these trends determine whether atoms share, steal, or pool their electrons. And that's the key to understanding materials — why metals conduct, why diamonds are hard, why water is weird. See you there!" },
    ];
  },
};
