/**
 * Lesson 1.4: States of Matter
 * Declarative lesson definition using composable blocks.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock, SliderBlock } from '../blocks/Block.js';

// Import sims so they self-register
import '../sims/particleSim.js';
import '../sims/threeStatesStatic.js';
import '../sims/heatingCurve.js';

export const lesson_1_4 = {
  id: '1.4',
  lessonId: 'lesson_1_4',
  title: 'States of Matter',

  sections: [
    {
      id: 'sec-recap',
      blocks: [
        new TextBlock({ id: 'recap-title', tag: 'h2', html: 'Quick Recap' }),
        new TextBlock({ id: 'recap-text', tag: 'p', html: "Before we dive into states of matter, let's remember what we've learned:" }),
        new CalloutBlock({ id: 'recap-callout', html: '<strong>From lessons 1.1–1.3:</strong> Matter is anything with mass and volume. All matter is made of tiny particles called <strong>atoms</strong>. A substance made of just one type of atom is an <strong>element</strong>. There are 118 known elements — the building blocks of everything.' }),
        new TextBlock({ id: 'recap-question', tag: 'p', html: "Now the big question: <em>why does water sometimes flow, sometimes freeze into a block, and sometimes float away as steam?</em> It's the same atoms — so what's different?" }),
      ]
    },
    {
      id: 'sec-three-states',
      blocks: [
        new TextBlock({ id: 'three-title', tag: 'h2', html: '1.4 States of Matter' }),
        new TextBlock({ id: 'three-text', tag: 'p', html: "Matter exists in three common states. Let's see all three side by side:" }),
        new SimBlock({ id: 'three-sim', sim: 'threeStatesStatic', width: 800, height: 280 }),
        new TextBlock({ id: 'three-note', tag: 'p', html: "Notice: <strong>same particles</strong>, just different amounts of energy. That's the whole idea." }),
      ]
    },
    {
      id: 'sec-interactive',
      blocks: [
        new TextBlock({ id: 'interactive-title', tag: 'h2', html: 'Try It Yourself' }),
        new TextBlock({ id: 'interactive-text', tag: 'p', html: 'Use the temperature slider below to control the particles. Watch how their behavior changes:' }),
        new SimBlock({ id: 'interactive-sim', sim: 'particleSim', width: 500, height: 400 }),
        new SliderBlock({ id: 'temp-slider', label: 'Temperature:', min: 0, max: 100, value: 15, gradient: 'linear-gradient(to right, #4fc3f7, #81c784, #ef5350)' }),
        new TextBlock({ id: 'state-label', tag: 'p', html: '<span id="stateLabel" style="font-size:1.4em;font-weight:bold;color:#4fc3f7">SOLID</span>' }),
      ]
    },
    {
      id: 'sec-energy',
      blocks: [
        new TextBlock({ id: 'energy-title', tag: 'h3', html: 'Why Does Temperature Change the State?' }),
        new TextBlock({ id: 'energy-text', tag: 'p', html: "Temperature is really a measure of <strong>kinetic energy</strong> — how fast the particles are moving." }),
        new CalloutBlock({ id: 'energy-callout', html: '<strong>Low energy (cold):</strong> Particles barely move. They\'re held in place by attractive forces between them → <strong>SOLID</strong><br><br><strong>Medium energy (warm):</strong> Particles have enough energy to break free of their fixed positions, but not enough to fly apart → <strong>LIQUID</strong><br><br><strong>High energy (hot):</strong> Particles have so much energy they completely overcome the attractive forces and fly freely → <strong>GAS</strong>' }),
      ]
    },
    {
      id: 'sec-heating-curve',
      blocks: [
        new TextBlock({ id: 'hc-title', tag: 'h2', html: 'The Heating Curve' }),
        new TextBlock({ id: 'hc-text', tag: 'p', html: "What happens when you continuously add heat to ice? Let's trace it:" }),
        new SimBlock({ id: 'hc-sim', sim: 'heatingCurve', width: 750, height: 380 }),
        new CalloutBlock({ id: 'hc-callout', style: 'warning', html: "<strong>Key insight:</strong> During phase changes (melting, boiling), temperature <em>stops rising</em> even though you keep adding heat! The energy goes into breaking bonds between particles — not making them faster." }),
      ]
    },
    {
      id: 'sec-math',
      blocks: [
        new TextBlock({ id: 'math-title', tag: 'h2', html: 'Distilled into Math' }),
        new TextBlock({ id: 'math-text', tag: 'p', html: "Now that you understand <em>why</em>, here's the compressed equation:" }),
        new MathBlock({ id: 'math-qmcdt', label: 'Heat to change temperature within a phase:', equation: 'q = m · c · ΔT', symbols: [
          { symbol: 'q', name: 'Heat', units: 'Joules (J)', meaning: 'Energy you add or remove' },
          { symbol: 'm', name: 'Mass', units: 'grams (g)', meaning: 'How much stuff' },
          { symbol: 'c', name: 'Specific heat capacity', units: 'J/(g·°C)', meaning: 'How "stubborn" the substance is' },
          { symbol: 'ΔT', name: 'Temperature change', units: '°C', meaning: 'T_final − T_initial' },
        ]}),
        new MathBlock({ id: 'math-qml', label: 'Heat to change state (phase transition):', equation: 'q = m · L', symbols: [
          { symbol: 'L', name: 'Latent heat', meaning: 'Energy per gram to change state (hidden heat)' },
          { symbol: 'L_f', name: 'Latent heat of fusion', meaning: 'For melting/freezing' },
          { symbol: 'L_v', name: 'Latent heat of vaporization', meaning: 'For boiling/condensing' },
        ]}),
      ]
    },
  ],

  stepMeta: [
    { icon: '📋', label: 'Recap', kind: 'narrate' },
    null,
    { icon: '💬', label: 'Big Q', kind: 'narrate' },
    null,
    { icon: '👁', label: '3 States', kind: 'narrate' },
    { icon: '🔑', label: 'Pattern', kind: 'narrate' },
    null,
    { icon: '🎮', label: 'Your turn', kind: 'narrate' },
    { icon: '❄️', label: 'Make Solid', kind: 'checkpoint' },
    { icon: '💧', label: 'Make Liquid', kind: 'checkpoint' },
    { icon: '🔥', label: 'Make Gas', kind: 'checkpoint' },
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },
    null,
    { icon: '⚡', label: 'Energy', kind: 'narrate' },
    { icon: '🎵', label: 'Analogy', kind: 'narrate' },
    null,
    { icon: '📈', label: 'Heat Curve', kind: 'narrate' },
    { icon: '🤯', label: 'Flat spots!', kind: 'narrate' },
    null,
    { icon: '📐', label: 'Math', kind: 'narrate' },
    { icon: '📝', label: 'q=mcΔT', kind: 'narrate' },
    { icon: '📝', label: 'q=mL', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },
    { icon: '🎉', label: 'Done!', kind: 'narrate' },
  ],

  buildSteps(showSection, runner) {
    // Get references to the interactive sim and slider
    const simBlock = runner.blockInstances.find(b => b.id === 'interactive-sim');
    const sliderBlock = runner.blockInstances.find(b => b.id === 'temp-slider');
    const stateColors = { SOLID: '#4fc3f7', LIQUID: '#81c784', GAS: '#ef5350' };

    // Wire slider to simulation
    if (sliderBlock && simBlock && simBlock.renderer) {
      sliderBlock.onChange = (v) => {
        simBlock.renderer.temperature = v;
        const s = simBlock.renderer.state;
        const label = document.getElementById('stateLabel');
        if (label) {
          label.textContent = s;
          label.style.color = stateColors[s];
        }
      };
    }

    return [
      { type: 'show', action: () => showSection('sec-recap'),
        text: "Let's start with a quick recap. We've learned that matter is anything with mass and volume. All matter is made of atoms. And a substance made of only one type of atom is called an element. There are 118 elements — the building blocks of everything in the universe." },
      { type: 'pause', duration: 800 },
      { type: 'narrate',
        text: "Now here's the big question. Water can be a solid ice cube, a flowing liquid, or invisible steam. It's the same H2O molecules each time. So what's actually changing? That's what we're about to find out." },
      { type: 'pause', duration: 500 },
      { type: 'show', action: () => showSection('sec-three-states'),
        text: "Here are the three states of matter, side by side. On the left, a solid — particles locked in a rigid grid, barely moving. In the middle, a liquid — particles sliding around each other, staying close. On the right, a gas — particles flying freely in every direction." },
      { type: 'narrate',
        text: "Notice the key pattern. The particles are the same in all three boxes. The only difference is how much energy they have. Less energy, they stay locked. More energy, they start sliding. Even more, they fly apart." },
      { type: 'pause', duration: 500 },
      { type: 'show', action: () => showSection('sec-interactive'),
        text: "Now it's your turn. Below is a live simulation. Use the temperature slider to control the particles yourself." },
      { type: 'checkpoint',
        instruction: 'Drag the temperature slider to below 20 to see a SOLID',
        text: "First, make sure the temperature is low — below 20. Watch how the particles vibrate in place but stay locked in their positions. That's a solid.",
        check: () => sliderBlock && sliderBlock.getValue() < 20 && simBlock?.renderer?.state === 'SOLID',
        confirmText: "Perfect. See how they vibrate but don't go anywhere? The forces between them are too strong for them to escape. That's why solids hold their shape." },
      { type: 'checkpoint',
        instruction: 'Now slide the temperature up to around 50 to see a LIQUID',
        text: "Now slowly increase the temperature. Slide it up to around 50. Watch what happens as the particles gain energy.",
        check: () => { const v = sliderBlock?.getValue(); return v >= 45 && v <= 60 && simBlock?.renderer?.state === 'LIQUID'; },
        confirmText: "There it is — a liquid! The particles broke free from their grid. They're sliding around each other, but still staying close. They have enough energy to move, but not enough to fly apart. That's why liquids flow but still have a definite volume." },
      { type: 'checkpoint',
        instruction: 'Crank the temperature above 80 to see a GAS',
        text: "Now let's go all the way. Crank the temperature above 80 and watch the particles go wild.",
        check: () => sliderBlock && sliderBlock.getValue() > 80 && simBlock?.renderer?.state === 'GAS',
        confirmText: "Boom! A gas. The particles have so much energy they've completely overcome the attractive forces. They're flying in every direction, bouncing off the walls, filling the entire container. That's why gases expand to fill any space." },
      { type: 'quiz',
        text: "Quick check. Let me test your understanding.",
        question: "If you cool a gas down, what happens to the particles?",
        options: ["They speed up", "They slow down and move closer together", "They disappear", "They get heavier"],
        correctIndex: 1,
        correctFeedback: "Exactly! Cooling removes energy → particles slow down → they condense back into a liquid.",
        wrongFeedback: "Not quite. Think about energy — cooling means removing energy. What happens to particles with less energy?" },
      { type: 'pause', duration: 500 },
      { type: 'show', action: () => showSection('sec-energy'),
        text: "So why does temperature change the state? Because temperature is really just a measure of kinetic energy — how fast the particles are moving." },
      { type: 'narrate',
        text: "At low energy, particles can't escape each other — they're locked in a solid. Add energy, they start sliding — a liquid. Add even more, they fly apart — a gas. It's like people at a concert. Cold audience sits in their seats, locked in rows. Warm them up, they start moving and dancing in place. Really heat things up, and they break free and run around everywhere." },
      { type: 'pause', duration: 500 },
      { type: 'show', action: () => showSection('sec-heating-curve'),
        text: "Now here's something surprising. Look at this heating curve. It shows what happens when you continuously add heat to ice." },
      { type: 'narrate',
        text: "See those flat sections? During melting and boiling, the temperature stops rising — even though you're still adding heat! Where does the energy go? It goes into breaking the bonds between particles. Once all the bonds are broken, the temperature starts rising again. This is called latent heat — hidden heat. You add energy, but it's hidden because the temperature doesn't change." },
      { type: 'pause', duration: 500 },
      { type: 'show', action: () => showSection('sec-math'),
        text: "Now let's compress everything into the math. There are two equations to know." },
      { type: 'narrate', highlight: '.math-box',
        text: "First: q equals m times c times delta T. This is for heating within a phase — when temperature IS changing. Q is the heat energy in joules. M is the mass. C is the specific heat capacity — think of it as how stubborn the substance is. Water has a high C, which is why it takes a long time to boil. And delta T is the temperature change." },
      { type: 'narrate',
        text: "Second: q equals m times L. This is for phase transitions — the flat parts of the heating curve. L is the latent heat. L sub f for melting, L sub v for boiling. Remember: during phase changes, temperature is flat, so delta T is zero. That first equation would give you zero, which is wrong. That's why you need this second equation." },
      { type: 'quiz',
        text: "Final question for this lesson.",
        question: "During boiling, you add heat but temperature stays at 100°C. Which equation describes the energy being added?",
        options: ["q = mcΔT (because temperature is changing)", "q = mL (because state is changing, not temperature)", "Neither — no energy is being added", "Both equations at the same time"],
        correctIndex: 1,
        correctFeedback: "Correct! During a phase change, ΔT = 0, so we use q = mL. The energy breaks bonds instead of raising temperature.",
        wrongFeedback: "Think about it: is the temperature changing during boiling? No — it stays flat. So ΔT = 0..." },
      { type: 'narrate',
        text: "Excellent work! You've completed lesson 1 point 4: States of Matter. You now understand that the same particles can be solid, liquid, or gas depending on their energy. You know about the heating curve and why temperature stays flat during phase changes. And you've got two equations: q equals m c delta T for heating within a phase, and q equals m L for changing between phases. Next up: pure substances versus mixtures. See you there!" },
    ];
  },
};
