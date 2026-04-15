/**
 * Lesson 1.2 — Real Gases & van der Waals
 *
 * Atkins Ch 1, Sections 1.3–1.4.
 * LJ particles sim + equations drawn on canvas.
 * Interactive: toggle attraction, compress, observe Z.
 */

import { TextBlock, SimBlock, SliderBlock } from '../blocks/Block.js';
import '../sims/realGasViz.js';

export const lesson_1_2 = {
  id: '1.2',
  lessonId: 'lesson_1_2',
  title: 'Real Gases & van der Waals',

  sections: [
    {
      id: 'sec-12-main',
      blocks: [
        new TextBlock({ id: '12-title', tag: 'h2', html: 'Real Gases & the van der Waals Equation' }),
        new SimBlock({ id: '12-viz', sim: 'realGasViz', width: 900, height: 500, simOptions: {} }),
      ]
    },
    {
      id: 'sec-12-sliders',
      blocks: [
        new SliderBlock({ id: '12-vol', label: 'Volume:', min: 25, max: 100, value: 100, color: '#00e5ff' }),
        new SliderBlock({ id: '12-temp', label: 'Temperature (K):', min: 150, max: 800, value: 400, gradient: 'linear-gradient(to right, #4fc3f7, #ef5350)' }),
        new SliderBlock({ id: '12-lj', label: 'Attraction strength:', min: 0, max: 200, value: 100, color: '#4caf50', gradient: 'linear-gradient(to right, #333, #4caf50)' }),
        new SliderBlock({ id: '12-size', label: 'Molecule size:', min: 0, max: 200, value: 100, color: '#bb86fc', gradient: 'linear-gradient(to right, #333, #bb86fc)' }),
      ]
    },
  ],

  // 18 entries
  stepMeta: [
    { icon: '🔄', label: 'Recall: ideal',       kind: 'narrate' },  // 0
    { icon: '💔', label: 'The ideal breaks',     kind: 'narrate' },  // 1
    null,                                                              // 2
    { icon: '🧲', label: 'Turn on attraction!',  kind: 'checkpoint' }, // 3
    { icon: '📉', label: 'Z < 1',               kind: 'narrate' },  // 4
    null,                                                              // 5
    { icon: '📦', label: 'Crank up size!',       kind: 'checkpoint' }, // 6
    { icon: '📈', label: 'Z > 1',               kind: 'narrate' },  // 7
    null,                                                              // 8
    { icon: '📐', label: 'The LJ potential',     kind: 'narrate' },  // 9
    { icon: '🔑', label: 'van der Waals eqn',   kind: 'narrate' },  // 10
    null,                                                              // 11
    { icon: '⚗️', label: 'Compress it!',        kind: 'checkpoint' }, // 12
    { icon: '💎', label: 'Critical point',       kind: 'narrate' },  // 13
    null,                                                              // 14
    { icon: '📐', label: 'Critical constants',   kind: 'narrate' },  // 15
    { icon: '🌡️', label: 'Corresponding states', kind: 'narrate' }, // 16
    { icon: '⏭️', label: 'Next up',             kind: 'narrate' },  // 17
  ],

  buildSteps(showSection, runner) {
    const viz = runner.blockInstances.find(b => b.id === '12-viz');
    const volSlider = runner.blockInstances.find(b => b.id === '12-vol');
    const tempSlider = runner.blockInstances.find(b => b.id === '12-temp');
    const ljSlider = runner.blockInstances.find(b => b.id === '12-lj');
    const sizeSlider = runner.blockInstances.find(b => b.id === '12-size');

    if (volSlider) volSlider.onChange = (v) => viz?.renderer?.setVolume(v / 100);
    if (tempSlider) tempSlider.onChange = (v) => viz?.renderer?.setTemperature(v);
    if (ljSlider) ljSlider.onChange = (v) => viz?.renderer?.setLJStrength(v / 100);
    if (sizeSlider) sizeSlider.onChange = (v) => viz?.renderer?.setParticleSize(v / 100);

    const v = (state) => () => viz?.renderer?.setVisualState(state);

    return [
      // 0: Recall
      { type: 'show',
        action: () => {
          showSection('sec-12-main');
          viz?.renderer?.setLJStrength(0);
          viz?.renderer?.setParticleSize(0.3);
          viz?.renderer?.setVisualState({
            showLabel: 'The "perfect" gas — no interactions, point particles',
            showSubLabel: 'pV = nRT works great... until it doesn\'t',
            showZ: true, eqStep: 0,
          });
        },
        text: "Last lesson you mastered the perfect gas. Particles that don't interact, that have no size, bouncing in a box. pV equals nRT. Beautiful and simple. But look at the compression factor Z on the right panel — it's sitting at 1.0. That means the gas is behaving perfectly. Now, real molecules are not infinitely small points. And they DO attract each other. What happens when we turn on reality?" },

      // 1: The ideal breaks
      { type: 'narrate',
        action: v({ showLabel: 'Real molecules attract AND have size', showSubLabel: 'Two corrections to the perfect gas' }),
        text: "Real gases deviate from pV equals nRT for two reasons. First, molecules attract each other — van der Waals forces, the same intermolecular forces you learned about. These attractions reduce the pressure because molecules heading toward a wall get pulled back by their neighbors. Second, molecules have actual volume — they're not points. This means the available space is less than the container volume. The gas can't be compressed to zero. Let's see both effects." },

      // 2: pause
      { type: 'pause' },

      // 3: CHECKPOINT — Turn on attraction
      { type: 'checkpoint',
        action: () => {
          showSection('sec-12-sliders');
          viz?.renderer?.setVisualState({
            showLabel: 'Crank the Attraction slider to 150+',
            showSubLabel: 'Watch the particles start pulling on each other',
            showLJ: true, showZ: true, eqStep: 1,
          });
        },
        instruction: 'Drag Attraction strength to 150 or above.',
        text: "See the four sliders below? The third one controls how strongly the molecules attract each other. Drag it up past 150. Watch the particles. They'll start clustering — forming temporary groups as they pull on each other. And watch the compression factor Z. It's going to drop below 1.",
        check: () => {
          const val = ljSlider?.input?.value;
          return val && parseInt(val) >= 150;
        },
        checkInterval: 300,
        confirmText: "See the green halos? That's the range of attraction — each molecule pulls on its neighbors. And Z dropped below 1. That means the real gas is MORE compressible than the ideal gas predicts. Why? Because attractions pull molecules together, effectively reducing the pressure. The gas occupies less volume than pV equals nRT would predict. Z less than 1 means attractions are winning." },

      // 4: Z < 1
      { type: 'narrate',
        action: v({ showLabel: 'Z < 1: Attractions dominate', showSubLabel: 'Real gas is more compressible than ideal', eqStep: 1 }),
        text: "Look at the equation panel. Z equals pV-m over RT. When Z is less than 1, the measured molar volume is smaller than the ideal prediction. The gas is being squeezed tighter than expected because molecules are pulling each other inward. At moderate pressures — a few atmospheres — this is what most gases do. The attractions between molecules reduce the pressure below the ideal value. This is the regime where intermolecular forces matter most." },

      // 5: pause
      { type: 'pause' },

      // 6: CHECKPOINT — Crank up size
      { type: 'checkpoint',
        action: () => {
          viz?.renderer?.setLJStrength(0);
          if (ljSlider?.input) { ljSlider.input.value = 0; ljSlider.valueEl.textContent = 0; }
          viz?.renderer?.setVisualState({
            showLabel: 'Now: set Attraction to 0, crank Size to 200',
            showSubLabel: 'Molecules get big — watch Z go above 1',
            showLJ: false, showZ: true, eqStep: 1,
          });
        },
        instruction: 'Set Attraction to 0, then drag Molecule size to 200.',
        text: "Reset attraction to zero. Now drag the molecule SIZE slider all the way to 200. Make the particles huge. You're simulating what happens at very high pressures where molecules are so close together that their physical size matters. Each particle takes up space that other particles can't enter.",
        check: () => {
          const val = sizeSlider?.input?.value;
          return val && parseInt(val) >= 180;
        },
        checkInterval: 300,
        confirmText: "Now Z is ABOVE 1. The gas is LESS compressible than ideal. The molecules are physically bumping into each other — there's excluded volume that the gas can't be squeezed into. At high pressures, repulsive forces dominate. The actual volume is larger than pV equals nRT predicts because the molecules themselves take up space. Z greater than 1 means size is winning." },

      // 7: Z > 1
      { type: 'narrate',
        action: v({ showLabel: 'Z > 1: Repulsions dominate', showSubLabel: 'Molecules have size — can\'t be compressed infinitely', eqStep: 1 }),
        text: "So the full picture: at LOW pressure, Z approaches 1 — the gas is nearly ideal. At MODERATE pressure, attractions win and Z dips below 1. At HIGH pressure, molecular size wins and Z rises above 1. This U-shaped behavior — dip then rise — is exactly what experiments show for real gases. Every gas does this. The question is: can we write one equation that captures both effects?" },

      // 8: pause
      { type: 'pause' },

      // 9: LJ potential
      { type: 'narrate',
        action: () => {
          viz?.renderer?.setLJStrength(1);
          viz?.renderer?.setParticleSize(1);
          if (ljSlider?.input) { ljSlider.input.value = 100; ljSlider.valueEl.textContent = 100; }
          if (sizeSlider?.input) { sizeSlider.input.value = 100; sizeSlider.valueEl.textContent = 100; }
          viz?.renderer?.setVisualState({
            showLabel: 'The Lennard-Jones Potential', showSubLabel: 'Repulsive at short range, attractive at long range',
            showLJ: true, showZ: true, eqStep: 1,
          });
        },
        text: "Look at the potential curve in the bottom-left. This is the Lennard-Jones potential — the actual energy between two molecules as a function of their separation. At large distances, the energy is zero — they don't feel each other. As they approach, the energy drops negative — they attract. But at very short distances the energy shoots up sharply — they repel. That deep well is the attraction. The steep wall is the repulsion. Every pair of molecules in this simulation is feeling this potential right now. The balance between these two regions — attraction and repulsion — is what makes real gases real." },

      // 10: Van der Waals equation
      { type: 'narrate',
        action: v({ showLabel: 'The van der Waals Equation (1873)', showSubLabel: 'Two corrections: attraction (a) and size (b)', showLJ: true, showZ: true, eqStep: 2 }),
        text: "In 1873, van der Waals wrote down an equation that captures both effects with just two parameters. Look at the equation panel. p equals nRT over V minus nb, minus a times n-over-V squared. The first correction: V minus nb. Instead of the full volume V, the available volume is V minus the volume taken up by the molecules themselves — n times b, where b is the volume per mole of molecules. The second correction: minus a times n-over-V squared. The pressure is reduced by the attractions between molecules. The parameter a measures how strongly they attract. Bigger a, more attraction, lower pressure." },

      // 11: pause
      { type: 'pause' },

      // 12: CHECKPOINT — Compress with both on
      { type: 'checkpoint',
        action: v({
          showLabel: 'Both effects on. Compress to 30%!',
          showSubLabel: 'Watch what happens as molecules get crowded',
          showLJ: true, showZ: true, showIsotherm: true, eqStep: 2,
        }),
        instruction: 'Drag Volume down to 30 or below. Both attraction and size are active.',
        text: "Now both effects are on — realistic attraction and realistic molecular size. Compress the gas hard. Drag volume down to 30 percent. Watch the particles. At first, attractions dominate and they cluster. But as you keep squeezing, the hard cores start pushing back. The competition between a and b plays out right in front of you.",
        check: () => {
          const val = volSlider?.input?.value;
          return val && parseInt(val) <= 35;
        },
        checkInterval: 300,
        confirmText: "At low compression, attractions pulled them together — Z was below 1. But at extreme compression, the particles physically can't get closer — their size prevents it. Z shot above 1. You just traced the full real-gas curve with your hands. This transition is exactly what the van der Waals equation predicts: two competing corrections, one winning at moderate density, the other at high density." },

      // 13: Critical point
      { type: 'narrate',
        action: v({
          showLabel: 'The Critical Point', showSubLabel: 'Where gas and liquid become indistinguishable',
          showLJ: true, showZ: true, eqStep: 2,
        }),
        text: "Here's where it gets profound. If you compress a gas at low temperature, at some point the attractions win so completely that the gas condenses — it becomes a liquid. There's a sharp boundary between gas and liquid. But there's a special temperature — the critical temperature, T-c — above which this boundary vanishes. Above T-c, you can go from gas-like to liquid-like continuously, with no phase transition. The critical point is where the isotherm has a flat inflection — both the first and second derivatives of pressure with respect to volume are zero." },

      // 14: pause
      { type: 'pause' },

      // 15: Critical constants from a, b
      { type: 'narrate',
        action: v({
          showLabel: 'Critical Constants from van der Waals', showSubLabel: 'Vc = 3b,  pc = a/27b²,  Tc = 8a/27Rb',
          showLJ: true, showZ: true, eqStep: 3, showCritical: true,
        }),
        text: "The van der Waals equation predicts the critical constants in terms of a and b. Look at the equation panel — three beautiful results. V-c equals 3b: the critical volume is three times the molecular volume. p-c equals a over 27 b-squared: the critical pressure depends on both attraction strength and molecular size. T-c equals 8a over 27Rb: the critical temperature is determined by how strongly molecules attract relative to their size. These equations connect microscopic molecular properties — how big molecules are, how strongly they attract — directly to macroscopic critical behavior. That's the power of physical chemistry." },

      // 16: Corresponding states
      { type: 'narrate',
        action: v({
          showLabel: 'The Principle of Corresponding States', showSubLabel: 'All gases look the same in reduced variables',
          eqStep: 3,
        }),
        text: "One final insight. If you divide each variable by its critical value — reduced pressure p-r equals p over p-c, reduced volume V-r equals V over V-c, reduced temperature T-r equals T over T-c — something remarkable happens. The van der Waals equation becomes universal. The a and b parameters cancel out. All gases follow the same curve in reduced variables. Nitrogen, carbon dioxide, argon — different molecules, different a and b values — but in reduced variables they all collapse onto one master curve. This is the principle of corresponding states. It means that at the same fraction of their critical temperature and pressure, all gases behave the same way." },

      // 17: Next
      { type: 'narrate',
        action: v({ showLabel: 'Next: The First Law of Thermodynamics', showSubLabel: 'Work, heat, and the conservation of energy' }),
        text: "You've now seen gases from both sides: the perfect gas where pV equals nRT, and the real gas where molecules attract and repel. You know the compression factor Z measures deviation from ideality. You know the van der Waals equation corrects for both attraction parameter a and molecular size parameter b. And you know that all gases look universal in reduced variables. This is the foundation. Next: we move from describing what gases DO to understanding WHY — the First Law of Thermodynamics. Energy, work, heat, and the most important conservation law in physics. See you in Chapter 2." },
    ];
  },
};
