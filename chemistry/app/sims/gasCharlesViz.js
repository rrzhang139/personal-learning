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

class GasCharlesViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;

    // Container: fixed left, top, bottom walls. Right wall (piston) floats to maintain constant P
    this.boxLeft = 60;
    this.boxTop = 60;
    this.boxBottom = 370;
    this.boxH = this.boxBottom - this.boxTop;

    // Temperature & volume
    this.temperature = opts.temperature || 300; // K
    this.baseTemp = 300;
    this.minTemp = 50;
    this.maxTemp = 700;

    // Piston position tracks volume (proportional to T at constant P)
    this.pistonX = 400; // will be recalculated
    this.pistonMinX = 120;
    this.pistonMaxX = 520;
    this._updatePistonFromTemp();

    // Particles
    this.numParticles = 50;
    this.particleRadius = 4;
    this.particles = [];
    this._initParticles();

    // Graph data: V vs T
    this.graphData = [];

    // Interaction tracking
    this.tempChanges = 0;
    this.maxTempSeen = this.temperature;
    this.minTempSeen = this.temperature;
    this.hasHeatedAbove500 = false;
    this.hasCooledBelow150 = false;

    // Buttons
    this.buttons = [
      { id: 'heat50',  label: '🔥 Heat (+50 K)',  x: 560, y: 75,  w: 170, h: 38 },
      { id: 'cool50',  label: '❄️ Cool (−50 K)',   x: 560, y: 120, w: 170, h: 38 },
      { id: 'heat100', label: '🔥🔥 Heat (+100 K)', x: 560, y: 170, w: 170, h: 38 },
      { id: 'cool100', label: '❄️❄️ Cool (−100 K)', x: 560, y: 215, w: 170, h: 38 },
      { id: 'reset',   label: '↺ Reset (300 K)',   x: 560, y: 275, w: 170, h: 38 },
    ];

    this._onClick = this._handleClick.bind(this);
    this.canvas.addEventListener('click', this._onClick);

    this._lastTime = performance.now();
    this._animate();
  }

  _updatePistonFromTemp() {
    // V ∝ T (Charles's Law at constant P)
    // Map T range to piston range
    const tFrac = (this.temperature - this.minTemp) / (this.maxTemp - this.minTemp);
    this.pistonX = this.pistonMinX + tFrac * (this.pistonMaxX - this.pistonMinX);
  }

  _initParticles() {
    this.particles = [];
    const speed = this._speedFromTemp(this.temperature);
    for (let i = 0; i < this.numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const s = speed * (0.5 + Math.random());
      this.particles.push({
        x: this.boxLeft + 10 + Math.random() * (this.pistonX - this.boxLeft - 20),
        y: this.boxTop + 10 + Math.random() * (this.boxH - 20),
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
      });
    }
  }

  _speedFromTemp(T) {
    return Math.sqrt(T) * 0.35;
  }

  _rescaleSpeeds() {
    const target = this._speedFromTemp(this.temperature);
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
    const oldTemp = this.temperature;
    switch (id) {
      case 'heat50':  this.temperature = Math.min(this.temperature + 50, this.maxTemp); break;
      case 'cool50':  this.temperature = Math.max(this.temperature - 50, this.minTemp); break;
      case 'heat100': this.temperature = Math.min(this.temperature + 100, this.maxTemp); break;
      case 'cool100': this.temperature = Math.max(this.temperature - 100, this.minTemp); break;
      case 'reset':
        this.temperature = 300;
        this.graphData = [];
        this.tempChanges = 0;
        this.maxTempSeen = 300;
        this.minTempSeen = 300;
        this.hasHeatedAbove500 = false;
        this.hasCooledBelow150 = false;
        break;
    }
    if (this.temperature !== oldTemp) {
      this.tempChanges++;
      if (this.temperature > this.maxTempSeen) this.maxTempSeen = this.temperature;
      if (this.temperature < this.minTempSeen) this.minTempSeen = this.temperature;
      if (this.temperature >= 500) this.hasHeatedAbove500 = true;
      if (this.temperature <= 150) this.hasCooledBelow150 = true;
    }
    this._updatePistonFromTemp();
    this._rescaleSpeeds();
    // Record data point
    this.graphData.push({ t: this.temperature, v: this.volumeL });
    if (this.graphData.length > 100) this.graphData.shift();
  }

  get volumeL() {
    // Map piston position to 1-10 L
    const frac = (this.pistonX - this.pistonMinX) / (this.pistonMaxX - this.pistonMinX);
    return 1 + frac * 9;
  }

  get vtRatio() {
    return this.volumeL / this.temperature;
  }

  /* --- physics --- */
  _step(dt) {
    const r = this.particleRadius;
    const left = this.boxLeft;
    const right = this.pistonX;
    const top = this.boxTop;
    const bottom = this.boxBottom;

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
    ctx.strokeStyle = WALL;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(this.boxLeft, this.boxTop); ctx.lineTo(this.boxLeft, this.boxBottom); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(this.boxLeft, this.boxTop); ctx.lineTo(this.pistonX, this.boxTop); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(this.boxLeft, this.boxBottom); ctx.lineTo(this.pistonX, this.boxBottom); ctx.stroke();

    // Piston
    const px = this.pistonX;
    ctx.fillStyle = '#2a4a5a';
    ctx.fillRect(px - 7, this.boxTop, 14, this.boxH);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 7, this.boxTop, 14, this.boxH);

    // Weight on top showing constant pressure
    ctx.fillStyle = '#444';
    ctx.fillRect(px - 30, this.boxTop - 25, 60, 20);
    ctx.strokeStyle = GREY;
    ctx.strokeRect(px - 30, this.boxTop - 25, 60, 20);
    ctx.fillStyle = '#ccc';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('const P', px, this.boxTop - 11);
  }

  _drawParticles(ctx) {
    const maxSpeed = this._speedFromTemp(this.maxTemp) * 1.5;
    for (const p of this.particles) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      ctx.fillStyle = speedColor(speed, maxSpeed);
      ctx.beginPath();
      ctx.arc(p.x, p.y, this.particleRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawReadouts(ctx) {
    const x = 560, y = 55;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Temp: ${this.temperature} K`, x, y);

    ctx.font = '13px monospace';
    ctx.fillStyle = ACCENT;
    ctx.fillText(`Volume: ${this.volumeL.toFixed(1)} L`, x, y + 270);
    ctx.fillStyle = GREEN;
    ctx.fillText(`V/T: ${this.vtRatio.toFixed(4)} L/K`, x, y + 290);
    ctx.fillStyle = '#aaa';
    ctx.font = '11px monospace';
    ctx.fillText('(V/T should stay ≈ const!)', x, y + 310);
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
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
  }

  _drawGraph(ctx) {
    const gx = 560, gy = 380, gw = 220, gh = 30;
    // Simple temperature bar
    ctx.fillStyle = '#0f0f1f';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(gx, gy, gw, gh);

    const tFrac = (this.temperature - this.minTemp) / (this.maxTemp - this.minTemp);
    const grad = ctx.createLinearGradient(gx, gy, gx + gw, gy);
    grad.addColorStop(0, '#4488ff');
    grad.addColorStop(0.5, ORANGE);
    grad.addColorStop(1, RED);
    ctx.fillStyle = grad;
    ctx.fillRect(gx, gy, gw * tFrac, gh);

    ctx.fillStyle = '#ccc';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.minTemp}K`, gx, gy + gh + 12);
    ctx.textAlign = 'right';
    ctx.fillText(`${this.maxTemp}K`, gx + gw, gy + gh + 12);
    ctx.textAlign = 'center';
    ctx.fillText('Temperature', gx + gw / 2, gy - 4);
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
    this._drawReadouts(ctx);
    this._drawButtons(ctx);
    this._drawGraph(ctx);

    requestAnimationFrame(() => this._animate());
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
  }
}

registerSim('gasCharlesViz', (canvas, opts) => new GasCharlesViz(canvas, opts));
