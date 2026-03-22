/**
 * Lesson 4.6 — Formal Charge & Resonance
 *
 * Atomic concept: When multiple Lewis structures are possible, formal charge
 * picks the best one. When none is clearly best, the real molecule is a
 * resonance hybrid — a blend of all valid structures with delocalized electrons.
 *
 * Prereqs used: Lewis structures (4.5), valence electrons & groups (3.1),
 * electronegativity (3.1), bond strength (4.1), VSEPR & IMFs (4.2),
 * electron shells & orbitals (2.4), moles (4.4), gas laws (6.4)
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';
import '../sims/resonanceViz.js';

export const lesson_4_6 = {
  id: '4.6',
  lessonId: 'lesson_4_6',
  title: 'Formal Charge & Resonance',

  sections: [
    /* --- Recall Hook --- */
    {
      id: 'sec-46-hook',
      blocks: [
        new TextBlock({ id: '46-hook-title', tag: 'h2', html: '🔄 One Molecule, Multiple Lewis Structures?' }),
        new CalloutBlock({ id: '46-hook-recall', html:
          '<strong>From Lesson 4.5:</strong> You can draw a Lewis structure for any molecule using the 5-step recipe. ' +
          'But sometimes the recipe gives you more than one valid answer. For ozone (O₃), you can put the double bond ' +
          'on the left OR the right — both satisfy all octets. Which is "correct"? And if both are valid, ' +
          'which one IS the real molecule?'
        }),
      ]
    },

    /* --- Formal Charge --- */
    {
      id: 'sec-46-fc',
      blocks: [
        new TextBlock({ id: '46-fc-title', tag: 'h2', html: '⚖️ Formal Charge: Rating Your Lewis Structures' }),
        new TextBlock({ id: '46-fc-p1', tag: 'p', html:
          'Formal charge (FC) asks: "If we split every bond 50/50, does each atom have more or fewer electrons than it started with?" ' +
          'It\'s a bookkeeping tool — not a real charge, but a way to rank Lewis structures.'
        }),
        new MathBlock({ id: '46-fc-math', label: 'Formal Charge:', equation: 'FC = V − L − ½B', symbols: [
          { symbol: 'V', name: 'Valence electrons', meaning: 'how many the free atom has (from group number, Lesson 3.1)' },
          { symbol: 'L', name: 'Lone pair electrons', meaning: 'non-bonding electrons on this atom' },
          { symbol: 'B', name: 'Bonding electrons', meaning: 'electrons in bonds to this atom (count all of them, then halve)' },
        ]}),
        new CalloutBlock({ id: '46-fc-rules', html:
          '<strong>Rules for the best Lewis structure:</strong><br>' +
          '1. Minimize formal charges (FCs closer to 0 are better)<br>' +
          '2. Negative FC should go on the MORE electronegative atom (from 3.1)<br>' +
          '3. Same-sign charges on adjacent atoms are bad<br>' +
          '4. Sum of all FCs must equal the overall charge of the molecule/ion'
        }),
      ]
    },

    /* --- Worked FC Example --- */
    {
      id: 'sec-46-worked',
      blocks: [
        new TextBlock({ id: '46-work-title', tag: 'h2', html: '🔬 Worked Example: CO₂ vs C=O—O' }),
        new TextBlock({ id: '46-work-p1', tag: 'p', html:
          'For CO₂, you could draw <strong>O=C=O</strong> (two double bonds) or <strong>O≡C—O</strong> (triple + single). ' +
          'Let\'s check formal charges for O=C=O:'
        }),
        new TableBlock({ id: '46-work-table1',
          headers: ['Atom', 'V', 'L', '½B', 'FC'],
          rows: [
            ['Left O',   '6', '4', '2', '6 − 4 − 2 = 0'],
            ['C',        '4', '0', '4', '4 − 0 − 4 = 0'],
            ['Right O',  '6', '4', '2', '6 − 4 − 2 = 0'],
          ]
        }),
        new TextBlock({ id: '46-work-p2', tag: 'p', html:
          'All zeros! Now check O≡C—O:'
        }),
        new TableBlock({ id: '46-work-table2',
          headers: ['Atom', 'V', 'L', '½B', 'FC'],
          rows: [
            ['Left O',   '6', '2', '3', '6 − 2 − 3 = +1'],
            ['C',        '4', '0', '4', '4 − 0 − 4 = 0'],
            ['Right O',  '6', '6', '1', '6 − 6 − 1 = −1'],
          ]
        }),
        new CalloutBlock({ id: '46-work-verdict', html:
          '<strong>Verdict:</strong> O=C=O wins — all FCs are zero. The triple-single structure has +1 on an oxygen ' +
          '(putting positive charge on the MORE electronegative atom — that violates rule 2). The symmetric ' +
          'double-bond structure is the better representation.'
        }),
      ]
    },

    /* --- Resonance --- */
    {
      id: 'sec-46-res',
      blocks: [
        new TextBlock({ id: '46-res-title', tag: 'h2', html: '⟷ Resonance: When No Single Structure Is Best' }),
        new TextBlock({ id: '46-res-p1', tag: 'p', html:
          'Sometimes two (or more) Lewis structures have equally good formal charges. Ozone (O₃) is the classic example: ' +
          'you can put the double bond on the left O or the right O. Both structures have the same formal charge pattern. ' +
          'Which is "right"?'
        }),
        new TextBlock({ id: '46-res-p2', tag: 'p', html:
          '<strong>Both are — and neither is.</strong> The real molecule is a <strong>resonance hybrid</strong>: ' +
          'a blend of all valid Lewis structures. The double bond isn\'t on the left OR the right — it\'s <em>delocalized</em> ' +
          'across both positions. Each O—O bond in real ozone is 1.5 bonds, and the extra electrons are smeared ' +
          'across the whole molecule like a cloud.'
        }),
        new CalloutBlock({ id: '46-res-warning', style: 'warning', html:
          '<strong>Common misconception:</strong> Resonance does NOT mean the molecule flips back and forth between structures. ' +
          'It\'s not switching. The real molecule is a single, fixed thing — the hybrid — that no single Lewis structure ' +
          'can fully capture. The double-headed arrow ⟷ means "blend of", not "alternates between".'
        }),
      ]
    },

    /* --- Simulation --- */
    {
      id: 'sec-46-sim',
      blocks: [
        new TextBlock({ id: '46-sim-title', tag: 'h2', html: '🎮 Resonance Explorer' }),
        new TextBlock({ id: '46-sim-p1', tag: 'p', html:
          'Explore three molecules with resonance. Switch between individual Lewis structures to see how the double bond moves. ' +
          'Then click "Hybrid" to see the real molecule — with delocalized electron clouds and fractional bond orders. ' +
          'Toggle formal charges on/off to see how they\'re calculated.'
        }),
        new SimBlock({ id: '46-sim-viz', sim: 'resonanceViz', width: 900, height: 420, simOptions: {} }),
      ]
    },

    /* --- Why Resonance Matters --- */
    {
      id: 'sec-46-why',
      blocks: [
        new TextBlock({ id: '46-why-title', tag: 'h2', html: '💎 Why Resonance Matters: Stability & Equal Bonds' }),
        new TextBlock({ id: '46-why-p1', tag: 'p', html:
          'Resonance isn\'t just an accounting trick — it has real physical consequences:'
        }),
        new TableBlock({ id: '46-why-table',
          headers: ['Consequence', 'Example', 'Connection to prior lessons'],
          rows: [
            ['Equal bond lengths', 'Carbonate CO₃²⁻: all three C—O bonds are 1.29 Å (between single 1.43 and double 1.23)', 'Bond order from 4.1: higher order = shorter bond'],
            ['Extra stability', 'Benzene (C₆H₆) is unusually stable due to 6 delocalized π electrons', 'Bond strength from 4.1: delocalization lowers energy'],
            ['Charge delocalization', 'Acetate CH₃COO⁻: negative charge spread over 2 oxygen atoms', 'Electronegativity from 3.1: charge on EN atoms is favorable'],
          ]
        }),
        new CalloutBlock({ id: '46-why-mat', html:
          '<strong>Materials science preview:</strong> Delocalized electrons are the key to electrical conductivity! ' +
          'In metals, the electron sea (3.2) IS delocalization on a massive scale. In graphite, delocalized π electrons ' +
          'across carbon sheets make it conduct electricity. Resonance at the molecular level → conductivity at the material level.'
        }),
      ]
    },

    /* --- Forward Tease --- */
    {
      id: 'sec-46-next',
      blocks: [
        new TextBlock({ id: '46-next-title', tag: 'h2', html: '⏭️ Coming Up: Oxidation States' }),
        new TextBlock({ id: '46-next-p1', tag: 'p', html:
          'Formal charge splits bonds 50/50 — a hypothetical scenario. In Lesson 4.7, you\'ll learn ' +
          '<strong>oxidation states</strong>, which assign electrons 100% to the more electronegative atom. ' +
          'This different bookkeeping method is essential for tracking electron transfer in redox reactions — ' +
          'the chemistry behind batteries, corrosion, and electrochemistry.'
        }),
      ]
    },
  ],

  // 27 entries
  stepMeta: [
    { icon: '🔄', label: 'Recall: Lewis',         kind: 'narrate' },    // 0
    { icon: '❓', label: 'Quiz: two structures',    kind: 'quiz' },       // 1
    null,                                                                   // 2
    { icon: '⚖️', label: 'Formal charge',         kind: 'narrate' },    // 3
    { icon: '⚖️', label: 'FC rules',              kind: 'narrate' },    // 4
    { icon: '❓', label: 'Quiz: calculate FC',      kind: 'quiz' },       // 5
    null,                                                                   // 6
    { icon: '🔬', label: 'Worked: CO₂',           kind: 'narrate' },    // 7
    { icon: '❓', label: 'Quiz: rank structures',   kind: 'quiz' },       // 8
    null,                                                                   // 9
    { icon: '⟷', label: 'Resonance idea',         kind: 'narrate' },    // 10
    { icon: '⟷', label: 'Hybrid = blend',         kind: 'narrate' },    // 11
    { icon: '❓', label: 'Quiz: misconception',     kind: 'quiz' },       // 12
    null,                                                                   // 13
    { icon: '🎮', label: 'Sim intro',              kind: 'narrate' },    // 14
    { icon: '🏁', label: 'Try: explore hybrids',   kind: 'checkpoint' }, // 15
    null,                                                                   // 16
    { icon: '💎', label: 'Why it matters',         kind: 'narrate' },    // 17
    { icon: '❓', label: 'Quiz: bond length',       kind: 'quiz' },       // 18
    { icon: '❓', label: 'Quiz: delocalization',    kind: 'quiz' },       // 19
    null,                                                                   // 20
    { icon: '❓', label: 'Quiz: FC + EN',           kind: 'quiz' },       // 21
    { icon: '❓', label: 'Quiz: conductivity bridge',kind: 'quiz' },      // 22
    null,                                                                   // 23
    { icon: '❓', label: 'Quiz: mega-synthesis',    kind: 'quiz' },       // 24
    null,                                                                   // 25
    { icon: '⏭️', label: 'Next: oxidation states', kind: 'narrate' },    // 26
  ],

  buildSteps(showSection, runner) {
    const simViz = runner.blockInstances.find(b => b.id === '46-sim-viz');

    return [
      // 0: Recall
      { type: 'show', action: () => showSection('sec-46-hook'),
        text: "In Lesson 4.5, you learned the 5-step recipe for Lewis structures. But here's a problem the recipe doesn't solve: sometimes you can draw more than one valid Lewis structure for the same molecule. Ozone — O₃ — is a perfect example. You can place the double bond on the left side or the right side. Both structures have correct octets. Both use all 18 valence electrons. So which one is the real molecule?" },

      // 1: Quiz — recognize multiple structures (4.5 recipe)
      { type: 'quiz',
        text: "Apply the 4.5 recipe and see if you get multiple valid answers.",
        question: "For SO₂ (18 VE, S central), you can draw S=O on the left with S—O on the right, OR S—O on the left with S=O on the right. Both satisfy all octets. How many valid Lewis structures does SO₂ have?",
        options: [
          "1 — there's always only one correct Lewis structure",
          "2 — the double bond can go on either side, giving two equivalent structures",
          "3 — you can also draw S with two double bonds",
          "0 — SO₂ can't have a valid Lewis structure"
        ],
        correctIndex: 1,
        correctFeedback: "Two equivalent structures! The double bond can be on the left O or the right O. Both have the same formal charge pattern. This is exactly the situation where resonance applies.",
        wrongFeedback: "The recipe from 4.5 can place the double bond on either O. Both give valid octets and the same formal charges → two equivalent Lewis structures." },

      // 2: pause
      { type: 'pause' },

      // 3: Formal charge formula
      { type: 'show', action: () => showSection('sec-46-fc'),
        text: "Before we tackle resonance, we need a tool for comparing Lewis structures. It's called formal charge. The formula is simple: FC equals V minus L minus half B. V is the number of valence electrons the atom normally has — from the group number in Lesson 3.1. L is the number of lone pair electrons on that atom. B is the total number of bonding electrons, and you take half because each bond is shared equally between two atoms." },

      // 4: FC rules
      { type: 'narrate',
        text: "The rules for using formal charge: First, minimize formal charges — structures where atoms are closest to zero are best. Second, if you must have charges, put negative formal charge on the more electronegative atom — from Lesson 3.1's electronegativity trends. Third, avoid putting the same sign charge on adjacent atoms. And fourth, the sum of all formal charges must equal the overall charge of the molecule or ion. For a neutral molecule, they must sum to zero." },

      // 5: Quiz — calculate FC (3.1 groups + 4.5 Lewis)
      { type: 'quiz',
        text: "Calculate formal charge. Use V from Group number (3.1), count L and B from the Lewis structure.",
        question: "In the Lewis structure H—Ö—H (with 2 lone pairs on O): what is oxygen's formal charge? O is Group 16 → V = 6. It has 2 lone pairs (L = 4) and 2 bonds (B = 4 bonding electrons).",
        options: [
          "FC = 6 − 4 − ½(4) = 6 − 4 − 2 = 0",
          "FC = 6 − 2 − ½(4) = +2",
          "FC = 6 − 4 − 4 = −2",
          "FC = 8 − 4 − 2 = +2"
        ],
        correctIndex: 0,
        correctFeedback: "FC = V − L − ½B = 6 − 4 − 2 = 0. Oxygen has zero formal charge in water — it has exactly as many electrons around it as a free O atom would. This makes sense: water is a stable, neutral molecule.",
        wrongFeedback: "FC = V − L − ½B. V = 6 (Group 16). L = 4 (2 lone pairs × 2 e⁻ each). B = 4 (2 bonds × 2 e⁻ each). FC = 6 − 4 − 2 = 0." },

      // 6: pause
      { type: 'pause' },

      // 7: Worked example
      { type: 'show', action: () => showSection('sec-46-worked'),
        text: "Let's compare two Lewis structures for CO₂. Structure 1: O=C=O with two double bonds. Every atom has FC = 0. Structure 2: O≡C—O with a triple bond on the left and single on the right. Here, left O gets +1 and right O gets −1. Which is better? Structure 1 wins — all zeros. Structure 2 puts positive charge on oxygen, the most electronegative atom, which violates rule 2. The symmetric structure is the better representation." },

      // 8: Quiz — rank structures using FC + EN (3.1 + 4.5)
      { type: 'quiz',
        text: "Use formal charge rules to pick the best structure. This requires electronegativity from 3.1.",
        question: "For SCN⁻ (thiocyanate, 16 VE), three structures are possible:\nA: [S=C=N]⁻ → FC: S=0, C=0, N=−1\nB: [S≡C—N]⁻ → FC: S=−1, C=0, N=0\nC: [S—C≡N]⁻ → FC: S=0, C=0, N=−1 (wait, same as A?)\nActually A: S=C=N⁻ (FC: S −1, C 0, N 0), B: S−C≡N (FC: S 0, C 0, N −1). Which is better?",
        options: [
          "A: S=C=N⁻ with FC −1 on S — sulfur is less EN, negative charge on less EN atom is worse",
          "B: S—C≡N with FC −1 on N — nitrogen is MORE electronegative than S (from 3.1), so negative charge on N is preferred. B is the better structure.",
          "Both are equally good — formal charge doesn't matter for ions",
          "Neither works — SCN⁻ requires expanded octets"
        ],
        correctIndex: 1,
        correctFeedback: "EN from 3.1: N (3.0) > S (2.5). Rule 2 says negative FC should go on the MORE electronegative atom. Structure B puts −1 on N → preferred. This matches reality: SCN⁻ bonds to metals through the nitrogen end.",
        wrongFeedback: "Rule 2: negative FC goes on the more electronegative atom. From 3.1: N is more EN than S. Structure B has −1 on N → better." },

      // 9: pause
      { type: 'pause' },

      // 10: Resonance concept
      { type: 'show', action: () => showSection('sec-46-res'),
        text: "Now for the big idea. Sometimes multiple Lewis structures have equally good formal charges — like ozone's two structures. When that happens, no single structure is the real molecule. Instead, the real molecule is a resonance hybrid — a blend of all the valid structures. In ozone, the double bond isn't on the left or right. It's delocalized — spread evenly across both positions. Each O—O bond is 1.5 bonds." },

      // 11: Not flipping
      { type: 'narrate',
        text: "This is the most common misconception in all of chemistry: resonance does NOT mean the molecule flips back and forth between structures. The real molecule isn't switching. Think of it like a mule — a blend of a horse and a donkey. A mule isn't a horse half the time and a donkey the other half. It's always a mule. Similarly, ozone is always the hybrid — with 1.5-order bonds everywhere — not sometimes structure A and sometimes structure B." },

      // 12: Quiz — misconception trap
      { type: 'quiz',
        text: "Test whether the resonance concept is clear.",
        question: "Carbonate (CO₃²⁻) has three resonance structures, each with the double bond on a different O. In the REAL carbonate ion, how many C—O bonds are double bonds?",
        options: [
          "1 — the double bond is on one specific oxygen",
          "3 — all three are full double bonds",
          "0 — there are no pure double bonds. All three C—O bonds are identical at 1.33 bond order (between single and double). The electrons are delocalized.",
          "It alternates — sometimes 1, sometimes another"
        ],
        correctIndex: 2,
        correctFeedback: "All three C—O bonds are identical — 1.33 order, 1.29 Å length. No single Lewis structure captures this because Lewis structures can only show integer bond orders. The resonance hybrid, with delocalized electrons, is the real picture.",
        wrongFeedback: "The real molecule is the hybrid, not any single structure. Three equivalent resonance structures → three equivalent bonds, each 1.33 order. No pure double bond exists." },

      // 13: pause
      { type: 'pause' },

      // 14: Sim intro
      { type: 'show', action: () => showSection('sec-46-sim'),
        text: "Let's see resonance in action. Below you can explore three molecules: ozone, carbonate, and nitrite. Switch between individual Lewis structures to see the double bond move. Then click Hybrid to see the real molecule — with delocalized electron clouds shown in purple. Toggle formal charges on and off. Try all three molecules and view at least one hybrid." },

      // 15: Checkpoint
      { type: 'checkpoint',
        instruction: 'Explore at least 2 molecules. View the resonance hybrid for at least one.',
        text: "Switch between structures, then click Hybrid to see the blend. Try at least two different molecules.",
        check: () => simViz?.renderer?.examplesViewed?.size >= 2 && simViz?.renderer?.hybridViewed === true,
        checkInterval: 500,
        confirmText: "See the purple electron cloud in the hybrid? Those delocalized electrons don't belong to any single bond — they're smeared across the entire molecule. This is what makes resonance structures powerful: they reveal that the real molecule has properties no single Lewis structure can represent." },

      // 16: pause
      { type: 'pause' },

      // 17: Why resonance matters
      { type: 'show', action: () => showSection('sec-46-why'),
        text: "Resonance has real, measurable consequences. First: equal bond lengths. In carbonate, all three C—O bonds are exactly 1.29 angstroms — between a single bond at 1.43 and a double bond at 1.23. From Lesson 4.1: bond order determines length, and 1.33 order gives an intermediate length. Second: extra stability. Delocalized electrons lower the energy of the molecule. Third — and this is the materials science connection — delocalization is the key to electrical conductivity." },

      // 18: Quiz — bond length from resonance + bond order (4.1)
      { type: 'quiz',
        text: "Connect resonance to bond properties from Lesson 4.1.",
        question: "A C—O single bond is 1.43 Å and a C=O double bond is 1.23 Å. Carbonate (CO₃²⁻) has 3 resonance structures giving each C—O a bond order of 1.33. Predict the C—O bond length in carbonate.",
        options: [
          "1.43 Å — all bonds are single since the double bond moves around",
          "1.23 Å — all bonds are double",
          "About 1.29 Å — between single and double, closer to double (bond order 1.33 is closer to 1 than 2, wait... 1.33 is 1/3 of the way from 1 to 2 → 1/3 of the way from 1.43 to 1.23 ≈ 1.36). Actually ~1.36 Å",
          "About 1.29 Å — experimental value confirms intermediate length, slightly different from simple interpolation due to resonance stabilization"
        ],
        correctIndex: 3,
        correctFeedback: "The experimental value is 1.29 Å — shorter than simple interpolation would predict, because resonance stabilization strengthens the bonds slightly. The key insight: resonance bond order (1.33) → intermediate bond length → measurable with X-ray crystallography. This is NOT theoretical — you can literally measure it!",
        wrongFeedback: "Bond order 1.33 → between single (1.43 Å) and double (1.23 Å). The actual measured value is 1.29 Å. Resonance makes real, measurable differences in bond length." },

      // 19: Quiz — delocalization → conductivity (3.2 metals + materials preview)
      { type: 'quiz',
        text: "This bridges molecular resonance to the electron sea model from Lesson 3.2.",
        question: "In metals, valence electrons are delocalized across the entire crystal (the 'electron sea' from 3.2). In graphite, carbon atoms form hexagonal sheets with delocalized π electrons. What does this suggest about graphite's electrical properties?",
        options: [
          "Graphite should be an insulator — carbon is a nonmetal",
          "Graphite should conduct electricity parallel to its sheets — delocalized electrons can move, just like in the metallic electron sea. But it should be a poor conductor perpendicular to sheets (no delocalization between layers).",
          "Graphite should be a superconductor because resonance is stronger than metallic bonding",
          "Graphite can't have delocalized electrons — only metals can"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! Graphite's delocalized π electrons (resonance across hexagonal rings) make it conduct electricity along its sheets — just like the electron sea in metals (3.2). But between sheets, only weak London forces hold them together (from 4.2), so no conduction perpendicular. This is why graphite is used in pencils (layers slide) AND in electrodes (conducts electricity).",
        wrongFeedback: "Delocalization = mobile electrons. In metals (3.2), the electron sea enables conductivity. Graphite's delocalized π electrons do the same thing within its sheets. Between sheets, only weak LDF (4.2) → no conduction. Graphite conducts in 2D, not 3D." },

      // 20: pause
      { type: 'pause' },

      // 21: Quiz — FC + EN ranking for a complex case (3.1 + 4.5)
      { type: 'quiz',
        text: "Apply formal charge rules to a trickier molecule.",
        question: "For carbon monoxide CO (10 VE), two structures:\nA: :C≡O: → FC: C = −1, O = +1\nB: :C=O: with extra LP on C → FC: C = −2, O = +2\nBoth are technically valid. Which is better and why?",
        options: [
          "B — more lone pairs on carbon means it's more stable",
          "A — despite the 'wrong' placement of negative charge on C (less EN than O), A has smaller FCs (−1, +1) vs B (−2, +2). Rule 1 (minimize FCs) trumps rule 2.",
          "Neither — CO should have a double bond with no formal charges",
          "A — because triple bonds are always better than double bonds"
        ],
        correctIndex: 1,
        correctFeedback: "Subtle! CO is unusual: the triple bond gives C = −1 and O = +1, which violates rule 2 (negative charge on less EN atom). But the double bond gives ±2 charges, which is worse by rule 1. Rule 1 (minimize magnitude) generally wins over rule 2. CO is famously weird — its dipole moment is nearly zero because the FC dipole and the EN dipole almost cancel!",
        wrongFeedback: "Rule 1 (minimize FC magnitude) usually trumps rule 2 (negative on more EN atom). A has |FC| = 1, B has |FC| = 2. Structure A wins even though −1 on C seems wrong." },

      // 22: Quiz — resonance in materials: benzene → graphene (3.2 + 4.2 + materials)
      { type: 'quiz',
        text: "Scale up resonance from a molecule to a material. Threads 3.2 (electron sea), 4.1 (bond strength), and 4.2 (IMFs).",
        question: "Benzene (C₆H₆) has two resonance structures with alternating single/double C—C bonds. The hybrid has all 6 C—C bonds at 1.40 Å (between single 1.54 and double 1.34). Now imagine extending this pattern infinitely into a flat sheet of hexagonal carbon: graphene. What would you predict about its properties?",
        options: [
          "Weak and brittle — carbon is a nonmetal, so it can't form strong sheets",
          "Extraordinarily strong (delocalized bonds are resonance-stabilized) + electrically conductive (delocalized π electrons move freely across the sheet, like a 2D electron sea from 3.2) + flat and thin (sp² hybridized carbon, one atom thick)",
          "Identical to diamond — all carbon materials behave the same",
          "A gas at room temperature — nonmetals with delocalized electrons can't be solid"
        ],
        correctIndex: 1,
        correctFeedback: "You just predicted graphene's properties from first principles! Resonance → delocalized π electrons → conductivity (like 3.2's electron sea). Resonance stabilization → strong bonds → incredible material strength. sp² carbon → flat sheet. Graphene is the strongest material ever measured AND an excellent conductor — all because of resonance writ large. This is chemistry becoming materials science.",
        wrongFeedback: "Scale up benzene's resonance: delocalized π electrons → mobile charges → conductivity (like the metallic electron sea from 3.2). Resonance stabilization → strong bonds → mechanical strength. The result is graphene — strongest known material and excellent conductor." },

      // 23: pause
      { type: 'pause' },

      // 24: Quiz — mega synthesis: FC + resonance + gas law + stoich
      { type: 'quiz',
        text: "Final synthesis. Threads formal charge, resonance, stoichiometry (4.4), and gas laws (6.4).",
        question: "Ozone (O₃) decomposes: 2 O₃(g) → 3 O₂(g). In O₃, the bond order is 1.5 (resonance hybrid). In O₂, the bond order is 2 (double bond). From 4.1: higher bond order = stronger bond. If you decompose 2.0 moles of O₃ at STP, what volume of O₂ forms, and why is this reaction favorable?",
        options: [
          "V = 3.0 mol × 22.4 L/mol = 67.2 L. Favorable because O₂'s double bond (bond order 2) is stronger than O₃'s 1.5-order bonds — products are lower energy.",
          "V = 2.0 × 22.4 = 44.8 L. Unfavorable because breaking bonds always costs energy.",
          "V = 67.2 L. Unfavorable because O₃ has more resonance stabilization than O₂.",
          "V = 44.8 L. Favorable because 3 molecules have more entropy than 2."
        ],
        correctIndex: 0,
        correctFeedback: "Full chain! (1) Stoichiometry (4.4): 2 mol O₃ → 3 mol O₂. (2) Gas volume at STP (6.4): 3.0 × 22.4 = 67.2 L. (3) Why favorable: O₂ has bond order 2.0 (strong double bond, 498 kJ/mol) while O₃ has bond order 1.5 (weaker resonance-averaged bonds). Products have stronger bonds → lower energy → exothermic. Resonance tells you the bond order, which tells you the energetics!",
        wrongFeedback: "Stoichiometry: 2 O₃ → 3 O₂, so 2.0 mol → 3.0 mol O₂. At STP: 3.0 × 22.4 = 67.2 L. Favorable because O₂'s bond order (2) > O₃'s bond order (1.5) → stronger bonds in products → lower energy." },

      // 25: pause
      { type: 'pause' },

      // 26: Tease next
      { type: 'show', action: () => showSection('sec-46-next'),
        text: "You now have two powerful tools: formal charge for ranking Lewis structures, and resonance for understanding delocalized electrons. In Lesson 4.7, we'll flip the bookkeeping method: instead of splitting bonds 50/50, we'll give ALL the electrons to the more electronegative atom. That's oxidation state — and it's the key to understanding electron transfer, redox reactions, batteries, and corrosion. The chemistry of materials depends on it." },
    ];
  },
};
