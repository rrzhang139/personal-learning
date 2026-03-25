import { registerSim } from './registry.js';

const BG     = '#0a0a1a';
const ACCENT = '#00d4ff';
const GREEN  = '#4caf50';
const RED    = '#ef5350';
const ORANGE = '#ff9800';
const YELLOW = '#fdd835';
const PURPLE = '#bb86fc';
const GREY   = '#888';
const WHITE  = '#fff';
const DIM    = '#444';

function lerp(a, b, t) { return a + (b - a) * Math.min(Math.max(t, 0), 1); }
function easeOut(t) { return 1 - (1 - t) * (1 - t); }

/**
 * Ozone Story Visualizer — event-driven, step-synced animation
 *
 * Each narration step triggers a different visual state.
 * The sim progressively builds ozone from 3 lonely atoms
 * through Lewis structures, formal charge, and resonance hybrid.
 */
class OzoneStoryViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;

    // Current visual step (set by lesson runner or internal)
    this.step = 0;
    this._targetStep = 0;
    this._stepTransition = 1; // 0→1 transition progress

    // Animation time
    this._time = 0;

    // Atom positions — will animate
    this.atoms = [
      { x: 200, y: 210, targetX: 200, targetY: 210, symbol: 'O', ve: 6 },
      { x: 450, y: 210, targetX: 450, targetY: 210, symbol: 'O', ve: 6 },
      { x: 700, y: 210, targetX: 700, targetY: 210, symbol: 'O', ve: 6 },
    ];

    // Floating offsets for "lonely" atoms
    this._floatOffsets = this.atoms.map(() => ({
      x: Math.random() * Math.PI * 2,
      y: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
    }));

    // Visual state flags
    this.showDots = false;
    this.showBonds = false;
    this.bondConfig = 'A'; // 'A' = left double, 'B' = right double, 'hybrid'
    this.showFC = false;
    this.showFCCalc = false;
    this.showHybrid = false;
    this.showBondLength = false;
    this.showDelocalized = false;
    this.highlightAtom = -1; // -1 = none, 0/1/2 = which atom
    this.showLabel = '';
    this.showSubLabel = '';

    // Checkpoint tracking
    this.quizAnswered = 0;

    // Click handling for interactive moments
    this._onClick = this._handleClick.bind(this);
    this.canvas.addEventListener('click', this._onClick);

    this._lastTime = performance.now();
    this._animate();
  }

  /**
   * Called by lesson steps to update visual state
   */
  setVisualState(state) {
    Object.assign(this, state);
  }

  _handleClick(e) {
    // Future: clickable elements for checkpoints
  }

  /* --- atom drawing --- */
  _drawAtom(ctx, atom, idx, glow = false, showDots = false, fc = null) {
    const { x, y, symbol } = atom;
    const r = 32;
    const t = this._time;

    // Float animation for lonely atoms (step 0)
    let drawX = x, drawY = y;
    if (this.step <= 1) {
      const f = this._floatOffsets[idx];
      drawX += Math.sin(t * f.speed + f.x) * 12;
      drawY += Math.cos(t * f.speed * 0.7 + f.y) * 8;
    }

    // Glow
    if (glow || this.highlightAtom === idx) {
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 20;
    }

    // Atom circle
    ctx.fillStyle = '#0d1b2a';
    ctx.strokeStyle = glow || this.highlightAtom === idx ? ACCENT : '#2a4a6a';
    ctx.lineWidth = glow ? 3 : 2;
    ctx.beginPath();
    ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Symbol
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, drawX, drawY);

    // Valence electron dots
    if (showDots && !this.showBonds) {
      this._drawValenceDots(ctx, drawX, drawY, 6, r + 8);
    }

    // Formal charge badge
    if (fc !== null && fc !== 0 && this.showFC) {
      const fcX = drawX + 22, fcY = drawY - 26;
      const color = fc > 0 ? RED : GREEN;
      ctx.fillStyle = color;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(fc > 0 ? `+${fc}` : `${fc}`, fcX, fcY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fcX, fcY, 13, 0, Math.PI * 2);
      ctx.stroke();
    }

    return { x: drawX, y: drawY };
  }

  _drawValenceDots(ctx, cx, cy, count, dist) {
    ctx.fillStyle = YELLOW;
    const positions = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      positions.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
      });
    }
    // Animate dots appearing
    const showCount = Math.min(count, Math.floor(this._stepTransition * count * 1.5));
    for (let i = 0; i < showCount && i < count; i++) {
      ctx.beginPath();
      ctx.arc(positions[i].x, positions[i].y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* --- bond drawing --- */
  _drawBond(ctx, x1, y1, x2, y2, order, color = ACCENT) {
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / dist, ny = dx / dist;
    const ux = dx / dist, uy = dy / dist;
    const r = 34;
    const gap = order === 1 ? 0 : 8;

    for (let i = 0; i < order; i++) {
      const off = (i - (order - 1) / 2) * gap * 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1 + ux * r + nx * off, y1 + uy * r + ny * off);
      ctx.lineTo(x2 - ux * r + nx * off, y2 - uy * r + ny * off);
      ctx.stroke();
    }
  }

  _drawDashedBond(ctx, x1, y1, x2, y2, order) {
    ctx.setLineDash([6, 4]);
    this._drawBond(ctx, x1, y1, x2, y2, order, PURPLE);
    ctx.setLineDash([]);
  }

  /* --- lone pair drawing on bonded atoms --- */
  _drawLonePairs(ctx, cx, cy, count, bondAngles) {
    if (count === 0) return;
    ctx.fillStyle = YELLOW;
    const dist = 40;

    // Find angles not occupied by bonds
    const available = [];
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      let tooClose = false;
      for (const ba of bondAngles) {
        const diff = Math.abs(((a - ba) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
        if (diff < 0.8) { tooClose = true; break; }
      }
      if (!tooClose) available.push(a);
    }

    const step = Math.max(1, Math.floor(available.length / count));
    for (let i = 0; i < count && i * step < available.length; i++) {
      const angle = available[i * step];
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const perpX = -Math.sin(angle) * 4;
      const perpY = Math.cos(angle) * 4;
      ctx.beginPath(); ctx.arc(px + perpX, py + perpY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px - perpX, py - perpY, 3.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* --- FC calculation display --- */
  _drawFCCalculation(ctx, atomIdx, x, y, V, L, halfB, fc) {
    if (!this.showFCCalc) return;
    const alpha = this._stepTransition;
    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#111828';
    ctx.strokeStyle = DIM;
    ctx.lineWidth = 1;
    const bx = x - 80, by = y + 50, bw = 160, bh = 65;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();

    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = GREY;
    ctx.fillText(`V=${V}  L=${L}  ½B=${halfB}`, bx + 8, by + 18);
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`FC = ${V} − ${L} − ${halfB}`, bx + 8, by + 38);
    const color = fc > 0 ? RED : fc < 0 ? GREEN : ACCENT;
    ctx.fillStyle = color;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`= ${fc > 0 ? '+' : ''}${fc}`, bx + 8, by + 56);

    ctx.globalAlpha = 1;
  }

  /* --- delocalized electron cloud --- */
  _drawDelocalizedCloud(ctx) {
    if (!this.showDelocalized) return;
    const t = this._time;
    const cx = (this.atoms[0].x + this.atoms[2].x) / 2;
    const cy = this.atoms[0].y;
    const pulse = 0.08 + 0.04 * Math.sin(t * 1.5);

    // Draw cloud over the bond region
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 180);
    grad.addColorStop(0, `rgba(187, 134, 252, ${pulse * 1.5})`);
    grad.addColorStop(0.5, `rgba(187, 134, 252, ${pulse})`);
    grad.addColorStop(1, 'rgba(187, 134, 252, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 200, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Floating electron particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + t * 0.8;
      const rx = 140 + 20 * Math.sin(t * 0.5 + i);
      const ry = 30 + 10 * Math.sin(t * 0.3 + i * 2);
      const px = cx + Math.cos(angle) * rx;
      const py = cy + Math.sin(angle) * ry;
      ctx.fillStyle = `rgba(187, 134, 252, ${0.4 + 0.3 * Math.sin(t + i)})`;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* --- bond length display --- */
  _drawBondLengthComparison(ctx) {
    if (!this.showBondLength) return;
    const y = 370;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    // Three bars: single, ozone, double
    const bars = [
      { label: 'O—O single', length: 1.48, color: DIM, x: 200 },
      { label: 'O₃ actual', length: 1.28, color: PURPLE, x: 450 },
      { label: 'O=O double', length: 1.21, color: ORANGE, x: 700 },
    ];

    for (const bar of bars) {
      const w = (bar.length / 1.5) * 120;
      ctx.fillStyle = bar.color;
      ctx.fillRect(bar.x - w / 2, y, w, 12);
      ctx.fillStyle = WHITE;
      ctx.fillText(`${bar.label}: ${bar.length} Å`, bar.x, y - 8);
    }
  }

  /* --- main label --- */
  _drawLabels(ctx) {
    if (this.showLabel) {
      ctx.fillStyle = WHITE;
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.showLabel, this.W / 2, 35);
    }
    if (this.showSubLabel) {
      ctx.fillStyle = GREY;
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.showSubLabel, this.W / 2, 55);
    }
  }

  /* --- main render for current step --- */
  _render(ctx) {
    const step = this.step;

    // Background
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    // Draw delocalized cloud (behind atoms)
    this._drawDelocalizedCloud(ctx);

    // Position atoms based on step
    if (step <= 1) {
      // Floating, spread out
      this.atoms[0].x = lerp(this.atoms[0].x, 180, 0.05);
      this.atoms[1].x = lerp(this.atoms[1].x, 450, 0.05);
      this.atoms[2].x = lerp(this.atoms[2].x, 720, 0.05);
    } else {
      // Bonded — closer together
      this.atoms[0].x = lerp(this.atoms[0].x, 200, 0.08);
      this.atoms[1].x = lerp(this.atoms[1].x, 450, 0.08);
      this.atoms[2].x = lerp(this.atoms[2].x, 700, 0.08);
    }

    // Draw bonds
    if (this.showBonds) {
      const a = this.atoms;
      if (this.bondConfig === 'A') {
        this._drawBond(ctx, a[0].x, a[0].y, a[1].x, a[1].y, 2, ORANGE);
        this._drawBond(ctx, a[1].x, a[1].y, a[2].x, a[2].y, 1, ACCENT);
      } else if (this.bondConfig === 'B') {
        this._drawBond(ctx, a[0].x, a[0].y, a[1].x, a[1].y, 1, ACCENT);
        this._drawBond(ctx, a[1].x, a[1].y, a[2].x, a[2].y, 2, ORANGE);
      } else if (this.bondConfig === 'hybrid') {
        this._drawDashedBond(ctx, a[0].x, a[0].y, a[1].x, a[1].y, 1);
        this._drawDashedBond(ctx, a[1].x, a[1].y, a[2].x, a[2].y, 1);
        // Draw "1.5" labels
        ctx.fillStyle = PURPLE;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1.5', (a[0].x + a[1].x) / 2, a[0].y - 30);
        ctx.fillText('1.5', (a[1].x + a[2].x) / 2, a[1].y - 30);
      }

      // Lone pairs
      if (this.bondConfig === 'A') {
        this._drawLonePairs(ctx, a[0].x, a[0].y, 2, [0]); // left O: 2 LP
        this._drawLonePairs(ctx, a[1].x, a[1].y, 1, [Math.PI, 0]); // center O: 1 LP
        this._drawLonePairs(ctx, a[2].x, a[2].y, 3, [Math.PI]); // right O: 3 LP
      } else if (this.bondConfig === 'B') {
        this._drawLonePairs(ctx, a[0].x, a[0].y, 3, [0]); // left O: 3 LP
        this._drawLonePairs(ctx, a[1].x, a[1].y, 1, [Math.PI, 0]); // center: 1 LP
        this._drawLonePairs(ctx, a[2].x, a[2].y, 2, [Math.PI]); // right O: 2 LP
      }
    }

    // FC calculations
    if (this.showFCCalc) {
      if (this.bondConfig === 'A') {
        this._drawFCCalculation(ctx, 0, this.atoms[0].x, this.atoms[0].y, 6, 4, 2, 0);
        this._drawFCCalculation(ctx, 1, this.atoms[1].x, this.atoms[1].y, 6, 2, 3, +1);
        this._drawFCCalculation(ctx, 2, this.atoms[2].x, this.atoms[2].y, 6, 6, 1, -1);
      } else if (this.bondConfig === 'B') {
        this._drawFCCalculation(ctx, 0, this.atoms[0].x, this.atoms[0].y, 6, 6, 1, -1);
        this._drawFCCalculation(ctx, 1, this.atoms[1].x, this.atoms[1].y, 6, 2, 3, +1);
        this._drawFCCalculation(ctx, 2, this.atoms[2].x, this.atoms[2].y, 6, 4, 2, 0);
      }
    }

    // Draw atoms (on top of bonds)
    const fcA = this.bondConfig === 'A' ? [0, +1, -1] : this.bondConfig === 'B' ? [-1, +1, 0] : [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      this._drawAtom(ctx, this.atoms[i], i, false, this.showDots, this.showFC ? fcA[i] : null);
    }

    // Bond length comparison
    this._drawBondLengthComparison(ctx);

    // Labels
    this._drawLabels(ctx);

    // Structure label
    if (this.showBonds && !this.showHybrid) {
      ctx.fillStyle = this.bondConfig === 'A' ? ORANGE : ACCENT;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      if (this.bondConfig === 'A') {
        ctx.fillText('Structure A:  O=O—O', this.W / 2, this.H - 25);
      } else if (this.bondConfig === 'B') {
        ctx.fillText('Structure B:  O—O=O', this.W / 2, this.H - 25);
      }
    }
    if (this.showHybrid) {
      ctx.fillStyle = PURPLE;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Resonance Hybrid — the REAL ozone', this.W / 2, this.H - 25);
    }

    // "18 total VE" badge
    if (this.showDots || this.showBonds) {
      ctx.fillStyle = '#111828';
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(this.W - 140, 10, 125, 35, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = GREEN;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('18 valence e⁻', this.W - 77, 32);
    }
  }

  _animate() {
    if (!this.running) return;
    const now = performance.now();
    const dt = (now - this._lastTime) / 1000;
    this._lastTime = now;
    this._time += dt;

    // Step transition
    if (this._stepTransition < 1) {
      this._stepTransition = Math.min(1, this._stepTransition + dt * 2);
    }

    this._render(this.ctx);
    requestAnimationFrame(() => this._animate());
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
  }
}

registerSim('ozoneStoryViz', (canvas, opts) => new OzoneStoryViz(canvas, opts));
