/**
 * Lesson 2.1: Inside the Atom
 * Declarative lesson definition using composable blocks.
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock, SliderBlock } from '../blocks/Block.js';

// Import sims so they self-register
import '../sims/atomViz.js';
import '../sims/scaleViz.js';
import '../sims/atomBuilder.js';

export const lesson_2_1 = {
  id: '2.1',
  lessonId: 'lesson_2_1',
  title: 'Inside the Atom',

  sections: [
    {
      id: 'sec-2-recap',
      blocks: [
        new TextBlock({ id: '2-recap-title', tag: 'h2', html: 'Quick Recap' }),
        new TextBlock({ id: '2-recap-text', tag: 'p', html: "Before we go inside the atom, let's remember what we know:" }),
        new CalloutBlock({ id: '2-recap-callout', html: '<strong>From Module 1:</strong> Everything is made of <strong>matter</strong> (mass + volume). Matter is made of <strong>atoms</strong>. A substance with one type of atom is an <strong>element</strong> (118 total). Atoms can be in three states — solid, liquid, gas — depending on their energy.' }),
        new TextBlock({ id: '2-recap-question', tag: 'p', html: "We've been treating atoms like tiny solid balls. But what's <em>inside</em> an atom?" }),
      ]
    },
    {
      id: 'sec-2-structure',
      blocks: [
        new TextBlock({ id: '2-struct-title', tag: 'h2', html: '2.1 Inside the Atom' }),
        new TextBlock({ id: '2-struct-text', tag: 'p', html: 'An atom is NOT a solid ball. It has internal structure — like a tiny solar system:' }),
        new SimBlock({ id: '2-atom-viz', sim: 'atomViz', width: 500, height: 500 }),
        new TextBlock({ id: '2-struct-note', tag: 'p', html: 'At the center: the <strong>nucleus</strong> (protons + neutrons). Orbiting far outside: <strong>electrons</strong>.' }),
      ]
    },
    {
      id: 'sec-2-scale',
      blocks: [
        new TextBlock({ id: '2-scale-title', tag: 'h3', html: 'The Insane Scale' }),
        new CalloutBlock({ id: '2-scale-callout', html: 'If the atom were the size of a <strong>football stadium</strong>, the nucleus would be a <strong>marble</strong> at center field. The electrons buzz around in the upper seats. <strong>Most of the atom is empty space.</strong>' }),
        new SimBlock({ id: '2-scale-viz', sim: 'scaleViz', width: 700, height: 250 }),
      ]
    },
    {
      id: 'sec-2-particles',
      blocks: [
        new TextBlock({ id: '2-particles-title', tag: 'h2', html: 'The Three Subatomic Particles' }),
        new TableBlock({ id: '2-particles-table', maxWidth: '700px',
          headers: ['Particle', 'Symbol', 'Charge', 'Mass (amu)', 'Location'],
          rows: [
            [{ text: 'Proton', style: 'color:#ef5350;font-weight:bold' }, 'p⁺', '+1', '~1', 'Nucleus'],
            [{ text: 'Neutron', style: 'color:#888;font-weight:bold' }, 'n⁰', '0', '~1', 'Nucleus'],
            [{ text: 'Electron', style: 'color:#4fc3f7;font-weight:bold' }, 'e⁻', '-1', '~1/1836', 'Orbiting outside'],
          ]
        }),
      ]
    },
    {
      id: 'sec-2-builder',
      blocks: [
        new TextBlock({ id: '2-builder-title', tag: 'h2', html: 'Build an Atom' }),
        new TextBlock({ id: '2-builder-text', tag: 'p', html: 'Use the controls to build a carbon atom step by step:' }),
        new SimBlock({ id: '2-builder-sim', sim: 'atomBuilder', width: 500, height: 400 }),
        new SliderBlock({ id: '2-proton-slider', label: 'Protons:', min: 0, max: 12, value: 0, color: '#ef5350', gradient: 'linear-gradient(to right,#333,#ef5350)' }),
        new SliderBlock({ id: '2-neutron-slider', label: 'Neutrons:', min: 0, max: 12, value: 0, color: '#888', gradient: 'linear-gradient(to right,#333,#888)' }),
        new SliderBlock({ id: '2-electron-slider', label: 'Electrons:', min: 0, max: 12, value: 0, color: '#4fc3f7', gradient: 'linear-gradient(to right,#333,#4fc3f7)' }),
        new TextBlock({ id: '2-atom-info', tag: 'p', html: '<span id="atomInfo" style="text-align:center;display:block;font-size:1.1em;color:var(--muted)">Add particles to build your atom</span>' }),
      ]
    },
    {
      id: 'sec-2-math',
      blocks: [
        new TextBlock({ id: '2-math-title', tag: 'h2', html: 'Distilled into Math' }),
        new MathBlock({ id: '2-math-z', label: 'Atomic Number (what element it is):', equation: 'Z = number of protons', symbols: [
          { symbol: 'Z', name: 'Atomic number', meaning: 'Number of protons — defines the element' },
        ]}),
        new MathBlock({ id: '2-math-a', label: 'Mass Number (total nuclear particles):', equation: 'A = Z + N', symbols: [
          { symbol: 'A', name: 'Mass number', meaning: 'Protons + neutrons — total mass of nucleus' },
        ]}),
        new MathBlock({ id: '2-math-n', label: 'Number of neutrons:', equation: 'N = A - Z', symbols: [
          { symbol: 'N', name: 'Neutron number', meaning: 'Neutrons only — varies between isotopes' },
        ]}),
        new CalloutBlock({ id: '2-math-callout', html: '<strong>Why Z matters most:</strong> Change the number of protons → you change the element. 6 protons is ALWAYS carbon. 79 protons is ALWAYS gold. No exceptions.<br><br><strong>Why N can vary:</strong> Same element can have different numbers of neutrons. Carbon-12 has 6 neutrons, Carbon-14 has 8. Same element, different <em>isotope</em>. (More on this in 2.3!)' }),
      ]
    },
    {
      id: 'sec-2-summary',
      blocks: [
        new TextBlock({ id: '2-summary-title', tag: 'h2', html: 'Coming Up Next' }),
        new TextBlock({ id: '2-summary-text', tag: 'p', html: 'We now know what\'s inside an atom. Next in <strong>2.2</strong>, we\'ll see how the atomic number organizes the entire periodic table. Then in <strong>2.3</strong>, we\'ll explore <strong>isotopes</strong> (same element, different neutrons) and <strong>ions</strong> (atoms that gained or lost electrons).' }),
      ]
    },
  ],

  stepMeta: [
    { icon: '📋', label: 'Recap', kind: 'narrate' },
    null,
    { icon: '🔬', label: 'Structure', kind: 'narrate' },
    null,
    { icon: '🏟', label: 'Nucleus', kind: 'narrate' },
    { icon: '🤯', label: 'Scale', kind: 'narrate' },
    null,
    { icon: '📊', label: 'Particles', kind: 'narrate' },
    { icon: '🔴', label: '6 Protons', kind: 'checkpoint' },
    { icon: '⚪', label: '6 Neutrons', kind: 'checkpoint' },
    { icon: '🔵', label: '6 Electrons', kind: 'checkpoint' },
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },
    null,
    { icon: '📐', label: 'Z = ?', kind: 'narrate' },
    { icon: '📐', label: 'A = Z+N', kind: 'narrate' },
    { icon: '📐', label: 'N = A-Z', kind: 'narrate' },
    { icon: '📐', label: 'Isotopes', kind: 'narrate' },
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },
    { icon: '🎉', label: 'Done!', kind: 'narrate' },
  ],

  buildSteps(showSection, runner) {
    const protonSlider = runner.blockInstances.find(b => b.id === '2-proton-slider');
    const neutronSlider = runner.blockInstances.find(b => b.id === '2-neutron-slider');
    const electronSlider = runner.blockInstances.find(b => b.id === '2-electron-slider');
    const builderSim = runner.blockInstances.find(b => b.id === '2-builder-sim');

    // Wire sliders to builder
    const updateBuilder = () => {
      if (!builderSim?.renderer) return;
      const p = protonSlider?.getValue() || 0;
      const n = neutronSlider?.getValue() || 0;
      const e = electronSlider?.getValue() || 0;
      builderSim.renderer.setValues(p, n, e);
      const infoEl = document.getElementById('atomInfo');
      if (infoEl) infoEl.innerHTML = builderSim.renderer.getInfo();
    };

    if (protonSlider) protonSlider.onChange = updateBuilder;
    if (neutronSlider) neutronSlider.onChange = updateBuilder;
    if (electronSlider) electronSlider.onChange = updateBuilder;

    // Expose for backward compat
    window.atomBuilder = {
      getValues: () => ({
        p: protonSlider?.getValue() || 0,
        n: neutronSlider?.getValue() || 0,
        e: electronSlider?.getValue() || 0,
      })
    };

    return [
      { type: 'show', action: () => showSection('sec-2-recap'),
        text: "Welcome to Module 2. Let's recap what we know. Everything is made of matter. Matter is made of atoms. We learned about the three states of matter, and how temperature controls which state particles are in. But we've been treating atoms like tiny solid balls. Now let's crack one open and see what's inside." },
      { type: 'pause' },
      { type: 'show', action: () => showSection('sec-2-structure'),
        text: "An atom is NOT a solid ball. It has internal structure. Think of it like a tiny solar system. At the center, there's a dense core called the nucleus. And orbiting around it, far away, are electrons. Let's zoom in." },
      { type: 'pause' },
      { type: 'show', action: () => showSection('sec-2-scale'),
        text: "Here's the structure. The nucleus sits at the very center and contains two types of particles: protons, which carry a positive charge, and neutrons, which carry no charge at all. Orbiting far outside the nucleus are electrons, which carry a negative charge." },
      { type: 'narrate',
        text: "Here's the mind-blowing part about scale. The nucleus is incredibly tiny compared to the atom. If the whole atom were the size of a football stadium, the nucleus would be a marble sitting at the center of the field. All those electrons would be buzzing around in the upper seats. Most of the atom is empty space!" },
      { type: 'pause' },
      { type: 'show', action: () => showSection('sec-2-particles'),
        text: "Let's look at the three subatomic particles side by side. Protons have a positive charge of plus 1, a relative mass of 1, and live in the nucleus. Neutrons have zero charge, also a relative mass of 1, and live in the nucleus too. Electrons have a negative charge of minus 1, a tiny mass of about 1 over 1836, and orbit outside the nucleus." },
      { type: 'checkpoint', action: () => showSection('sec-2-builder'),
        instruction: 'Set the Protons slider to 6',
        text: "Now your turn. I've placed an interactive atom builder below. Use the controls to add exactly 6 protons to the nucleus. 6 protons is what makes an atom carbon.",
        check: () => protonSlider && protonSlider.getValue() === 6,
        confirmText: "That's carbon! The number of protons is what defines which element an atom is. 6 protons always means carbon. Always. This number is called the atomic number, and it's the single most important number in chemistry." },
      { type: 'checkpoint',
        instruction: 'Set the Neutrons slider to 6',
        text: "Now add 6 neutrons to the nucleus alongside the protons. Neutrons add mass but don't change the element.",
        check: () => neutronSlider && neutronSlider.getValue() === 6,
        confirmText: "Good. The nucleus now has 6 protons and 6 neutrons, giving it a mass number of 12. That's carbon-12, the most common form of carbon." },
      { type: 'checkpoint',
        instruction: 'Set the Electrons slider to 6',
        text: "Finally, add 6 electrons orbiting around the nucleus. In a neutral atom, the number of electrons equals the number of protons.",
        check: () => electronSlider && electronSlider.getValue() === 6,
        confirmText: "Perfect. You've built a complete carbon atom! 6 protons define it as carbon. 6 neutrons give it stability. 6 electrons make it electrically neutral, because the 6 positive charges from protons are balanced by 6 negative charges from electrons." },
      { type: 'quiz',
        text: "Let me check your understanding.",
        question: "An atom has 8 protons. What element is it?",
        options: ["Carbon (C)", "Nitrogen (N)", "Oxygen (O)", "It depends on the neutrons"],
        correctIndex: 2,
        correctFeedback: "Correct! 8 protons = Oxygen. Always. The number of protons (Z) defines the element.",
        wrongFeedback: "Remember: the number of PROTONS defines the element. Look up Z=8 on the periodic table." },
      { type: 'pause' },
      { type: 'show', action: () => showSection('sec-2-math'),
        text: "Let's distill this into the math. There are two key numbers for any atom." },
      { type: 'narrate',
        text: "First, the atomic number, written as Z. Z equals the number of protons. This is the identity of the element. Z equals 1 is hydrogen. Z equals 6 is carbon. Z equals 79 is gold. Change the number of protons, and you change the element entirely." },
      { type: 'narrate',
        text: "Second, the mass number, written as A. A equals the number of protons plus the number of neutrons. Since protons and neutrons both have a mass of about 1 atomic mass unit, A tells you roughly how heavy the nucleus is. Electrons are so light we ignore them for mass calculations." },
      { type: 'narrate',
        text: "Here's how you figure out the number of neutrons: N equals A minus Z. Mass number minus atomic number gives you neutrons. For carbon-12: A is 12, Z is 6, so N equals 12 minus 6 equals 6 neutrons. For carbon-14: A is 14, Z is still 6, so N equals 14 minus 6 equals 8 neutrons. Same element, different mass. These are called isotopes, and we'll explore those next." },
      { type: 'quiz',
        text: "One more question before we wrap up.",
        question: "Carbon-14 has Z=6, A=14. How many neutrons?",
        options: ["6", "8", "14", "20"],
        correctIndex: 1,
        correctFeedback: "Right! N = A - Z = 14 - 6 = 8 neutrons.",
        wrongFeedback: "Use the formula: N = A - Z. So N = 14 - 6 = ?" },
      { type: 'show', action: () => showSection('sec-2-summary'),
        text: "Great work! You've learned what's inside an atom: protons and neutrons in the nucleus, electrons orbiting outside. You know that the atomic number Z, the number of protons, defines which element it is. And the mass number A is protons plus neutrons. Next, we'll look at isotopes, which are atoms of the same element with different numbers of neutrons, and ions, which are atoms that have gained or lost electrons. See you in lesson 2.2!" },
    ];
  },
};
