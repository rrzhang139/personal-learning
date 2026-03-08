/**
 * Lesson 3.2: Metals & Nonmetals
 *
 * Picks up from 3.1's periodic trends and Z_eff. Shows HOW the table
 * naturally splits into metals (left, low Z_eff, loose electrons) vs
 * nonmetals (right, high Z_eff, tight electrons). Introduces the electron
 * sea model, metalloids, and reactivity — setting up Module 4 (bonding).
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock, SliderBlock } from '../blocks/Block.js';

// Import sims
import '../sims/periodicTable.js';
import '../sims/metalNonmetalViz.js';
import '../sims/reactivityViz.js';

export const lesson_3_2 = {
  id: '3.2',
  lessonId: 'lesson_3_2',
  title: 'Metals & Nonmetals',

  sections: [
    // --- RECAP (brief — just the bridge from 3.1) ---
    {
      id: 'sec-32-recap',
      blocks: [
        new TextBlock({ id: '32-recap-title', tag: 'h2', html: 'Where We Left Off' }),
        new CalloutBlock({ id: '32-recap-callout', html: '<strong>From 3.1:</strong> Z<sub>eff</sub> increases left → right across a period. On the <em>left side</em>, valence electrons feel weak pull (low Z<sub>eff</sub>) and are easily lost. On the <em>right side</em>, valence electrons feel strong pull (high Z<sub>eff</sub>) and are tightly held — atoms want to <em>gain</em> electrons instead.' }),
        new TextBlock({ id: '32-recap-hook', tag: 'p', html: "So far, the periodic table has been a grid of numbers and arrows. But imagine picking up an actual element. On the left, you'd feel something <strong>shiny, heavy, and bendable</strong>. On the right, something <strong>dull, brittle, maybe a gas</strong>. Same table, completely different worlds. Why?" }),
      ]
    },

    // --- THE DIVIDE ---
    {
      id: 'sec-32-divide',
      blocks: [
        new TextBlock({ id: '32-divide-title', tag: 'h2', html: 'The Great Divide' }),
        new TextBlock({ id: '32-divide-text', tag: 'p', html: "There's a jagged staircase running through the periodic table, roughly from boron (B) down to astatine (At). Everything to the <strong>left</strong> of that line is a metal. Everything to the <strong>right</strong> is a nonmetal. And the elements <em>touching</em> the staircase? Those are the <strong>metalloids</strong> — they behave like a mix of both." }),
        new SimBlock({ id: '32-periodic-table', sim: 'periodicTable', width: 1100, height: 580 }),
        new CalloutBlock({ id: '32-divide-callout', html: '<strong>By the numbers:</strong> About 80% of all elements are metals. Only ~17 are nonmetals. And about 6-8 sit on the boundary as metalloids. Metals dominate the table — and they dominate the physical world too. Bridges, wires, cars, buildings — metals are everywhere because of one remarkable property.' }),
      ]
    },

    // --- WHAT MAKES A METAL ---
    {
      id: 'sec-32-metals',
      blocks: [
        new TextBlock({ id: '32-metals-title', tag: 'h2', html: 'What Makes a Metal a Metal?' }),
        new TextBlock({ id: '32-metals-text', tag: 'p', html: "Hold a piece of copper. It's shiny. It conducts electricity. You can hammer it into a thin sheet without it shattering. You can pull it into a wire. These aren't random facts — they all come from <strong>one single thing</strong>: metals have <em>loose</em> valence electrons." }),
        new SimBlock({ id: '32-sea-viz', sim: 'metalNonmetalViz', width: 900, height: 500, simOptions: { mode: 'sea' } }),
        new TextBlock({ id: '32-sea-label', tag: 'p', html: '<em>Left: metal atoms share a "sea" of delocalized electrons. Right: nonmetal atoms hold their electrons tightly.</em>' }),
      ]
    },

    // --- THE ELECTRON SEA MODEL ---
    {
      id: 'sec-32-sea',
      blocks: [
        new TextBlock({ id: '32-sea-title', tag: 'h2', html: 'The Electron Sea Model' }),
        new TextBlock({ id: '32-sea-text', tag: 'p', html: "In a chunk of metal, the atoms stack together in a regular grid — a <strong>lattice</strong>. Their valence electrons are so loosely held (low Z<sub>eff</sub>) that they detach and wander freely through the whole structure. The result is a grid of positive ion cores sitting in a <strong>sea of shared electrons</strong>." }),
        new CalloutBlock({ id: '32-sea-explain', html: "This one model explains <em>every</em> metal property:<br><br><strong>Conductivity:</strong> Push the electrons with a voltage, and they flow — that's electric current. (Nonmetals can't do this because their electrons are locked to individual atoms.)<br><br><strong>Luster (shininess):</strong> Free electrons absorb light and re-emit it. That's the metallic shine.<br><br><strong>Malleability (can be hammered flat):</strong> When you hit a metal, layers of atoms slide over each other. The electron sea flows around them, keeping everything bonded. No crack.<br><br><strong>Ductility (can be drawn into wire):</strong> Same idea — atoms slide, electron sea follows, the metal stretches instead of snapping.<br><br><strong>High melting points:</strong> The electron sea is a strong, non-directional bond holding the lattice together." }),
      ]
    },

    // --- CONDUCTIVITY DEMO ---
    {
      id: 'sec-32-conductivity',
      blocks: [
        new TextBlock({ id: '32-cond-title', tag: 'h2', html: 'Why Metals Conduct — Visualized' }),
        new TextBlock({ id: '32-cond-text', tag: 'p', html: "Apply a voltage across a metal, and the free electrons drift in one direction. That's electric current. In a nonmetal, there are no free electrons to move — current can't flow." }),
        new SimBlock({ id: '32-cond-viz', sim: 'metalNonmetalViz', width: 900, height: 500, simOptions: { mode: 'conductivity' } }),
        new MathBlock({ id: '32-cond-math', label: 'Electric current in a metal:', equation: 'I = n · e · v<sub>d</sub> · A', symbols: [
          { symbol: 'I', name: 'Current', units: 'Amperes (A)', meaning: 'Flow of charge per second' },
          { symbol: 'n', name: 'Charge carrier density', units: 'm⁻³', meaning: 'How many free electrons per unit volume' },
          { symbol: 'v<sub>d</sub>', name: 'Drift velocity', units: 'm/s', meaning: 'Average speed of electrons in the applied field' },
          { symbol: 'e', name: 'Electron charge', units: '1.6×10⁻¹⁹ C', meaning: 'Charge of one electron' },
        ]}),
        new CalloutBlock({ id: '32-cond-key', html: '<strong>Key insight:</strong> Metals conduct because <em>n</em> is huge — they have enormous numbers of free electrons. Nonmetals have n ≈ 0 free electrons. Metalloids (semiconductors) have a small <em>n</em> that can be controlled — and that is the basis of all modern electronics.' }),
      ]
    },

    // --- NONMETALS ---
    {
      id: 'sec-32-nonmetals',
      blocks: [
        new TextBlock({ id: '32-nm-title', tag: 'h2', html: 'Nonmetals: The Opposite Story' }),
        new TextBlock({ id: '32-nm-text', tag: 'p', html: "Nonmetals sit on the right side — high Z<sub>eff</sub>, electrons held tight. They have the <em>opposite</em> properties of metals:" }),
        new TableBlock({ id: '32-compare-table', maxWidth: '850px',
          headers: ['Property', 'Metals (left side)', 'Nonmetals (right side)', 'Why?'],
          rows: [
            ['Appearance', { text: 'Shiny (lustrous)', style: 'color:#ffa726' }, { text: 'Dull (non-lustrous)', style: 'color:#888' }, 'Free e⁻ reflect light vs. no free e⁻'],
            ['Conductivity', { text: 'High (conductors)', style: 'color:#4fc3f7' }, { text: 'Low (insulators)', style: 'color:#ef5350' }, 'Free e⁻ carry current vs. no free e⁻'],
            ['Malleability', { text: 'Can be hammered', style: 'color:#81c784' }, { text: 'Brittle / shatter', style: 'color:#ef5350' }, 'Electron sea cushions vs. rigid bonds break'],
            ['State at room T', { text: 'Mostly solid', style: 'color:#ffa726' }, { text: 'Solids, liquids, gases', style: 'color:#888' }, 'Strong metallic bond vs. weak molecular forces'],
            ['Electron behavior', { text: 'Lose electrons', style: 'color:#4fc3f7' }, { text: 'Gain or share electrons', style: 'color:#ef5350' }, 'Low Z_eff vs. high Z_eff'],
          ]
        }),
        new CalloutBlock({ id: '32-nm-examples', html: '<strong>Notable nonmetals:</strong><br>• <strong>Oxygen</strong> — the gas you breathe, incredibly reactive, Z<sub>eff</sub> ≈ 6<br>• <strong>Carbon</strong> — 4 valence electrons, forms the backbone of all organic molecules and life<br>• <strong>Nitrogen</strong> — makes up 78% of air, half-filled 2p (extra stable, hard to react)<br>• <strong>Fluorine</strong> — most electronegative element, rips electrons from almost anything' }),
      ]
    },

    // --- METALLOIDS ---
    {
      id: 'sec-32-metalloids',
      blocks: [
        new TextBlock({ id: '32-met-title', tag: 'h2', html: 'Metalloids: The Boundary Elements' }),
        new TextBlock({ id: '32-met-text', tag: 'p', html: "Along the staircase sit elements that are <em>neither fully metal nor fully nonmetal</em>. They're called metalloids, and they have the most interesting property of all:" }),
        new CalloutBlock({ id: '32-met-semi', html: '<strong>Semiconductors!</strong><br><br>Silicon (Si) and Germanium (Ge) are metalloids. In their pure form, they barely conduct. But add a tiny impurity (called <em>doping</em>), and you can precisely control their conductivity.<br><br>This tunable conductivity is what makes <strong>transistors, computer chips, solar cells, and LEDs</strong> possible. Every electronic device you own depends on metalloids.<br><br>We\'ll explore semiconductors deeply in Materials Science — this is where chemistry meets engineering.' }),
        new TableBlock({ id: '32-met-table', maxWidth: '700px',
          headers: ['Metalloid', 'Z', 'Key Use'],
          rows: [
            ['Boron (B)', '5', 'Borosilicate glass (Pyrex), rocket fuel'],
            ['Silicon (Si)', '14', 'Computer chips, solar cells, glass'],
            ['Germanium (Ge)', '32', 'Transistors, fiber optics, infrared lenses'],
            ['Arsenic (As)', '33', 'Semiconductors (GaAs), pesticides'],
            ['Tellurium (Te)', '52', 'Thermoelectric devices, solar cells'],
          ]
        }),
      ]
    },

    // --- REACTIVITY: WHY OPPOSITE ENDS ARE MOST REACTIVE ---
    {
      id: 'sec-32-reactivity',
      blocks: [
        new TextBlock({ id: '32-react-title', tag: 'h2', html: 'Reactivity: A Tale of Two Extremes' }),
        new TextBlock({ id: '32-react-text', tag: 'p', html: "Here's something beautiful. The <em>most reactive</em> metals are in the bottom-left corner (alkali metals like Na, K, Cs). The <em>most reactive</em> nonmetals are in the top-right corner (halogens like F, Cl). And the <em>least reactive</em> elements — the noble gases — sit in the far-right column with full shells. It all comes back to electron configurations." }),
        new SimBlock({ id: '32-react-viz', sim: 'reactivityViz', width: 900, height: 450 }),
        new TextBlock({ id: '32-react-caption', tag: 'p', html: '<em>Sodium\'s lone valence electron transfers to chlorine\'s empty slot — forming NaCl (table salt).</em>' }),
        new CalloutBlock({ id: '32-react-explain', html: '<strong>Why alkali metals are so reactive:</strong><br>They have 1 valence electron with very low Z<sub>eff</sub>. Losing that electron gives them a noble gas configuration. Sodium literally explodes when it touches water — it\'s THAT eager to give up its electron.<br><br><strong>Why halogens are so reactive:</strong><br>They have 7 valence electrons — just 1 short of a full shell. They have high Z<sub>eff</sub> and high electronegativity. They <em>desperately</em> want to grab one more electron from anywhere they can.<br><br><strong>When they meet:</strong><br>Na gives its electron to Cl. Na becomes Na⁺, Cl becomes Cl⁻. Opposite charges attract → <strong>ionic bond</strong> → NaCl. This is the preview of Module 4.' }),
      ]
    },

    // --- THE BIG PICTURE ---
    {
      id: 'sec-32-bigpicture',
      blocks: [
        new TextBlock({ id: '32-big-title', tag: 'h2', html: 'The Big Picture' }),
        new CalloutBlock({ id: '32-big-summary', html: '<strong>The periodic table tells a story about electrons:</strong><br><br>Left side (metals): Low Z<sub>eff</sub> → loose electrons → electron sea → conduct, shine, bend<br>Right side (nonmetals): High Z<sub>eff</sub> → tight electrons → no sea → insulate, dull, brittle<br>Staircase (metalloids): In between → tunable conductivity → <strong>semiconductors</strong><br>Far right (noble gases): Full shells → no desire to gain or lose → completely unreactive<br><br>Every property — conductivity, reactivity, appearance, bonding behavior — traces back to how tightly an atom holds its electrons.' }),
        new TableBlock({ id: '32-big-table', maxWidth: '800px',
          headers: ['Region', 'Z_eff', 'Electron Behavior', 'Result'],
          rows: [
            [{ text: 'Alkali metals', style: 'color:#ef5350' }, 'Very low (~+1)', 'Lose 1 e⁻ easily', 'Extremely reactive metals'],
            [{ text: 'Transition metals', style: 'color:#ffa726' }, 'Moderate', 'd-electrons partially shared', 'Hard, strong, colored compounds'],
            [{ text: 'Metalloids', style: 'color:#ab47bc' }, 'Intermediate', 'Semiconducting', 'Computer chips, solar cells'],
            [{ text: 'Halogens', style: 'color:#4fc3f7' }, 'High (~+7)', 'Gain 1 e⁻ eagerly', 'Extremely reactive nonmetals'],
            [{ text: 'Noble gases', style: 'color:#81c784' }, 'N/A (full)', 'No e⁻ to gain or lose', 'Completely inert'],
          ]
        }),
      ]
    },

    // --- FORWARD ---
    {
      id: 'sec-32-forward',
      blocks: [
        new TextBlock({ id: '32-fwd-title', tag: 'h2', html: 'Coming Up: Chemical Bonding' }),
        new TextBlock({ id: '32-fwd-text', tag: 'p', html: "You've now seen the <em>characters</em> of the periodic table — the eager givers, the greedy takers, the happy loners, and the in-betweeners. In Module 4, we'll watch what happens when these characters <strong>meet</strong>:" }),
        new CalloutBlock({ id: '32-fwd-callout', html: '• <strong>Ionic bonding:</strong> Metal meets nonmetal → electron transfer → Na⁺Cl⁻ → crystal lattice → table salt<br>• <strong>Covalent bonding:</strong> Nonmetal meets nonmetal → electron <em>sharing</em> → H₂O, CO₂, DNA<br>• <strong>Metallic bonding:</strong> Metal meets metal → electron sea → copper wire, steel beam<br><br>The type of bond determines <em>every</em> material property: strength, melting point, conductivity, transparency. This is where chemistry becomes <strong>materials science</strong>.' }),
      ]
    },
  ],

  stepMeta: [
    { icon: '📋', label: 'Recap', kind: 'narrate' },
    null,
    // The divide
    { icon: '🗂', label: 'Divide', kind: 'narrate' },
    { icon: '🔍', label: 'Explore', kind: 'narrate' },
    null,
    // Metals
    { icon: '🔩', label: 'Metals', kind: 'narrate' },
    { icon: '🌊', label: 'e⁻ Sea', kind: 'narrate' },
    null,
    // Electron sea model
    { icon: '💡', label: 'Model', kind: 'narrate' },
    { icon: '🔑', label: 'Properties', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },
    null,
    // Conductivity
    { icon: '⚡', label: 'Conduct', kind: 'narrate' },
    { icon: '📐', label: 'Math', kind: 'narrate' },
    null,
    // Nonmetals
    { icon: '💎', label: 'Nonmetals', kind: 'narrate' },
    { icon: '📊', label: 'Compare', kind: 'narrate' },
    null,
    // Metalloids
    { icon: '🔀', label: 'Metalloids', kind: 'narrate' },
    { icon: '💻', label: 'Semicon', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },
    null,
    // Reactivity
    { icon: '💥', label: 'Reactivity', kind: 'narrate' },
    { icon: '🧪', label: 'Na + Cl', kind: 'narrate' },
    null,
    // Big picture + quiz
    { icon: '🔗', label: 'Summary', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 3', kind: 'quiz' },
    // Forward
    { icon: '🎉', label: 'Done!', kind: 'narrate' },
  ],

  buildSteps(showSection, runner) {
    const reactViz = runner.blockInstances.find(b => b.id === '32-react-viz');

    return [
      // Recap
      { type: 'show', action: () => showSection('sec-32-recap'),
        text: "In the last lesson, we discovered that Z eff — effective nuclear charge — increases as you move left to right across a period. On the left, valence electrons barely feel the nucleus. On the right, they're gripped tightly. But we talked about this in terms of numbers and arrows on a chart. Now let's make it real. If you could hold a piece of sodium in one hand and a chunk of sulfur in the other, you'd feel something completely different. The left side of the table FEELS different from the right side. And that difference has one cause: how tightly atoms hold their electrons." },
      { type: 'pause' },

      // The divide
      { type: 'show', action: () => showSection('sec-32-divide'),
        text: "Look at the periodic table. There's an invisible staircase running through it — starting at boron, stepping down through silicon, arsenic, tellurium, all the way to astatine. Everything to the LEFT of that staircase is a metal. About 80 percent of all elements are metals. Everything to the RIGHT is a nonmetal. And the elements sitting right ON the staircase are called metalloids — hybrids with properties of both." },
      { type: 'narrate',
        text: "This isn't just a classification exercise. The metal-nonmetal divide is the most consequential pattern in chemistry. It determines what an element looks like, how it behaves, whether it conducts electricity, and how it bonds with other elements. And the divide exists for one reason: how tightly electrons are held." },
      { type: 'pause' },

      // What makes metals
      { type: 'show', action: () => showSection('sec-32-metals'),
        text: "Hold a piece of copper. It's shiny — it gleams in the light. It conducts electricity — every wire in your house is copper. You can hammer it into a thin sheet without it shattering. You can pull it into a kilometer-long wire. Every one of these properties comes from the same thing: copper's valence electrons are barely held. They're FREE." },
      { type: 'narrate',
        text: "Look at this visualization. On the left, a metal. The atoms are arranged in a grid, and the valence electrons have come loose — they're flowing freely between the atoms like a liquid. They don't belong to any single atom anymore. They've become a shared sea of electrons. On the right, a nonmetal. Each atom is clutching its own electrons tightly. Nothing is shared. Nothing flows." },
      { type: 'pause' },

      // Electron sea model
      { type: 'show', action: () => showSection('sec-32-sea'),
        text: "This is called the electron sea model, and it's one of the most powerful ideas in chemistry. In a chunk of metal, the atoms line up in a regular lattice. Their valence electrons — barely held because Z eff is low — detach from their parent atoms and wander freely through the entire structure. What you get is a grid of positive ion cores swimming in a sea of delocalized electrons." },
      { type: 'narrate',
        text: "This single model explains everything about metals. Why do they conduct? Because the free electrons can carry current. Push them with a voltage, and they flow. Why are metals shiny? The free electrons absorb light and re-emit it — that's the metallic luster. Why can you hammer metal flat? When you hit a metal, layers of atoms slide over each other, but the electron sea flows around them and keeps everything bonded. No crack. Same reason metals can be drawn into wire — the atoms slide, the sea follows, and the metal stretches instead of snapping." },
      { type: 'quiz',
        text: "Quick check on the electron sea model.",
        question: "Why can metals be hammered into flat sheets (malleability) without breaking?",
        options: [
          "Metal atoms are softer than nonmetal atoms",
          "The electron sea flows around displaced atoms, maintaining the bond",
          "Metals have fewer electrons, so they're more flexible",
          "Metals are held together by gravity"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! When atom layers slide, the electron sea redistributes around them. The metallic bond isn't directional — it works in any arrangement. That's why metals bend instead of shatter.",
        wrongFeedback: "Think about the electron sea model. When you hammer a metal and layers slide, what holds the atoms together in their new positions?" },
      { type: 'pause' },

      // Conductivity
      { type: 'show', action: () => showSection('sec-32-conductivity'),
        text: "Let's see conductivity in action. Apply a voltage across a metal — a positive end and a negative end. The free electrons drift toward the positive side. That's electric current. Billions of electrons flowing through the metal. Now look at the nonmetal side — there are no free electrons. Nothing can move. No current flows. The nonmetal is an insulator." },
      { type: 'narrate',
        text: "The math is elegant. Current I equals n times e times drift velocity times area. The key variable is n — the number of free charge carriers per unit volume. In copper, n is about 8 times 10 to the 28 electrons per cubic meter. That's enormous. In a nonmetal like sulfur, n is essentially zero. No free electrons, no current. And here's the beautiful part — metalloids like silicon have a small n that you can control by adding impurities. That controllable conductivity is the entire basis of modern electronics." },
      { type: 'pause' },

      // Nonmetals
      { type: 'show', action: () => showSection('sec-32-nonmetals'),
        text: "Now let's look at the other side — nonmetals. These sit on the right side of the table where Z eff is high. Their electrons are tightly held. No electron sea forms. Without free electrons, nonmetals are dull, they don't conduct, and they're often brittle or gaseous." },
      { type: 'narrate',
        text: "Look at the comparison table. It's a mirror image. Metals shine, nonmetals don't. Metals conduct, nonmetals insulate. Metals bend, nonmetals shatter. Metals are mostly solid, but nonmetals can be solid, liquid, or gas at room temperature. And crucially — metals LOSE electrons in reactions, while nonmetals GAIN or SHARE electrons. It all traces back to Z eff." },
      { type: 'pause' },

      // Metalloids
      { type: 'show', action: () => showSection('sec-32-metalloids'),
        text: "Between metals and nonmetals sits the most technologically important group of all: the metalloids. Silicon, germanium, arsenic — these elements live on the staircase boundary. They have intermediate Z eff. They're not great conductors and not great insulators. They're semiconductors." },
      { type: 'narrate',
        text: "Here's why semiconductors changed the world. Pure silicon barely conducts. But add a tiny trace of phosphorus — which has one extra valence electron — and suddenly silicon has a few free electrons that can carry current. Add boron instead — which has one fewer valence electron — and you create 'holes' that act like positive charge carriers. By carefully controlling these impurities, engineers can build transistors, diodes, solar cells, LEDs, and computer chips. Every electronic device in your life runs on metalloid physics. We'll explore this deeply when we reach Materials Science." },
      { type: 'quiz',
        text: "Check your understanding of the metal-nonmetal spectrum.",
        question: "Silicon is a metalloid and a semiconductor. What makes it useful for electronics?",
        options: [
          "It's shiny like a metal",
          "Its conductivity can be precisely controlled by adding impurities (doping)",
          "It has no electrons",
          "It's the most abundant element on Earth"
        ],
        correctIndex: 1,
        correctFeedback: "Correct! Silicon's intermediate conductivity can be tuned by doping — adding trace impurities that donate or accept electrons. This tunability is the basis of all semiconductor technology.",
        wrongFeedback: "Think about what makes semiconductors special compared to metals (always conduct) and nonmetals (never conduct). The key word is 'control'..." },
      { type: 'pause' },

      // Reactivity
      { type: 'show', action: () => showSection('sec-32-reactivity'),
        text: "Now here's something beautiful about the periodic table's geography. The most reactive elements aren't in one corner — they're in TWO opposite corners. The most reactive metals — alkali metals like sodium and potassium — are in the bottom-left. The most reactive nonmetals — the halogens like fluorine and chlorine — are in the top-right. And the least reactive elements — the noble gases — sit in the far-right column, completely content with their full electron shells." },
      { type: 'narrate',
        text: "Watch this animation. Sodium has one lonely valence electron with a Z eff of about plus 1. It's desperate to lose that electron and return to neon's stable full-shell configuration. Chlorine has 7 valence electrons with a Z eff of about plus 7. It's desperate to gain one more electron to complete its shell. When they meet, sodium's electron transfers to chlorine. Sodium becomes Na plus, chlorine becomes Cl minus. Opposite charges attract — an ionic bond forms. The product? NaCl — table salt. One of the most common compounds on Earth, born from two of the most reactive elements." },
      { type: 'pause' },

      // Big picture
      { type: 'show', action: () => showSection('sec-32-bigpicture'),
        text: "Let's pull it all together. The periodic table tells a story about electrons. On the left, metals — low Z eff, loose electrons, electron sea, they conduct and shine and bend. On the right, nonmetals — high Z eff, tight electrons, no sea, they insulate and are dull and brittle. On the staircase, metalloids — intermediate, tunable, the foundation of modern electronics. And on the far right, noble gases — full shells, no desire to react with anything." },
      { type: 'quiz',
        text: "Final question bringing it all together.",
        question: "Sodium (Z=11) is extremely reactive, but argon (Z=18) is completely inert. Both are in Period 3. Why the dramatic difference?",
        options: [
          "Sodium is a bigger atom",
          "Argon has more neutrons",
          "Sodium has 1 valence electron beyond a stable shell (eager to lose it), while argon has a completely full outer shell (no reason to react)",
          "Sodium is a solid and argon is a gas"
        ],
        correctIndex: 2,
        correctFeedback: "Perfect! Sodium is [Ne]3s¹ — just 1 electron beyond a noble gas config. It's desperate to lose that electron. Argon is [Ne]3s²3p⁶ — completely full outer shell. It has zero drive to gain, lose, or share electrons. Electron configuration determines reactivity.",
        wrongFeedback: "Think about their electron configurations. Sodium is [Ne]3s¹ — what does that lone electron want to do? Argon is [Ne]3s²3p⁶ — is there any room or reason to change?" },

      // Forward
      { type: 'show', action: () => showSection('sec-32-forward'),
        text: "Incredible work. You now know the characters of the periodic table — the generous metals, the greedy nonmetals, the flexible metalloids, and the contented noble gases. You understand WHY metals conduct and nonmetals don't. You've seen the electron sea model and watched sodium react with chlorine. In Module 4, we'll explore what happens when these characters actually bond together — ionic bonds, covalent bonds, metallic bonds. The type of bond determines every material property: whether something is hard or soft, transparent or opaque, a conductor or an insulator. This is where chemistry becomes materials science. See you there!" },
    ];
  },
};
