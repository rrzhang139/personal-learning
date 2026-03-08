import { registerSim } from './registry.js';

// ── Example element pairs at key ΔEN positions ─────────────────────────
const EXAMPLES = [
  { den: 0.0, label: 'H₂, O₂, N₂',  note: 'Same atom — equal sharing' },
  { den: 0.4, label: 'C–H',          note: 'Barely polar' },
  { den: 0.9, label: 'H–Cl',         note: 'Polar covalent' },
  { den: 1.4, label: 'H–F',          note: 'Strongly polar' },
  { den: 2.1, label: 'Na–Cl',        note: 'Ionic bond' },
  { den: 3.0, label: 'Cs–F',         note: 'Most ionic' },
];

// ── Tick marks along the spectrum ───────────────────────────────────────
const TICKS = [0, 0.4, 0.8, 1.2, 1.7, 2.0, 2.5, 3.0];

const MAX_DEN = 3.3;

// ── Theme ───────────────────────────────────────────────────────────────
const THEME = {
  bg:       '#0a0a1a',
  text:     '#e0e0e0',
  dimText:  'rgba(224,224,224,0.5)',
  accent:   '#00d4ff',
  barTop:   40,
};

// ── Colour helpers ──────────────────────────────────────────────────────
function lerpColor(a, b, t) {
  const pa = [parseInt(a.slice(1,3),16), parseInt(a.slice(3,5),16), parseInt(a.slice(5,7),16)];
  const pb = [parseInt(b.slice(1,3),16), parseInt(b.slice(3,5),16), parseInt(b.slice(5,7),16)];
  const r = Math.round(pa[0] + (pb[0]-pa[0])*t);
  const g = Math.round(pa[1] + (pb[1]-pa[1])*t);
  const bl = Math.round(pa[2] + (pb[2]-pa[2])*t);
  return `rgb(${r},${g},${bl})`;
}

function spectrumColor(t) {
  // t in [0,1] maps across the gradient bar
  // 0 = cyan (#00d4ff), ~0.3 = green (#66bb6a), ~0.5 = yellow (#ffee58), ~0.7 = orange (#ff9800), 1 = red (#ef5350)
  const stops = [
    { pos: 0.00, col: '#00d4ff' },
    { pos: 0.12, col: '#26c6da' },
    { pos: 0.30, col: '#66bb6a' },
    { pos: 0.50, col: '#c0ca33' },
    { pos: 0.52, col: '#ffee58' },
    { pos: 0.70, col: '#ff9800' },
    { pos: 1.00, col: '#ef5350' },
  ];
  if (t <= 0) return stops[0].col;
  if (t >= 1) return stops[stops.length - 1].col;
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i].pos) {
      const local = (t - stops[i-1].pos) / (stops[i].pos - stops[i-1].pos);
      return lerpColor(stops[i-1].col, stops[i].col, local);
    }
  }
  return stops[stops.length - 1].col;
}

// ── BondSpectrumViz class ───────────────────────────────────────────────
export class BondSpectrumViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 400;

    this._den = opts.value ?? 0;  // current ΔEN
    this.running = false;
    this._animTime = 0;

    // Layout
    this._barMarginX = 0.15 * canvas.width;  // 15% margin each side → 70% width
    this._barX = this._barMarginX;
    this._barW = canvas.width - 2 * this._barMarginX;
    this._barY = 60;
    this._barH = 36;

    // Dragging state
    this._dragging = false;

    // Bind mouse/touch handlers
    this._onDown = this._handleDown.bind(this);
    this._onMove = this._handleMove.bind(this);
    this._onUp   = this._handleUp.bind(this);
    canvas.addEventListener('mousedown',  this._onDown);
    canvas.addEventListener('mousemove',  this._onMove);
    canvas.addEventListener('mouseup',    this._onUp);
    canvas.addEventListener('mouseleave', this._onUp);
    canvas.addEventListener('touchstart', this._onDown, { passive: false });
    canvas.addEventListener('touchmove',  this._onMove, { passive: false });
    canvas.addEventListener('touchend',   this._onUp);

    this._start();
  }

  // ── Public API ────────────────────────────────────────────────────────
  setDeltaEN(value) {
    this._den = Math.max(0, Math.min(MAX_DEN, value));
  }

  stop() {
    this.running = false;
    const c = this.canvas;
    c.removeEventListener('mousedown',  this._onDown);
    c.removeEventListener('mousemove',  this._onMove);
    c.removeEventListener('mouseup',    this._onUp);
    c.removeEventListener('mouseleave', this._onUp);
    c.removeEventListener('touchstart', this._onDown);
    c.removeEventListener('touchmove',  this._onMove);
    c.removeEventListener('touchend',   this._onUp);
  }

  // ── Interaction ───────────────────────────────────────────────────────
  _canvasXY(e) {
    const r = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - r.left) * (this.canvas.width / r.width),
      y: (clientY - r.top) * (this.canvas.height / r.height),
    };
  }

  _xToDEN(px) {
    return Math.max(0, Math.min(MAX_DEN, ((px - this._barX) / this._barW) * MAX_DEN));
  }

  _denToX(den) {
    return this._barX + (den / MAX_DEN) * this._barW;
  }

  _handleDown(e) {
    e.preventDefault();
    const { x, y } = this._canvasXY(e);
    // Check if click is near the bar or indicator region
    if (y >= this._barY - 20 && y <= this._barY + this._barH + 30 &&
        x >= this._barX - 10 && x <= this._barX + this._barW + 10) {
      this._dragging = true;
      this._den = this._xToDEN(x);
    }
  }

  _handleMove(e) {
    if (!this._dragging) return;
    e.preventDefault();
    const { x } = this._canvasXY(e);
    this._den = this._xToDEN(x);
  }

  _handleUp() {
    this._dragging = false;
  }

  // ── Animation loop ────────────────────────────────────────────────────
  _start() {
    this.running = true;
    const tick = (ts) => {
      if (!this.running) return;
      this._animTime = ts;
      this._draw();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Main draw ─────────────────────────────────────────────────────────
  _draw() {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;

    // ── Background ────────────────────────────────────────────────────
    ctx.fillStyle = THEME.bg;
    ctx.fillRect(0, 0, W, H);

    // ── Title ─────────────────────────────────────────────────────────
    ctx.fillStyle = THEME.accent;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Bond Type Spectrum — Electronegativity Difference (ΔEN)', W / 2, 30);

    // ── Gradient bar ──────────────────────────────────────────────────
    this._drawSpectrumBar();

    // ── Tick marks ────────────────────────────────────────────────────
    this._drawTicks();

    // ── Zone labels above bar ────────────────────────────────────────
    this._drawZoneLabels();

    // ── Example pairs ────────────────────────────────────────────────
    this._drawExamples();

    // ── Indicator / slider ───────────────────────────────────────────
    this._drawIndicator();

    // ── Current ΔEN readout ──────────────────────────────────────────
    this._drawReadout();

    // ── Bond animation below bar ─────────────────────────────────────
    this._drawBondAnimation();
  }

  // ── Spectrum gradient bar ─────────────────────────────────────────────
  _drawSpectrumBar() {
    const { ctx } = this;
    const steps = 300;
    const stepW = this._barW / steps;

    // Draw gradient as many thin rects
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      ctx.fillStyle = spectrumColor(t);
      ctx.fillRect(this._barX + i * stepW, this._barY, stepW + 0.5, this._barH);
    }

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(this._barX, this._barY, this._barW, this._barH);
  }

  // ── Tick marks ────────────────────────────────────────────────────────
  _drawTicks() {
    const { ctx } = this;
    const tickY = this._barY + this._barH;

    ctx.strokeStyle = THEME.text;
    ctx.lineWidth = 1;
    ctx.fillStyle = THEME.text;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    for (const t of TICKS) {
      const x = this._denToX(t);
      ctx.beginPath();
      ctx.moveTo(x, tickY);
      ctx.lineTo(x, tickY + 8);
      ctx.stroke();
      ctx.fillText(t.toFixed(1), x, tickY + 20);
    }
  }

  // ── Zone labels ───────────────────────────────────────────────────────
  _drawZoneLabels() {
    const { ctx } = this;
    const labelY = this._barY - 8;

    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';

    // Pure Covalent: 0–0.4
    const covalentCenterX = this._denToX(0.2);
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('Pure Covalent', covalentCenterX, labelY);

    // Polar Covalent: 0.4–1.7
    const polarCenterX = this._denToX(1.05);
    ctx.fillStyle = '#c0ca33';
    ctx.fillText('Polar Covalent', polarCenterX, labelY);

    // Ionic: > 1.7
    const ionicCenterX = this._denToX(2.4);
    ctx.fillStyle = '#ef5350';
    ctx.fillText('Ionic', ionicCenterX, labelY);
  }

  // ── Example element pairs ─────────────────────────────────────────────
  _drawExamples() {
    const { ctx } = this;
    const y1 = this._barY + this._barH + 32;

    ctx.font = '9px monospace';
    ctx.textAlign = 'center';

    for (const ex of EXAMPLES) {
      const x = this._denToX(ex.den);
      // Highlight if near current ΔEN
      const dist = Math.abs(this._den - ex.den);
      const alpha = dist < 0.25 ? 1.0 : 0.4;
      ctx.globalAlpha = alpha;

      ctx.fillStyle = spectrumColor(ex.den / MAX_DEN);
      ctx.fillText(ex.label, x, y1);
      ctx.fillStyle = THEME.dimText;
      ctx.fillText(ex.note, x, y1 + 12);
    }
    ctx.globalAlpha = 1;
  }

  // ── Indicator (draggable triangle + vertical line) ────────────────────
  _drawIndicator() {
    const { ctx } = this;
    const x = this._denToX(this._den);
    const barTop = this._barY;
    const barBot = this._barY + this._barH;

    // Vertical line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, barTop - 2);
    ctx.lineTo(x, barBot + 2);
    ctx.stroke();

    // Triangle handle above bar
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x, barTop - 4);
    ctx.lineTo(x - 7, barTop - 16);
    ctx.lineTo(x + 7, barTop - 16);
    ctx.closePath();
    ctx.fill();

    // Glow
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── ΔEN readout ───────────────────────────────────────────────────────
  _drawReadout() {
    const { ctx, canvas } = this;

    // Classification text
    let classification;
    if (this._den < 0.4) classification = 'Pure Covalent (equal sharing)';
    else if (this._den < 1.7) classification = 'Polar Covalent (unequal sharing)';
    else classification = 'Ionic (electron transferred)';

    // Large ΔEN value
    const readoutY = 170;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`ΔEN = ${this._den.toFixed(2)}`, canvas.width / 2, readoutY);

    // Classification
    ctx.fillStyle = spectrumColor(this._den / MAX_DEN);
    ctx.font = 'bold 13px monospace';
    ctx.fillText(classification, canvas.width / 2, readoutY + 22);

    // Drag hint
    ctx.fillStyle = THEME.dimText;
    ctx.font = '10px monospace';
    ctx.fillText('↔ drag the slider along the bar', canvas.width / 2, readoutY + 40);
  }

  // ── Mini bond-type animation ──────────────────────────────────────────
  _drawBondAnimation() {
    const { ctx, canvas } = this;
    const cx = canvas.width / 2;
    const cy = 310;
    const t = this._animTime / 1000;  // seconds
    const den = this._den;

    // Normalised position 0 → pure covalent, 1 → ionic
    const ionicity = Math.min(1, den / 2.5);

    // Atom separation increases with ionicity
    const baseSep = 50;
    const sep = baseSep + ionicity * 40;

    const leftAtomX = cx - sep;
    const rightAtomX = cx + sep;
    const atomR = 22;

    // Atom colours — left is less electronegative, right is more
    const leftCol = lerpColor('#4fc3f7', '#ef5350', ionicity);
    const rightCol = lerpColor('#4fc3f7', '#00d4ff', ionicity * 0.5);

    // ── Draw atoms ──────────────────────────────────────────────────
    // Left atom
    ctx.beginPath();
    ctx.arc(leftAtomX, cy, atomR, 0, Math.PI * 2);
    ctx.fillStyle = leftCol;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right atom
    ctx.beginPath();
    ctx.arc(rightAtomX, cy, atomR, 0, Math.PI * 2);
    ctx.fillStyle = rightCol;
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── Draw electrons ──────────────────────────────────────────────
    // Electron cloud or discrete electrons depending on bond type
    if (den < 1.7) {
      // Covalent / polar covalent: show electron pair as orbiting dots
      // Shift = how much electrons are pulled toward right atom
      const shift = ionicity * sep * 0.7;
      const cloudCenterX = cx + shift - ionicity * sep * 0.1;

      // Two electrons orbiting in a figure-8 / ellipse
      const orbA = 30 - ionicity * 8;   // semi-major axis
      const orbB = 12;                  // semi-minor axis
      const speed = 2.5;

      for (let i = 0; i < 2; i++) {
        const phase = i * Math.PI;
        const ex = cloudCenterX + Math.cos(t * speed + phase) * orbA;
        const ey = cy + Math.sin(t * speed * 2 + phase) * orbB;

        // Electron glow
        ctx.beginPath();
        ctx.arc(ex, ey, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffee58';
        ctx.shadowColor = '#ffee58';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Bond line between atoms
      ctx.beginPath();
      ctx.moveTo(leftAtomX + atomR, cy);
      ctx.lineTo(rightAtomX - atomR, cy);
      ctx.strokeStyle = `rgba(255,238,88,${0.3 + 0.2 * Math.sin(t * 3)})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Partial charges for polar covalent
      if (den >= 0.4) {
        const chargeAlpha = Math.min(1, (den - 0.4) / 1.3);
        ctx.globalAlpha = chargeAlpha;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';

        ctx.fillStyle = '#ef5350';
        ctx.fillText('δ+', leftAtomX, cy - atomR - 8);
        ctx.fillStyle = '#4fc3f7';
        ctx.fillText('δ−', rightAtomX, cy - atomR - 8);
        ctx.globalAlpha = 1;
      }
    } else {
      // Ionic: electron fully transferred — show it attached to right atom
      const pulse = Math.sin(t * 3) * 0.15 + 1;

      // Electron ring around right atom (gained electron)
      ctx.beginPath();
      ctx.arc(rightAtomX, cy, atomR + 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,238,88,${0.5 + 0.3 * Math.sin(t * 2)})`;
      ctx.lineWidth = 2.5 * pulse;
      ctx.stroke();

      // Second electron dot orbiting right atom
      const orbitR = atomR + 6;
      const ex = rightAtomX + Math.cos(t * 2) * orbitR;
      const ey = cy + Math.sin(t * 2) * orbitR;
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffee58';
      ctx.shadowColor = '#ffee58';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Another electron on opposite side
      const ex2 = rightAtomX + Math.cos(t * 2 + Math.PI) * orbitR;
      const ey2 = cy + Math.sin(t * 2 + Math.PI) * orbitR;
      ctx.beginPath();
      ctx.arc(ex2, ey2, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffee58';
      ctx.shadowColor = '#ffee58';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Full charges
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef5350';
      ctx.fillText('+', leftAtomX, cy - atomR - 10);
      ctx.fillStyle = '#4fc3f7';
      ctx.fillText('−', rightAtomX, cy - atomR - 10);

      // Electrostatic attraction line (dashed)
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(leftAtomX + atomR + 4, cy);
      ctx.lineTo(rightAtomX - atomR - 10, cy);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── Atom labels ─────────────────────────────────────────────────
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A', leftAtomX, cy + 5);
    ctx.fillText('B', rightAtomX, cy + 5);

    // Less EN / More EN labels
    ctx.font = '9px monospace';
    ctx.fillStyle = THEME.dimText;
    ctx.fillText('less EN', leftAtomX, cy + atomR + 16);
    ctx.fillText('more EN', rightAtomX, cy + atomR + 16);

    // ── Description at bottom ───────────────────────────────────────
    let desc;
    if (den < 0.4) {
      desc = 'Electrons shared equally between identical or similar atoms';
    } else if (den < 1.7) {
      desc = 'Electrons pulled toward the more electronegative atom (unequal sharing)';
    } else {
      desc = 'Electron fully transferred — atoms become ions held by electrostatic attraction';
    }
    ctx.fillStyle = THEME.text;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(desc, canvas.width / 2, 380);
  }
}

// ── Register with simulation registry ───────────────────────────────────
registerSim('bondSpectrumViz', (canvas, opts) => new BondSpectrumViz(canvas, opts));
