/**
 * Lesson 4.5 — Lewis Structures (animation-first)
 *
 * Minimal text — the sim IS the lesson. Audio narration teaches,
 * sim visualizes step-by-step Lewis structure construction.
 */

import { TextBlock, SimBlock } from '../blocks/Block.js';
import '../sims/lewisViz.js';

export const lesson_4_5 = {
  id: '4.5',
  lessonId: 'lesson_4_5',
  title: 'Lewis Structures',

  sections: [
    {
      id: 'sec-45-sim',
      blocks: [
        new TextBlock({ id: '45-sim-title', tag: 'h2', html: 'Lewis Structures — Drawing the Blueprint of Molecules' }),
        new SimBlock({ id: '45-sim-viz', sim: 'lewisViz', width: 900, height: 420, simOptions: {} }),
      ]
    },
  ],

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
    { icon: '🎮', label: 'Sim: build molecules',  kind: 'narrate' },    // 10
    { icon: '🏁', label: 'Try: build H₂O & CO₂', kind: 'checkpoint' }, // 11
    null,                                                                  // 12
    { icon: '🔗', label: 'Multiple bonds',        kind: 'narrate' },    // 13
    { icon: '❓', label: 'Quiz: when double?',     kind: 'quiz' },       // 14
    { icon: '❓', label: 'Quiz: N₂ triple bond',   kind: 'quiz' },       // 15
    null,                                                                  // 16
    { icon: '⚠️', label: 'Exceptions',            kind: 'narrate' },    // 17
    { icon: '❓', label: 'Quiz: expanded octet',   kind: 'quiz' },       // 18
    null,                                                                  // 19
    { icon: '🔮', label: 'Lewis→shape chain',     kind: 'narrate' },    // 20
    { icon: '❓', label: 'Quiz: full chain',        kind: 'quiz' },       // 21
    { icon: '❓', label: 'Quiz: CH₄ vs H₂O',      kind: 'quiz' },       // 22
    null,                                                                  // 23
    { icon: '❓', label: 'Quiz: gas law bridge',   kind: 'quiz' },       // 24
    null,                                                                  // 25
    { icon: '⏭️', label: 'Next: resonance',       kind: 'narrate' },    // 26
  ],

  buildSteps(showSection, runner) {
    const simViz = runner.blockInstances.find(b => b.id === '45-sim-viz');

    return [
      // 0
      { type: 'show', action: () => showSection('sec-45-sim'),
        text: "In Lesson 4.1, you learned that atoms bond to fill their outer shells — the octet rule. In 4.2, you used VSEPR to predict molecular shapes. But there's a gap: how do you figure out exactly where every electron goes? How many bonds does an atom make? How many lone pairs does it have? That's what Lewis structures answer. They're the blueprint of molecular architecture — and once you can draw them, you can predict shape, polarity, reactivity, and more." },

      // 1
      { type: 'quiz',
        text: "Let's start with the foundation. This connects electron shells from 2.4 to the periodic table from 3.1.",
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

      // 2
      { type: 'pause' },

      // 3
      { type: 'narrate',
        text: "Step one of any Lewis structure: count your valence electron budget. The periodic table makes this trivial. Group 1? One valence electron. Group 14? Four. Group 17? Seven. For a molecule, just add them all up. Water — H₂O: oxygen has 6, each hydrogen has 1, total is 8. That's your electron budget. Every single electron must be accounted for in the final structure." },

      // 4
      { type: 'quiz',
        text: "Count the total valence electrons.",
        question: "How many total valence electrons in carbon dioxide, CO₂? (C is Group 14, O is Group 16)",
        options: ["8 (4 + 2 + 2)", "12 (4 + 4 + 4)", "16 (4 + 6 + 6)", "22 (6 + 8 + 8)"],
        correctIndex: 2,
        correctFeedback: "C has 4 (Group 14), each O has 6 (Group 16): 4 + 6 + 6 = 16 total valence electrons. Every one of these must appear somewhere in the Lewis structure.",
        wrongFeedback: "C is in Group 14 → 4 valence e⁻. O is in Group 16 → 6 valence e⁻. Total: 4 + 6 + 6 = 16." },

      // 5
      { type: 'pause' },

      // 6
      { type: 'narrate',
        text: "Here's the five-step recipe. Step 1: count total valence electrons. Step 2: pick the central atom — it's the least electronegative one, and it's never hydrogen. Step 3: draw single bonds from the central atom to each outer atom — each bond uses 2 electrons. Step 4: distribute the remaining electrons as lone pairs, starting with outer atoms. Step 5: check octets — if the central atom is short, convert lone pairs from outer atoms into double or triple bonds." },

      // 7
      { type: 'narrate',
        text: "The central atom rule deserves emphasis. Why least electronegative? Because the central atom has to share electrons with the most neighbors. Less electronegative atoms are more generous with their electrons — from Lesson 3.1, electronegativity increases up and to the right. So carbon is almost always central. Hydrogen is NEVER central because it can only form one bond. And if you see a formula like HCN, the H is on the outside, C is central, and N is on the other side." },

      // 8
      { type: 'quiz',
        text: "Apply the central atom rule using electronegativity from Lesson 3.1.",
        question: "In SOCl₂, which atom is central? S is Group 16 Period 3, O is Group 16 Period 2, Cl is Group 17 Period 3.",
        options: [
          "O — it's the most electronegative, so it goes in the middle",
          "Cl — there are two of them, so they must be central",
          "S — least electronegative of the three (EN: S ≈ 2.5, O ≈ 3.5, Cl ≈ 3.0)",
          "Any atom could be central — it doesn't matter"
        ],
        correctIndex: 2,
        correctFeedback: "Sulfur has the lowest electronegativity (from 3.1: EN increases up and right → O > Cl > S). The least EN atom goes in the center because it's most willing to share electrons with multiple neighbors.",
        wrongFeedback: "Central atom = least electronegative. From 3.1 trends: S (2.5) < Cl (3.0) < O (3.5). Sulfur is central." },

      // 9
      { type: 'pause' },

      // 10
      { type: 'narrate',
        text: "Now watch the recipe in action in the simulation. Select a molecule and click Next to walk through each step. Start with H₂ to see the simplest case, then try H₂O. Once you're comfortable, try CO₂ — it needs double bonds. Step through at least 3 different molecules." },

      // 11
      { type: 'checkpoint',
        instruction: 'Step through at least 3 different molecules (including CO₂ or HCN for multiple bonds).',
        text: "Explore the builder. Make sure to try CO₂ or HCN — they show why multiple bonds are sometimes necessary.",
        check: () => simViz?.renderer?.moleculesViewed?.size >= 3 && simViz?.renderer?.hasBuiltMultiBond === true,
        checkInterval: 500,
        confirmText: "See the pattern? Single bonds first, distribute lone pairs, check octets, and if the central atom is short — promote lone pairs to bonds. For CO₂, carbon needed two double bonds. For HCN, carbon needed a triple bond to nitrogen." },

      // 12
      { type: 'pause' },

      // 13
      { type: 'narrate',
        text: "Let's formalize what you just saw. After placing single bonds and distributing lone pairs, sometimes the central atom still doesn't have 8 electrons. The fix: take a lone pair from a neighboring atom and convert it into an additional bond. One lone pair becomes one bond — that's a double bond. Need two more? Convert two lone pairs — that's a triple bond. This is why N₂ has a triple bond and is incredibly unreactive. Three shared pairs, 945 kilojoules per mole to break." },

      // 14
      { type: 'quiz',
        text: "When does the recipe require multiple bonds?",
        question: "After drawing single bonds and lone pairs for formaldehyde (CH₂O, 12 VE), C has only 6 electrons. What do you do?",
        options: [
          "Add more electrons — you must have miscounted",
          "Leave C with 6 — some atoms don't need an octet",
          "Convert one lone pair from O into a bond → C=O double bond. Now C has 8 ✓",
          "Move a hydrogen to the other side of carbon"
        ],
        correctIndex: 2,
        correctFeedback: "Step 5! C is short → take a lone pair from O → make it a C=O double bond. Now carbon has 2(C—H) + 1(C=O) = 4 bonds = 8 electrons.",
        wrongFeedback: "When the central atom is short after Step 4, convert a lone pair from a neighbor into a bond. C goes from 6 to 8 electrons." },

      // 15
      { type: 'quiz',
        text: "Connect Lewis structures to bond strength from Lesson 4.1.",
        question: "N₂ has 10 VE. It needs a triple bond. How many lone pairs per N, and why is N₂ so unreactive?",
        options: [
          "0 lone pairs each — all electrons are bonding",
          "1 lone pair each. N≡N (6 bonding e⁻) + 1 LP per N (4 e⁻) = 10. The triple bond (945 kJ/mol) is extremely strong.",
          "3 lone pairs each — the lone pairs repel other molecules",
          "2 lone pairs each — same as oxygen"
        ],
        correctIndex: 1,
        correctFeedback: "N≡N: 6 bonding e⁻ + 1 LP per N (4 e⁻) = 10 total. Each N: 3 bonds + 1 LP = 8 e⁻ ✓. From 4.1: triple bonds are 945 kJ/mol — that's why N₂ barely reacts.",
        wrongFeedback: "10 total e⁻: 6 in the triple bond + 2 LP e⁻ per N = 10. Triple bond = 945 kJ/mol — extremely unreactive." },

      // 16
      { type: 'pause' },

      // 17
      { type: 'narrate',
        text: "The octet rule works most of the time, but there are exceptions. Boron in BF₃ is stable with only 6 electrons — an incomplete octet. Phosphorus in PCl₅ and sulfur in SF₆ hold MORE than 8 — expanded octets. The key from Lesson 2.4: only atoms in Period 3 and beyond can expand, because they have d-orbitals available. Period 2 atoms like C, N, O, and F never exceed 8." },

      // 18
      { type: 'quiz',
        text: "This connects Lewis structures to orbital theory from Lesson 2.4.",
        question: "Why can sulfur form SF₆ (12 electrons around S) while oxygen can never form OF₆?",
        options: [
          "Sulfur is larger and can physically fit more atoms",
          "Sulfur is in Period 3 with accessible 3d orbitals (from 2.4). Oxygen is Period 2 with no d-orbitals — max 8.",
          "Fluorine prefers bonding to sulfur over oxygen",
          "Oxygen is too electronegative to share with 6 fluorines"
        ],
        correctIndex: 1,
        correctFeedback: "Period 3 atoms have 3d subshells that accommodate extra electrons. Period 2 atoms only have 2s and 2p — max 8, no exceptions.",
        wrongFeedback: "Sulfur (Period 3) has 3d orbitals. Oxygen (Period 2) has only 2s and 2p → max 8 electrons." },

      // 19
      { type: 'pause' },

      // 20
      { type: 'narrate',
        text: "Now the payoff. Lewis structures feed directly into VSEPR from Lesson 4.2. Count bonding pairs and lone pairs around the central atom. That gives you molecular shape. Shape gives you polarity. Polarity gives you IMF type. IMFs give you boiling point and state of matter. The whole chain — electron config to physical properties — starts with Lewis structures." },

      // 21
      { type: 'quiz',
        text: "Trace the complete chain from Lewis structure to physical properties.",
        question: "Lewis structure of CH₄: what shape, polarity, and dominant IMF?",
        options: [
          "4 bond pairs + 0 LP → tetrahedral → nonpolar → LDF only → low BP gas",
          "4 bond pairs + 0 LP → square planar → polar → dipole-dipole → liquid",
          "2 bond pairs + 2 LP → bent → polar → H-bonding → high BP",
          "4 bond pairs + 0 LP → tetrahedral → polar → dipole-dipole"
        ],
        correctIndex: 0,
        correctFeedback: "Lewis: 4 bonds, 0 LP. VSEPR: tetrahedral. Symmetric + tiny ΔEN → nonpolar → LDF only → gas (BP = −161°C).",
        wrongFeedback: "CH₄: 4 bonds, 0 LP → tetrahedral → symmetric → nonpolar → LDF → gas." },

      // 22
      { type: 'quiz',
        text: "Use Lewis structures to explain a physical property difference.",
        question: "CH₄ boils at −161°C. H₂O boils at 100°C. Both have 10 electrons. Explain the 261°C difference using Lewis structures.",
        options: [
          "H₂O is heavier than CH₄",
          "CH₄: 0 LP → tetrahedral, nonpolar → LDF. H₂O: 2 LP → bent, polar → H-bonding (~10× stronger). Need much more KE to separate H₂O → 261°C higher BP.",
          "CH₄ has more bonds so should have higher BP",
          "H₂O lone pairs make it magnetic"
        ],
        correctIndex: 1,
        correctFeedback: "Same electron count, vastly different properties — all because of lone pairs! H₂O's 2 LP → bent → polar → H-bonding. CH₄'s 0 LP → tetrahedral → nonpolar → weak LDF.",
        wrongFeedback: "H₂O has 2 LP → bent → polar → H-bonding (strong). CH₄ has 0 LP → tetrahedral → nonpolar → LDF (weak). Stronger IMFs → higher BP." },

      // 23
      { type: 'pause' },

      // 24
      { type: 'quiz',
        text: "Lewis structures meet gas laws. Connects 4.2, 4.5, 6.1, and 6.4.",
        question: "CH₄ is a gas (follows PV=nRT). H₂O is a liquid at room temp. Why does H₂O deviate from ideal gas behavior while CH₄ doesn't?",
        options: [
          "H₂O is heavier — heavy molecules can't be gases",
          "CH₄: 0 LP → nonpolar → weak LDF → ideal. H₂O: 2 LP → polar → strong H-bonds → molecules stick together → liquid. Lewis structure determines whether PV=nRT applies.",
          "H₂O reacts with air, pulling it out of gas phase",
          "Both behave ideally — H₂O is liquid simply because it's below its boiling point"
        ],
        correctIndex: 1,
        correctFeedback: "Lewis structures → lone pairs → polarity → IMF strength → whether PV=nRT works! CH₄'s no-lone-pair structure means weak IMFs easily overcome by KE at 298 K. H₂O's lone pairs create H-bonds too strong for 298 K to break.",
        wrongFeedback: "H₂O's Lewis structure (2 LP → bent → polar → H-bonding) is why PV=nRT fails at room temp." },

      // 25
      { type: 'pause' },

      // 26
      { type: 'narrate',
        text: "You now have the most important skill in molecular chemistry: drawing Lewis structures. In Lesson 4.6, we'll handle molecules where multiple valid structures exist — using formal charge to rank them, and resonance to understand how the real molecule is a blend of structures." },
    ];
  },
};
