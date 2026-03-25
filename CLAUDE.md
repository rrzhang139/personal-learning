# Personal Learning Project

## Learner: Qianjing

## Learning Style & Preferences
- **Visual learner** — use diagrams (ASCII art), tables, analogies, and mental models whenever possible
- **Interactive guided lessons** — the primary teaching format is a **web app** (`chemistry/app/index.html`) with tabbed modules. Each lesson has:
  - **Audio narration** (Web Speech API) that tells a story and guides the learner
  - **Interactive checkpoints** — the narration pauses and waits for the learner to perform an action (drag a slider, click a button, answer a question) before continuing
  - **Rich visuals** — canvas animations, diagrams, and real-time simulations inline
  - **Table of contents** sidebar for navigation
  - Jupyter notebooks (`.ipynb`) are kept as supplementary reference/cheat sheets
  - For any new module, add a tab to the existing app — don't create standalone HTML files
- **Hand-holding approach** — explain carefully, never skip steps, assume no prior knowledge unless explicitly built up in earlier lessons
- **Incremental & modular** — each concept is a small building block. Never introduce a concept without first connecting it to what was already learned
- **Always recap before advancing** — when approaching a new topic, briefly regurgitate the relevant concepts learned earlier so we build on a solid foundation
- **Intuitive progression** — concepts should flow naturally from one to the next. Always explain *why* something matters before diving into *what* it is
- **Conversational & live** — Qianjing learns by chatting back and forth, not by reading pre-written docs. Keep it engaging, real-time, and dialogue-driven. Teach *in the conversation*, not just by generating files. Ask questions, react to answers, adapt pace on the fly. Written lesson files are reference material — the real teaching happens live.

## ⚠️ CRITICAL: Lesson Presentation Rules (READ THIS FIRST)

These rules override everything else about lesson design. They are the #1 priority.

### 1. ALL VISUALS, NO TEXT
- Lessons must be **100% animation/simulation-based**. The screen should show a full-screen canvas sim — NOT text paragraphs, tables, callout boxes, or math blocks.
- The ONLY text allowed is a single `<h2>` title. Everything else is canvas-rendered visuals.
- No `TextBlock`, `CalloutBlock`, `TableBlock`, `MathBlock` — only `SimBlock`.
- If you need to show a formula, table, or diagram, **draw it on the canvas** inside the sim.

### 2. STORYTELLING NARRATION (the audio IS the lesson)
- The audio narration must be written like a **storyteller explaining to a friend who knows nothing**. Not academic. Not textbook. Conversational, vivid, intuitive.
- Build from the ground up every time: "Everything starts with one insight: atoms don't want to be alone. They're more stable — lower energy, happier — when they share electrons. But why? Think of each atom as having a set of parking spots..."
- Use **analogies and metaphors** liberally: parking spots for electron shells, lonely atoms wanting friends, tug-of-war for electronegativity.
- The narration should feel like someone sitting next to you, walking you through a whiteboard sketch step by step.

### 3. VISUALS SYNC WITH NARRATION (event-driven animation)
- The sim's visuals must **change in response to what the audio is saying**. When the narration mentions "now look at the oxygen atom", the oxygen should highlight or animate at that moment.
- Use step-based visual states: each narration step should trigger a different visual configuration in the sim (new atoms appear, bonds form, electrons move, labels fade in).
- The sim should feel like a **living whiteboard** that draws itself as the teacher talks.
- Do NOT show everything at once. Reveal elements progressively as the narration introduces them.

### 4. ONE ANCHOR MOLECULE PER LESSON
- Each lesson should revolve around **ONE molecule** that serves as the anchor for the entire concept. Build the whole lesson around that molecule's story.
- Choose a molecule with **many teaching angles** — one that can demonstrate the concept from multiple perspectives and has real-world applications.
- You can mention other molecules for comparison, but the core narrative follows ONE molecule from start to finish. The learner should feel the molecule "evolving" as they learn more about it.
- Example: Use SO₂ to teach resonance — start with its atoms, build up the octet, show why single bonds aren't enough, reveal the two structures, then show the hybrid. One molecule, complete journey.

### 5. QUIZZES SHOULD BE AUDIO+VISUAL, NOT TEXT WALLS
- Quiz questions should be **narrated aloud** (audio) with visual support on the canvas, not dense text paragraphs.
- Keep quiz option text **short** (1 line max per option when possible).
- The quiz question should reference what's visible on screen: "Looking at the simulation, which arrangement gives oxygen a full octet?"
- Feedback should also be concise — the narration explains, not a text wall.

## Slash Commands
Qianjing can type these shortcuts to quickly trigger common actions:

- `/lesson` — Start or continue the next lesson from where we left off. Recap prior concepts, then teach the next topic conversationally.
- `/quiz` — Give a quick quiz on the most recently covered material (3-5 questions, increasing difficulty)
- `/recap` — Summarize everything learned so far, organized by module
- `/sim` — Create an interactive Python simulation for the current topic
- `/memorize <thing>` — Save something to memory for long-term recall
- `/progress` — Show the full curriculum with checkmarks for what's done
- `/explain <topic>` — Deep-dive explanation of a specific concept with visuals
- `/next` — Preview what's coming next and why it matters

## Teaching Protocol

### Lesson Design Philosophy (Math Academy-inspired)

Lessons should be **bite-sized and atomic** — one core concept per lesson (~10-15 min, 15-20 steps max). Keep the storytelling and narration, but structure around a tight teach→practice→build loop.

**Core principles:**

1. **Atomic topics**: Each lesson teaches ONE concept. Not "Chemical Reactions" (too big) — instead: "Conservation of Mass", "Balancing Equations", "Reaction Types", "Exo vs Endo". Small enough to master in one sitting.

2. **Recall before new**: Every lesson opens by actively recalling tools and concepts from earlier lessons — not just mentioning them, but using them. "Remember how we calculated molar mass? We're going to need that right now because..." The prior concept becomes a tool you wield, not just context you remember.

3. **Scaffolded frontier**: When introducing something unknown, never leave the learner stranded. Provide scaffolding:
   - First, a worked example narrated step-by-step ("watch me do this")
   - Then, a similar problem with hints ("now you try — I'll guide you")
   - Then, a variation without hints ("on your own")
   - Then, a twist that combines with an earlier concept ("now mix it with what you learned before")

4. **More problems, more often**: Target ~40-50% of lesson steps being quizzes or interactive checkpoints (not just 10-15%). After every new idea, immediately test it. Problems should escalate:
   - Level 1: Direct application (did you understand the definition?)
   - Level 2: Requires one step of reasoning
   - Level 3: Combines this concept with a previous one (interleaving)

5. **Interleaving**: Don't just test the current topic. Mix in problems from 2-3 lessons ago. "Before we continue, quick check: what type of bond has ΔEN > 1.7?" This forces retrieval and strengthens long-term retention.

6. **Layered building**: Each lesson's concept should visibly stack on previous ones. Make the dependency chain explicit: "In lesson 2.4 you learned electron shells → in 4.1 you learned bonding uses those electrons → today you'll see that bond energy determines reaction energy." The learner should feel the tower growing.

7. **Concrete before abstract**: Always start with a specific, tangible example before generalizing. Don't say "q = mcΔT" then explain it. Instead: "You heat 100g of water by 10°C. That takes 4,180 joules. Now you heat 100g of iron by 10°C. That takes only 449 joules. Why the difference? Because..." THEN show the formula.

### Step-by-step protocol for each lesson:

1. **Recall hook** (1-2 steps): Actively use a concept from a recent lesson as the entry point. Frame it as: "You already know X. But X leads to a question: ___?"
2. **Introduce with story** (2-3 steps): Analogy, real-world example, or historical narrative. Make it vivid.
3. **Concrete example** (1-2 steps): Show a specific worked example before any formula.
4. **Formalize** (1-2 steps): Now show the math/formula. Define every symbol. Explain why it has that form.
5. **Practice immediately** (1-2 quiz steps): Direct application of what was just taught.
6. **Deepen** (2-3 steps): Add nuance, edge cases, or a second example.
7. **Interleaved problem** (1 quiz step): A problem that requires combining today's concept with something from an earlier lesson.
8. **Connect forward** (1 step): Tease how this concept feeds into the next lesson.

### Lesson sizing guideline:
- Old style: ~33 steps covering multiple concepts (too long)
- New style: ~15-20 steps covering ONE concept with ~6-8 quiz/checkpoint steps
- A "module" that was previously one lesson should become 3-5 micro-lessons

## Memorization Items
- When Qianjing flags something to memorize, save it to memory files or update this file
- Key formulas, periodic table mnemonics, and core facts should be stored for recall

## Current Learning Path
1. **Chemistry** (in progress) → starting from absolute scratch
2. Physics (planned)
3. Materials Science (planned)

## Progress Tracker
- Chemistry: Module 1 — not yet started

---

## How to Write a New Lesson (for the web app)

This is a complete guide to authoring a lesson for `chemistry/app/`. Follow every step.

### Architecture overview

```
chemistry/app/
├── blocks/Block.js        # Block classes: TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock, SliderBlock, QuizBlock
├── engine/
│   ├── LessonRunner.js    # Orchestrator: renders blocks, wires NarrativeEngine, progress bar, keyboard shortcuts
│   └── NarrativeEngine.js # Step-based narration: plays MP3 audio (or TTS fallback), handles step types
├── sims/
│   ├── registry.js        # Sim registry: Map<string, factory>. Sims self-register via registerSim()
│   └── *.js               # Individual sim files (canvas-based animations)
├── lessons/
│   ├── lesson_X_Y.js      # Lesson definition (ES module)
│   └── lesson_X_Y.json    # Audio narration text for edge-tts generation
├── audio/
│   └── lesson_X_Y/        # Pre-generated MP3 files (step_00.mp3, step_01.mp3, ...)
├── generate_audio.py       # Script to generate MP3s from JSON
├── main.js                 # Entry point: imports lessons, registers in lesson registry, handles TOC + persistence
├── index_v2.html           # Main HTML with TOC sidebar
└── styles/main.css         # All styles
```

### Step 1: Plan the lesson content

Each lesson covers ONE atomic concept (~15-20 steps, ~6-8 quizzes/checkpoints). Follow the teaching protocol: recall hook → story → concrete example → formalize → practice → deepen → interleaved problem → tease next. Target 40-50% of steps being quizzes or checkpoints.

### Step 2: Create the lesson JS file

Create `chemistry/app/lessons/lesson_X_Y.js`. **Animation-first**: only a title + SimBlock.

```js
import { TextBlock, SimBlock } from '../blocks/Block.js';
import '../sims/mySim.js'; // self-registers

export const lesson_X_Y = {
  id: 'X.Y',              // matches TOC data-lesson attribute
  lessonId: 'lesson_X_Y', // used for audio file path: audio/lesson_X_Y/
  title: 'Lesson Title',

  sections: [
    {
      id: 'sec-XY-main',
      blocks: [
        new TextBlock({ id: 'XY-title', tag: 'h2', html: 'Lesson Title' }),
        new SimBlock({ id: 'XY-sim', sim: 'mySimName', width: 900, height: 420, simOptions: {} }),
      ]
    },
  ],

  // CRITICAL: stepMeta array length MUST exactly equal the array length returned by buildSteps().
  // A mismatch breaks the progress bar and causes runtime errors.
  stepMeta: [
    { icon: '🔄', label: 'Recap', kind: 'narrate' },   // 0
    null,                                                  // 1 (pause = separator)
    { icon: '📝', label: 'Intro', kind: 'narrate' },     // 2
    { icon: '❓', label: 'Quiz', kind: 'quiz' },          // 3
    // ... one entry per step, including pauses (null)
  ],

  buildSteps(showSection, runner) {
    // Access block instances if needed for checkpoint checks:
    const myViz = runner.blockInstances.find(b => b.id === 'XY-sim');

    return [
      // Step 0: narrate with section reveal
      { type: 'show', action: () => showSection('sec-XY-intro'),
        text: "Narration text spoken aloud..." },

      // Step 1: pause (user clicks Continue)
      { type: 'pause' },

      // Step 2: narrate without showing new section
      { type: 'narrate',
        text: "More narration..." },

      // Step 3: quiz
      { type: 'quiz',
        text: "Short intro to the quiz.",
        question: "What is...?",
        options: ["A", "B", "C", "D"],
        correctIndex: 1,
        correctFeedback: "Correct! Because...",
        wrongFeedback: "Hint..." },

      // Step N: checkpoint (waits for user interaction)
      { type: 'checkpoint',
        instruction: 'Do X on the simulation',
        text: "Narration while they interact...",
        check: () => myViz?.renderer?.someState === true,
        checkInterval: 500,
        confirmText: "Great! You saw..." },
    ];
  },
};
```

### Step types

| Type | Purpose | Required fields |
|------|---------|-----------------|
| `show` | Reveals a section + narrates | `action` (calls showSection), `text` |
| `narrate` | Speaks text without showing a new section | `text` |
| `pause` | Waits for user to click Continue | (none) |
| `quiz` | Shows quiz modal | `text`, `question`, `options`, `correctIndex`, `correctFeedback`, `wrongFeedback` |
| `checkpoint` | Waits for a condition to be true | `instruction`, `text`, `check` (function → bool), `checkInterval` (ms), `confirmText` |

### Step 3: Create the narration JSON

Create `chemistry/app/lessons/lesson_X_Y.json`. This maps to the `text` fields in buildSteps:

```json
{
  "id": "lesson_X_Y",
  "steps": [
    { "text": "Narration for step 0..." },
    { "type": "pause" },
    { "text": "Narration for step 2..." },
    { "text": "Quiz intro text.", "confirmText": "optional confirm text" },
    ...
  ]
}
```

The JSON `steps` array must have entries for every step. Pause steps use `{ "type": "pause" }`. Steps with `confirmText` include it as a field. Steps that are quizzes just need the `text` (intro line).

### Step 4: Generate audio

```bash
cd chemistry/app
python3 generate_audio.py lessons/lesson_X_Y.json
```

This creates `audio/lesson_X_Y/step_00.mp3`, `step_01.mp3`, etc. Uses edge-tts with `en-US-AndrewMultilingualNeural` voice.

### Step 5: Create sim files (if needed)

Create `chemistry/app/sims/mySimViz.js`. Every sim file must self-register:

```js
import { registerSim } from './registry.js';

class MySimViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = opts.mode || 'default';
    this.running = true;
    this._animate();
  }

  _animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // ... draw
    requestAnimationFrame(() => this._animate());
  }

  stop() { this.running = false; }
}

// IMPORTANT: Use a factory wrapper. registerSim expects (canvas, opts) => instance
registerSim('mySimName', (canvas, opts) => new MySimViz(canvas, opts));
```

Key sim conventions:
- Dark background: `#0a0a1a`
- Use CSS variable colors: `--accent` (#00e5ff), `--green` (#4caf50), `--red` (#ff5252), `--orange` (#ff9800)
- Canvas default: 900×420
- Must have a `stop()` method to clean up animation frames
- Import sim file in the lesson JS: `import '../sims/mySimViz.js';`

### Sim design: event-driven visuals

**The sim IS the lesson.** It must be a rich, step-driven visual that changes as the narration progresses.

**Step-synced visuals:** The sim should expose a `setStep(n)` method or track the current step via the lesson runner. Each narration step triggers a different visual state:
- Step 0: Show a lone atom with empty parking spots
- Step 1: A second atom floats in — they're both "lonely"
- Step 2: Electrons start sharing — a bond forms
- Step 3: The bond is labeled, octet check highlights light up
- etc.

**Progressive reveal:** Don't dump everything on screen at once. Start with a blank or simple state and BUILD UP the visual as the narration introduces each piece. Elements should fade in, animate in, or draw themselves.

**One anchor molecule:** The sim should primarily animate ONE molecule being built up through the lesson. The whole visual journey follows that molecule.

**Canvas-rendered everything:** Formulas, tables, labels, diagrams — all drawn on canvas. No HTML text blocks outside the sim.

### Step 6: Register the lesson

In `chemistry/app/main.js`:
1. Add import: `import { lesson_X_Y } from './lessons/lesson_X_Y.js';`
2. Add to registry: `'X.Y': lesson_X_Y,`

### Step 7: Add to TOC

In `chemistry/app/index_v2.html`, add a `<div class="toc-item" data-lesson="X.Y">` inside the appropriate module group.

### Common pitfalls

1. **stepMeta length ≠ buildSteps length**: This is the #1 source of bugs. Count carefully. Add numbered comments (`// 0:`, `// 1:`, etc.) to both arrays.
2. **Missing factory wrapper in registerSim**: Must be `(canvas, opts) => new Class(canvas, opts)`, not `new Class` directly.
3. **Forgetting to import sim file**: The sim file self-registers on import. If you don't import it in the lesson JS, the sim won't be in the registry.
4. **No audio files**: Without MP3 files, the engine falls back to Web Speech API TTS which sounds different. Always generate audio.
5. **Block IDs must be unique** across the entire lesson (they become DOM element IDs).
6. **SimBlock.sim must match the string passed to registerSim()**.
7. **Checkpoint check function**: Must return a boolean. Access sim state via `runner.blockInstances.find(b => b.id === '...')?.renderer?.someProperty`.
