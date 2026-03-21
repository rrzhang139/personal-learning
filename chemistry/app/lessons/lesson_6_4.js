/**
 * Lesson 6.4 — The Ideal Gas Law (PV = nRT)
 *
 * Atomic concept: One master equation unifies Boyle's, Charles's, and Avogadro's
 * principle. Given any three of P, V, n, T, compute the fourth.
 *
 * Prereqs actively used: Boyle's P₁V₁=P₂V₂ (6.2), Charles's V₁/T₁=V₂/T₂ (6.3),
 * pressure from collisions (6.1), temperature = avg KE (5.1), moles & molar mass (4.4),
 * IMFs & real vs ideal (4.2), q = mcΔT (5.2), stoichiometry (4.4),
 * exo/endo & activation energy (4.3), Hess's Law (5.4)
 *
 * Sim: gasIdealViz — four sliders (P, V, n, T), pick which to solve for,
 * live PV=nRT verification, particle visualization
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';
import '../sims/gasIdealViz.js';

export const lesson_6_4 = {
  id: '6.4',
  lessonId: 'lesson_6_4',
  title: 'The Ideal Gas Law',

  sections: [
    /* --- Recall Hook --- */
    {
      id: 'sec-64-hook',
      blocks: [
        new TextBlock({ id: '64-hook-title', tag: 'h2', html: '🔄 Three Laws, One Pattern' }),
        new CalloutBlock({ id: '64-hook-recall', html:
          '<strong>You now have three pieces of the puzzle:</strong><br>' +
          '• <strong>Boyle (6.2):</strong> P × V = constant (at fixed T, n)<br>' +
          '• <strong>Charles (6.3):</strong> V / T = constant (at fixed P, n)<br>' +
          '• <strong>Avogadro:</strong> V / n = constant (at fixed T, P) — equal moles occupy equal volumes<br><br>' +
          'What if we stop holding things constant and let <em>everything</em> change at once?'
        }),
      ]
    },

    /* --- Story: Unification --- */
    {
      id: 'sec-64-story',
      blocks: [
        new TextBlock({ id: '64-story-title', tag: 'h2', html: '🧩 The Master Equation' }),
        new TextBlock({ id: '64-story-p1', tag: 'p', html:
          'Each gas law is a special case of one unifying equation. Boyle says PV = k₁. Charles says V/T = k₂. ' +
          'Avogadro says V/n = k₃. Combine them: V is proportional to nT/P. Add a proportionality constant R, and you get:'
        }),
        new MathBlock({ id: '64-story-math', label: 'The Ideal Gas Law:', equation: 'PV = nRT', symbols: [
          { symbol: 'P', name: 'Pressure', meaning: 'gas pressure', units: 'atm (or kPa, Pa)' },
          { symbol: 'V', name: 'Volume', meaning: 'container volume', units: 'liters (L)' },
          { symbol: 'n', name: 'Amount', meaning: 'moles of gas', units: 'mol' },
          { symbol: 'R', name: 'Gas constant', meaning: 'universal constant linking all four variables', units: '0.08206 L·atm/(mol·K)' },
          { symbol: 'T', name: 'Temperature', meaning: 'absolute temperature', units: 'Kelvin (K) — always!' },
        ]}),
        new CalloutBlock({ id: '64-story-R', html:
          '<strong>R = 0.08206 L·atm/(mol·K)</strong> when using liters and atmospheres. ' +
          'If using kPa: R = 8.314 L·kPa/(mol·K). Same number, different units. ' +
          'Match your R to your pressure units!'
        }),
      ]
    },

    /* --- How It Contains the Others --- */
    {
      id: 'sec-64-contains',
      blocks: [
        new TextBlock({ id: '64-cont-title', tag: 'h2', html: '🔍 One Equation, Three Laws Inside' }),
        new TableBlock({ id: '64-cont-table',
          headers: ['Hold constant...', 'PV = nRT becomes...', 'Which is...'],
          rows: [
            ['T and n', 'PV = constant', "Boyle's Law (6.2)"],
            ['P and n', 'V/T = constant (= nR/P)', "Charles's Law (6.3)"],
            ['T and P', 'V/n = constant (= RT/P)', "Avogadro's Principle"],
            ['V and n', 'P/T = constant (= nR/V)', "Gay-Lussac's Law (from 6.3 quiz!)"],
          ]
        }),
        new CalloutBlock({ id: '64-cont-callout', html:
          'Every gas law you\'ve learned is just PV = nRT with some variables frozen. ' +
          'The ideal gas law is the full picture.'
        }),
      ]
    },

    /* --- Worked Example --- */
    {
      id: 'sec-64-worked',
      blocks: [
        new TextBlock({ id: '64-work-title', tag: 'h2', html: '🔬 Worked Example: How Many Moles in a Room?' }),
        new TextBlock({ id: '64-work-p1', tag: 'p', html:
          '<strong>Problem:</strong> Your room is 30 m³ (= 30,000 L) at 1.0 atm and 20°C. How many moles of air are in it?'
        }),
        new TextBlock({ id: '64-work-p2', tag: 'p', html:
          '<strong>Step 1:</strong> Convert temperature: 20°C + 273 = 293 K<br>' +
          '<strong>Step 2:</strong> Rearrange: n = PV / RT<br>' +
          '<strong>Step 3:</strong> n = (1.0 × 30,000) / (0.08206 × 293) = 30,000 / 24.04 = <strong>1,248 mol</strong><br>' +
          '<strong>Step 4:</strong> That\'s 1,248 × 6.022 × 10²³ ≈ 7.5 × 10²⁶ molecules of air. In one room!'
        }),
      ]
    },

    /* --- Simulation --- */
    {
      id: 'sec-64-sim',
      blocks: [
        new TextBlock({ id: '64-sim-title', tag: 'h2', html: '🎮 The Four-Knob Dashboard' }),
        new TextBlock({ id: '64-sim-p1', tag: 'p', html:
          'Four sliders: P, V, n, T. Click "Solve ___" to choose which variable the equation computes. ' +
          'Adjust the other three and watch the computed one respond. The bottom shows PV vs nRT — they should always match. ' +
          'The container resizes with volume, particle count scales with moles, and speed scales with temperature.'
        }),
        new SimBlock({ id: '64-sim-viz', sim: 'gasIdealViz', width: 900, height: 420, simOptions: {} }),
      ]
    },

    /* --- Molar Volume at STP --- */
    {
      id: 'sec-64-stp',
      blocks: [
        new TextBlock({ id: '64-stp-title', tag: 'h2', html: '📏 STP and the Magic Number: 22.4 L' }),
        new TextBlock({ id: '64-stp-p1', tag: 'p', html:
          '<strong>Standard Temperature and Pressure (STP):</strong> 0°C (273.15 K) and 1 atm. ' +
          'At STP, 1 mole of any ideal gas occupies exactly:'
        }),
        new MathBlock({ id: '64-stp-math', label: 'Molar volume at STP:', equation: 'V = nRT/P = (1)(0.08206)(273.15)/1 = 22.4 L', symbols: [
          { symbol: '22.4 L/mol', name: 'Molar volume', meaning: '1 mole of any ideal gas at STP', units: 'liters' },
        ]}),
        new CalloutBlock({ id: '64-stp-callout', html:
          '<strong>Any gas!</strong> 1 mol H₂ (2 g), 1 mol O₂ (32 g), 1 mol CO₂ (44 g) — all occupy 22.4 L at STP. ' +
          'The identity of the gas doesn\'t matter. Why? Because ideal gas behavior depends only on particle count and speed, ' +
          'not on what the particles <em>are</em>. That\'s the beauty of PV = nRT.'
        }),
      ]
    },

    /* --- Stoichiometry with Gases --- */
    {
      id: 'sec-64-stoich',
      blocks: [
        new TextBlock({ id: '64-stoich-title', tag: 'h2', html: '⚗️ Gas Stoichiometry: From Grams to Liters' }),
        new TextBlock({ id: '64-stoich-p1', tag: 'p', html:
          'The ideal gas law bridges <strong>stoichiometry (4.4)</strong> and gas behavior. The chain:<br>' +
          '<code>grams → ÷ molar mass → moles → PV=nRT → volume (or pressure)</code><br>' +
          'Now you can predict how much gas a reaction produces — in liters!'
        }),
        new TextBlock({ id: '64-stoich-ex', tag: 'p', html:
          '<strong>Example:</strong> 2 KClO₃(s) → 2 KCl(s) + 3 O₂(g). You decompose 24.5 g KClO₃ (M = 122.5 g/mol). ' +
          'How many liters of O₂ at STP?<br>' +
          '• n(KClO₃) = 24.5 / 122.5 = 0.200 mol<br>' +
          '• Ratio: 3 mol O₂ per 2 mol KClO₃ → n(O₂) = 0.200 × 3/2 = 0.300 mol<br>' +
          '• V = 0.300 × 22.4 = <strong>6.72 L of O₂ at STP</strong>'
        }),
      ]
    },

    /* --- Real Gas Limitations --- */
    {
      id: 'sec-64-real',
      blocks: [
        new TextBlock({ id: '64-real-title', tag: 'h2', html: '⚠️ When PV = nRT Fails — and Why It Matters for Materials' }),
        new TextBlock({ id: '64-real-p1', tag: 'p', html:
          'PV = nRT assumes ideal behavior: point-like particles with no intermolecular forces. Real gases deviate when:'
        }),
        new TableBlock({ id: '64-real-table',
          headers: ['Condition', 'What happens', 'Why (from prior lessons)'],
          rows: [
            ['High pressure', 'Particle volume matters — gas compresses less than predicted', 'Atoms have physical size (2.1)'],
            ['Low temperature', 'IMFs pull particles together — pressure drops below predicted', 'London forces, dipole-dipole, H-bonding (4.2)'],
            ['Near boiling point', 'Gas starts condensing into liquid — gas law breaks down completely', 'IMFs overcome KE (4.2 + 5.1)'],
          ]
        }),
        new CalloutBlock({ id: '64-real-mat', html:
          '<strong>Materials science preview:</strong> In Module 7, you\'ll study what happens when gases ' +
          '<em>do</em> condense — how IMFs create liquids, and how atomic packing creates crystals. ' +
          'The ideal gas law is where gas behavior ends and solid-state behavior begins. That boundary is everything in materials science.'
        }),
      ]
    },

    /* --- Forward Tease --- */
    {
      id: 'sec-64-next',
      blocks: [
        new TextBlock({ id: '64-next-title', tag: 'h2', html: '⏭️ What\'s Next' }),
        new TextBlock({ id: '64-next-p1', tag: 'p', html:
          'You\'ve conquered the gas laws — from pressure (6.1) through Boyle\'s (6.2), Charles\'s (6.3), ' +
          'to the full ideal gas law (6.4). You can now calculate pressure, volume, temperature, or moles for any ideal gas. ' +
          'Next we\'ll cross a critical threshold: <strong>Module 7 — Liquids, Solids, and Phase Changes</strong>. ' +
          'What happens when you cool a gas enough that IMFs win? How do atoms pack into crystals? ' +
          'That\'s the bridge from chemistry to materials science.'
        }),
      ]
    },
  ],

  // 29 entries
  stepMeta: [
    { icon: '🔄', label: 'Recall: 3 laws',       kind: 'narrate' },    // 0
    { icon: '❓', label: 'Quiz: Avogadro recall',  kind: 'quiz' },       // 1
    null,                                                                  // 2
    { icon: '🧩', label: 'Combine them',          kind: 'narrate' },    // 3
    { icon: '🧩', label: 'R explained',           kind: 'narrate' },    // 4
    { icon: '❓', label: 'Quiz: rearrange PV=nRT', kind: 'quiz' },       // 5
    null,                                                                  // 6
    { icon: '🔍', label: 'Contains all laws',     kind: 'narrate' },    // 7
    { icon: '❓', label: 'Quiz: which law?',        kind: 'quiz' },       // 8
    null,                                                                  // 9
    { icon: '🔬', label: 'Worked: room air',      kind: 'narrate' },    // 10
    { icon: '❓', label: 'Quiz: solve for T',       kind: 'quiz' },       // 11
    null,                                                                  // 12
    { icon: '🎮', label: 'Sim intro',             kind: 'narrate' },    // 13
    { icon: '🏁', label: 'Try: solve for each',   kind: 'checkpoint' }, // 14
    null,                                                                  // 15
    { icon: '📏', label: 'STP & 22.4 L',          kind: 'narrate' },    // 16
    { icon: '❓', label: 'Quiz: molar volume',      kind: 'quiz' },       // 17
    null,                                                                  // 18
    { icon: '⚗️', label: 'Gas stoichiometry',     kind: 'narrate' },    // 19
    { icon: '❓', label: 'Quiz: stoich+gas',        kind: 'quiz' },       // 20
    null,                                                                  // 21
    { icon: '⚠️', label: 'Real gas limits',       kind: 'narrate' },    // 22
    { icon: '❓', label: 'Quiz: IMFs+deviation',    kind: 'quiz' },       // 23
    null,                                                                  // 24
    { icon: '❓', label: 'Quiz: mega-synthesis',    kind: 'quiz' },       // 25
    { icon: '❓', label: 'Quiz: materials bridge',  kind: 'quiz' },       // 26
    null,                                                                  // 27
    { icon: '⏭️', label: 'Next: Module 7',         kind: 'narrate' },    // 28
  ],

  buildSteps(showSection, runner) {
    const simViz = runner.blockInstances.find(b => b.id === '64-sim-viz');

    return [
      // 0: Recall hook
      { type: 'show', action: () => showSection('sec-64-hook'),
        text: "You've built three pieces of the gas law puzzle. Boyle's Law from 6.2: pressure times volume is constant when temperature and moles don't change. Charles's Law from 6.3: volume over temperature is constant when pressure and moles don't change. And there's one more piece you've been using implicitly: Avogadro's principle — at the same temperature and pressure, equal volumes of gas contain equal numbers of moles. What if we combine all three into one master equation?" },

      // 1: Quiz — Avogadro + moles (4.4) + 6.1 pressure
      { type: 'quiz',
        text: "Avogadro's principle connects directly to moles from Lesson 4.4 and pressure from 6.1.",
        question: "At the same T and P, Container A holds 1 mole of O₂ and Container B holds 1 mole of H₂. O₂ molecules are 16× heavier than H₂. Which container has the larger volume?",
        options: [
          "Container A — heavier molecules take up more space",
          "Container B — lighter molecules move faster and spread out more",
          "They're equal — volume depends on number of moles, not molecular mass. Same moles at same T and P = same volume (Avogadro's principle)",
          "Impossible to tell without knowing the specific conditions"
        ],
        correctIndex: 2,
        correctFeedback: "That's Avogadro's profound insight! Gas volume depends on particle count (moles), not particle identity. 1 mole = 6.022 × 10²³ particles (4.4). Those particles generate pressure by hitting walls (6.1). At the same T, heavier molecules move slower but hit harder — the effects cancel. Same n, same T, same P → same V.",
        wrongFeedback: "Avogadro says: same n, same T, same P → same V, regardless of gas identity. Heavier molecules move slower but deliver more force per hit. These effects exactly cancel, so volume depends only on particle count." },

      // 2: pause
      { type: 'pause' },

      // 3: The master equation
      { type: 'show', action: () => showSection('sec-64-story'),
        text: "Here it is. PV equals nRT. Four variables — pressure, volume, moles, temperature — linked by one constant, R. The ideal gas constant R equals 0.08206 liter-atmospheres per mole-Kelvin. This single equation contains every gas law you've learned. It's the master key." },

      // 4: R value and units
      { type: 'narrate',
        text: "The value of R depends on your units. Using liters and atmospheres? R is 0.08206. Using liters and kilopascals? R is 8.314. Using SI units exclusively — cubic meters and pascals — R is also 8.314 but in different units. The number 8.314 shows up everywhere in chemistry. It's the universal gas constant. For our problems, we'll mostly use 0.08206 with liters and atmospheres — just make sure your pressure units match your R." },

      // 5: Quiz — rearrangement
      { type: 'quiz',
        text: "PV = nRT has four variables. You need to be able to solve for any one.",
        question: "You know P, n, and T for a gas and need to find V. Which rearrangement is correct?",
        options: [
          "V = PnRT",
          "V = nRT / P",
          "V = P / nRT",
          "V = nR / PT"
        ],
        correctIndex: 1,
        correctFeedback: "PV = nRT → V = nRT/P. Divide both sides by P. This is the form you'll use most often — given conditions, find the volume.",
        wrongFeedback: "Start with PV = nRT. To isolate V, divide both sides by P: V = nRT / P." },

      // 6: pause
      { type: 'pause' },

      // 7: Contains all laws
      { type: 'show', action: () => showSection('sec-64-contains'),
        text: "Look at this table. Hold T and n constant in PV = nRT, and the right side becomes a constant — so PV equals a constant. That's Boyle's Law. Hold P and n constant? Then V over T equals nR over P, a constant — Charles's Law. Hold T and P constant? V over n equals RT over P — Avogadro. And hold V and n constant? P over T is constant — that's Gay-Lussac's Law, which you encountered in the rigid container quiz from Lesson 6.3. One equation, four laws." },

      // 8: Quiz — which law is which scenario?
      { type: 'quiz',
        text: "Let's make sure you can recognize which special case applies.",
        question: "A flexible balloon (constant P) is carried from a warm room (300 K) into a freezer (250 K). Same amount of gas. Which gas law describes the volume change, and what form of PV=nRT reduces to it?",
        options: [
          "Boyle's Law — PV = constant, because the balloon is flexible",
          "Charles's Law — V/T = constant (= nR/P), because P and n are constant while T changes",
          "Gay-Lussac's — P/T = constant, because it's a balloon",
          "Ideal Gas Law can't be simplified here — use PV=nRT directly"
        ],
        correctIndex: 1,
        correctFeedback: "Flexible balloon = constant pressure. Same gas = constant n. Only T changes. PV=nRT → V = (nR/P)T → V/T = nR/P = constant. That's Charles's Law from 6.3!",
        wrongFeedback: "Identify what's constant: flexible balloon → P constant. Same gas → n constant. PV=nRT with P and n constant → V/T = constant → Charles's Law." },

      // 9: pause
      { type: 'pause' },

      // 10: Worked example — air in a room
      { type: 'show', action: () => showSection('sec-64-worked'),
        text: "Let's calculate something tangible. Your room is about 30 cubic meters — that's 30,000 liters. At 1 atmosphere and 20 degrees Celsius, how many moles of air are in it? First, convert: 20 plus 273 is 293 Kelvin. Then n equals PV over RT: 1 times 30,000 divided by 0.08206 times 293. That's 30,000 divided by 24.04, which gives 1,248 moles. Multiply by Avogadro's number from Lesson 4.4: about 7.5 times 10 to the 26th molecules. In one room!" },

      // 11: Quiz — solve for T + unit conversion
      { type: 'quiz',
        text: "Now you solve one. Watch the units carefully.",
        question: "A 2.0 L container holds 0.50 mol of gas at 4.0 atm. What is the temperature?",
        options: [
          "T = PV/nR = (4.0 × 2.0)/(0.50 × 0.08206) = 195 K (about −78°C)",
          "T = nR/PV = (0.50 × 0.08206)/(4.0 × 2.0) = 0.005 K",
          "T = PVnR = 4.0 × 2.0 × 0.50 × 0.08206 = 0.328 K",
          "T = PV/R = 4.0 × 2.0 / 0.08206 = 97.5 K"
        ],
        correctIndex: 0,
        correctFeedback: "T = PV/(nR) = (4.0 × 2.0)/(0.50 × 0.08206) = 8.0/0.04103 = 195 K ≈ −78°C. That's the temperature of dry ice! Makes sense — high pressure in a small volume at low temperature.",
        wrongFeedback: "Rearrange PV = nRT → T = PV/(nR) = (4.0 × 2.0)/(0.50 × 0.08206) = 195 K." },

      // 12: pause
      { type: 'pause' },

      // 13: Sim intro
      { type: 'show', action: () => showSection('sec-64-sim'),
        text: "Now for the ultimate gas law toy. Four sliders control P, V, n, and T. Click a 'Solve' button to choose which variable the equation computes — the other three become adjustable. The container resizes with volume, particle count scales with moles, and particle speed scales with temperature. At the bottom, you'll see PV and nRT calculated side by side — they should always match. Try solving for each variable at least once." },

      // 14: Checkpoint — try solving for different variables
      { type: 'checkpoint',
        instruction: 'Click "Solve P", "Solve V", and "Solve T" buttons — try solving for at least 3 different variables.',
        text: "Explore! Switch which variable is computed, adjust the sliders, and watch everything stay balanced.",
        check: () => {
          const r = simViz?.renderer;
          if (!r) return false;
          const count = [r.hasSolvedForP, r.hasSolvedForV, r.hasSolvedForT, r.hasSolvedForN].filter(Boolean).length;
          return count >= 3;
        },
        checkInterval: 500,
        confirmText: "PV always equals nRT, no matter which variable you solve for. Four knobs, one equation, infinite combinations — but the relationship never breaks. That's the power of the ideal gas law." },

      // 15: pause
      { type: 'pause' },

      // 16: STP and molar volume
      { type: 'show', action: () => showSection('sec-64-stp'),
        text: "There's a shortcut worth knowing. At Standard Temperature and Pressure — 0 degrees Celsius, 1 atmosphere — 1 mole of any ideal gas occupies exactly 22.4 liters. Any gas! 1 mole of hydrogen weighing 2 grams, 1 mole of oxygen weighing 32 grams, 1 mole of CO₂ weighing 44 grams — all take up 22.4 liters at STP. The identity doesn't matter because ideal gas behavior depends only on particle count and kinetic energy, not on what the particles are." },

      // 17: Quiz — molar volume + molar mass (4.4)
      { type: 'quiz',
        text: "This connects molar volume to molar mass from Lesson 4.4.",
        question: "At STP, you collect 11.2 L of an unknown gas. Its mass is 22.0 g. What is the gas?",
        options: [
          "H₂ (M = 2 g/mol) — light gas",
          "CO₂ (M = 44 g/mol) — 11.2 L at STP = 0.5 mol, and 22.0/0.5 = 44 g/mol. It's CO₂!",
          "O₂ (M = 32 g/mol) — medium weight",
          "N₂ (M = 28 g/mol) — most common gas"
        ],
        correctIndex: 1,
        correctFeedback: "Beautiful chain! 11.2 L at STP ÷ 22.4 L/mol = 0.500 mol (using molar volume). Molar mass = 22.0 g ÷ 0.500 mol = 44.0 g/mol (using n = m/M from 4.4). M = 44 → CO₂. You just identified an unknown gas using gas laws + molar mass!",
        wrongFeedback: "Step 1: n = 11.2 L ÷ 22.4 L/mol = 0.500 mol. Step 2: M = mass/moles = 22.0/0.500 = 44.0 g/mol. That's CO₂ (12 + 16 + 16 = 44)." },

      // 18: pause
      { type: 'pause' },

      // 19: Gas stoichiometry
      { type: 'show', action: () => showSection('sec-64-stoich'),
        text: "Now the ideal gas law plugs into stoichiometry from Lesson 4.4 beautifully. The conversion chain: grams, divided by molar mass, gives moles. Use balanced equation coefficients for the mole ratio. Then moles times RT over P gives liters of gas. Here's an example: decompose 24.5 grams of potassium chlorate. Molar mass is 122.5 grams per mole, so that's 0.200 moles. The equation makes 3 moles of O₂ for every 2 moles of KClO₃, so 0.300 moles of O₂. At STP, 0.300 times 22.4 gives 6.72 liters." },

      // 20: Quiz — full stoichiometry + gas law (4.3 + 4.4 + 6.4)
      { type: 'quiz',
        text: "Your turn. This chains reaction balancing (4.3), stoichiometry (4.4), and the ideal gas law.",
        question: "Mg(s) + 2 HCl(aq) → MgCl₂(aq) + H₂(g). You react 4.86 g of Mg (M = 24.3 g/mol) with excess HCl at 25°C and 1.00 atm. What volume of H₂ gas is produced?",
        options: [
          "n(Mg) = 0.200 mol → n(H₂) = 0.200 mol (1:1 ratio) → V = nRT/P = 0.200 × 0.08206 × 298 / 1.00 = 4.89 L",
          "n(Mg) = 0.200 mol → n(H₂) = 0.400 mol (1:2 ratio) → V = 9.78 L",
          "n(Mg) = 0.200 mol → n(H₂) = 0.100 mol → V = 2.45 L",
          "V = 0.200 × 22.4 = 4.48 L (at STP)"
        ],
        correctIndex: 0,
        correctFeedback: "Full chain! (1) n(Mg) = 4.86/24.3 = 0.200 mol (4.4). (2) Balanced equation: 1 Mg → 1 H₂, so n(H₂) = 0.200 mol (4.3 coefficients). (3) V = nRT/P = 0.200 × 0.08206 × 298/1.00 = 4.89 L. Note: option D used STP (0°C), but the problem says 25°C — always use the actual conditions!",
        wrongFeedback: "Step by step: (1) n(Mg) = 4.86 ÷ 24.3 = 0.200 mol. (2) Ratio from equation: 1:1 for Mg:H₂ → 0.200 mol H₂. (3) Not at STP! Use PV=nRT: V = (0.200)(0.08206)(298)/1.00 = 4.89 L." },

      // 21: pause
      { type: 'pause' },

      // 22: Real gas limitations
      { type: 'show', action: () => showSection('sec-64-real'),
        text: "PV = nRT is powerful but it has limits. It assumes particles are point-like with no intermolecular forces. Real molecules have both volume and IMFs. At high pressures, particles are crammed together and their own size matters — the gas compresses less than PV = nRT predicts. At low temperatures, IMFs from Lesson 4.2 pull particles together, reducing pressure below predicted values. Near the boiling point, the gas condenses entirely. That transition — from gas to liquid to solid — is exactly where materials science begins." },

      // 23: Quiz — IMFs (4.2) + bond types (4.1) + gas deviation
      { type: 'quiz',
        text: "This threads IMFs (4.2), bond polarity (4.1), and ideal gas deviation.",
        question: "Rank these gases from MOST ideal to LEAST ideal behavior at the same T and P: He, H₂O, N₂, NH₃.",
        options: [
          "H₂O > NH₃ > N₂ > He (polar molecules are more ideal)",
          "He > N₂ > NH₃ > H₂O (fewer/weaker IMFs = more ideal)",
          "All gases behave identically — the ideal gas law doesn't depend on identity",
          "N₂ > He > NH₃ > H₂O (diatomic is most ideal)"
        ],
        correctIndex: 1,
        correctFeedback: "He: noble gas, zero dipole, weakest possible LDF (4.2) → most ideal. N₂: nonpolar, only LDF but more electrons than He. NH₃: polar + hydrogen bonding. H₂O: polar + strongest H-bonding (O—H, from 4.2) → most deviation. Stronger IMFs = particles attract each other more = more deviation from point-particle assumption.",
        wrongFeedback: "Think about IMF strength from 4.2: He has the weakest (tiny LDF only), H₂O has the strongest (H-bonding). Stronger IMFs → particles attract each other → deviate more from ideal (point-like, no attraction) assumption." },

      // 24: pause
      { type: 'pause' },

      // 25: Mega synthesis — q=mcΔT (5.2) + Hess's (5.4) + stoich (4.4) + ideal gas law
      { type: 'quiz',
        text: "Multi-chapter monster. This chains Hess's Law (5.4), stoichiometry (4.4), specific heat (5.2), and PV=nRT.",
        question: "An exothermic reaction produces 2.0 mol of CO₂(g) and releases 400 kJ of heat. The CO₂ enters a calorimeter containing 2,000 g of water (c = 4.18 J/g·°C) at 25°C. (a) What temperature does the water reach? (b) What volume does the 2.0 mol CO₂ occupy at 1 atm and the new water temperature (assume gas equilibrates)?",
        options: [
          "ΔT = 400,000/(2000×4.18) = 47.8°C → T = 72.8°C = 345.9 K → V = 2.0×0.08206×345.9/1 = 56.8 L",
          "ΔT = 400/(2000×4.18) = 0.048°C → T ≈ 25°C → V = 2.0×0.08206×298/1 = 48.9 L",
          "Can't solve — need to know the specific heat of CO₂",
          "ΔT = 400,000/(2000×4.18) = 47.8°C → T = 72.8°C → V = 2.0 × 22.4 = 44.8 L"
        ],
        correctIndex: 0,
        correctFeedback: "Brilliant chain! (1) q = 400 kJ = 400,000 J. (2) ΔT = q/(mc) = 400,000/(2,000 × 4.18) = 47.8°C (5.2). (3) Water temp = 25 + 47.8 = 72.8°C = 345.9 K. (4) CO₂ volume at that temp: V = nRT/P = 2.0 × 0.08206 × 345.9 / 1 = 56.8 L. Option D used 22.4 L/mol which is STP (0°C) — but the gas is at 72.8°C!",
        wrongFeedback: "Chain: (1) Convert kJ → J: 400 × 1000 = 400,000 J. (2) q=mcΔT → ΔT = 400,000/(2000×4.18) = 47.8°C. (3) T_final = 25 + 47.8 = 72.8°C = 345.9 K. (4) V = nRT/P = 2.0 × 0.08206 × 345.9 / 1.0 = 56.8 L." },

      // 26: Quiz — materials science bridge: gas → liquid → solid
      { type: 'quiz',
        text: "Final question. This bridges everything from Modules 4-6 and previews Module 7.",
        question: "You cool 1 mole of H₂O vapor from 400 K at 1 atm. Using PV=nRT, it should occupy V = (1)(0.08206)(400)/1 = 32.8 L. But when you actually cool it to 373 K (100°C), it condenses into liquid water occupying only 0.018 L (18 mL). Why is the ideal gas prediction (30.6 L at 373 K) wrong by a factor of 1,700?",
        options: [
          "The ideal gas law has a calculation error at 373 K",
          "Water is too heavy for the ideal gas law to work",
          "At 373 K and 1 atm, H₂O hits its boiling point. Strong hydrogen bonds (4.2) pull molecules together into a liquid phase where they touch — packing ~1,700× more densely than the gas. The ideal gas law assumes no IMFs, so it can't predict condensation",
          "The gas constant R has a different value for water vapor"
        ],
        correctIndex: 2,
        correctFeedback: "This is THE bridge to materials science! The ideal gas law works great until IMFs (4.2) overwhelm kinetic energy (5.1). At 373 K, H₂O's strong H-bonds pull molecules into a liquid where they're essentially touching — 1,700× denser than the gas phase. Understanding this transition — gas → liquid → solid — and how IMFs determine which phase wins at which temperature is Module 7's entire mission.",
        wrongFeedback: "At 100°C, H₂O condenses. The strong H-bonds from 4.2 pull slowed molecules together into a liquid where they essentially touch. Liquid water is ~1,700× denser than steam. PV=nRT can't predict this because it assumes zero IMFs." },

      // 27: pause
      { type: 'pause' },

      // 28: Tease Module 7
      { type: 'show', action: () => showSection('sec-64-next'),
        text: "That final question is your gateway to what comes next. You've mastered gas behavior — pressure, Boyle's Law, Charles's Law, and now the ideal gas law. You can calculate any gas property from any three others. But the real world doesn't stop at gases. When you cool a gas enough, IMFs win and it becomes a liquid. Cool it more and atoms lock into fixed positions — a solid. How atoms arrange themselves in solids — crystal structures, unit cells, metallic vs ionic vs covalent networks — that's materials science. Module 7 starts at that boundary. See you there." },
    ];
  },
};
