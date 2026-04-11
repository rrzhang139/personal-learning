/**
 * Lesson 7.2 — Concentration: How Crowded Is Your Solution?
 *
 * INTERACTIVE + PHYSICS-BASED / STORYTELLING / ONE ANCHOR SYSTEM (NaCl in water)
 * Checkpoints pause narration until user interacts (drag salt, adjust sliders).
 * No quiz modals — learning happens through doing.
 */

import { TextBlock, SimBlock, SliderBlock } from '../blocks/Block.js';
import '../sims/concentrationViz.js';

export const lesson_7_2 = {
  id: '7.2',
  lessonId: 'lesson_7_2',
  title: 'Concentration — How Crowded Is Your Solution?',

  sections: [
    {
      id: 'sec-72-main',
      blocks: [
        new TextBlock({ id: '72-title', tag: 'h2', html: 'Concentration — How Crowded Is Your Solution?' }),
        new SimBlock({ id: '72-viz', sim: 'concentrationViz', width: 900, height: 500, simOptions: {} }),
      ]
    },
    {
      id: 'sec-72-sliders',
      blocks: [
        new SliderBlock({ id: '72-water', label: 'Water Volume (mL):', min: 200, max: 1200, value: 500, color: '#00e5ff', gradient: 'linear-gradient(to right, #0d47a1, #4fc3f7)' }),
        new SliderBlock({ id: '72-temp', label: 'Temperature (K):', min: 273, max: 373, value: 298, gradient: 'linear-gradient(to right, #4fc3f7, #ef5350)' }),
      ]
    },
  ],

  // 20 entries — must match buildSteps length exactly
  stepMeta: [
    { icon: '🔄', label: 'Recall',              kind: 'narrate' },     // 0
    { icon: '🧪', label: 'What is concentration', kind: 'narrate' },   // 1
    null,                                                                 // 2
    { icon: '🧂', label: 'Add salt!',            kind: 'checkpoint' },  // 3
    { icon: '📊', label: 'Reading the numbers',  kind: 'narrate' },     // 4
    null,                                                                 // 5
    { icon: '📐', label: 'Molarity',             kind: 'narrate' },     // 6
    { icon: '🔢', label: 'Your numbers',         kind: 'narrate' },     // 7
    null,                                                                 // 8
    { icon: '💧', label: 'Dilute it!',           kind: 'checkpoint' },  // 9
    { icon: '🌊', label: 'Dilution explained',   kind: 'narrate' },     // 10
    null,                                                                 // 11
    { icon: '🧱', label: 'Saturate it!',         kind: 'checkpoint' },  // 12
    { icon: '⚖️', label: 'Saturation',          kind: 'narrate' },     // 13
    null,                                                                 // 14
    { icon: '🔥', label: 'Heat it up!',          kind: 'checkpoint' },  // 15
    { icon: '🌡️', label: 'Temp & solubility',   kind: 'narrate' },     // 16
    null,                                                                 // 17
    { icon: '💎', label: 'Supersaturation',       kind: 'narrate' },     // 18
    { icon: '⏭️', label: 'Next up',              kind: 'narrate' },     // 19
  ],

  buildSteps(showSection, runner) {
    const viz = runner.blockInstances.find(b => b.id === '72-viz');
    const waterSlider = runner.blockInstances.find(b => b.id === '72-water');
    const tempSlider = runner.blockInstances.find(b => b.id === '72-temp');

    // Wire sliders → sim
    if (waterSlider) {
      waterSlider.onChange = (v) => viz?.renderer?.setWaterVolume(v);
    }
    if (tempSlider) {
      tempSlider.onChange = (v) => viz?.renderer?.setTemperature(v);
    }

    const v = (state) => () => viz?.renderer?.setVisualState(state);

    return [
      // 0: Recall
      { type: 'show',
        action: () => {
          showSection('sec-72-main');
          viz?.renderer?.setVisualState({
            phase: 'intro',
            showLabel: 'A beaker of pure water',
            showSubLabel: '500 mL — ready for some salt',
            enableShaker: false,
          });
        },
        text: "Last lesson, you dissolved a salt crystal in water. You watched ions break free, form hydration shells, and float away. Beautiful. But here's a question we never asked: how MUCH salt is dissolved? A pinch? A spoonful? A whole bag? That question — how crowded is the solution — is what concentration is all about. And it turns out to be one of the most important numbers in all of chemistry." },

      // 1: What is concentration
      { type: 'narrate',
        action: v({ showLabel: 'Concentration = how crowded', showSubLabel: 'More ions per volume = higher concentration' }),
        text: "Look at this beaker of water. Right now the concentration is zero — pure water, no solute. But watch the panel on the right. It shows C equals zero molar. That number is going to change. Concentration is simply how much stuff is dissolved per unit of volume. More ions packed into the same space? Higher concentration. Same ions in more water? Lower concentration. It's a density of dissolved particles." },

      // 2: pause
      { type: 'pause' },

      // 3: CHECKPOINT — Add salt
      { type: 'checkpoint',
        action: v({ enableShaker: true, showLabel: 'Drag the salt shaker into the beaker!', showSubLabel: 'Add at least 5 scoops' }),
        instruction: 'Drag the salt shaker over the beaker to add NaCl! Add at least 5 scoops.',
        text: "Now it's your turn. See that salt shaker in the corner? Grab it and drag it over the beaker. Hold it there and watch salt pour in. Each scoop adds sodium and chloride ions. Watch them dissolve — the physics is real. They repel same charges, attract opposite charges, bounce off walls, and jitter with thermal energy. Add at least 5 scoops.",
        check: () => viz?.renderer?.saltAdded >= 5,
        checkInterval: 300,
        confirmText: "Look at that! The beaker is alive with ions. See them bouncing around? That's Brownian motion — random thermal kicks from water molecules. And notice how same-charge ions repel each other while opposites attract. Real physics, real forces. Now look at the concentration readout on the right." },

      // 4: Reading the numbers
      { type: 'narrate',
        action: v({ showLabel: 'Concentration readout', showSubLabel: 'Moles dissolved ÷ liters of water' }),
        text: "The panel shows your concentration in molar — abbreviated capital M. One molar means one mole of solute dissolved in one liter of solution. A mole is 6 times 10 to the 23rd particles — Avogadro's number. Each scoop you added is about 0.1 moles. In 500 milliliters of water, that's half a liter. So 5 scoops is 0.5 moles in 0.5 liters — that's 1.0 molar. The math is dead simple." },

      // 5: pause
      { type: 'pause' },

      // 6: Molarity
      { type: 'narrate',
        action: v({ showLabel: 'Molarity: M = n / V', showSubLabel: 'n = moles of solute, V = volume in liters' }),
        text: "The formula is M equals n over V. M is molarity — moles per liter. n is the number of moles of solute you dissolved. V is the volume of the solution in liters. That's it. One formula. If you know any two of these three numbers, you can find the third. This single equation shows up in almost every chemistry calculation you'll ever do." },

      // 7: Your numbers
      { type: 'narrate',
        text: "Look at the readout. It's calculating in real time. Every scoop you added increased n. The volume V stayed at 500 mL — half a liter. As n went up, M went up. The ions got more crowded. You can literally SEE the concentration — more particles bouncing around in the same space. Concentration isn't abstract. It's visible." },

      // 8: pause
      { type: 'pause' },

      // 9: CHECKPOINT — Dilute it
      { type: 'checkpoint',
        action: () => {
          showSection('sec-72-sliders');
          viz?.renderer?.setVisualState({ showLabel: 'Now dilute! Slide water volume to 1000+ mL', showSubLabel: 'Same amount of salt, more water → lower concentration' });
        },
        instruction: 'Drag the Water Volume slider to 1000 mL or more.',
        text: "Now let's do the opposite. You've got ions in there — don't add more salt. Instead, add more WATER. Drag the water volume slider up to 1000 milliliters. Watch what happens to the concentration. The ions are the same. The amount dissolved didn't change. But the space they're in just doubled.",
        check: () => {
          const val = waterSlider?.input?.value;
          return val && parseInt(val) >= 1000;
        },
        checkInterval: 300,
        confirmText: "See it? The concentration dropped. Same moles, double the volume, half the molarity. The ions spread out — they have more room to roam. This is dilution. And the formula is beautiful: M1 times V1 equals M2 times V2. Whatever you start with, the moles stay constant." },

      // 10: Dilution explained
      { type: 'narrate',
        action: v({ showLabel: 'Dilution: M₁V₁ = M₂V₂', showSubLabel: 'Moles in = moles out. Always.' }),
        text: "Dilution is the most common operation in any chemistry lab. Need a weaker solution? Add water. The equation M1-V1 equals M2-V2 just says that the total moles before and after are the same. You didn't create or destroy any salt — you just gave it more room. This is how every medication dose is prepared, how every chemical solution is mixed, how every paint color is lightened. Dilution is everywhere." },

      // 11: pause
      { type: 'pause' },

      // 12: CHECKPOINT — Saturate it
      { type: 'checkpoint',
        action: () => {
          // Reset water volume to 500 for cleaner saturation demo
          if (waterSlider?.input) { waterSlider.input.value = 500; waterSlider.valueEl.textContent = 500; }
          viz?.renderer?.setWaterVolume(500);
          viz?.renderer?.setVisualState({ showLabel: 'Keep adding salt until it won\'t dissolve!', showSubLabel: 'Watch for the SATURATED warning' });
        },
        instruction: 'Keep dragging the salt shaker! Add salt until the solution saturates.',
        text: "Now let's push the limits. I've set the water back to 500 mL. Keep adding salt. Pour and pour. At some point, something changes. The ions stop dissolving. They sink to the bottom and form a little crystal. That's saturation — the solution is full. It physically cannot hold any more dissolved salt at this temperature. Watch the saturation bar fill up.",
        check: () => viz?.renderer?.isSaturated === true,
        checkInterval: 300,
        confirmText: "There it is — SATURATED. See the crystal forming at the bottom? Those are ions that tried to dissolve but couldn't. The solution is at capacity. For NaCl at 25 degrees Celsius, that's about 6.1 molar. No matter how much more salt you add, the concentration won't go higher." },

      // 13: Saturation
      { type: 'narrate',
        action: v({ showLabel: 'Dynamic equilibrium at saturation', showSubLabel: 'Dissolving rate = crystallizing rate' }),
        text: "But here's what's subtle: at saturation, dissolving hasn't stopped. Ions are still leaving the crystal surface — but at the exact same rate, other ions from solution are re-joining the crystal. It's a dynamic equilibrium. Dissolving and crystallizing happening simultaneously, perfectly balanced. The concentration stays constant not because nothing is happening, but because two opposite processes cancel out." },

      // 14: pause
      { type: 'pause' },

      // 15: CHECKPOINT — Heat it up
      { type: 'checkpoint',
        action: v({ showLabel: 'Raise the temperature past 350 K!', showSubLabel: 'Higher temperature → higher solubility → more dissolves' }),
        instruction: 'Drag the Temperature slider to 350 K or above.',
        text: "Now here's a trick. Most ionic solids dissolve MORE at higher temperatures. The ions vibrate harder, the water molecules move faster, and the saturation limit goes up. Drag the temperature slider up past 350 Kelvin. Watch what happens to the crystal at the bottom.",
        check: () => {
          const val = tempSlider?.input?.value;
          return val && parseInt(val) >= 350;
        },
        checkInterval: 300,
        confirmText: "The crystal shrank! Some of those ions that couldn't dissolve before just dissolved. The saturation limit went up with temperature. At 350 K, NaCl can dissolve to about 6.5 molar instead of 6.1. The solution can hold more, so it does. Temperature is a dial for solubility." },

      // 16: Temperature and solubility
      { type: 'narrate',
        action: v({ showLabel: 'Temperature controls solubility', showSubLabel: 'Most ionic solids: hotter → more soluble' }),
        text: "For most ionic solids — salt, sugar, potassium nitrate — solubility increases with temperature. The particles have more kinetic energy, which helps break lattice bonds. But not everything follows this rule. Some compounds, like calcium sulfate, actually become LESS soluble at higher temperatures. And gases are the opposite — carbon dioxide is more soluble in cold water than hot. That's why warm soda goes flat faster." },

      // 17: pause
      { type: 'pause' },

      // 18: Supersaturation
      { type: 'narrate',
        action: () => {
          viz?.renderer?.setVisualState({
            phase: 'supersaturated',
            showLabel: 'Supersaturation → Crystal Growth',
            showSubLabel: 'The foundation of semiconductor manufacturing',
            supersaturate: true,
          });
        },
        text: "And now the most beautiful idea in all of solution chemistry: supersaturation. You just dissolved extra salt at high temperature. Now imagine cooling it rapidly. The saturation limit drops, but the extra ions are already dissolved — they're stuck in solution, past the limit. The solution is supersaturated. It's unstable, like a ball balanced on a hilltop. One tiny push — a dust particle, a scratch, a seed crystal — and everything crashes. Ions cascade out of solution, snapping into crystal positions. A crystal grows right before your eyes. This is exactly how semiconductor crystals are grown. How gemstones form. How pharmaceuticals are purified. Controlled supersaturation is one of the most important techniques in materials science." },

      // 19: Next up
      { type: 'narrate',
        action: v({ showLabel: 'Solutions → Reactions', showSubLabel: 'Concentration controls how fast reactions happen' }),
        text: "Today you learned to measure solutions with molarity, dilute them with M1V1 equals M2V2, saturate them to their limit, and even supersaturate them to grow crystals. Concentration isn't just a number — it's a control knob. Higher concentration means more collisions per second between reactants, which means faster reactions. That's why concentrated acid is dangerous but dilute acid is manageable. Next lesson: acids, bases, and pH — where concentration becomes power. See you in 7.3." },
    ];
  },
};

