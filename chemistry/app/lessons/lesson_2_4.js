/**
 * Lesson 2.4: Electron Shells & Orbitals
 *
 * Teaches from scratch: what are shells, subshells, orbitals (s, p, d),
 * what the letters mean, how electrons fill them, and the three rules.
 * Very visual, very step-by-step. No prior knowledge of orbitals assumed.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock, SliderBlock } from '../blocks/Block.js';

// Import sims
import '../sims/orbitalShapes.js';
import '../sims/electronConfig.js';

export const lesson_2_4 = {
  id: '2.4',
  lessonId: 'lesson_2_4',
  title: 'Electron Shells & Orbitals',

  sections: [
    // --- RECAP ---
    {
      id: 'sec-24-recap',
      blocks: [
        new TextBlock({ id: '24-recap-title', tag: 'h2', html: 'Quick Recap' }),
        new CalloutBlock({ id: '24-recap-callout', html: '<strong>What we know:</strong> Atoms have a nucleus (protons + neutrons) at the center, with electrons orbiting around it. The atomic number Z = number of protons = number of electrons (in a neutral atom). We built a carbon atom with 6 protons, 6 neutrons, 6 electrons.' }),
        new TextBlock({ id: '24-recap-q', tag: 'p', html: "But where <em>exactly</em> do those electrons go? They don't just float randomly. They organize themselves into <strong>shells</strong>, <strong>subshells</strong>, and <strong>orbitals</strong>. Let's break this down piece by piece." }),
      ]
    },

    // --- SHELLS: THE BIG PICTURE ---
    {
      id: 'sec-24-shells',
      blocks: [
        new TextBlock({ id: '24-shells-title', tag: 'h2', html: 'Step 1: Shells (Energy Levels)' }),
        new TextBlock({ id: '24-shells-text', tag: 'p', html: "Think of an atom like a stadium with assigned seating. Electrons can't sit anywhere — they must sit in specific <strong>rows</strong> at specific distances from the nucleus." }),
        new CalloutBlock({ id: '24-shells-analogy', html: '<strong>Analogy: The Stadium</strong><br><br>🏟 The nucleus is the stage at the center.<br>Row 1 (closest to stage) = Shell 1 — only 2 seats<br>Row 2 = Shell 2 — 8 seats<br>Row 3 = Shell 3 — 18 seats<br>Row 4 = Shell 4 — 32 seats<br><br>Closer rows fill first (lower energy, more stable). Electrons prefer to be close to the nucleus.' }),
        new TableBlock({ id: '24-shells-table', maxWidth: '600px',
          headers: ['Shell (n)', 'Max Electrons', 'Formula'],
          rows: [
            ['1', '2', '2(1)² = 2'],
            ['2', '8', '2(2)² = 8'],
            ['3', '18', '2(3)² = 18'],
            ['4', '32', '2(4)² = 32'],
          ]
        }),
        new MathBlock({ id: '24-shells-math', label: 'Maximum electrons in shell n:', equation: 'Max = 2n²', symbols: [
          { symbol: 'n', name: 'Shell number', meaning: 'Also called the principal quantum number (1, 2, 3, 4...)' },
        ]}),
      ]
    },

    // --- SUBSHELLS: s, p, d ---
    {
      id: 'sec-24-subshells',
      blocks: [
        new TextBlock({ id: '24-sub-title', tag: 'h2', html: 'Step 2: Subshells — What s, p, d Mean' }),
        new TextBlock({ id: '24-sub-text', tag: 'p', html: "Each shell is divided into <strong>subshells</strong>. This is where the letters come from:" }),
        new CalloutBlock({ id: '24-sub-explain', html: '<strong>The letters s, p, d, f</strong> are just names for different <em>shapes</em> of space where electrons can be found.<br><br>They come from old spectroscopy terms (sharp, principal, diffuse, fundamental) — but forget those names. What matters is the <strong>shape</strong>:<br><br>• <strong style="color:#ef5350">s</strong> = <strong>sphere</strong> — a ball around the nucleus<br>• <strong style="color:#4fc3f7">p</strong> = <strong>peanut/dumbbell</strong> — two lobes on opposite sides<br>• <strong style="color:#ffa726">d</strong> = <strong>double dumbbell</strong> — four lobes (clover pattern)<br>• <strong style="color:#66bb6a">f</strong> = even more complex (we\'ll skip these for now)' }),
        new TextBlock({ id: '24-sub-key', tag: 'p', html: "Each shell <em>n</em> has subshells available to it:" }),
        new TableBlock({ id: '24-sub-table', maxWidth: '700px',
          headers: ['Shell', 'Available Subshells', 'Max electrons', 'Total'],
          rows: [
            ['n=1', { text: '1s', style: 'color:#ef5350' }, '2', '2'],
            ['n=2', { text: '2s, 2p', style: 'color:#ef5350' }, '2 + 6', '8'],
            ['n=3', { text: '3s, 3p, 3d', style: 'color:#ef5350' }, '2 + 6 + 10', '18'],
            ['n=4', { text: '4s, 4p, 4d, 4f', style: 'color:#ef5350' }, '2 + 6 + 10 + 14', '32'],
          ]
        }),
        new TextBlock({ id: '24-sub-read', tag: 'p', html: '<strong>How to read "2p":</strong> The number (2) is the shell. The letter (p) is the subshell shape. So "2p" means "the p-shaped subshell in shell 2."' }),
      ]
    },

    // --- ORBITAL SHAPES VIZ ---
    {
      id: 'sec-24-shapes',
      blocks: [
        new TextBlock({ id: '24-shapes-title', tag: 'h2', html: 'What Do These Shapes Look Like?' }),
        new TextBlock({ id: '24-shapes-text', tag: 'p', html: "Here are the actual orbital shapes. Each shape represents where an electron is most likely to be found:" }),
        new SimBlock({ id: '24-orbital-viz', sim: 'orbitalShapes', width: 800, height: 450 }),
        new CalloutBlock({ id: '24-shapes-callout', html: '<strong>Key insight:</strong> An orbital is NOT a fixed orbit like a planet. It\'s a <strong>probability cloud</strong> — the region where the electron is most likely to be. The denser the cloud, the more likely the electron is there.' }),
      ]
    },

    // --- ORBITALS AND BOXES ---
    {
      id: 'sec-24-boxes',
      blocks: [
        new TextBlock({ id: '24-boxes-title', tag: 'h2', html: 'Step 3: Orbitals = Boxes That Hold 2 Electrons' }),
        new TextBlock({ id: '24-boxes-text', tag: 'p', html: "Each subshell contains a specific number of <strong>orbitals</strong> (individual spaces). Each orbital can hold exactly <strong>2 electrons</strong> (one spin-up ↑, one spin-down ↓)." }),
        new TableBlock({ id: '24-boxes-table', maxWidth: '700px',
          headers: ['Subshell', 'Shape', '# of Orbitals (boxes)', 'Max Electrons'],
          rows: [
            [{ text: 's', style: 'color:#ef5350;font-weight:bold;font-size:1.2em' }, 'Sphere', '1', '2'],
            [{ text: 'p', style: 'color:#4fc3f7;font-weight:bold;font-size:1.2em' }, 'Dumbbell (3 orientations: px, py, pz)', '3', '6'],
            [{ text: 'd', style: 'color:#ffa726;font-weight:bold;font-size:1.2em' }, 'Clover (5 orientations)', '5', '10'],
            [{ text: 'f', style: 'color:#66bb6a;font-weight:bold;font-size:1.2em' }, 'Complex (7 orientations)', '7', '14'],
          ]
        }),
        new CalloutBlock({ id: '24-boxes-analogy', html: '<strong>Analogy: Hotel Rooms</strong><br><br>Shell = Floor of the hotel<br>Subshell = Wing of that floor (s wing, p wing, d wing)<br>Orbital = Individual room in that wing<br>Each room holds max 2 guests (electrons), and they must have opposite spin (↑↓)<br><br>Floor 1 has 1 wing (s), 1 room → 2 guests<br>Floor 2 has 2 wings (s, p), 1+3 rooms → 8 guests<br>Floor 3 has 3 wings (s, p, d), 1+3+5 rooms → 18 guests' }),
      ]
    },

    // --- THE THREE FILLING RULES ---
    {
      id: 'sec-24-rules',
      blocks: [
        new TextBlock({ id: '24-rules-title', tag: 'h2', html: 'Step 4: The Three Filling Rules' }),
        new TextBlock({ id: '24-rules-intro', tag: 'p', html: "Now the big question: in what <em>order</em> do electrons fill these orbitals? There are exactly three rules:" }),
        new CalloutBlock({ id: '24-rule1', html: '<strong style="color:#00d4ff">Rule 1: Aufbau Principle</strong> ("building up" in German)<br><br>Fill from <strong>lowest energy to highest energy</strong>. Electrons are lazy — they go to the most stable (lowest energy) orbital first.<br><br>The filling order is: <strong>1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p</strong><br><br>⚠️ Notice: 4s fills BEFORE 3d! The 4s orbital has slightly lower energy than 3d. This is why potassium (Z=19) starts a new shell before the 3d orbitals fill.' }),
        new CalloutBlock({ id: '24-rule2', html: '<strong style="color:#00d4ff">Rule 2: Pauli Exclusion Principle</strong><br><br>Each orbital (box) holds <strong>max 2 electrons</strong>, and they must have <strong>opposite spins</strong> (↑↓).<br><br>No two electrons in the same atom can be identical. The two electrons in one orbital are distinguished by their spin: one up, one down.' }),
        new CalloutBlock({ id: '24-rule3', html: '<strong style="color:#00d4ff">Rule 3: Hund\'s Rule</strong><br><br>When filling orbitals of the same energy (like the three 2p boxes), <strong>spread out first</strong>. Put one ↑ electron in each box before pairing any.<br><br>Why? Electrons repel each other (negative charges). They\'d rather each have their own room than be forced to share.<br><br>Example — Nitrogen (7 electrons): 1s² 2s² 2p³<br>The three 2p electrons go: [↑] [↑] [↑] — one in each box<br>NOT: [↑↓] [↑] [ ] — that would force a pair before necessary' }),
      ]
    },

    // --- INTERACTIVE ELECTRON CONFIG ---
    {
      id: 'sec-24-interactive',
      blocks: [
        new TextBlock({ id: '24-int-title', tag: 'h2', html: 'Watch Electrons Fill — Interactive' }),
        new TextBlock({ id: '24-int-text', tag: 'p', html: "Use the slider to pick any element (Z=1 to 36) and watch how its electrons fill the orbitals one by one, following all three rules:" }),
        new SimBlock({ id: '24-econfig-viz', sim: 'electronConfig', width: 700, height: 450, simOptions: { element: 1 } }),
        new SliderBlock({ id: '24-element-slider', label: 'Element (Z):', min: 1, max: 36, value: 1, color: '#00d4ff', gradient: 'linear-gradient(to right, #4fc3f7, #ffa726, #ef5350)' }),
        new TextBlock({ id: '24-econfig-label', tag: 'p', html: '<span id="eConfigLabel24" style="text-align:center;display:block;font-size:1.2em;color:var(--accent)">Hydrogen (Z=1): 1s¹</span>' }),
      ]
    },

    // --- READING THE NOTATION ---
    {
      id: 'sec-24-notation',
      blocks: [
        new TextBlock({ id: '24-not-title', tag: 'h2', html: 'How to Read Electron Configuration Notation' }),
        new TextBlock({ id: '24-not-text', tag: 'p', html: "Let's decode the notation step by step:" }),
        new CalloutBlock({ id: '24-not-example', html: '<strong>Carbon (Z=6): 1s² 2s² 2p²</strong><br><br>Read it left to right:<br>• <strong>1s²</strong> — Shell 1, subshell s, 2 electrons (s is full)<br>• <strong>2s²</strong> — Shell 2, subshell s, 2 electrons (s is full)<br>• <strong>2p²</strong> — Shell 2, subshell p, 2 electrons (p can hold 6, so this is partially filled)<br><br>Total: 2 + 2 + 2 = 6 electrons ✓ matches Z=6' }),
        new CalloutBlock({ id: '24-not-example2', html: '<strong>Iron (Z=26): 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶</strong><br><br>• Shells 1-3 are full (2 + 8 + 8 = 18 electrons)<br>• Then 4s fills (2 electrons) — before 3d! (Aufbau principle)<br>• Then 3d gets 6 electrons (can hold 10, so partially filled)<br>• Total: 18 + 2 + 6 = 26 ✓<br><br>Notice: 4s fills before 3d, but we still write 3d after 4s in the notation.' }),
        new MathBlock({ id: '24-not-math', label: 'Reading the notation:', equation: '<span style="color:#ef5350">n</span><span style="color:#4fc3f7">ℓ</span><sup style="color:#81c784">x</sup>', symbols: [
          { symbol: '<span style="color:#ef5350">n</span>', name: 'Shell number', meaning: '1, 2, 3, 4... (which floor)' },
          { symbol: '<span style="color:#4fc3f7">ℓ</span>', name: 'Subshell letter', meaning: 's, p, d, or f (which wing)' },
          { symbol: '<span style="color:#81c784">x</span>', name: 'Electron count', meaning: 'How many electrons in this subshell (superscript)' },
        ]}),
      ]
    },

    // --- KEY CONFIGS TO KNOW ---
    {
      id: 'sec-24-key',
      blocks: [
        new TextBlock({ id: '24-key-title', tag: 'h2', html: 'Key Configurations' }),
        new TableBlock({ id: '24-key-table', maxWidth: '800px',
          headers: ['Element', 'Z', 'Config', 'Why it matters'],
          rows: [
            ['Hydrogen', '1', { text: '1s¹', style: 'font-family:monospace' }, 'Simplest — 1 electron'],
            ['Helium', '2', { text: '1s²', style: 'font-family:monospace' }, 'Full shell 1 → noble gas, very stable'],
            ['Carbon', '6', { text: '1s² 2s² 2p²', style: 'font-family:monospace' }, '4 valence e⁻ → forms 4 bonds (basis of life!)'],
            ['Nitrogen', '7', { text: '1s² 2s² 2p³', style: 'font-family:monospace' }, 'Half-filled p → extra stable (Hund\'s rule)'],
            ['Neon', '10', { text: '1s² 2s² 2p⁶', style: 'font-family:monospace' }, 'Full shell 2 → noble gas, totally inert'],
            ['Sodium', '11', { text: '1s² 2s² 2p⁶ 3s¹', style: 'font-family:monospace' }, '1 valence e⁻ beyond stable Ne → easily lost'],
            ['Argon', '18', { text: '...3s² 3p⁶', style: 'font-family:monospace' }, 'Full s+p in shell 3 → noble gas'],
            ['Potassium', '19', { text: '...3p⁶ 4s¹', style: 'font-family:monospace' }, '4s fills before 3d! (Aufbau)'],
          ]
        }),
      ]
    },

    // --- COMING UP ---
    {
      id: 'sec-24-forward',
      blocks: [
        new TextBlock({ id: '24-fwd-title', tag: 'h2', html: 'Coming Up: The Periodic Table' }),
        new TextBlock({ id: '24-fwd-text', tag: 'p', html: "Now you understand where electrons go. In Module 3, we'll see how this <strong>directly maps to the periodic table</strong>:" }),
        new CalloutBlock({ id: '24-fwd-callout', html: '• Each <strong>row</strong> (period) = filling a new shell<br>• Each <strong>column</strong> (group) = same number of valence electrons<br>• The <strong>s-block</strong> (Groups 1-2) = filling s orbitals<br>• The <strong>p-block</strong> (Groups 13-18) = filling p orbitals<br>• The <strong>d-block</strong> (Groups 3-12) = filling d orbitals (transition metals!)<br><br>The periodic table IS the electron configuration, laid out visually.' }),
      ]
    },
  ],

  stepMeta: [
    { icon: '📋', label: 'Recap', kind: 'narrate' },
    null,
    // Shells
    { icon: '🏟', label: 'Shells', kind: 'narrate' },
    { icon: '📐', label: '2n²', kind: 'narrate' },
    null,
    // Subshells
    { icon: '🔤', label: 's, p, d', kind: 'narrate' },
    { icon: '💡', label: 'Reading', kind: 'narrate' },
    null,
    // Shapes
    { icon: '🔮', label: 'Shapes', kind: 'narrate' },
    { icon: '☁️', label: 'Cloud', kind: 'narrate' },
    null,
    // Boxes
    { icon: '📦', label: 'Boxes', kind: 'narrate' },
    { icon: '🏨', label: 'Hotel', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },
    null,
    // Rules
    { icon: '📜', label: 'Aufbau', kind: 'narrate' },
    { icon: '📜', label: 'Pauli', kind: 'narrate' },
    { icon: '📜', label: "Hund's", kind: 'narrate' },
    null,
    // Interactive
    { icon: '🎮', label: 'Try it', kind: 'narrate' },
    { icon: '⚛', label: 'H → He', kind: 'checkpoint' },
    { icon: '⚛', label: 'Carbon', kind: 'checkpoint' },
    { icon: '⚛', label: 'Neon', kind: 'checkpoint' },
    { icon: '⚛', label: 'Sodium', kind: 'checkpoint' },
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },
    null,
    // Notation
    { icon: '📝', label: 'Notation', kind: 'narrate' },
    { icon: '💡', label: 'Examples', kind: 'narrate' },
    null,
    // Key configs + forward
    { icon: '⭐', label: 'Key configs', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 3', kind: 'quiz' },
    { icon: '🎉', label: 'Done!', kind: 'narrate' },
  ],

  buildSteps(showSection, runner) {
    const eConfigViz = runner.blockInstances.find(b => b.id === '24-econfig-viz');
    const elementSlider = runner.blockInstances.find(b => b.id === '24-element-slider');

    const ELEM_NAMES = [null,'Hydrogen','Helium','Lithium','Beryllium','Boron','Carbon','Nitrogen','Oxygen','Fluorine','Neon','Sodium','Magnesium','Aluminum','Silicon','Phosphorus','Sulfur','Chlorine','Argon','Potassium','Calcium','Scandium','Titanium','Vanadium','Chromium','Manganese','Iron','Cobalt','Nickel','Copper','Zinc','Gallium','Germanium','Arsenic','Selenium','Bromine','Krypton'];

    // Wire slider
    if (elementSlider && eConfigViz) {
      elementSlider.onChange = (v) => {
        if (eConfigViz.renderer?.setElement) eConfigViz.renderer.setElement(v);
        const label = document.getElementById('eConfigLabel24');
        if (label) label.textContent = `${ELEM_NAMES[v] || '?'} (Z=${v})`;
      };
    }

    return [
      // Recap
      { type: 'show', action: () => showSection('sec-24-recap'),
        text: "Let's pick up from where we left off. We know atoms have a nucleus with protons and neutrons, and electrons orbiting around it. We built atoms and counted particles. But we never asked: where exactly do the electrons go? They don't just float randomly. They follow strict rules — and understanding those rules unlocks the entire periodic table." },
      { type: 'pause' },

      // Shells
      { type: 'show', action: () => showSection('sec-24-shells'),
        text: "First: shells. Think of the atom like a stadium. The nucleus is the stage at the center. Electrons sit in specific rows — not wherever they want. Row 1, closest to the stage, has only 2 seats. Row 2 has 8. Row 3 has 18. The closer rows fill first because they're lower energy — more stable." },
      { type: 'narrate',
        text: "There's a simple formula: the maximum electrons in shell n equals 2 times n squared. Shell 1 holds 2. Shell 2 holds 8. Shell 3 holds 18. Shell 4 holds 32. But here's the thing — each shell is further divided into sections. Those sections are called subshells, and that's where the letters s, p, and d come from." },
      { type: 'pause' },

      // Subshells
      { type: 'show', action: () => showSection('sec-24-subshells'),
        text: "OK, here's the part that confuses everyone at first. The letters s, p, d, and f. These are just names for different shapes of space where electrons hang out. S stands for a sphere shape. P is a dumbbell or peanut shape. D is a clover or double-dumbbell. The names originally came from spectroscopy — sharp, principal, diffuse, fundamental — but nobody remembers that. What matters is the shape." },
      { type: 'narrate',
        text: "Each shell gets more subshells. Shell 1 only has the s subshell — 1 s. Shell 2 has s and p — 2 s and 2 p. Shell 3 adds d — 3 s, 3 p, 3 d. And shell 4 adds f. The number before the letter tells you which shell. So 2 p means the p-shaped subshell in shell 2. 3 d means the d-shaped subshell in shell 3. That's all the notation means." },
      { type: 'pause' },

      // Shapes
      { type: 'show', action: () => showSection('sec-24-shapes'),
        text: "Now let's see what these shapes actually look like. On the left, the s orbital — a perfect sphere around the nucleus. Electrons in an s orbital could be anywhere on that sphere. In the middle, the p orbitals — dumbbell shapes. There are 3 of them, pointing along the x, y, and z axes. On the right, the d orbitals — clover-leaf patterns. There are 5 of them with different orientations." },
      { type: 'narrate',
        text: "Important: these aren't solid shapes. They're probability clouds. The orbital shows where the electron is MOST LIKELY to be found. Think of it like a heatmap. The electron spends most of its time in the denser parts of the cloud. It could technically be found anywhere, but these shapes show the high-probability zones." },
      { type: 'pause' },

      // Boxes
      { type: 'show', action: () => showSection('sec-24-boxes'),
        text: "Now let's connect shapes to numbers. Each subshell has a specific number of orbitals. An s subshell has 1 orbital — 1 box. A p subshell has 3 orbitals — the three dumbbells pointing in different directions. A d subshell has 5 orbitals. And each box holds exactly 2 electrons. So s holds 2, p holds 6, d holds 10." },
      { type: 'narrate',
        text: "Here's a nice analogy. Think of the atom as a hotel. Each shell is a floor. Each subshell is a wing on that floor — the s wing, the p wing, the d wing. Each orbital is a room in that wing. And each room holds exactly 2 guests — one spin-up and one spin-down. Floor 1 has just the s wing with 1 room — 2 guests total. Floor 2 has s and p wings — 1 plus 3 rooms — 8 guests. Floor 3 adds the d wing — 1 plus 3 plus 5 rooms — 18 guests." },
      { type: 'quiz',
        text: "Let's make sure you've got the basics.",
        question: "How many electrons can the 3p subshell hold?",
        options: ["2", "6", "10", "18"],
        correctIndex: 1,
        correctFeedback: "Right! p subshells have 3 orbitals × 2 electrons each = 6 electrons max.",
        wrongFeedback: "Remember: p has 3 orbitals (boxes). Each box holds 2 electrons. So 3 × 2 = ?" },
      { type: 'pause' },

      // Rules
      { type: 'show', action: () => showSection('sec-24-rules'),
        text: "Now the crucial part: in what ORDER do electrons fill these orbitals? There are exactly three rules, and they have fancy names, but the ideas are simple." },
      { type: 'narrate',
        text: "Rule 1: the Aufbau principle. It's German for building up. Electrons fill the lowest-energy orbital first. The order is 1s, then 2s, then 2p, then 3s, 3p, then — here's the tricky part — 4s fills before 3d. The 4s orbital actually has slightly lower energy than 3d. So potassium, element 19, puts its electron in 4s, not 3d. After 4s is full, THEN 3d fills — that's where the transition metals live." },
      { type: 'narrate',
        text: "Rule 2: the Pauli exclusion principle. Each orbital holds max 2 electrons, and they must have opposite spins. One spin-up arrow, one spin-down arrow. No exceptions. You can't cram 3 electrons into one orbital." },
      { type: 'narrate',
        text: "Rule 3: Hund's rule. When you have multiple orbitals at the same energy level — like the three 2p boxes — electrons spread out first. They each take their own box before pairing up. Why? Because electrons are negatively charged. They repel each other. They'd rather each have their own room than be forced to share. So for nitrogen with 3 electrons in 2p, you get one electron in each of the three boxes — up, up, up. NOT two in one box and one in another." },
      { type: 'pause' },

      // Interactive
      { type: 'show', action: () => showSection('sec-24-interactive'),
        text: "Now let's see this in action. Use the slider to explore different elements and watch the electrons fill according to all three rules." },
      { type: 'checkpoint',
        instruction: 'Set the slider to Z=1 (Hydrogen), then to Z=2 (Helium) to see the 1s orbital fill',
        text: "Start with hydrogen — Z equals 1. One electron in 1s. Then slide to helium — Z equals 2. Two electrons in 1s, with opposite spins. That's it — shell 1 is completely full. Helium is a noble gas because its shell is complete.",
        check: () => elementSlider && elementSlider.getValue() === 2,
        confirmText: "Perfect. See the two arrows — up and down — in the 1s box? That's Pauli exclusion in action. Shell 1 is full. The next electron has to start shell 2." },
      { type: 'checkpoint',
        instruction: 'Slide to Z=6 (Carbon) to see how 2p starts filling',
        text: "Now slide to carbon — Z equals 6. Watch carefully how the 2p electrons fill. Two go in 1s, two in 2s, and then two start filling the 2p boxes.",
        check: () => elementSlider && elementSlider.getValue() === 6,
        confirmText: "Notice how the 2 electrons in 2p each went into their OWN box, with the same spin direction? That's Hund's rule — spread out before pairing. Carbon has 2 unpaired electrons in 2p, which is why it can form 4 bonds." },
      { type: 'checkpoint',
        instruction: 'Slide to Z=10 (Neon) to see a completely full shell',
        text: "Slide to neon — Z equals 10. Watch all the 2p boxes fill up completely.",
        check: () => elementSlider && elementSlider.getValue() === 10,
        confirmText: "Beautiful. Every box in shells 1 and 2 is full. 1s2, 2s2, 2p6. That's 10 electrons, all paired. This is why neon is completely inert — there's no room to add electrons, and all the existing ones are tightly held. Full shells are incredibly stable." },
      { type: 'checkpoint',
        instruction: 'Slide to Z=11 (Sodium) to see a new shell begin',
        text: "Now one more — slide to sodium, Z equals 11. See what happens with that 11th electron.",
        check: () => elementSlider && elementSlider.getValue() === 11,
        confirmText: "There it is — that one lonely electron starts shell 3, in the 3s orbital. Sodium has the same configuration as neon, plus one extra electron in 3s. That extra electron is barely held — it's far from the nucleus, shielded by 10 inner electrons. This is why sodium is so reactive — it wants to lose that electron and go back to neon's stable configuration." },
      { type: 'quiz',
        text: "Check your understanding of the filling rules.",
        question: "Nitrogen has 7 electrons. Its configuration is 1s² 2s² 2p³. How are the three 2p electrons arranged?",
        options: [
          "All three in one box: [↑↓↑] [ ] [ ]",
          "Two in one box, one in another: [↑↓] [↑] [ ]",
          "One in each box, same spin: [↑] [↑] [↑]",
          "One in each box, alternating spin: [↑] [↓] [↑]"
        ],
        correctIndex: 2,
        correctFeedback: "Exactly! Hund's rule: spread out first, all with the same spin. Electrons prefer their own room before sharing.",
        wrongFeedback: "Remember Hund's rule: electrons spread out across degenerate orbitals (same energy) before pairing. They all go in with the same spin direction first." },
      { type: 'pause' },

      // Notation
      { type: 'show', action: () => showSection('sec-24-notation'),
        text: "Let's make sure you can read and write electron configurations fluently. The notation is just: shell number, subshell letter, then a superscript for how many electrons. So 2p4 means shell 2, p subshell, 4 electrons." },
      { type: 'narrate',
        text: "Let's decode iron. Z equals 26. Its configuration is 1s2 2s2 2p6 3s2 3p6 4s2 3d6. Reading left to right, shells 1 through 3 are filled up — that accounts for 18 electrons. Then 4s fills with 2 — that's 20. Then 3d gets 6 — that's 26 total. Notice something weird? We wrote 4s before 3d even though 3 is a lower shell number. That's because 4s fills first — remember the Aufbau principle." },
      { type: 'pause' },

      // Key configs
      { type: 'show', action: () => showSection('sec-24-key'),
        text: "Here are the key configurations to know. Helium and neon have full shells — they're noble gases, completely stable. Carbon has 4 valence electrons with 2 unpaired in 2p — that's why it forms 4 bonds and is the basis of all organic chemistry. Nitrogen has a half-filled 2p — extra stable. Sodium has neon's configuration plus one lonely 3s electron — super reactive. And potassium is the one that proves 4s fills before 3d." },
      { type: 'quiz',
        text: "Final question.",
        question: "Why does potassium (Z=19) put its 19th electron in 4s instead of 3d?",
        options: [
          "Because 3d is already full",
          "Because 4s has lower energy than 3d",
          "Because there's no 3d subshell",
          "Because d orbitals can only hold 2 electrons"
        ],
        correctIndex: 1,
        correctFeedback: "Correct! The 4s orbital has slightly lower energy than 3d, so by the Aufbau principle, it fills first. This is one of the trickiest parts of electron configurations.",
        wrongFeedback: "Remember the Aufbau principle: fill the lowest energy orbital first. The filling order goes ...3p → 4s → 3d. 4s is lower energy than 3d!" },

      // Forward
      { type: 'show', action: () => showSection('sec-24-forward'),
        text: "Excellent! You now understand electron shells and orbitals — the s, p, and d shapes, the filling rules, and how to read electron configurations. This is the foundation for everything that comes next. In Module 3, you'll see how the periodic table is literally just the electron configuration laid out in a grid. Rows are shells. Columns are valence electrons. The s-block, p-block, and d-block on the table correspond directly to which subshell is being filled. It's going to click beautifully. See you there!" },
    ];
  },
};
