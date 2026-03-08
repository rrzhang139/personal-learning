/**
 * Lesson 4.2: Molecular Shape & Intermolecular Forces
 *
 * Picks up from 4.1 (bonding types). Answers: why is H₂O liquid but CO₂ gas?
 * Covers VSEPR theory (lone pairs push bonds), molecular polarity,
 * then the three intermolecular forces (LDF, dipole-dipole, H-bonding).
 * Connects IMFs to boiling points and real-world material properties.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock, SliderBlock } from '../blocks/Block.js';

// Import sims
import '../sims/vseprViz.js';
import '../sims/imfViz.js';

export const lesson_4_2 = {
  id: '4.2',
  lessonId: 'lesson_4_2',
  title: 'Molecular Shape & Intermolecular Forces',

  sections: [
    // --- THE PUZZLE ---
    {
      id: 'sec-42-puzzle',
      blocks: [
        new TextBlock({ id: '42-puzzle-title', tag: 'h2', html: 'The Puzzle' }),
        new CalloutBlock({ id: '42-puzzle-recap', html: '<strong>From 4.1:</strong> You know the three bond types — ionic (transfer), covalent (share), metallic (pool). You know that ΔEN determines which type forms. But here\'s a mystery we haven\'t solved...' }),
        new TextBlock({ id: '42-puzzle-text', tag: 'p', html: "Water (H₂O) boils at 100°C. Carbon dioxide (CO₂) boils at −78°C. Both are small covalent molecules. Both have similar molecular weights (18 vs 44). So <strong>why is water a liquid at room temperature while CO₂ is a gas?</strong> The answer isn't about the bonds <em>inside</em> each molecule. It's about the forces <em>between</em> molecules. And those forces depend on <strong>molecular shape</strong>." }),
      ]
    },

    // --- VSEPR INTRO ---
    {
      id: 'sec-42-vsepr',
      blocks: [
        new TextBlock({ id: '42-vsepr-title', tag: 'h2', html: 'Molecular Shape: VSEPR Theory' }),
        new TextBlock({ id: '42-vsepr-text', tag: 'p', html: "VSEPR stands for Valence Shell Electron Pair Repulsion. The name sounds intimidating, but the idea is dead simple:" }),
        new CalloutBlock({ id: '42-vsepr-rule', html: '<strong>The VSEPR rule:</strong> Electron pairs around a central atom <strong>repel each other</strong> and spread out as far as possible.<br><br>That\'s it. Electrons are negative — they push each other away. So they arrange themselves to maximize their distance. The arrangement determines the molecule\'s shape.' }),
        new TextBlock({ id: '42-vsepr-key', tag: 'p', html: "But here's the twist: <strong>lone pairs</strong> (unbonded electron pairs) also repel — and they repel <em>more</em> than bonding pairs because they're held closer to the central atom. This is why water is bent, not straight." }),
      ]
    },

    // --- SHAPES INTERACTIVE ---
    {
      id: 'sec-42-shapes',
      blocks: [
        new TextBlock({ id: '42-shapes-title', tag: 'h2', html: 'The Five Key Shapes' }),
        new TextBlock({ id: '42-shapes-text', tag: 'p', html: "Click different molecules to see how electron pair repulsion determines their geometry:" }),
        new SimBlock({ id: '42-vsepr-viz', sim: 'vseprViz', width: 900, height: 500, simOptions: { molecule: 'CH4' } }),
        new TableBlock({ id: '42-shapes-table', maxWidth: '900px',
          headers: ['Molecule', 'Bonding pairs', 'Lone pairs', 'Shape', 'Bond angle'],
          rows: [
            ['BeCl₂', '2', '0', { text: 'Linear', style: 'color:#00d4ff;font-weight:bold' }, '180°'],
            ['BF₃', '3', '0', { text: 'Trigonal planar', style: 'color:#81c784;font-weight:bold' }, '120°'],
            ['CH₄', '4', '0', { text: 'Tetrahedral', style: 'color:#ffa726;font-weight:bold' }, '109.5°'],
            ['NH₃', '3', '1', { text: 'Trigonal pyramidal', style: 'color:#ab47bc;font-weight:bold' }, '107°'],
            ['H₂O', '2', '2', { text: 'Bent', style: 'color:#ef5350;font-weight:bold' }, '104.5°'],
          ]
        }),
      ]
    },

    // --- LONE PAIR EFFECT ---
    {
      id: 'sec-42-lonepair',
      blocks: [
        new TextBlock({ id: '42-lp-title', tag: 'h2', html: 'Why Lone Pairs Change the Shape' }),
        new TextBlock({ id: '42-lp-text', tag: 'p', html: "Compare CH₄, NH₃, and H₂O. They all have 4 electron pairs around the central atom. But:" }),
        new CalloutBlock({ id: '42-lp-explain', html: '<strong>CH₄:</strong> 4 bonding pairs, 0 lone pairs → perfect tetrahedral → 109.5°<br><br><strong>NH₃:</strong> 3 bonding pairs, 1 lone pair → the lone pair squeezes the bonds closer together → 107° (not 109.5°) → <em>trigonal pyramidal</em><br><br><strong>H₂O:</strong> 2 bonding pairs, 2 lone pairs → two lone pairs squeeze even harder → 104.5° → <em>bent</em><br><br>The <strong>electron geometry</strong> is tetrahedral in all three cases. But the <strong>molecular geometry</strong> — what you see if you ignore lone pairs — changes because lone pairs take up more room.' }),
        new MathBlock({ id: '42-lp-math', label: 'The lone pair compression effect:', equation: 'Lone pair repulsion > Bond pair repulsion', symbols: [
          { symbol: 'LP', name: 'Lone pair', meaning: 'Closer to nucleus, spreads out more, pushes harder on neighbors' },
          { symbol: 'BP', name: 'Bonding pair', meaning: 'Shared between two nuclei, more constrained, pushes less' },
        ]}),
      ]
    },

    // --- SHAPE → POLARITY ---
    {
      id: 'sec-42-polarity',
      blocks: [
        new TextBlock({ id: '42-pol-title', tag: 'h2', html: 'Shape Determines Polarity' }),
        new TextBlock({ id: '42-pol-text', tag: 'p', html: "Now here's why shape matters so much. A molecule can have polar bonds but still be <strong>nonpolar overall</strong> — if the shape makes the dipoles cancel out." }),
        new CalloutBlock({ id: '42-pol-explain', html: '<strong>CO₂ — polar bonds, nonpolar molecule:</strong><br>Each C=O bond is polar (ΔEN = 0.89). But CO₂ is linear (180°) — the two dipoles point in <em>opposite directions</em> and cancel. Net dipole = 0. Nonpolar molecule.<br><br><strong>H₂O — polar bonds, polar molecule:</strong><br>Each O—H bond is polar (ΔEN = 1.24). Water is bent (104.5°) — the dipoles do NOT cancel. They add up to a net dipole pointing toward oxygen. Polar molecule.<br><br><strong>This is the answer to our puzzle!</strong> Water is polar because it\'s bent. CO₂ is nonpolar because it\'s linear. Same kinds of bonds, completely different molecular behavior — all because of shape.' }),
        new TableBlock({ id: '42-pol-table', maxWidth: '800px',
          headers: ['Molecule', 'Shape', 'Bond polarity', 'Dipoles cancel?', 'Molecular polarity'],
          rows: [
            ['CO₂', 'Linear', 'Polar (ΔEN=0.89)', { text: 'Yes — opposite directions', style: 'color:#81c784' }, { text: 'NONPOLAR', style: 'color:#4fc3f7;font-weight:bold' }],
            ['H₂O', 'Bent', 'Polar (ΔEN=1.24)', { text: 'No — same side', style: 'color:#ef5350' }, { text: 'POLAR', style: 'color:#ff9800;font-weight:bold' }],
            ['CH₄', 'Tetrahedral', 'Slightly polar', { text: 'Yes — symmetrical', style: 'color:#81c784' }, { text: 'NONPOLAR', style: 'color:#4fc3f7;font-weight:bold' }],
            ['NH₃', 'Trig. pyramidal', 'Polar (ΔEN=0.84)', { text: 'No — net upward', style: 'color:#ef5350' }, { text: 'POLAR', style: 'color:#ff9800;font-weight:bold' }],
          ]
        }),
      ]
    },

    // --- INTERMOLECULAR FORCES INTRO ---
    {
      id: 'sec-42-imf-intro',
      blocks: [
        new TextBlock({ id: '42-imf-title', tag: 'h2', html: 'Intermolecular Forces — The Glue Between Molecules' }),
        new TextBlock({ id: '42-imf-text', tag: 'p', html: "Now we get to the payoff. Bonds hold atoms together <em>within</em> a molecule. But what holds molecules to <em>each other</em>? These are called <strong>intermolecular forces (IMFs)</strong>, and they're much weaker than bonds — but they determine boiling point, viscosity, surface tension, and whether something is solid, liquid, or gas." }),
        new CalloutBlock({ id: '42-imf-key', html: '<strong>Critical distinction:</strong><br><br>• <strong>Intramolecular</strong> forces = bonds <em>within</em> a molecule (strong: 150–1000 kJ/mol)<br>• <strong>Intermolecular</strong> forces = attractions <em>between</em> molecules (weak: 0.5–40 kJ/mol)<br><br>When water boils, you\'re NOT breaking O—H bonds. You\'re overcoming the attractions between H₂O molecules. The molecules themselves stay intact — they just fly apart from each other.' }),
      ]
    },

    // --- THREE IMF TYPES ---
    {
      id: 'sec-42-imf-types',
      blocks: [
        new TextBlock({ id: '42-imf-types-title', tag: 'h2', html: 'The Three Types of IMFs' }),
        new TextBlock({ id: '42-imf-types-text', tag: 'p', html: "There are three intermolecular forces, from weakest to strongest:" }),
        new SimBlock({ id: '42-imf-viz', sim: 'imfViz', width: 900, height: 500, simOptions: { mode: 'compare' } }),
      ]
    },

    // --- LDF ---
    {
      id: 'sec-42-ldf',
      blocks: [
        new TextBlock({ id: '42-ldf-title', tag: 'h3', html: '1. London Dispersion Forces (LDF)' }),
        new CalloutBlock({ id: '42-ldf-explain', html: '<strong>Present in ALL molecules</strong> — even nonpolar ones like Ar, N₂, CH₄.<br><br>How they work: Electrons are constantly moving. At any instant, one side of a molecule might have slightly more electron density — a <strong>temporary dipole</strong>. This induces a dipole in a neighboring molecule. The two temporary dipoles attract briefly, then vanish. Then it happens again somewhere else.<br><br>Individually, each interaction is tiny. But they add up — especially in big molecules with many electrons.<br><br><strong>Rule:</strong> More electrons (larger molecule) → stronger LDF → higher boiling point.<br>That\'s why F₂ (−188°C), Cl₂ (−34°C), Br₂ (59°C), I₂ (184°C) — same group, increasing size and LDF.' }),
      ]
    },

    // --- DIPOLE-DIPOLE ---
    {
      id: 'sec-42-dd',
      blocks: [
        new TextBlock({ id: '42-dd-title', tag: 'h3', html: '2. Dipole-Dipole Forces' }),
        new CalloutBlock({ id: '42-dd-explain', html: '<strong>Present in polar molecules</strong> — molecules with a permanent net dipole.<br><br>How they work: The δ+ end of one molecule attracts the δ− end of a neighbor. These are <em>permanent</em> attractions — unlike LDF\'s flickering dipoles. So they\'re stronger.<br><br><strong>Example:</strong> HCl molecules align so H (δ+) faces Cl (δ−) of the next molecule. This is why HCl (MW=36.5) boils at −85°C, while Ar (MW=40, similar mass but nonpolar) boils at −186°C. Same size, but HCl has dipole-dipole forces ON TOP of LDF.' }),
      ]
    },

    // --- HYDROGEN BONDING ---
    {
      id: 'sec-42-hbond',
      blocks: [
        new TextBlock({ id: '42-hb-title', tag: 'h3', html: '3. Hydrogen Bonding — The Strongest IMF' }),
        new CalloutBlock({ id: '42-hb-explain', html: '<strong>A special, extra-strong type of dipole-dipole force.</strong><br><br>Occurs when H is bonded to a very electronegative atom: <strong>N, O, or F</strong>.<br><br>Why is it special? Hydrogen is tiny — it\'s just a proton with no inner electron shells. When bonded to O (or N or F), the electron is pulled far away, leaving the bare proton exposed. This exposed δ+ interacts very strongly with a lone pair on a neighboring molecule\'s O, N, or F.<br><br><strong>H-bonds are 5–10× stronger than regular dipole-dipole forces.</strong><br><br>This is why water is extraordinary: high boiling point (100°C vs −60°C predicted by size alone), high surface tension, ice floats (H-bond network is open/hexagonal → less dense than liquid).' }),
        new MathBlock({ id: '42-hb-math', label: 'Hydrogen bond strength:', equation: 'X—H···Y (where X, Y = N, O, or F)', symbols: [
          { symbol: 'X—H', name: 'Donor', meaning: 'The polar bond providing the exposed H (e.g., O—H in water)' },
          { symbol: '···', name: 'Hydrogen bond', meaning: 'The intermolecular attraction (~10–40 kJ/mol)' },
          { symbol: 'Y', name: 'Acceptor', meaning: 'The lone pair on N, O, or F of a neighboring molecule' },
        ]}),
      ]
    },

    // --- BOILING POINT TRENDS ---
    {
      id: 'sec-42-bp',
      blocks: [
        new TextBlock({ id: '42-bp-title', tag: 'h2', html: 'IMFs Explain Boiling Points' }),
        new TextBlock({ id: '42-bp-text', tag: 'p', html: "Boiling point = the temperature where intermolecular forces are overcome. Stronger IMFs → higher boiling point. It's that simple." }),
        new SimBlock({ id: '42-bp-viz', sim: 'imfViz', width: 900, height: 500, simOptions: { mode: 'boiling' } }),
        new TableBlock({ id: '42-bp-table', maxWidth: '850px',
          headers: ['Molecule', 'MW', 'IMF type', 'BP (°C)', 'Why?'],
          rows: [
            ['He', '4', { text: 'LDF only', style: 'color:#4fc3f7' }, '−269', 'Tiny, 2 electrons, barely any LDF'],
            ['Ar', '40', { text: 'LDF only', style: 'color:#4fc3f7' }, '−186', 'Bigger than He, more LDF but still weak'],
            ['HCl', '36.5', { text: 'LDF + Dipole-dipole', style: 'color:#81c784' }, '−85', 'Similar size to Ar, but permanent dipole adds attraction'],
            ['HF', '20', { text: 'LDF + H-bonding', style: 'color:#ff9800' }, '19.5', 'Smaller than HCl but H-bonds are much stronger'],
            ['H₂O', '18', { text: 'LDF + H-bonding', style: 'color:#ff9800' }, '100', 'Each H₂O makes up to 4 H-bonds → network'],
            ['C₂H₅OH', '46', { text: 'LDF + H-bonding', style: 'color:#ff9800' }, '78', 'O—H group allows H-bonding'],
          ]
        }),
      ]
    },

    // --- WATER: WHY IT'S WEIRD ---
    {
      id: 'sec-42-water',
      blocks: [
        new TextBlock({ id: '42-water-title', tag: 'h2', html: 'Water: The Most Extraordinary Molecule' }),
        new TextBlock({ id: '42-water-text', tag: 'p', html: "Everything strange about water comes from H-bonding + its bent shape:" }),
        new SimBlock({ id: '42-water-viz', sim: 'imfViz', width: 900, height: 500, simOptions: { mode: 'water' } }),
        new CalloutBlock({ id: '42-water-explain', html: '<strong>Water\'s anomalies — all explained by H-bonding:</strong><br><br>• <strong>Unusually high BP (100°C):</strong> Based on molecular weight alone, it should boil at ~−60°C. H-bonding adds ~160°C to the expected BP.<br><br>• <strong>Ice floats:</strong> In liquid water, H-bonds break and reform constantly. In ice, they lock into an open hexagonal lattice with empty space → ice is ~9% less dense than liquid water. Life on Earth depends on this — if ice sank, lakes would freeze solid from the bottom up.<br><br>• <strong>High surface tension:</strong> H-bonds pull surface molecules inward → water beads up on surfaces, bugs can walk on it.<br><br>• <strong>Universal solvent:</strong> Water\'s polarity lets it dissolve ionic compounds (surrounds ions) and other polar molecules.' }),
      ]
    },

    // --- THE ANSWER ---
    {
      id: 'sec-42-answer',
      blocks: [
        new TextBlock({ id: '42-ans-title', tag: 'h2', html: 'Mystery Solved' }),
        new CalloutBlock({ id: '42-ans-box', html: '<strong>Why is H₂O a liquid but CO₂ a gas at room temperature?</strong><br><br>Both have covalent bonds. But:<br><br><strong>H₂O:</strong> Bent shape → polar molecule → strong H-bonds between molecules → BP = 100°C → liquid at 25°C<br><br><strong>CO₂:</strong> Linear shape → dipoles cancel → nonpolar molecule → only weak LDF between molecules → BP = −78°C → gas at 25°C<br><br>The bond <em>inside</em> CO₂ is actually stronger than the bond in H₂O. But the forces <em>between</em> water molecules are much stronger than between CO₂ molecules. Shape → polarity → IMFs → boiling point. That\'s the chain.' }),
      ]
    },

    // --- BIG PICTURE ---
    {
      id: 'sec-42-bigpicture',
      blocks: [
        new TextBlock({ id: '42-big-title', tag: 'h2', html: 'The Complete Chain' }),
        new MathBlock({ id: '42-big-chain', label: 'From electrons to material properties:', equation: 'Electron config → Bond type → Molecular shape → Polarity → IMFs → Physical properties', symbols: [
          { symbol: 'Electron config', name: 'Module 2', meaning: 'Where electrons sit in an atom' },
          { symbol: 'Bond type', name: 'Lesson 4.1', meaning: 'How atoms share/transfer electrons (ionic, covalent, metallic)' },
          { symbol: 'Molecular shape', name: 'VSEPR', meaning: 'Electron pairs repel → geometry' },
          { symbol: 'IMFs', name: 'This lesson', meaning: 'LDF < dipole-dipole < H-bonding' },
        ]}),
        new CalloutBlock({ id: '42-big-summary', html: 'You can now trace any material property back to its electronic origin:<br><br>Why does ice float? → H₂O is bent → polar → H-bonds → open ice lattice → less dense<br>Why is diamond hard? → C forms 4 covalent bonds → 3D network → no weak IMFs to break<br>Why does copper conduct? → metallic bonding → free electrons → current flows<br>Why does salt dissolve in water? → Na⁺Cl⁻ ions attracted to polar H₂O → lattice breaks apart<br><br>This is the <strong>complete picture</strong> of chemistry → materials science.' }),
      ]
    },

    // --- FORWARD ---
    {
      id: 'sec-42-forward',
      blocks: [
        new TextBlock({ id: '42-fwd-title', tag: 'h2', html: 'What\'s Next: Chemical Reactions' }),
        new TextBlock({ id: '42-fwd-text', tag: 'p', html: "You now understand <em>why</em> atoms bond and <em>how</em> molecular shape determines material properties. Next: what happens when bonds <strong>break and form</strong> — chemical reactions. We'll cover reaction equations, conservation of mass, energy changes, and reaction rates. This is where chemistry goes from static structures to dynamic processes." }),
      ]
    },
  ],

  stepMeta: [
    // Puzzle
    { icon: '❓', label: 'Puzzle', kind: 'narrate' },
    null,
    // VSEPR
    { icon: '📐', label: 'VSEPR', kind: 'narrate' },
    { icon: '💡', label: 'Rule', kind: 'narrate' },
    null,
    // Shapes
    { icon: '🔮', label: 'Shapes', kind: 'narrate' },
    { icon: '🎮', label: 'Explore', kind: 'checkpoint' },
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },
    null,
    // Lone pairs
    { icon: '👁', label: 'Lone pairs', kind: 'narrate' },
    { icon: '📐', label: 'Squeeze', kind: 'narrate' },
    null,
    // Polarity
    { icon: '⚖️', label: 'Polarity', kind: 'narrate' },
    { icon: '💡', label: 'CO₂ vs H₂O', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },
    null,
    // IMF intro
    { icon: '🧲', label: 'IMFs', kind: 'narrate' },
    { icon: '🔑', label: 'Key diff', kind: 'narrate' },
    null,
    // Three IMFs
    { icon: '🌀', label: 'LDF', kind: 'narrate' },
    { icon: '⚡', label: 'Dipole', kind: 'narrate' },
    { icon: '💧', label: 'H-bond', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 3', kind: 'quiz' },
    null,
    // Boiling points
    { icon: '🌡', label: 'BP trend', kind: 'narrate' },
    { icon: '📊', label: 'Data', kind: 'narrate' },
    null,
    // Water
    { icon: '💧', label: 'Water', kind: 'narrate' },
    { icon: '🧊', label: 'Ice', kind: 'narrate' },
    null,
    // Answer + big picture
    { icon: '✅', label: 'Solved!', kind: 'narrate' },
    { icon: '🔗', label: 'Chain', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 4', kind: 'quiz' },
    { icon: '🎉', label: 'Done!', kind: 'narrate' },
  ],

  buildSteps(showSection, runner) {
    const vseprViz = runner.blockInstances.find(b => b.id === '42-vsepr-viz');

    return [
      // Puzzle
      { type: 'show', action: () => showSection('sec-42-puzzle'),
        text: "Here's a mystery. Water — H2O — boils at 100 degrees Celsius. Carbon dioxide — CO2 — boils at negative 78 degrees. Both are small covalent molecules. CO2 actually has a higher molecular weight — 44 versus 18. So by all logic, CO2 should have the HIGHER boiling point. But it doesn't. It's a gas while water is a liquid. What's going on? The answer has nothing to do with the bonds inside each molecule. It's about the forces BETWEEN molecules. And those forces depend on something we haven't talked about yet: molecular shape." },
      { type: 'pause' },

      // VSEPR
      { type: 'show', action: () => showSection('sec-42-vsepr'),
        text: "To understand molecular shape, we use a theory called VSEPR — Valence Shell Electron Pair Repulsion. The idea is beautifully simple. Electron pairs around a central atom repel each other — they're all negative, they push each other away. So they spread out as far as possible. If there are 2 pairs, they go to opposite sides — 180 degrees, a straight line. If 3 pairs, they form a triangle — 120 degrees. If 4 pairs, they form a tetrahedron — 109.5 degrees." },
      { type: 'narrate',
        text: "But here's the crucial twist. Not all electron pairs are equal. Some are bonding pairs — shared between two atoms. Others are lone pairs — just sitting on the central atom, not bonded to anything. Lone pairs repel MORE than bonding pairs because they're held closer to the central atom and spread out more. This means lone pairs push bonding pairs closer together, compressing the angle. This is why water isn't straight — the two lone pairs on oxygen push the two O-H bonds together from 109.5 degrees down to 104.5 degrees." },
      { type: 'pause' },

      // Shapes
      { type: 'show', action: () => showSection('sec-42-shapes'),
        text: "Here are the key molecular shapes. Click the different molecules on the left to see each one. Start with methane — CH4 — which has 4 bonding pairs and no lone pairs. You get a perfect tetrahedron with 109.5 degree angles. Now click ammonia — NH3 — same 4 electron pairs, but one is a lone pair. It pushes the three bonds down, creating a triangular pyramid shape with 107 degree angles. Then click water — two lone pairs push even harder, giving you a bent shape at 104.5 degrees." },
      { type: 'checkpoint',
        instruction: 'Click different molecules in the VSEPR viewer to explore their shapes. Try CH₄, NH₃, and H₂O.',
        text: "Explore at least three different molecules. Compare how the shapes change as you add lone pairs. Notice how the bond angle decreases: 109.5 in methane, 107 in ammonia, 104.5 in water.",
        check: () => true,
        checkInterval: 4000,
        confirmText: "See the pattern? Same number of electron pairs — four in each case — but swapping bonding pairs for lone pairs changes the molecular shape from tetrahedral to trigonal pyramidal to bent. The lone pairs are invisible in the molecular shape, but they're there, pushing everything around." },
      { type: 'quiz',
        text: "Let's check your understanding of VSEPR.",
        question: "CH₄ is tetrahedral (109.5°), NH₃ is trigonal pyramidal (107°), H₂O is bent (104.5°). Why do the angles decrease?",
        options: [
          "The atoms get smaller from C to N to O",
          "Lone pairs repel more than bonding pairs, squeezing the bond angles",
          "Water has weaker bonds",
          "The molecules are different sizes"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! Lone pairs sit closer to the central atom and repel more strongly, pushing bonding pairs closer together. More lone pairs = more compression = smaller angle.",
        wrongFeedback: "All three have 4 electron pairs. But as you go from CH₄ (0 lone pairs) to NH₃ (1) to H₂O (2), something about lone pairs changes the angle..." },
      { type: 'pause' },

      // Lone pairs
      { type: 'show', action: () => showSection('sec-42-lonepair'),
        text: "Let's make this really clear. Methane, ammonia, and water all have 4 electron pairs around the central atom. The electron geometry is tetrahedral in all three cases. But the molecular geometry — what you'd see if you only looked at where the atoms are — changes based on how many of those pairs are lone pairs versus bonding pairs. Zero lone pairs: tetrahedral. One lone pair: trigonal pyramidal. Two lone pairs: bent." },
      { type: 'narrate',
        text: "And the angles tell the story. Lone pairs are bullies — they take up more space than bonding pairs because they're not stretched between two nuclei. They push their neighbors closer together. In ammonia, one lone pair pushes the angle down from 109.5 to 107 degrees. In water, two lone pairs push it down to 104.5 degrees. This 5-degree compression might seem small, but it changes everything about how water behaves." },
      { type: 'pause' },

      // Polarity
      { type: 'show', action: () => showSection('sec-42-polarity'),
        text: "Now here's where shape becomes the key to everything. A molecule can have polar bonds inside it but still be nonpolar OVERALL — if the molecular shape makes the bond dipoles cancel out. Carbon dioxide has two polar C equals O bonds — delta EN is 0.89. But CO2 is linear — 180 degrees. The two dipoles point in exactly opposite directions and cancel. Net dipole is zero. Nonpolar molecule." },
      { type: 'narrate',
        text: "Water also has polar bonds — O-H has delta EN of 1.24. But water is BENT at 104.5 degrees. The two O-H dipoles do NOT cancel — they add up to a net dipole pointing toward oxygen. Water is a polar molecule. And THIS is the answer to our puzzle. Water is polar because it's bent. CO2 is nonpolar because it's linear. The shape determines the polarity. The polarity determines how molecules interact with each other. And those interactions determine the boiling point." },
      { type: 'quiz',
        text: "Quick check on shape and polarity.",
        question: "CCl₄ (carbon tetrachloride) has 4 polar C—Cl bonds. Is the molecule polar or nonpolar?",
        options: [
          "Polar — because C—Cl bonds are polar",
          "Nonpolar — because the symmetrical tetrahedral shape makes all dipoles cancel",
          "Nonpolar — because chlorine isn't electronegative",
          "Polar — because it has 4 bonds"
        ],
        correctIndex: 1,
        correctFeedback: "Right! CCl₄ is perfectly tetrahedral — all 4 C—Cl dipoles point symmetrically outward and cancel completely. Polar bonds, nonpolar molecule. Shape determines molecular polarity!",
        wrongFeedback: "Think about CCl₄'s shape: it's a perfect tetrahedron with 4 identical C—Cl bonds. What happens when identical dipoles are arranged symmetrically?" },
      { type: 'pause' },

      // IMF intro
      { type: 'show', action: () => showSection('sec-42-imf-intro'),
        text: "Now that you understand molecular polarity, we can tackle the forces between molecules — intermolecular forces, or IMFs. These are NOT the same as bonds. Bonds are forces WITHIN a molecule — they hold atoms together. IMFs are forces BETWEEN molecules — they hold molecules near each other. Bonds are strong — hundreds of kilojoules per mole. IMFs are weak — just a few kilojoules. But IMFs determine boiling point, melting point, viscosity, and whether something is solid, liquid, or gas." },
      { type: 'narrate',
        text: "Here's the key insight: when water boils, you are NOT breaking O-H bonds. The H2O molecules stay intact. What you're doing is overcoming the attractions BETWEEN water molecules — giving them enough energy to fly apart from each other. The water molecules themselves are perfectly fine. They just stop sticking to their neighbors." },
      { type: 'pause' },

      // Three IMFs
      { type: 'show', action: () => showSection('sec-42-imf-types'),
        text: "There are three types of intermolecular forces, from weakest to strongest. Look at this comparison." },
      { type: 'show', action: () => showSection('sec-42-ldf'),
        text: "First: London dispersion forces — LDF. These exist in ALL molecules, even nonpolar ones. They arise from temporary, flickering dipoles. At any instant, electrons might cluster slightly on one side of a molecule, creating a brief delta minus and delta plus. This temporary dipole induces a matching dipole in a neighbor. They attract for a moment, then the electrons shift, and it happens somewhere else. Individually, each interaction is tiny. But they add up. The more electrons a molecule has, the stronger the LDF. That's why iodine — with 106 electrons — is a solid at room temperature, while fluorine — with only 18 electrons — is a gas." },
      { type: 'show', action: () => showSection('sec-42-dd'),
        text: "Second: dipole-dipole forces. These exist in polar molecules — molecules with a permanent net dipole. The delta plus end of one molecule attracts the delta minus end of a neighbor. These are permanent attractions, not flickering like LDF, so they're stronger. That's why HCl — polar, with dipole-dipole forces — boils 100 degrees higher than argon, even though they have similar molecular weights." },
      { type: 'show', action: () => showSection('sec-42-hbond'),
        text: "Third: hydrogen bonding — the strongest intermolecular force. This occurs when hydrogen is bonded to nitrogen, oxygen, or fluorine. Hydrogen is tiny — just a proton. When bonded to a very electronegative atom like oxygen, the electron is pulled far away, exposing the bare proton. This exposed positive charge interacts powerfully with a lone pair on a neighboring molecule. Hydrogen bonds are 5 to 10 times stronger than regular dipole-dipole forces. Water makes up to 4 hydrogen bonds per molecule — two from its hydrogens to neighboring oxygens, and two from its oxygen lone pairs to neighboring hydrogens. This extensive H-bond network is why water has such an unusually high boiling point." },
      { type: 'quiz',
        text: "Check your understanding of IMFs.",
        question: "Ethanol (CH₃CH₂OH, MW=46) boils at 78°C. Dimethyl ether (CH₃OCH₃, MW=46) boils at −24°C. Same molecular weight, same atoms. Why the huge difference?",
        options: [
          "Ethanol is denser",
          "Ethanol has an O—H group that can form hydrogen bonds; dimethyl ether cannot",
          "Dimethyl ether has more electrons",
          "Ethanol has stronger covalent bonds inside it"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! Ethanol has an O—H group → hydrogen bonding between molecules → high BP. Dimethyl ether has no O—H or N—H → only dipole-dipole and LDF → much lower BP. Same formula (C₂H₆O), same mass, completely different IMFs.",
        wrongFeedback: "Both have the same molecular formula C₂H₆O and the same mass. The difference must be in how the atoms are arranged. Look at ethanol's structure — it has an O—H group..." },
      { type: 'pause' },

      // Boiling points
      { type: 'show', action: () => showSection('sec-42-bp'),
        text: "Let's see the IMF hierarchy in action with real boiling point data. Helium — just 2 electrons, only LDF — boils at negative 269 degrees. Barely liquid even at extremely low temperatures. Argon — 18 electrons, still only LDF — boils at negative 186. More electrons, more LDF. HCl — polar, so LDF plus dipole-dipole — boils at negative 85. The permanent dipole adds significant attraction. Then look at the H-bonding molecules. HF boils at 19.5 degrees. Water at 100 degrees. Ethanol at 78 degrees. All dramatically higher than their molecular weight would predict — because hydrogen bonds are so strong." },
      { type: 'narrate',
        text: "Notice something stunning about water. Based on its tiny molecular weight of 18, and comparing it to other hydrides in the same group — H2S boils at negative 60, H2Se at negative 42 — water SHOULD boil at about negative 80 degrees. Instead it boils at positive 100. That's a 180-degree anomaly. Hydrogen bonding adds 180 degrees to water's expected boiling point. Without H-bonding, every ocean on Earth would be a gas." },
      { type: 'pause' },

      // Water
      { type: 'show', action: () => showSection('sec-42-water'),
        text: "Water deserves its own section because it's genuinely extraordinary. Every weird thing about water — and there are many — traces back to hydrogen bonding and its bent shape. Its high boiling point: hydrogen bonds hold molecules together so tightly that you need a lot of energy to pull them apart. Its ability to dissolve almost everything: the polar O-H bonds attract both positive and negative ions, ripping ionic crystals apart." },
      { type: 'narrate',
        text: "But the most remarkable fact is that ice floats. In liquid water, hydrogen bonds constantly break and reform — it's a dynamic, disordered network. When water freezes, the hydrogen bonds lock into a rigid hexagonal lattice with large open spaces. This makes ice about 9 percent less dense than liquid water. It floats. And this is not just a fun fact — it's essential for life on Earth. If ice sank, lakes would freeze from the bottom up. Aquatic life would be destroyed every winter. Instead, ice forms an insulating layer on top, keeping the water below liquid. Hydrogen bonding literally makes life possible." },
      { type: 'pause' },

      // Answer + big picture
      { type: 'show', action: () => showSection('sec-42-answer'),
        text: "And now we can answer the puzzle from the beginning of the lesson. Why is water a liquid but CO2 a gas? It's NOT about bond strength — CO2 actually has stronger bonds inside it. It's about molecular shape and the forces between molecules. Water is bent, so it's polar, so it has strong hydrogen bonds between molecules — boiling point 100 degrees. CO2 is linear, so it's nonpolar despite having polar bonds, so it only has weak London dispersion forces between molecules — boiling point negative 78 degrees. Shape determines polarity. Polarity determines intermolecular forces. Forces determine boiling point." },
      { type: 'show', action: () => showSection('sec-42-bigpicture'),
        text: "Let's zoom all the way out. You can now trace any material property back to electrons. Where electrons sit — electron configuration from Module 2. How atoms share electrons — bond type from Lesson 4.1. How electron pairs arrange around atoms — VSEPR shape from today. Whether the molecule is polar — determined by shape. How molecules stick to each other — intermolecular forces. And finally, what you can observe in the real world — boiling point, hardness, solubility, conductivity. It's one continuous chain from the quantum scale to the human scale." },
      { type: 'quiz',
        text: "Final question to test the complete chain.",
        question: "Predict: which has a higher boiling point — NH₃ (ammonia, MW=17, trigonal pyramidal) or PH₃ (phosphine, MW=34, trigonal pyramidal)?",
        options: [
          "PH₃ — it's heavier so it has stronger LDF",
          "NH₃ — nitrogen is more electronegative, so N—H bonds allow H-bonding between molecules (PH₃ cannot H-bond because P is not N/O/F)",
          "They should be the same — same shape",
          "PH₃ — phosphorus has more electrons"
        ],
        correctIndex: 1,
        correctFeedback: "Perfect! NH₃ boils at −33°C while PH₃ boils at −87°C — despite being lighter! NH₃ can form N—H···N hydrogen bonds because N is in the N/O/F club. PH₃ cannot H-bond (P isn't electronegative enough). H-bonding wins over LDF here. You've mastered the complete chain!",
        wrongFeedback: "Both are trigonal pyramidal. PH₃ is heavier (stronger LDF). But NH₃ has something special — look at the central atom. Is N in the list of atoms that enable hydrogen bonding (N, O, F)?" },

      // Forward
      { type: 'show', action: () => showSection('sec-42-forward'),
        text: "Incredible work! You've now completed the full journey from atoms to materials. You understand electron configurations, bonding types, molecular shapes, and intermolecular forces. You can trace any physical property back to its electronic origin. This is the foundation of both chemistry and materials science. Coming up next: chemical reactions — what happens when bonds break and new ones form. We'll cover balancing equations, energy changes, and reaction rates. The chemistry is about to get dynamic. See you there!" },
    ];
  },
};
