/**
 * Lesson 6.2 — Boyle's Law (P₁V₁ = P₂V₂)
 *
 * Atomic concept: At constant temperature & amount, pressure and volume
 * are inversely proportional — compress the space, pressure rises.
 *
 * Prereqs actively used: pressure from particle collisions (6.1),
 * temperature = avg KE (5.1), moles (4.4), IMFs (4.2), q = mcΔT (5.2),
 * exo/endothermic (4.3), Hess's Law path-independence (5.4)
 *
 * Sim: gasBoylesViz — draggable piston, live P/V/PV readouts, P-vs-V graph
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';
import '../sims/gasBoylesViz.js';

export const lesson_6_2 = {
  id: '6.2',
  lessonId: 'lesson_6_2',
  title: "Boyle's Law",

  sections: [
    /* --- Recall Hook --- */
    {
      id: 'sec-62-hook',
      blocks: [
        new TextBlock({ id: '62-hook-title', tag: 'h2', html: '🔄 The Three Pressure Knobs — Revisited' }),
        new CalloutBlock({ id: '62-hook-recall', html:
          '<strong>From Lesson 6.1:</strong> Gas pressure comes from particle collisions with container walls. ' +
          'Three things control it: <em>temperature</em> (particle speed), <em>number of particles</em> (moles), ' +
          'and <em>volume</em> (container size). Today we hold the first two constant and ask: ' +
          'what <em>exactly</em> happens when you change the volume?'
        }),
      ]
    },

    /* --- Syringe Story --- */
    {
      id: 'sec-62-syringe',
      blocks: [
        new TextBlock({ id: '62-syr-title', tag: 'h2', html: '💉 The Syringe Experiment' }),
        new TextBlock({ id: '62-syr-p1', tag: 'p', html:
          'Take a plastic syringe and cap the end so no air can escape. Pull the plunger out to the 10 mL mark — ' +
          'you\'ve trapped a fixed amount of air at atmospheric pressure (1 atm). Now push the plunger in to the ' +
          '5 mL mark. You\'ve halved the volume. The air pushes back harder — the pressure doubled to 2 atm.'
        }),
        new TextBlock({ id: '62-syr-p2', tag: 'p', html:
          'Push to 2.5 mL? The pressure quadruples to 4 atm. The pattern is precise: ' +
          '<strong>halve the volume → double the pressure. Every time.</strong>'
        }),
      ]
    },

    /* --- Formalize --- */
    {
      id: 'sec-62-law',
      blocks: [
        new TextBlock({ id: '62-law-title', tag: 'h2', html: "📐 Boyle's Law" }),
        new TextBlock({ id: '62-law-p1', tag: 'p', html:
          'Robert Boyle discovered this pattern in 1662: at constant temperature and constant amount of gas, ' +
          'pressure and volume are <strong>inversely proportional</strong>. Double one, the other halves.'
        }),
        new MathBlock({ id: '62-law-math', label: "Boyle's Law:", equation: 'P₁V₁ = P₂V₂', symbols: [
          { symbol: 'P₁', name: 'Initial pressure', meaning: 'pressure before the change', units: 'atm, kPa, or Pa' },
          { symbol: 'V₁', name: 'Initial volume', meaning: 'volume before the change', units: 'L or mL' },
          { symbol: 'P₂', name: 'Final pressure', meaning: 'pressure after the change', units: 'same unit as P₁' },
          { symbol: 'V₂', name: 'Final volume', meaning: 'volume after the change', units: 'same unit as V₁' },
        ]}),
        new CalloutBlock({ id: '62-law-why', html:
          '<strong>Why does it work?</strong> Same particles, same speed (constant T), but less room. ' +
          'In a smaller box, each particle travels a shorter distance before hitting a wall — so collisions ' +
          'happen <em>more often</em>. More collisions per second = higher pressure. The product P × V stays constant ' +
          'because the total "collision budget" doesn\'t change — you\'re just redistributing it.'
        }),
      ]
    },

    /* --- Worked Example --- */
    {
      id: 'sec-62-worked',
      blocks: [
        new TextBlock({ id: '62-work-title', tag: 'h2', html: '🔬 Worked Example: Scuba Tank' }),
        new TextBlock({ id: '62-work-p1', tag: 'p', html:
          '<strong>Problem:</strong> A scuba diver\'s tank holds 12 L of air compressed to 200 atm. ' +
          'If the diver releases this air at the surface (1 atm), what volume does it expand to?'
        }),
        new TextBlock({ id: '62-work-p2', tag: 'p', html:
          '<strong>Step 1:</strong> Identify knowns: P₁ = 200 atm, V₁ = 12 L, P₂ = 1 atm, V₂ = ?<br>' +
          '<strong>Step 2:</strong> Apply P₁V₁ = P₂V₂ → V₂ = P₁V₁ / P₂<br>' +
          '<strong>Step 3:</strong> V₂ = (200 × 12) / 1 = <strong>2,400 L</strong><br>' +
          'That\'s 2,400 liters — enough to fill a small room. All packed into a tank the size of a backpack!'
        }),
      ]
    },

    /* --- Simulation --- */
    {
      id: 'sec-62-sim',
      blocks: [
        new TextBlock({ id: '62-sim-title', tag: 'h2', html: '🎮 Compress & Expand' }),
        new TextBlock({ id: '62-sim-p1', tag: 'p', html:
          'Drag the piston left to compress the gas, right to expand it. Watch the pressure, volume, ' +
          'and P × V readouts. The graph traces your P-vs-V path — it should follow a smooth curve ' +
          'called a <strong>hyperbola</strong>.'
        }),
        new SimBlock({ id: '62-sim-viz', sim: 'gasBoylesViz', width: 900, height: 420, simOptions: {} }),
      ]
    },

    /* --- Why It Breaks Down --- */
    {
      id: 'sec-62-real',
      blocks: [
        new TextBlock({ id: '62-real-title', tag: 'h2', html: '⚠️ When Boyle\'s Law Breaks Down' }),
        new TextBlock({ id: '62-real-p1', tag: 'p', html:
          'Boyle\'s Law assumes an <strong>ideal gas</strong> — particles with no volume and no attraction to each other. ' +
          'Real gases deviate at very high pressures (particles are physically close, their own volume matters) ' +
          'and very low temperatures (particles slow down enough that intermolecular forces start pulling them together).'
        }),
        new CalloutBlock({ id: '62-real-callout', html:
          '<strong>Connection to Lesson 4.2:</strong> Remember intermolecular forces? At low temperatures, ' +
          'London dispersion forces and dipole-dipole attractions become significant relative to particle kinetic energy. ' +
          'Polar gases like NH₃ deviate from Boyle\'s Law sooner than nonpolar gases like N₂, ' +
          'because their stronger IMFs "pull" particles together before they hit the walls — reducing pressure below ' +
          'what Boyle predicts.'
        }),
      ]
    },

    /* --- Energy Connection --- */
    {
      id: 'sec-62-energy',
      blocks: [
        new TextBlock({ id: '62-energy-title', tag: 'h2', html: '⚡ Compression, Work, and Heat' }),
        new TextBlock({ id: '62-energy-p1', tag: 'p', html:
          'When you push a piston inward, you\'re doing <strong>work</strong> on the gas. Your hand\'s kinetic energy ' +
          'transfers to the gas particles — they bounce off the moving piston faster than they arrived. ' +
          'If the gas can\'t shed that energy (insulated container), the temperature rises.'
        }),
        new CalloutBlock({ id: '62-energy-callout', html:
          '<strong>Connection to Lesson 5.1:</strong> This is the First Law in action. You do work on the gas → ' +
          'particle KE increases → temperature rises. A diesel engine ignites fuel this way: ' +
          'compressing air so hard it gets hot enough (~550°C) to ignite diesel fuel without a spark plug.'
        }),
      ]
    },

    /* --- Forward Tease --- */
    {
      id: 'sec-62-next',
      blocks: [
        new TextBlock({ id: '62-next-title', tag: 'h2', html: "⏭️ Coming Up: Charles's Law" }),
        new TextBlock({ id: '62-next-p1', tag: 'p', html:
          'Today you held temperature constant and varied volume. In Lesson 6.3, we\'ll flip it: ' +
          'hold pressure constant and vary temperature. How much does a gas expand when you heat it? ' +
          'The answer — Charles\'s Law — is beautifully simple and leads to the concept of <strong>absolute zero</strong>.'
        }),
      ]
    },
  ],

  // CRITICAL: 27 entries must exactly match buildSteps() array length
  stepMeta: [
    { icon: '🔄', label: 'Recall: 3 knobs',     kind: 'narrate' },    // 0
    { icon: '❓', label: 'Quiz: KE & collisions', kind: 'quiz' },       // 1
    null,                                                                 // 2  pause
    { icon: '💉', label: 'Syringe story',        kind: 'narrate' },    // 3
    { icon: '💉', label: 'The pattern',          kind: 'narrate' },    // 4
    { icon: '❓', label: 'Quiz: predict P',       kind: 'quiz' },       // 5
    null,                                                                 // 6  pause
    { icon: '📐', label: "Boyle's Law",          kind: 'narrate' },    // 7
    { icon: '📐', label: 'Why it works',         kind: 'narrate' },    // 8
    { icon: '❓', label: 'Quiz: calculate V₂',    kind: 'quiz' },       // 9
    null,                                                                 // 10 pause
    { icon: '🔬', label: 'Worked: scuba',        kind: 'narrate' },    // 11
    { icon: '❓', label: 'Quiz: reverse calc',    kind: 'quiz' },       // 12
    null,                                                                 // 13 pause
    { icon: '🎮', label: 'Sim intro',            kind: 'narrate' },    // 14
    { icon: '🏁', label: 'Try: compress',        kind: 'checkpoint' }, // 15
    { icon: '❓', label: 'Quiz: PV product',      kind: 'quiz' },       // 16
    null,                                                                 // 17 pause
    { icon: '⚠️', label: 'Real gases',           kind: 'narrate' },    // 18
    { icon: '❓', label: 'Quiz: IMFs & gases',    kind: 'quiz' },       // 19
    null,                                                                 // 20 pause
    { icon: '⚡', label: 'Compression & work',   kind: 'narrate' },    // 21
    { icon: '❓', label: 'Quiz: diesel engine',   kind: 'quiz' },       // 22
    { icon: '❓', label: 'Quiz: stoich + gas',    kind: 'quiz' },       // 23
    null,                                                                 // 24 pause
    { icon: '❓', label: 'Quiz: mega-synthesis',  kind: 'quiz' },       // 25
    { icon: '⏭️', label: "Next: Charles's",      kind: 'narrate' },    // 26
  ],

  buildSteps(showSection, runner) {
    const simViz = runner.blockInstances.find(b => b.id === '62-sim-viz');

    return [
      // 0: Recall hook
      { type: 'show', action: () => showSection('sec-62-hook'),
        text: "In Lesson 6.1, you learned that gas pressure comes from particle collisions — and that three knobs control it: temperature, number of particles, and volume. Today we're going to do something specific: lock temperature and amount of gas in place, and see what happens when we change only the volume. This is one of the oldest and most elegant laws in chemistry." },

      // 1: Quiz — deep recall bridging 5.1 + 6.1
      { type: 'quiz',
        text: "Let's make sure the foundation is rock solid. This connects Lesson 5.1 and Lesson 6.1.",
        question: "A sealed container of gas is at 300 K. You keep the temperature exactly at 300 K while shrinking the container. The particles' average kinetic energy...",
        options: [
          "Increases, because they're squeezed into less space",
          "Decreases, because they have less room to move",
          "Stays the same, because temperature hasn't changed and KE depends only on temperature",
          "Doubles, because pressure doubles"
        ],
        correctIndex: 2,
        correctFeedback: "Exactly! Temperature = average KE (Lesson 5.1). If temperature doesn't change, average KE doesn't change. The pressure rises not because particles move faster, but because they hit the walls more often — shorter travel distance between collisions (Lesson 6.1).",
        wrongFeedback: "Remember: temperature IS average kinetic energy (5.1). If T stays the same, KE stays the same. Pressure rises from more frequent collisions, not harder ones." },

      // 2: pause
      { type: 'pause' },

      // 3: Syringe story
      { type: 'show', action: () => showSection('sec-62-syringe'),
        text: "Here's a concrete experiment. Take a plastic syringe — the kind you'd find in a science lab. Cap the end so no air can escape. Pull the plunger out to the 10 milliliter mark. You've just trapped a fixed amount of air at atmospheric pressure — 1 atm. Now push the plunger in to 5 milliliters. You've halved the volume. And the pressure? It doubles to 2 atm. You can feel the air pushing back against your thumb." },

      // 4: Pattern
      { type: 'narrate',
        text: "Push further to 2.5 milliliters? Pressure quadruples to 4 atm. One-quarter the volume, four times the pressure. See the pattern? Every time you halve the volume, the pressure doubles. It's an exact, inverse relationship." },

      // 5: Quiz — predict from concrete
      { type: 'quiz',
        text: "Use the pattern from the syringe.",
        question: "Starting at 10 mL and 1 atm, you compress to 2 mL. What's the new pressure?",
        options: [
          "2 atm",
          "5 atm",
          "10 atm",
          "0.2 atm"
        ],
        correctIndex: 1,
        correctFeedback: "You shrunk the volume by a factor of 5 (10 → 2), so pressure increases by a factor of 5: 1 atm × 5 = 5 atm. The product P × V = 10 in both cases.",
        wrongFeedback: "Volume went from 10 to 2 — that's ÷5. Pressure must go ×5 to compensate: 1 × 5 = 5 atm. Check: 1×10 = 5×2 = 10." },

      // 6: pause
      { type: 'pause' },

      // 7: Formalize
      { type: 'show', action: () => showSection('sec-62-law'),
        text: "Robert Boyle figured this out in 1662. At constant temperature and constant amount of gas, pressure times volume equals a constant. We write it as P₁V₁ equals P₂V₂. This means whatever the pressure and volume are before a change, their product equals the pressure and volume after the change." },

      // 8: Why it works — particle-level
      { type: 'narrate',
        text: "Why does this work at the particle level? Same number of particles, same speed — because temperature hasn't changed. But now they're in a smaller box. Each particle has to travel less distance before hitting a wall, so it hits walls more frequently. More hits per second equals more pressure. The total collision budget stays the same — you're just packing the same collisions into a smaller space, so each unit of wall area gets hammered more." },

      // 9: Quiz — calculation
      { type: 'quiz',
        text: "Time to use the formula.",
        question: "A gas occupies 6.0 L at 2.0 atm. It's compressed to 1.5 L at constant temperature. What's the new pressure?",
        options: [
          "0.5 atm",
          "4.0 atm",
          "8.0 atm",
          "12.0 atm"
        ],
        correctIndex: 2,
        correctFeedback: "P₂ = P₁V₁/V₂ = (2.0 × 6.0) / 1.5 = 8.0 atm. Volume quartered → pressure quadrupled. Boyle's Law in action!",
        wrongFeedback: "P₁V₁ = P₂V₂ → P₂ = (2.0 atm × 6.0 L) / 1.5 L = 8.0 atm." },

      // 10: pause
      { type: 'pause' },

      // 11: Worked example — scuba
      { type: 'show', action: () => showSection('sec-62-worked'),
        text: "Let's walk through a real-world problem. A scuba tank holds 12 liters of air compressed to 200 atmospheres. That's an enormous squeeze. If the diver opens the tank at the surface where pressure is 1 atmosphere, what volume does that air expand to? P₁V₁ = P₂V₂. V₂ = 200 times 12 divided by 1. That's 2,400 liters. Enough air to fill a small room — all crammed into a backpack-sized tank by extreme compression." },

      // 12: Quiz — reverse calculation + unit conversion (kPa from 6.1)
      { type: 'quiz',
        text: "Now you try one. This mixes Boyle's Law with the unit conversions from Lesson 6.1.",
        question: "A balloon contains 2.5 L of helium at 101.325 kPa. It rises to altitude where pressure is 50.66 kPa. What's the new volume? (Assume constant temperature.)",
        options: [
          "1.25 L",
          "2.5 L",
          "5.0 L",
          "10.0 L"
        ],
        correctIndex: 2,
        correctFeedback: "V₂ = P₁V₁/P₂ = (101.325 × 2.5) / 50.66 = 5.0 L. Pressure halved → volume doubled. Units don't matter as long as P₁ and P₂ match (both kPa here). And this is why weather balloons expand as they rise!",
        wrongFeedback: "P₁V₁ = P₂V₂ → V₂ = (101.325 × 2.5) / 50.66. Pressure roughly halved, so volume roughly doubles: 5.0 L." },

      // 13: pause
      { type: 'pause' },

      // 14: Sim intro
      { type: 'show', action: () => showSection('sec-62-sim'),
        text: "Now let's see Boyle's Law come alive. Below is a container with a movable piston on the right side. Drag the piston left to compress the gas, right to expand it. Watch three things: the pressure readout, the volume readout, and — critically — the P times V product. It should stay approximately constant no matter where you drag the piston. The graph on the right traces your path on a P-versus-V curve." },

      // 15: Checkpoint — compress and observe
      { type: 'checkpoint',
        instruction: 'Drag the piston left to compress the gas to less than half its volume. Watch P × V stay constant.',
        text: "Go ahead — grab the piston and squeeze the gas. Compress it down to less than half the original volume.",
        check: () => simViz?.renderer?.hasCompressed === true,
        checkInterval: 500,
        confirmText: "Beautiful. Did you see the pressure climb as the volume shrank — while P times V barely budged? That's Boyle's Law: the inverse relationship between P and V, keeping their product constant." },

      // 16: Quiz — PV product insight + moles connection (4.4)
      { type: 'quiz',
        text: "Here's a conceptual question that connects Boyle's Law to what you learned about moles in Lesson 4.4.",
        question: "Container A has 1 mole of gas: P = 4 atm, V = 3 L. Container B has 1 mole of the same gas: P = 2 atm, V = 6 L. Same temperature. Which has more total wall collisions per second?",
        options: [
          "Container A — it has higher pressure, so more collisions",
          "Container B — the particles have more room to build up speed",
          "They're equal — same gas, same moles, same temperature means the same total collision rate. Pressure differs because A's collisions are concentrated on less wall area",
          "Impossible to determine without knowing the gas identity"
        ],
        correctIndex: 2,
        correctFeedback: "This is the deep insight! P₁V₁ = P₂V₂ = 12. Same PV product, same moles, same temperature → same total collisions. Container A just has those collisions hitting a smaller area, so the pressure (force per area) is higher. The collision budget is identical.",
        wrongFeedback: "P×V is the same for both (4×3 = 2×6 = 12). Same moles, same temperature → same total collisions. The difference is area: smaller container = same collisions on less wall = higher pressure." },

      // 17: pause
      { type: 'pause' },

      // 18: Real gases — IMF connection
      { type: 'show', action: () => showSection('sec-62-real'),
        text: "Now, a reality check. Boyle's Law is beautifully simple but it assumes an ideal gas — particles with no size and no attraction to each other. Real molecules have both. At very high pressures, particles are crammed so close that their own physical volume matters — you can't compress a gas to zero volume. And at very low temperatures, particles slow down enough that those intermolecular forces from Lesson 4.2 start to matter." },

      // 19: Quiz — IMFs, polarity, gas behavior (4.1, 4.2)
      { type: 'quiz',
        text: "This question threads together bonding (4.1), molecular shape and IMFs (4.2), and gas behavior.",
        question: "Two gases are cooled toward their boiling points: NH₃ (polar, hydrogen bonding) and N₂ (nonpolar, London dispersion only). Which gas will deviate from Boyle's Law first (at a higher temperature) and why?",
        options: [
          "N₂ — nonpolar molecules are more compressible",
          "NH₃ — its strong hydrogen bonds pull molecules together before they hit the walls, reducing pressure below what Boyle predicts",
          "Both deviate at the same point — molecular identity doesn't matter for gas laws",
          "Neither deviates — Boyle's Law is exact for all gases"
        ],
        correctIndex: 1,
        correctFeedback: "NH₃ has strong hydrogen bonds (N—H···N, from Lesson 4.2). As temperature drops, particles slow down and those H-bonds become significant — molecules pull each other instead of hitting walls freely. This reduces pressure below Boyle's prediction. N₂ has only weak London forces, so it behaves ideally to much lower temperatures.",
        wrongFeedback: "Think about IMF strength from 4.2: NH₃ has hydrogen bonding (strong), N₂ has only London dispersion (weak). Stronger IMFs mean molecules attract each other more — reducing wall collisions and making the gas deviate from ideal behavior sooner." },

      // 20: pause
      { type: 'pause' },

      // 21: Energy connection — compression and work
      { type: 'show', action: () => showSection('sec-62-energy'),
        text: "Here's something that connects Boyle's Law back to Module 5. When you push the piston inward, you're doing work on the gas. Your hand exerts a force over a distance — that's the physics definition of work. Where does that energy go? Into the gas particles. They bounce off the moving piston faster than they arrived — like a tennis ball hitting a racket that's swinging forward. If the container is insulated, that extra kinetic energy raises the temperature." },

      // 22: Quiz — energy, First Law, diesel (5.1 + 4.3)
      { type: 'quiz',
        text: "This one combines compression with the First Law of Thermodynamics (5.1) and reaction energy (4.3).",
        question: "In a diesel engine, air is compressed to about 1/20th of its original volume. The air temperature rises from 25°C to ~550°C — hot enough to ignite fuel without a spark. Why does compressing a gas raise its temperature?",
        options: [
          "The pressure increase causes friction between gas molecules, generating heat",
          "Compressing the gas forces an exothermic chemical reaction between gas molecules",
          "Work done on the gas transfers energy to particles — they bounce off the moving piston faster (higher KE), and since temperature = average KE, temperature rises",
          "The metal cylinder heats up from friction with the piston and transfers heat to the gas"
        ],
        correctIndex: 2,
        correctFeedback: "The First Law (5.1) says energy is conserved. Work done ON the gas → increases particle KE → since temperature IS average KE → temperature rises. No chemistry needed — it's purely mechanical energy becoming thermal energy. Diesel engines exploit this beautifully: compress enough and the air gets hot enough to ignite fuel (an exothermic combustion reaction from 4.3) all by itself.",
        wrongFeedback: "Remember the First Law from 5.1: energy in = energy out. Pushing the piston does work on the gas. That work becomes kinetic energy of the particles. Since temperature = average KE (5.1), the temperature rises." },

      // 23: Quiz — stoichiometry + gas volumes (4.4 + 6.1 + 6.2)
      { type: 'quiz',
        text: "Here's a multi-chapter synthesis: stoichiometry from 4.4 meets gas behavior.",
        question: "The reaction 2H₂(g) + O₂(g) → 2H₂O(g) happens in a sealed, flexible container at constant T and P. Before the reaction: 2 L of H₂ and 1 L of O₂ (3 L total). After the reaction, all gas, what is the total volume?",
        options: [
          "3 L — volume is always conserved",
          "2 L — coefficients tell us: 3 moles of reactant gas produce 2 moles of product gas, and at constant T & P, volume is proportional to moles",
          "1 L — water is denser so it takes up less space",
          "6 L — the reaction releases energy which expands the gas"
        ],
        correctIndex: 1,
        correctFeedback: "Brilliant! The coefficients (4.4) give mole ratios: 2 + 1 = 3 moles of reactant gas → 2 moles of product gas. At constant T and P, volume is directly proportional to moles (from 6.1: more particles = more pressure, so to keep P constant in a flexible container, volume adjusts). 3 moles became 2 → volume drops from 3 L to 2 L. Stoichiometry and gas laws working together!",
        wrongFeedback: "Count moles using coefficients (4.4): 2 mol H₂ + 1 mol O₂ = 3 mol gas → 2 mol H₂O = 2 mol gas. At constant T and P, volume ∝ moles. 3 mol → 2 mol means volume goes from 3 L → 2 L." },

      // 24: pause
      { type: 'pause' },

      // 25: Quiz — mega synthesis (5.2 q=mcΔT + 5.3 calorimetry + 4.4 moles + 6.1 pressure)
      { type: 'quiz',
        text: "Final challenge. This pulls from five different lessons: specific heat (5.2), calorimetry (5.3), moles (4.4), pressure (6.1), and Boyle's Law (6.2).",
        question: "An exothermic reaction in a sealed, rigid 5.0 L container releases 8,360 J of heat into 1,000 g of gas (c = 1.0 J/g·°C) at an initial temperature of 25°C. The initial pressure is 2.0 atm. After the reaction, the gas temperature rises. Assuming the gas behaves ideally and pressure is proportional to temperature (in Kelvin): what is the approximate final pressure?",
        options: [
          "2.0 atm — pressure doesn't change in a rigid container",
          "About 2.06 atm — temperature rises ~8.4°C (to ~306 K), and P ∝ T gives P₂ = 2.0 × 306/298",
          "4.0 atm — the energy release doubles the pressure",
          "About 2.56 atm — ΔT = 8,360 / (1000 × 1.0) = 8.36°C, new T = 33.36°C = 306.5 K, P₂ = 2.0 × 306.5/298.15"
        ],
        correctIndex: 3,
        correctFeedback: "Outstanding! You chained five concepts: (1) q = mcΔT (5.2) → ΔT = 8,360 / (1000 × 1.0) = 8.36°C. (2) New temp = 25 + 8.36 = 33.36°C = 306.5 K. (3) Rigid container = constant volume (no Boyle's Law change). (4) From 6.1: at constant V and n, P ∝ T. (5) P₂ = 2.0 × (306.5/298.15) ≈ 2.056 atm. Note: option B was close but used rounded values. The key insight is that Boyle's Law doesn't directly apply here (volume is constant!) — instead you need the temperature-pressure relationship from 6.1.",
        wrongFeedback: "Chain the steps: (1) Use q = mcΔT from 5.2 to find ΔT = 8360/(1000×1.0) = 8.36°C. (2) Convert to Kelvin: 25 + 273.15 = 298.15 K → 306.5 K. (3) Rigid container means constant volume, so use P ∝ T from 6.1: P₂ = 2.0 × (306.5/298.15) ≈ 2.06 atm." },

      // 26: Tease next
      { type: 'show', action: () => showSection('sec-62-next'),
        text: "That last problem was a monster — you just chained specific heat, calorimetry, moles, pressure, and gas laws all in one problem. That's real chemistry. In Lesson 6.3, we'll explore Charles's Law — what happens when you hold pressure constant and change the temperature. It leads to one of the most profound ideas in science: absolute zero, the temperature where particle motion stops. See you there!" },
    ];
  },
};
