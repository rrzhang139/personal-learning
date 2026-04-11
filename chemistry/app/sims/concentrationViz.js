import { registerSim } from './registry.js';

const BG = '#0a0a1a';
const WHITE = '#fff';
const GREY = '#888';
const DIM = '#555';
const NA_COL = '#b39ddb';
const NA_DARK = '#7e57c2';
const CL_COL = '#81c784';
const CL_DARK = '#388e3c';
const O_COL = '#ef5350';
const H_COL = '#eceff1';
const ACCENT = '#00e5ff';
const GREEN = '#4caf50';
const RED = '#ff5252';
const ORANGE = '#ff9800';

function lerp(a, b, t) { return a + (b - a) * Math.min(Math.max(t, 0), 1); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function dist(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

/**
 * Concentration Viz — physics-based interactive simulation
 *
 * Particles move under Coulomb forces + Brownian motion + wall collisions.
 * User adds salt via drag, adjusts water/temp via external sliders.
 */
class ConcentrationViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;   // 900
    this.H = canvas.height;  // 500
    this.running = true;
    this._time = 0;
    this._lastTime = performance.now();

    // --- Beaker geometry ---
    this.beaker = { left: 60, right: 580, top: 50, bottom: 460 };
    this._waterMl = 500;
    this._tempK = 298;

    // --- Particles ---
    this.ions = [];       // { x, y, vx, vy, type:'na'|'cl', dissolved:bool, r }
    this.crystalIons = []; // ions in crystal at bottom

    // --- State ---
    this.saltAdded = 0;       // scoops added by user
    this.dissolvedPairs = 0;  // dissolved NaCl formula units
    this.isSaturated = false;
    this.cascadeTriggered = false;
    this._supersaturated = false;

    this.phase = 'empty';
    this.showLabel = '';
    this.showSubLabel = '';

    // --- Salt shaker ---
    this._shaker = { x: 720, y: 60, homeX: 720, homeY: 60, w: 60, h: 80, dragging: false };
    this._pourTimer = 0;
    this._grains = []; // falling grain particles

    // --- Input ---
    this._onDown = this._handleDown.bind(this);
    this._onMove = this._handleMove.bind(this);
    this._onUp = this._handleUp.bind(this);
    canvas.addEventListener('mousedown', this._onDown);
    canvas.addEventListener('mousemove', this._onMove);
    canvas.addEventListener('mouseup', this._onUp);
    canvas.addEventListener('mouseleave', this._onUp);
    canvas.addEventListener('touchstart', this._onDown, { passive: false });
    canvas.addEventListener('touchmove', this._onMove, { passive: false });
    canvas.addEventListener('touchend', this._onUp);

    this._animate();
  }

  // --- Public API ---

  setVisualState(state) {
    if (state.phase !== undefined) this.phase = state.phase;
    if (state.showLabel !== undefined) this.showLabel = state.showLabel;
    if (state.showSubLabel !== undefined) this.showSubLabel = state.showSubLabel;
    if (state.enableShaker !== undefined) this._shakerEnabled = state.enableShaker;
    if (state.supersaturate) this._triggerSupersaturation();
  }

  setWaterVolume(mL) {
    this._waterMl = clamp(mL, 200, 1200);
    this._updateSaturation();
  }

  setTemperature(K) {
    this._tempK = clamp(K, 273, 373);
    this._updateSaturation();
    // If temp increase dissolves more crystal
    this._tryDissolveFromCrystal();
  }

  get molarity() {
    const liters = this._waterMl / 1000;
    const moles = this.dissolvedPairs * 0.1; // each "scoop" ≈ 0.1 mol
    return liters > 0 ? moles / liters : 0;
  }

  get saturationM() {
    // NaCl: ~6.1 M at 25C, ~6.7 M at 100C (linear approx)
    return 6.1 + (this._tempK - 298) * (0.6 / 75);
  }

  // --- Saturation logic ---

  _updateSaturation() {
    const M = this.molarity;
    const satM = this.saturationM;
    this.isSaturated = M >= satM - 0.05;
  }

  _tryDissolveFromCrystal() {
    // If currently below saturation but have crystal, dissolve some
    while (this.crystalIons.length >= 2 && this.molarity < this.saturationM - 0.1) {
      const na = this.crystalIons.findIndex(i => i.type === 'na');
      const cl = this.crystalIons.findIndex(i => i.type === 'cl');
      if (na < 0 || cl < 0) break;
      // Move to dissolved
      const naIon = this.crystalIons.splice(na > cl ? na : na, 1)[0];
      const clIdx = this.crystalIons.findIndex(i => i.type === 'cl');
      if (clIdx < 0) { this.crystalIons.push(naIon); break; }
      const clIon = this.crystalIons.splice(clIdx, 1)[0];
      naIon.dissolved = true;
      clIon.dissolved = true;
      naIon.y = this._waterLevel() + 30;
      clIon.y = this._waterLevel() + 30;
      naIon.vx = (Math.random() - 0.5) * 2;
      clIon.vx = (Math.random() - 0.5) * 2;
      naIon.vy = -1;
      clIon.vy = -1;
      this.ions.push(naIon, clIon);
      this.dissolvedPairs++;
    }
    this._updateSaturation();
  }

  addNaClScoop() {
    this.saltAdded++;
    const wl = this._waterLevel();
    const bk = this.beaker;
    const cx = (bk.left + bk.right) / 2;

    const na = {
      x: cx - 15 + Math.random() * 30,
      y: wl + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: 0.5 + Math.random(),
      type: 'na', dissolved: false, r: 8,
    };
    const cl = {
      x: cx + Math.random() * 30 - 15,
      y: wl + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: 0.5 + Math.random(),
      type: 'cl', dissolved: false, r: 11,
    };

    if (this.molarity < this.saturationM - 0.05) {
      na.dissolved = true;
      cl.dissolved = true;
      this.ions.push(na, cl);
      this.dissolvedPairs++;
    } else {
      // Saturated — add to crystal
      this.isSaturated = true;
      this.crystalIons.push(na, cl);
      this._arrangeCrystal();
    }
    this._updateSaturation();
    // Falling grains visual
    for (let i = 0; i < 4; i++) {
      this._grains.push({
        x: this._shaker.x + Math.random() * 30 - 15,
        y: this._shaker.y + this._shaker.h,
        vy: 2 + Math.random() * 2,
        life: 1,
      });
    }
  }

  _arrangeCrystal() {
    const bk = this.beaker;
    const cx = (bk.left + bk.right) / 2;
    const by = bk.bottom - 15;
    const sp = 18;
    const cols = Math.ceil(Math.sqrt(this.crystalIons.length * 2));
    this.crystalIons.forEach((ion, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      ion.x = cx - (cols * sp) / 2 + col * sp + sp / 2;
      ion.y = by - row * sp;
      ion.vx = 0; ion.vy = 0;
    });
  }

  _triggerSupersaturation() {
    this._supersaturated = true;
  }

  _waterLevel() {
    const bk = this.beaker;
    const maxH = bk.bottom - bk.top - 30;
    const frac = clamp(this._waterMl / 1000, 0.2, 1.1);
    return bk.bottom - maxH * frac;
  }

  // --- Input handling ---

  _getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (this.W / rect.width),
      y: (src.clientY - rect.top) * (this.H / rect.height),
    };
  }

  _handleDown(e) {
    const { x, y } = this._getPos(e);
    const s = this._shaker;
    // Check salt shaker hit
    if (this._shakerEnabled !== false &&
        x > s.x - s.w / 2 && x < s.x + s.w / 2 &&
        y > s.y - 10 && y < s.y + s.h + 10) {
      s.dragging = true;
      if (e.touches) e.preventDefault();
      return;
    }
    // Check click in solution for seed crystal (supersaturation)
    if (this._supersaturated && !this.cascadeTriggered) {
      const wl = this._waterLevel();
      const bk = this.beaker;
      if (x > bk.left && x < bk.right && y > wl && y < bk.bottom) {
        this._triggerCascade(x, y);
        if (e.touches) e.preventDefault();
      }
    }
  }

  _handleMove(e) {
    if (!this._shaker.dragging) return;
    if (e.touches) e.preventDefault();
    const { x, y } = this._getPos(e);
    this._shaker.x = x;
    this._shaker.y = y;
  }

  _handleUp() {
    if (this._shaker.dragging) {
      this._shaker.dragging = false;
      this._pourTimer = 0;
    }
  }

  _isOverBeaker() {
    const s = this._shaker;
    const bk = this.beaker;
    return s.x > bk.left && s.x < bk.right && s.y < bk.top + 80;
  }

  _triggerCascade(sx, sy) {
    this.cascadeTriggered = true;
    // Move dissolved ions back to crystal rapidly
    const toMove = [...this.ions];
    let delay = 0;
    toMove.sort((a, b) => dist(a, { x: sx, y: sy }) - dist(b, { x: sx, y: sy }));
    for (const ion of toMove) {
      setTimeout(() => {
        const idx = this.ions.indexOf(ion);
        if (idx >= 0) {
          this.ions.splice(idx, 1);
          ion.dissolved = false;
          this.crystalIons.push(ion);
          this.dissolvedPairs = Math.max(0, this.dissolvedPairs - 0.5);
          this._arrangeCrystal();
        }
      }, delay);
      delay += 80;
    }
    this._supersaturated = false;
  }

  // --- Physics ---

  _stepPhysics(dt) {
    const kT = this._tempK / 298; // normalized thermal energy
    const damping = 0.97;
    const kCoulomb = 800; // electrostatic constant (tuned for visuals)
    const bk = this.beaker;
    const wl = this._waterLevel();
    const softening = 100; // softening for Coulomb (prevent blowup)

    for (const ion of this.ions) {
      if (!ion.dissolved) continue;

      let fx = 0, fy = 0;

      // Coulomb forces from other dissolved ions
      for (const other of this.ions) {
        if (other === ion || !other.dissolved) continue;
        const dx = other.x - ion.x;
        const dy = other.y - ion.y;
        const r2 = dx * dx + dy * dy + softening;
        const r = Math.sqrt(r2);
        const q1 = ion.type === 'na' ? 1 : -1;
        const q2 = other.type === 'na' ? 1 : -1;
        // Coulomb: same charges → F>0 → repel (away from other)
        // opposite charges → F<0 → attract (toward other)
        const F = kCoulomb * q1 * q2 / r2;
        fx -= (dx / r) * F;
        fy -= (dy / r) * F;
      }

      // Clamp force magnitude
      const fMag = Math.sqrt(fx * fx + fy * fy);
      if (fMag > 50) { fx = (fx / fMag) * 50; fy = (fy / fMag) * 50; }

      // Brownian motion (random thermal kicks)
      const brownian = 3 * Math.sqrt(kT);
      fx += (Math.random() - 0.5) * brownian;
      fy += (Math.random() - 0.5) * brownian;

      // Gravity (slight downward)
      fy += 0.3;

      // Update velocity
      ion.vx += fx * dt;
      ion.vy += fy * dt;
      ion.vx *= damping;
      ion.vy *= damping;

      // Clamp speed
      const speed = Math.sqrt(ion.vx * ion.vx + ion.vy * ion.vy);
      if (speed > 8) { ion.vx = (ion.vx / speed) * 8; ion.vy = (ion.vy / speed) * 8; }

      // Update position
      ion.x += ion.vx;
      ion.y += ion.vy;

      // Wall bouncing
      if (ion.x - ion.r < bk.left + 5) { ion.x = bk.left + 5 + ion.r; ion.vx = Math.abs(ion.vx) * 0.8; }
      if (ion.x + ion.r > bk.right - 5) { ion.x = bk.right - 5 - ion.r; ion.vx = -Math.abs(ion.vx) * 0.8; }
      if (ion.y + ion.r > bk.bottom - 5) { ion.y = bk.bottom - 5 - ion.r; ion.vy = -Math.abs(ion.vy) * 0.8; }
      if (ion.y - ion.r < wl + 5) { ion.y = wl + 5 + ion.r; ion.vy = Math.abs(ion.vy) * 0.5; }
    }

    // Crystal ions: tiny vibration
    for (const ion of this.crystalIons) {
      ion.x += (Math.random() - 0.5) * kT * 0.5;
      ion.y += (Math.random() - 0.5) * kT * 0.5;
    }
  }

  // --- Salt shaker pouring ---

  _updateShaker(dt) {
    const s = this._shaker;
    if (!s.dragging) {
      s.x = lerp(s.x, s.homeX, 0.1);
      s.y = lerp(s.y, s.homeY, 0.1);
      return;
    }
    if (this._isOverBeaker()) {
      this._pourTimer += dt;
      if (this._pourTimer >= 0.5) {
        this._pourTimer -= 0.5;
        this.addNaClScoop();
      }
    } else {
      this._pourTimer = 0;
    }
  }

  _updateGrains(dt) {
    for (let i = this._grains.length - 1; i >= 0; i--) {
      const g = this._grains[i];
      g.y += g.vy;
      g.vy += 3 * dt;
      g.life -= dt * 1.5;
      if (g.life <= 0 || g.y > this._waterLevel()) this._grains.splice(i, 1);
    }
  }

  // --- Drawing ---

  _drawBeaker(ctx) {
    const bk = this.beaker;
    const wl = this._waterLevel();

    // Water fill
    ctx.fillStyle = 'rgba(13,71,161,0.12)';
    ctx.beginPath();
    ctx.moveTo(bk.left, wl);
    ctx.lineTo(bk.left, bk.bottom);
    ctx.lineTo(bk.right, bk.bottom);
    ctx.lineTo(bk.right, wl);
    ctx.closePath();
    ctx.fill();

    // Water surface
    const t = this._time;
    ctx.strokeStyle = 'rgba(0,229,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = bk.left; x <= bk.right; x += 3) {
      const wave = Math.sin(x * 0.03 + t * 2) * 2;
      ctx.lineTo(x, wl + wave);
    }
    ctx.stroke();

    // Beaker outline
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bk.left, bk.top);
    ctx.lineTo(bk.left, bk.bottom);
    ctx.lineTo(bk.right, bk.bottom);
    ctx.lineTo(bk.right, bk.top);
    ctx.stroke();

    // mL markings
    ctx.fillStyle = DIM;
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let ml = 200; ml <= 1000; ml += 200) {
      const frac = ml / 1000;
      const y = bk.bottom - (bk.bottom - bk.top - 30) * frac;
      ctx.fillText(`${ml}`, bk.left - 5, y + 4);
      ctx.strokeStyle = DIM;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(bk.left, y);
      ctx.lineTo(bk.left + 10, y);
      ctx.stroke();
    }
  }

  _drawIon(ctx, x, y, type, r, alpha) {
    if (alpha < 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const col = type === 'na' ? NA_COL : CL_COL;
    const dark = type === 'na' ? NA_DARK : CL_DARK;
    ctx.shadowColor = col; ctx.shadowBlur = 10;
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = col; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = WHITE;
    ctx.font = `bold ${r < 10 ? 8 : 10}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(type === 'na' ? 'Na⁺' : 'Cl⁻', x, y);
    ctx.restore();
  }

  _drawWaterMol(ctx, x, y, angle, alpha) {
    if (alpha < 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    const oR = 4, hR = 2.5, bLen = 8;
    const half = 52.25 * Math.PI / 180;
    const back = angle + Math.PI;
    const h1x = x + Math.cos(back + half) * bLen;
    const h1y = y + Math.sin(back + half) * bLen;
    const h2x = x + Math.cos(back - half) * bLen;
    const h2y = y + Math.sin(back - half) * bLen;
    ctx.strokeStyle = '#546e7a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(h1x, h1y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(h2x, h2y); ctx.stroke();
    ctx.fillStyle = O_COL;
    ctx.beginPath(); ctx.arc(x, y, oR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = H_COL;
    ctx.beginPath(); ctx.arc(h1x, h1y, hR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(h2x, h2y, hR, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  _drawHydrationShell(ctx, ion) {
    const t = this._time;
    const n = ion.type === 'na' ? 4 : 3;
    const shellR = ion.r + 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t * 0.5 + (ion.x * 0.01);
      const wx = ion.x + Math.cos(a) * shellR;
      const wy = ion.y + Math.sin(a) * shellR;
      const wAngle = ion.type === 'na' ? a + Math.PI : a; // O inward for Na+, H inward for Cl-
      this._drawWaterMol(ctx, wx, wy, wAngle, 1);
    }
  }

  _drawCrystal(ctx) {
    if (this.crystalIons.length === 0) return;
    // Grid lines
    ctx.strokeStyle = DIM;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < this.crystalIons.length; i++) {
      for (let j = i + 1; j < this.crystalIons.length; j++) {
        const d = dist(this.crystalIons[i], this.crystalIons[j]);
        if (d < 22) {
          ctx.beginPath();
          ctx.moveTo(this.crystalIons[i].x, this.crystalIons[i].y);
          ctx.lineTo(this.crystalIons[j].x, this.crystalIons[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    for (const ion of this.crystalIons) {
      this._drawIon(ctx, ion.x, ion.y, ion.type, ion.r || 7, 0.9);
    }
  }

  _drawShaker(ctx) {
    if (this._shakerEnabled === false) return;
    const s = this._shaker;
    const pouring = s.dragging && this._isOverBeaker();

    ctx.save();
    // Body
    ctx.fillStyle = pouring ? '#4a3520' : '#3e2c1a';
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(s.x - s.w / 2, s.y, s.w, s.h, 8);
    ctx.fill(); ctx.stroke();
    // Cap
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.roundRect(s.x - s.w / 2 + 8, s.y - 12, s.w - 16, 16, 4);
    ctx.fill();
    // Holes
    ctx.fillStyle = '#333';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(s.x - 8 + i * 8, s.y - 4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Label
    ctx.fillStyle = WHITE; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('NaCl', s.x, s.y + s.h / 2 + 4);
    // "drag me" hint
    if (!s.dragging && this.saltAdded === 0) {
      ctx.fillStyle = `rgba(255,152,0,${0.5 + 0.3 * Math.sin(this._time * 3)})`;
      ctx.font = '11px monospace';
      ctx.fillText('↑ drag me', s.x, s.y + s.h + 18);
    }
    ctx.restore();

    // Falling grains
    ctx.fillStyle = WHITE;
    for (const g of this._grains) {
      ctx.globalAlpha = g.life;
      ctx.beginPath(); ctx.arc(g.x, g.y, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawInfoPanel(ctx) {
    const px = 620, py = 80, pw = 260;
    // Background
    ctx.fillStyle = '#0d1117';
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(px, py, pw, 320, 8); ctx.fill(); ctx.stroke();

    ctx.textAlign = 'left';
    let y = py + 28;

    // Concentration
    ctx.fillStyle = ACCENT; ctx.font = 'bold 22px monospace';
    ctx.fillText(`C = ${this.molarity.toFixed(2)} M`, px + 15, y);
    y += 35;

    // Formula
    ctx.fillStyle = GREY; ctx.font = '12px monospace';
    ctx.fillText('M = mol / L', px + 15, y);
    y += 30;

    // Details
    ctx.fillStyle = WHITE; ctx.font = '13px monospace';
    ctx.fillText(`Dissolved: ${this.dissolvedPairs} scoops`, px + 15, y); y += 22;
    ctx.fillText(`   = ${(this.dissolvedPairs * 0.1).toFixed(1)} mol`, px + 15, y); y += 22;
    ctx.fillText(`Volume: ${this._waterMl} mL`, px + 15, y); y += 22;
    ctx.fillText(`   = ${(this._waterMl / 1000).toFixed(2)} L`, px + 15, y); y += 22;
    ctx.fillText(`Temp: ${this._tempK} K`, px + 15, y); y += 35;

    // Saturation bar
    ctx.fillStyle = GREY; ctx.font = '11px monospace';
    ctx.fillText(`Saturation: ${this.saturationM.toFixed(1)} M`, px + 15, y); y += 18;
    const frac = clamp(this.molarity / this.saturationM, 0, 1.3);
    const barW = pw - 30, barH = 16;
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.roundRect(px + 15, y, barW, barH, 3); ctx.fill();
    const fillCol = frac >= 1 ? RED : frac > 0.7 ? ORANGE : GREEN;
    ctx.fillStyle = fillCol;
    ctx.beginPath(); ctx.roundRect(px + 15, y, barW * Math.min(frac, 1), barH, 3); ctx.fill();
    // Sat line
    ctx.strokeStyle = WHITE; ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(px + 15 + barW, y); ctx.lineTo(px + 15 + barW, y + barH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = WHITE; ctx.font = '10px monospace';
    ctx.fillText(`${(frac * 100).toFixed(0)}%`, px + 15 + barW * Math.min(frac, 1) - 15, y + barH + 14);

    if (this.isSaturated) {
      y += barH + 25;
      ctx.fillStyle = RED; ctx.font = 'bold 12px monospace';
      ctx.fillText('⚠ SATURATED', px + 15, y);
    }
    if (this._supersaturated) {
      y += this.isSaturated ? 18 : barH + 25;
      ctx.fillStyle = ORANGE; ctx.font = 'bold 11px monospace';
      ctx.fillText('★ SUPERSATURATED', px + 15, y);
      ctx.fillStyle = GREY; ctx.font = '10px monospace';
      ctx.fillText('Click the solution!', px + 15, y + 16);
    }
  }

  // --- Main render ---

  _render(ctx) {
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    this._drawBeaker(ctx);
    this._drawCrystal(ctx);

    // Dissolved ions + hydration shells
    for (const ion of this.ions) {
      if (!ion.dissolved) continue;
      this._drawHydrationShell(ctx, ion);
      this._drawIon(ctx, ion.x, ion.y, ion.type, ion.r, 1);
    }

    this._drawShaker(ctx);
    this._drawInfoPanel(ctx);

    // Labels
    if (this.showLabel) {
      ctx.fillStyle = WHITE; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showLabel, 320, 25);
    }
    if (this.showSubLabel) {
      ctx.fillStyle = GREY; ctx.font = '12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showSubLabel, 320, 42);
    }
  }

  _animate() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this._lastTime) / 1000, 0.05);
    this._lastTime = now;
    this._time += dt;

    // Physics (2 substeps)
    this._stepPhysics(dt / 2);
    this._stepPhysics(dt / 2);
    this._updateShaker(dt);
    this._updateGrains(dt);

    this._render(this.ctx);
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

registerSim('concentrationViz', (canvas, opts) => new ConcentrationViz(canvas, opts));
