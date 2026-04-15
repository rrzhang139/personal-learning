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
function lerp(a, b, t) { return a + (b - a) * Math.min(Math.max(t, 0), 1); }

/**
 * Real Gas Viz — Lennard-Jones particles + isotherm plots + equations on canvas
 *
 * Left: particle sim with LJ forces (attract + repel)
 * Right: live p-V isotherm plot comparing ideal vs real
 * Equations drawn on canvas, revealed step by step
 */
class RealGasViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;
    this._time = 0;
    this._lastTime = performance.now();

    // Sim box (left half)
    this._boxL = 40; this._boxR = 380;
    this._boxT = 55; this._boxB = 410;

    // State
    this._tempK = 400;
    this._volumeFrac = 1.0;
    this._ljStrength = 1.0; // 0 = ideal, 1 = full LJ
    this._particleSize = 1.0; // 0 = point, 1 = finite size

    // Particles (with LJ interactions)
    this.particles = [];
    this._initParticles(40);

    // Pressure measurement
    this._impulseWindow = [];
    this._pressureSmoothed = 0;

    // Isotherm data (collected as user changes volume)
    this._isothermPts = [];
    this._idealPts = [];

    // Visual state
    this.phase = 'intro';
    this.showLabel = '';
    this.showSubLabel = '';
    this._showLJ = false;        // show LJ potential curve
    this._showZ = false;         // show compression factor
    this._showVdW = false;       // show van der Waals equation
    this._showIsotherm = false;  // show p-V plot
    this._showCritical = false;  // show critical constants
    this._eqStep = 0;            // equation reveal step

    this._animate();
  }

  // --- Public API ---

  setVisualState(state) {
    if (state.phase !== undefined) this.phase = state.phase;
    if (state.showLabel !== undefined) this.showLabel = state.showLabel;
    if (state.showSubLabel !== undefined) this.showSubLabel = state.showSubLabel;
    if (state.showLJ !== undefined) this._showLJ = state.showLJ;
    if (state.showZ !== undefined) this._showZ = state.showZ;
    if (state.showVdW !== undefined) this._showVdW = state.showVdW;
    if (state.showIsotherm !== undefined) this._showIsotherm = state.showIsotherm;
    if (state.showCritical !== undefined) this._showCritical = state.showCritical;
    if (state.eqStep !== undefined) this._eqStep = state.eqStep;
  }

  setVolume(frac) {
    this._volumeFrac = clamp(frac, 0.25, 1.0);
    this._boxR = this._boxL + (380 - this._boxL) * this._volumeFrac;
    for (const p of this.particles) {
      if (p.x + p.r > this._boxR - 2) { p.x = this._boxR - p.r - 3; p.vx = -Math.abs(p.vx); }
    }
    // Record isotherm point
    if (this._showIsotherm) {
      this._isothermPts.push({ v: this._volumeFrac, p: this._pressureSmoothed });
      this._idealPts.push({ v: this._volumeFrac, p: this._idealPressure() });
      if (this._isothermPts.length > 200) this._isothermPts.shift();
      if (this._idealPts.length > 200) this._idealPts.shift();
    }
  }

  setTemperature(K) {
    const old = this._tempK;
    this._tempK = clamp(K, 150, 800);
    const scale = Math.sqrt(this._tempK / old);
    for (const p of this.particles) { p.vx *= scale; p.vy *= scale; }
    this._isothermPts = [];
    this._idealPts = [];
  }

  setLJStrength(s) { this._ljStrength = clamp(s, 0, 2); }
  setParticleSize(s) { this._particleSize = clamp(s, 0, 2); }

  get pressure() { return this._pressureSmoothed; }
  get compressionZ() {
    const pIdeal = this._idealPressure();
    return pIdeal > 0 ? this._pressureSmoothed / pIdeal : 1;
  }

  _idealPressure() {
    const n = this.particles.length;
    const area = (this._boxR - this._boxL) * (this._boxB - this._boxT);
    return n * this._tempK / (area * 300) * 3;
  }

  // --- Particles ---

  _initParticles(n) {
    this.particles = [];
    for (let i = 0; i < n; i++) this._spawnParticle();
  }

  _spawnParticle() {
    const r = 3 + this._particleSize * 3;
    const speed = Math.sqrt(this._tempK / 300) * 2.5;
    const a = Math.random() * Math.PI * 2;
    this.particles.push({
      x: this._boxL + 15 + Math.random() * (this._boxR - this._boxL - 30),
      y: this._boxT + 15 + Math.random() * (this._boxB - this._boxT - 30),
      vx: Math.cos(a) * speed * (0.5 + Math.random()),
      vy: Math.sin(a) * speed * (0.5 + Math.random()),
      r,
    });
  }

  // --- Physics with LJ ---

  _stepPhysics(dt) {
    const bl = this._boxL + 2, br = this._boxR - 2;
    const bt = this._boxT + 2, bb = this._boxB - 2;
    const eps = this._ljStrength * 0.15;
    const sigma = (3 + this._particleSize * 3) * 2;
    let impulse = 0;
    const n = this.particles.length;
    const targetSpeed = Math.sqrt(this._tempK / 300) * 2.5;

    // Forces
    for (let i = 0; i < n; i++) {
      let fx = 0, fy = 0;
      const pi = this.particles[i];

      // LJ pair forces
      if (eps > 0.001) {
        for (let j = i + 1; j < n; j++) {
          const pj = this.particles[j];
          const dx = pj.x - pi.x, dy = pj.y - pi.y;
          const r2 = dx * dx + dy * dy;
          if (r2 < 1) continue;
          const r = Math.sqrt(r2);
          const sr = sigma / r;
          const sr6 = sr * sr * sr * sr * sr * sr;
          const sr12 = sr6 * sr6;
          const fMag = 24 * eps / r * (2 * sr12 - sr6);
          const fClamped = clamp(fMag, -5, 5);
          const ux = dx / r, uy = dy / r;
          fx += ux * fClamped;
          fy += uy * fClamped;
          this.particles[j].vx -= ux * fClamped * dt;
          this.particles[j].vy -= uy * fClamped * dt;
        }
      }

      pi.vx += fx * dt;
      pi.vy += fy * dt;

      // Thermostat: gently nudge speed toward target (maintains temperature)
      const spd = Math.sqrt(pi.vx * pi.vx + pi.vy * pi.vy);
      if (spd > 0.01) {
        const desired = targetSpeed * (0.6 + Math.random() * 0.8);
        const scale = 1 + (desired / spd - 1) * 0.02; // gentle 2% correction per step
        pi.vx *= scale;
        pi.vy *= scale;
      } else {
        // Kick stuck particles
        const a = Math.random() * Math.PI * 2;
        pi.vx = Math.cos(a) * targetSpeed;
        pi.vy = Math.sin(a) * targetSpeed;
      }

      // Clamp speed
      const spd2 = Math.sqrt(pi.vx * pi.vx + pi.vy * pi.vy);
      if (spd2 > 12) { pi.vx = (pi.vx / spd2) * 12; pi.vy = (pi.vy / spd2) * 12; }

      pi.x += pi.vx;
      pi.y += pi.vy;

      // Wall collisions
      const pr = Math.max(pi.r * this._particleSize, 1);
      if (pi.x - pr < bl) { pi.x = bl + pr; impulse += Math.abs(pi.vx) * 2; pi.vx = Math.abs(pi.vx); }
      if (pi.x + pr > br) { pi.x = br - pr; impulse += Math.abs(pi.vx) * 2; pi.vx = -Math.abs(pi.vx); }
      if (pi.y - pr < bt) { pi.y = bt + pr; impulse += Math.abs(pi.vy) * 2; pi.vy = Math.abs(pi.vy); }
      if (pi.y + pr > bb) { pi.y = bb - pr; impulse += Math.abs(pi.vy) * 2; pi.vy = -Math.abs(pi.vy); }
    }

    const perim = 2 * ((br - bl) + (bb - bt));
    const raw = perim > 0 ? impulse / perim : 0;
    this._impulseWindow.push(raw);
    if (this._impulseWindow.length > 40) this._impulseWindow.shift();
    this._pressureSmoothed = this._impulseWindow.reduce((s, v) => s + v, 0) / this._impulseWindow.length;
  }

  // --- Drawing ---

  _drawBox(ctx) {
    const { _boxL: l, _boxR: r, _boxT: t, _boxB: b } = this;
    ctx.fillStyle = 'rgba(13,71,161,0.05)';
    ctx.fillRect(l, t, r - l, b - t);
    const glow = clamp(this._pressureSmoothed * 60, 0, 1);
    ctx.strokeStyle = `rgba(0,229,255,${0.3 + glow * 0.7})`;
    ctx.lineWidth = 2 + glow * 2;
    ctx.strokeRect(l, t, r - l, b - t);
    // Piston
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(r - 3, t, 6, b - t);
  }

  _drawParticles(ctx) {
    for (const p of this.particles) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const frac = clamp(speed / 6, 0, 1);
      const pr = p.r * this._particleSize;

      // Attraction range halo (when LJ is on)
      if (this._ljStrength > 0.1 && this._showLJ) {
        ctx.fillStyle = `rgba(76,175,80,${0.04 * this._ljStrength})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, pr * 4, 0, Math.PI * 2); ctx.fill();
      }

      // Particle
      const r = Math.floor(50 + frac * 205);
      const g = Math.floor(180 - frac * 130);
      const b = Math.floor(255 - frac * 200);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(pr, 2), 0, Math.PI * 2); ctx.fill();
    }
  }

  _drawLJCurve(ctx) {
    if (!this._showLJ) return;
    // Small LJ potential plot in bottom-left
    const ox = 50, oy = 470, w = 160, h = 60;
    ctx.fillStyle = '#0d1117';
    ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(ox - 10, oy - h - 15, w + 20, h + 35, 6); ctx.fill(); ctx.stroke();

    ctx.fillStyle = GREY; ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Lennard-Jones Potential', ox + w / 2, oy - h - 3);

    // Axes
    ctx.strokeStyle = DIM; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + w, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy - h); ctx.lineTo(ox, oy + 5); ctx.stroke();

    // Curve: V(r) = 4eps[(s/r)^12 - (s/r)^6]
    ctx.strokeStyle = GREEN; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < w; i++) {
      const r = 0.85 + (i / w) * 3;
      const sr = 1 / r;
      const sr6 = Math.pow(sr, 6);
      const V = 4 * (sr6 * sr6 - sr6);
      const px = ox + i;
      const py = oy - clamp(V * 30 + h / 2, -10, h);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Zero line
    ctx.strokeStyle = DIM; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(ox, oy - h / 2); ctx.lineTo(ox + w, oy - h / 2); ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = RED; ctx.font = '8px monospace'; ctx.textAlign = 'left';
    ctx.fillText('repel', ox + 5, oy - h + 8);
    ctx.fillStyle = GREEN;
    ctx.fillText('attract', ox + 5, oy - 5);
    ctx.fillStyle = GREY; ctx.textAlign = 'center';
    ctx.fillText('r →', ox + w - 15, oy + 12);
  }

  _drawEquations(ctx) {
    const step = this._eqStep;
    if (step < 1) return;

    const px = 410, py = 55, pw = 470;
    ctx.fillStyle = '#0d1117';
    ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(px, py, pw, 190, 8); ctx.fill(); ctx.stroke();

    let y = py + 25;
    ctx.textAlign = 'left';

    // Step 1: Compression factor Z
    if (step >= 1) {
      ctx.fillStyle = ACCENT; ctx.font = 'bold 14px monospace';
      ctx.fillText('Compression Factor', px + 15, y);
      y += 25;
      // Z = pVm / RT
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = PURPLE; ctx.fillText('Z', px + 15, y);
      ctx.fillStyle = GREY; ctx.fillText(' = ', px + 30, y);
      ctx.fillStyle = RED; ctx.fillText('p', px + 65, y);
      ctx.fillStyle = ACCENT; ctx.fillText('V', px + 82, y);
      ctx.fillStyle = GREY; ctx.font = 'bold 14px monospace';
      ctx.fillText('m', px + 99, y + 4);
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = GREY; ctx.fillText(' / ', px + 110, y);
      ctx.fillStyle = GREY; ctx.fillText('R', px + 140, y);
      ctx.fillStyle = ORANGE; ctx.fillText('T', px + 158, y);

      // Z value
      ctx.fillStyle = GREY; ctx.font = '12px monospace';
      ctx.fillText(`Z = 1 → perfect gas`, px + 200, y - 10);
      ctx.fillText(`Z ≠ 1 → real gas`, px + 200, y + 8);

      // Live Z
      const z = this.compressionZ;
      ctx.fillStyle = Math.abs(z - 1) < 0.1 ? GREEN : ORANGE;
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`Z = ${z.toFixed(3)}`, px + 370, y);
      y += 35;
    }

    // Step 2: van der Waals equation
    if (step >= 2) {
      ctx.fillStyle = ORANGE; ctx.font = 'bold 14px monospace';
      ctx.fillText('van der Waals Equation', px + 15, y);
      y += 28;

      // p = nRT/(V-nb) - a(n/V)²
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = RED; ctx.fillText('p', px + 15, y);
      ctx.fillStyle = GREY; ctx.fillText(' = ', px + 28, y);

      // nRT/(V-nb)
      ctx.fillStyle = GREEN; ctx.fillText('n', px + 60, y - 10);
      ctx.fillStyle = GREY; ctx.fillText('R', px + 75, y - 10);
      ctx.fillStyle = ORANGE; ctx.fillText('T', px + 90, y - 10);
      // fraction bar
      ctx.strokeStyle = WHITE; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px + 58, y); ctx.lineTo(px + 150, y); ctx.stroke();
      // V - nb
      ctx.fillStyle = ACCENT; ctx.fillText('V', px + 65, y + 16);
      ctx.fillStyle = GREY; ctx.fillText(' − ', px + 80, y + 16);
      ctx.fillStyle = GREEN; ctx.fillText('n', px + 108, y + 16);
      ctx.fillStyle = PURPLE; ctx.font = 'bold 16px monospace';
      ctx.fillText('b', px + 122, y + 16);

      // minus a(n/V)²
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = GREY; ctx.fillText(' − ', px + 155, y);
      ctx.fillStyle = PURPLE; ctx.fillText('a', px + 185, y);
      ctx.fillStyle = GREY; ctx.font = '16px monospace';
      ctx.fillText('(n/V)²', px + 200, y);

      y += 30;
      // Labels for a and b
      ctx.fillStyle = PURPLE; ctx.font = '11px monospace';
      ctx.fillText('a = attraction strength', px + 15, y);
      ctx.fillText('b = molecule volume', px + 220, y);
      y += 20;
    }

    // Step 3: Critical constants
    if (step >= 3) {
      ctx.fillStyle = YELLOW; ctx.font = 'bold 13px monospace';
      ctx.fillText('Critical Constants (from a, b)', px + 15, y);
      y += 22;
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = ACCENT; ctx.fillText('V', px + 15, y);
      ctx.fillStyle = GREY; ctx.font = '10px monospace'; ctx.fillText('c', px + 28, y + 4);
      ctx.font = 'bold 14px monospace'; ctx.fillStyle = GREY; ctx.fillText(' = 3', px + 35, y);
      ctx.fillStyle = PURPLE; ctx.fillText('b', px + 60, y);

      ctx.fillStyle = RED; ctx.fillText('p', px + 100, y);
      ctx.fillStyle = GREY; ctx.font = '10px monospace'; ctx.fillText('c', px + 111, y + 4);
      ctx.font = 'bold 14px monospace'; ctx.fillStyle = GREY; ctx.fillText(' = ', px + 120, y);
      ctx.fillStyle = PURPLE; ctx.fillText('a', px + 140, y);
      ctx.fillStyle = GREY; ctx.fillText('/27', px + 153, y);
      ctx.fillStyle = PURPLE; ctx.fillText('b', px + 177, y);
      ctx.fillStyle = GREY; ctx.fillText('²', px + 190, y);

      ctx.fillStyle = ORANGE; ctx.fillText('T', px + 230, y);
      ctx.fillStyle = GREY; ctx.font = '10px monospace'; ctx.fillText('c', px + 243, y + 4);
      ctx.font = 'bold 14px monospace'; ctx.fillStyle = GREY; ctx.fillText(' = 8', px + 252, y);
      ctx.fillStyle = PURPLE; ctx.fillText('a', px + 278, y);
      ctx.fillStyle = GREY; ctx.fillText('/27R', px + 291, y);
      ctx.fillStyle = PURPLE; ctx.fillText('b', px + 325, y);
    }
  }

  _drawInfoPanel(ctx) {
    const px = 410, py = 260, pw = 470;
    ctx.fillStyle = '#0d1117';
    ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(px, py, pw, 230, 8); ctx.fill(); ctx.stroke();

    let y = py + 25;
    ctx.textAlign = 'left';

    // State readouts
    const items = [
      { label: 'Pressure', val: `${(this._pressureSmoothed * 1000).toFixed(1)}`, color: RED },
      { label: 'Volume', val: `${(this._volumeFrac * 100).toFixed(0)}%`, color: ACCENT },
      { label: 'Temperature', val: `${this._tempK} K`, color: ORANGE },
      { label: 'Particles', val: `${this.particles.length}`, color: GREEN },
    ];

    for (const it of items) {
      ctx.fillStyle = GREY; ctx.font = '11px monospace';
      ctx.fillText(it.label, px + 15, y);
      ctx.fillStyle = it.color; ctx.font = 'bold 15px monospace';
      ctx.fillText(it.val, px + 110, y);
      y += 24;
    }

    y += 10;
    // Compression factor bar
    if (this._showZ) {
      ctx.fillStyle = GREY; ctx.font = '11px monospace';
      ctx.fillText('Compression Factor Z:', px + 15, y);
      const z = this.compressionZ;
      ctx.fillStyle = Math.abs(z - 1) < 0.15 ? GREEN : (z > 1 ? RED : ACCENT);
      ctx.font = 'bold 18px monospace';
      ctx.fillText(z.toFixed(3), px + 200, y);
      y += 15;
      // Bar visualization
      const barX = px + 15, barW = pw - 30, barH = 12;
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath(); ctx.roundRect(barX, y, barW, barH, 3); ctx.fill();
      // Z=1 marker
      const oneX = barX + barW * 0.5;
      ctx.strokeStyle = WHITE; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(oneX, y - 2); ctx.lineTo(oneX, y + barH + 2); ctx.stroke();
      ctx.fillStyle = GREY; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('Z=1', oneX, y + barH + 12);
      ctx.fillText('ideal', oneX, y + barH + 22);
      // Z indicator
      const zX = barX + clamp(z / 2, 0, 1) * barW;
      ctx.fillStyle = z > 1 ? RED : ACCENT;
      ctx.beginPath(); ctx.arc(zX, y + barH / 2, 5, 0, Math.PI * 2); ctx.fill();
      ctx.textAlign = 'left';
      y += barH + 28;
      // Interpretation
      ctx.fillStyle = GREY; ctx.font = '10px monospace';
      if (z < 0.9) ctx.fillText('Z < 1: attractions dominate → more compressible', px + 15, y);
      else if (z > 1.1) ctx.fillText('Z > 1: repulsions dominate → less compressible', px + 15, y);
      else ctx.fillText('Z ≈ 1: behaving like a perfect gas', px + 15, y);
    }

    // LJ strength indicator
    y += 20;
    ctx.fillStyle = GREY; ctx.font = '10px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`Attraction: ${(this._ljStrength * 100).toFixed(0)}%`, px + 15, y);
    ctx.fillText(`Mol. size: ${(this._particleSize * 100).toFixed(0)}%`, px + 200, y);
  }

  _render(ctx) {
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    this._drawBox(ctx);
    this._drawParticles(ctx);
    this._drawLJCurve(ctx);
    this._drawEquations(ctx);
    this._drawInfoPanel(ctx);

    // Labels
    if (this.showLabel) {
      ctx.fillStyle = WHITE; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showLabel, 210, 25);
    }
    if (this.showSubLabel) {
      ctx.fillStyle = GREY; ctx.font = '11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showSubLabel, 210, 42);
    }
  }

  _animate() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this._lastTime) / 1000, 0.05);
    this._lastTime = now;
    this._time += dt;
    this._stepPhysics(dt / 2);
    this._stepPhysics(dt / 2);
    this._render(this.ctx);
    requestAnimationFrame(() => this._animate());
  }

  stop() { this.running = false; }
}

registerSim('realGasViz', (canvas, opts) => new RealGasViz(canvas, opts));
