/**
 * Lesson 4.6 — Formal Charge & Resonance (animation-first)
 *
 * Minimal text — the sim IS the lesson. Audio narration teaches,
 * sim visualizes resonance structures, formal charges, and hybrids.
 */

import { TextBlock, SimBlock } from '../blocks/Block.js';
import '../sims/resonanceViz.js';

export const lesson_4_6 = {
  id: '4.6',
  lessonId: 'lesson_4_6',
  title: 'Formal Charge & Resonance',

  sections: [
    {
      id: 'sec-46-sim',
      blocks: [
        new TextBlock({ id: '46-sim-title', tag: 'h2', html: 'Formal Charge & Resonance — When One Structure Isn\'t Enough' }),
        new SimBlock({ id: '46-sim-viz', sim: 'resonanceViz', width: 900, height: 420, simOptions: {} }),
      ]
    },
  ],

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
    { icon: '🎮', label: 'Explore resonance',      kind: 'narrate' },    // 14
    { icon: '🏁', label: 'Try: view hybrids',      kind: 'checkpoint' }, // 15
    null,                                                                   // 16
    { icon: '💎', label: 'Why it matters',         kind: 'narrate' },    // 17
    { icon: '❓', label: 'Quiz: bond length',       kind: 'quiz' },       // 18
    { icon: '❓', label: 'Quiz: delocalization',    kind: 'quiz' },       // 19
    null,                                                                   // 20
    { icon: '❓', label: 'Quiz: FC + EN',           kind: 'quiz' },       // 21
    { icon: '❓', label: 'Quiz: graphene bridge',   kind: 'quiz' },       // 22
    null,                                                                   // 23
    { icon: '❓', label: 'Quiz: mega-synthesis',    kind: 'quiz' },       // 24
    null,                                                                   // 25
    { icon: '⏭️', label: 'Next: oxidation states', kind: 'narrate' },    // 26
  ],

  buildSteps(showSection, runner) {
    const simViz = runner.blockInstances.find(b => b.id === '46-sim-viz');

    return [
      // 0
      { type: 'show', action: () => showSection('sec-46-sim'),
        text: "In Lesson 4.5, you learned the 5-step recipe for Lewis structures. But here's a problem the recipe doesn't solve: sometimes you can draw more than one valid Lewis structure for the same molecule. Ozone — O₃ — is a perfect example. You can place the double bond on the left side or the right side. Both have correct octets. Both use all 18 valence electrons. So which one is the real molecule?" },

      // 1
      { type: 'quiz',
        text: "Apply the 4.5 recipe and see if you get multiple valid answers.",
        question: "For SO₂ (18 VE, S central), you can draw S=O left with S—O right, OR vice versa. Both satisfy octets. How many valid Lewis structures?",
        options: [
          "1 — there's always only one correct Lewis structure",
          "2 — the double bond can go on either side, giving two equivalent structures",
          "3 — you can also draw S with two double bonds",
          "0 — SO₂ can't have a valid Lewis structure"
        ],
        correctIndex: 1,
        correctFeedback: "Two equivalent structures! The double bond can be on either O. This is exactly where resonance applies.",
        wrongFeedback: "The recipe from 4.5 can place the double bond on either O. Both give valid octets → two equivalent structures." },

      // 2
      { type: 'pause' },

      // 3
      { type: 'narrate',
        text: "Before we tackle resonance, we need a tool for comparing Lewis structures. It's called formal charge. The formula is simple: FC equals V minus L minus half B. V is the number of valence electrons the atom normally has — from the group number in Lesson 3.1. L is the number of lone pair electrons. B is the total number of bonding electrons, halved because each bond is shared. Look at the simulation — toggle formal charges on to see them calculated on each atom." },

      // 4
      { type: 'narrate',
        text: "Four rules for using formal charge. First, minimize formal charges — closer to zero is better. Second, negative FC should go on the more electronegative atom from Lesson 3.1. Third, avoid same-sign charges on adjacent atoms. Fourth, all formal charges must sum to the overall charge of the molecule or ion." },

      // 5
      { type: 'quiz',
        text: "Calculate formal charge. FC = V − L − ½B.",
        question: "In H—Ö—H (2 lone pairs on O): O is Group 16 → V=6. It has L=4 lone pair electrons and B=4 bonding electrons. What's oxygen's FC?",
        options: [
          "FC = 6 − 4 − ½(4) = 6 − 4 − 2 = 0",
          "FC = 6 − 2 − ½(4) = +2",
          "FC = 6 − 4 − 4 = −2",
          "FC = 8 − 4 − 2 = +2"
        ],
        correctIndex: 0,
        correctFeedback: "FC = 6 − 4 − 2 = 0. Oxygen has zero formal charge in water — makes sense for a stable neutral molecule.",
        wrongFeedback: "FC = V − L − ½B = 6 − 4 − 2 = 0." },

      // 6
      { type: 'pause' },

      // 7
      { type: 'narrate',
        text: "Let's compare two structures for CO₂. Structure 1: O=C=O with two double bonds — every atom has FC = 0. Structure 2: O≡C—O with a triple and single bond — left O gets +1, right O gets −1. Structure 1 wins: all zeros beat having charges. And Structure 2 puts positive charge on oxygen, the most electronegative atom — that violates rule 2." },

      // 8
      { type: 'quiz',
        text: "Use FC rules to rank structures. Requires electronegativity from 3.1.",
        question: "For SCN⁻: Structure A has FC −1 on S. Structure B has FC −1 on N. EN from 3.1: N(3.0) > S(2.5). Which is better?",
        options: [
          "A — sulfur is bigger so it handles charge better",
          "B — N is more electronegative, so negative FC on N is preferred (rule 2)",
          "Both equally good — FC doesn't matter for ions",
          "Neither works — SCN⁻ needs expanded octets"
        ],
        correctIndex: 1,
        correctFeedback: "Rule 2: negative FC goes on the more EN atom. N > S in EN → Structure B wins. This matches reality: SCN⁻ bonds through nitrogen.",
        wrongFeedback: "Rule 2: negative FC on the more electronegative atom. N(3.0) > S(2.5) → put −1 on N." },

      // 9
      { type: 'pause' },

      // 10
      { type: 'narrate',
        text: "Now the big idea. Sometimes multiple Lewis structures have equally good formal charges — like ozone's two structures. When that happens, no single structure is the real molecule. The real molecule is a resonance hybrid — a blend of all valid structures. In ozone, the double bond isn't on the left or right. It's delocalized — spread evenly across both positions. Each O—O bond is 1.5 bonds." },

      // 11
      { type: 'narrate',
        text: "This is the most common misconception in chemistry: resonance does NOT mean the molecule flips back and forth. Think of a mule — a blend of horse and donkey. A mule isn't a horse half the time and a donkey the other half. It's always a mule. Ozone is always the hybrid. The double-headed arrow means blend of, not alternates between. Click between Structure A and B in the sim, then click Hybrid to see the real molecule." },

      // 12
      { type: 'quiz',
        text: "Test the resonance concept.",
        question: "Carbonate CO₃²⁻ has 3 resonance structures, each with the double bond on a different O. In the REAL ion, how many C—O bonds are double bonds?",
        options: [
          "1 — the double bond is on one specific oxygen",
          "3 — all three are full double bonds",
          "0 — all three C—O bonds are identical at 1.33 bond order. Electrons are delocalized.",
          "It alternates between structures"
        ],
        correctIndex: 2,
        correctFeedback: "All three C—O bonds are identical — 1.33 order, 1.29 Å. No single Lewis structure captures this. The hybrid is the real picture.",
        wrongFeedback: "The real molecule is the hybrid. Three equivalent resonance structures → three equivalent bonds at 1.33 order." },

      // 13
      { type: 'pause' },

      // 14
      { type: 'narrate',
        text: "Explore the simulation now. Switch between ozone, carbonate, and nitrite. Click through the individual Lewis structures to see the double bond move. Then click Hybrid to see the real molecule with delocalized electron clouds in purple. Toggle formal charges on and off." },

      // 15
      { type: 'checkpoint',
        instruction: 'Explore at least 2 molecules. View the resonance hybrid for at least one.',
        text: "Switch between structures, then click Hybrid. Try at least two different molecules.",
        check: () => simViz?.renderer?.examplesViewed?.size >= 2 && simViz?.renderer?.hybridViewed === true,
        checkInterval: 500,
        confirmText: "See the purple electron cloud in the hybrid? Those delocalized electrons don't belong to any single bond — they're smeared across the entire molecule." },

      // 16
      { type: 'pause' },

      // 17
      { type: 'narrate',
        text: "Resonance has real consequences. First: equal bond lengths — carbonate's C—O bonds are all 1.29 angstroms, between single at 1.43 and double at 1.23. Second: extra stability — delocalized electrons lower energy. Third — the materials science connection — delocalization is the key to electrical conductivity. The electron sea in metals from Lesson 3.2 IS delocalization on a massive scale." },

      // 18
      { type: 'quiz',
        text: "Connect resonance to bond properties from 4.1.",
        question: "C—O single bond: 1.43 Å. C=O double: 1.23 Å. Carbonate has bond order 1.33. Predict the bond length.",
        options: [
          "1.43 Å — all single since the double bond moves",
          "1.23 Å — all double",
          "~1.36 Å — simple interpolation between single and double",
          "~1.29 Å — experimental value; resonance stabilization makes it shorter than interpolation predicts"
        ],
        correctIndex: 3,
        correctFeedback: "Experimental: 1.29 Å. Resonance stabilization strengthens the bonds beyond simple interpolation. Measurable with X-ray crystallography!",
        wrongFeedback: "Bond order 1.33 → between single and double. Actual measured value: 1.29 Å." },

      // 19
      { type: 'quiz',
        text: "Bridge molecular resonance to the electron sea from 3.2.",
        question: "Graphite has hexagonal carbon sheets with delocalized π electrons — like resonance across infinite benzene rings. What does this predict?",
        options: [
          "Graphite is an insulator — carbon is a nonmetal",
          "Graphite conducts electricity parallel to sheets (delocalized e⁻ move freely, like the metal electron sea) but poorly perpendicular (only weak LDF between layers)",
          "Graphite is a superconductor",
          "Graphite can't have delocalized electrons"
        ],
        correctIndex: 1,
        correctFeedback: "Graphite's delocalized π electrons = 2D electron sea → conducts along sheets. Between sheets: only weak LDF (4.2) → no conduction. That's why graphite works in pencils (layers slide) AND electrodes (conducts).",
        wrongFeedback: "Delocalization = mobile electrons = conductivity, just like the metal electron sea (3.2). But only within the sheets." },

      // 20
      { type: 'pause' },

      // 21
      { type: 'quiz',
        text: "Tricky FC ranking.",
        question: "CO has two structures: A) :C≡O: (FC: C=−1, O=+1) and B) :C=O: (FC: C=−2, O=+2). Which is better?",
        options: [
          "B — more lone pairs on carbon is more stable",
          "A — despite negative FC on less EN atom (C), smaller FCs (±1 vs ±2) win. Rule 1 trumps rule 2.",
          "Neither — CO should have no formal charges",
          "A — because triple bonds are always better"
        ],
        correctIndex: 1,
        correctFeedback: "Rule 1 (minimize magnitude) generally wins over rule 2. |±1| < |±2|. CO is famously weird — its dipole moment is nearly zero because FC dipole and EN dipole almost cancel!",
        wrongFeedback: "Rule 1 (minimize FC) trumps rule 2 (negative on more EN). ±1 beats ±2." },

      // 22
      { type: 'quiz',
        text: "Scale resonance from molecule to material.",
        question: "Benzene has 6 C—C bonds at 1.40 Å (between single 1.54 and double 1.34) due to resonance. Extend this infinitely into graphene. Predict its properties.",
        options: [
          "Weak and brittle — carbon is a nonmetal",
          "Extraordinarily strong (resonance-stabilized bonds) + electrically conductive (delocalized π = 2D electron sea) + one atom thick",
          "Identical to diamond",
          "A gas at room temperature"
        ],
        correctIndex: 1,
        correctFeedback: "You just predicted graphene from first principles! Resonance → delocalized e⁻ → conductivity. Resonance stabilization → strong bonds → incredible strength. This is chemistry becoming materials science.",
        wrongFeedback: "Scale up benzene: delocalized π electrons → conductivity. Resonance stabilization → strong bonds. Result: graphene — strongest material known + excellent conductor." },

      // 23
      { type: 'pause' },

      // 24
      { type: 'quiz',
        text: "Final synthesis: FC + resonance + stoichiometry (4.4) + gas laws (6.4).",
        question: "2 O₃(g) → 3 O₂(g). O₃ bond order = 1.5 (resonance). O₂ bond order = 2. Decompose 2.0 mol O₃ at STP. Volume of O₂? Why is this favorable?",
        options: [
          "67.2 L. Favorable: O₂'s double bond (order 2) is stronger than O₃'s 1.5-order bonds → products are lower energy.",
          "44.8 L. Unfavorable: breaking bonds always costs energy.",
          "67.2 L. Unfavorable: O₃ has more resonance stabilization.",
          "44.8 L. Favorable: more molecules = more entropy."
        ],
        correctIndex: 0,
        correctFeedback: "Stoichiometry (4.4): 2 mol → 3 mol O₂. Gas volume (6.4): 3.0 × 22.4 = 67.2 L. O₂ bond order 2 > O₃ bond order 1.5 → stronger bonds in products → lower energy → favorable.",
        wrongFeedback: "2 O₃ → 3 O₂: 3.0 mol × 22.4 L/mol = 67.2 L. O₂ bonds (order 2) are stronger than O₃ bonds (order 1.5) → products lower energy." },

      // 25
      { type: 'pause' },

      // 26
      { type: 'narrate',
        text: "You now have formal charge for ranking structures and resonance for understanding delocalized electrons. In Lesson 4.7, we'll flip the bookkeeping: instead of splitting bonds 50/50, we give ALL electrons to the more electronegative atom. That's oxidation state — the key to redox reactions, batteries, and corrosion." },
    ];
  },
};
