/**
 * Lesson 4.5 — Lewis Structures: Drawing the Blueprint of Molecules
 *
 * Atomic concept: Lewis structures show how valence electrons are distributed
 * in a molecule — which atoms share electrons (bonds) and which hold them
 * alone (lone pairs). This is THE core skill for predicting shape, polarity, and reactivity.
 *
 * Prereqs used: valence electrons & periodic table groups (3.1), electron shells (2.4),
 * octet rule & bond types (4.1), VSEPR & IMFs (4.2), electronegativity (3.1)
 *
 * Sim: lewisViz — step-by-step animated Lewis structure builder for 6 molecules
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';
import '../sims/lewisViz.js';

export const lesson_4_5 = {
  id: '4.5',
  lessonId: 'lesson_4_5',
  title: 'Lewis Structures',

  sections: [
    /* --- Recall Hook --- */
    {
      id: 'sec-45-hook',
      blocks: [
        new TextBlock({ id: '45-hook-title', tag: 'h2', html: '🔄 You Know WHY Atoms Bond — But Can You Draw It?' }),
        new CalloutBlock({ id: '45-hook-recall', html:
          '<strong>From Lesson 4.1:</strong> Atoms bond to fill their outer shells — the octet rule. ' +
          'They either transfer electrons (ionic) or share them (covalent). ' +
          '<strong>From Lesson 2.4:</strong> Valence electrons sit in the outermost shell. ' +
          '<strong>From Lesson 3.1:</strong> The group number tells you how many valence electrons an atom has.<br><br>' +
          'But how do you figure out <em>exactly</em> where every electron goes in a molecule? That\'s what Lewis structures do.'
        }),
      ]
    },

    /* --- Valence Electron Counting --- */
    {
      id: 'sec-45-count',
      blocks: [
        new TextBlock({ id: '45-count-title', tag: 'h2', html: '🔢 Step 1: Count Valence Electrons' }),
        new TextBlock({ id: '45-count-p1', tag: 'p', html:
          'Every Lewis structure starts with one question: how many valence electrons are available? ' +
          'The periodic table tells you directly:'
        }),
        new TableBlock({ id: '45-count-table',
          headers: ['Group', 'Elements', 'Valence e⁻', 'Lewis dot symbol'],
          rows: [
            ['1',  'H, Li, Na, K',    '1', '  X·'],
            ['2',  'Be, Mg, Ca',      '2', ' ·X·'],
            ['13', 'B, Al',           '3', ' ·X·  (+ 1 above)'],
            ['14', 'C, Si',           '4', '·X· with 4 dots'],
            ['15', 'N, P',            '5', ':X· with 5 dots'],
            ['16', 'O, S',            '6', ':X: with 6 dots (2 lone pairs + 2 singles)'],
            ['17', 'F, Cl, Br, I',    '7', ':X: with 7 dots (3 lone pairs + 1 single)'],
            ['18', 'He, Ne, Ar',      '8', ':X: with 8 dots (full octet!)'],
          ]
        }),
        new CalloutBlock({ id: '45-count-callout', html:
          '<strong>For molecules:</strong> just add up each atom\'s valence electrons. ' +
          'H₂O: O has 6, each H has 1 → 6 + 1 + 1 = <strong>8 total</strong>. ' +
          'That\'s your electron budget. Every electron must be placed somewhere.'
        }),
      ]
    },

    /* --- The Recipe --- */
    {
      id: 'sec-45-recipe',
      blocks: [
        new TextBlock({ id: '45-recipe-title', tag: 'h2', html: '📝 The 5-Step Recipe' }),
        new TextBlock({ id: '45-recipe-p1', tag: 'p', html:
          'Drawing a Lewis structure is a recipe. Follow these steps in order and you\'ll get it right every time:'
        }),
        new TableBlock({ id: '45-recipe-table',
          headers: ['Step', 'Action', 'Example (H₂O)'],
          rows: [
            ['1', 'Count total valence electrons', '6 + 1 + 1 = 8'],
            ['2', 'Pick central atom (least EN, never H)', 'O is central'],
            ['3', 'Draw single bonds to each outer atom (uses 2 e⁻ each)', 'H—O—H (4 e⁻ used)'],
            ['4', 'Distribute remaining e⁻ as lone pairs (outer atoms first, then central)', '4 e⁻ left → 2 lone pairs on O'],
            ['5', 'Check octets. If central atom short, convert lone pairs to double/triple bonds', 'O: 2 bonds + 2 LP = 8 ✓'],
          ]
        }),
        new CalloutBlock({ id: '45-recipe-central', html:
          '<strong>Why "least electronegative" for central atom?</strong> The central atom shares the most electrons. ' +
          'Less electronegative atoms are more willing to share (from Lesson 3.1: EN increases right and up). ' +
          'C is almost always central. H is <em>never</em> central (it can only make 1 bond).'
        }),
      ]
    },

    /* --- Simulation --- */
    {
      id: 'sec-45-sim',
      blocks: [
        new TextBlock({ id: '45-sim-title', tag: 'h2', html: '🎮 Watch Lewis Structures Build Step by Step' }),
        new TextBlock({ id: '45-sim-p1', tag: 'p', html:
          'Select a molecule and click "Next" to see each step of the recipe applied. ' +
          'Pay special attention to CO₂ and HCN — they need double and triple bonds!'
        }),
        new SimBlock({ id: '45-sim-viz', sim: 'lewisViz', width: 900, height: 420, simOptions: {} }),
      ]
    },

    /* --- Multiple Bonds --- */
    {
      id: 'sec-45-multi',
      blocks: [
        new TextBlock({ id: '45-multi-title', tag: 'h2', html: '🔗 When Single Bonds Aren\'t Enough' }),
        new TextBlock({ id: '45-multi-p1', tag: 'p', html:
          'Sometimes after Step 4, the central atom doesn\'t have an octet. That means single bonds aren\'t enough — ' +
          'you need to convert lone pairs from outer atoms into additional bonds:'
        }),
        new TableBlock({ id: '45-multi-table',
          headers: ['Molecule', 'Problem after Step 4', 'Fix', 'Result'],
          rows: [
            ['O₂', 'Each O has only 6 e⁻ around it', 'Convert 1 LP to a bond → double bond', 'O=O (each O: 8 e⁻ ✓)'],
            ['CO₂', 'C has only 4 e⁻', 'Convert 1 LP from each O → 2 double bonds', 'O=C=O (each atom: 8 ✓)'],
            ['N₂', 'Each N has only 4 e⁻', 'Convert 2 LPs to bonds → triple bond', 'N≡N (each N: 8 ✓)'],
            ['HCN', 'C has only 4 e⁻', 'Convert 2 LPs from N → triple bond', 'H—C≡N (all octets ✓)'],
          ]
        }),
        new CalloutBlock({ id: '45-multi-callout', html:
          '<strong>Connection to 4.1:</strong> Remember single bonds < double < triple in strength? ' +
          'Now you see <em>why</em> some molecules have multiple bonds — it\'s the only way to satisfy every atom\'s octet. ' +
          'N₂ has a triple bond (945 kJ/mol) — that\'s why nitrogen gas is so unreactive!'
        }),
      ]
    },

    /* --- Exceptions --- */
    {
      id: 'sec-45-except',
      blocks: [
        new TextBlock({ id: '45-except-title', tag: 'h2', html: '⚠️ Exceptions to the Octet Rule' }),
        new TableBlock({ id: '45-except-table',
          headers: ['Exception', 'Example', 'What happens', 'Why it\'s OK'],
          rows: [
            ['Incomplete octet', 'BF₃ (B has 6 e⁻)', 'B only has 3 bonds, no lone pairs', 'B is in period 2 with low EN — electron-deficient but stable'],
            ['Expanded octet', 'PCl₅ (P has 10 e⁻)', 'P makes 5 bonds — more than 8 electrons', 'P is in period 3+ and has empty d-orbitals (from 2.4) to hold extras'],
            ['Expanded octet', 'SF₆ (S has 12 e⁻)', 'S makes 6 bonds — 12 electrons', 'S in period 3, d-orbitals available'],
            ['Odd electron', 'NO (11 e⁻ total)', 'Can\'t pair all electrons', 'Free radical — very reactive'],
          ]
        }),
        new CalloutBlock({ id: '45-except-callout', html:
          '<strong>Period matters!</strong> Only period 3+ atoms (P, S, Cl, etc.) can expand beyond 8 because they have ' +
          'accessible d-orbitals from Lesson 2.4. Period 2 atoms (C, N, O, F) NEVER exceed 8.'
        }),
      ]
    },

    /* --- Shape Connection --- */
    {
      id: 'sec-45-shape',
      blocks: [
        new TextBlock({ id: '45-shape-title', tag: 'h2', html: '🔮 Lewis Structures → VSEPR → Shape → Properties' }),
        new TextBlock({ id: '45-shape-p1', tag: 'p', html:
          'This is why Lewis structures matter. Once you draw one, you can count bonding pairs and lone pairs ' +
          'around the central atom — and that\'s exactly what VSEPR (Lesson 4.2) uses to predict shape:'
        }),
        new TableBlock({ id: '45-shape-table',
          headers: ['Lewis structure shows...', 'VSEPR predicts...', 'Which determines...'],
          rows: [
            ['4 bond pairs, 0 lone pairs (CH₄)', 'Tetrahedral (109.5°)', 'Nonpolar → weak LDF → gas at room temp'],
            ['2 bond pairs, 2 lone pairs (H₂O)', 'Bent (104.5°)', 'Polar → H-bonding → liquid, high BP'],
            ['2 double bonds, 0 lone pairs (CO₂)', 'Linear (180°)', 'Nonpolar → LDF only → gas'],
          ]
        }),
        new CalloutBlock({ id: '45-shape-callout', html:
          '<strong>The complete chain:</strong> Electron config (2.4) → Valence electrons (3.1) → ' +
          'Lewis structure (4.5) → VSEPR shape (4.2) → Polarity → IMFs → Physical properties (BP, state, solubility). ' +
          'Lewis structures are the keystone in this chain.'
        }),
      ]
    },

    /* --- Forward Tease --- */
    {
      id: 'sec-45-next',
      blocks: [
        new TextBlock({ id: '45-next-title', tag: 'h2', html: '⏭️ Coming Up: Formal Charge & Resonance' }),
        new TextBlock({ id: '45-next-p1', tag: 'p', html:
          'Sometimes you can draw <em>more than one</em> valid Lewis structure for the same molecule. ' +
          'Which one is "best"? Lesson 4.6 introduces <strong>formal charge</strong> — a tool for ranking Lewis structures — ' +
          'and <strong>resonance</strong>, where the real molecule is a blend of multiple structures. ' +
          'This explains why carbonate (CO₃²⁻) has three identical C—O bonds despite only one Lewis structure showing a double bond.'
        }),
      ]
    },
  ],

  // 27 entries
  stepMeta: [
    { icon: '🔄', label: 'Recall: bonding',      kind: 'narrate' },    // 0
    { icon: '❓', label: 'Quiz: valence count',    kind: 'quiz' },       // 1
    null,                                                                  // 2
    { icon: '🔢', label: 'Count VE',             kind: 'narrate' },    // 3
    { icon: '❓', label: 'Quiz: count VE',         kind: 'quiz' },       // 4
    null,                                                                  // 5
    { icon: '📝', label: 'The recipe',            kind: 'narrate' },    // 6
    { icon: '📝', label: 'Central atom rule',     kind: 'narrate' },    // 7
    { icon: '❓', label: 'Quiz: central atom',     kind: 'quiz' },       // 8
    null,                                                                  // 9
    { icon: '🎮', label: 'Sim intro',             kind: 'narrate' },    // 10
    { icon: '🏁', label: 'Try: build H₂O & CO₂', kind: 'checkpoint' }, // 11
    null,                                                                  // 12
    { icon: '🔗', label: 'Multiple bonds',        kind: 'narrate' },    // 13
    { icon: '❓', label: 'Quiz: when double?',     kind: 'quiz' },       // 14
    { icon: '❓', label: 'Quiz: draw N₂',          kind: 'quiz' },       // 15
    null,                                                                  // 16
    { icon: '⚠️', label: 'Exceptions',            kind: 'narrate' },    // 17
    { icon: '❓', label: 'Quiz: expanded octet',   kind: 'quiz' },       // 18
    null,                                                                  // 19
    { icon: '🔮', label: 'Lewis→VSEPR→shape',    kind: 'narrate' },    // 20
    { icon: '❓', label: 'Quiz: full chain',        kind: 'quiz' },       // 21
    { icon: '❓', label: 'Quiz: IMF from Lewis',   kind: 'quiz' },       // 22
    null,                                                                  // 23
    { icon: '❓', label: 'Quiz: gas law bridge',   kind: 'quiz' },       // 24
    null,                                                                  // 25
    { icon: '⏭️', label: 'Next: resonance',       kind: 'narrate' },    // 26
  ],

  buildSteps(showSection, runner) {
    const simViz = runner.blockInstances.find(b => b.id === '45-sim-viz');

    return [
      // 0: Recall hook
      { type: 'show', action: () => showSection('sec-45-hook'),
        text: "In Lesson 4.1, you learned that atoms bond to fill their outer shells — the octet rule. In 4.2, you used VSEPR to predict molecular shapes. But there's a gap: how do you figure out exactly where every electron goes? How many bonds does an atom make? How many lone pairs does it have? That's what Lewis structures answer. They're the blueprint of molecular architecture — and once you can draw them, you can predict shape, polarity, reactivity, and more." },

      // 1: Quiz — valence electron recall (2.4 + 3.1)
      { type: 'quiz',
        text: "Let's start with the foundation. This connects electron shells (2.4) to the periodic table (3.1).",
        question: "Oxygen is in Group 16, Period 2. How many valence electrons does it have, and in which shell?",
        options: [
          "8 valence electrons in shell 2 (full octet)",
          "6 valence electrons in shell 2 (2s² 2p⁴ from Lesson 2.4)",
          "2 valence electrons in shell 1",
          "16 valence electrons (same as group number)"
        ],
        correctIndex: 1,
        correctFeedback: "Group 16 → 6 valence electrons. From 2.4: oxygen's electron configuration is 1s² 2s² 2p⁴. The outer shell (n=2) has 2 + 4 = 6 electrons. This is the number we use in Lewis structures.",
        wrongFeedback: "Group number tells you valence electrons for main-group elements. Group 16 → 6 valence electrons. From 2.4: O is 1s² 2s² 2p⁴ → shell 2 has 6 electrons." },

      // 2: pause
      { type: 'pause' },

      // 3: Counting VE
      { type: 'show', action: () => showSection('sec-45-count'),
        text: "Step one of any Lewis structure: count your valence electron budget. The periodic table makes this trivial. Group 1? One valence electron. Group 14? Four. Group 17? Seven. For a molecule, just add them all up. Water — H₂O: oxygen has 6, each hydrogen has 1, total is 8. That's your electron budget. Every single electron must be accounted for in the final structure." },

      // 4: Quiz — count VE for a molecule
      { type: 'quiz',
        text: "Count the total valence electrons.",
        question: "How many total valence electrons in carbon dioxide, CO₂? (C is Group 14, O is Group 16)",
        options: [
          "8 (4 + 2 + 2)",
          "12 (4 + 4 + 4)",
          "16 (4 + 6 + 6)",
          "22 (6 + 8 + 8)"
        ],
        correctIndex: 2,
        correctFeedback: "C has 4 (Group 14), each O has 6 (Group 16): 4 + 6 + 6 = 16 total valence electrons. Every one of these must appear somewhere in the Lewis structure.",
        wrongFeedback: "C is in Group 14 → 4 valence e⁻. O is in Group 16 → 6 valence e⁻. Total: 4 + 6 + 6 = 16." },

      // 5: pause
      { type: 'pause' },

      // 6: The recipe
      { type: 'show', action: () => showSection('sec-45-recipe'),
        text: "Here's the five-step recipe. Step 1: count total valence electrons. Step 2: pick the central atom — it's the least electronegative one, and it's never hydrogen. Step 3: draw single bonds from the central atom to each outer atom — each bond uses 2 electrons. Step 4: distribute the remaining electrons as lone pairs, starting with outer atoms. Step 5: check octets — if the central atom is short, convert lone pairs from outer atoms into double or triple bonds." },

      // 7: Central atom rule
      { type: 'narrate',
        text: "The central atom rule deserves emphasis. Why least electronegative? Because the central atom has to share electrons with the most neighbors. Less electronegative atoms are more generous with their electrons — from Lesson 3.1, electronegativity increases up and to the right. So carbon is almost always central. Hydrogen is NEVER central because it can only form one bond. And if you see a formula like HCN, the H is on the outside, C is central, and N is on the other side." },

      // 8: Quiz — central atom (3.1 electronegativity)
      { type: 'quiz',
        text: "Apply the central atom rule. Use electronegativity from Lesson 3.1.",
        question: "In the molecule SOCl₂ (thionyl chloride), which atom is central? S is in Group 16 Period 3, O is Group 16 Period 2, Cl is Group 17 Period 3.",
        options: [
          "O — it's the most electronegative, so it goes in the middle",
          "Cl — there are two of them, so they must be central",
          "S — least electronegative of the three (EN: S ≈ 2.5, O ≈ 3.5, Cl ≈ 3.0), and it's listed first",
          "Any atom could be central — it doesn't matter"
        ],
        correctIndex: 2,
        correctFeedback: "Sulfur has the lowest electronegativity (from 3.1: EN increases up and right → O > Cl > S). The least EN atom goes in the center because it's most willing to share electrons with multiple neighbors.",
        wrongFeedback: "Central atom = least electronegative (most willing to share). From 3.1 trends: S (2.5) < Cl (3.0) < O (3.5). Sulfur is central." },

      // 9: pause
      { type: 'pause' },

      // 10: Sim intro
      { type: 'show', action: () => showSection('sec-45-sim'),
        text: "Let's watch the recipe in action. Below is an interactive Lewis structure builder. Select a molecule and click Next to walk through each step. Start with H₂ to see the simplest case, then try H₂O. Once you're comfortable, try CO₂ — it needs double bonds. Step through at least 3 different molecules." },

      // 11: Checkpoint — explore molecules
      { type: 'checkpoint',
        instruction: 'Step through at least 3 different molecules (including CO₂ or HCN for multiple bonds).',
        text: "Explore the builder. Make sure to try CO₂ or HCN — they show why multiple bonds are sometimes necessary.",
        check: () => simViz?.renderer?.moleculesViewed?.size >= 3 && simViz?.renderer?.hasBuiltMultiBond === true,
        checkInterval: 500,
        confirmText: "See the pattern? Single bonds first, distribute lone pairs, check octets, and if the central atom is short — promote lone pairs to bonds. For CO₂, carbon needed two double bonds. For HCN, carbon needed a triple bond to nitrogen. The recipe handles all of these." },

      // 12: pause
      { type: 'pause' },

      // 13: Multiple bonds
      { type: 'show', action: () => showSection('sec-45-multi'),
        text: "Let's formalize what you just saw. After placing single bonds and distributing lone pairs, sometimes the central atom still doesn't have 8 electrons. The fix: take a lone pair from a neighboring atom and convert it into an additional bond. One lone pair becomes one bond — that's a double bond. Need two more? Convert two lone pairs — that's a triple bond. This is why N₂ has a triple bond and is incredibly unreactive. Three shared pairs, 945 kilojoules per mole to break." },

      // 14: Quiz — when do you need double bonds?
      { type: 'quiz',
        text: "Think about when the recipe requires multiple bonds.",
        question: "After drawing single bonds and lone pairs for formaldehyde (CH₂O, 12 VE), you find: C has only 6 electrons around it (2 bonds to H + 1 bond to O = 6). What do you do?",
        options: [
          "Add more electrons — you must have miscounted",
          "Leave C with 6 — some atoms don't need an octet",
          "Convert one lone pair from O into a bond → C=O double bond. Now C has 8 ✓",
          "Move a hydrogen to the other side of carbon"
        ],
        correctIndex: 2,
        correctFeedback: "Step 5 of the recipe! C is short of an octet → take a lone pair from O → make it a C=O double bond. Now carbon has 2(C—H) + 1(C=O) = 4 bonds = 8 electrons. Oxygen still has 8: 1 double bond + 2 lone pairs.",
        wrongFeedback: "When the central atom is short after Step 4, convert a lone pair from a neighbor into a bond. One LP → one extra bond = double bond. C goes from 6 to 8 electrons." },

      // 15: Quiz — apply to N₂ (connects to bond strength from 4.1)
      { type: 'quiz',
        text: "Now connect Lewis structures to bond strength from Lesson 4.1.",
        question: "N₂ has 10 valence electrons. After single bond + lone pairs: each N has 6 electrons (1 bond + 2 LP). You need a triple bond. How many lone pairs does each N end up with, and why is N₂ so unreactive?",
        options: [
          "0 lone pairs each — all electrons are bonding. N₂ is unreactive because there are no lone pairs to share.",
          "1 lone pair each. N≡N uses 6 e⁻ in bonds + 2 e⁻ lone pair per N = 10 total ✓. The triple bond (945 kJ/mol from 4.1) is extremely strong — too much energy to break.",
          "3 lone pairs each. N₂ is unreactive because the lone pairs repel other molecules.",
          "2 lone pairs each — same as oxygen."
        ],
        correctIndex: 1,
        correctFeedback: "N≡N: triple bond (6 bonding e⁻) + 1 lone pair on each N (4 e⁻) = 10 total. Each N: 3 bonds + 1 LP = 8 e⁻ ✓. From 4.1: triple bonds are the strongest (945 kJ/mol for N≡N). That's why N₂ makes up 78% of our atmosphere but barely reacts — it takes enormous energy to break that triple bond.",
        wrongFeedback: "10 total e⁻: 6 in the triple bond + 2 lone pair e⁻ per N = 10. Each N has 3 bonds + 1 LP = 8 e⁻ ✓. The triple bond is 945 kJ/mol strong — that's why N₂ is so inert." },

      // 16: pause
      { type: 'pause' },

      // 17: Exceptions
      { type: 'show', action: () => showSection('sec-45-except'),
        text: "The octet rule works beautifully most of the time, but there are exceptions. Some atoms, like boron in BF₃, are stable with fewer than 8 — an incomplete octet. Others, like phosphorus in PCl₅ or sulfur in SF₆, hold MORE than 8 electrons — an expanded octet. The key from Lesson 2.4: only atoms in Period 3 and beyond can expand, because they have d-orbitals available. Period 2 atoms like C, N, O, and F never exceed 8." },

      // 18: Quiz — expanded octet (2.4 orbitals)
      { type: 'quiz',
        text: "This connects Lewis structures to orbital theory from Lesson 2.4.",
        question: "Why can sulfur form SF₆ (6 bonds = 12 electrons around S) while oxygen can never form OF₆?",
        options: [
          "Sulfur is larger and can physically fit more atoms around it",
          "Sulfur is in Period 3 and has accessible 3d orbitals (from 2.4) that can hold extra electrons. Oxygen is in Period 2 with no d-orbitals — max 8 electrons.",
          "Fluorine prefers bonding to sulfur over oxygen",
          "Oxygen is too electronegative to share electrons with 6 fluorines"
        ],
        correctIndex: 1,
        correctFeedback: "From 2.4: Period 3 atoms have 3s, 3p, AND 3d subshells. Those d-orbitals can accommodate extra electrons beyond the octet. Period 2 atoms only have 2s and 2p — max 8 electrons, no exceptions. This is why expanded octets only appear in Period 3+.",
        wrongFeedback: "The answer is orbital availability from 2.4. Sulfur (Period 3) has 3d orbitals that can hold extra electrons. Oxygen (Period 2) only has 2s and 2p → max 8 electrons." },

      // 19: pause
      { type: 'pause' },

      // 20: Lewis → VSEPR → shape → properties
      { type: 'show', action: () => showSection('sec-45-shape'),
        text: "Now here's the payoff. Lewis structures aren't just electron bookkeeping — they're the input to everything you learned in Lesson 4.2. Count the bonding pairs and lone pairs around the central atom in your Lewis structure. Feed that into VSEPR. Out comes the molecular shape. From shape you get polarity. From polarity you get IMF type. From IMFs you get boiling point, state of matter, solubility. The whole chain starts here." },

      // 21: Quiz — full chain: Lewis → shape → polarity → IMFs (4.1 + 4.2 + 4.5)
      { type: 'quiz',
        text: "Trace the complete chain from Lewis structure to physical properties.",
        question: "Draw the Lewis structure of CH₄ in your head. What shape, polarity, and dominant IMF does it have?",
        options: [
          "4 bond pairs + 0 LP → tetrahedral → nonpolar (symmetric) → London dispersion forces only → low boiling point gas",
          "4 bond pairs + 0 LP → square planar → polar → dipole-dipole → liquid",
          "2 bond pairs + 2 LP → bent → polar → hydrogen bonding → high BP",
          "4 bond pairs + 0 LP → tetrahedral → polar → dipole-dipole → medium BP"
        ],
        correctIndex: 0,
        correctFeedback: "Perfect chain! Lewis: C has 4 bonds, 0 lone pairs (8 e⁻ total, all bonding). VSEPR (4.2): 4 bond pairs → tetrahedral. Polarity: C—H bonds have tiny ΔEN, and tetrahedral is symmetric → nonpolar. IMFs (4.2): only London dispersion → low BP → gas at room temp (BP = −161°C).",
        wrongFeedback: "CH₄: C has 4 bonds, 0 LP → tetrahedral (4.2). Symmetric shape + tiny ΔEN → nonpolar. Nonpolar → only LDF (4.2) → very low BP → gas." },

      // 22: Quiz — compare two molecules using Lewis structures (4.2 IMFs + 5.1 temperature)
      { type: 'quiz',
        text: "Use Lewis structures to explain a physical property difference. Connects 4.2 (IMFs) and 5.1 (temperature/energy).",
        question: "CH₄ boils at −161°C. H₂O boils at 100°C. Both have 10 electrons total. Using Lewis structures, explain the 261°C difference.",
        options: [
          "H₂O is heavier than CH₄, so it needs more energy to boil",
          "CH₄: 4 bonds, 0 LP → tetrahedral, nonpolar → LDF only. H₂O: 2 bonds, 2 LP → bent, polar → hydrogen bonding (O—H, from 4.2). H-bonds are ~10× stronger than LDF → need much more thermal energy (KE from 5.1) to separate H₂O molecules → 261°C higher BP.",
          "CH₄ has more bonds so it should actually have a higher BP — the question is wrong",
          "H₂O has lone pairs which make it magnetic, attracting other molecules"
        ],
        correctIndex: 1,
        correctFeedback: "This is the power of Lewis structures! Same electron count, vastly different properties — all because of lone pairs. H₂O's 2 lone pairs make it bent (4.2), which makes it polar, which enables hydrogen bonding. CH₄'s 0 lone pairs make it tetrahedral and symmetric → nonpolar → weak LDF only. From 5.1: boiling requires enough KE to overcome IMFs, and H-bonds need much more energy than LDF.",
        wrongFeedback: "Lewis structures reveal the difference: H₂O has 2 LP → bent → polar → H-bonding (strong). CH₄ has 0 LP → tetrahedral → nonpolar → LDF only (weak). Stronger IMFs → need more KE (5.1) to boil → higher BP." },

      // 23: pause
      { type: 'pause' },

      // 24: Quiz — bridge to gas laws (6.1 + 6.4 + 4.2)
      { type: 'quiz',
        text: "Final synthesis: Lewis structures meet gas laws. This connects 4.2, 4.5, 6.1, and 6.4.",
        question: "At room temperature, CH₄ and H₂O are both common molecules. CH₄ is a gas (follows PV=nRT well). H₂O is a liquid. Based on Lewis structures, why does H₂O deviate from ideal gas behavior at room temperature while CH₄ doesn't?",
        options: [
          "H₂O is heavier — heavy molecules can't be gases",
          "CH₄: 0 LP → nonpolar → weak LDF → IMFs negligible at 298 K → behaves ideally. H₂O: 2 LP → polar → strong H-bonds → IMFs dominate at 298 K → molecules stick together → liquid, not ideal gas. The Lewis structure (lone pairs!) determines whether PV=nRT applies.",
          "H₂O has oxygen which reacts with air, pulling it out of the gas phase",
          "Both behave ideally — H₂O is liquid simply because it's below its boiling point"
        ],
        correctIndex: 1,
        correctFeedback: "Beautiful connection! Lewis structures → lone pairs → molecular polarity → IMF strength → whether PV=nRT works! CH₄'s symmetric, no-lone-pair structure means weak IMFs that particle KE at 298 K easily overwhelms → ideal gas. H₂O's lone pairs create bent geometry, polarity, and H-bonds so strong that 298 K isn't enough KE to keep molecules apart → liquid. The ideal gas law (6.4) fails precisely because of what the Lewis structure predicts.",
        wrongFeedback: "Option D is partially right but misses the WHY. The reason H₂O boils at 100°C (not −161°C like CH₄) traces directly to its Lewis structure: 2 lone pairs → bent → polar → H-bonding. Those H-bonds are why PV=nRT fails for H₂O at room temp." },

      // 25: pause
      { type: 'pause' },

      // 26: Tease next
      { type: 'show', action: () => showSection('sec-45-next'),
        text: "You now have the most important skill in molecular chemistry: drawing Lewis structures. From valence electron count to bonds, lone pairs, and octets — you can figure out how any molecule is wired. In Lesson 4.6, we'll refine this further with formal charge — a way to determine which Lewis structure is best when multiple are possible — and resonance, where the real molecule is a blend of structures. This explains molecules like ozone and benzene, which no single Lewis structure can capture." },
    ];
  },
};
