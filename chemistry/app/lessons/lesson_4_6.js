/**
 * Lesson 4.6 — Formal Charge & Resonance
 *
 * ANIMATION-FIRST / STORYTELLING / ONE ANCHOR MOLECULE (O₃)
 * INTERACTIVE: drag atoms, puzzle-style checkpoints
 */

import { TextBlock, SimBlock } from '../blocks/Block.js';
import '../sims/ozoneStoryViz.js';

export const lesson_4_6 = {
  id: '4.6',
  lessonId: 'lesson_4_6',
  title: 'Formal Charge & Resonance',

  sections: [
    {
      id: 'sec-46-main',
      blocks: [
        new TextBlock({ id: '46-title', tag: 'h2', html: 'The Ozone Story — Formal Charge & Resonance' }),
        new SimBlock({ id: '46-viz', sim: 'ozoneStoryViz', width: 900, height: 420, simOptions: {} }),
      ]
    },
  ],

  stepMeta: [
    { icon: '🌍', label: 'Meet ozone',           kind: 'narrate' },    // 0
    { icon: '🔵', label: 'Lonely atoms',          kind: 'narrate' },    // 1
    { icon: '💡', label: 'Parking spots',         kind: 'narrate' },    // 2
    { icon: '❓', label: 'Quiz: valence e⁻',       kind: 'quiz' },       // 3
    null,                                                                  // 4
    { icon: '🏁', label: 'Drag atoms together',   kind: 'checkpoint' }, // 5
    { icon: '🔗', label: 'Structure A forms',     kind: 'narrate' },    // 6
    { icon: '🔗', label: 'Lone pairs placed',     kind: 'narrate' },    // 7
    { icon: '❓', label: 'Quiz: why double?',       kind: 'quiz' },       // 8
    null,                                                                  // 9
    { icon: '🔀', label: 'Flip to structure B',   kind: 'narrate' },    // 10
    { icon: '🤔', label: 'Which is right?',       kind: 'narrate' },    // 11
    null,                                                                  // 12
    { icon: '⚖️', label: 'Formal charge intro',   kind: 'narrate' },    // 13
    { icon: '⚖️', label: 'Calculate FCs: A',      kind: 'narrate' },    // 14
    { icon: '❓', label: 'Quiz: center FC',         kind: 'quiz' },       // 15
    null,                                                                  // 16
    { icon: '⚖️', label: 'Compare A vs B',        kind: 'narrate' },    // 17
    { icon: '❓', label: 'Quiz: which wins?',       kind: 'quiz' },       // 18
    null,                                                                  // 19
    { icon: '⟷', label: 'Neither! Both!',         kind: 'narrate' },    // 20
    { icon: '⟷', label: 'The mule analogy',       kind: 'narrate' },    // 21
    { icon: '💜', label: 'Hybrid appears',         kind: 'narrate' },    // 22
    { icon: '❓', label: 'Quiz: double bonds?',     kind: 'quiz' },       // 23
    null,                                                                  // 24
    { icon: '📏', label: 'Bond length proof',      kind: 'narrate' },    // 25
    { icon: '❓', label: 'Quiz: what proves it?',   kind: 'quiz' },       // 26
    null,                                                                  // 27
    { icon: '⚡', label: 'Delocalization',          kind: 'narrate' },    // 28
    { icon: '❓', label: 'Quiz: graphene',           kind: 'quiz' },       // 29
    null,                                                                  // 30
    { icon: '⏭️', label: 'Next up',                kind: 'narrate' },    // 31
  ],

  buildSteps(showSection, runner) {
    const viz = runner.blockInstances.find(b => b.id === '46-viz');
    const v = (state) => () => viz?.renderer?.setVisualState(state);

    return [
      // 0: Opening
      { type: 'show',
        action: () => {
          showSection('sec-46-main');
          viz?.renderer?.setVisualState({
            phase: 'floating', showDots: false,
            showLabel: '', showSubLabel: '', showInstruction: '',
          });
        },
        text: "Let me tell you about a molecule called ozone. It's the thing that protects you from ultraviolet radiation — a thin layer of it, 20 miles up, is the only reason life exists on land. And it's made of just three oxygen atoms. That's it. Three identical atoms floating around. But the way they connect? That's where one of chemistry's deepest ideas hides." },

      // 1: Lonely atoms
      { type: 'narrate',
        action: v({ showLabel: 'Three oxygen atoms', showSubLabel: 'Each one has 6 valence electrons (Group 16)' }),
        text: "Here are three oxygen atoms, just drifting. Each one is identical — oxygen, Group 16 on the periodic table. That means each has 6 electrons in its outer shell. 6 valence electrons. But they want 8. They each have two empty parking spots, and that makes them unstable. Lonely." },

      // 2: Parking spots + dots
      { type: 'narrate',
        action: v({ showDots: true, showLabel: '18 total valence electrons', showSubLabel: 'Our job: arrange them so every atom has 8' }),
        text: "See those yellow dots? Six electrons around each atom. Three atoms, six each — that's 18 electrons total. That's our entire budget. Our job is to arrange all 18 so that every atom feels like its parking lot is full — 8 electrons around each one. But right now, they're scattered. They need to come together." },

      // 3: Quiz
      { type: 'quiz',
        text: "Count the dots on screen.",
        question: "How many total valence electrons does O₃ have?",
        options: ["8", "16", "18", "24"],
        correctIndex: 2,
        correctFeedback: "3 × 6 = 18. That's our electron budget — every one must be placed.",
        wrongFeedback: "Each O has 6 (Group 16). Three atoms: 3 × 6 = 18." },

      // 4: pause
      { type: 'pause' },

      // 5: INTERACTIVE — drag atoms together
      { type: 'checkpoint',
        action: v({ showDots: false, showInstruction: '👆 Drag all three atoms toward the center!' }),
        instruction: 'Drag the oxygen atoms close together to form a molecule!',
        text: "Now it's your turn. These atoms want to bond — help them! Drag all three oxygen atoms toward the center of the screen. Get them close together and they'll snap into a molecule.",
        check: () => viz?.renderer?.atomsDraggedTogether === true,
        checkInterval: 300,
        confirmText: "They snapped together! The atoms found each other. Now let's see what bonds form." },

      // 6: Structure A forms
      { type: 'narrate',
        action: v({ phase: 'bonded-A', showInstruction: '', showLabel: 'Structure A: double bond on the left', showSubLabel: 'O═O—O' }),
        text: "Watch. The middle oxygen reaches out to both neighbors. On the left — a double bond. Two shared pairs. On the right — a single bond. Just one shared pair. The double bond is shown in orange, the single in blue." },

      // 7: Lone pairs
      { type: 'narrate',
        action: v({ showLabel: 'Lone pairs fill the remaining spots' }),
        text: "After bonds form, the leftover electrons sit as lone pairs — those yellow dots on each atom. The left oxygen has 2 lone pairs, the center has 1, the right has 3. Count everything: 4 in the double bond, 2 in the single, 12 in lone pairs. That's all 18. Every atom has 8 around it. Octets complete." },

      // 8: Quiz
      { type: 'quiz',
        text: "Look at the double bond on the left side.",
        question: "Why does ozone need a double bond? Why not all single bonds?",
        options: [
          "Double bonds look nicer",
          "All single bonds would leave the center O with only 6 electrons — not a full octet",
          "Oxygen always makes double bonds",
          "It doesn't need one — single bonds would work"
        ],
        correctIndex: 1,
        correctFeedback: "The center needs 8. Two single bonds only give it 4. The double bond is necessary for a full octet.",
        wrongFeedback: "Center O with two single bonds = only 4 electrons. It needs the double bond to reach 8." },

      // 9: pause
      { type: 'pause' },

      // 10: Flip to B
      { type: 'narrate',
        action: v({ phase: 'bonded-B', showLabel: 'Structure B: double bond on the RIGHT', showSubLabel: 'O—O═O' }),
        text: "But wait — watch this. I can move the double bond to the other side. Single bond on the left, double on the right. Count the electrons — still 18. Check the octets — still all full. This is a completely valid Lewis structure. So now we have two different answers." },

      // 11: Which is right?
      { type: 'narrate',
        action: v({ showLabel: 'Two valid structures. Which one IS ozone?' }),
        text: "Two structures. Both valid. Both use exactly 18 electrons. Both give every atom a full octet. They're mirror images. Is the double bond on the left or the right? Which one is the real ozone molecule? To answer that, we need a scoring system." },

      // 12: pause
      { type: 'pause' },

      // 13: FC intro
      { type: 'narrate',
        action: v({ phase: 'bonded-A', showLabel: 'Formal Charge: scoring Lewis structures', showSubLabel: 'FC = V − L − ½B' }),
        text: "The scoring system is called formal charge. Here's the idea: for each atom, split every bond fifty-fifty. Then ask — does this atom have more or fewer electrons than it started with? The formula is FC equals V minus L minus half B. V is valence electrons — how many a free atom has. L is lone pair electrons. Half B is half the bonding electrons." },

      // 14: Calculate FCs
      { type: 'narrate',
        action: v({ phase: 'fc-A', showLabel: 'Structure A: formal charges' }),
        text: "Watch the calculations appear. Left oxygen: 6 minus 4 minus 2 equals zero. Good — neutral. Center oxygen: 6 minus 2 minus 3 equals plus 1. It's electron-poor. Right oxygen: 6 minus 6 minus 1 equals minus 1. It's electron-rich. The formal charges are zero, plus 1, minus 1." },

      // 15: Quiz
      { type: 'quiz',
        text: "Look at the FC calculation for the center atom.",
        question: "The center O has V=6, L=2, ½B=3. Its formal charge is?",
        options: ["+2", "+1", "0", "−1"],
        correctIndex: 1,
        correctFeedback: "6 − 2 − 3 = +1. The center atom is 'electron-poor' in this bookkeeping.",
        wrongFeedback: "FC = V − L − ½B = 6 − 2 − 3 = +1." },

      // 16: pause
      { type: 'pause' },

      // 17: Compare
      { type: 'narrate',
        action: v({ phase: 'fc-B', showLabel: 'Structure B: same pattern, mirrored' }),
        text: "Now Structure B. The −1 and 0 swap sides, but the center is still +1. Both structures have the same pattern: zero, plus 1, minus 1. Just mirrored. Formal charge can't pick a winner — they're perfectly tied." },

      // 18: Quiz
      { type: 'quiz',
        text: "Both structures score the same.",
        question: "A has FCs: 0, +1, −1. B has FCs: −1, +1, 0. Which is better?",
        options: [
          "A — left double bond is preferred",
          "B — right double bond is preferred",
          "Tied — same pattern, just mirrored",
          "Both are wrong"
        ],
        correctIndex: 2,
        correctFeedback: "Tied! Same magnitudes, mirror image. When formal charge can't decide — that's when resonance enters.",
        wrongFeedback: "Same FC magnitudes, just swapped sides. They're equivalent." },

      // 19: pause
      { type: 'pause' },

      // 20: Neither and both
      { type: 'narrate',
        action: v({ phase: 'bonded-A', showLabel: '"Which structure is real?"', showSubLabel: 'Neither. And both.' }),
        text: "So which structure IS ozone? Here's the answer that changed chemistry: neither of them. And both of them. The real ozone isn't Structure A. It isn't Structure B. It's something that exists between them — a blend. We call it a resonance hybrid." },

      // 21: Mule
      { type: 'narrate',
        action: v({ showLabel: 'Resonance ≠ flipping back and forth', showSubLabel: 'A mule is always a mule — not sometimes a horse' }),
        text: "Critical point: the molecule is NOT switching between the two structures. It's not A on Mondays and B on Tuesdays. Think of a mule — a cross between a horse and a donkey. A mule is not a horse half the time. It's always a mule. The ozone molecule is always the hybrid. Always. The double-headed arrow means 'blend of,' not 'alternates between.'" },

      // 22: Hybrid appears
      { type: 'narrate',
        action: v({ phase: 'hybrid', showLabel: 'The Resonance Hybrid', showSubLabel: 'Both bonds are 1.5 order — electrons delocalized' }),
        text: "Watch it transform. The double bond fades. The single bond strengthens. What emerges is something no single Lewis structure can show: two identical bonds, each 1.5 order — halfway between single and double. The extra electrons aren't stuck on one side. They're delocalized — smeared across the whole molecule. See that purple cloud? Those are the shared, delocalized electrons. This is the real ozone." },

      // 23: Quiz
      { type: 'quiz',
        text: "Look at the purple hybrid on screen.",
        question: "In real ozone, how many bonds are double bonds?",
        options: [
          "1",
          "2",
          "0 — both bonds are identical at 1.5 order",
          "It switches between 1 and 2"
        ],
        correctIndex: 2,
        correctFeedback: "Zero pure double bonds. Both are 1.5 — identical. The hybrid is the reality.",
        wrongFeedback: "No pure double or single bonds exist. Both are identical at 1.5 order." },

      // 24: pause
      { type: 'pause' },

      // 25: Bond length proof
      { type: 'narrate',
        action: v({ phase: 'proof', showLabel: 'Proof: measured bond lengths', showSubLabel: 'X-ray crystallography confirms equal bonds' }),
        text: "This isn't theory — it's measured. Look at the three bars. A normal O—O single bond is 1.48 angstroms. A double bond is 1.21. If ozone had one of each, you'd see two different lengths. But X-ray crystallography shows both bonds are 1.28 angstroms. Identical. Right between single and double. The hybrid is real. It's physical. It's measurable." },

      // 26: Quiz
      { type: 'quiz',
        text: "Look at the bond length bars at the bottom.",
        question: "Ozone's bonds are 1.28 Å — between single (1.48) and double (1.21). What does this prove?",
        options: [
          "The measurement is wrong",
          "Both bonds are identical and intermediate — exactly what the hybrid predicts",
          "Ozone has normal single bonds",
          "Bond length doesn't relate to bond type"
        ],
        correctIndex: 1,
        correctFeedback: "1.28 Å = between single and double = 1.5 bond order. The hybrid is confirmed by measurement.",
        wrongFeedback: "1.28 is between 1.48 (single) and 1.21 (double), matching the 1.5 order the hybrid predicts." },

      // 27: pause
      { type: 'pause' },

      // 28: Materials bridge
      { type: 'narrate',
        action: v({ showLabel: 'Delocalized electrons → conductivity', showSubLabel: 'Ozone → metals → graphene → materials science' }),
        text: "Zoom out. Those delocalized electrons? They're the molecular version of something you've seen before. In Lesson 3.2, metals have an electron sea — valence electrons shared across the entire crystal. That IS delocalization on a massive scale. And graphite? Hexagonal carbon sheets with delocalized pi electrons — like infinite resonance. That's why graphite conducts electricity. Resonance at the molecular level becomes conductivity at the material level." },

      // 29: Quiz
      { type: 'quiz',
        text: "Resonance → delocalization → materials.",
        question: "Graphene is a carbon sheet with delocalized electrons everywhere. Predict its properties.",
        options: [
          "Insulator — carbon is a nonmetal",
          "Strong + conductive — delocalized e⁻ flow like a 2D electron sea",
          "Weak and brittle",
          "Same as diamond"
        ],
        correctIndex: 1,
        correctFeedback: "Delocalized electrons = conductivity. Resonance stabilization = strength. Graphene: strongest + most conductive. Chemistry becomes materials science.",
        wrongFeedback: "Delocalized electrons move freely = conductivity. Resonance-stabilized bonds = strength." },

      // 30: pause
      { type: 'pause' },

      // 31: Tease
      { type: 'narrate',
        action: v({ showLabel: 'Next: Oxidation States', showSubLabel: 'From 50/50 splitting → 100% to the greedy atom' }),
        text: "Today we scored Lewis structures by splitting bonds fifty-fifty — formal charge. When two structures tied, we found resonance: the real molecule is a blend with delocalized electrons. Next lesson, we flip the scoring: instead of splitting equally, we give ALL electrons to the more electronegative atom. That's oxidation state — the key to batteries, corrosion, and every redox reaction. See you there." },
    ];
  },
};
