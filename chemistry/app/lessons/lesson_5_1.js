/**
 * Lesson 5.1: Energy — What It Is, Heat vs Temperature
 *
 * ATOMIC LESSON — one core concept: the nature of energy and the critical
 * distinction between heat and temperature. Heavy on quizzes and interleaving.
 *
 * Prereqs used: exo/endothermic from 4.3, IMFs from 4.2, kinetic energy of
 * particles from 1.4 (states of matter).
 *
 * Sim: thermoViz in 'heatTransfer' mode only.
 */

import { TextBlock, CalloutBlock, MathBlock, SimBlock } from '../blocks/Block.js';
import '../sims/thermoViz.js';

export const lesson_5_1 = {
  id: '5.1',
  lessonId: 'lesson_5_1',
  title: 'Energy — Heat vs Temperature',

  sections: [
    // --- RECALL HOOK ---
    {
      id: 'sec-51-hook',
      blocks: [
        new TextBlock({ id: '51-hook-title', tag: 'h2', html: 'You Already Know More Than You Think' }),
        new CalloutBlock({ id: '51-hook-recall', html: '<strong>Recall:</strong> In lesson 4.3, you learned that burning methane is <em>exothermic</em> (releases energy, ΔH &lt; 0) and photosynthesis is <em>endothermic</em> (absorbs energy, ΔH &gt; 0). In lesson 1.4, you saw particles moving faster in a gas than in a solid. In lesson 4.2, you learned that stronger IMFs require more energy to overcome.<br><br>All of these involve <strong>energy</strong>. But what <em>is</em> energy, exactly? And when we say a reaction "releases heat" — what does that actually mean at the particle level?' }),
      ]
    },

    // --- WHAT IS ENERGY ---
    {
      id: 'sec-51-energy',
      blocks: [
        new TextBlock({ id: '51-nrg-title', tag: 'h2', html: 'Two Flavors of Energy' }),
        new CalloutBlock({ id: '51-nrg-types', html: '<strong>Kinetic energy</strong> = energy of motion<br>• Atoms vibrating in a solid<br>• Molecules flying in a gas<br>• Faster motion = more kinetic energy<br><br><strong>Potential energy</strong> = stored energy<br>• Energy stored in chemical bonds (C—H, O=O, etc.)<br>• Energy stored in position (ball on a shelf, electron near a nucleus)<br>• Doesn\'t depend on motion — depends on arrangement' }),
        new MathBlock({ id: '51-nrg-law', label: 'The First Law of Thermodynamics:', equation: 'Energy is conserved. It transforms — never created or destroyed.', symbols: [
          { symbol: 'KE → PE', name: 'e.g. ball rising', meaning: 'Motion converts to position' },
          { symbol: 'PE → KE', name: 'e.g. bond breaking → heat', meaning: 'Stored energy converts to motion' },
        ]}),
      ]
    },

    // --- CONCRETE EXAMPLE ---
    {
      id: 'sec-51-concrete',
      blocks: [
        new TextBlock({ id: '51-conc-title', tag: 'h2', html: 'Where You\'ve Already Seen This' }),
        new CalloutBlock({ id: '51-conc-box', html: '<strong>Burning methane</strong> (from 4.3):<br>Bond PE stored in C—H and O=O → breaks → new C=O and O—H bonds form → excess energy becomes KE of product molecules → they fly apart fast → fast molecules = <strong>hot</strong><br><br><strong>Ice melting</strong> (from 1.4):<br>Heat flows in → KE of water molecules increases → molecules break free of crystal lattice → solid → liquid<br><br><strong>The pattern:</strong> Energy transforms between potential (bonds, arrangement) and kinetic (motion, heat). It\'s always conserved.' }),
      ]
    },

    // --- HEAT VS TEMPERATURE ---
    {
      id: 'sec-51-hvt',
      blocks: [
        new TextBlock({ id: '51-hvt-title', tag: 'h2', html: 'Heat vs Temperature — The Distinction That Matters' }),
        new CalloutBlock({ id: '51-hvt-key', html: '<strong>Temperature</strong> = average kinetic energy per particle<br>How fast are particles moving <em>on average</em>?<br><br><strong>Heat</strong> = transfer of thermal energy between objects<br>Energy flowing from hot → cold<br><br><strong>Total thermal energy</strong> = depends on BOTH temperature AND number of particles<br><br>A swimming pool at 30°C has enormously more total thermal energy than a thimble at 90°C.<br>The thimble is "hotter" (higher T) but the pool has more total energy (more particles).' }),
        new SimBlock({ id: '51-ht-viz', sim: 'thermoViz', width: 900, height: 420, simOptions: { mode: 'heatTransfer' } }),
      ]
    },

    // --- THERMAL EQUILIBRIUM ---
    {
      id: 'sec-51-equil',
      blocks: [
        new TextBlock({ id: '51-eq-title', tag: 'h2', html: 'Thermal Equilibrium' }),
        new CalloutBlock({ id: '51-eq-box', html: '<strong>Heat always flows from hot → cold.</strong> Always. No exceptions.<br><br>When you touch a metal railing on a cold day, heat flows FROM your warm hand INTO the cold metal. The metal doesn\'t "send cold" to you — your hand loses energy.<br><br>This continues until both objects reach the <strong>same temperature</strong> = thermal equilibrium. At equilibrium, no more net heat flow. Particles on both sides have the same average KE.' }),
      ]
    },

    // --- CONNECTING BACK ---
    {
      id: 'sec-51-connect',
      blocks: [
        new TextBlock({ id: '51-conn-title', tag: 'h2', html: 'Why Materials Science Cares' }),
        new CalloutBlock({ id: '51-conn-box', html: '<strong>This single concept — heat vs temperature — explains:</strong><br><br>• Why metals feel cold to the touch (they conduct heat away from your skin rapidly — the <em>transfer</em> rate matters, not the temperature)<br>• Why water moderates climate (huge thermal energy reservoir — high temperature is hard to change)<br>• Why blacksmiths quench hot metal in water (water absorbs enormous energy without boiling immediately)<br>• Why thermal management is critical in electronics, engines, and manufacturing<br><br>In the next lesson, we\'ll quantify this: how MUCH energy does it take to change temperature? That\'s specific heat — and it varies wildly between materials.' }),
      ]
    },

    // --- FORWARD ---
    {
      id: 'sec-51-forward',
      blocks: [
        new TextBlock({ id: '51-fwd-title', tag: 'h2', html: 'Next: Specific Heat Capacity' }),
        new TextBlock({ id: '51-fwd-text', tag: 'p', html: "You now know that energy comes in two forms (KE and PE), that it's conserved, and that heat and temperature are fundamentally different. Next lesson: <strong>why does water resist temperature change</strong> while metals heat up instantly? The answer is <strong>specific heat capacity</strong> — a number unique to each material. You'll learn the formula q = mcΔT and use it to calculate actual energy values. This is where chemistry becomes quantitative physics." }),
      ]
    },
  ],

  // 19 steps — ~40% quizzes (8 quiz/checkpoint steps out of 19)
  stepMeta: [
    { icon: '🔄', label: 'Recall', kind: 'narrate' },           // 0
    { icon: '❓', label: 'Recall Q', kind: 'quiz' },             // 1
    null,                                                          // 2
    { icon: '⚡', label: 'KE & PE', kind: 'narrate' },           // 3
    { icon: '📐', label: '1st Law', kind: 'narrate' },            // 4
    { icon: '❓', label: 'Quiz 1', kind: 'quiz' },                // 5
    null,                                                          // 6
    { icon: '🔥', label: 'Examples', kind: 'narrate' },           // 7
    { icon: '❓', label: 'Quiz 2', kind: 'quiz' },                // 8
    null,                                                          // 9
    { icon: '🌡️', label: 'Heat vs T', kind: 'narrate' },         // 10
    { icon: '🎮', label: 'Sim', kind: 'checkpoint' },             // 11
    { icon: '❓', label: 'Quiz 3', kind: 'quiz' },                // 12
    null,                                                          // 13
    { icon: '⚖️', label: 'Equilib', kind: 'narrate' },            // 14
    { icon: '❓', label: 'Quiz 4', kind: 'quiz' },                // 15
    { icon: '❓', label: 'Interleave', kind: 'quiz' },            // 16
    null,                                                          // 17
    { icon: '🎉', label: 'Next', kind: 'narrate' },               // 18
  ],

  buildSteps(showSection, runner) {
    const htViz = runner.blockInstances.find(b => b.id === '51-ht-viz');

    // 19 steps — must match stepMeta length
    return [
      // 0: Recall hook — actively USE prior knowledge
      { type: 'show', action: () => showSection('sec-51-hook'),
        text: "Before we start something new, let's use what you already know. In lesson 4.3 you learned that burning methane is exothermic — it releases energy, delta H is negative. Photosynthesis is endothermic — it absorbs energy. In lesson 1.4, you saw that gas particles move faster than solid particles. In lesson 4.2, you learned that stronger intermolecular forces need more energy to overcome. All of these involve energy. But what IS energy exactly? When a reaction 'releases heat,' what's happening at the particle level? That's what this lesson is about — and it's just one concept: the difference between energy, heat, and temperature." },

      // 1: Recall quiz — interleave from 4.3
      { type: 'quiz',
        text: "Let's start by checking what you remember.",
        question: "From lesson 4.3: In an exothermic reaction, where does the released energy originally come from?",
        options: [
          "From the heat in the surroundings",
          "From the potential energy stored in chemical bonds of the reactants",
          "Energy is created during the reaction",
          "From the kinetic energy of the product molecules"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly right! The energy was stored as potential energy in the bonds of the reactants. When new, stronger bonds form in the products, the excess potential energy converts to kinetic energy — heat. You already understand energy transformation without knowing the formal name for it.",
        wrongFeedback: "Think about where energy is stored before the reaction begins. Hint: it's in the arrangement of atoms — the bonds." },

      // 2: pause
      { type: 'pause' },

      // 3: Two types of energy
      { type: 'show', action: () => showSection('sec-51-energy'),
        text: "Energy comes in two fundamental flavors. Kinetic energy is energy of motion — atoms vibrating, molecules flying, electrons moving. You've already seen this: in lesson 1.4, gas particles move fast, solid particles vibrate in place. The faster they move, the more kinetic energy they have. Potential energy is stored energy — it depends on arrangement, not motion. Chemical bonds store potential energy. A ball on a shelf has gravitational potential energy. The energy in gasoline is potential energy stored in carbon-hydrogen bonds, waiting to be released." },

      // 4: First law
      { type: 'narrate',
        text: "And here's the most important law in all of physics: the First Law of Thermodynamics. Energy can never be created or destroyed — only transformed from one form to another. When you burn methane, potential energy stored in C-H bonds transforms into kinetic energy of product molecules flying apart fast. When a ball falls off a shelf, potential energy transforms into kinetic energy of motion. The total is always exactly conserved. No exception to this law has ever been found." },

      // 5: Quiz — direct application
      { type: 'quiz',
        text: "Check your understanding.",
        question: "A match ignites and burns. The energy stored in the match head's bonds becomes heat and light. What happened to the energy?",
        options: [
          "Some energy was destroyed as the match burned up",
          "New energy was created by the fire",
          "Potential energy (bonds) transformed into kinetic energy (heat) and light — total energy unchanged",
          "The match absorbed energy from the air"
        ],
        correctIndex: 2,
        correctFeedback: "Yes! Bond potential energy → kinetic energy of hot gas molecules + light. Total energy before = total energy after. The match 'disappears' but its energy doesn't — it's conserved in different forms.",
        wrongFeedback: "Remember the First Law: energy is never created or destroyed. The match's bonds contained stored energy. Where did that stored energy go?" },

      // 6: pause
      { type: 'pause' },

      // 7: Concrete examples connecting back
      { type: 'show', action: () => showSection('sec-51-concrete'),
        text: "Let's see energy transformation in things you already know. Burning methane from lesson 4.3: bond potential energy stored in C-H and O double bond O transforms — old bonds break, new bonds form. The new C double bond O and O-H bonds are stronger, so forming them releases MORE energy than breaking the old bonds cost. That excess energy becomes kinetic energy — product molecules fly apart fast. Fast molecules mean hot. That's literally what exothermic means at the particle level. Ice melting from lesson 1.4: heat flows in, kinetic energy increases, molecules break free of the crystal lattice. Energy transforms from thermal kinetic energy into overcoming intermolecular forces — the potential energy of arrangement changes." },

      // 8: Quiz — requires reasoning, connects 4.3 + new concept
      { type: 'quiz',
        text: "This one requires you to connect ideas.",
        question: "In lesson 4.3 you learned that an endothermic reaction absorbs energy. In terms of KE and PE, what happens to the absorbed energy?",
        options: [
          "It becomes kinetic energy — products move faster",
          "It becomes potential energy — stored in the bonds of the products (which sit at higher energy)",
          "It is destroyed",
          "It stays as heat in the surroundings"
        ],
        correctIndex: 1,
        correctFeedback: "Nailed it! In an endothermic reaction, heat from the surroundings (KE) converts into potential energy stored in the product bonds. That's why products are at HIGHER energy — ΔH is positive. The energy isn't gone, it's stored.",
        wrongFeedback: "Endothermic means energy flows IN. If the surroundings cool down (lose KE), where does that energy go? Think about what form it takes in the products." },

      // 9: pause
      { type: 'pause' },

      // 10: Heat vs Temperature — the core concept
      { type: 'show', action: () => showSection('sec-51-hvt'),
        text: "Now the single most important distinction in this lesson: heat and temperature are NOT the same thing. Temperature measures the average kinetic energy per particle. How fast are the particles moving on average? That's temperature. Heat is the transfer of thermal energy between objects at different temperatures. It's a flow, not a property. Here's the key insight: a swimming pool at 30 degrees has enormously more total thermal energy than a thimble of water at 90 degrees. The thimble is hotter — higher temperature, faster average particle speed. But the pool has vastly more particles, so its total energy is far greater. Temperature is about intensity. Total thermal energy depends on both intensity and amount." },

      // 11: Sim checkpoint — heat transfer
      { type: 'checkpoint',
        instruction: 'Click "Transfer Heat" and watch heat flow from hot to cold until equilibrium',
        text: "Watch this simulation. Container A is hot — its particles move fast. Container B is cold — slow particles. Click Transfer Heat. Watch what happens: energy flows from A to B. A's particles slow down, B's particles speed up. They meet in the middle — thermal equilibrium, same temperature. Now try clicking Size A up a few times to make container A much bigger. Reset and transfer again. Notice that the equilibrium temperature shifts — the bigger container dominates because it has more total thermal energy, even at the same starting temperature.",
        check: () => htViz?.renderer?.htEquilibrium === true,
        checkInterval: 500,
        confirmText: "See it? Heat flowed from hot to cold until both reached the same average particle speed — the same temperature. And when A was bigger, it had more total energy, so the equilibrium temperature was closer to A's starting temperature. That's the difference: temperature is the average, total energy depends on amount times average." },

      // 12: Quiz — direct application of heat vs temp
      { type: 'quiz',
        text: "Let's make sure this distinction is solid.",
        question: "A bathtub of warm water (40°C) and a teaspoon of boiling water (100°C). Which has more TOTAL thermal energy?",
        options: [
          "The teaspoon — it's at a higher temperature",
          "The bathtub — vastly more particles, each with decent kinetic energy",
          "They're equal — temperature and energy are the same thing",
          "Cannot be determined"
        ],
        correctIndex: 1,
        correctFeedback: "Right! The bathtub has billions of times more molecules than the teaspoon. Even though each molecule moves a bit slower (40°C vs 100°C), the sheer number overwhelms. Total thermal energy = number of particles × average KE per particle. The bathtub wins by a landslide.",
        wrongFeedback: "Temperature is the average KE per particle. But total energy depends on how MANY particles you have times that average. Which has more particles — a bathtub or a teaspoon?" },

      // 13: pause
      { type: 'pause' },

      // 14: Thermal equilibrium
      { type: 'show', action: () => showSection('sec-51-equil'),
        text: "One more crucial idea: heat always flows from hot to cold. Always, no exceptions. When you touch a cold metal railing, heat flows FROM your warm hand INTO the cold metal. The metal doesn't send cold to you — your hand loses energy. This continues until both reach the same temperature — thermal equilibrium. At equilibrium, particles on both sides have the same average kinetic energy. No more net heat transfer. This is why a cup of hot coffee left on a table always cools down to room temperature and never heats up on its own." },

      // 15: Quiz — reasoning about equilibrium
      { type: 'quiz',
        text: "Apply what you just learned.",
        question: "You put an ice cube in a glass of warm water. What happens and why?",
        options: [
          "Cold flows from the ice into the water, cooling it down",
          "Heat flows from the warm water into the ice (hot → cold), melting the ice and cooling the water until equilibrium",
          "The ice and water stay at their own temperatures",
          "Energy is created to melt the ice"
        ],
        correctIndex: 1,
        correctFeedback: "Exactly! Heat flows from the warm water (high avg KE) to the ice (low avg KE). The water's particles slow down (cools). The ice's particles speed up and eventually break free of the crystal lattice (melts). This continues until thermal equilibrium. No 'cold' is transferred — only heat, from hot to cold.",
        wrongFeedback: "Remember: heat flows from hot to cold. There's no such thing as 'cold flowing.' Which is hotter — the water or the ice? Which direction does energy flow?" },

      // 16: Interleaved quiz — combines heat/temp with IMFs from 4.2
      { type: 'quiz',
        text: "This one combines today's lesson with lesson 4.2.",
        question: "From 4.2: water has strong hydrogen bonds (an IMF). From today: heat is energy transfer. Why does it take a LOT of heat to boil water?",
        options: [
          "Water is a bad conductor of heat",
          "Water molecules are very heavy",
          "Strong H-bonds mean particles need a lot of kinetic energy (high temperature) to escape — so you must transfer a lot of heat to reach that point",
          "Water creates new energy when heated"
        ],
        correctIndex: 2,
        correctFeedback: "Beautiful connection! Strong H-bonds (4.2) mean molecules are held together tightly. To boil, particles need enough KE to overcome those forces. Since water resists temperature change (you'll learn why quantitatively in 5.2), you have to pump in a LOT of heat energy. IMFs from 4.2 + energy concepts from today = understanding boiling.",
        wrongFeedback: "Think about what must happen for a liquid to boil: particles must escape the liquid's surface. What's holding them in? (Lesson 4.2: intermolecular forces.) How do they escape? (Today's lesson: they need enough kinetic energy.)" },

      // 17: pause
      { type: 'pause' },

      // 18: Forward + materials connection
      { type: 'show', action: () => {
          showSection('sec-51-connect');
          showSection('sec-51-forward');
        },
        text: "You now own one of the most important ideas in science: energy is conserved, it comes in kinetic and potential forms, and heat and temperature are fundamentally different things. This matters enormously for materials science. Metals feel cold because they conduct heat away from your skin rapidly — that's a heat transfer rate issue, not a temperature issue. Water moderates climate because its huge thermal energy resists temperature change. Next lesson: we'll make this quantitative. Why does water resist temperature change while metals heat up instantly? The answer is specific heat capacity — a number unique to each material. You'll learn q equals m c delta T, and use it to calculate actual energy values. See you in 5.2!" },
    ];
  },
};
