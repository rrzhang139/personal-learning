/**
 * LessonRunner — orchestrates blocks, narrative engine, progress bar, and question system.
 * Usage:
 *   const runner = new LessonRunner(containerEl, toolbarEl);
 *   runner.loadLesson(lessonDef);
 */

import { NarrativeEngine } from './NarrativeEngine.js';
import { registry } from '../sims/registry.js';

export class LessonRunner {
  constructor(containerEl, toolbarEl) {
    this.container = containerEl;
    this.toolbar = toolbarEl;

    // Create UI elements
    this.statusEl = toolbarEl.querySelector('.status');
    this.btnStart = toolbarEl.querySelector('#btnStart');
    this.btnPause = toolbarEl.querySelector('#btnPause');
    this.btnSkip = toolbarEl.querySelector('#btnSkip');
    this.btnRestart = toolbarEl.querySelector('#btnRestart');

    // Engine
    this.engine = new NarrativeEngine(containerEl, this.statusEl);

    // State
    this.currentLesson = null;
    this.sectionEls = {};
    this.blockInstances = [];
    this.progressBar = null;
    this.transcript = null;
    this.visibleSteps = [];

    // Question system
    this.questionBar = null;
    this.answerBubble = null;
    this.qWs = null;
    this.qConnected = false;

    this._bindControls();
  }

  _bindControls() {
    this.btnStart.addEventListener('click', () => {
      this.engine.start();
      this.btnStart.textContent = 'Playing...';
      this.btnStart.disabled = true;
      this.btnPause.style.display = '';
    });

    this.btnPause.addEventListener('click', () => {
      const isPaused = this.engine.togglePause();
      this.btnPause.textContent = isPaused ? 'Resume' : 'Pause';
      this.btnPause.style.borderColor = isPaused ? '#ff9800' : '#444';
      this.statusEl.textContent = isPaused ? 'Paused' : '';
    });

    this.btnSkip.addEventListener('click', () => this.engine.skip());

    this.btnRestart.addEventListener('click', () => {
      this.engine.stop();
      if (this.currentLesson) this.loadLesson(this.currentLesson);
    });

    document.addEventListener('keydown', (e) => {
      if (e.code !== 'Space') return;

      const qInput = document.getElementById('questionInput');
      const isInQuestionBar = e.target === qInput;

      if (isInQuestionBar) {
        // If input is empty, Space toggles back: blur + resume
        if (qInput.value.trim() === '') {
          e.preventDefault();
          qInput.blur();
          if (this.engine.running && this.engine.paused) {
            this.engine.togglePause();
            this.btnPause.textContent = 'Pause';
            this.btnPause.style.borderColor = '#444';
            this.statusEl.textContent = '';
          }
        }
        // Otherwise let space type normally
        return;
      }

      // Space anywhere else: pause audio + focus question bar
      e.preventDefault();
      if (this.engine.running && !this.engine.paused) {
        this.engine.togglePause();
        this.btnPause.textContent = 'Resume';
        this.btnPause.style.borderColor = '#ff9800';
        this.statusEl.textContent = 'Paused';
      }
      if (qInput) qInput.focus();
    });

    // Escape from question bar: blur + resume audio
    document.addEventListener('keydown', (e) => {
      if (e.code !== 'Escape') return;
      const qInput = document.getElementById('questionInput');
      if (document.activeElement === qInput) {
        e.preventDefault();
        qInput.blur();
        // Resume if paused
        if (this.engine.running && this.engine.paused) {
          this.engine.togglePause();
          this.btnPause.textContent = 'Pause';
          this.btnPause.style.borderColor = '#444';
          this.statusEl.textContent = '';
        }
      }
    });
  }

  /**
   * Load and render a lesson definition.
   * @param {Object} lessonDef - { id, lessonId, sections: [...], stepMeta: [...], buildSteps: fn }
   */
  loadLesson(lessonDef) {
    // Cleanup previous
    this.engine.stop();
    this._cleanup();
    this.currentLesson = lessonDef;

    this.btnStart.textContent = 'Start Lesson';
    this.btnStart.disabled = false;
    this.btnPause.textContent = 'Pause';

    // Clear container
    this.container.innerHTML = '';

    // Progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'step-progress';
    this.container.appendChild(this.progressBar);

    // Render sections
    this.sectionEls = {};
    this.blockInstances = [];

    for (const section of lessonDef.sections) {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'lesson-section';
      sectionEl.id = section.id;
      this.container.appendChild(sectionEl);
      this.sectionEls[section.id] = sectionEl;

      for (const block of section.blocks) {
        block.render(sectionEl);
        this.blockInstances.push(block);

        // Start simulations
        if (block.simKey && block.canvas) {
          block.start(registry);
        }
      }
    }

    // Question bar — placed in toolbar (fixed at top)
    this._createQuestionBar();

    // Transcript
    this.transcript = document.createElement('div');
    this.transcript.className = 'transcript';
    this.transcript.textContent = 'Waiting to start...';
    this.container.appendChild(this.transcript);

    // Wire narration transcript
    this.engine.onNarrate = (text) => {
      this.transcript.textContent = text;
    };

    // Build show helper
    const showSection = (id) => {
      const el = this.sectionEls[id];
      if (el) {
        el.classList.add('visible');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // Build steps
    const steps = lessonDef.buildSteps(showSection, this);

    // Progress bar
    this.visibleSteps = [];
    lessonDef.stepMeta.forEach((meta, i) => {
      if (meta) this.visibleSteps.push({ index: i, meta });
    });
    this._renderProgress(-1, 0);

    // Load engine
    this.engine.load(steps, lessonDef.lessonId);

    this.engine.onStepChange = (i) => this._renderProgress(i, i);
    this.engine.onStepComplete = (i) => this._renderProgress(i, i + 1);

    // Connect question server
    this._connectQuestion();
  }

  _renderProgress(currentStep, completedUpTo) {
    this.progressBar.innerHTML = '';
    this.visibleSteps.forEach((vs, vi) => {
      if (vi > 0) {
        const conn = document.createElement('div');
        conn.className = 'step-connector';
        if (vs.index < completedUpTo) conn.classList.add('completed');
        this.progressBar.appendChild(conn);
      }
      const dot = document.createElement('div');
      dot.className = 'step-dot';
      if (vs.meta.kind === 'checkpoint') dot.classList.add('checkpoint');
      if (vs.meta.kind === 'quiz') dot.classList.add('quiz');
      if (vs.index < completedUpTo) dot.classList.add('completed');
      if (vs.index === currentStep) dot.classList.add('active');

      const icon = document.createElement('div');
      icon.className = 'icon';
      icon.textContent = vs.index < completedUpTo ? '✓' : vs.meta.icon;

      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = vs.meta.label;

      dot.appendChild(icon);
      dot.appendChild(label);
      this.progressBar.appendChild(dot);
    });
  }

  _createQuestionBar() {
    // Use the question bar already in the toolbar HTML
    this.questionBar = document.getElementById('questionBar');

    // Create answer bubble in the lesson container if not present
    let bubble = document.getElementById('answerBubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'answer-bubble';
      bubble.id = 'answerBubble';
      this.container.insertBefore(bubble, this.container.firstChild);
    }
    this.answerBubble = bubble;

    const input = this.questionBar.querySelector('#questionInput');
    const sendBtn = this.questionBar.querySelector('#questionSend');

    // Remove old listeners by cloning
    const newSend = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(newSend, sendBtn);
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    newSend.addEventListener('click', () => this._askQuestion());
    newInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._askQuestion();
    });
  }

  _connectQuestion() {
    if (this.qWs && this.qWs.readyState <= 1) return;
    try {
      this.qWs = new WebSocket('ws://localhost:8081');
      const qStatus = this.questionBar.querySelector('#qStatus');
      this.qWs.onopen = () => { this.qConnected = true; qStatus.textContent = ''; };
      this.qWs.onclose = () => { this.qConnected = false; };
      this.qWs.onerror = () => { this.qConnected = false; };
      this.qWs.onmessage = (event) => this._handleQuestionResponse(JSON.parse(event.data));
    } catch(e) {
      this.qConnected = false;
    }
  }

  _handleQuestionResponse(msg) {
    const qStatus = this.questionBar.querySelector('#qStatus');
    const input = this.questionBar.querySelector('#questionInput');
    const sendBtn = this.questionBar.querySelector('#questionSend');

    if (msg.type === 'answer_text') {
      this.answerBubble.textContent = msg.text;
      this.answerBubble.classList.add('visible');
      this.answerBubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      this.transcript.textContent = msg.text;
      qStatus.textContent = 'generating voice...';
    }

    if (msg.type === 'answer_audio') {
      qStatus.textContent = '';
      const audio = new Audio(msg.url);
      audio.onended = () => {
        sendBtn.disabled = false;
        input.disabled = false;
        input.value = '';
        input.focus();
        setTimeout(() => this.answerBubble.classList.remove('visible'), 3000);
      };
      audio.onerror = () => this._fallbackSpeak(this.answerBubble.textContent);
      audio.play().catch(() => this._fallbackSpeak(this.answerBubble.textContent));
    }

    if (msg.type === 'answer_done' || msg.type === 'error') {
      qStatus.textContent = '';
      if (msg.type === 'error') {
        this.answerBubble.textContent = msg.text;
        this.answerBubble.classList.add('visible');
      }
      if (this.answerBubble.textContent) {
        this._fallbackSpeak(this.answerBubble.textContent);
      } else {
        sendBtn.disabled = false;
        input.disabled = false;
      }
    }
  }

  _fallbackSpeak(text) {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0;
    const input = this.questionBar.querySelector('#questionInput');
    const sendBtn = this.questionBar.querySelector('#questionSend');
    utt.onend = () => {
      sendBtn.disabled = false;
      input.disabled = false;
      input.value = '';
      setTimeout(() => this.answerBubble.classList.remove('visible'), 3000);
    };
    synth.speak(utt);
  }

  _askQuestion() {
    const input = this.questionBar.querySelector('#questionInput');
    const sendBtn = this.questionBar.querySelector('#questionSend');
    const qStatus = this.questionBar.querySelector('#qStatus');
    const text = input.value.trim();
    if (!text) return;

    if (!this.qConnected) {
      this._connectQuestion();
      setTimeout(() => {
        if (this.qConnected) this._askQuestion();
        else {
          qStatus.textContent = 'Not connected. Run: node chat-server.mjs';
          setTimeout(() => qStatus.textContent = '', 4000);
        }
      }, 1000);
      return;
    }

    if (this.engine.running && !this.engine.paused) {
      this.engine.togglePause();
      this.btnPause.textContent = 'Resume';
    }

    const lessonContext = this.transcript.textContent || 'General chemistry lesson';
    sendBtn.disabled = true;
    input.disabled = true;
    qStatus.textContent = 'thinking...';

    this.qWs.send(JSON.stringify({
      type: 'question',
      text,
      lessonContext: `Current narrator text: "${lessonContext}"`,
    }));
  }

  _cleanup() {
    for (const block of this.blockInstances) {
      block.destroy();
    }
    this.blockInstances = [];
    this.sectionEls = {};
    if (this.qWs) {
      this.qWs.close();
      this.qWs = null;
      this.qConnected = false;
    }
  }
}
