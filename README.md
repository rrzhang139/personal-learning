# Personal Learning — Interactive Chemistry

An interactive, audio-narrated chemistry course with simulations, quizzes, and a built-in Claude Code chat tutor.

## Quick Start

```bash
# 1. Start the web server
cd ~/projects/personal/personal-learning
python3 -m http.server 8080

# 2. Open in browser
open http://localhost:8080/chemistry/app/index.html
```

That's it for the lessons. Click "Start Lesson", use the sidebar to switch between modules.

## Ask Questions Mid-Lesson

There's a question box below the lesson content. Type any question and hit Enter:

1. The lesson **pauses automatically**
2. Your question + current lesson context is sent to **Claude Code** (your CC subscription, no API key)
3. Claude's answer is **spoken aloud in the same narrator voice** (edge-tts)
4. After the answer finishes, you resume the lesson

### Setup (one-time)

```bash
cd ~/projects/personal/personal-learning

# Install dependencies
npm install        # ws package for WebSocket
pip3 install edge-tts   # for narrator voice on responses
```

### Start the question server

In a **separate normal terminal** (not inside Claude Code):

```bash
cd ~/projects/personal/personal-learning
node chemistry/app/chat-server.mjs
```

You should see:
```
Question server running on ws://localhost:8081
```

### How it works

```
You type a question
    ↓ lesson pauses
    ↓ WebSocket (port 8081)
chat-server.mjs
    ↓ claude -p "<question + lesson context>" --print
    ↓ edge-tts generates MP3 of the response
    ↓ sends text + audio URL back
Browser plays the answer in narrator voice
    ↓ lesson resumes
```

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot find package 'ws'` | Run `npm install` in the project root |
| "Not connected" in the app | Start `node chemistry/app/chat-server.mjs` in a separate terminal |
| `Cannot be launched inside another Claude Code session` | Run the server from a **normal terminal**, not inside Claude Code |
| No response | Check `claude --version` works in your terminal |
| No audio on response | Check `edge-tts --version` works. Falls back to browser voice if unavailable |

## Running Everything (3 terminals)

```bash
# Terminal 1: HTTP server for the app
cd ~/projects/personal/personal-learning && python3 -m http.server 8080

# Terminal 2: Chat bridge to Claude Code
cd ~/projects/personal/personal-learning && node chemistry/app/chat-server.mjs

# Terminal 3: Open browser
open http://localhost:8080/chemistry/app/index.html
```

## Generating Audio for New Lessons

Lessons use pre-generated MP3 files from Microsoft's neural TTS (free, high quality).

```bash
# Install edge-tts (one-time)
pip3 install edge-tts

# Generate audio for a lesson
cd chemistry/app
python3 generate_audio.py lessons/lesson_1_4.json
python3 generate_audio.py lessons/lesson_2_1.json
```

Audio files are saved to `chemistry/app/audio/<lesson_id>/`.

## Project Structure

```
personal-learning/
├── CLAUDE.md                          # Learning preferences & teaching protocol
├── README.md                          # This file
├── chemistry/
│   ├── app/
│   │   ├── index.html                 # Main app (sidebar, toolbar, all lessons)
│   │   ├── narrative.js               # Narrative engine (audio + checkpoints)
│   │   ├── chat-server.mjs            # WebSocket bridge to Claude Code
│   │   ├── generate_audio.py          # TTS audio generator (edge-tts)
│   │   ├── serve.sh                   # Quick-start server script
│   │   ├── audio/                     # Pre-generated MP3 narration files
│   │   │   ├── lesson_1_4/
│   │   │   └── lesson_2_1/
│   │   └── lessons/                   # Lesson definitions
│   │       ├── lesson_1_4.json
│   │       ├── lesson_2_1.json
│   │       └── lesson_2_1.html        # Module 2 visuals & interactive atom builder
│   ├── module_01_what_is_matter/      # Reference materials
│   │   ├── lesson.md
│   │   ├── sim_states_of_matter.py
│   │   └── sim_states_of_matter.html
│   ├── module_01_what_is_matter.ipynb  # Jupyter notebook (supplementary)
│   └── progress_log.md               # Session log & struggle points
└── package.json
```
