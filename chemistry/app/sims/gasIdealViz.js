import { registerSim } from './registry.js';

const BG     = '#0a0a1a';
const ACCENT = '#00d4ff';
const GREEN  = '#4caf50';
const RED    = '#ef5350';
const ORANGE = '#ff9800';
const GREY   = '#888';
const WALL   = '#00e5ff';

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function speedColor(speed, maxSpeed) {
  const t = clamp(speed / maxSpeed, 0, 1);
  if (t < 0.33) {
    const u = t / 0.33;
    return `rgb(${Math.round(lerp(80, 0, u))},${Math.round(lerp(120, 200, u))},${Math.round(lerp(255, 255, u))})`;
  } else if (t < 0.66) {
    const u = (t - 0.33) / 0.33;
    return `rgb(${Math.round(lerp(0, 255, u))},${Math.round(lerp(200, 220, u))},${Math.round(lerp(255, 50, u))})`;
  }
  const u = (t - 0.66) / 0.34;
  return `rgb(${Math.round(lerp(255, 255, u))},${Math.round(lerp(220, 60, u))},${Math.round(lerp(50, 30, u))})`;
}

/**
 * Ideal Gas Law Simulator
 *
 * Four sliders: P, V, n, T. Changing any three computes the fourth via PV = nRT.
 * Container visually shows particles at correct density and speed.
 * PV = nRT readout always visible.
 *
 * Mode: user picks which variable to "solve for" (lock icon), adjusts the other three.
 */
class GasIdealViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;

    // R = 0.08206 L·atm/(mol·K)
    this.R = 0.08206;

    // State
    this.P = 1.0;    // atm
    this.V = 10.0;   // L
    this.n = 0.5;    // mol
    this.T = 243.5;  // K  (computed: PV/nR = 1*10/(0.5*0.08206) ≈ 243.5)
    this.solveFor = 'T'; // which variable is computed

    // Recalculate to be consistent
    this._recalc();

    // Container box (scales with V)
    this.boxLeft = 40;
    this.boxTop = 50;
    this.boxMaxW = 380;
    this.boxH = 260;

    // Particles
    this.particles = [];
    this._rebuildParticles();

    // Sliders
    this.sliders = [
      { id: 'P', label: 'Pressure (atm)', min: 0.2, max: 10, step: 0.1, color: ORANGE },
      { id: 'V', label: 'Volume (L)',      min: 1,   max: 20, step: 0.5, color: ACCENT },
      { id: 'n', label: 'Moles (mol)',     min: 0.1, max: 3,  step: 0.1, color: GREEN },
      { id: 'T', label: 'Temp (K)',        min: 50,  max: 800, step: 10, color: RED },
    ];
    this.sliderX = 470;
    this.sliderW = 180;
    this.sliderStartY = 60;
    this.sliderSpacing = 90;

    // Solve-for buttons
    this.solveButtons = this.sliders.map((s, i) => ({
      id: s.id,
      x: this.sliderX + this.sliderW + 20,
      y: this.sliderStartY + i * this.sliderSpacing + 12,
      w: 70,
      h: 24,
    }));

    // Interaction tracking
    this.interactions = 0;
    this.hasSolvedForP = false;
    this.hasSolvedForV = false;
    this.hasSolvedForT = false;
    this.hasSolvedForN = false;
    this.hasChangedThreeVars = false;
    this._varsChanged = new Set();

    // Dragging
    this.dragging = null; // slider id
    this._onDown = this._handleDown.bind(this);
    this._onMove = this._handleMove.bind(this);
    this._onUp = this._handleUp.bind(this);
    this.canvas.addEventListener('mousedown', this._onDown);
    this.canvas.addEventListener('mousemove', this._onMove);
    this.canvas.addEventListener('mouseup', this._onUp);
    this.canvas.addEventListener('mouseleave', this._onUp);
    this.canvas.addEventListener('touchstart', this._onDown, { passive: false });
    this.canvas.addEventListener('touchmove', this._onMove, { passive: false });
    this.canvas.addEventListener('touchend', this._onUp);

    this._lastTime = performance.now();
    this._animate();
  }

  _recalc() {
    switch (this.solveFor) {
      case 'P': this.P = clamp((this.n * this.R * this.T) / this.V, 0.01, 999); break;
      case 'V': this.V = clamp((this.n * this.R * this.T) / this.P, 0.1, 999); break;
      case 'n': this.n = clamp((this.P * this.V) / (this.R * this.T), 0.01, 999); break;
      case 'T': this.T = clamp((this.P * this.V) / (this.n * this.R), 1, 9999); break;
    }
  }

  _rebuildParticles() {
    // Number of visual particles proportional to n (capped for performance)
    const count = Math.round(clamp(this.n * 40, 5, 120));
    const speed = this._speedFromTemp(this.T);
    const boxW = this._boxWidth();

    this.particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const s = speed * (0.5 + Math.random());
      this.particles.push({
        x: this.boxLeft + 5 + Math.random() * (boxW - 10),
        y: this.boxTop + 5 + Math.random() * (this.boxH - 10),
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
      });
    }
  }

  _speedFromTemp(T) { return Math.sqrt(T) * 0.3; }

  _boxWidth() {
    // V mapped to visual width (1-20 L → 40-380 px)
    return 40 + (clamp(this.V, 1, 20) - 1) / 19 * (this.boxMaxW - 40);
  }

  _rescaleSpeeds() {
    const target = this._speedFromTemp(this.T);
    for (const p of this.particles) {
      const cur = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (cur < 0.01) {
        const a = Math.random() * Math.PI * 2;
        p.vx = Math.cos(a) * target;
        p.vy = Math.sin(a) * target;
      } else {
        const scale = target / cur * (0.8 + 0.4 * Math.random());
        p.vx *= scale;
        p.vy *= scale;
      }
    }
  }

  /* --- input --- */
  _getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    if (e.touches) return {
      x: (e.touches[0].clientX - rect.left) * (this.W / rect.width),
      y: (e.touches[0].clientY - rect.top) * (this.H / rect.height),
    };
    return {
      x: (e.clientX - rect.left) * (this.W / rect.width),
      y: (e.clientY - rect.top) * (this.H / rect.height),
    };
  }

  _handleDown(e) {
    const { x, y } = this._getPos(e);

    // Check solve-for buttons
    for (const btn of this.solveButtons) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        this.solveFor = btn.id;
        if (btn.id === 'P') this.hasSolvedForP = true;
        if (btn.id === 'V') this.hasSolvedForV = true;
        if (btn.id === 'T') this.hasSolvedForT = true;
        if (btn.id === 'n') this.hasSolvedForN = true;
        this._recalc();
        this._rebuildParticles();
        return;
      }
    }

    // Check sliders
    for (let i = 0; i < this.sliders.length; i++) {
      const s = this.sliders[i];
      if (s.id === this.solveFor) continue; // can't drag computed slider
      const sy = this.sliderStartY + i * this.sliderSpacing + 35;
      if (y >= sy - 10 && y <= sy + 10 && x >= this.sliderX && x <= this.sliderX + this.sliderW) {
        this.dragging = s.id;
        this._updateSlider(s, x);
        if (e.touches) e.preventDefault();
        return;
      }
    }
  }

  _handleMove(e) {
    if (!this.dragging) return;
    if (e.touches) e.preventDefault();
    const { x } = this._getPos(e);
    const s = this.sliders.find(sl => sl.id === this.dragging);
    if (s) this._updateSlider(s, x);
  }

  _handleUp() { this.dragging = null; }

  _updateSlider(s, mx) {
    const frac = clamp((mx - this.sliderX) / this.sliderW, 0, 1);
    const raw = s.min + frac * (s.max - s.min);
    const val = Math.round(raw / s.step) * s.step;
    this[s.id] = clamp(val, s.min, s.max);
    this._recalc();

    this._varsChanged.add(s.id);
    if (this._varsChanged.size >= 3) this.hasChangedThreeVars = true;
    this.interactions++;

    // Adjust particles
    this._rebuildParticles();
  }

  /* --- physics --- */
  _step(dt) {
    const r = 3.5;
    const left = this.boxLeft;
    const right = this.boxLeft + this._boxWidth();
    const top = this.boxTop;
    const bottom = this.boxTop + this.boxH;

    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x - r < left)  { p.x = left + r;  p.vx = Math.abs(p.vx); }
      if (p.x + r > right) { p.x = right - r;  p.vx = -Math.abs(p.vx); }
      if (p.y - r < top)   { p.y = top + r;    p.vy = Math.abs(p.vy); }
      if (p.y + r > bottom){ p.y = bottom - r;  p.vy = -Math.abs(p.vy); }
    }
  }

  /* --- drawing --- */
  _drawContainer(ctx) {
    const w = this._boxWidth();
    ctx.strokeStyle = WALL;
    ctx.lineWidth = 3;
    ctx.strokeRect(this.boxLeft, this.boxTop, w, this.boxH);

    // Volume label inside
    ctx.fillStyle = 'rgba(0,229,255,0.15)';
    ctx.fillRect(this.boxLeft + 1, this.boxTop + 1, w - 2, this.boxH - 2);
  }

  _drawParticles(ctx) {
    const maxSpeed = this._speedFromTemp(800) * 1.5;
    for (const p of this.particles) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      ctx.fillStyle = speedColor(speed, maxSpeed);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawSliders(ctx) {
    for (let i = 0; i < this.sliders.length; i++) {
      const s = this.sliders[i];
      const sy = this.sliderStartY + i * this.sliderSpacing;
      const isSolving = s.id === this.solveFor;

      // Label
      ctx.fillStyle = isSolving ? '#fff' : '#ccc';
      ctx.font = isSolving ? 'bold 13px monospace' : '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(s.label, this.sliderX, sy + 12);

      // Value
      let val = this[s.id];
      let disp = s.id === 'T' ? `${val.toFixed(0)} K` :
                 s.id === 'P' ? `${val.toFixed(2)} atm` :
                 s.id === 'V' ? `${val.toFixed(1)} L` :
                                `${val.toFixed(2)} mol`;
      ctx.fillStyle = s.color;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(disp, this.sliderX, sy + 28);

      // Track
      const ty = sy + 35;
      ctx.fillStyle = isSolving ? '#333' : '#222';
      ctx.fillRect(this.sliderX, ty - 3, this.sliderW, 6);

      // Fill
      const frac = clamp((val - s.min) / (s.max - s.min), 0, 1);
      ctx.fillStyle = isSolving ? '#444' : s.color;
      ctx.fillRect(this.sliderX, ty - 3, this.sliderW * frac, 6);

      // Thumb
      const tx = this.sliderX + this.sliderW * frac;
      ctx.fillStyle = isSolving ? '#666' : '#fff';
      ctx.beginPath();
      ctx.arc(tx, ty, isSolving ? 5 : 8, 0, Math.PI * 2);
      ctx.fill();

      if (isSolving) {
        ctx.fillStyle = '#ff0';
        ctx.font = '10px monospace';
        ctx.fillText('← computed', tx + 12, ty + 4);
      }
    }
  }

  _drawSolveButtons(ctx) {
    for (const btn of this.solveButtons) {
      const active = btn.id === this.solveFor;
      ctx.fillStyle = active ? '#1a3a2a' : '#1a1a2e';
      ctx.strokeStyle = active ? GREEN : '#444';
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? GREEN : '#aaa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(active ? `Solve ${btn.id}` : `Solve ${btn.id}`, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
  }

  _drawEquation(ctx) {
    const y = this.boxTop + this.boxH + 30;

    // PV = nRT readout
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PV = nRT  check:', this.boxLeft, y);

    const pv = this.P * this.V;
    const nrt = this.n * this.R * this.T;

    ctx.font = '14px monospace';
    ctx.fillStyle = ORANGE;
    ctx.fillText(`PV  = ${this.P.toFixed(2)} × ${this.V.toFixed(1)} = ${pv.toFixed(2)}`, this.boxLeft, y + 22);
    ctx.fillStyle = GREEN;
    ctx.fillText(`nRT = ${this.n.toFixed(2)} × 0.0821 × ${this.T.toFixed(0)} = ${nrt.toFixed(2)}`, this.boxLeft, y + 42);

    // Match indicator
    const diff = Math.abs(pv - nrt);
    ctx.fillStyle = diff < 0.5 ? GREEN : RED;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(diff < 0.5 ? '✓ Balanced!' : '✗ Mismatch', this.boxLeft + 320, y + 32);
  }

  _animate() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this._lastTime) / 16.67, 3);
    this._lastTime = now;

    this._step(dt);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    this._drawContainer(ctx);
    this._drawParticles(ctx);
    this._drawSliders(ctx);
    this._drawSolveButtons(ctx);
    this._drawEquation(ctx);

    requestAnimationFrame(() => this._animate());
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('mousedown', this._onDown);
    this.canvas.removeEventListener('mousemove', this._onMove);
    this.canvas.removeEventListener('mouseup', this._onUp);
    this.canvas.removeEventListener('mouseleave', this._onUp);
    this.canvas.removeEventListener('touchstart', this._onDown);
    this.canvas.removeEventListener('touchmove', this._onMove);
    this.canvas.removeEventListener('touchend', this._onUp);
  }
}

registerSim('gasIdealViz', (canvas, opts) => new GasIdealViz(canvas, opts));
