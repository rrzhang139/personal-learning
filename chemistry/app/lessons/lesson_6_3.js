/**
 * Lesson 6.3 — Charles's Law (V₁/T₁ = V₂/T₂)
 *
 * Atomic concept: At constant pressure & amount, volume and temperature (in Kelvin)
 * are directly proportional — heat the gas, it expands.
 *
 * Prereqs actively used: pressure = collisions (6.1), Boyle's P₁V₁=P₂V₂ (6.2),
 * temperature = avg KE (5.1), q = mcΔT (5.2), IMFs & boiling (4.2),
 * moles & Avogadro (4.4), exo/endo reactions (4.3), Hess's Law (5.4)
 *
 * Sim: gasCharlesViz — constant-pressure piston that expands/contracts with temperature
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';
import '../sims/gasCharlesViz.js';

export const lesson_6_3 = {
  id: '6.3',
  lessonId: 'lesson_6_3',
  title: "Charles's Law",

  sections: [
    /* --- Recall Hook --- */
    {
      id: 'sec-63-hook',
      blocks: [
        new TextBlock({ id: '63-hook-title', tag: 'h2', html: "🔄 Boyle Held Temperature Constant — What If We Don't?" }),
        new CalloutBlock({ id: '63-hook-recall', html:
          '<strong>From Lesson 6.2:</strong> Boyle\'s Law says P₁V₁ = P₂V₂ when temperature and amount are constant. ' +
          'You changed volume and watched pressure respond. But what if we flip it? Keep pressure constant ' +
          '(let the container expand freely) and change the <em>temperature</em>. What happens to the volume?'
        }),
      ]
    },

    /* --- Hot Air Balloon Story --- */
    {
      id: 'sec-63-balloon',
      blocks: [
        new TextBlock({ id: '63-bal-title', tag: 'h2', html: '🎈 Why Hot Air Balloons Float' }),
        new TextBlock({ id: '63-bal-p1', tag: 'p', html:
          'In 1783, the Montgolfier brothers lit a fire under a silk bag and watched it rise into the sky over Paris. ' +
          'Heating the air inside made it expand. The bag\'s volume grew, but the mass of air inside stayed roughly the same. ' +
          'Less dense than the cold air around it, the balloon floated upward. This is Charles\'s Law in action — ' +
          'heat a gas at constant pressure and it expands.'
        }),
        new TextBlock({ id: '63-bal-p2', tag: 'p', html:
          'Jacques Charles, a French scientist who made the first hydrogen balloon flight, measured this precisely: ' +
          'for every 1°C of heating, a gas expands by 1/273 of its volume at 0°C. That fraction — 1/273 — ' +
          'is the clue that leads to <strong>absolute zero</strong>.'
        }),
      ]
    },

    /* --- Concrete Example --- */
    {
      id: 'sec-63-concrete',
      blocks: [
        new TextBlock({ id: '63-conc-title', tag: 'h2', html: '🔬 Numbers First, Formula Second' }),
        new TextBlock({ id: '63-conc-p1', tag: 'p', html:
          'A balloon holds 3.0 L of air at 300 K (about 27°C). You heat it to 600 K (about 327°C) — ' +
          'double the Kelvin temperature. The balloon expands to <strong>6.0 L</strong>. Double the temperature, ' +
          'double the volume.'
        }),
        new TextBlock({ id: '63-conc-p2', tag: 'p', html:
          'Cool it to 150 K instead? Volume shrinks to <strong>1.5 L</strong>. Half the Kelvin temperature, ' +
          'half the volume. The relationship is perfectly linear — but <em>only</em> if you use Kelvin.'
        }),
        new CalloutBlock({ id: '63-conc-warning', style: 'warning', html:
          '<strong>⚠️ Kelvin only!</strong> Charles\'s Law fails with Celsius because 0°C is not "zero energy." ' +
          'A gas at 10°C heated to 20°C does NOT double in volume. But 200 K → 400 K does. ' +
          'Kelvin starts at absolute zero, where particle motion stops — that\'s why the proportionality works.'
        }),
      ]
    },

    /* --- Formalize --- */
    {
      id: 'sec-63-law',
      blocks: [
        new TextBlock({ id: '63-law-title', tag: 'h2', html: "📐 Charles's Law" }),
        new MathBlock({ id: '63-law-math', label: "Charles's Law:", equation: 'V₁ / T₁ = V₂ / T₂', symbols: [
          { symbol: 'V₁', name: 'Initial volume', meaning: 'volume before the temperature change', units: 'L or mL' },
          { symbol: 'T₁', name: 'Initial temperature', meaning: 'temperature before (MUST be in Kelvin)', units: 'K' },
          { symbol: 'V₂', name: 'Final volume', meaning: 'volume after the temperature change', units: 'same unit as V₁' },
          { symbol: 'T₂', name: 'Final temperature', meaning: 'temperature after (MUST be in Kelvin)', units: 'K' },
        ]}),
        new CalloutBlock({ id: '63-law-convert', html:
          '<strong>Kelvin conversion:</strong> K = °C + 273.15. Always convert before plugging in. ' +
          'Room temperature: 25°C = 298 K. Boiling water: 100°C = 373 K. Absolute zero: −273.15°C = 0 K.'
        }),
        new CalloutBlock({ id: '63-law-why', html:
          '<strong>Why does it work?</strong> At constant pressure, the piston is free to move. ' +
          'When you heat the gas, particles speed up (higher KE from Lesson 5.1) and hit the piston harder. ' +
          'The piston slides outward until the collision rate per unit area drops back to matching the external pressure. ' +
          'The new equilibrium has more volume but the same pressure.'
        }),
      ]
    },

    /* --- Absolute Zero --- */
    {
      id: 'sec-63-zero',
      blocks: [
        new TextBlock({ id: '63-zero-title', tag: 'h2', html: '🧊 Absolute Zero: Where Volume Hits Zero' }),
        new TextBlock({ id: '63-zero-p1', tag: 'p', html:
          'If V ∝ T, then extrapolating backward: what temperature gives zero volume? Answer: <strong>0 Kelvin</strong> ' +
          '(−273.15°C). This is <strong>absolute zero</strong> — the theoretical point where particles have zero kinetic energy ' +
          'and stop moving entirely.'
        }),
        new TextBlock({ id: '63-zero-p2', tag: 'p', html:
          'No real gas reaches absolute zero — they liquefy first (the IMFs from Lesson 4.2 pull particles together ' +
          'before motion stops). But the concept defines the Kelvin scale and explains why Kelvin is the "natural" ' +
          'temperature unit for gas laws.'
        }),
      ]
    },

    /* --- Simulation --- */
    {
      id: 'sec-63-sim',
      blocks: [
        new TextBlock({ id: '63-sim-title', tag: 'h2', html: '🎮 Heat It, Watch It Expand' }),
        new TextBlock({ id: '63-sim-p1', tag: 'p', html:
          'This container has a free-sliding piston (constant pressure). Heat the gas and watch the piston slide right ' +
          'as volume increases. Cool it and watch it contract. The V/T ratio should stay constant — that\'s Charles\'s Law.'
        }),
        new SimBlock({ id: '63-sim-viz', sim: 'gasCharlesViz', width: 900, height: 420, simOptions: { temperature: 300 } }),
      ]
    },

    /* --- Comparison Table --- */
    {
      id: 'sec-63-compare',
      blocks: [
        new TextBlock({ id: '63-cmp-title', tag: 'h2', html: "📊 Boyle's vs Charles's: Side by Side" }),
        new TableBlock({ id: '63-cmp-table',
          headers: ['', "Boyle's Law (6.2)", "Charles's Law (6.3)"],
          rows: [
            ['Relationship', 'P and V (inverse)', 'V and T (direct)'],
            ['Held constant', 'T and n', 'P and n'],
            ['Formula', 'P₁V₁ = P₂V₂', 'V₁/T₁ = V₂/T₂'],
            ['Graph shape', 'Hyperbola (P vs V)', 'Straight line (V vs T in K)'],
            ['Particle explanation', 'Less space → more frequent hits → higher P', 'Faster particles → piston pushed out → more V'],
            ['Key requirement', 'Same units for P; same units for V', 'Temperature MUST be in Kelvin'],
          ]
        }),
      ]
    },

    /* --- Forward Tease --- */
    {
      id: 'sec-63-next',
      blocks: [
        new TextBlock({ id: '63-next-title', tag: 'h2', html: '⏭️ Coming Up: The Ideal Gas Law' }),
        new TextBlock({ id: '63-next-p1', tag: 'p', html:
          'You now have two gas laws: Boyle\'s (P × V = constant) and Charles\'s (V / T = constant). ' +
          'In Lesson 6.4, we\'ll combine them — along with Avogadro\'s principle (V ∝ n) — into one master equation: ' +
          '<strong>PV = nRT</strong>. The ideal gas law. One formula to rule them all.'
        }),
      ]
    },
  ],

  // CRITICAL: 27 entries must exactly match buildSteps() array length
  stepMeta: [
    { icon: '🔄', label: 'Recall: Boyle\'s',       kind: 'narrate' },    // 0
    { icon: '❓', label: 'Quiz: Boyle\'s + P knobs', kind: 'quiz' },      // 1
    null,                                                                    // 2
    { icon: '🎈', label: 'Balloon story',           kind: 'narrate' },    // 3
    { icon: '🎈', label: '1/273 clue',              kind: 'narrate' },    // 4
    { icon: '❓', label: 'Quiz: why float?',         kind: 'quiz' },       // 5
    null,                                                                    // 6
    { icon: '🔬', label: 'Numbers first',           kind: 'narrate' },    // 7
    { icon: '⚠️', label: 'Kelvin only!',            kind: 'narrate' },    // 8
    { icon: '❓', label: 'Quiz: Kelvin trap',        kind: 'quiz' },       // 9
    null,                                                                    // 10
    { icon: '📐', label: 'The formula',             kind: 'narrate' },    // 11
    { icon: '📐', label: 'Why it works',            kind: 'narrate' },    // 12
    { icon: '❓', label: 'Quiz: calculate V₂',       kind: 'quiz' },       // 13
    null,                                                                    // 14
    { icon: '🧊', label: 'Absolute zero',           kind: 'narrate' },    // 15
    { icon: '❓', label: 'Quiz: zero + IMFs',        kind: 'quiz' },       // 16
    null,                                                                    // 17
    { icon: '🎮', label: 'Sim intro',               kind: 'narrate' },    // 18
    { icon: '🏁', label: 'Try: heat & cool',        kind: 'checkpoint' }, // 19
    null,                                                                    // 20
    { icon: '📊', label: 'Boyle vs Charles',        kind: 'narrate' },    // 21
    { icon: '❓', label: 'Quiz: which law?',         kind: 'quiz' },       // 22
    { icon: '❓', label: 'Quiz: calorimetry+gas',    kind: 'quiz' },       // 23
    null,                                                                    // 24
    { icon: '❓', label: 'Quiz: mega-synthesis',     kind: 'quiz' },       // 25
    { icon: '⏭️', label: 'Next: PV=nRT',            kind: 'narrate' },    // 26
  ],

  buildSteps(showSection, runner) {
    const simViz = runner.blockInstances.find(b => b.id === '63-sim-viz');

    return [
      // 0: Recall hook
      { type: 'show', action: () => showSection('sec-63-hook'),
        text: "In Lesson 6.2, you mastered Boyle's Law: at constant temperature, squeezing a gas into less volume increases its pressure. P₁V₁ equals P₂V₂. But what if we don't hold temperature constant? What if instead, we hold pressure constant — let the container expand freely — and crank up the heat? That's exactly what Jacques Charles investigated in the 1780s." },

      // 1: Quiz — Boyle's recall + pressure knobs from 6.1
      { type: 'quiz',
        text: "Before we move on, let's connect Boyle's Law (6.2) with the three pressure knobs from Lesson 6.1.",
        question: "In Boyle's Law (P₁V₁ = P₂V₂), temperature is held constant. From Lesson 6.1, you know pressure depends on three things: T, n, and V. If T and n are constant, Boyle's Law isolates which relationship?",
        options: [
          "How pressure changes with the number of particles",
          "How pressure changes with temperature",
          "How pressure and volume trade off when only the container size changes — the pure geometry of collisions",
          "How molecular mass affects pressure"
        ],
        correctIndex: 2,
        correctFeedback: "Exactly! Boyle's Law isolates the volume-pressure trade-off from Lesson 6.1's three knobs. Same particles, same speed, different box size → different collision frequency per unit area. Today we turn a different knob: temperature, while letting volume adjust freely.",
        wrongFeedback: "Think about it: T constant, n constant — the only thing left from 6.1's three knobs is volume. Boyle's Law is purely about how changing the box size redistributes the same collisions." },

      // 2: pause
      { type: 'pause' },

      // 3: Hot air balloon story
      { type: 'show', action: () => showSection('sec-63-balloon'),
        text: "In 1783, the Montgolfier brothers lit a fire under a giant silk bag in Paris and it rose into the sky — the first hot air balloon flight. Why did it float? Heating the air inside made it expand. The bag's volume grew, but the mass of air inside barely changed. Same mass in a bigger volume means lower density. And when something is less dense than the fluid around it, it floats — just like a cork in water." },

      // 4: The 1/273 clue
      { type: 'narrate',
        text: "Jacques Charles, who made the first hydrogen balloon flight later that year, measured the expansion precisely. He found that for every 1 degree Celsius of heating, a gas expands by one two-hundred-and-seventy-third of its volume at zero degrees Celsius. That fraction — 1 over 273 — is a profound clue. If a gas shrinks by 1/273 for each degree cooled, then at negative 273 degrees Celsius, the volume would theoretically hit zero. That temperature is absolute zero." },

      // 5: Quiz — why balloons float, connecting density and gas expansion
      { type: 'quiz',
        text: "This connects gas expansion to a physical consequence.",
        question: "A hot air balloon has an open bottom (air can escape). You heat the air inside from 300 K to 600 K. What happens and why?",
        options: [
          "The air inside doubles in pressure, inflating the balloon like a tire",
          "The air inside expands; some escapes out the bottom. Less air mass in the same balloon volume → lower density → the balloon rises",
          "Nothing — since the bottom is open, the heat escapes immediately",
          "The balloon shrinks because hot air is lighter"
        ],
        correctIndex: 1,
        correctFeedback: "Key insight! The open bottom means pressure stays at 1 atm (constant pressure — Charles's Law applies). The air expands, excess spills out, and the remaining air is less dense than the cooler air outside. Density difference = buoyancy = flight!",
        wrongFeedback: "With an open bottom, pressure can't build up — it stays at 1 atm. Instead, the heated air expands (Charles's Law), some escapes, and what's left has lower density than the surrounding cold air. Lower density → buoyancy → it rises." },

      // 6: pause
      { type: 'pause' },

      // 7: Concrete example
      { type: 'show', action: () => showSection('sec-63-concrete'),
        text: "Let's see the numbers. A balloon holds 3.0 liters of air at 300 Kelvin — that's about 27 degrees Celsius, roughly room temperature. Heat it to 600 Kelvin — double the Kelvin temperature. The volume doubles to 6.0 liters. Cool it instead to 150 Kelvin — half the Kelvin temperature — and the volume halves to 1.5 liters. The relationship is perfectly linear and perfectly proportional." },

      // 8: Kelvin warning
      { type: 'narrate',
        text: "But here's the critical trap. This ONLY works with Kelvin temperatures. If you try it with Celsius, you'll get wrong answers. Why? Because zero degrees Celsius is not zero energy — it's just the freezing point of water, an arbitrary reference. A gas at 10°C heated to 20°C does NOT double in volume. But 200 K heated to 400 K does. Kelvin starts at true zero — where particles stop moving — so doubling Kelvin means doubling kinetic energy, which doubles the expansion force." },

      // 9: Quiz — Kelvin trap
      { type: 'quiz',
        text: "This is the most common mistake in gas law problems.",
        question: "A gas at 0°C occupies 5.0 L. You heat it to 100°C at constant pressure. A student calculates: 'Temperature went from 0 to 100, that's infinite increase, so volume is infinite!' What's wrong?",
        options: [
          "Nothing — the calculation is correct, volume approaches infinity",
          "The student forgot to convert to Kelvin. 0°C = 273 K, 100°C = 373 K. V₂ = 5.0 × (373/273) = 6.83 L",
          "The student should have used Celsius but divided instead of multiplied",
          "Charles's Law doesn't work above 0°C"
        ],
        correctIndex: 1,
        correctFeedback: "The classic trap! 0°C is NOT zero temperature — it's 273 K. The temperature ratio is 373/273 ≈ 1.37, so volume increases by 37% to 6.83 L. Always convert to Kelvin first!",
        wrongFeedback: "0°C = 273 K (not zero!). 100°C = 373 K. V₂ = V₁ × T₂/T₁ = 5.0 × 373/273 = 6.83 L. The student's mistake was using Celsius instead of Kelvin." },

      // 10: pause
      { type: 'pause' },

      // 11: Formalize
      { type: 'show', action: () => showSection('sec-63-law'),
        text: "Charles's Law: V₁ divided by T₁ equals V₂ divided by T₂. Or equivalently, V₁ times T₂ equals V₂ times T₁. Either form works. The key: temperature must be in Kelvin. Always. No exceptions." },

      // 12: Why it works — particle level
      { type: 'narrate',
        text: "Why does this work at the particle level? Remember from Lesson 5.1: higher temperature means higher average kinetic energy. The particles slam into the piston harder and more frequently. Since the piston is free to move — constant pressure — it slides outward. It keeps sliding until the particles spread out enough that the collision rate per unit area matches the external pressure again. A new equilibrium: higher temperature, larger volume, same pressure." },

      // 13: Quiz — calculation
      { type: 'quiz',
        text: "Your turn to calculate.",
        question: "A gas occupies 4.0 L at 25°C. It's heated to 50°C at constant pressure. What's the new volume?",
        options: [
          "8.0 L — temperature doubled so volume doubles",
          "2.0 L — temperature doubled so volume halves",
          "4.34 L — convert to Kelvin first: V₂ = 4.0 × (323/298)",
          "4.0 L — volume doesn't change with temperature"
        ],
        correctIndex: 2,
        correctFeedback: "25°C = 298 K, 50°C = 323 K. V₂ = 4.0 × (323/298) = 4.34 L. Notice: 25→50°C feels like doubling, but in Kelvin it's only a 8.4% increase. The Kelvin conversion saves you from a massive error!",
        wrongFeedback: "Convert to Kelvin! 25°C = 298 K, 50°C = 323 K. V₂ = V₁ × (T₂/T₁) = 4.0 × (323/298) = 4.34 L. Temperature did NOT double — that's the Celsius trap." },

      // 14: pause
      { type: 'pause' },

      // 15: Absolute zero
      { type: 'show', action: () => showSection('sec-63-zero'),
        text: "Now for the profound part. If volume is directly proportional to Kelvin temperature, what happens at 0 Kelvin? Theoretically, volume goes to zero. Particles have zero kinetic energy — they stop moving entirely. This temperature, negative 273.15 degrees Celsius, is absolute zero. It's the coldest anything can possibly be. It defines the bottom of the Kelvin scale and explains why Kelvin is the natural unit for gas laws." },

      // 16: Quiz — absolute zero + IMFs (4.2) + phase change
      { type: 'quiz',
        text: "This question bridges Charles's Law with intermolecular forces from Lesson 4.2.",
        question: "Charles's Law predicts a gas reaches zero volume at 0 K. But no gas actually does this. Why not?",
        options: [
          "Atoms are infinitely small, so they can compress to zero — it does happen",
          "Before reaching 0 K, the gas liquefies. IMFs (London forces, dipole-dipole, H-bonding from 4.2) pull slowed particles together into a liquid, breaking the gas law assumptions",
          "Absolute zero is impossible to define precisely",
          "The container walls absorb all the kinetic energy first"
        ],
        correctIndex: 1,
        correctFeedback: "Beautiful connection! As temperature drops, particles slow down and IMFs (from 4.2) become dominant. London dispersion, dipole-dipole, or hydrogen bonds pull particles into a liquid phase. Once it's a liquid, gas laws don't apply. Gases with stronger IMFs (like H₂O with H-bonding) liquefy at much higher temperatures than gases with weak IMFs (like He with only LDF).",
        wrongFeedback: "Think about what happens to real molecules as they slow down. The intermolecular forces from 4.2 — London dispersion, dipole-dipole, H-bonding — become significant when particles aren't moving fast enough to escape them. The gas condenses into a liquid before reaching 0 K." },

      // 17: pause
      { type: 'pause' },

      // 18: Sim intro
      { type: 'show', action: () => showSection('sec-63-sim'),
        text: "Time to see Charles's Law in action. This container has a free-sliding piston — it maintains constant pressure. When you heat the gas, particles speed up and push the piston outward, increasing the volume. Cool the gas and the piston slides back. Watch the V/T ratio — it should stay approximately constant no matter the temperature. Try heating above 500 K and cooling below 150 K." },

      // 19: Checkpoint — heat and cool
      { type: 'checkpoint',
        instruction: 'Heat the gas above 500 K AND cool it below 150 K. Watch V/T stay constant.',
        text: "Explore both extremes — crank the temperature way up, then way down. Watch the piston move and V/T stay constant.",
        check: () => simViz?.renderer?.hasHeatedAbove500 === true && simViz?.renderer?.hasCooledBelow150 === true,
        checkInterval: 500,
        confirmText: "See it? Hot gas → fast particles → piston pushed out → big volume. Cold gas → slow particles → piston slides in → small volume. But V divided by T barely changed. That's Charles's Law: the ratio is locked." },

      // 20: pause
      { type: 'pause' },

      // 21: Comparison table
      { type: 'show', action: () => showSection('sec-63-compare'),
        text: "Let's put Boyle's and Charles's Laws side by side. Boyle: pressure and volume are inversely proportional at constant T. Charles: volume and temperature are directly proportional at constant P. One is a hyperbola, the other is a straight line. Both come from the same physics — particle collisions — just with different variables held constant." },

      // 22: Quiz — which law applies? (scenario discrimination)
      { type: 'quiz',
        text: "Can you identify which law governs each scenario?",
        question: "Scenario: A sealed syringe (rigid plunger locked in place) is heated from 300 K to 600 K. Which law describes the pressure change, and what happens?",
        options: [
          "Charles's Law — volume doubles",
          "Boyle's Law — volume stays the same so pressure halves",
          "Neither Boyle's nor Charles's directly — this is Gay-Lussac's Law (P ∝ T at constant V). Pressure doubles because volume is fixed and temperature doubled",
          "Both laws apply simultaneously and cancel each other out"
        ],
        correctIndex: 2,
        correctFeedback: "Sharp! Boyle holds T constant (varies V). Charles holds P constant (varies V). But here VOLUME is constant and temperature changes — that's a third scenario. Pressure doubles because at constant V, P ∝ T. You've actually seen this: in Lesson 6.2's mega-quiz, the rigid container problem used P ∝ T. You just didn't have the name for it yet.",
        wrongFeedback: "Check what's constant: the plunger is locked → volume is constant. Boyle's keeps T constant, Charles's keeps P constant. Neither fits. This is a third case: constant V, where P is directly proportional to T. Temperature doubles → pressure doubles." },

      // 23: Quiz — calorimetry (5.3) + Charles's Law + moles (4.4)
      { type: 'quiz',
        text: "Multi-chapter synthesis: calorimetry (5.3), specific heat (5.2), and Charles's Law.",
        question: "A balloon at 298 K holds 6.0 L of gas at 1 atm. You immerse it in hot water, transferring 500 J to the gas (c = 0.5 J/g·°C, mass = 5 g). Using q = mcΔT: what's the new temperature and volume?",
        options: [
          "ΔT = 500/(5 × 0.5) = 200°C → T₂ = 498 K → V₂ = 6.0 × (498/298) = 10.0 L",
          "ΔT = 500/(5 × 0.5) = 200°C → T₂ = 225°C → V₂ = 6.0 × (225/25) = 54 L",
          "ΔT = 50°C → T₂ = 348 K → V₂ = 7.0 L",
          "Temperature doesn't change because the balloon can expand"
        ],
        correctIndex: 0,
        correctFeedback: "You chained three concepts perfectly! (1) q = mcΔT (5.2): ΔT = 500/(5 × 0.5) = 200°C. (2) T₂ = 298 + 200 = 498 K (convert properly — add ΔT in °C directly to K since ΔT is the same in both scales). (3) Charles's Law: V₂ = 6.0 × (498/298) = 10.0 L. Option B made the classic Kelvin trap — using Celsius in the ratio!",
        wrongFeedback: "Step by step: (1) q = mcΔT → ΔT = 500/(5×0.5) = 200°C. (2) Since ΔT(°C) = ΔT(K), new temp = 298 + 200 = 498 K. (3) Charles's Law: V₂ = 6.0 × (498/298) = 10.0 L." },

      // 24: pause
      { type: 'pause' },

      // 25: Quiz — mega synthesis: Hess's Law (5.4) + exo/endo (4.3) + q=mcΔT (5.2) + Charles's (6.3) + Boyle's (6.2) + moles (4.4)
      { type: 'quiz',
        text: "Final challenge. This threads together Hess's Law (5.4), reaction energy (4.3), specific heat (5.2), and both gas laws (6.2, 6.3).",
        question: "Two reactions at constant pressure: Reaction A releases 100 kJ, Reaction B absorbs 60 kJ. By Hess's Law, the net process releases 40 kJ. This 40 kJ heats 2 moles of gas (initially 300 K, 10 L) causing ΔT = +50 K. Using Charles's Law, what's the final volume?",
        options: [
          "10.0 L — the energy cancels out because one reaction is exo and one is endo",
          "11.67 L — net exothermic (Hess: −100 + 60 = −40 kJ), gas heated from 300 to 350 K, V₂ = 10 × (350/300)",
          "8.57 L — net endothermic, gas cools, V₂ = 10 × (300/350)",
          "20.0 L — temperature doubled"
        ],
        correctIndex: 1,
        correctFeedback: "Masterful chain! (1) Hess's Law (5.4): ΔH_net = −100 + 60 = −40 kJ (exothermic, from 4.3 sign convention). (2) That 40 kJ heats the gas → ΔT = +50 K (from 5.2, q = mcΔT or equivalent). (3) T₂ = 300 + 50 = 350 K. (4) Charles's Law: V₂ = 10 × (350/300) = 11.67 L. You just connected thermochemistry to gas behavior in one problem!",
        wrongFeedback: "Follow the chain: (1) Hess's Law: −100 + 60 = −40 kJ net (exothermic). (2) Exothermic means heat released → gas gets hotter → ΔT = +50 K → T₂ = 350 K. (3) Charles's Law at constant P: V₂ = 10 × (350/300) = 11.67 L." },

      // 26: Tease next
      { type: 'show', action: () => showSection('sec-63-next'),
        text: "Incredible work. You've now mastered two gas laws: Boyle's — pressure times volume is constant at fixed temperature — and Charles's — volume over temperature is constant at fixed pressure. In Lesson 6.4, we'll unite them into a single, elegant equation: PV equals nRT. The ideal gas law. It combines Boyle's, Charles's, and Avogadro's principle into one formula that handles any combination of changes. See you there!" },
    ];
  },
};
