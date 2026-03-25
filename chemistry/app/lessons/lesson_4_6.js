/**
 * Lesson 4.6 — Formal Charge & Resonance
 *
 * ANIMATION-FIRST / STORYTELLING / ONE ANCHOR MOLECULE
 *
 * Anchor molecule: O₃ (ozone)
 * - 3 atoms, simple enough to build from scratch
 * - Has 2 equivalent resonance structures
 * - Formal charges are easy to compute
 * - Real-world relevance (ozone layer, smog)
 * - Leads naturally to delocalization → materials science
 *
 * The sim IS the lesson. Visuals sync with narration step by step.
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
        new TextBlock({ id: '46-title', tag: 'h2', html: 'Formal Charge & Resonance — The Ozone Story' }),
        new SimBlock({ id: '46-viz', sim: 'ozoneStoryViz', width: 900, height: 420, simOptions: {} }),
      ]
    },
  ],

  stepMeta: [
    { icon: '🌍', label: 'Meet ozone',          kind: 'narrate' },    // 0
    { icon: '🔵', label: 'Lonely atoms',         kind: 'narrate' },    // 1
    { icon: '💡', label: 'Parking spots',        kind: 'narrate' },    // 2
    { icon: '❓', label: 'Quiz: valence e⁻',      kind: 'quiz' },       // 3
    null,                                                                 // 4
    { icon: '🔗', label: 'Build structure A',    kind: 'narrate' },    // 5
    { icon: '🔗', label: 'Lone pairs placed',    kind: 'narrate' },    // 6
    { icon: '❓', label: 'Quiz: why double?',      kind: 'quiz' },       // 7
    null,                                                                 // 8
    { icon: '🔀', label: 'Flip: structure B',    kind: 'narrate' },    // 9
    { icon: '🤔', label: 'Which is right?',      kind: 'narrate' },    // 10
    { icon: '⚖️', label: 'Formal charge',        kind: 'narrate' },    // 11
    { icon: '⚖️', label: 'Calculate FCs',        kind: 'narrate' },    // 12
    { icon: '❓', label: 'Quiz: center FC',        kind: 'quiz' },       // 13
    null,                                                                 // 14
    { icon: '⚖️', label: 'Compare A vs B',       kind: 'narrate' },    // 15
    { icon: '❓', label: 'Quiz: which wins?',      kind: 'quiz' },       // 16
    null,                                                                 // 17
    { icon: '⟷', label: 'Neither! Both!',        kind: 'narrate' },    // 18
    { icon: '⟷', label: 'The mule analogy',      kind: 'narrate' },    // 19
    { icon: '💜', label: 'The hybrid',            kind: 'narrate' },    // 20
    { icon: '❓', label: 'Quiz: how many doubles?', kind: 'quiz' },     // 21
    null,                                                                 // 22
    { icon: '📏', label: 'Bond length proof',     kind: 'narrate' },    // 23
    { icon: '❓', label: 'Quiz: predict length',   kind: 'quiz' },       // 24
    null,                                                                 // 25
    { icon: '⚡', label: 'Delocalization',         kind: 'narrate' },    // 26
    { icon: '❓', label: 'Quiz: graphene',          kind: 'quiz' },       // 27
    null,                                                                 // 28
    { icon: '⏭️', label: 'Next up',               kind: 'narrate' },    // 29
  ],

  buildSteps(showSection, runner) {
    const viz = runner.blockInstances.find(b => b.id === '46-viz');

    // Helper to set visual state on the sim
    function vis(state) {
      return () => viz?.renderer?.setVisualState(state);
    }

    return [
      // --- ACT 1: Meet the atoms ---

      // 0: Opening — meet ozone
      { type: 'show', action: () => {
          showSection('sec-46-main');
          viz?.renderer?.setVisualState({
            step: 0, showDots: false, showBonds: false, showFC: false, showFCCalc: false,
            showHybrid: false, showBondLength: false, showDelocalized: false,
            showLabel: 'Three oxygen atoms, floating alone...', showSubLabel: '',
          });
        },
        text: "Let me tell you about a molecule called ozone. It's the thing that protects you from the sun's ultraviolet radiation — a thin layer of it, 20 miles up, is the only reason life exists on land. And it's made of just three oxygen atoms. That's it. Three identical atoms. But the way they connect? That's where one of chemistry's deepest ideas lives. Let's start from scratch." },

      // 1: Lonely atoms
      { type: 'narrate',
        action: vis({ step: 1, showLabel: 'Each oxygen: 6 valence electrons', showSubLabel: 'Group 16 on the periodic table → 6 outer electrons' }),
        text: "Here are three oxygen atoms, just floating around. Each one is identical. Oxygen is in Group 16 on the periodic table, which means each atom has 6 electrons in its outer shell — 6 valence electrons. But 6 isn't enough. These atoms want 8. They each have two empty parking spots, and they're not happy about it." },

      // 2: Parking spots analogy
      { type: 'narrate',
        action: vis({ step: 2, showDots: true, showLabel: 'The parking lot has 18 spots total', showSubLabel: '3 atoms × 6 electrons = 18 valence electrons to place' }),
        text: "Think of each atom's outer shell as a parking lot with 8 spots. Right now, each oxygen has 6 cars parked and 2 empty spaces. Three atoms, 6 electrons each — that's 18 electrons total. Our job is to arrange all 18 of those electrons so that every atom feels like it has a full lot of 8. That's what Lewis structures do — they're the parking map." },

      // 3: Quiz — count VE
      { type: 'quiz',
        text: "Looking at the three atoms on screen, each with 6 dots around them.",
        question: "How many total valence electrons does ozone (O₃) have?",
        options: ["8", "16", "18", "24"],
        correctIndex: 2,
        correctFeedback: "3 oxygens × 6 valence electrons each = 18. That's our budget.",
        wrongFeedback: "Each O has 6 valence electrons (Group 16). Three atoms: 3 × 6 = 18." },

      // 4: pause
      { type: 'pause' },

      // --- ACT 2: Build Structure A ---

      // 5: Draw bonds — structure A
      { type: 'narrate',
        action: vis({
          step: 5, showDots: false, showBonds: true, bondConfig: 'A',
          showLabel: 'Structure A: double bond on the left', showSubLabel: 'O=O—O',
          showFC: false, showFCCalc: false,
        }),
        text: "Now let's connect them. The middle oxygen reaches out to both neighbors. On the left side, it shares two pairs of electrons — that's a double bond. On the right side, just one pair — a single bond. Watch the dots rearrange into bonds and lone pairs." },

      // 6: Lone pairs
      { type: 'narrate',
        action: vis({ showLabel: 'Lone pairs fill the remaining spots' }),
        text: "After the bonds are placed, the leftover electrons sit as lone pairs — pairs of electrons that belong to just one atom, not shared. The left oxygen has 2 lone pairs. The center has 1. The right has 3. Count it up: 4 electrons in the double bond, 2 in the single bond, and 12 in lone pairs. That's 18 — every electron accounted for, every atom with 8 around it. Octets satisfied." },

      // 7: Quiz — why double bond?
      { type: 'quiz',
        text: "Look at the structure. The left bond is a double bond.",
        question: "Why does ozone need a double bond instead of all single bonds?",
        options: [
          "Double bonds look nicer",
          "With only single bonds, the center O would only have 6 electrons — not a full octet",
          "Oxygen always makes double bonds",
          "Single bonds are too weak"
        ],
        correctIndex: 1,
        correctFeedback: "The center atom needs 8. Two single bonds only give it 4 bonding electrons. A double bond on one side brings it to 6 + a lone pair gets it to 8.",
        wrongFeedback: "It's about the octet. The center O needs a double bond to reach 8 electrons." },

      // 8: pause
      { type: 'pause' },

      // --- ACT 3: The twist — Structure B ---

      // 9: Flip to structure B
      { type: 'narrate',
        action: vis({
          bondConfig: 'B',
          showLabel: 'Structure B: double bond on the RIGHT', showSubLabel: 'O—O=O',
        }),
        text: "But wait. I put the double bond on the left. What if I'd put it on the right instead? Look — I can draw a completely different structure. Single bond on the left, double bond on the right. Count the electrons — still 18. Check the octets — still all satisfied. This is a perfectly valid Lewis structure too." },

      // 10: Which is right?
      { type: 'narrate',
        action: vis({ showLabel: 'Two valid structures. Which one IS ozone?' }),
        text: "So now we have a problem. Two structures, both valid, both use 18 electrons, both give every atom an octet. They're mirror images of each other. Which one is the real ozone? Is the double bond on the left or the right? This is the question that leads us to two of chemistry's most important ideas: formal charge and resonance." },

      // --- ACT 4: Formal Charge ---

      // 11: Introduce FC
      { type: 'narrate',
        action: vis({ bondConfig: 'A', showFC: false, showLabel: 'Formal Charge: a scoring system for Lewis structures', showSubLabel: 'FC = V − L − ½B' }),
        text: "First, let's develop a scoring system. It's called formal charge. The idea is simple: for each atom, ask — if we split every bond fifty-fifty, does this atom have more or fewer electrons than it started with? The formula is FC equals V minus L minus half B. V is valence electrons — how many the free atom has. L is lone pair electrons. And half-B is half the bonding electrons, because each bond is shared." },

      // 12: Calculate FCs for structure A
      { type: 'narrate',
        action: vis({ bondConfig: 'A', showFC: true, showFCCalc: true, showLabel: 'Structure A: calculating formal charges' }),
        text: "Let's score Structure A. Left oxygen: V is 6, it has 4 lone pair electrons, and 4 bonding electrons — half of that is 2. So FC equals 6 minus 4 minus 2 equals zero. Good. Center oxygen: V is 6, 2 lone pair electrons, 6 bonding electrons, half is 3. FC equals 6 minus 2 minus 3 equals plus 1. And right oxygen: V is 6, 6 lone pair electrons, 2 bonding, half is 1. FC equals 6 minus 6 minus 1 equals minus 1." },

      // 13: Quiz — FC of center atom
      { type: 'quiz',
        text: "Look at the formal charge calculation on screen for the center oxygen.",
        question: "The center O has V=6, L=2, B=6. What's its formal charge?",
        options: ["0", "+1", "−1", "+2"],
        correctIndex: 1,
        correctFeedback: "FC = 6 − 2 − 3 = +1. The center oxygen is 'charged' in this bookkeeping.",
        wrongFeedback: "FC = V − L − ½B = 6 − 2 − ½(6) = 6 − 2 − 3 = +1." },

      // 14: pause
      { type: 'pause' },

      // 15: Compare A and B
      { type: 'narrate',
        action: vis({ bondConfig: 'B', showFC: true, showFCCalc: true, showLabel: 'Structure B: same scores, just mirrored' }),
        text: "Now let's score Structure B. It's the mirror image — the minus-1 and zero swap sides, but the center is still plus-1. Both structures have the exact same formal charge pattern: one atom at zero, one at plus-1, one at minus-1. Neither structure has lower charges than the other. They're tied. Formal charge can't pick a winner." },

      // 16: Quiz — which structure wins?
      { type: 'quiz',
        text: "Both structures have the same formal charge pattern.",
        question: "Structure A has FCs: 0, +1, −1. Structure B has FCs: −1, +1, 0. Which is the better Lewis structure?",
        options: [
          "A — the double bond belongs on the left",
          "B — the double bond belongs on the right",
          "They're equally good — same FC pattern, just mirrored",
          "Neither — both have non-zero FCs so both are wrong"
        ],
        correctIndex: 2,
        correctFeedback: "Tied! Same scores, mirror image. This is exactly when resonance kicks in.",
        wrongFeedback: "Same formal charge magnitudes, just swapped. Neither is better — they're equivalent." },

      // 17: pause
      { type: 'pause' },

      // --- ACT 5: Resonance ---

      // 18: Neither! Both!
      { type: 'narrate',
        action: vis({ showFCCalc: false, showFC: false, bondConfig: 'A', showLabel: '"Which structure is right?"', showSubLabel: 'Neither. And both.' }),
        text: "So if both structures are equally valid, which one IS ozone? Here's the answer that blew chemists' minds: neither of them. And both of them. The real ozone isn't Structure A. It isn't Structure B. It's something in between — a blend of both. We call this a resonance hybrid." },

      // 19: The mule analogy
      { type: 'narrate',
        action: vis({ showLabel: 'Resonance ≠ flipping back and forth', showSubLabel: 'A mule is not a horse half the time and a donkey half the time' }),
        text: "And here's the most important thing: the molecule is NOT flipping back and forth between the two structures. It's not Structure A on Mondays and Structure B on Tuesdays. Think of a mule — it's a cross between a horse and a donkey. A mule is not a horse half the time. It's always a mule. Ozone is always the hybrid. The double-headed arrow between structures means 'blend of,' not 'alternates between.'" },

      // 20: Show the hybrid
      { type: 'narrate',
        action: vis({
          showHybrid: true, showDelocalized: true, bondConfig: 'hybrid',
          showBonds: true, showFC: false,
          showLabel: 'The Resonance Hybrid — the REAL ozone', showSubLabel: 'Both bonds are 1.5 order. Electrons are delocalized.',
        }),
        text: "Watch. The double bond dissolves. The single bond strengthens. What's left is something no single Lewis structure can show — two identical bonds, each one-and-a-half order. The extra electrons aren't locked to one side. They're delocalized — smeared across the whole molecule like a purple cloud. This is the real ozone. Equal bonds. Shared electrons. One molecule, not two." },

      // 21: Quiz — how many double bonds?
      { type: 'quiz',
        text: "Look at the hybrid on screen — the purple cloud, the dashed bonds labeled 1.5.",
        question: "In real ozone, how many of the bonds are double bonds?",
        options: [
          "1 — the double bond is on one side",
          "2 — both are full double bonds",
          "0 — there are no pure double bonds. Both bonds are identical at 1.5 order.",
          "It switches between 1 and 2"
        ],
        correctIndex: 2,
        correctFeedback: "Zero pure double bonds. Both bonds are 1.5 — halfway between single and double. That's the hybrid.",
        wrongFeedback: "The hybrid has no pure double or single bonds. Both are 1.5 order — identical." },

      // 22: pause
      { type: 'pause' },

      // --- ACT 6: Proof and consequences ---

      // 23: Bond length proof
      { type: 'narrate',
        action: vis({
          showBondLength: true,
          showLabel: 'You can MEASURE this', showSubLabel: 'X-ray crystallography confirms equal bond lengths',
        }),
        text: "This isn't just a theory — you can literally measure it. A normal oxygen single bond is 1.48 angstroms long. A double bond is 1.21. If ozone had one of each, you'd see two different lengths. But X-ray crystallography shows both bonds in ozone are 1.28 angstroms — right between single and double. Identical. The resonance hybrid is real. It's measurable." },

      // 24: Quiz — predict bond length
      { type: 'quiz',
        text: "Look at the three bars on screen: single, ozone, and double bond lengths.",
        question: "Ozone's bond length (1.28 Å) falls between single (1.48) and double (1.21). What does this prove?",
        options: [
          "Ozone is broken — the measurement must be wrong",
          "Both bonds are identical and intermediate — exactly what the resonance hybrid predicts",
          "Ozone has regular single bonds that are just shorter than normal",
          "Bond length doesn't relate to bond order"
        ],
        correctIndex: 1,
        correctFeedback: "The measurement matches the hybrid perfectly: 1.5-order bonds give 1.28 Å — between single and double. Resonance is real and measurable.",
        wrongFeedback: "1.28 Å is between single (1.48) and double (1.21) — matching the 1.5 bond order the hybrid predicts." },

      // 25: pause
      { type: 'pause' },

      // 26: Delocalization → materials
      { type: 'narrate',
        action: vis({
          showBondLength: false,
          showLabel: 'Delocalized electrons → conductivity', showSubLabel: 'Molecular resonance → metallic electron sea → graphene',
        }),
        text: "Now zoom out. Those delocalized electrons in ozone? They're the molecular version of something you've already seen. In Lesson 3.2, you learned that metals have an electron sea — valence electrons shared across the entire crystal. That IS delocalization, just on a massive scale. And graphite? Hexagonal carbon sheets with delocalized electrons — like infinite benzene. That's why graphite conducts electricity. Resonance at the molecular level becomes conductivity at the material level. This is the bridge from chemistry to materials science." },

      // 27: Quiz — graphene prediction
      { type: 'quiz',
        text: "Connect resonance to materials.",
        question: "Graphene is a single sheet of carbon hexagons with delocalized π electrons. Predict its properties.",
        options: [
          "Insulator — carbon is a nonmetal",
          "Strong + conductive — delocalized electrons flow like a 2D metal",
          "Weak and brittle",
          "Same as diamond"
        ],
        correctIndex: 1,
        correctFeedback: "Resonance → delocalized electrons → conductivity + bond stabilization → strength. Graphene: strongest material known AND excellent conductor. Chemistry becomes materials science.",
        wrongFeedback: "Delocalized electrons = mobile charges = conductivity (like the metal electron sea). Resonance stabilization = strong bonds. Graphene does both." },

      // 28: pause
      { type: 'pause' },

      // 29: Forward tease
      { type: 'narrate',
        action: vis({
          showDelocalized: true, showHybrid: true, bondConfig: 'hybrid',
          showLabel: 'Next: Oxidation States', showSubLabel: 'From sharing electrons 50/50 to giving them 100% to the greedy atom',
        }),
        text: "Today we scored Lewis structures with formal charge — splitting bonds fifty-fifty. And when two structures tied, we found resonance: the real molecule is a blend with delocalized electrons. In the next lesson, we'll flip the scoring: instead of splitting bonds equally, we'll give ALL the electrons to the more electronegative atom. That's called oxidation state — and it's the key to understanding batteries, corrosion, and every redox reaction in chemistry. See you there." },
    ];
  },
};
