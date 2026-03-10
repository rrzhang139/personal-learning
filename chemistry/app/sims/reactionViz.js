import { registerSim } from './registry.js';

const BG      = '#0a0a1a';
const TEXT     = '#e0e0e0';
const DIM      = 'rgba(255,255,255,0.35)';
const ACCENT   = '#00d4ff';
const GREEN    = '#81c784';
const RED      = '#ef5350';
const ORANGE   = '#ffa726';
const PURPLE   = '#ab47bc';

/* ================================================================
   ReactionViz — three modes:
   'balance'   Interactive equation balancer (user adjusts coefficients)
   'energy'    Exo vs endo energy diagram with animated molecule path
   'collision' Animated particle collision showing bond breaking/forming
   ================================================================ */

export class ReactionViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;
    this.time = 0;
    this.mode = opts.mode || 'balance';

    // ── Balance mode ──
    // User adjusts coefficients of: _CH₄ + _O₂ → _CO₂ + _H₂O
    this.coeffs = { ch4: 1, o2: 1, co2: 1, h2o: 1 };
    this.balanced = false;
    this.hovered = null; // which +/- button is hovered

    // ── Energy mode ──
    this.showExo = true;
    this.ballProgress = 0;

    // ── Collision mode ──
    this.collisionPhase = 'approach'; // 'approach' | 'collide' | 'separate' | 'done'
    this.collisionTime = 0;
    this.collisionAuto = 3;

    // Events
    this._onClick = this._onClick.bind(this);
    this._onMove = this._onMove.bind(this);
    canvas.addEventListener('click', this._onClick);
    canvas.addEventListener('mousemove', this._onMove);

    this._animate();
  }

  /* ── Public API ── */
  isBalanced() { return this.balanced; }
  getMode() { return this.mode; }
  setMode(mode) { this.mode = mode; }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
    this.canvas.removeEventListener('mousemove', this._onMove);
  }

  /* ── Main loop ── */
  _animate() {
    if (!this.running) return;
    const dt = 1 / 60;
    this.time += dt;
    this.ctx.fillStyle = BG;
    this.ctx.fillRect(0, 0, this.W, this.H);

    if (this.mode === 'balance') this._drawBalance();
    else if (this.mode === 'energy') this._drawEnergy();
    else if (this.mode === 'collision') this._drawCollision(dt);

    requestAnimationFrame(() => this._animate());
  }

  /* ────────────────────────────────────────────────────
     BALANCE MODE — interactive coefficient adjuster
     ──────────────────────────────────────────────────── */
  _drawBalance() {
    const ctx = this.ctx, W = this.W, H = this.H;
    const c = this.coeffs;

    // Check balance
    const left  = { C: c.ch4 * 1, H: c.ch4 * 4, O: c.o2 * 2 };
    const right = { C: c.co2 * 1, H: c.h2o * 2, O: c.co2 * 2 + c.h2o * 1 };
    this.balanced = left.C === right.C && left.H === right.H && left.O === right.O;

    // Title
    this._text(this.balanced ? '✓ Balanced!' : 'Balance this equation',
      W / 2, 30, 'bold 18px sans-serif', this.balanced ? GREEN : ORANGE);

    // Equation layout
    const eqY = 80;
    const molecules = [
      { key: 'ch4', label: 'CH₄', x: W * 0.12 },
      { key: null, label: '+', x: W * 0.24 },
      { key: 'o2',  label: 'O₂',  x: W * 0.34 },
      { key: null, label: '→', x: W * 0.48 },
      { key: 'co2', label: 'CO₂', x: W * 0.60 },
      { key: null, label: '+', x: W * 0.73 },
      { key: 'h2o', label: 'H₂O', x: W * 0.85 },
    ];

    for (const m of molecules) {
      if (!m.key) {
        this._text(m.label, m.x, eqY, 'bold 22px sans-serif', DIM);
        continue;
      }
      const val = c[m.key];
      // Coefficient (big number)
      const coeffColor = this.balanced ? GREEN : ACCENT;
      this._text(String(val), m.x - 30, eqY, 'bold 28px monospace', coeffColor);
      // Formula
      this._text(m.label, m.x + 8, eqY, 'bold 20px sans-serif', TEXT);
      // +/- buttons
      this._drawBtn(m.x - 48, eqY + 18, 22, '−', `${m.key}-minus`);
      this._drawBtn(m.x - 12, eqY + 18, 22, '+', `${m.key}-plus`);
    }

    // Atom count comparison
    const countY = 150;
    this._text('Atom Counts', W / 2, countY, 'bold 14px sans-serif', DIM);

    const elements = [
      { sym: 'C', color: '#777', lv: left.C, rv: right.C },
      { sym: 'H', color: '#e0e0e0', lv: left.H, rv: right.H },
      { sym: 'O', color: RED, lv: left.O, rv: right.O },
    ];

    elements.forEach((el, i) => {
      const y = countY + 30 + i * 36;
      const match = el.lv === el.rv;
      const clr = match ? GREEN : RED;

      // Left atoms
      this._text(`${el.sym}:`, W / 2 - 100, y, 'bold 14px sans-serif', el.color);
      for (let a = 0; a < Math.min(el.lv, 8); a++) {
        this._atom(W / 2 - 70 + a * 18, y - 3, 7, el.color, '');
      }
      if (el.lv > 8) this._text(`(${el.lv})`, W / 2 - 70 + 8 * 18, y, '11px sans-serif', DIM);

      // Indicator
      this._text(match ? '=' : '≠', W / 2 + 85, y, 'bold 20px sans-serif', clr);

      // Right atoms
      for (let a = 0; a < Math.min(el.rv, 8); a++) {
        this._atom(W / 2 + 110 + a * 18, y - 3, 7, el.color, '');
      }
      if (el.rv > 8) this._text(`(${el.rv})`, W / 2 + 110 + 8 * 18, y, '11px sans-serif', DIM);
    });

    // Animated molecule visualization below
    const molY = H * 0.72;
    this._text('Reactants', W * 0.25, molY - 30, '12px sans-serif', DIM);
    this._text('Products', W * 0.75, molY - 30, '12px sans-serif', DIM);

    // Draw reactant molecules
    let rx = W * 0.06;
    for (let i = 0; i < Math.min(c.ch4, 4); i++) {
      this._drawCH4(rx + i * 70, molY);
    }
    rx = W * 0.06 + Math.min(c.ch4, 4) * 70 + 20;
    this._text('+', rx, molY, 'bold 16px sans-serif', DIM);
    rx += 25;
    for (let i = 0; i < Math.min(c.o2, 4); i++) {
      this._drawO2(rx + i * 50, molY);
    }

    // Arrow
    this._text('→', W * 0.50, molY, 'bold 20px sans-serif', DIM);

    // Draw product molecules
    let px = W * 0.55;
    for (let i = 0; i < Math.min(c.co2, 4); i++) {
      this._drawCO2(px + i * 65, molY);
    }
    px = W * 0.55 + Math.min(c.co2, 4) * 65 + 15;
    this._text('+', px, molY, 'bold 16px sans-serif', DIM);
    px += 20;
    for (let i = 0; i < Math.min(c.h2o, 4); i++) {
      this._drawH2O(px + i * 55, molY);
    }

    // Reset button
    this._drawBtn(W / 2 - 25, H - 40, 50, 'Reset', 'reset', true);
  }

  /* ── Small molecule renderers ── */
  _drawCH4(x, y) {
    const t = this.time;
    this._atom(x, y, 12, '#555', 'C');
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI / 2) + t * 0.5;
      const hx = x + 18 * Math.cos(a), hy = y + 18 * Math.sin(a);
      this._bond(x, y, hx, hy);
      this._atom(hx, hy, 6, '#e0e0e0', '');
    }
  }

  _drawO2(x, y) {
    this._bond(x - 10, y, x + 10, y, 'rgba(255,255,255,0.4)');
    this._bond(x - 10, y - 3, x + 10, y - 3, 'rgba(255,255,255,0.4)');
    this._atom(x - 10, y, 9, RED, 'O');
    this._atom(x + 10, y, 9, RED, 'O');
  }

  _drawCO2(x, y) {
    this._bond(x - 18, y, x, y, 'rgba(255,255,255,0.4)');
    this._bond(x, y, x + 18, y, 'rgba(255,255,255,0.4)');
    this._atom(x, y, 10, '#555', 'C');
    this._atom(x - 20, y, 8, RED, 'O');
    this._atom(x + 20, y, 8, RED, 'O');
  }

  _drawH2O(x, y) {
    const ha = 52.25 * Math.PI / 180; // half of 104.5°
    const bLen = 15;
    const h1x = x + bLen * Math.cos(-ha - Math.PI / 2);
    const h1y = y + bLen * Math.sin(-ha - Math.PI / 2);
    const h2x = x + bLen * Math.cos(ha - Math.PI / 2);
    const h2y = y + bLen * Math.sin(ha - Math.PI / 2);
    this._bond(x, y, h1x, h1y);
    this._bond(x, y, h2x, h2y);
    this._atom(x, y, 8, RED, 'O');
    this._atom(h1x, h1y, 5, '#e0e0e0', '');
    this._atom(h2x, h2y, 5, '#e0e0e0', '');
  }

  /* ────────────────────────────────────────────────────
     ENERGY MODE — exo vs endo diagram
     ──────────────────────────────────────────────────── */
  _drawEnergy() {
    const ctx = this.ctx, W = this.W, H = this.H;
    this.ballProgress = (this.ballProgress + 0.004) % 1;

    const exo = this.showExo;
    this._text(exo ? 'Exothermic Reaction' : 'Endothermic Reaction',
      W / 2, 28, 'bold 18px sans-serif', exo ? ORANGE : ACCENT);
    this._text(exo ? 'Energy flows OUT → surroundings heat up' : 'Energy flows IN → surroundings cool down',
      W / 2, 50, '13px sans-serif', DIM);

    // Diagram region
    const L = 100, R = W - 80, T = 70, B = H - 70;
    const midX = (L + R) / 2;

    // Y axis
    ctx.strokeStyle = DIM;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.stroke();
    // Arrow on Y axis
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L - 4, T + 8); ctx.moveTo(L, T); ctx.lineTo(L + 4, T + 8); ctx.stroke();
    this._text('Energy', L - 5, T - 12, '12px sans-serif', DIM);

    // X axis
    ctx.beginPath(); ctx.moveTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    this._text('Reaction progress →', (L + R) / 2, B + 20, '12px sans-serif', DIM);

    // Energy levels
    const rY = exo ? T + 70 : T + 180;
    const pY = exo ? T + 200 : T + 60;
    const peakY = T + 20;

    // Reactant platform
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(L + 20, rY); ctx.lineTo(midX - 80, rY); ctx.stroke();
    this._text('Reactants', L + 70, rY - 14, 'bold 13px sans-serif', ACCENT);
    this._text(exo ? 'Higher energy' : 'Lower energy', L + 70, rY + 18, '11px sans-serif', DIM);

    // Product platform
    ctx.strokeStyle = GREEN; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(midX + 80, pY); ctx.lineTo(R - 20, pY); ctx.stroke();
    this._text('Products', R - 70, pY - 14, 'bold 13px sans-serif', GREEN);
    this._text(exo ? 'Lower energy' : 'Higher energy', R - 70, pY + 18, '11px sans-serif', DIM);

    // Energy hill (bezier curve)
    ctx.strokeStyle = TEXT; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX - 80, rY);
    ctx.bezierCurveTo(midX - 40, rY, midX - 25, peakY, midX, peakY);
    ctx.bezierCurveTo(midX + 25, peakY, midX + 40, pY, midX + 80, pY);
    ctx.stroke();

    // Transition state
    this._text('Transition state', midX, peakY - 14, '11px sans-serif', DIM);
    this._text('(old bonds breaking,', midX, peakY - 2, '10px sans-serif', 'rgba(255,255,255,0.2)');
    this._text('new bonds forming)', midX, peakY + 10, '10px sans-serif', 'rgba(255,255,255,0.2)');

    // Eₐ arrow (dashed)
    ctx.strokeStyle = PURPLE; ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(midX - 30, rY); ctx.lineTo(midX - 30, peakY + 5); ctx.stroke();
    ctx.setLineDash([]);
    // Arrowhead up
    ctx.fillStyle = PURPLE;
    ctx.beginPath(); ctx.moveTo(midX - 30, peakY + 5); ctx.lineTo(midX - 34, peakY + 13); ctx.lineTo(midX - 26, peakY + 13); ctx.closePath(); ctx.fill();
    this._text('Eₐ', midX - 48, (rY + peakY) / 2 + 5, 'bold 14px sans-serif', PURPLE);
    this._text('(activation', midX - 48, (rY + peakY) / 2 + 19, '9px sans-serif', 'rgba(171,71,188,0.6)');
    this._text('energy)', midX - 48, (rY + peakY) / 2 + 30, '9px sans-serif', 'rgba(171,71,188,0.6)');

    // ΔH arrow
    const dhX = R - 45;
    const dhColor = exo ? ORANGE : RED;
    ctx.strokeStyle = dhColor; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(dhX, rY); ctx.lineTo(dhX, pY); ctx.stroke();
    const dir = pY > rY ? 1 : -1;
    ctx.fillStyle = dhColor;
    ctx.beginPath(); ctx.moveTo(dhX, pY); ctx.lineTo(dhX - 5, pY - dir * 10); ctx.lineTo(dhX + 5, pY - dir * 10); ctx.closePath(); ctx.fill();
    this._text(exo ? 'ΔH < 0' : 'ΔH > 0', dhX + 2, (rY + pY) / 2, 'bold 14px sans-serif', dhColor);
    this._text(exo ? 'heat released' : 'heat absorbed', dhX + 2, (rY + pY) / 2 + 16, '10px sans-serif', DIM);

    // Animated ball along curve
    const bp = this.ballProgress;
    let bx, by;
    if (bp < 0.35) {
      const t = bp / 0.35;
      bx = midX - 80 + t * 80;
      by = rY + (peakY - rY) * Math.sin(t * Math.PI / 2);
    } else if (bp < 0.5) {
      const t = (bp - 0.35) / 0.15;
      bx = midX + t * 10;
      by = peakY;
    } else if (bp < 0.85) {
      const t = (bp - 0.5) / 0.35;
      bx = midX + 10 + t * 70;
      by = peakY + (pY - peakY) * Math.sin(t * Math.PI / 2);
    } else {
      bx = midX + 80;
      by = pY;
    }
    this._atom(bx, by - 2, 7, exo ? ORANGE : ACCENT, '');

    // Examples
    if (exo) {
      this._text('Examples: combustion, rusting, neutralization', W / 2, B - 8, '12px sans-serif', ORANGE);
    } else {
      this._text('Examples: photosynthesis, melting ice, cold packs', W / 2, B - 8, '12px sans-serif', ACCENT);
    }

    // Toggle button
    this._drawBtn(W / 2 - 80, H - 38, 160, exo ? 'Show Endothermic →' : '← Show Exothermic', 'toggle-energy', true);
  }

  /* ────────────────────────────────────────────────────
     COLLISION MODE — animated bond breaking/forming
     ──────────────────────────────────────────────────── */
  _drawCollision(dt) {
    const ctx = this.ctx, W = this.W, H = this.H;

    this._text('Bond Breaking & Bond Forming', W / 2, 28, 'bold 18px sans-serif', ORANGE);
    this._text('H₂ + Cl₂ → 2HCl', W / 2, 52, 'bold 16px monospace', TEXT);

    this.collisionTime += dt;
    const ct = this.collisionTime;
    const centerY = H * 0.50;

    if (ct < 2) {
      // Phase: approach
      this._text('1. Molecules approach with enough energy', W / 2, 82, '13px sans-serif', DIM);
      const progress = ct / 2;
      const h2x = W * 0.20 + progress * W * 0.18;
      const cl2x = W * 0.80 - progress * W * 0.18;

      // H₂
      this._bond(h2x - 12, centerY, h2x + 12, centerY);
      this._atom(h2x - 12, centerY, 10, '#e0e0e0', 'H');
      this._atom(h2x + 12, centerY, 10, '#e0e0e0', 'H');

      // Cl₂
      this._bond(cl2x - 14, centerY, cl2x + 14, centerY);
      this._atom(cl2x - 14, centerY, 12, '#81c784', 'Cl');
      this._atom(cl2x + 14, centerY, 12, '#81c784', 'Cl');

      // Speed arrows
      ctx.strokeStyle = DIM; ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(h2x + 30, centerY); ctx.lineTo(h2x + 50, centerY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cl2x - 30, centerY); ctx.lineTo(cl2x - 50, centerY); ctx.stroke();
      ctx.setLineDash([]);

    } else if (ct < 4) {
      // Phase: collision — old bonds stretch & break
      this._text('2. Old bonds break (energy absorbed)', W / 2, 82, '13px sans-serif', RED);
      const progress = (ct - 2) / 2;
      const cx = W / 2;

      // Stretch and break H-H and Cl-Cl bonds
      const stretch = progress * 30;
      const fade = Math.max(0, 1 - progress * 1.5);

      // H atoms separating
      this._bond(cx - 30 - stretch, centerY, cx - 30 + stretch * 0.3, centerY,
        `rgba(255,255,255,${fade * 0.5})`);
      this._atom(cx - 30 - stretch, centerY, 10, '#e0e0e0', 'H');
      this._atom(cx - 30 + stretch * 0.3, centerY, 10, '#e0e0e0', 'H');

      // Cl atoms separating
      this._bond(cx + 30 - stretch * 0.3, centerY, cx + 30 + stretch, centerY,
        `rgba(255,255,255,${fade * 0.5})`);
      this._atom(cx + 30 - stretch * 0.3, centerY, 12, '#81c784', 'Cl');
      this._atom(cx + 30 + stretch, centerY, 12, '#81c784', 'Cl');

      // Energy burst
      if (progress > 0.4) {
        const burstR = (progress - 0.4) * 80;
        ctx.strokeStyle = `rgba(239,83,80,${Math.max(0, 0.5 - progress * 0.4)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, centerY, burstR, 0, Math.PI * 2);
        ctx.stroke();
      }

    } else if (ct < 6) {
      // Phase: new bonds form
      this._text('3. New bonds form (energy released)', W / 2, 82, '13px sans-serif', GREEN);
      const progress = (ct - 4) / 2;

      // Two HCl molecules forming and separating
      const sep = 40 + progress * 60;

      // HCl left
      const hcl1x = W / 2 - sep;
      const bondAlpha = Math.min(1, progress * 2);
      this._bond(hcl1x - 12, centerY, hcl1x + 14, centerY,
        `rgba(129,199,132,${bondAlpha})`);
      this._atom(hcl1x - 12, centerY, 10, '#e0e0e0', 'H');
      this._atom(hcl1x + 14, centerY, 12, '#81c784', 'Cl');

      // HCl right
      const hcl2x = W / 2 + sep;
      this._bond(hcl2x - 14, centerY, hcl2x + 12, centerY,
        `rgba(129,199,132,${bondAlpha})`);
      this._atom(hcl2x - 14, centerY, 12, '#81c784', 'Cl');
      this._atom(hcl2x + 12, centerY, 10, '#e0e0e0', 'H');

      // Green energy glow
      if (progress < 0.5) {
        ctx.strokeStyle = `rgba(129,199,132,${0.4 - progress * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2, centerY, progress * 100, 0, Math.PI * 2);
        ctx.stroke();
      }

    } else if (ct < 8) {
      // Phase: done — show products
      this._text('4. Products formed! Same atoms, new arrangement', W / 2, 82, '13px sans-serif', GREEN);

      const hcl1x = W * 0.30, hcl2x = W * 0.70;
      this._bond(hcl1x - 12, centerY, hcl1x + 14, centerY, 'rgba(129,199,132,0.7)');
      this._atom(hcl1x - 12, centerY, 10, '#e0e0e0', 'H');
      this._atom(hcl1x + 14, centerY, 12, '#81c784', 'Cl');

      this._bond(hcl2x - 14, centerY, hcl2x + 12, centerY, 'rgba(129,199,132,0.7)');
      this._atom(hcl2x - 14, centerY, 12, '#81c784', 'Cl');
      this._atom(hcl2x + 12, centerY, 10, '#e0e0e0', 'H');

      // Labels
      this._text('HCl', hcl1x, centerY + 30, 'bold 14px sans-serif', GREEN);
      this._text('HCl', hcl2x, centerY + 30, 'bold 14px sans-serif', GREEN);
    } else {
      // Reset
      this.collisionTime = 0;
    }

    // Bottom: atom conservation tally
    const tY = H - 50;
    this._text('Atom count: 2 H + 2 Cl → 2 H + 2 Cl  (conserved!)', W / 2, tY, '13px sans-serif', GREEN);

    // Replay button
    this._drawBtn(W / 2 - 30, H - 30, 60, 'Replay', 'replay-collision', true);
  }

  /* ── Drawing helpers ── */

  _text(str, x, y, font = '14px sans-serif', color = TEXT) {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(str, x, y);
  }

  _atom(x, y, r, color, label) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (label) {
      ctx.font = `bold ${Math.max(8, r * 0.65)}px sans-serif`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
    }
  }

  _bond(x1, y1, x2, y2, color = 'rgba(255,255,255,0.4)', width = 2) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  _drawBtn(x, y, w, label, id, wide = false) {
    const ctx = this.ctx;
    const h = wide ? 28 : 20;
    const isHovered = this.hovered === id;
    ctx.fillStyle = isHovered ? '#222' : '#1a1a2e';
    ctx.strokeStyle = isHovered ? ACCENT : '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();
    ctx.stroke();
    this._text(label, x + w / 2, y + h / 2, `${wide ? 12 : 11}px sans-serif`, isHovered ? ACCENT : TEXT);
    return { x, y, w, h, id };
  }

  /* ── Button hit-test regions ── */
  _getButtons() {
    const W = this.W, H = this.H;
    const btns = [];
    if (this.mode === 'balance') {
      const molecules = [
        { key: 'ch4', x: W * 0.12 },
        { key: 'o2',  x: W * 0.34 },
        { key: 'co2', x: W * 0.60 },
        { key: 'h2o', x: W * 0.85 },
      ];
      for (const m of molecules) {
        btns.push({ x: m.x - 48, y: 98, w: 22, h: 20, id: `${m.key}-minus` });
        btns.push({ x: m.x - 12, y: 98, w: 22, h: 20, id: `${m.key}-plus` });
      }
      btns.push({ x: W / 2 - 25, y: H - 40, w: 50, h: 28, id: 'reset' });
    } else if (this.mode === 'energy') {
      btns.push({ x: W / 2 - 80, y: H - 38, w: 160, h: 28, id: 'toggle-energy' });
    } else if (this.mode === 'collision') {
      btns.push({ x: W / 2 - 30, y: H - 30, w: 60, h: 28, id: 'replay-collision' });
    }
    return btns;
  }

  _hitTest(mx, my) {
    for (const b of this._getButtons()) {
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return b.id;
    }
    return null;
  }

  _onMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.W / rect.width);
    const my = (e.clientY - rect.top) * (this.H / rect.height);
    this.hovered = this._hitTest(mx, my);
    this.canvas.style.cursor = this.hovered ? 'pointer' : 'default';
  }

  _onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.W / rect.width);
    const my = (e.clientY - rect.top) * (this.H / rect.height);
    const id = this._hitTest(mx, my);
    if (!id) return;

    if (this.mode === 'balance') {
      if (id === 'reset') {
        this.coeffs = { ch4: 1, o2: 1, co2: 1, h2o: 1 };
        return;
      }
      const [key, action] = id.split('-');
      if (action === 'plus' && this.coeffs[key] < 6) this.coeffs[key]++;
      if (action === 'minus' && this.coeffs[key] > 1) this.coeffs[key]--;
    } else if (this.mode === 'energy') {
      if (id === 'toggle-energy') this.showExo = !this.showExo;
    } else if (this.mode === 'collision') {
      if (id === 'replay-collision') this.collisionTime = 0;
    }
  }
}

/* ── Register ── */
registerSim('reactionViz', (canvas, opts) => new ReactionViz(canvas, opts));
