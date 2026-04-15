import { registerSim } from './registry.js';

const BG = '#0a0a1a';
const WHITE = '#fff';
const GREY = '#888';
const DIM = '#444';
const ACCENT = '#00e5ff';
const GREEN = '#4caf50';
const RED = '#ff5252';
const ORANGE = '#ff9800';
const YELLOW = '#fdd835';
const PURPLE = '#bb86fc';

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/**
 * Ideal Gas Sim — kinetic theory, physics-based
 *
 * Particles bounce in a 2D box. Pressure is measured from wall collisions.
 * Volume (box width), temperature (particle speed), and N (count) are adjustable.
 * Real-time pV=nRT verification on the info panel.
 */
class IdealGasViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;   // 900
    this.H = canvas.height;  // 500
    this.running = true;
    this._time = 0;
    this._lastTime = performance.now();

    // Box geometry (resizable width)
    this._boxLeft = 60;
    this._boxTop = 60;
    this._boxBottom = 460;
    this._boxRight = 540; // adjustable via volume

    // State variables
    this._tempK = 300;
    this._nParticles = 50;
    this._volumeFrac = 1.0; // 1.0 = full width, 0.5 = half

    // Particles
    this.particles = [];
    this._initParticles(this._nParticles);

    // Pressure measurement (rolling window of wall impulse)
    this._wallImpulse = 0;     // accumulated impulse this frame
    this._pressureSmoothed = 0; // displayed pressure (smoothed)
    this._impulseWindow = [];   // rolling window

    // Visual state
    this.phase = 'intro';
    this.showLabel = '';
    this.showSubLabel = '';
    this._showEquation = false;
    this._eqHighlight = '';  // 'p' | 'V' | 'T' | 'n' | ''
    this._addEnabled = false;

    // Click to add particles
    this._onClick = this._handleClick.bind(this);
    canvas.addEventListener('click', this._onClick);

    this._animate();
  }

  // --- Public API ---

  setVisualState(state) {
    if (state.phase !== undefined) this.phase = state.phase;
    if (state.showLabel !== undefined) this.showLabel = state.showLabel;
    if (state.showSubLabel !== undefined) this.showSubLabel = state.showSubLabel;
    if (state.showEquation !== undefined) this._showEquation = state.showEquation;
    if (state.eqHighlight !== undefined) this._eqHighlight = state.eqHighlight;
    if (state.addEnabled !== undefined) this._addEnabled = state.addEnabled;
  }

  setVolume(frac) {
    this._volumeFrac = clamp(frac, 0.3, 1.0);
    this._boxRight = this._boxLeft + (540 - this._boxLeft) * this._volumeFrac;
    // Push particles that are outside the new wall
    for (const p of this.particles) {
      if (p.x + p.r > this._boxRight - 2) {
        p.x = this._boxRight - p.r - 2;
        p.vx = -Math.abs(p.vx);
      }
    }
  }

  setTemperature(K) {
    const oldT = this._tempK;
    this._tempK = clamp(K, 100, 800);
    // Rescale velocities: v_new = v_old * sqrt(T_new / T_old)
    const scale = Math.sqrt(this._tempK / oldT);
    for (const p of this.particles) {
      p.vx *= scale;
      p.vy *= scale;
    }
  }

  addParticles(n) {
    for (let i = 0; i < n; i++) {
      this._spawnParticle();
    }
    this._nParticles = this.particles.length;
  }

  removeParticles(n) {
    for (let i = 0; i < n && this.particles.length > 5; i++) {
      this.particles.pop();
    }
    this._nParticles = this.particles.length;
  }

  get pressure() { return this._pressureSmoothed; }
  get volume() { return this._volumeFrac; }
  get temperature() { return this._tempK; }
  get nParticles() { return this.particles.length; }

  // pV/nT ratio (should ≈ constant for ideal gas)
  get pvNtRatio() {
    const n = this.particles.length;
    if (n === 0 || this._tempK === 0) return 0;
    return (this._pressureSmoothed * this._volumeFrac) / (n * this._tempK);
  }

  // --- Particle init ---

  _initParticles(n) {
    this.particles = [];
    for (let i = 0; i < n; i++) this._spawnParticle();
  }

  _spawnParticle() {
    const r = 3;
    const speed = this._speedForTemp();
    const angle = Math.random() * Math.PI * 2;
    this.particles.push({
      x: this._boxLeft + 10 + Math.random() * (this._boxRight - this._boxLeft - 20),
      y: this._boxTop + 10 + Math.random() * (this._boxBottom - this._boxTop - 20),
      vx: Math.cos(angle) * speed * (0.5 + Math.random()),
      vy: Math.sin(angle) * speed * (0.5 + Math.random()),
      r,
    });
  }

  _speedForTemp() {
    // Approximate: v_rms proportional to sqrt(T), scaled for pixels
    return Math.sqrt(this._tempK / 300) * 3;
  }

  // --- Click handler ---
  _handleClick(e) {
    if (!this._addEnabled) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.W / rect.width);
    const y = (e.clientY - rect.top) * (this.H / rect.height);
    if (x > this._boxLeft && x < this._boxRight && y > this._boxTop && y < this._boxBottom) {
      this.addParticles(5);
    }
  }

  // --- Physics ---

  _stepPhysics(dt) {
    const bl = this._boxLeft + 2;
    const br = this._boxRight - 2;
    const bt = this._boxTop + 2;
    const bb = this._boxBottom - 2;
    let impulse = 0;

    const targetSpeed = this._speedForTemp();

    for (const p of this.particles) {
      // Gentle thermostat — maintain temperature without damping
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > 0.01) {
        const desired = targetSpeed * (0.6 + Math.random() * 0.8);
        const scale = 1 + (desired / spd - 1) * 0.01;
        p.vx *= scale;
        p.vy *= scale;
      } else {
        const a = Math.random() * Math.PI * 2;
        p.vx = Math.cos(a) * targetSpeed;
        p.vy = Math.sin(a) * targetSpeed;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wall collisions — measure impulse transfer
      if (p.x - p.r < bl) {
        p.x = bl + p.r;
        impulse += Math.abs(p.vx) * 2;
        p.vx = Math.abs(p.vx);
      }
      if (p.x + p.r > br) {
        p.x = br - p.r;
        impulse += Math.abs(p.vx) * 2;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y - p.r < bt) {
        p.y = bt + p.r;
        impulse += Math.abs(p.vy) * 2;
        p.vy = Math.abs(p.vy);
      }
      if (p.y + p.r > bb) {
        p.y = bb - p.r;
        impulse += Math.abs(p.vy) * 2;
        p.vy = -Math.abs(p.vy);
      }
    }

    // Pressure from wall impulse (normalized by perimeter as proxy for area)
    const perimeter = 2 * ((br - bl) + (bb - bt));
    this._wallImpulse = perimeter > 0 ? impulse / perimeter : 0;

    // Smooth pressure with rolling average
    this._impulseWindow.push(this._wallImpulse);
    if (this._impulseWindow.length > 30) this._impulseWindow.shift();
    this._pressureSmoothed = this._impulseWindow.reduce((s, v) => s + v, 0) / this._impulseWindow.length;
  }

  // --- Drawing ---

  _drawBox(ctx) {
    const bl = this._boxLeft, br = this._boxRight;
    const bt = this._boxTop, bb = this._boxBottom;

    // Fill
    ctx.fillStyle = 'rgba(13,71,161,0.06)';
    ctx.fillRect(bl, bt, br - bl, bb - bt);

    // Walls with pressure glow
    const glow = clamp(this._pressureSmoothed * 80, 0, 1);
    ctx.strokeStyle = `rgba(0,229,255,${0.4 + glow * 0.6})`;
    ctx.lineWidth = 2 + glow * 2;
    ctx.strokeRect(bl, bt, br - bl, bb - bt);

    // Right wall piston handle
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(br - 4, bt, 8, bb - bt);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1;
    ctx.strokeRect(br - 4, bt, 8, bb - bt);
    // Grip lines
    ctx.strokeStyle = DIM;
    for (let y = bt + 20; y < bb; y += 15) {
      ctx.beginPath(); ctx.moveTo(br - 2, y); ctx.lineTo(br + 2, y); ctx.stroke();
    }
  }

  _drawParticles(ctx) {
    const t = this._time;
    for (const p of this.particles) {
      // Speed-based color (blue=slow → red=fast)
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const maxS = this._speedForTemp() * 2;
      const frac = clamp(speed / maxS, 0, 1);
      const r = Math.floor(50 + frac * 205);
      const g = Math.floor(180 - frac * 130);
      const b = Math.floor(255 - frac * 200);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawInfoPanel(ctx) {
    const px = 600, py = 60, pw = 280;
    ctx.fillStyle = '#0d1117';
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(px, py, pw, 380, 8); ctx.fill(); ctx.stroke();

    ctx.textAlign = 'left';
    let y = py + 30;

    // State variables
    const hl = this._eqHighlight;
    const vars = [
      { label: 'Pressure (p)', value: `${(this._pressureSmoothed * 1000).toFixed(1)}`, unit: 'arb.', key: 'p', color: RED },
      { label: 'Volume (V)', value: `${(this._volumeFrac * 100).toFixed(0)}%`, unit: '', key: 'V', color: ACCENT },
      { label: 'Temperature (T)', value: `${this._tempK}`, unit: 'K', key: 'T', color: ORANGE },
      { label: 'Particles (N)', value: `${this.particles.length}`, unit: '', key: 'n', color: GREEN },
    ];

    for (const v of vars) {
      const active = hl === v.key;
      ctx.fillStyle = active ? v.color : GREY;
      ctx.font = active ? 'bold 13px monospace' : '12px monospace';
      ctx.fillText(v.label, px + 15, y);
      ctx.fillStyle = active ? WHITE : v.color;
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`${v.value} ${v.unit}`, px + 15, y + 22);
      y += 50;
    }

    // Equation
    if (this._showEquation) {
      y += 10;
      ctx.fillStyle = '#111828';
      ctx.strokeStyle = PURPLE;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(px + 10, y, pw - 20, 70, 6); ctx.fill(); ctx.stroke();

      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      // pV = nRT — color each variable
      const cx = px + pw / 2;
      const parts = [
        { text: 'p', color: hl === 'p' ? RED : '#aaa' },
        { text: 'V', color: hl === 'V' ? ACCENT : '#aaa' },
        { text: ' = ', color: '#666' },
        { text: 'n', color: hl === 'n' ? GREEN : '#aaa' },
        { text: 'R', color: '#666' },
        { text: 'T', color: hl === 'T' ? ORANGE : '#aaa' },
      ];
      let tx = cx - 50;
      ctx.textAlign = 'left';
      for (const pt of parts) {
        ctx.fillStyle = pt.color;
        ctx.fillText(pt.text, tx, y + 30);
        tx += ctx.measureText(pt.text).width;
      }

      // pV/nT ratio
      const ratio = this.pvNtRatio;
      const baseRatio = ratio > 0 ? ratio : 0;
      const normalizedR = this._nParticles > 0 && this._pressureSmoothed > 0
        ? (this._pressureSmoothed * this._volumeFrac) / (50 * this._tempK)
        : 0;
      ctx.fillStyle = GREY;
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('pV/NkT ≈ const (ideal gas check)', cx, y + 55);
    }
  }

  _drawSpeedHistogram(ctx) {
    // Small speed distribution in corner
    const hx = 610, hy = 420, hw = 120, hh = 35;
    const bins = new Array(10).fill(0);
    const maxS = this._speedForTemp() * 3;
    for (const p of this.particles) {
      const s = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const bin = clamp(Math.floor((s / maxS) * 10), 0, 9);
      bins[bin]++;
    }
    const maxBin = Math.max(...bins, 1);
    ctx.fillStyle = GREY;
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Speed distribution', hx + hw / 2, hy - 4);
    for (let i = 0; i < 10; i++) {
      const barH = (bins[i] / maxBin) * hh;
      const frac = i / 10;
      const r = Math.floor(50 + frac * 205);
      const g = Math.floor(180 - frac * 130);
      const b = Math.floor(255 - frac * 200);
      ctx.fillStyle = `rgba(${r},${g},${b},0.7)`;
      ctx.fillRect(hx + i * (hw / 10), hy + hh - barH, hw / 10 - 1, barH);
    }
  }

  _render(ctx) {
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    this._drawBox(ctx);
    this._drawParticles(ctx);
    this._drawInfoPanel(ctx);
    this._drawSpeedHistogram(ctx);

    // Click hint
    if (this._addEnabled) {
      ctx.fillStyle = `rgba(76,175,80,${0.4 + 0.2 * Math.sin(this._time * 3)})`;
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Click inside box to add particles', (this._boxLeft + this._boxRight) / 2, this._boxBottom + 20);
    }

    // Labels
    if (this.showLabel) {
      ctx.fillStyle = WHITE; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showLabel, (this._boxLeft + this._boxRight) / 2, 30);
    }
    if (this.showSubLabel) {
      ctx.fillStyle = GREY; ctx.font = '12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showSubLabel, (this._boxLeft + this._boxRight) / 2, 48);
    }
  }

  _animate() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this._lastTime) / 1000, 0.05);
    this._lastTime = now;
    this._time += dt;

    // 2 substeps
    this._stepPhysics(dt / 2);
    this._stepPhysics(dt / 2);

    this._render(this.ctx);
    requestAnimationFrame(() => this._animate());
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
  }
}

registerSim('idealGasViz', (canvas, opts) => new IdealGasViz(canvas, opts));
