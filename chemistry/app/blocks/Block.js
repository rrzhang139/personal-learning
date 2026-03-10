/**
 * @typedef {Object} BlockConfig
 * @property {string} id
 * @property {string} type
 */

export class Block {
  /** @param {BlockConfig} config */
  constructor(config) {
    this.id = config.id;
    this.type = config.type;
    /** @type {HTMLElement|null} */
    this.el = null;
  }

  /** @param {HTMLElement} container */
  render(container) {
    this.el = document.createElement('div');
    this.el.id = this.id;
    this.el.className = `block block--${this.type}`;
    container.appendChild(this.el);
    return this.el;
  }

  activate() {}
  deactivate() {}

  destroy() {
    if (this.el?.parentNode) this.el.parentNode.removeChild(this.el);
  }
}

export class TextBlock extends Block {
  constructor(config) {
    super({ ...config, type: 'text' });
    this.tag = config.tag || 'p';
    this.html = config.html;
  }

  render(container) {
    super.render(container);
    const el = document.createElement(this.tag);
    el.innerHTML = this.html;
    if (this.tag === 'h2') el.className = 'section-title';
    if (this.tag === 'h3') el.className = 'section-subtitle';
    this.el.appendChild(el);
    return this.el;
  }
}

export class CalloutBlock extends Block {
  constructor(config) {
    super({ ...config, type: 'callout' });
    this.html = config.html;
    this.style = config.style || 'info'; // 'info' | 'warning'
  }

  render(container) {
    super.render(container);
    this.el.className = `callout ${this.style === 'warning' ? 'warning' : ''}`;
    this.el.innerHTML = this.html;
    return this.el;
  }
}

export class MathBlock extends Block {
  constructor(config) {
    super({ ...config, type: 'math' });
    this.label = config.label || '';
    this.equation = config.equation;
    this.symbols = config.symbols || [];
  }

  render(container) {
    super.render(container);
    this.el.className = 'math-box';
    let html = '';
    if (this.label) html += `<div class="math-label">${this.label}</div>`;
    html += `<div class="equation">${this.equation}</div>`;
    if (this.symbols.length) {
      html += '<table class="symbol-table"><tr>';
      html += '<th>Symbol</th><th>Name</th>';
      if (this.symbols[0].units) html += '<th>Units</th>';
      html += '<th>Meaning</th></tr>';
      for (const s of this.symbols) {
        html += `<tr><td class="sym">${s.symbol}</td><td>${s.name}</td>`;
        if (s.units !== undefined) html += `<td>${s.units || ''}</td>`;
        html += `<td>${s.meaning}</td></tr>`;
      }
      html += '</table>';
    }
    this.el.innerHTML = html;
    return this.el;
  }
}

export class TableBlock extends Block {
  constructor(config) {
    super({ ...config, type: 'table' });
    this.headers = config.headers;
    this.rows = config.rows;
    this.maxWidth = config.maxWidth || '700px';
  }

  render(container) {
    super.render(container);
    this.el.style.maxWidth = this.maxWidth;
    this.el.style.margin = '0 auto';
    let html = '<table class="symbol-table"><tr>';
    for (const h of this.headers) html += `<th>${h}</th>`;
    html += '</tr>';
    for (const row of this.rows) {
      html += '<tr>';
      for (const cell of row) {
        if (typeof cell === 'object') {
          html += `<td style="${cell.style || ''}">${cell.text}</td>`;
        } else {
          html += `<td>${cell}</td>`;
        }
      }
      html += '</tr>';
    }
    html += '</table>';
    this.el.innerHTML = html;
    return this.el;
  }
}

export class SimBlock extends Block {
  constructor(config) {
    super({ ...config, type: 'sim' });
    this.simKey = config.sim;
    this.width = config.width || 500;
    this.height = config.height || 400;
    this.simOptions = config.simOptions || {};
    this.renderer = null;
    this.canvas = null;
  }

  render(container) {
    super.render(container);
    this.el.className = 'sim-canvas-wrap';
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.id = `${this.id}-canvas`;
    this.el.appendChild(this.canvas);
    return this.el;
  }

  /** @param {Map} registry */
  start(registry) {
    const factory = registry.get(this.simKey);
    if (factory) this.renderer = factory(this.canvas, this.simOptions);
  }

  destroy() {
    if (this.renderer?.stop) this.renderer.stop();
    super.destroy();
  }
}

export class SliderBlock extends Block {
  constructor(config) {
    super({ ...config, type: 'slider' });
    this.label = config.label;
    this.min = config.min;
    this.max = config.max;
    this.value = config.value;
    this.color = config.color || '';
    this.gradient = config.gradient || '';
    this.onChange = config.onChange || null;
    this.input = null;
    this.valueEl = null;
  }

  render(container) {
    super.render(container);
    this.el.className = 'slider-control';

    const label = document.createElement('label');
    label.textContent = this.label;
    if (this.color) label.style.color = this.color;

    this.input = document.createElement('input');
    this.input.type = 'range';
    this.input.min = this.min;
    this.input.max = this.max;
    this.input.value = this.value;
    if (this.gradient) this.input.style.background = this.gradient;

    this.valueEl = document.createElement('div');
    this.valueEl.className = 'value';
    this.valueEl.textContent = this.value;
    if (this.color) this.valueEl.style.color = this.color;

    this.input.addEventListener('input', () => {
      const v = parseInt(this.input.value);
      this.valueEl.textContent = v;
      if (this.onChange) this.onChange(v);
    });

    this.el.appendChild(label);
    this.el.appendChild(this.input);
    this.el.appendChild(this.valueEl);
    return this.el;
  }

  getValue() { return parseInt(this.input.value); }
  setValue(v) {
    this.input.value = v;
    this.valueEl.textContent = v;
  }
}

export class QuizBlock extends Block {
  constructor(config) {
    super({ ...config, type: 'quiz' });
    this.question = config.question;
    this.options = config.options;
    this.correctIndex = config.correctIndex;
    this.correctFeedback = config.correctFeedback || 'Correct!';
    this.wrongFeedback = config.wrongFeedback || 'Not quite — try again!';
  }

  /** Shows quiz modal and returns a promise that resolves when answered correctly */
  prompt() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'quiz-overlay';

      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.innerHTML = `<h3>${this.question}</h3><div class="quiz-options"></div><div class="quiz-feedback"></div><div class="quiz-actions"></div>`;
      overlay.appendChild(card);
      document.body.appendChild(overlay);

      const optionsEl = card.querySelector('.quiz-options');
      const feedbackEl = card.querySelector('.quiz-feedback');
      const actionsEl = card.querySelector('.quiz-actions');

      // Skip button
      const skipBtn = document.createElement('button');
      skipBtn.className = 'quiz-skip';
      skipBtn.textContent = 'Skip';
      skipBtn.onclick = () => { overlay.remove(); resolve(); };
      actionsEl.appendChild(skipBtn);

      this.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.onclick = () => {
          if (i === this.correctIndex) {
            feedbackEl.style.color = 'var(--green)';
            feedbackEl.textContent = this.correctFeedback;
            btn.classList.add('correct');
            optionsEl.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
            actionsEl.innerHTML = '';
            const continueBtn = document.createElement('button');
            continueBtn.className = 'quiz-continue';
            continueBtn.textContent = 'Continue';
            continueBtn.onclick = () => { overlay.remove(); resolve(); };
            actionsEl.appendChild(continueBtn);
          } else {
            feedbackEl.style.color = 'var(--red)';
            feedbackEl.textContent = this.wrongFeedback;
            btn.classList.add('wrong');
          }
        };
        optionsEl.appendChild(btn);
      });
    });
  }
}
