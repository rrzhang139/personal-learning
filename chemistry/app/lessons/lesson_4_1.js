/**
 * Lesson 4.1: Chemical Bonding — Why Atoms Stick Together
 *
 * Bridges from Module 3 (metals/nonmetals, Z_eff, electronegativity) into
 * the three bond types: ionic, covalent, metallic. Core idea: atoms bond
 * to achieve full shells, and ΔEN determines which strategy they use.
 * Introduces bond polarity spectrum and connects to material properties.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock, SliderBlock } from '../blocks/Block.js';

// Import sims
import '../sims/bondSpectrumViz.js';
import '../sims/ionicBondViz.js';
import '../sims/covalentBondViz.js';

export const lesson_4_1 = {
  id: '4.1',
  lessonId: 'lesson_4_1',
  title: 'Chemical Bonding — Why Atoms Stick Together',

  sections: [
    // --- WHY BOND? ---
    {
      id: 'sec-41-why',
      blocks: [
        new TextBlock({ id: '41-why-title', tag: 'h2', html: 'Why Do Atoms Bond?' }),
        new CalloutBlock({ id: '41-why-recap', html: '<strong>Where we are:</strong> You know that metals have loose valence electrons (low Z<sub>eff</sub>) and want to <em>lose</em> them. Nonmetals have tight electrons (high Z<sub>eff</sub>) and want to <em>gain</em> them. Noble gases have full shells and want <em>nothing</em>. Now — what happens when a giver meets a taker?' }),
        new TextBlock({ id: '41-why-text', tag: 'p', html: "The answer to <em>why</em> atoms bond is almost embarrassingly simple: <strong>atoms bond because they're trying to get a full outer shell.</strong> That's it. Every bond in the universe — the ones holding your DNA together, the ones in steel bridges, the ones in water — is just atoms rearranging electrons to achieve a noble gas configuration." }),
        new CalloutBlock({ id: '41-why-rule', html: '<strong>The Octet Rule:</strong> Atoms tend to gain, lose, or share electrons until they have <strong>8 electrons</strong> in their outer shell (or 2 for hydrogen — matching helium). This is the driving force behind all chemical bonding.<br><br>Full shell = low energy = stable. Unfull shell = high energy = reactive.' }),
      ]
    },

    // --- THREE STRATEGIES ---
    {
      id: 'sec-41-strategies',
      blocks: [
        new TextBlock({ id: '41-strat-title', tag: 'h2', html: 'Three Strategies to Get a Full Shell' }),
        new TextBlock({ id: '41-strat-text', tag: 'p', html: "Atoms have exactly three strategies. Which one they use depends on <em>who they're bonding with</em>:" }),
        new TableBlock({ id: '41-strat-table', maxWidth: '850px',
          headers: ['Strategy', 'Who uses it', 'Example', 'Bond type'],
          rows: [
            [{ text: 'Transfer electrons', style: 'color:#ff9800;font-weight:bold' }, 'Metal → Nonmetal', 'Na gives e⁻ to Cl → NaCl', { text: 'IONIC', style: 'color:#ff9800;font-weight:bold' }],
            [{ text: 'Share electrons', style: 'color:#00d4ff;font-weight:bold' }, 'Nonmetal + Nonmetal', 'Two H atoms share → H₂', { text: 'COVALENT', style: 'color:#00d4ff;font-weight:bold' }],
            [{ text: 'Pool electrons', style: 'color:#81c784;font-weight:bold' }, 'Metal + Metal', 'Cu atoms share sea → Cu wire', { text: 'METALLIC', style: 'color:#81c784;font-weight:bold' }],
          ]
        }),
        new TextBlock({ id: '41-strat-key', tag: 'p', html: "The key insight: <strong>electronegativity difference (ΔEN)</strong> between two atoms determines which strategy they use. Big difference → transfer (ionic). Small difference → share (covalent). Both low → pool (metallic)." }),
      ]
    },

    // --- THE BOND SPECTRUM ---
    {
      id: 'sec-41-spectrum',
      blocks: [
        new TextBlock({ id: '41-spec-title', tag: 'h2', html: 'The Bond Spectrum — ΔEN Decides Everything' }),
        new TextBlock({ id: '41-spec-text', tag: 'p', html: "Bond types aren't boxes — they're a continuous spectrum. The electronegativity difference (ΔEN) between two atoms tells you exactly where on the spectrum a bond falls:" }),
        new SimBlock({ id: '41-spectrum-viz', sim: 'bondSpectrumViz', width: 900, height: 400, simOptions: { value: 0 } }),
        new CalloutBlock({ id: '41-spec-ranges', html: '<strong>The ΔEN ranges:</strong><br><br>• <strong style="color:#00d4ff">ΔEN = 0:</strong> Pure covalent — identical atoms share equally (H₂, O₂, N₂)<br>• <strong style="color:#81c784">ΔEN = 0.1–0.4:</strong> Nonpolar covalent — nearly equal sharing (C—H)<br>• <strong style="color:#ffa726">ΔEN = 0.5–1.7:</strong> Polar covalent — unequal sharing, δ+/δ− (H—Cl, H—O)<br>• <strong style="color:#ef5350">ΔEN > 1.7:</strong> Ionic — full electron transfer (Na—Cl, K—F)' }),
        new MathBlock({ id: '41-spec-math', label: 'Electronegativity difference:', equation: 'ΔEN = |EN<sub>A</sub> − EN<sub>B</sub>|', symbols: [
          { symbol: 'ΔEN', name: 'Delta EN', meaning: 'Absolute difference in electronegativity between atoms A and B' },
          { symbol: 'EN', name: 'Electronegativity', meaning: 'How strongly an atom pulls on shared electrons (Pauling scale, 0–4)' },
        ]}),
      ]
    },

    // --- IONIC BONDS ---
    {
      id: 'sec-41-ionic',
      blocks: [
        new TextBlock({ id: '41-ionic-title', tag: 'h2', html: 'Ionic Bonds — Transfer & Attract' }),
        new TextBlock({ id: '41-ionic-text', tag: 'p', html: "When a metal meets a nonmetal, the electronegativity difference is large. The nonmetal doesn't just pull harder on shared electrons — it <strong>rips them away entirely</strong>. The metal becomes a positive ion (cation), the nonmetal becomes a negative ion (anion), and opposite charges attract." }),
        new SimBlock({ id: '41-ionic-viz', sim: 'ionicBondViz', width: 900, height: 500, simOptions: { mode: 'transfer' } }),
        new CalloutBlock({ id: '41-ionic-explain', html: '<strong>Step by step:</strong><br><br>1. Na (EN=0.93) meets Cl (EN=3.16) → ΔEN = 2.23 → ionic<br>2. Na loses its 1 valence electron → becomes Na⁺ (now has Ne\'s config: 2s²2p⁶)<br>3. Cl gains that electron → becomes Cl⁻ (now has Ar\'s config: 3s²3p⁶)<br>4. Na⁺ and Cl⁻ attract each other electrostatically → ionic bond<br>5. In bulk: ions arrange in a repeating crystal lattice for maximum attraction' }),
      ]
    },

    // --- IONIC LATTICE ---
    {
      id: 'sec-41-lattice',
      blocks: [
        new TextBlock({ id: '41-latt-title', tag: 'h2', html: 'The Crystal Lattice' }),
        new TextBlock({ id: '41-latt-text', tag: 'p', html: "An ionic bond isn't just between two ions. In a crystal of NaCl, <strong>every Na⁺ attracts every nearby Cl⁻</strong>, and vice versa. The ions arrange in a 3D grid — a crystal lattice — to maximize attraction and minimize repulsion." }),
        new SimBlock({ id: '41-lattice-viz', sim: 'ionicBondViz', width: 900, height: 500, simOptions: { mode: 'lattice' } }),
        new CalloutBlock({ id: '41-latt-props', html: '<strong>This lattice structure explains ionic compound properties:</strong><br><br>• <strong>High melting points:</strong> It takes a LOT of energy to break apart that many electrostatic bonds<br>• <strong>Brittle:</strong> If layers shift, like-charges suddenly face each other → instant repulsion → crystal shatters<br>• <strong>Conduct when dissolved:</strong> Ions are free to move in liquid → carry current<br>• <strong>Don\'t conduct as solid:</strong> Ions are locked in place in the lattice' }),
        new MathBlock({ id: '41-latt-math', label: 'Lattice energy (strength of ionic bond):', equation: 'E ∝ (q⁺ · q⁻) / r', symbols: [
          { symbol: 'E', name: 'Lattice energy', units: 'kJ/mol', meaning: 'Energy needed to pull apart the entire crystal into individual ions' },
          { symbol: 'q⁺, q⁻', name: 'Ion charges', meaning: 'Higher charges → stronger attraction (Mg²⁺O²⁻ >> Na⁺Cl⁻)' },
          { symbol: 'r', name: 'Distance between ions', meaning: 'Smaller ions → closer together → stronger bond' },
        ]}),
      ]
    },

    // --- COVALENT BONDS ---
    {
      id: 'sec-41-covalent',
      blocks: [
        new TextBlock({ id: '41-cov-title', tag: 'h2', html: 'Covalent Bonds — Share to Complete' }),
        new TextBlock({ id: '41-cov-text', tag: 'p', html: "When two nonmetals meet, neither wants to give up electrons — they both have high electronegativity. So they <strong>share</strong>. Each atom contributes one electron to a shared pair, and both atoms count that pair as part of their outer shell." }),
        new SimBlock({ id: '41-cov-viz', sim: 'covalentBondViz', width: 900, height: 500, simOptions: { mode: 'sharing' } }),
        new CalloutBlock({ id: '41-cov-explain', html: '<strong>Hydrogen (H₂) — the simplest covalent bond:</strong><br><br>• Each H has 1 electron, needs 2 (to match helium\'s full shell)<br>• They share their electrons → both "feel" 2 electrons → both happy<br>• The shared pair sits BETWEEN the nuclei, attracted to both<br>• Written as H—H (the line represents the shared pair)<br><br>This is a <strong>single bond</strong> — one shared pair.' }),
      ]
    },

    // --- POLAR COVALENT ---
    {
      id: 'sec-41-polar',
      blocks: [
        new TextBlock({ id: '41-polar-title', tag: 'h2', html: 'Polar Covalent — Unequal Sharing' }),
        new TextBlock({ id: '41-polar-text', tag: 'p', html: "What if two nonmetals share, but one is more electronegative? The shared electrons spend <em>more time</em> near the greedier atom. This creates a <strong>polar covalent bond</strong> — shared, but lopsided." }),
        new SimBlock({ id: '41-polar-viz', sim: 'covalentBondViz', width: 900, height: 500, simOptions: { mode: 'polar' } }),
        new CalloutBlock({ id: '41-polar-explain', html: '<strong>Water (H₂O) — the most important polar molecule:</strong><br><br>• Oxygen (EN=3.44) shares with hydrogen (EN=2.20) → ΔEN = 1.24 → polar covalent<br>• The shared electrons spend more time near oxygen → oxygen is slightly negative (δ−)<br>• Hydrogen is slightly positive (δ+)<br>• This makes water a <strong>polar molecule</strong> with a positive end and negative end<br><br>This polarity is why water dissolves salt, why ice floats, why proteins fold. Polar bonds are <em>everywhere</em> in biology.' }),
        new MathBlock({ id: '41-polar-math', label: 'Dipole moment (how polar a bond is):', equation: 'μ = q · d', symbols: [
          { symbol: 'μ', name: 'Dipole moment', units: 'Debye (D)', meaning: 'Measure of charge separation — bigger = more polar' },
          { symbol: 'q', name: 'Partial charge', units: 'Coulombs', meaning: 'The δ+ or δ− charge on each atom' },
          { symbol: 'd', name: 'Bond distance', units: 'meters', meaning: 'Distance between the two atoms' },
        ]}),
      ]
    },

    // --- DOUBLE AND TRIPLE BONDS ---
    {
      id: 'sec-41-multiple',
      blocks: [
        new TextBlock({ id: '41-mult-title', tag: 'h2', html: 'Double & Triple Bonds — Sharing More' }),
        new TextBlock({ id: '41-mult-text', tag: 'p', html: "Sometimes one shared pair isn't enough. If both atoms need 2 more electrons, they share <strong>two pairs</strong> — a double bond. Need 3 more? <strong>Three pairs</strong> — a triple bond." }),
        new SimBlock({ id: '41-double-viz', sim: 'covalentBondViz', width: 900, height: 500, simOptions: { mode: 'double' } }),
        new TableBlock({ id: '41-mult-table', maxWidth: '800px',
          headers: ['Bond type', 'Shared pairs', 'Shared electrons', 'Example', 'Notation'],
          rows: [
            ['Single', '1', '2', 'H—H, C—H', { text: '—', style: 'font-size:1.4em;font-weight:bold' }],
            ['Double', '2', '4', 'O=O, C=O', { text: '=', style: 'font-size:1.4em;font-weight:bold' }],
            ['Triple', '3', '6', 'N≡N, C≡O', { text: '≡', style: 'font-size:1.4em;font-weight:bold' }],
          ]
        }),
        new CalloutBlock({ id: '41-mult-key', html: '<strong>More shared pairs = stronger and shorter bond:</strong><br><br>• N—N single bond: 160 pm, 160 kJ/mol<br>• N=N double bond: 121 pm, 418 kJ/mol<br>• N≡N triple bond: 110 pm, <strong>945 kJ/mol</strong><br><br>The triple bond in N₂ is one of the strongest bonds in nature. That\'s why nitrogen gas is so unreactive — even though nitrogen <em>atoms</em> are reactive, the N≡N molecule is incredibly stable. Breaking it requires extreme energy (lightning, or the Haber process at 450°C and 200 atm).' }),
      ]
    },

    // --- METALLIC BONDS (callback to 3.2) ---
    {
      id: 'sec-41-metallic',
      blocks: [
        new TextBlock({ id: '41-met-title', tag: 'h2', html: 'Metallic Bonds — The Electron Sea (Revisited)' }),
        new TextBlock({ id: '41-met-text', tag: 'p', html: "You already know this one from Lesson 3.2. When metals bond with other metals, they don't transfer or share in pairs — they <strong>pool</strong> all their valence electrons into a shared sea." }),
        new CalloutBlock({ id: '41-met-recap', html: '<strong>Quick recall:</strong><br><br>• All valence electrons become delocalized — free to roam the entire structure<br>• Positive ion cores sit in a regular lattice, held in place by the electron sea<br>• Not directional (unlike covalent) — works in any direction<br>• Explains: conductivity, luster, malleability, ductility, high melting points<br><br>Metallic bonding is why copper conducts electricity, gold is malleable, and steel is strong. We covered this in depth in 3.2, so we won\'t repeat it here.' }),
      ]
    },

    // --- THE BIG PICTURE ---
    {
      id: 'sec-41-bigpicture',
      blocks: [
        new TextBlock({ id: '41-big-title', tag: 'h2', html: 'The Big Picture — Bonding Determines Everything' }),
        new TextBlock({ id: '41-big-text', tag: 'p', html: "Here's why bonding matters so much: <strong>the type of bond determines every physical property of a material</strong>." }),
        new TableBlock({ id: '41-big-table', maxWidth: '900px',
          headers: ['Property', 'Ionic (NaCl)', 'Covalent (H₂O)', 'Metallic (Cu)'],
          rows: [
            ['Melting point', { text: 'High (801°C)', style: 'color:#ff9800' }, { text: 'Low (0°C)', style: 'color:#4fc3f7' }, { text: 'High (1085°C)', style: 'color:#81c784' }],
            ['Conducts (solid)', { text: 'No — ions locked', style: 'color:#ef5350' }, { text: 'No — no free charges', style: 'color:#ef5350' }, { text: 'Yes — free e⁻', style: 'color:#81c784' }],
            ['Conducts (liquid)', { text: 'Yes — ions free', style: 'color:#81c784' }, { text: 'No', style: 'color:#ef5350' }, { text: 'Yes', style: 'color:#81c784' }],
            ['Hardness', 'Hard but brittle', 'Soft or gas', 'Hard and malleable'],
            ['Solubility', 'Dissolves in water', 'Depends on polarity', 'Doesn\'t dissolve'],
          ]
        }),
        new CalloutBlock({ id: '41-big-key', html: '<strong>This is the bridge to materials science:</strong><br><br>Want a material that conducts? → metallic bonds (copper wire)<br>Want a material that\'s transparent? → covalent bonds (glass, diamond)<br>Want a material that dissolves in water? → ionic bonds (salt)<br>Want a material that\'s flexible? → weak intermolecular forces (polymers)<br><br>Understanding bonding = understanding why materials behave the way they do.' }),
      ]
    },

    // --- FORWARD ---
    {
      id: 'sec-41-forward',
      blocks: [
        new TextBlock({ id: '41-fwd-title', tag: 'h2', html: 'Coming Up: Molecular Shape & Intermolecular Forces' }),
        new TextBlock({ id: '41-fwd-text', tag: 'p', html: "You now know <em>why</em> atoms bond and the three ways they do it. But there's a deeper question:" }),
        new CalloutBlock({ id: '41-fwd-callout', html: 'Water (H₂O) is a liquid at room temperature. CO₂ is a gas. Both have covalent bonds. Both have similar molecular weights. So why the huge difference?<br><br>The answer is <strong>molecular shape</strong> — water is bent (104.5°), making it polar. CO₂ is linear, making it nonpolar. Shape determines polarity. Polarity determines how molecules interact with <em>each other</em>. Those interactions — called <strong>intermolecular forces</strong> — determine boiling point, viscosity, surface tension, and more.<br><br>That\'s Lesson 4.2.' }),
      ]
    },
  ],

  stepMeta: [
    // Why bond
    { icon: '❓', label: 'Why bond?', kind: 'narrate' },
    { icon: '8️⃣', label: 'Octet', kind: 'narrate' },
    null,
    // Three strategies
    { icon: '🔀', label: 'Strategies', kind: 'narrate' },
    { icon: '📊', label: 'ΔEN rule', kind: 'narrate' },
    null,
    // Spectrum
    { icon: '🌈', label: 'Spectrum', kind: 'narrate' },
    { icon: '🎮', label: 'Explore', kind: 'checkpoint' },
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },
    null,
    // Ionic
    { icon: '🔋', label: 'Ionic', kind: 'narrate' },
    { icon: '💥', label: 'Transfer', kind: 'narrate' },
    null,
    // Lattice
    { icon: '🏗', label: 'Lattice', kind: 'narrate' },
    { icon: '📐', label: 'Math', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },
    null,
    // Covalent
    { icon: '🤝', label: 'Covalent', kind: 'narrate' },
    { icon: '💡', label: 'H₂', kind: 'narrate' },
    null,
    // Polar
    { icon: '⚖️', label: 'Polar', kind: 'narrate' },
    { icon: '💧', label: 'Water', kind: 'narrate' },
    null,
    // Multiple bonds
    { icon: '🔗', label: 'Double', kind: 'narrate' },
    { icon: '💪', label: 'Strength', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 3', kind: 'quiz' },
    null,
    // Metallic
    { icon: '🌊', label: 'Metallic', kind: 'narrate' },
    null,
    // Big picture
    { icon: '🔗', label: 'Properties', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 4', kind: 'quiz' },
    // Forward
    { icon: '🎉', label: 'Done!', kind: 'narrate' },
  ],

  buildSteps(showSection, runner) {
    const spectrumViz = runner.blockInstances.find(b => b.id === '41-spectrum-viz');

    return [
      // Why bond
      { type: 'show', action: () => showSection('sec-41-why'),
        text: "You've spent the last few lessons learning about the characters of the periodic table. Metals with loose electrons, desperate to give them away. Nonmetals with tight electrons, desperate to grab more. Noble gases sitting content with full shells. But we've only talked about atoms in isolation. In the real world, atoms don't exist alone. They're constantly meeting other atoms. And when a giver meets a taker — or two takers meet each other — something remarkable happens. They bond. And the reason is almost embarrassingly simple." },
      { type: 'narrate',
        text: "Atoms bond because they're trying to get a full outer shell. That's the whole story. Every chemical bond — the ones in your DNA, in the steel beams of a building, in the water you drink — is just atoms rearranging electrons to achieve a noble gas configuration. This drive is called the octet rule: atoms want 8 electrons in their outer shell. Or 2 for hydrogen, matching helium. Full shell means low energy. Low energy means stable. And nature always moves toward stability." },
      { type: 'pause' },

      // Three strategies
      { type: 'show', action: () => showSection('sec-41-strategies'),
        text: "There are exactly three strategies atoms use to get a full shell. Strategy one: TRANSFER electrons. A metal simply gives its valence electrons to a nonmetal. Sodium gives one electron to chlorine — done. Both have full shells. This creates an ionic bond. Strategy two: SHARE electrons. Two nonmetals each contribute electrons to a shared pair. Both atoms count that pair as theirs. This is a covalent bond. Strategy three: POOL electrons. A bunch of metal atoms dump all their valence electrons into a shared sea. This is metallic bonding — you already know this one from lesson 3.2." },
      { type: 'narrate',
        text: "So how do atoms decide which strategy to use? One number tells you: the electronegativity difference — delta EN — between the two atoms. If the difference is huge — like sodium and chlorine — the electronegative atom just rips the electron away. Ionic bond. If the difference is small or zero — like two oxygen atoms — they share fairly. Covalent bond. And if both atoms have LOW electronegativity — like two copper atoms — nobody wants to hold on, so they all pool their electrons. Metallic bond." },
      { type: 'pause' },

      // Spectrum
      { type: 'show', action: () => showSection('sec-41-spectrum'),
        text: "Here's something most textbooks get wrong: bond types aren't three separate boxes. They're a continuous spectrum. This visualization shows it. On the far left, delta EN equals zero — pure covalent, perfectly equal sharing. In the middle, delta EN is between 0.5 and 1.7 — polar covalent, unequal sharing. On the right, delta EN above 1.7 — ionic, full transfer. The boundaries are gradual, not sharp." },
      { type: 'checkpoint',
        instruction: 'Explore the bond spectrum — drag or look at different ΔEN values',
        text: "Take a moment to explore the spectrum. Notice how at delta EN equals zero, you get molecules like H2 and O2 — same atom bonding with itself, perfect sharing. At delta EN around 0.9, you get H-Cl — shared but lopsided. At delta EN around 2.1, you get sodium chloride — full ionic transfer.",
        check: () => true,
        checkInterval: 3000,
        confirmText: "See the pattern? The bigger the electronegativity difference, the more one-sided the bond becomes. This single number — delta EN — predicts the bond type, the charge distribution, and ultimately, the material properties." },
      { type: 'quiz',
        text: "Let's make sure you've got the spectrum.",
        question: "Carbon has EN=2.55, Oxygen has EN=3.44. What type of bond forms in CO₂?",
        options: [
          "Ionic — because oxygen is very electronegative",
          "Pure covalent — because both are nonmetals",
          "Polar covalent — ΔEN = 0.89, which is between 0.4 and 1.7",
          "Metallic — because carbon can be a metal"
        ],
        correctIndex: 2,
        correctFeedback: "Correct! ΔEN = |3.44 - 2.55| = 0.89, which falls squarely in the polar covalent range. The electrons are shared but pulled toward oxygen.",
        wrongFeedback: "Calculate ΔEN = |3.44 - 2.55| = 0.89. Where does 0.89 fall on the spectrum? Between 0.4 and 1.7..." },
      { type: 'pause' },

      // Ionic
      { type: 'show', action: () => showSection('sec-41-ionic'),
        text: "Let's start with ionic bonds — the most dramatic type. When a metal meets a nonmetal, the electronegativity difference is so large that the nonmetal doesn't just pull harder on shared electrons — it RIPS them away completely. Watch: sodium has an electronegativity of 0.93. Chlorine has 3.16. Delta EN is 2.23 — well above the 1.7 threshold. Sodium's lone valence electron doesn't stand a chance. It transfers completely to chlorine." },
      { type: 'narrate',
        text: "After the transfer, sodium has lost an electron — it becomes Na plus, with the same electron configuration as neon. Completely stable. Chlorine has gained an electron — it becomes Cl minus, with the same configuration as argon. Also stable. Now you have two ions — one positive, one negative. Opposite charges attract. That electrostatic attraction IS the ionic bond. It's not a shared pair. It's pure charge attraction." },
      { type: 'pause' },

      // Lattice
      { type: 'show', action: () => showSection('sec-41-lattice'),
        text: "Here's what's beautiful about ionic bonds: they're not just between two ions. In a crystal of table salt, every sodium ion is surrounded by six chloride ions, and every chloride ion is surrounded by six sodium ions. They arrange themselves in a perfect 3D grid — a crystal lattice — to maximize the attraction between opposite charges and minimize the repulsion between like charges." },
      { type: 'narrate',
        text: "The strength of an ionic bond — the lattice energy — depends on two things: the charges on the ions and the distance between them. Higher charges mean stronger attraction. Magnesium oxide, where magnesium is 2 plus and oxygen is 2 minus, has a MUCH stronger lattice than sodium chloride. And smaller ions mean closer packing, which also means stronger bonds. This is why magnesium oxide melts at 2852 degrees, while sodium chloride melts at just 801. Same bond type, very different strength." },
      { type: 'quiz',
        text: "Check your understanding of ionic bonds.",
        question: "Ionic compounds are hard but brittle. Why do they shatter when struck instead of bending?",
        options: [
          "Because the ions are too heavy to move",
          "Because striking shifts layers so like-charges face each other, causing instant repulsion",
          "Because ionic compounds have weak bonds",
          "Because the electrons absorb the impact"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! In the lattice, alternating +/- ions attract. If a layer shifts by one position, suddenly + faces + and - faces -. Massive repulsion → the crystal fractures along that plane. This is why salt crystals cleave into flat surfaces.",
        wrongFeedback: "Think about the lattice structure: alternating positive and negative ions. What happens to the charge arrangement if you shift one layer by half a unit?" },
      { type: 'pause' },

      // Covalent
      { type: 'show', action: () => showSection('sec-41-covalent'),
        text: "Now the second bond type: covalent. When two nonmetals meet, neither wants to give up electrons — they both have high electronegativity. So they compromise. They share. The simplest example is hydrogen. Each hydrogen atom has 1 electron but needs 2 to match helium's full shell. Two hydrogen atoms bring their electrons together, forming a shared pair that sits between both nuclei. Now each hydrogen 'feels' 2 electrons. Both are happy." },
      { type: 'narrate',
        text: "Watch the animation. The two electrons orbit in a region between both nuclei. They're attracted to BOTH positive nuclei simultaneously — that mutual attraction is what holds the atoms together. This is fundamentally different from ionic bonding. No ions are formed. No electrons are transferred. The atoms remain neutral. They just share. We draw this as H dash H — the dash represents the shared electron pair, called a bonding pair." },
      { type: 'pause' },

      // Polar
      { type: 'show', action: () => showSection('sec-41-polar'),
        text: "But what if the sharing isn't equal? In H-Cl, chlorine has an electronegativity of 3.16 and hydrogen has 2.20. Delta EN is about 1. They share — it's covalent — but chlorine pulls the shared electrons closer to itself. The electrons spend MORE time near chlorine. This creates a polar covalent bond." },
      { type: 'narrate',
        text: "In a polar bond, one end of the bond is slightly negative — we write delta minus — and the other end is slightly positive — delta plus. This charge separation is called a dipole. And it matters enormously. Water is a polar molecule — oxygen pulls the shared electrons away from both hydrogens. This makes water one of the best solvents in the universe. It's why salt dissolves, why proteins fold, why ice floats, why you're alive. Polar covalent bonds are arguably the most important type of bond in biology." },
      { type: 'pause' },

      // Multiple bonds
      { type: 'show', action: () => showSection('sec-41-multiple'),
        text: "Sometimes one shared pair isn't enough. Oxygen needs 2 more electrons to complete its shell. So when two oxygen atoms meet, they share TWO pairs — 4 electrons total. This is a double bond, written as O equals O. Nitrogen needs 3 more electrons — so N2 has a triple bond, three shared pairs, 6 electrons. Written as N triple-bond N." },
      { type: 'narrate',
        text: "More shared pairs means a stronger and shorter bond. Look at the numbers for nitrogen. A single N-N bond is 160 picometers long and takes 160 kilojoules per mole to break. The double bond is 121 picometers and 418 kilojoules. The triple bond is only 110 picometers and takes 945 kilojoules to break. That triple bond in N2 is one of the strongest bonds in all of chemistry. That's why nitrogen gas makes up 78 percent of our atmosphere and just sits there — it's incredibly hard to break apart. The Haber process, which converts N2 into fertilizer, requires 450 degrees and 200 atmospheres of pressure." },
      { type: 'quiz',
        text: "Quick check on covalent bonds.",
        question: "Why is the triple bond in N₂ (945 kJ/mol) so much stronger than the single bond (160 kJ/mol)?",
        options: [
          "Nitrogen atoms are heavier in the triple bond",
          "Three shared electron pairs create three times the mutual attraction between nuclei",
          "The triple bond has more protons",
          "Single bonds don't actually exist in nitrogen"
        ],
        correctIndex: 1,
        correctFeedback: "Right! Each shared pair creates attraction between the two nuclei. Three pairs = three overlapping bonding regions = much stronger total attraction. And since the electrons pull the nuclei closer, the bond is shorter too.",
        wrongFeedback: "Think about what holds a covalent bond together: shared electrons attracted to both nuclei. More shared pairs means..." },
      { type: 'pause' },

      // Metallic (brief callback)
      { type: 'show', action: () => showSection('sec-41-metallic'),
        text: "The third bond type — metallic bonding — you already know from lesson 3.2. Metal atoms pool their valence electrons into a delocalized sea. This isn't electron transfer like ionic, and it isn't pair-sharing like covalent. It's electron pooling. The sea is non-directional, which is why metals can bend and stretch without breaking. We won't repeat the details — just remember that metallic bonding completes the trio." },
      { type: 'pause' },

      // Big picture
      { type: 'show', action: () => showSection('sec-41-bigpicture'),
        text: "Now let's see why this matters for the real world. Look at this property comparison table. The type of bond determines EVERYTHING about a material. Sodium chloride — ionic — melts at 801 degrees because you have to break apart a massive crystal lattice. Water — covalent — melts at zero degrees because the bonds between molecules are weak, even though the bonds within each molecule are strong. Copper — metallic — conducts electricity because of free electrons. Salt doesn't conduct as a solid because its ions are locked in place. These aren't random facts. They're direct consequences of the bond type." },
      { type: 'quiz',
        text: "Final question to bring it all together.",
        question: "Diamond (pure carbon, covalent network) melts at 3550°C. Table salt (NaCl, ionic) melts at 801°C. Copper (metallic) melts at 1085°C. Why does diamond have the highest melting point?",
        options: [
          "Because carbon is the strongest element",
          "Because diamond has a continuous 3D network of strong covalent bonds — you have to break covalent bonds (not just intermolecular forces) to melt it",
          "Because diamond is the hardest material",
          "Because diamond has ionic bonds"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! In diamond, every carbon forms 4 strong covalent bonds to neighbors, creating a giant continuous network. To melt it, you'd have to break actual C—C bonds (356 kJ/mol each), not just overcome intermolecular forces. It's like trying to melt a single giant molecule.",
        wrongFeedback: "Think about diamond's structure: each carbon is covalently bonded to 4 neighbors, which are each bonded to 4 more... It's a continuous 3D network. What would you have to break to melt it?" },

      // Forward
      { type: 'show', action: () => showSection('sec-41-forward'),
        text: "Outstanding work! You now understand the three types of chemical bonds — ionic, covalent, and metallic — and how electronegativity difference determines which one forms. You know that ionic bonds create crystal lattices, covalent bonds create molecules with shared electron pairs, and metallic bonds create electron seas. And you've seen how bond type dictates material properties. Next up: molecular shape and intermolecular forces. We'll answer why water is a liquid at room temperature but carbon dioxide is a gas, even though both are covalent molecules of similar size. The answer lies in molecular geometry — and it's going to be fascinating. See you in lesson 4.2!" },
    ];
  },
};
