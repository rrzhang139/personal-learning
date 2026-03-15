import { registerSim } from './registry.js';

const BG      = '#0a0a1a';
const ACCENT  = '#00d4ff';
const GREEN   = '#4caf50';
const RED     = '#ef5350';
const ORANGE  = '#ff9800';
const WALL    = '#334';
const GREY    = '#888';

/* ---------- helpers ---------- */
function lerp(a, b, t) { return a + (b - a) * t; }
function speedColor(speed, maxSpeed) {
  const t = Math.min(speed / maxSpeed, 1);
  // blue → cyan → yellow → red
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

class GasPressureViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.W      = canvas.width;
    this.H      = canvas.height;
    this.running = true;

    /* --- state --- */
    this.temperature = opts.temperature || 300;      // Kelvin
    this.numParticles = opts.numParticles || 60;
    this.particleRadius = 4;

    // Container box (left portion of canvas)
    this.box = { x: 60, y: 50, w: 420, h: 320 };

    // Pressure tracking
    this.wallHits = 0;            // hits this sample window
    this.pressure = 0;            // displayed value (arbitrary units → scaled)
    this._sampleTimer = 0;
    this._sampleInterval = 500;   // ms between pressure updates
    this._lastTime = performance.now();

    // Interaction tracking for checkpoints
    this.tempChanges = 0;         // how many times user changed temperature
    this.maxPressureSeen = 0;
    this.minPressureSeen = Infinity;

    // Buttons
    this.buttons = [
      { id: 'tempUp',   label: '🔥 Heat (+50 K)',  x: 540, y: 80,  w: 170, h: 40 },
      { id: 'tempDown', label: '❄️ Cool (−50 K)',   x: 540, y: 130, w: 170, h: 40 },
      { id: 'addGas',   label: '➕ Add 10 particles', x: 540, y: 200, w: 170, h: 40 },
      { id: 'removeGas',label: '➖ Remove 10',       x: 540, y: 250, w: 170, h: 40 },
      { id: 'reset',    label: '↺ Reset',           x: 540, y: 320, w: 170, h: 40 },
    ];

    // Particles
    this.particles = [];
    this._initParticles(this.numParticles);

    // Flash effect on walls when hit
    this._wallFlash = { top: 0, bottom: 0, left: 0, right: 0 };

    // Mouse
    this._onClick = this._handleClick.bind(this);
    this.canvas.addEventListener('click', this._onClick);

    this._animate();
  }

  /* --- particles --- */
  _initParticles(n) {
    const b = this.box;
    const speed = this._speedFromTemp(this.temperature);
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const s = speed * (0.5 + Math.random());
      this.particles.push({
        x: b.x + 10 + Math.random() * (b.w - 20),
        y: b.y + 10 + Math.random() * (b.h - 20),
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
      });
    }
  }

  _speedFromTemp(T) {
    // Arbitrary but visually proportional: sqrt(T) scaled
    return Math.sqrt(T) * 0.35;
  }

  _rescaleSpeeds() {
    const target = this._speedFromTemp(this.temperature);
    for (const p of this.particles) {
      const curSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (curSpeed < 0.01) {
        const a = Math.random() * Math.PI * 2;
        p.vx = Math.cos(a) * target;
        p.vy = Math.sin(a) * target;
      } else {
        const scale = target / curSpeed * (0.8 + 0.4 * Math.random());
        p.vx *= scale;
        p.vy *= scale;
      }
    }
  }

  /* --- interaction --- */
  _handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.W / rect.width);
    const my = (e.clientY - rect.top) * (this.H / rect.height);

    for (const btn of this.buttons) {
      if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
        this._doAction(btn.id);
        return;
      }
    }
  }

  _doAction(id) {
    switch (id) {
      case 'tempUp':
        this.temperature = Math.min(this.temperature + 50, 1000);
        this._rescaleSpeeds();
        this.tempChanges++;
        break;
      case 'tempDown':
        this.temperature = Math.max(this.temperature - 50, 50);
        this._rescaleSpeeds();
        this.tempChanges++;
        break;
      case 'addGas':
        this._initParticles(10);
        this.numParticles = this.particles.length;
        break;
      case 'removeGas':
        if (this.particles.length > 10) {
          this.particles.splice(0, 10);
          this.numParticles = this.particles.length;
        }
        break;
      case 'reset':
        this.particles = [];
        this.temperature = 300;
        this.numParticles = 60;
        this._initParticles(60);
        this.wallHits = 0;
        this.pressure = 0;
        this.tempChanges = 0;
        this.maxPressureSeen = 0;
        this.minPressureSeen = Infinity;
        break;
    }
  }

  /* --- physics --- */
  _step(dt) {
    const b = this.box;
    const r = this.particleRadius;
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Wall collisions
      if (p.x - r < b.x) { p.x = b.x + r; p.vx = Math.abs(p.vx); this.wallHits++; this._wallFlash.left = 1; }
      if (p.x + r > b.x + b.w) { p.x = b.x + b.w - r; p.vx = -Math.abs(p.vx); this.wallHits++; this._wallFlash.right = 1; }
      if (p.y - r < b.y) { p.y = b.y + r; p.vy = Math.abs(p.vy); this.wallHits++; this._wallFlash.top = 1; }
      if (p.y + r > b.y + b.h) { p.y = b.y + b.h - r; p.vy = -Math.abs(p.vy); this.wallHits++; this._wallFlash.bottom = 1; }
    }
  }

  /* --- drawing --- */
  _drawBox(ctx) {
    const b = this.box;
    const f = this._wallFlash;
    const wallW = 3;

    // Draw each wall, flash brighter on hit
    const sides = [
      { key: 'top',    x1: b.x, y1: b.y,       x2: b.x + b.w, y2: b.y },
      { key: 'bottom', x1: b.x, y1: b.y + b.h, x2: b.x + b.w, y2: b.y + b.h },
      { key: 'left',   x1: b.x, y1: b.y,        x2: b.x,       y2: b.y + b.h },
      { key: 'right',  x1: b.x + b.w, y1: b.y,  x2: b.x + b.w, y2: b.y + b.h },
    ];
    for (const s of sides) {
      const flash = f[s.key];
      const alpha = 0.3 + 0.7 * flash;
      ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
      ctx.lineWidth = wallW + flash * 3;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      // Decay flash
      f[s.key] *= 0.85;
    }
  }

  _drawParticles(ctx) {
    const maxSpeed = this._speedFromTemp(1000);
    for (const p of this.particles) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      ctx.fillStyle = speedColor(speed, maxSpeed);
      ctx.beginPath();
      ctx.arc(p.x, p.y, this.particleRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawGauge(ctx) {
    const gx = 750, gy = 60, gw = 30, gh = 260;
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = GREY;
    ctx.lineWidth = 1;
    ctx.strokeRect(gx, gy, gw, gh);

    // Fill based on pressure (0-100 scale)
    const pNorm = Math.min(this.pressure / 120, 1);
    const fillH = gh * pNorm;
    const grad = ctx.createLinearGradient(gx, gy + gh, gx, gy);
    grad.addColorStop(0, GREEN);
    grad.addColorStop(0.5, ORANGE);
    grad.addColorStop(1, RED);
    ctx.fillStyle = grad;
    ctx.fillRect(gx + 2, gy + gh - fillH, gw - 4, fillH);

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Pressure', gx + gw / 2, gy - 10);
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${this.pressure.toFixed(0)}`, gx + gw / 2, gy + gh + 25);
    ctx.font = '12px monospace';
    ctx.fillText('(arb. units)', gx + gw / 2, gy + gh + 42);
  }

  _drawInfo(ctx) {
    const x = 540, y = 55;
    ctx.fillStyle = '#ccc';
    ctx.font = '15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Temperature: ${this.temperature} K`, x, y);
    ctx.fillText(`Particles:   ${this.particles.length}`, x, y + 355);
  }

  _drawButtons(ctx) {
    for (const btn of this.buttons) {
      ctx.fillStyle = '#1a1a2e';
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#eee';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
  }

  /* --- main loop --- */
  _animate() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this._lastTime) / 16.67, 3);  // normalise to ~60fps steps
    this._lastTime = now;

    // Physics
    this._step(dt);

    // Pressure sampling
    this._sampleTimer += (now - this._lastTime + dt * 16.67);
    if (this._sampleTimer >= this._sampleInterval) {
      // Pressure ∝ wallHits * avgSpeed / wallArea  (simplified)
      const wallPerimeter = 2 * (this.box.w + this.box.h);
      this.pressure = (this.wallHits / (this._sampleInterval / 1000)) * 0.15;
      if (this.pressure > this.maxPressureSeen) this.maxPressureSeen = this.pressure;
      if (this.pressure < this.minPressureSeen && this.pressure > 0) this.minPressureSeen = this.pressure;
      this.wallHits = 0;
      this._sampleTimer = 0;
    }

    // Draw
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    this._drawBox(ctx);
    this._drawParticles(ctx);
    this._drawGauge(ctx);
    this._drawInfo(ctx);
    this._drawButtons(ctx);

    requestAnimationFrame(() => this._animate());
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
  }
}

registerSim('gasPressureViz', (canvas, opts) => new GasPressureViz(canvas, opts));
