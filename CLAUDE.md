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
1. **Before each new topic**: List the prerequisite concepts we've already covered and briefly recap them
2. **Introduce the new concept**: Start with an analogy or visual, then get precise
3. **Show, don't just tell**: Provide simulations, diagrams, or interactive code whenever possible
4. **Distill into math**: After explaining the *why* and building intuition, compress the concept into its formal math/symbol representation. Always define every symbol. Explain *why* the equation has that form — what each term means physically and why the relationship exists. The math is for memorization; the explanation is for understanding. Format as: intuition first → equation → symbol definitions → "why it looks like this"
5. **Reinforce**: End each lesson with a quick check — a question or mini-exercise
5. **Connect forward**: Tease how this concept will be used in upcoming topics
6. **Log progress**: After each lesson or session, update `chemistry/progress_log.md` with date, topics covered, struggle points, and breakthroughs

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

Decide on sections, narration text, quizzes, and interactive checkpoints. Follow the teaching protocol: recap → introduce → show → math → quiz → tease next.

### Step 2: Create the lesson JS file

Create `chemistry/app/lessons/lesson_X_Y.js`. The export must be an object with this shape:

```js
import { TextBlock, CalloutBlock, MathBlock, TableBlock, SimBlock } from '../blocks/Block.js';
import '../sims/mySim.js'; // self-registers

export const lesson_X_Y = {
  id: 'X.Y',              // matches TOC data-lesson attribute
  lessonId: 'lesson_X_Y', // used for audio file path: audio/lesson_X_Y/
  title: 'Lesson Title',

  sections: [
    {
      id: 'sec-XY-intro',
      blocks: [
        new TextBlock({ id: 'XY-intro-title', tag: 'h2', html: 'Section Title' }),
        new TextBlock({ id: 'XY-intro-text', tag: 'p', html: 'Paragraph text...' }),
        new CalloutBlock({ id: 'XY-intro-callout', html: '<strong>Key point</strong>...' }),
        new MathBlock({ id: 'XY-intro-math', label: 'Formula:', equation: 'E = mc²', symbols: [
          { symbol: 'E', name: 'Energy', meaning: '...' },
        ]}),
        new SimBlock({ id: 'XY-sim', sim: 'mySimName', width: 900, height: 420, simOptions: { mode: 'default' } }),
      ]
    },
    // ... more sections
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
