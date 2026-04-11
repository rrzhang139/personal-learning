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

/**
 * Dissolving NaCl — cinematic, step-driven animation
 *
 * Phases: empty → crystal → water-intro → water-approach → orient →
 *         pry-na → pry-cl → dissolve → energy → like-dissolves-like → forward
 */
class DissolvingViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;
    this._time = 0;
    this._lastTime = performance.now();

    this.phase = 'empty';
    this.showLabel = '';
    this.showSubLabel = '';

    // Crystal grid: 5 cols × 3 rows, centered
    this.ions = [];
    const cols = 5, rows = 3, sp = 55;
    const ox = this.W / 2 - (cols - 1) * sp / 2;
    const oy = this.H / 2 - (rows - 1) * sp / 2 + 10;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isNa = (r + c) % 2 === 0;
        const bx = ox + c * sp, by = oy + r * sp;
        this.ions.push({
          bx, by, x: bx, y: by, tx: bx, ty: by,
          type: isNa ? 'na' : 'cl',
          freed: false, alpha: 0, ta: 0,
          r: isNa ? 15 : 21,
        });
      }
    }

    // 24 water molecules
    this.waters = [];
    for (let i = 0; i < 24; i++) {
      this.waters.push({
        x: -100 - Math.random() * 300,
        y: Math.random() * this.H,
        tx: -100, ty: this.H / 2,
        angle: Math.random() * Math.PI * 2,
        tAngle: 0,
        alpha: 0, tAlpha: 0,
      });
    }

    // Overlay alphas
    this.introAlpha = 0; this.introTA = 0;
    this.gridAlpha = 0;  this.gridTA = 0;
    this.energyAlpha = 0; this.energyTA = 0;
    this.ldlAlpha = 0;    this.ldlTA = 0;

    this._animate();
  }

  setVisualState(state) {
    if (state.phase !== undefined && state.phase !== this.phase) {
      this.phase = state.phase;
      this._setupPhase();
    }
    if (state.showLabel !== undefined) this.showLabel = state.showLabel;
    if (state.showSubLabel !== undefined) this.showSubLabel = state.showSubLabel;
  }

  _setupPhase() {
    const p = this.phase;
    const cx = this.W / 2, cy = this.H / 2 + 10;

    // Reset overlays by default
    this.introTA = 0;
    this.energyTA = 0;
    this.ldlTA = 0;

    if (p === 'crystal') {
      this.gridTA = 1;
      this.ions.forEach(ion => {
        ion.tx = ion.bx; ion.ty = ion.by; ion.ta = 1; ion.freed = false;
      });
      this.waters.forEach(w => { w.tAlpha = 0; });
    }

    else if (p === 'water-intro') {
      this.gridTA = 1; this.introTA = 1;
      this.ions.forEach(ion => { ion.ta = 1; });
    }

    else if (p === 'water-approach') {
      this.gridTA = 1;
      this.ions.forEach(ion => { ion.ta = 1; });
      this.waters.forEach((w, i) => {
        const a = (i / this.waters.length) * Math.PI * 2 + 0.3;
        const ring = i % 3;
        w.tx = cx + Math.cos(a) * (160 + ring * 22);
        w.ty = cy + Math.sin(a) * (160 + ring * 22);
        w.tAngle = a + Math.PI;
        w.tAlpha = 0.85 - ring * 0.1;
      });
    }

    else if (p === 'orient') {
      this.gridTA = 1;
      this.ions.forEach(ion => { ion.ta = 1; });
      this.waters.forEach((w, i) => {
        const a = (i / this.waters.length) * Math.PI * 2 + 0.3;
        const ring = i % 3;
        w.tx = cx + Math.cos(a) * (130 + ring * 12);
        w.ty = cy + Math.sin(a) * (130 + ring * 12);
        w.tAngle = a + Math.PI; // O faces inward
        w.tAlpha = 1;
      });
    }

    else if (p === 'pry-na') {
      this.gridTA = 0.5;
      // Free top-left Na+ (index 0)
      this.ions[0].freed = true;
      this.ions[0].tx = 115; this.ions[0].ty = 95; this.ions[0].ta = 1;
      this.ions.filter(i => !i.freed).forEach(i => {
        i.ta = 1; i.tx = i.bx; i.ty = i.by;
      });
      // 6 waters → Na+ shell (O faces inward)
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        this.waters[i].tx = 115 + Math.cos(a) * 36;
        this.waters[i].ty = 95 + Math.sin(a) * 36;
        this.waters[i].tAngle = a + Math.PI;
        this.waters[i].tAlpha = 1;
      }
      // Others stay around crystal
      for (let i = 6; i < this.waters.length; i++) {
        const a = ((i - 6) / (this.waters.length - 6)) * Math.PI * 2;
        this.waters[i].tx = cx + Math.cos(a) * (140 + (i % 3) * 12);
        this.waters[i].ty = cy + Math.sin(a) * (140 + (i % 3) * 12);
        this.waters[i].tAngle = a + Math.PI;
        this.waters[i].tAlpha = 0.6;
      }
    }

    else if (p === 'pry-cl') {
      this.gridTA = 0.3;
      // Free Cl- (index 1 = top row second ion)
      this.ions[1].freed = true;
      this.ions[1].tx = 115; this.ions[1].ty = 330; this.ions[1].ta = 1;
      this.ions.filter(i => !i.freed).forEach(i => {
        i.ta = 1; i.tx = i.bx; i.ty = i.by;
      });
      // Na+ shell remains (waters 0-5)
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        this.waters[i].tx = 115 + Math.cos(a) * 36;
        this.waters[i].ty = 95 + Math.sin(a) * 36;
        this.waters[i].tAngle = a + Math.PI;
        this.waters[i].tAlpha = 1;
      }
      // Cl- shell (waters 6-11, H faces inward → angle = outward)
      for (let i = 6; i < 12; i++) {
        const a = ((i - 6) / 6) * Math.PI * 2;
        this.waters[i].tx = 115 + Math.cos(a) * 42;
        this.waters[i].ty = 330 + Math.sin(a) * 42;
        this.waters[i].tAngle = a; // O outward → H inward
        this.waters[i].tAlpha = 1;
      }
      // Remaining around crystal
      for (let i = 12; i < this.waters.length; i++) {
        const a = ((i - 12) / (this.waters.length - 12)) * Math.PI * 2;
        this.waters[i].tx = cx + Math.cos(a) * 140;
        this.waters[i].ty = cy + Math.sin(a) * 140;
        this.waters[i].tAngle = a + Math.PI;
        this.waters[i].tAlpha = 0.5;
      }
    }

    else if (p === 'dissolve') {
      this.gridTA = 0;
      const GA = Math.PI * (3 - Math.sqrt(5));
      this.ions.forEach((ion, idx) => {
        ion.freed = true;
        const a = idx * GA;
        const dist = 60 + Math.sqrt(idx / this.ions.length) * 160;
        ion.tx = Math.max(50, Math.min(this.W - 50, cx + Math.cos(a) * dist));
        ion.ty = Math.max(55, Math.min(this.H - 50, cy + Math.sin(a) * dist));
        ion.ta = 1;
      });
      this.waters.forEach((w, i) => {
        const a = i * GA + 0.5;
        const dist = 40 + Math.sqrt(i / this.waters.length) * 180;
        w.tx = Math.max(30, Math.min(this.W - 30, cx + Math.cos(a) * dist));
        w.ty = Math.max(30, Math.min(this.H - 30, cy + Math.sin(a) * dist));
        w.tAngle = a;
        w.tAlpha = 0.55;
      });
    }

    else if (p === 'energy') {
      this.energyTA = 1;
      this.ions.forEach(ion => { ion.ta = 0.1; });
      this.waters.forEach(w => { w.tAlpha = 0.08; });
    }

    else if (p === 'like-dissolves-like') {
      this.ldlTA = 1;
      this.ions.forEach(ion => { ion.ta = 0; });
      this.waters.forEach(w => { w.tAlpha = 0; });
    }

    else if (p === 'forward') {
      const GA = Math.PI * (3 - Math.sqrt(5));
      this.ions.forEach((ion, idx) => {
        ion.freed = true;
        const a = idx * GA + 1;
        const dist = 50 + Math.sqrt(idx / this.ions.length) * 150;
        ion.tx = Math.max(50, Math.min(this.W - 50, cx + Math.cos(a) * dist));
        ion.ty = Math.max(55, Math.min(this.H - 50, cy + Math.sin(a) * dist));
        ion.ta = 0.7;
      });
      this.waters.forEach((w, i) => {
        const a = i * GA + 1.5;
        const dist = 30 + Math.sqrt(i / this.waters.length) * 170;
        w.tx = Math.max(30, Math.min(this.W - 30, cx + Math.cos(a) * dist));
        w.ty = Math.max(30, Math.min(this.H - 30, cy + Math.sin(a) * dist));
        w.tAngle = a;
        w.tAlpha = 0.4;
      });
    }
  }

  /* ---- drawing helpers ---- */

  _drawIon(ctx, x, y, type, alpha, r) {
    if (alpha < 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const col = type === 'na' ? NA_COL : CL_COL;
    const dark = type === 'na' ? NA_DARK : CL_DARK;
    ctx.shadowColor = col; ctx.shadowBlur = 14 * alpha;
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = WHITE;
    ctx.font = `bold ${r < 18 ? 11 : 13}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(type === 'na' ? 'Na⁺' : 'Cl⁻', x, y);
    ctx.restore();
  }

  _drawWater(ctx, x, y, angle, alpha, large, showLabels) {
    if (alpha < 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const oR = large ? 14 : 7;
    const hR = large ? 9 : 4;
    const bLen = large ? 24 : 13;
    const half = 52.25 * Math.PI / 180;
    const back = angle + Math.PI;
    const h1x = x + Math.cos(back + half) * bLen;
    const h1y = y + Math.sin(back + half) * bLen;
    const h2x = x + Math.cos(back - half) * bLen;
    const h2y = y + Math.sin(back - half) * bLen;
    // Bonds
    ctx.strokeStyle = '#78909c'; ctx.lineWidth = large ? 2.5 : 1.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(h1x, h1y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(h2x, h2y); ctx.stroke();
    // Oxygen (red)
    ctx.fillStyle = O_COL;
    ctx.beginPath(); ctx.arc(x, y, oR, 0, Math.PI * 2); ctx.fill();
    // Hydrogen (white)
    ctx.fillStyle = H_COL;
    ctx.beginPath(); ctx.arc(h1x, h1y, hR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(h2x, h2y, hR, 0, Math.PI * 2); ctx.fill();

    if (showLabels) {
      ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      // δ− on O side
      ctx.fillStyle = ACCENT;
      ctx.fillText('δ−', x + Math.cos(angle) * (oR + 14), y + Math.sin(angle) * (oR + 14));
      // δ+ on each H
      ctx.fillStyle = '#ff8a80';
      for (const [hx, hy] of [[h1x, h1y], [h2x, h2y]]) {
        const dx = hx - x, dy = hy - y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        ctx.fillText('δ+', hx + (dx / d) * (hR + 11), hy + (dy / d) * (hR + 11));
      }
    }
    ctx.restore();
  }

  _drawGrid(ctx, alpha) {
    if (alpha < 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha * 0.3;
    ctx.strokeStyle = DIM; ctx.lineWidth = 1;
    const active = this.ions.filter(i => !i.freed && i.alpha > 0.1);
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const dx = active[i].bx - active[j].bx;
        const dy = active[i].by - active[j].by;
        if (dx * dx + dy * dy < 3200) {
          ctx.beginPath();
          ctx.moveTo(active[i].x, active[i].y);
          ctx.lineTo(active[j].x, active[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  _drawShellRing(ctx, ion, radius, color) {
    if (ion.alpha < 0.5) return;
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = color;
    ctx.setLineDash([4, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ion.x, ion.y, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Hydration shell', ion.x, ion.y + radius + 14);
    ctx.restore();
  }

  _drawEnergy(ctx, alpha) {
    if (alpha < 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const cx = this.W / 2, baseY = 340, barW = 90, maxH = 220;

    ctx.fillStyle = WHITE; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Why Does Salt Dissolve?', cx, 55);

    const lH = maxH * 0.95, hH = maxH * 0.94;
    const b1 = cx - 130, b2 = cx + 40;

    // Lattice energy (red = cost)
    const g1 = ctx.createLinearGradient(0, baseY - lH, 0, baseY);
    g1.addColorStop(0, '#ff5252'); g1.addColorStop(1, '#5d1111');
    ctx.fillStyle = g1;
    ctx.beginPath(); ctx.roundRect(b1, baseY - lH, barW, lH, 4); ctx.fill();
    ctx.strokeStyle = RED; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(b1, baseY - lH, barW, lH, 4); ctx.stroke();
    ctx.fillStyle = WHITE; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Lattice', b1 + barW / 2, baseY + 16);
    ctx.fillText('Energy', b1 + barW / 2, baseY + 30);
    ctx.fillStyle = GREY; ctx.font = '10px monospace';
    ctx.fillText('786 kJ/mol', b1 + barW / 2, baseY + 44);
    ctx.fillStyle = RED; ctx.font = 'bold 11px monospace';
    ctx.fillText('⬆ COST', b1 + barW / 2, baseY - lH - 10);

    // Hydration energy (green = payoff)
    const g2 = ctx.createLinearGradient(0, baseY - hH, 0, baseY);
    g2.addColorStop(0, '#4caf50'); g2.addColorStop(1, '#113d11');
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.roundRect(b2, baseY - hH, barW, hH, 4); ctx.fill();
    ctx.strokeStyle = GREEN; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(b2, baseY - hH, barW, hH, 4); ctx.stroke();
    ctx.fillStyle = WHITE; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Hydration', b2 + barW / 2, baseY + 16);
    ctx.fillText('Energy', b2 + barW / 2, baseY + 30);
    ctx.fillStyle = GREY; ctx.font = '10px monospace';
    ctx.fillText('783 kJ/mol', b2 + barW / 2, baseY + 44);
    ctx.fillStyle = GREEN; ctx.font = 'bold 11px monospace';
    ctx.fillText('⬇ PAYOFF', b2 + barW / 2, baseY - hH - 10);

    // Verdict
    ctx.fillStyle = ACCENT; ctx.font = 'bold 13px monospace';
    ctx.fillText('≈ Almost equal → dissolves (slightly endothermic)', cx, baseY + 65);
    ctx.restore();
  }

  _drawLDL(ctx, alpha) {
    if (alpha < 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const t = this._time;

    ctx.fillStyle = WHITE; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
    ctx.fillText('"Like Dissolves Like"', this.W / 2, 35);

    // --- Left beaker: NaCl dissolved ---
    const lx = this.W / 4;
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx - 75, 60); ctx.lineTo(lx - 85, 330);
    ctx.lineTo(lx + 85, 330); ctx.lineTo(lx + 75, 60);
    ctx.stroke();
    ctx.fillStyle = 'rgba(21,101,192,0.15)';
    ctx.beginPath();
    ctx.moveTo(lx - 83, 75); ctx.lineTo(lx - 85, 330);
    ctx.lineTo(lx + 85, 330); ctx.lineTo(lx + 83, 75);
    ctx.fill();
    // Floating ions
    for (let i = 0; i < 8; i++) {
      const ix = lx + Math.cos(t * 0.3 + i * 0.8) * (25 + (i % 3) * 12);
      const iy = 120 + i * 25 + Math.sin(t * 0.5 + i) * 8;
      this._drawIon(ctx, ix, iy, i % 2 === 0 ? 'na' : 'cl', alpha * 0.9, i % 2 === 0 ? 8 : 11);
    }
    ctx.globalAlpha = alpha;
    ctx.fillStyle = GREEN; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
    ctx.fillText('NaCl in Water', lx, 355);
    ctx.fillText('✓ Dissolves', lx, 375);
    ctx.fillStyle = GREY; ctx.font = '11px monospace';
    ctx.fillText('Polar + Ionic', lx, 393);

    // --- Right beaker: Oil in water ---
    const rx = 3 * this.W / 4;
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx - 75, 60); ctx.lineTo(rx - 85, 330);
    ctx.lineTo(rx + 85, 330); ctx.lineTo(rx + 75, 60);
    ctx.stroke();
    // Water layer (bottom)
    ctx.fillStyle = 'rgba(21,101,192,0.15)';
    ctx.beginPath();
    ctx.moveTo(rx - 84, 195); ctx.lineTo(rx - 85, 330);
    ctx.lineTo(rx + 85, 330); ctx.lineTo(rx + 84, 195);
    ctx.fill();
    // Oil layer (top)
    ctx.fillStyle = 'rgba(255,193,7,0.25)';
    ctx.beginPath();
    ctx.moveTo(rx - 81, 75); ctx.lineTo(rx - 84, 195);
    ctx.lineTo(rx + 84, 195); ctx.lineTo(rx + 81, 75);
    ctx.fill();
    // Dividing line
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rx - 84, 195); ctx.lineTo(rx + 84, 195); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffd54f'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Oil', rx, 140);
    ctx.fillStyle = ACCENT;
    ctx.fillText('Water', rx, 270);
    ctx.fillStyle = RED; ctx.font = 'bold 14px monospace';
    ctx.fillText('Oil in Water', rx, 355);
    ctx.fillText('✗ Won\'t Dissolve', rx, 375);
    ctx.fillStyle = GREY; ctx.font = '11px monospace';
    ctx.fillText('Polar + Nonpolar', rx, 393);

    // Center divider
    ctx.setLineDash([6, 4]); ctx.strokeStyle = DIM; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(this.W / 2, 55); ctx.lineTo(this.W / 2, 340); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  /* ---- tick / render ---- */

  _tick(dt) {
    const s = 3 * dt;
    this.ions.forEach(ion => {
      ion.x = lerp(ion.x, ion.tx, s);
      ion.y = lerp(ion.y, ion.ty, s);
      ion.alpha = lerp(ion.alpha, ion.ta, s);
    });
    this.waters.forEach(w => {
      w.x = lerp(w.x, w.tx, s * 0.7);
      w.y = lerp(w.y, w.ty, s * 0.7);
      let da = w.tAngle - w.angle;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      w.angle += da * s * 0.4;
      w.alpha = lerp(w.alpha, w.tAlpha, s);
    });
    this.gridAlpha = lerp(this.gridAlpha, this.gridTA, s);
    this.introAlpha = lerp(this.introAlpha, this.introTA, s);
    this.energyAlpha = lerp(this.energyAlpha, this.energyTA, s * 0.6);
    this.ldlAlpha = lerp(this.ldlAlpha, this.ldlTA, s * 0.6);

    // Gentle drift for dissolved ions
    const t = this._time;
    if (this.phase === 'dissolve' || this.phase === 'forward') {
      this.ions.forEach((ion, i) => {
        if (ion.freed) {
          ion.tx += Math.sin(t * 0.3 + i * 1.7) * 0.12;
          ion.ty += Math.cos(t * 0.4 + i * 2.3) * 0.1;
          ion.tx = Math.max(50, Math.min(this.W - 50, ion.tx));
          ion.ty = Math.max(55, Math.min(this.H - 50, ion.ty));
        }
      });
    }
  }

  _render(ctx) {
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    // Subtle blue water tint when waters are visible
    const avgWaterAlpha = this.waters.reduce((s, w) => s + w.alpha, 0) / this.waters.length;
    if (avgWaterAlpha > 0.05) {
      ctx.fillStyle = `rgba(13,71,161,${avgWaterAlpha * 0.04})`;
      ctx.fillRect(0, 0, this.W, this.H);
    }

    // Grid lines between lattice ions
    this._drawGrid(ctx, this.gridAlpha);

    // Water molecules
    this.waters.forEach(w => this._drawWater(ctx, w.x, w.y, w.angle, w.alpha, false, false));

    // Ions
    this.ions.forEach(ion => this._drawIon(ctx, ion.x, ion.y, ion.type, ion.alpha, ion.r));

    // Hydration shell rings (pry phases)
    if (this.phase === 'pry-na' || this.phase === 'pry-cl') {
      if (this.ions[0].freed) this._drawShellRing(ctx, this.ions[0], 52, NA_COL);
    }
    if (this.phase === 'pry-cl') {
      if (this.ions[1].freed) this._drawShellRing(ctx, this.ions[1], 58, CL_COL);
    }

    // Intro water molecule (large, with labels)
    if (this.introAlpha > 0.01) {
      this._drawWater(ctx, 730, 200, -Math.PI / 2, this.introAlpha, true, true);
      ctx.save(); ctx.globalAlpha = this.introAlpha;
      ctx.fillStyle = WHITE; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
      ctx.fillText('Water (H₂O)', 730, 268);
      ctx.fillStyle = GREY; ctx.font = '11px monospace';
      ctx.fillText('104.5° bend', 730, 286);
      ctx.fillText('A tiny magnet', 730, 302);
      // Dipole arrow (δ+ → δ−)
      ctx.strokeStyle = ORANGE; ctx.lineWidth = 2; ctx.fillStyle = ORANGE;
      ctx.beginPath(); ctx.moveTo(730, 228); ctx.lineTo(730, 172); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(725, 178); ctx.lineTo(730, 166); ctx.lineTo(735, 178); ctx.closePath(); ctx.fill();
      // + at tail
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(726, 228); ctx.lineTo(734, 228); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(730, 224); ctx.lineTo(730, 232); ctx.stroke();
      ctx.restore();
    }

    // Overlay diagrams
    this._drawEnergy(ctx, this.energyAlpha);
    this._drawLDL(ctx, this.ldlAlpha);

    // Top labels
    if (this.showLabel) {
      ctx.fillStyle = WHITE; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showLabel, this.W / 2, 25);
    }
    if (this.showSubLabel) {
      ctx.fillStyle = GREY; ctx.font = '12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showSubLabel, this.W / 2, 45);
    }
  }

  _animate() {
    if (!this.running) return;
    const now = performance.now();
    const dt = Math.min((now - this._lastTime) / 1000, 0.05);
    this._lastTime = now;
    this._time += dt;
    this._tick(dt);
    this._render(this.ctx);
    requestAnimationFrame(() => this._animate());
  }

  stop() { this.running = false; }
}

registerSim('dissolvingViz', (canvas, opts) => new DissolvingViz(canvas, opts));
