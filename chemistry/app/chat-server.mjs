/**
 * Question Server
 * ================
 * When the student asks a question mid-lesson:
 *   1. Receives question + lesson context via WebSocket
 *   2. Sends it to Claude Code (your CC subscription, no API key)
 *   3. Generates audio of the response using edge-tts (same narrator voice)
 *   4. Sends back the text + audio URL for the browser to play
 *
 * Start:  node chat-server.mjs
 * WS:     ws://localhost:8081
 *
 * Run from a NORMAL terminal, not inside Claude Code.
 */

import { WebSocketServer } from 'ws';
import { spawn, execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { createServer } from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = resolve(__dirname, '../..');
const AUDIO_DIR = join(__dirname, 'audio', '_responses');
const CLAUDE_PATH = process.env.CLAUDE_PATH || 'claude';
const VOICE = 'en-US-AndrewMultilingualNeural';

// Ensure audio output dir exists
mkdirSync(AUDIO_DIR, { recursive: true });

let questionCount = 0;

const SYSTEM_PROMPT = `You are a chemistry tutor narrating an interactive lesson.
The student paused the lesson to ask a question. Answer concisely and clearly.
Keep it conversational — your response will be spoken aloud by a narrator.
Do NOT use markdown, bullet points, code blocks, or special formatting.
Write in natural spoken English, as if you're talking to the student.
Keep answers under 4 sentences unless the question requires more.
Connect to concepts already covered when possible.`;

const wss = new WebSocketServer({ port: 8081 });
console.log('Question server running on ws://localhost:8081');
console.log(`Project: ${PROJECT_DIR}`);
console.log(`Voice: ${VOICE}`);
console.log('Waiting for questions...\n');

wss.on('connection', (ws) => {
  console.log('Browser connected');

  ws.on('message', async (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type !== 'question') return;

    const { text, lessonContext } = msg;
    questionCount++;
    const qId = String(questionCount).padStart(3, '0');
    console.log(`\n[Q${qId}] "${text}"`);
    if (lessonContext) console.log(`  Context: ${lessonContext.slice(0, 100)}...`);

    // Step 1: Get answer from Claude
    const prompt = `${SYSTEM_PROMPT}\n\nLesson context: ${lessonContext || 'General chemistry'}\n\nStudent asks: ${text}`;

    const env = { ...process.env };
    // Remove all Claude Code session markers so claude CLI doesn't refuse to run
    delete env.CLAUDECODE;
    delete env.CLAUDE_CODE_ENTRY_POINT;
    delete env.CLAUDE_CODE_SESSION;
    delete env.CLAUDE_PARENT_SESSION_ID;
    // Remove any other CLAUDE_ env vars that might block nested sessions
    for (const key of Object.keys(env)) {
      if (key.startsWith('CLAUDE_') && key !== 'CLAUDE_PATH') delete env[key];
    }

    let answer = '';
    try {
      answer = await new Promise((resolve, reject) => {
        const proc = spawn(CLAUDE_PATH, ['-p', prompt], {
          cwd: PROJECT_DIR,
          env,
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        let out = '';
        let errOut = '';
        proc.stdout.on('data', (chunk) => { out += chunk.toString(); });
        proc.stderr.on('data', (chunk) => {
          const t = chunk.toString().trim();
          errOut += t + '\n';
          if (t && !t.includes('WARN')) console.log(`  claude stderr: ${t.slice(0, 150)}`);
        });
        proc.on('close', (code) => {
          if (out.trim()) resolve(out.trim());
          else reject(new Error(`claude exited with code ${code}, no output. stderr: ${errOut.slice(0, 300)}`));
        });
        proc.on('error', (err) => reject(new Error(`Failed to spawn claude: ${err.message}`)));

        // Close stdin immediately so claude doesn't wait for input
        proc.stdin.end();

        // 60s timeout
        const timeout = setTimeout(() => {
          console.log(`  Timeout: killing claude process after 60s`);
          proc.kill('SIGTERM');
          reject(new Error('Claude timed out after 60s'));
        }, 60000);
        proc.on('close', () => clearTimeout(timeout));
      });
    } catch (err) {
      console.error(`  Claude error: ${err.message}`);
      ws.send(JSON.stringify({ type: 'error', text: `Claude error: ${err.message}` }));
      return;
    }

    console.log(`  A: ${answer.slice(0, 120).replace(/\n/g, ' ')}...`);

    // Send text immediately so browser can show it
    ws.send(JSON.stringify({ type: 'answer_text', text: answer }));

    // Step 2: Generate audio with edge-tts
    const audioFile = join(AUDIO_DIR, `q${qId}.mp3`);
    const audioUrl = `audio/_responses/q${qId}.mp3`;

    try {
      await new Promise((resolve, reject) => {
        const proc = spawn('edge-tts', [
          '--voice', VOICE,
          '--rate', '+5%',
          '--text', answer,
          '--write-media', audioFile,
        ], { env });
        proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`edge-tts exit ${code}`)));
        proc.on('error', reject);
      });

      console.log(`  Audio: ${audioUrl}`);
      ws.send(JSON.stringify({ type: 'answer_audio', url: audioUrl }));
    } catch (err) {
      console.error(`  TTS error: ${err.message}`);
      // Still have text, browser can fall back to Web Speech API
      ws.send(JSON.stringify({ type: 'answer_done' }));
    }
  });

  ws.on('close', () => console.log('Browser disconnected'));
});
