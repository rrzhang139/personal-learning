/**
 * Narrative Engine v2 (ES Module)
 * Uses pre-generated MP3 audio files (from edge-tts) for natural narration.
 * Falls back to Web Speech API if audio files not found.
 */

export class NarrativeEngine {
  constructor(containerEl, statusEl) {
    this.container = containerEl;
    this.statusEl = statusEl;
    this.steps = [];
    this.currentStep = 0;
    this.lessonId = '';
    this.audioBasePath = 'audio';
    this.currentAudio = null;
    this.paused = false;
    this.running = false;
    this.waitingFor = null;
    this._resolveWait = null;
    this._resolvePause = null;
    this.onStepChange = null;
    this.onStepComplete = null;
    this.onNarrate = null;

    this.synth = window.speechSynthesis;
    this.voice = null;
    this.rate = 1.0;
    this._initVoice();
  }

  _initVoice() {
    const pickVoice = () => {
      const voices = this.synth.getVoices();
      this.voice = voices.find(v => v.name.includes('Samantha')) ||
                   voices.find(v => v.lang.startsWith('en') && v.localService) ||
                   voices.find(v => v.lang.startsWith('en')) ||
                   voices[0];
    };
    pickVoice();
    this.synth.onvoiceschanged = pickVoice;
  }

  load(steps, lessonId) {
    this.steps = steps;
    this.lessonId = lessonId;
    this.currentStep = 0;
  }

  async start(fromStep = 0) {
    this.running = true;
    this.paused = false;
    for (let i = fromStep; i < this.steps.length; i++) {
      if (!this.running) break;
      this.currentStep = i;
      if (this.onStepChange) this.onStepChange(i);
      await this._executeStep(this.steps[i], i);
      if (this.onStepComplete) this.onStepComplete(i);
    }
    if (this.running) this._setStatus('Lesson complete!');
    this.running = false;
  }

  async skipToStep(stepIndex) {
    this.stop();
    await this._sleep(100);
    this.start(stepIndex);
  }

  stop() {
    this.running = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.synth.cancel();
    if (this._resolveWait) { this._resolveWait(); this._resolveWait = null; }
    if (this._resolvePause) { this._resolvePause(); this._resolvePause = null; }
  }

  togglePause() {
    if (!this.running) return;
    if (this.paused) {
      this.paused = false;
      if (this.currentAudio && this.currentAudio.paused) this.currentAudio.play();
      if (this._resolvePause) { this._resolvePause(); this._resolvePause = null; }
      return false;
    } else {
      this.paused = true;
      if (this.currentAudio && !this.currentAudio.paused) this.currentAudio.pause();
      return true;
    }
  }

  async _executeStep(step, index) {
    if (this.paused) await this._waitForUnpause();

    switch (step.type) {
      case 'narrate':
        this._setStatus('Listening...');
        if (step.highlight) this._highlight(step.highlight);
        await this._playAudio(index, step.text);
        break;

      case 'show':
        if (step.action) step.action();
        if (step.text) {
          this._setStatus('Listening...');
          await this._playAudio(index, step.text);
        }
        break;

      case 'checkpoint':
        this._setStatus(`Action required: ${step.instruction}`);
        if (step.action) step.action();
        if (step.text) await this._playAudio(index, step.text);
        this._showInstruction(step.instruction);
        await this._waitForCondition(step.check, step.checkInterval || 200);
        this._hideInstruction();
        if (step.onComplete) step.onComplete();
        if (step.confirmText) await this._playAudio(index, step.confirmText, '_confirm');
        this._setStatus('');
        break;

      case 'quiz':
        this._setStatus('Answer the question!');
        if (step.text) await this._playAudio(index, step.text);
        await this._showQuiz(step);
        this._setStatus('');
        break;

      case 'pause':
        await this._sleep(step.duration || 800);
        break;
    }
  }

  async _playAudio(stepIndex, fallbackText, suffix = '') {
    if (this.onNarrate) this.onNarrate(fallbackText);
    const audioPath = `${this.audioBasePath}/${this.lessonId}/step_${String(stepIndex).padStart(2, '0')}${suffix}.mp3`;

    return new Promise((resolve) => {
      const audio = new Audio(audioPath);
      this.currentAudio = audio;

      audio.onended = () => { this.currentAudio = null; resolve(); };
      audio.onerror = () => {
        this.currentAudio = null;
        this._speakTTS(fallbackText).then(resolve);
      };

      if (!this.paused) {
        audio.play().catch(() => {
          this.currentAudio = null;
          this._speakTTS(fallbackText).then(resolve);
        });
      } else {
        this._waitForUnpause().then(() => {
          audio.play().catch(() => {
            this.currentAudio = null;
            this._speakTTS(fallbackText).then(resolve);
          });
        });
      }
    });
  }

  _speakTTS(text) {
    return new Promise((resolve) => {
      this.synth.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      if (this.voice) utt.voice = this.voice;
      utt.rate = this.rate;
      utt.onend = resolve;
      utt.onerror = resolve;
      this.synth.speak(utt);
    });
  }

  _waitForUnpause() {
    if (!this.paused) return Promise.resolve();
    return new Promise((resolve) => { this._resolvePause = resolve; });
  }

  _waitForCondition(checkFn, interval) {
    return new Promise((resolve) => {
      this._resolveWait = resolve;
      const poll = setInterval(() => {
        if (!this.running) { clearInterval(poll); resolve(); return; }
        if (checkFn()) {
          clearInterval(poll);
          this._resolveWait = null;
          resolve();
        }
      }, interval);
    });
  }

  _showInstruction(text) {
    let el = document.getElementById('narrative-instruction');
    if (!el) {
      el = document.createElement('div');
      el.id = 'narrative-instruction';
      el.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: #ff9800; color: #000; padding: 14px 28px; border-radius: 12px;
        font-size: 16px; font-weight: bold; z-index: 1000;
        box-shadow: 0 4px 20px rgba(255,152,0,0.4);
        animation: pulse 1.5s infinite;
      `;
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.display = 'block';
  }

  _hideInstruction() {
    const el = document.getElementById('narrative-instruction');
    if (el) el.style.display = 'none';
  }

  _showQuiz(step) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'quiz-overlay';
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.innerHTML = `<h3>${step.question}</h3><div class="quiz-options"></div><div class="quiz-feedback"></div>`;
      overlay.appendChild(card);
      document.body.appendChild(overlay);

      const optionsEl = card.querySelector('.quiz-options');
      const feedbackEl = card.querySelector('.quiz-feedback');

      step.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.onclick = () => {
          if (i === step.correctIndex) {
            feedbackEl.style.color = 'var(--green)';
            feedbackEl.textContent = step.correctFeedback || 'Correct!';
            btn.classList.add('correct');
            setTimeout(() => { overlay.remove(); resolve(); }, 1500);
          } else {
            feedbackEl.style.color = 'var(--red)';
            feedbackEl.textContent = step.wrongFeedback || 'Not quite — try again!';
            btn.classList.add('wrong');
          }
        };
        optionsEl.appendChild(btn);
      });
    });
  }

  _highlight(selector) {
    document.querySelectorAll('.narrative-highlight').forEach(el =>
      el.classList.remove('narrative-highlight'));
    const el = document.querySelector(selector);
    if (el) el.classList.add('narrative-highlight');
  }

  _setStatus(text) {
    if (this.statusEl) this.statusEl.textContent = text;
  }

  _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  skip() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = this.currentAudio.duration || 0;
      this.currentAudio.dispatchEvent(new Event('ended'));
    }
    this.synth.cancel();
    if (this._resolveWait) { this._resolveWait(); this._resolveWait = null; }
  }
}
