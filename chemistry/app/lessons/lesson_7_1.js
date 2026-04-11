/**
 * Lesson 7.1 — Dissolving: Why Salt Disappears in Water
 *
 * ANIMATION-FIRST / STORYTELLING / ONE ANCHOR MOLECULE (NaCl)
 * Pure narration — no quizzes. Cinematic dissolution animation.
 */

import { TextBlock, SimBlock } from '../blocks/Block.js';
import '../sims/dissolvingViz.js';

export const lesson_7_1 = {
  id: '7.1',
  lessonId: 'lesson_7_1',
  title: 'Dissolving — Why Salt Disappears in Water',

  sections: [
    {
      id: 'sec-71-main',
      blocks: [
        new TextBlock({ id: '71-title', tag: 'h2', html: 'Dissolving — Why Salt Disappears in Water' }),
        new SimBlock({ id: '71-viz', sim: 'dissolvingViz', width: 900, height: 420, simOptions: {} }),
      ]
    },
  ],

  // 16 entries — must match buildSteps length exactly
  stepMeta: [
    { icon: '🔄', label: 'Recall',           kind: 'narrate' },  // 0
    { icon: '🧂', label: 'The crystal',      kind: 'narrate' },  // 1
    null,                                                          // 2
    { icon: '💧', label: 'Water molecule',    kind: 'narrate' },  // 3
    { icon: '🌊', label: 'Water approaches',  kind: 'narrate' },  // 4
    null,                                                          // 5
    { icon: '⚔️', label: 'Tug of war',       kind: 'narrate' },  // 6
    { icon: '💜', label: 'Na⁺ breaks free',  kind: 'narrate' },  // 7
    null,                                                          // 8
    { icon: '💚', label: 'Cl⁻ breaks free',  kind: 'narrate' },  // 9
    { icon: '💥', label: 'Crystal dissolves', kind: 'narrate' },  // 10
    null,                                                          // 11
    { icon: '⚡', label: 'Energy balance',    kind: 'narrate' },  // 12
    { icon: '🔑', label: 'Like dissolves like', kind: 'narrate' }, // 13
    null,                                                          // 14
    { icon: '⏭️', label: 'Next up',          kind: 'narrate' },  // 15
  ],

  buildSteps(showSection, runner) {
    const viz = runner.blockInstances.find(b => b.id === '71-viz');
    const v = (state) => () => viz?.renderer?.setVisualState(state);

    return [
      // 0: Recall — crystal appears
      { type: 'show',
        action: () => {
          showSection('sec-71-main');
          viz?.renderer?.setVisualState({
            phase: 'crystal',
            showLabel: 'NaCl Crystal Lattice',
            showSubLabel: 'Alternating Na⁺ and Cl⁻ ions, held by electrostatic attraction',
          });
        },
        text: "In lesson 4.1, you watched sodium hand its electron to chlorine — creating an ionic bond. And in lesson 4.2, you learned that water is polar — oxygen hogs the shared electrons, making one end negative and the other positive. Today, these two ideas collide. Literally. What happens when you drop an ionic crystal into polar water?" },

      // 1: Describe the crystal
      { type: 'narrate',
        text: "Here's a crystal of table salt — sodium chloride. Look at this structure. Alternating ions: sodium positive — the small purple ones — and chloride negative — the larger green ones. They're locked in place by electrostatic attraction. Every positive ion surrounded by negative neighbors, every negative surrounded by positive neighbors. This is the ionic lattice from lesson 4.1. It's hard, it's organized, it's stable. It does not want to come apart." },

      // 2: pause
      { type: 'pause' },

      // 3: Water intro
      { type: 'narrate',
        action: v({ phase: 'water-intro', showLabel: 'Water — a polar molecule', showSubLabel: 'The tiny magnet that breaks crystals' }),
        text: "But then water arrives. And water is not just any molecule — it's special. Look at this water molecule on the right. It's bent — oxygen in the center, two hydrogens on the sides, at 104.5 degrees. Oxygen has an electronegativity of 3.44. Hydrogen is just 2.20. So oxygen pulls the shared electrons closer. That makes the oxygen end slightly negative — delta minus — shown in blue. And each hydrogen end is slightly positive — delta plus — shown in red. Every water molecule is a tiny magnet." },

      // 4: Water approach
      { type: 'narrate',
        action: v({ phase: 'water-approach', showLabel: 'Water molecules surround the crystal', showSubLabel: 'Each one orienting its charges toward the nearest ion' }),
        text: "Now watch what happens when these tiny magnets meet the crystal. Water molecules surround the salt crystal from all sides. And they're not random about it — look carefully at how they're orienting. The negative oxygen ends are turning to face the positive sodium ions. The positive hydrogen ends are turning to face the negative chloride ions. Each water molecule instinctively points its opposite charge toward the nearest ion. Like knows like." },

      // 5: pause
      { type: 'pause' },

      // 6: Tug of war
      { type: 'narrate',
        action: v({ phase: 'orient', showLabel: 'The tug of war', showSubLabel: 'Crystal lattice vs. water\'s pull' }),
        text: "Now the tug of war begins. The water molecules at the surface are pulling on those ions. Oxygen's delta-minus tugs on sodium-plus. Hydrogen's delta-plus tugs on chloride-minus. And there are a LOT of water molecules — they're ganging up. The crystal lattice is pulling each ion inward. But the water molecules are pulling it outward. It's a competition between lattice energy — the strength of the crystal — and hydration energy — the pull of water." },

      // 7: Na+ breaks free
      { type: 'narrate',
        action: v({ phase: 'pry-na', showLabel: 'Na⁺ breaks free!', showSubLabel: 'Oxygen ends surround it — hydration shell forms' }),
        text: "Watch the upper-left corner — the water wins! A sodium ion gets pulled out of the lattice. See it separate? And immediately, water molecules rush in and surround it, forming a cage called a hydration shell. The oxygen ends point inward toward the positive sodium — delta minus attracted to plus. Six water molecules, perfectly arranged. The sodium ion is now dissolved. It's in solution. Free from the crystal, escorted by water." },

      // 8: pause
      { type: 'pause' },

      // 9: Cl- breaks free
      { type: 'narrate',
        action: v({ phase: 'pry-cl', showLabel: 'Cl⁻ follows!', showSubLabel: 'Hydrogen ends face inward — opposite orientation' }),
        text: "The same thing happens to chloride, but mirrored. Watch the green ion break free. When chloride-minus separates from the crystal, the hydrogen ends of water point inward — delta-plus toward the negative ion. Another hydration shell forms. The chloride is now dissolved too. Each ion gets its own personal water escort. Notice the orientation: for sodium, the oxygens face in. For chloride, the hydrogens face in. Opposite charges attract. Always." },

      // 10: Full dissolve
      { type: 'narrate',
        action: v({ phase: 'dissolve', showLabel: 'The crystal crumbles', showSubLabel: 'Every ion gets a hydration shell' }),
        text: "And now it cascades. One ion leaving weakens the crystal. That makes it easier for the next one. And the next. Watch — the entire crystal crumbles from the outside in. Billions of ions, each surrounded by their own hydration shell, floating freely through the water. This is dissolving. The salt hasn't disappeared — every single atom is still there. They're just no longer locked in a lattice. They're individually surrounded by water, free to roam." },

      // 11: pause
      { type: 'pause' },

      // 12: Energy
      { type: 'narrate',
        action: v({ phase: 'energy', showLabel: '', showSubLabel: '' }),
        text: "But here's the deeper question: why does this happen energetically? Breaking apart a crystal costs energy — that's the lattice energy, and for sodium chloride it's 786 kilojoules per mole. That's a LOT. So where does the energy come from? From the hydration shells. When water molecules grab onto ions, they release energy — 783 kilojoules per mole for NaCl. Look at the two bars — they're almost identical. The cost of breaking the crystal is almost exactly paid for by forming hydration shells. That's why NaCl dissolves — barely. It's a near-tie, slightly endothermic. For calcium carbonate — limestone — the lattice energy wins by a lot. That's why rocks don't dissolve in your water glass." },

      // 13: Like dissolves like
      { type: 'narrate',
        action: v({ phase: 'like-dissolves-like', showLabel: '', showSubLabel: '' }),
        text: "This gives us the golden rule of dissolving: like dissolves like. On the left — polar water dissolves ionic NaCl, because polar water molecules can grab onto charged ions. The charges match up — it works. On the right — polar water and nonpolar oil. Oil molecules have no charges, no delta-plus, no delta-minus. There's nothing for water to grab onto. Water molecules just ignore the oil and stick to each other instead. That's why oil floats on top, forming a separate layer. Like dissolves like. Polar dissolves polar. Nonpolar dissolves nonpolar. Mismatch? No dissolving." },

      // 14: pause
      { type: 'pause' },

      // 15: Forward
      { type: 'narrate',
        action: v({ phase: 'forward', showLabel: 'Solutions → Materials Science', showSubLabel: 'Corrosion, crystal growth, electroplating — all happen in solution' }),
        text: "Today you watched an ionic crystal surrender to polar water — one ion at a time. Hydration shells, energy balances, like dissolves like. These aren't just chemistry facts — they're the foundation of everything in materials science. Corrosion? That's metal dissolving. Crystal growth? That's the reverse of dissolving — ions coming OUT of solution. Electroplating? Ions leaving solution and depositing onto a surface. Every material process happens in solution. Next up: concentration — how much stuff is dissolved, and how that controls every reaction. See you in lesson 7.2." },
    ];
  },
};
