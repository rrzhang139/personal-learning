/**
 * Lesson 1.1 — The Perfect Gas: pV = nRT
 *
 * Atkins Ch 1, Sections 1.1–1.2.
 * Physics-based kinetic theory sim. Interactive checkpoints.
 * Feel it → See it → Formalize it.
 */

import { TextBlock, SimBlock, SliderBlock } from '../blocks/Block.js';
import '../sims/idealGasViz.js';

export const lesson_1_1 = {
  id: '1.1',
  lessonId: 'lesson_1_1',
  title: 'The Perfect Gas — pV = nRT',

  sections: [
    {
      id: 'sec-11-main',
      blocks: [
        new TextBlock({ id: '11-title', tag: 'h2', html: 'The Perfect Gas' }),
        new SimBlock({ id: '11-viz', sim: 'idealGasViz', width: 900, height: 500, simOptions: {} }),
      ]
    },
    {
      id: 'sec-11-sliders',
      blocks: [
        new SliderBlock({ id: '11-vol', label: 'Volume (box width):', min: 30, max: 100, value: 100, color: '#00e5ff', gradient: 'linear-gradient(to right, #b71c1c, #00e5ff)' }),
        new SliderBlock({ id: '11-temp', label: 'Temperature (K):', min: 100, max: 800, value: 300, gradient: 'linear-gradient(to right, #4fc3f7, #ef5350)' }),
      ]
    },
  ],

  // 18 entries
  stepMeta: [
    { icon: '🔬', label: 'What is a gas?',     kind: 'narrate' },  // 0
    { icon: '💥', label: 'Pressure = hits',     kind: 'narrate' },  // 1
    null,                                                             // 2
    { icon: '📦', label: 'Compress it!',        kind: 'checkpoint' }, // 3
    { icon: '📊', label: 'Boyle\'s law',        kind: 'narrate' },  // 4
    null,                                                             // 5
    { icon: '🔥', label: 'Heat it up!',         kind: 'checkpoint' }, // 6
    { icon: '🌡️', label: 'Temperature = speed', kind: 'narrate' },  // 7
    null,                                                             // 8
    { icon: '➕', label: 'Add particles!',      kind: 'checkpoint' }, // 9
    { icon: '⚖️', label: 'More stuff = more p', kind: 'narrate' },  // 10
    null,                                                             // 11
    { icon: '📐', label: 'The equation',        kind: 'narrate' },  // 12
    { icon: '🔑', label: 'pV = nRT',            kind: 'narrate' },  // 13
    null,                                                             // 14
    { icon: '✅', label: 'Verify it!',          kind: 'checkpoint' }, // 15
    { icon: '🧪', label: 'What "perfect" means', kind: 'narrate' }, // 16
    { icon: '⏭️', label: 'Next up',            kind: 'narrate' },  // 17
  ],

  buildSteps(showSection, runner) {
    const viz = runner.blockInstances.find(b => b.id === '11-viz');
    const volSlider = runner.blockInstances.find(b => b.id === '11-vol');
    const tempSlider = runner.blockInstances.find(b => b.id === '11-temp');

    // Wire sliders
    if (volSlider) volSlider.onChange = (v) => viz?.renderer?.setVolume(v / 100);
    if (tempSlider) tempSlider.onChange = (v) => viz?.renderer?.setTemperature(v);

    const v = (state) => () => viz?.renderer?.setVisualState(state);

    return [
      // 0: What is a gas?
      { type: 'show',
        action: () => {
          showSection('sec-11-main');
          viz?.renderer?.setVisualState({
            phase: 'intro',
            showLabel: 'A box full of particles',
            showSubLabel: '50 molecules bouncing around at 300 K',
          });
        },
        text: "Look at this box. It's full of particles — molecules — flying around in every direction. They're constantly moving, constantly colliding with the walls, constantly bouncing off each other. This is a gas. Not a diagram. Not a formula. This is what a gas actually IS at the molecular level: a swarm of particles in ceaseless, random motion. Everything we're about to learn — pressure, temperature, the gas laws — comes from watching these little dots." },

      // 1: Pressure = wall hits
      { type: 'narrate',
        action: v({ showLabel: 'Pressure = force per area', showSubLabel: 'Every wall hit transfers momentum', eqHighlight: 'p' }),
        text: "Watch the walls of the box. See how the walls glow? That glow represents pressure. Every time a particle bounces off a wall, it transfers a tiny amount of momentum. Billions of particles hitting the wall every second — that adds up to a steady, measurable force. Pressure is that force divided by the wall's area. The faster the particles, or the more of them there are, or the smaller the box, the more hits per second. More hits means higher pressure. That's it. Pressure is just particles hitting walls." },

      // 2: pause
      { type: 'pause' },

      // 3: CHECKPOINT — Compress the box
      { type: 'checkpoint',
        action: () => {
          showSection('sec-11-sliders');
          viz?.renderer?.setVisualState({ showLabel: 'Compress the gas!', showSubLabel: 'Slide Volume down to 50% or less', eqHighlight: 'V' });
        },
        instruction: 'Drag the Volume slider down to 50 or below.',
        text: "Now you try. See the volume slider? Drag it left to shrink the box. You're pushing the right wall inward — compressing the gas. Watch the pressure reading on the right as the box gets smaller. The same number of particles, crammed into less space.",
        check: () => {
          const val = volSlider?.input?.value;
          return val && parseInt(val) <= 50;
        },
        checkInterval: 300,
        confirmText: "See that? You halved the volume and the pressure roughly doubled. Same particles, same speed, but now they hit the walls twice as often because they have half the distance to travel. This is Boyle's law: at constant temperature, pressure times volume is constant. pV = constant. Robert Boyle figured this out in 1662." },

      // 4: Boyle's law
      { type: 'narrate',
        action: v({ showLabel: 'Boyle\'s Law: pV = constant (at constant T, n)', showSubLabel: 'Halve V → double p. Always.', eqHighlight: 'V' }),
        text: "Boyle's law is your first gas law. At constant temperature and constant amount of gas, if you shrink the volume, pressure goes up in exact proportion. Double the squeeze, double the pressure. Triple the squeeze, triple the pressure. And the molecular explanation is dead simple: smaller box means particles hit walls more often. That's all Boyle's law is saying." },

      // 5: pause
      { type: 'pause' },

      // 6: CHECKPOINT — Heat it up
      { type: 'checkpoint',
        action: () => {
          // Reset volume first
          if (volSlider?.input) { volSlider.input.value = 100; volSlider.valueEl.textContent = 100; }
          viz?.renderer?.setVolume(1.0);
          viz?.renderer?.setVisualState({ showLabel: 'Now heat the gas!', showSubLabel: 'Slide Temperature to 600 K or above', eqHighlight: 'T' });
        },
        instruction: 'Drag the Temperature slider to 600 K or above.',
        text: "Now let me reset the volume back to full. This time, leave the box alone — change the temperature instead. Drag the temperature slider up to 600 Kelvin. Watch what happens to the particles. Watch the speed distribution histogram in the bottom-right. Watch the pressure.",
        check: () => {
          const val = tempSlider?.input?.value;
          return val && parseInt(val) >= 600;
        },
        checkInterval: 300,
        confirmText: "The particles are moving much faster now. Look at the color shift — blue was slow, red is fast. And pressure went up. Doubling the temperature roughly doubled the pressure. That's because temperature IS average kinetic energy. Higher temperature means faster particles means harder wall hits means more pressure. This is the molecular meaning of temperature." },

      // 7: Temperature = kinetic energy
      { type: 'narrate',
        action: v({ showLabel: 'Temperature = average kinetic energy', showSubLabel: '½mv² = 3/2 kT — the bridge between micro and macro', eqHighlight: 'T' }),
        text: "Here's the deepest insight from kinetic theory: temperature is not some mysterious property. It's the average kinetic energy of the molecules. The formula is one-half m v-squared equals three-halves k-T, where k is Boltzmann's constant. When you turn up the temperature dial, you're literally telling the particles to move faster. The root mean square speed is proportional to the square root of temperature. Double T, particles go root-2 times faster. This is why hot things have more energy — their molecules are moving faster." },

      // 8: pause
      { type: 'pause' },

      // 9: CHECKPOINT — Add particles
      { type: 'checkpoint',
        action: () => {
          if (tempSlider?.input) { tempSlider.input.value = 300; tempSlider.valueEl.textContent = 300; }
          viz?.renderer?.setTemperature(300);
          viz?.renderer?.setVisualState({ showLabel: 'Click inside the box to add particles!', showSubLabel: 'Get to 100 or more particles', eqHighlight: 'n', addEnabled: true });
        },
        instruction: 'Click inside the box to add particles. Get to 100+.',
        text: "Temperature back to 300 K. Now the third knob: the amount of gas. Click inside the box to add more particles. Each click adds 5. Keep going until you've got at least 100 particles bouncing around. Watch the pressure as the box gets more crowded.",
        check: () => viz?.renderer?.nParticles >= 100,
        checkInterval: 300,
        confirmText: "More particles, more wall hits per second, higher pressure. This is Avogadro's principle at work: at constant temperature and volume, pressure is proportional to the number of particles. Twice the particles, twice the pressure. It's just more things hitting the walls." },

      // 10: More particles = more pressure
      { type: 'narrate',
        action: v({ showLabel: 'Avogadro: more gas → more pressure', showSubLabel: 'p ∝ n at constant T and V', eqHighlight: 'n', addEnabled: false }),
        text: "You now have three empirical laws. Boyle: p times V is constant when T and n are fixed. Charles: V is proportional to T when p and n are fixed. Avogadro: V is proportional to n when p and T are fixed. Three separate discoveries, three separate scientists, spanning two centuries. But they all describe the same underlying reality: particles bouncing in a box." },

      // 11: pause
      { type: 'pause' },

      // 12: The equation
      { type: 'narrate',
        action: v({ showLabel: 'Combining all three laws...', showSubLabel: 'pV ∝ nT → pV = nRT', showEquation: true, eqHighlight: '' }),
        text: "Now combine them. If pressure times volume is proportional to the number of moles times the temperature — pV proportional to nT — then there must be a single constant that ties them all together. That constant is called R — the gas constant. 8.314 joules per mole per kelvin. And the resulting equation is the single most important equation in all of physical chemistry." },

      // 13: pV = nRT
      { type: 'narrate',
        action: v({ showLabel: 'pV = nRT', showSubLabel: 'The perfect gas equation of state', showEquation: true, eqHighlight: '' }),
        text: "p V equals n R T. Four variables — pressure, volume, amount, temperature — connected by one constant. If you know any three, you can calculate the fourth. This equation tells you the pressure inside a car tire, the volume of a weather balloon at altitude, the temperature inside a star. It's the equation of state for a perfect gas. 'Perfect' meaning the particles don't attract or repel each other, and they're infinitely small. No real gas is truly perfect — but at everyday pressures, real gases come remarkably close." },

      // 14: pause
      { type: 'pause' },

      // 15: CHECKPOINT — Verify
      { type: 'checkpoint',
        action: v({ showLabel: 'Play with all three controls!', showSubLabel: 'Change V, T, or add particles — pV/nRT stays constant', showEquation: true, eqHighlight: '', addEnabled: true }),
        instruction: 'Change volume, temperature, AND add particles. Verify pV/NkT stays roughly constant.',
        text: "One last experiment. You now have all three controls: volume, temperature, and particles. Go wild. Change them in any combination. Compress and heat. Expand and add gas. Whatever you want. The whole time, watch the equation panel. pV divided by N-k-T stays approximately constant no matter what you do. That's the ideal gas law verified right before your eyes.",
        check: () => true,
        checkInterval: 5000,
        confirmText: "No matter what combination you tried, the gas followed pV equals nRT. More pressure means either less volume, more particles, or higher temperature. Always. The equation captures all three gas laws in four letters and one constant." },

      // 16: What perfect means
      { type: 'narrate',
        action: v({ showLabel: 'What makes a gas "perfect"?', showSubLabel: 'No intermolecular forces + point particles', showEquation: true, addEnabled: false }),
        text: "A perfect gas — also called an ideal gas — makes two assumptions. One: the particles don't interact with each other except during elastic collisions. No attractions, no repulsions. Two: the particles themselves have zero volume — they're mathematical points. Real molecules do attract each other — that's why gases condense into liquids. And real molecules do have size — that's why you can't compress a gas to zero volume. But at low pressures and high temperatures, when particles are far apart and moving fast, these corrections are tiny. pV equals nRT works beautifully. When it doesn't, we need a better equation — and that's van der Waals, which is next." },

      // 17: Next up
      { type: 'narrate',
        action: v({ showLabel: 'Next: Real Gases & van der Waals', showSubLabel: 'What happens when molecules attract and have size' }),
        text: "You've now seen the perfect gas from both sides: the microscopic picture — particles bouncing off walls, kinetic energy, momentum transfer — and the macroscopic equation — pV equals nRT. You verified Boyle's law, Charles's law, and Avogadro's principle with your own hands. This equation will be the backbone of everything in this course: thermodynamics, equilibrium, phase transitions, reaction kinetics. Next lesson: real gases. What happens when molecules attract each other and take up space? The van der Waals equation corrects for both. See you there." },
    ];
  },
};
