/**
 * Lesson 6.1 — Gas Pressure
 *
 * Atomic concept: Pressure is the force gas particles exert on container walls
 * per unit area, driven by particle collisions.
 *
 * Prereqs used: temperature = avg KE (5.1), particle motion (1.4), moles (4.4)
 * Sim: gasPressureViz — particles in a box with temperature/particle controls + pressure gauge
 */

import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';
import '../sims/gasPressureViz.js';

export const lesson_6_1 = {
  id: '6.1',
  lessonId: 'lesson_6_1',
  title: 'Gas Pressure',

  sections: [
    /* --- Recall Hook --- */
    {
      id: 'sec-61-hook',
      blocks: [
        new TextBlock({ id: '61-hook-title', tag: 'h2', html: '🔄 What Makes Gas Particles Move?' }),
        new CalloutBlock({ id: '61-hook-recall', html:
          '<strong>Recall from Lesson 5.1:</strong> Temperature measures the <em>average kinetic energy</em> of particles. ' +
          'Higher temperature → particles move faster. In a gas, particles fly freely in all directions, ' +
          'constantly colliding with each other and with the walls of their container.'
        }),
      ]
    },

    /* --- Story: The Balloon --- */
    {
      id: 'sec-61-balloon',
      blocks: [
        new TextBlock({ id: '61-balloon-title', tag: 'h2', html: '🎈 Billions of Tiny Punches' }),
        new TextBlock({ id: '61-balloon-p1', tag: 'p', html:
          'Imagine holding an inflated balloon. It feels firm — something is pushing outward from the inside. ' +
          'That "something" is gas. Billions of nitrogen and oxygen molecules are rocketing around inside, ' +
          'slamming into the rubber wall at hundreds of meters per second.'
        }),
        new TextBlock({ id: '61-balloon-p2', tag: 'p', html:
          'Each individual collision is tiny — far too small to feel. But billions of collisions every microsecond ' +
          'add up to a steady, measurable <strong>force</strong> pushing outward on every square centimeter of the balloon\'s surface.'
        }),
      ]
    },

    /* --- Define Pressure --- */
    {
      id: 'sec-61-define',
      blocks: [
        new TextBlock({ id: '61-def-title', tag: 'h2', html: '📐 Pressure = Force ÷ Area' }),
        new TextBlock({ id: '61-def-p1', tag: 'p', html:
          'We call this combined push <strong>pressure</strong>. Pressure is defined as the amount of force ' +
          'applied per unit of area:'
        }),
        new MathBlock({ id: '61-def-math', label: 'Pressure:', equation: 'P = F / A', symbols: [
          { symbol: 'P', name: 'Pressure', meaning: 'force per unit area', units: 'pascals (Pa)' },
          { symbol: 'F', name: 'Force', meaning: 'total force from particle collisions', units: 'newtons (N)' },
          { symbol: 'A', name: 'Area', meaning: 'surface area the force acts on', units: 'square meters (m²)' },
        ]}),
        new CalloutBlock({ id: '61-def-callout', html:
          '<strong>Key idea:</strong> Same force, smaller area → higher pressure. ' +
          'That\'s why a needle pokes through fabric but your finger doesn\'t — same force, much less area.'
        }),
      ]
    },

    /* --- Simulation --- */
    {
      id: 'sec-61-sim',
      blocks: [
        new TextBlock({ id: '61-sim-title', tag: 'h2', html: '🎮 See Pressure in Action' }),
        new TextBlock({ id: '61-sim-intro', tag: 'p', html:
          'Below is a container full of gas particles. The walls flash cyan when particles collide with them. ' +
          'The gauge on the right shows the pressure — calculated from how often particles hit the walls.'
        }),
        new SimBlock({ id: '61-sim-viz', sim: 'gasPressureViz', width: 900, height: 420, simOptions: { temperature: 300, numParticles: 60 } }),
      ]
    },

    /* --- Units --- */
    {
      id: 'sec-61-units',
      blocks: [
        new TextBlock({ id: '61-units-title', tag: 'h2', html: '📏 Units of Pressure' }),
        new TextBlock({ id: '61-units-p1', tag: 'p', html:
          'Pressure is measured in several units depending on the context. The SI unit is the <strong>pascal (Pa)</strong>, ' +
          'but in chemistry you\'ll often see atmospheres (atm) or kilopascals (kPa).'
        }),
        new TableBlock({ id: '61-units-table',
          headers: ['Unit', 'Symbol', 'Equivalent to 1 atm', 'Where you\'ll see it'],
          rows: [
            ['Pascal',           'Pa',    '101,325 Pa',    'SI standard, physics'],
            ['Kilopascal',       'kPa',   '101.325 kPa',   'Chemistry textbooks'],
            ['Atmosphere',       'atm',   '1 atm',          'Chemistry (standard pressure)'],
            ['mmHg (torr)',      'mmHg',  '760 mmHg',       'Medicine, barometers'],
          ]
        }),
        new CalloutBlock({ id: '61-units-callout', html:
          '<strong>Quick convert:</strong> 1 atm = 101.325 kPa = 101,325 Pa = 760 mmHg. ' +
          'For most chemistry problems, you only need atm and kPa.'
        }),
      ]
    },

    /* --- Atmospheric Pressure --- */
    {
      id: 'sec-61-atm',
      blocks: [
        new TextBlock({ id: '61-atm-title', tag: 'h2', html: '🌍 The Ocean of Air Above You' }),
        new TextBlock({ id: '61-atm-p1', tag: 'p', html:
          'Right now, there\'s a column of air stretching from your head all the way to the edge of space — about 100 km. ' +
          'All that air has weight, and it\'s pressing down on you. That\'s <strong>atmospheric pressure</strong>.'
        }),
        new TextBlock({ id: '61-atm-p2', tag: 'p', html:
          'At sea level, atmospheric pressure is about <strong>1 atm</strong> (101.325 kPa). ' +
          'You don\'t feel it because the pressure inside your body pushes outward equally. ' +
          'But go up a mountain — less air above you — and the pressure drops. That\'s why your ears pop on a plane.'
        }),
      ]
    },

    /* --- What Controls Pressure --- */
    {
      id: 'sec-61-factors',
      blocks: [
        new TextBlock({ id: '61-factors-title', tag: 'h2', html: '🔧 Three Knobs That Control Gas Pressure' }),
        new TextBlock({ id: '61-factors-p1', tag: 'p', html:
          'Now that you understand pressure comes from particle collisions, you can predict what makes it go up or down:'
        }),
        new TableBlock({ id: '61-factors-table',
          headers: ['Change', 'Effect on collisions', 'Pressure'],
          rows: [
            ['↑ Temperature', 'Particles move faster → hit walls harder & more often', '↑ Increases'],
            ['↑ Number of particles', 'More particles → more collisions per second', '↑ Increases'],
            ['↓ Volume (smaller container)', 'Less space → particles hit walls more often', '↑ Increases'],
          ]
        }),
        new CalloutBlock({ id: '61-factors-callout', html:
          '<strong>Preview:</strong> These three relationships are exactly what the gas laws (Boyle\'s, Charles\'s, ' +
          'Avogadro\'s) describe quantitatively. You\'ll meet them in the next lessons!'
        }),
      ]
    },

    /* --- Next --- */
    {
      id: 'sec-61-next',
      blocks: [
        new TextBlock({ id: '61-next-title', tag: 'h2', html: '⏭️ Coming Up: Boyle\'s Law' }),
        new TextBlock({ id: '61-next-p1', tag: 'p', html:
          'You now know that pressure, volume, temperature, and the amount of gas are all connected. ' +
          'In Lesson 6.2, we\'ll explore the first gas law — <strong>Boyle\'s Law</strong> — which tells you ' +
          'exactly how pressure and volume are related when temperature stays constant. Spoiler: squeeze the container, ' +
          'and the pressure goes up. But by how much?'
        }),
      ]
    },
  ],

  // CRITICAL: length must exactly match buildSteps() return array length
  stepMeta: [
    { icon: '🔄', label: 'Recall: KE',       kind: 'narrate' },    // 0
    { icon: '❓', label: 'Quiz: KE recall',   kind: 'quiz' },       // 1
    null,                                                             // 2  pause
    { icon: '🎈', label: 'Balloon story',     kind: 'narrate' },    // 3
    { icon: '🎈', label: 'Collisions',        kind: 'narrate' },    // 4
    { icon: '❓', label: 'Quiz: cause',        kind: 'quiz' },       // 5
    null,                                                             // 6  pause
    { icon: '📐', label: 'P = F/A',           kind: 'narrate' },    // 7
    { icon: '📐', label: 'Needle analogy',    kind: 'narrate' },    // 8
    { icon: '❓', label: 'Quiz: calculate',    kind: 'quiz' },       // 9
    null,                                                             // 10 pause
    { icon: '🎮', label: 'Sim intro',         kind: 'narrate' },    // 11
    { icon: '🎮', label: 'Sim explain',       kind: 'narrate' },    // 12
    { icon: '🏁', label: 'Try: heat gas',     kind: 'checkpoint' }, // 13
    null,                                                             // 14 pause
    { icon: '📏', label: 'Units',             kind: 'narrate' },    // 15
    { icon: '❓', label: 'Quiz: convert',      kind: 'quiz' },       // 16
    null,                                                             // 17 pause
    { icon: '🌍', label: 'Atmosphere',        kind: 'narrate' },    // 18
    { icon: '🌍', label: 'Ears pop',          kind: 'narrate' },    // 19
    { icon: '❓', label: 'Quiz: altitude',     kind: 'quiz' },       // 20
    null,                                                             // 21 pause
    { icon: '🔧', label: 'Three knobs',       kind: 'narrate' },    // 22
    { icon: '❓', label: 'Quiz: interleave',   kind: 'quiz' },       // 23
    { icon: '🏁', label: 'Try: add particles', kind: 'checkpoint' },// 24
    null,                                                             // 25 pause
    { icon: '⏭️', label: 'Next: Boyle\'s',    kind: 'narrate' },    // 26
  ],

  buildSteps(showSection, runner) {
    const simViz = runner.blockInstances.find(b => b.id === '61-sim-viz');

    return [
      // 0: Recall hook
      { type: 'show', action: () => showSection('sec-61-hook'),
        text: "Let's start with something you already know. In Lesson 5.1, you learned that temperature measures the average kinetic energy of particles. The higher the temperature, the faster particles move. Now, gas particles are special — they're not locked in place like in a solid. They fly freely in all directions, bouncing off each other and off the walls of whatever container they're in. So here's the question: what happens when all those fast-moving particles keep slamming into the walls?" },

      // 1: Quiz — recall KE
      { type: 'quiz',
        text: "Quick recall check from Lesson 5.1.",
        question: "If you increase the temperature of a gas, what happens to its particles?",
        options: [
          "They slow down and settle to the bottom",
          "They move faster (higher average kinetic energy)",
          "They stop moving entirely",
          "They change into a liquid"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! Higher temperature = higher average kinetic energy = faster particles. This is the key to understanding pressure.",
        wrongFeedback: "Remember from Lesson 5.1: temperature IS average kinetic energy. Higher temperature means particles move faster." },

      // 2: pause
      { type: 'pause' },

      // 3: Balloon story
      { type: 'show', action: () => showSection('sec-61-balloon'),
        text: "Let me paint a picture. Imagine holding an inflated balloon. It feels firm and pushes back when you squeeze it. Something inside is pushing outward. That something is gas — billions of nitrogen and oxygen molecules rocketing around at hundreds of meters per second, slamming into the rubber wall from the inside." },

      // 4: Collisions add up
      { type: 'narrate',
        text: "Each individual collision is incredibly tiny — far too small to feel. But here's the thing: there are billions of these collisions happening every single microsecond. All those tiny pushes add up to one steady, measurable force pushing outward on every part of the balloon's surface. That combined push is what we call pressure." },

      // 5: Quiz — what causes pressure
      { type: 'quiz',
        text: "Let's make sure the core idea is solid.",
        question: "What causes gas pressure inside a container?",
        options: [
          "Gas particles are heavy and sink to the bottom",
          "Gas particles repel each other like magnets",
          "Gas particles collide with the container walls billions of times per second",
          "Gas expands because it's hot"
        ],
        correctIndex: 2,
        correctFeedback: "That's it! Pressure = billions of particle-wall collisions adding up to a steady force. Simple but powerful.",
        wrongFeedback: "Think about the balloon: particles are flying around and hitting the walls. Each hit is a tiny push. Billions of hits per second = steady pressure." },

      // 6: pause
      { type: 'pause' },

      // 7: Define P = F/A
      { type: 'show', action: () => showSection('sec-61-define'),
        text: "Now let's make this precise. Pressure is defined as force divided by area. P equals F over A. The total force from all those particle collisions, spread over the area of the surface they're hitting." },

      // 8: Needle analogy
      { type: 'narrate',
        text: "Here's an intuition builder: same force, smaller area, higher pressure. Push your finger against a wall — nothing happens. Now push a needle with the same force — it pokes right through. The force is identical, but the needle concentrates it onto a tiny area, so the pressure is enormous. That's why pressure is force per unit area, not just force." },

      // 9: Quiz — calculate P
      { type: 'quiz',
        text: "Let's do a quick calculation.",
        question: "A force of 200 newtons is applied over an area of 4 square meters. What is the pressure?",
        options: [
          "800 Pa",
          "50 Pa",
          "200 Pa",
          "4 Pa"
        ],
        correctIndex: 1,
        correctFeedback: "200 N ÷ 4 m² = 50 Pa. You just used P = F/A!",
        wrongFeedback: "Use P = F/A. Divide the force (200 N) by the area (4 m²)." },

      // 10: pause
      { type: 'pause' },

      // 11: Sim intro
      { type: 'show', action: () => showSection('sec-61-sim'),
        text: "Time to see this in action. Below is a container filled with gas particles. Watch them bounce around — every time a particle hits a wall, the wall flashes cyan. The gauge on the right shows the pressure, calculated from how frequently particles are hitting the walls." },

      // 12: Sim explanation
      { type: 'narrate',
        text: "You've got two controls: you can change the temperature, which changes how fast the particles move. And you can add or remove particles. Try heating the gas first — click the Heat button a few times and watch what happens to the pressure gauge." },

      // 13: Checkpoint — heat the gas
      { type: 'checkpoint',
        instruction: 'Click "🔥 Heat (+50 K)" at least 3 times and watch the pressure gauge rise.',
        text: "Go ahead — heat the gas and watch the pressure respond.",
        check: () => simViz?.renderer?.tempChanges >= 3,
        checkInterval: 500,
        confirmText: "See that? Higher temperature → faster particles → more frequent and harder wall collisions → higher pressure. Temperature and pressure are directly connected." },

      // 14: pause
      { type: 'pause' },

      // 15: Units
      { type: 'show', action: () => showSection('sec-61-units'),
        text: "Let's talk about units. The SI unit of pressure is the pascal, abbreviated P-a. One pascal equals one newton per square meter. But one pascal is tiny — atmospheric pressure is about 101,325 pascals. So in chemistry, we usually use kilopascals or atmospheres." },

      // 16: Quiz — unit conversion
      { type: 'quiz',
        text: "Time for a conversion check.",
        question: "Standard atmospheric pressure is 1 atm. How many kilopascals is that?",
        options: [
          "1.013 kPa",
          "101.325 kPa",
          "760 kPa",
          "10,132.5 kPa"
        ],
        correctIndex: 1,
        correctFeedback: "Right! 1 atm = 101.325 kPa. This is a number worth memorizing — you'll use it constantly in gas law problems.",
        wrongFeedback: "Check the table: 1 atm = 101,325 Pa = 101.325 kPa. Move the decimal three places." },

      // 17: pause
      { type: 'pause' },

      // 18: Atmospheric pressure
      { type: 'show', action: () => showSection('sec-61-atm'),
        text: "Here's something wild: you're sitting at the bottom of an ocean right now. Not water — air. There's a column of air stretching from your head about 100 kilometers up to the edge of space. All that air has weight, and it's pressing down on you. That's atmospheric pressure." },

      // 19: Ears pop
      { type: 'narrate',
        text: "At sea level, atmospheric pressure is about 1 atmosphere — 101.325 kilopascals. You don't feel it because the pressure inside your body pushes back equally. But go up a mountain or ride in a plane, and there's less air above you, so the pressure drops. The air inside your ears is still at the old, higher pressure — that mismatch is what makes your ears pop." },

      // 20: Quiz — altitude
      { type: 'quiz',
        text: "Think about what you just learned.",
        question: "A hiker climbs from sea level to a mountain peak. What happens to the atmospheric pressure around them?",
        options: [
          "It increases — there's more air pushing up from below",
          "It stays the same — pressure doesn't depend on altitude",
          "It decreases — there's less air above them pressing down",
          "It doubles because mountains are windy"
        ],
        correctIndex: 2,
        correctFeedback: "Exactly! Less air above = less weight pressing down = lower atmospheric pressure. That's why pressure drops with altitude.",
        wrongFeedback: "Atmospheric pressure comes from the weight of air above you. Higher up → less air above → less pressure." },

      // 21: pause
      { type: 'pause' },

      // 22: Three factors
      { type: 'show', action: () => showSection('sec-61-factors'),
        text: "Now let's connect everything. Since pressure comes from particle collisions, there are three knobs you can turn to change it. One: temperature — hotter particles move faster and hit harder. Two: number of particles — more particles means more collisions. Three: volume — squeeze the container smaller and particles hit the walls more often because they have less space to travel between hits." },

      // 23: Quiz — interleaved (uses moles from 4.4)
      { type: 'quiz',
        text: "Here's one that connects back to Lesson 4.4 on moles.",
        question: "You have a sealed, rigid container with 1 mole of gas at a certain pressure. If you inject another mole of gas (same temperature, same container), what happens to the pressure?",
        options: [
          "It stays the same — moles don't affect pressure",
          "It roughly doubles — twice as many particles hitting the walls",
          "It halves — the particles have to share the space",
          "It drops to zero — the gases cancel each other out"
        ],
        correctIndex: 1,
        correctFeedback: "Right! Double the particles (2 moles instead of 1) = double the collisions per second = roughly double the pressure. Moles connect directly to pressure.",
        wrongFeedback: "More particles in the same space = more collisions with walls = more pressure. 1 mole → 2 moles is double the particles." },

      // 24: Checkpoint — add particles
      { type: 'checkpoint',
        instruction: 'Go back to the sim. Click "➕ Add 10 particles" a few times and watch the pressure rise.',
        text: "Try it out — add more particles and see the pressure increase in real time.",
        check: () => simViz?.renderer?.numParticles >= 80,
        checkInterval: 500,
        confirmText: "More particles, more collisions, higher pressure. You've now seen both temperature and particle count affect pressure with your own eyes." },

      // 25: pause
      { type: 'pause' },

      // 26: Tease next
      { type: 'show', action: () => showSection('sec-61-next'),
        text: "Excellent work. You now understand what gas pressure is — the result of countless particle collisions — and the three factors that control it: temperature, number of particles, and volume. In Lesson 6.2, we'll zoom in on the relationship between pressure and volume. It's called Boyle's Law, and it's one of the most elegant patterns in chemistry. See you there!" },
    ];
  },
};
