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

class GasBoylesViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;

    // Container: left wall fixed, right wall is piston
    this.boxLeft = 60;
    this.boxTop = 60;
    this.boxBottom = 370;
    this.boxH = this.boxBottom - this.boxTop;
    this.pistonMinX = 180;   // min piston position (most compressed)
    this.pistonMaxX = 520;   // max piston position (most expanded)
    this.pistonX = opts.pistonX || 520;  // start fully expanded
    this.pistonW = 14;

    // Initial state for PV product
    this.initialVolume = this.pistonMaxX - this.boxLeft;
    this.initialPressure = 1.0; // atm

    // Particles
    this.numParticles = 50;
    this.particleRadius = 4;
    this.baseSpeed = 3.5;
    this.particles = [];
    this._initParticles();

    // Pressure tracking
    this.wallHits = 0;
    this.pressure = this.initialPressure;
    this._sampleTimer = 0;
    this._sampleInterval = 300;

    // Graph data: P vs V
    this.graphData = [];
    this._recordInterval = 200;
    this._recordTimer = 0;

    // Interaction tracking for checkpoints
    this.hasCompressed = false;   // piston moved to < 60% of max
    this.hasExpanded = false;     // piston moved to > 90% of max
    this.dragCount = 0;
    this.minVolumeReached = 1.0;  // fraction of max volume
    this.pvProductSeen = [];      // track PV products to show constancy

    // Dragging
    this.dragging = false;
    this._onDown = this._handleDown.bind(this);
    this._onMove = this._handleMove.bind(this);
    this._onUp = this._handleUp.bind(this);
    this.canvas.addEventListener('mousedown', this._onDown);
    this.canvas.addEventListener('mousemove', this._onMove);
    this.canvas.addEventListener('mouseup', this._onUp);
    this.canvas.addEventListener('mouseleave', this._onUp);
    // Touch
    this.canvas.addEventListener('touchstart', this._onDown, { passive: false });
    this.canvas.addEventListener('touchmove', this._onMove, { passive: false });
    this.canvas.addEventListener('touchend', this._onUp);

    this._lastTime = performance.now();
    this._animate();
  }

  _initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const s = this.baseSpeed * (0.5 + Math.random());
      this.particles.push({
        x: this.boxLeft + 10 + Math.random() * (this.pistonX - this.boxLeft - 20),
        y: this.boxTop + 10 + Math.random() * (this.boxH - 20),
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
      });
    }
  }

  /* --- input handling --- */
  _getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * (this.W / rect.width),
        y: (e.touches[0].clientY - rect.top) * (this.H / rect.height),
      };
    }
    return {
      x: (e.clientX - rect.left) * (this.W / rect.width),
      y: (e.clientY - rect.top) * (this.H / rect.height),
    };
  }

  _handleDown(e) {
    const { x, y } = this._getPos(e);
    // Check if near piston
    if (Math.abs(x - this.pistonX) < 20 && y >= this.boxTop - 10 && y <= this.boxBottom + 10) {
      this.dragging = true;
      this.dragCount++;
      if (e.touches) e.preventDefault();
    }
  }

  _handleMove(e) {
    if (!this.dragging) return;
    if (e.touches) e.preventDefault();
    const { x } = this._getPos(e);
    const newX = clamp(x, this.pistonMinX, this.pistonMaxX);

    // Push particles out of piston path
    for (const p of this.particles) {
      if (p.x + this.particleRadius > newX) {
        p.x = newX - this.particleRadius - 1;
        p.vx = -Math.abs(p.vx);
      }
      if (p.x - this.particleRadius < this.boxLeft) {
        p.x = this.boxLeft + this.particleRadius + 1;
      }
    }

    this.pistonX = newX;

    // Track compression/expansion
    const volFrac = (this.pistonX - this.boxLeft) / this.initialVolume;
    if (volFrac < 0.55) this.hasCompressed = true;
    if (volFrac > 0.9) this.hasExpanded = true;
    if (volFrac < this.minVolumeReached) this.minVolumeReached = volFrac;
  }

  _handleUp() {
    this.dragging = false;
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

      if (p.x - r < left)  { p.x = left + r;  p.vx = Math.abs(p.vx);  this.wallHits++; }
      if (p.x + r > right) { p.x = right - r;  p.vx = -Math.abs(p.vx); this.wallHits++; }
      if (p.y - r < top)   { p.y = top + r;    p.vy = Math.abs(p.vy);  this.wallHits++; }
      if (p.y + r > bottom){ p.y = bottom - r;  p.vy = -Math.abs(p.vy); this.wallHits++; }
    }
  }

  /* --- computed values --- */
  get volume() {
    return (this.pistonX - this.boxLeft) / this.initialVolume; // fraction 0-1
  }

  get volumeL() {
    // Map to 1-10 L range
    return this.volume * 10;
  }

  get pressureAtm() {
    // Boyle's Law: P = P₀V₀/V = 1*10/V_L
    const v = this.volumeL;
    return v > 0.1 ? (this.initialPressure * 10) / v : 100;
  }

  get pvProduct() {
    return this.pressureAtm * this.volumeL;
  }

  /* --- drawing --- */
  _drawContainer(ctx) {
    // Fixed walls (left, top, bottom)
    ctx.strokeStyle = WALL;
    ctx.lineWidth = 3;
    // Left wall
    ctx.beginPath(); ctx.moveTo(this.boxLeft, this.boxTop); ctx.lineTo(this.boxLeft, this.boxBottom); ctx.stroke();
    // Top wall
    ctx.beginPath(); ctx.moveTo(this.boxLeft, this.boxTop); ctx.lineTo(this.pistonX, this.boxTop); ctx.stroke();
    // Bottom wall
    ctx.beginPath(); ctx.moveTo(this.boxLeft, this.boxBottom); ctx.lineTo(this.pistonX, this.boxBottom); ctx.stroke();

    // Piston (right wall) - thicker, with grip lines
    const px = this.pistonX;
    ctx.fillStyle = '#2a4a5a';
    ctx.fillRect(px - this.pistonW / 2, this.boxTop, this.pistonW, this.boxH);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.strokeRect(px - this.pistonW / 2, this.boxTop, this.pistonW, this.boxH);

    // Grip lines on piston
    ctx.strokeStyle = 'rgba(0,229,255,0.4)';
    ctx.lineWidth = 1;
    for (let gy = this.boxTop + 20; gy < this.boxBottom - 10; gy += 15) {
      ctx.beginPath();
      ctx.moveTo(px - 4, gy);
      ctx.lineTo(px + 4, gy);
      ctx.stroke();
    }

    // Arrow hint
    ctx.fillStyle = 'rgba(0,229,255,0.5)';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⟷', px, this.boxTop - 15);
    ctx.font = '11px sans-serif';
    ctx.fillText('drag piston', px, this.boxTop - 30);
  }

  _drawParticles(ctx) {
    const maxSpeed = this.baseSpeed * 2;
    for (const p of this.particles) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      ctx.fillStyle = speedColor(speed, maxSpeed);
      ctx.beginPath();
      ctx.arc(p.x, p.y, this.particleRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawReadouts(ctx) {
    const x = 570, y = 60;
    const pAtm = this.pressureAtm;
    const vL = this.volumeL;
    const pv = this.pvProduct;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Readouts', x, y);

    ctx.font = '14px monospace';
    ctx.fillStyle = ACCENT;
    ctx.fillText(`Volume:   ${vL.toFixed(1)} L`, x, y + 35);
    ctx.fillStyle = ORANGE;
    ctx.fillText(`Pressure: ${pAtm.toFixed(2)} atm`, x, y + 60);
    ctx.fillStyle = GREEN;
    ctx.fillText(`P × V:   ${pv.toFixed(1)} L·atm`, x, y + 85);

    // Highlight PV constancy
    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.fillText('(P×V should stay ≈ constant!)', x, y + 110);

    // Visual bar for pressure
    const barX = x, barY = y + 140, barW = 200, barH = 20;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = GREY;
    ctx.strokeRect(barX, barY, barW, barH);
    const pFrac = clamp(pAtm / 10, 0, 1);
    const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    grad.addColorStop(0, GREEN);
    grad.addColorStop(0.5, ORANGE);
    grad.addColorStop(1, RED);
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW * pFrac, barH);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Pressure', barX + barW / 2, barY + 15);

    // Visual bar for volume
    const vBarY = barY + 35;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(barX, vBarY, barW, barH);
    ctx.strokeStyle = GREY;
    ctx.strokeRect(barX, vBarY, barW, barH);
    const vFrac = clamp(vL / 10, 0, 1);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(barX, vBarY, barW * vFrac, barH);
    ctx.fillStyle = '#fff';
    ctx.fillText('Volume', barX + barW / 2, vBarY + 15);
  }

  _drawGraph(ctx) {
    // Mini P vs V graph
    const gx = 570, gy = 280, gw = 200, gh = 100;

    // Background
    ctx.fillStyle = '#0f0f1f';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(gx, gy, gw, gh);

    // Axes labels
    ctx.fillStyle = '#aaa';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('V (L) →', gx + gw / 2, gy + gh + 14);
    ctx.save();
    ctx.translate(gx - 12, gy + gh / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('P (atm) →', 0, 0);
    ctx.restore();

    ctx.fillStyle = '#666';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('10', gx - 2, gy + 10);
    ctx.fillText('0', gx - 2, gy + gh);
    ctx.textAlign = 'left';
    ctx.fillText('0', gx, gy + gh + 10);
    ctx.fillText('10', gx + gw - 5, gy + gh + 10);

    // Ideal Boyle's curve (PV=10)
    ctx.strokeStyle = 'rgba(0,229,255,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let v = 1; v <= 10; v += 0.2) {
      const p = 10 / v;
      const px = gx + (v / 10) * gw;
      const py = gy + gh - (p / 10) * gh;
      if (v === 1) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Recorded data points
    ctx.fillStyle = ORANGE;
    for (const pt of this.graphData) {
      const px = gx + (pt.v / 10) * gw;
      const py = gy + gh - clamp(pt.p / 10, 0, 1) * gh;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Current point (larger)
    const curPx = gx + (this.volumeL / 10) * gw;
    const curPy = gy + gh - clamp(this.pressureAtm / 10, 0, 1) * gh;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(curPx, curPy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#aaa';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('P vs V (Boyle\'s curve)', gx + gw / 2, gy - 6);
  }

  /* --- main loop --- */
  _animate() {
    if (!this.running) return;
    const now = performance.now();
    const rawDt = now - this._lastTime;
    this._lastTime = now;
    const dt = Math.min(rawDt / 16.67, 3);

    this._step(dt);

    // Record graph data
    this._recordTimer += rawDt;
    if (this._recordTimer >= this._recordInterval) {
      this.graphData.push({ v: this.volumeL, p: this.pressureAtm });
      if (this.graphData.length > 200) this.graphData.shift();
      this._recordTimer = 0;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    this._drawContainer(ctx);
    this._drawParticles(ctx);
    this._drawReadouts(ctx);
    this._drawGraph(ctx);

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

registerSim('gasBoylesViz', (canvas, opts) => new GasBoylesViz(canvas, opts));
