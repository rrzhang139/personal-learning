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

/**
 * Ozone Story — interactive, event-driven, puzzle-style
 *
 * Learner drags atoms, clicks to place bonds, interacts at each step.
 * Visuals evolve as narration progresses via setVisualState().
 */
class OzoneStoryViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;
    this._time = 0;

    // Atoms — draggable
    this.atoms = [
      { x: 150, y: 120, symbol: 'O', ve: 6, dragging: false },
      { x: 450, y: 300, symbol: 'O', ve: 6, dragging: false },
      { x: 750, y: 150, symbol: 'O', ve: 6, dragging: false },
    ];
    this._floatPhase = this.atoms.map(() => Math.random() * Math.PI * 2);

    // Snap targets for bonded positions
    this.bondedPositions = [
      { x: 200, y: 210 },  // left O
      { x: 450, y: 210 },  // center O
      { x: 700, y: 210 },  // right O
    ];

    // Visual state
    this.phase = 'floating'; // 'floating' | 'dragging' | 'bonded-A' | 'bonded-B' | 'fc-A' | 'fc-B' | 'hybrid' | 'proof'
    this.showDots = false;
    this.showLabel = '';
    this.showSubLabel = '';
    this.showInstruction = '';
    this.bondAlpha = 0;       // fade-in for bonds
    this.fcAlpha = 0;         // fade-in for FC
    this.hybridAlpha = 0;     // fade-in for hybrid
    this.proofAlpha = 0;      // fade-in for bond length

    // Interaction tracking for checkpoints
    this.atomsDraggedTogether = false;
    this.bondAPlaced = false;
    this.bondBViewed = false;
    this.hybridViewed = false;

    // Dragging state
    this._dragIdx = -1;
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

    this._lastTime = performance.now();
    this._animate();
  }

  setVisualState(state) {
    if (state.phase !== undefined) this.phase = state.phase;
    if (state.showDots !== undefined) this.showDots = state.showDots;
    if (state.showLabel !== undefined) this.showLabel = state.showLabel;
    if (state.showSubLabel !== undefined) this.showSubLabel = state.showSubLabel;
    if (state.showInstruction !== undefined) this.showInstruction = state.showInstruction;

    // Snap atoms to bonded positions for bonded phases
    if (this.phase.startsWith('bonded') || this.phase === 'fc-A' || this.phase === 'fc-B' || this.phase === 'hybrid' || this.phase === 'proof') {
      for (let i = 0; i < 3; i++) {
        this.atoms[i].x = this.bondedPositions[i].x;
        this.atoms[i].y = this.bondedPositions[i].y;
      }
    }
  }

  /* --- input --- */
  _getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (this.W / rect.width),
      y: (src.clientY - rect.top) * (this.H / rect.height),
    };
  }

  _handleDown(e) {
    if (this.phase !== 'floating' && this.phase !== 'dragging') return;
    const { x, y } = this._getPos(e);
    for (let i = 0; i < this.atoms.length; i++) {
      const a = this.atoms[i];
      const dx = x - a.x, dy = y - a.y;
      if (dx * dx + dy * dy < 40 * 40) {
        this._dragIdx = i;
        this.phase = 'dragging';
        if (e.touches) e.preventDefault();
        return;
      }
    }
  }

  _handleMove(e) {
    if (this._dragIdx < 0) return;
    if (e.touches) e.preventDefault();
    const { x, y } = this._getPos(e);
    this.atoms[this._dragIdx].x = x;
    this.atoms[this._dragIdx].y = y;
  }

  _handleUp() {
    if (this._dragIdx >= 0) {
      // Check if atoms are close enough to snap
      this._checkSnap();
      this._dragIdx = -1;
    }
  }

  _checkSnap() {
    // Check if all three atoms are near their bonded positions
    let allClose = true;
    for (let i = 0; i < 3; i++) {
      const dx = this.atoms[i].x - this.bondedPositions[i].x;
      const dy = this.atoms[i].y - this.bondedPositions[i].y;
      if (dx * dx + dy * dy > 80 * 80) allClose = false;
    }
    if (allClose) {
      this.atomsDraggedTogether = true;
      // Snap into place
      for (let i = 0; i < 3; i++) {
        this.atoms[i].x = this.bondedPositions[i].x;
        this.atoms[i].y = this.bondedPositions[i].y;
      }
    }
  }

  /* --- drawing helpers --- */
  _drawAtomCircle(ctx, x, y, r, highlight) {
    if (highlight) { ctx.shadowColor = ACCENT; ctx.shadowBlur = 25; }
    ctx.fillStyle = '#0d1b2a';
    ctx.strokeStyle = highlight ? ACCENT : '#2a4a6a';
    ctx.lineWidth = highlight ? 3 : 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
  }

  _drawAtomLabel(ctx, x, y, symbol) {
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y);
  }

  _drawVEDots(ctx, x, y, count) {
    ctx.fillStyle = YELLOW;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const dx = Math.cos(angle) * 42;
      const dy = Math.sin(angle) * 42;
      ctx.beginPath(); ctx.arc(x + dx, y + dy, 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  _drawBond(ctx, x1, y1, x2, y2, order, color, alpha) {
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / dist, uy = dy / dist;
    const nx = -uy, ny = ux;
    const r = 34;
    const gap = 8;
    ctx.globalAlpha = alpha;
    for (let i = 0; i < order; i++) {
      const off = (i - (order - 1) / 2) * gap * 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1 + ux * r + nx * off, y1 + uy * r + ny * off);
      ctx.lineTo(x2 - ux * r + nx * off, y2 - uy * r + ny * off);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  _drawDashedBond(ctx, x1, y1, x2, y2, alpha) {
    ctx.setLineDash([6, 4]);
    this._drawBond(ctx, x1, y1, x2, y2, 1, PURPLE, alpha);
    ctx.setLineDash([]);
  }

  _drawLonePairs(ctx, cx, cy, count, avoidAngle) {
    ctx.fillStyle = YELLOW;
    const dist = 42;
    const start = avoidAngle + Math.PI; // opposite side from bond
    for (let i = 0; i < count; i++) {
      const angle = start + (i / count) * Math.PI * 1.4 - 0.35;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const perpX = -Math.sin(angle) * 4;
      const perpY = Math.cos(angle) * 4;
      ctx.beginPath(); ctx.arc(px + perpX, py + perpY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px - perpX, py - perpY, 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  _drawFC(ctx, x, y, fc, alpha) {
    if (fc === 0) return;
    ctx.globalAlpha = alpha;
    const color = fc > 0 ? RED : GREEN;
    ctx.fillStyle = color;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(fc > 0 ? `+${fc}` : `${fc}`, x + 24, y - 28);
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x + 24, y - 28, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  _drawFCBox(ctx, x, y, V, L, halfB, fc, alpha) {
    ctx.globalAlpha = alpha;
    const bx = x - 75, by = y + 45;
    ctx.fillStyle = '#111828'; ctx.strokeStyle = DIM; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(bx, by, 150, 55, 6); ctx.fill(); ctx.stroke();
    ctx.font = '11px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = GREY;
    ctx.fillText(`V=${V}  L=${L}  ½B=${halfB}`, bx + 6, by + 16);
    ctx.fillStyle = WHITE; ctx.font = 'bold 12px monospace';
    ctx.fillText(`FC = ${V}−${L}−${halfB} = ${fc > 0 ? '+' : ''}${fc}`, bx + 6, by + 36);
    ctx.globalAlpha = 1;
  }

  _drawDelocalizedCloud(ctx, alpha) {
    const t = this._time;
    const cx = 450, cy = 210;
    const pulse = (0.1 + 0.05 * Math.sin(t * 1.5)) * alpha;
    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 200);
    grad.addColorStop(0, `rgba(187,134,252,${pulse * 1.5})`);
    grad.addColorStop(0.6, `rgba(187,134,252,${pulse})`);
    grad.addColorStop(1, 'rgba(187,134,252,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.ellipse(cx, cy, 220, 70, 0, 0, Math.PI * 2); ctx.fill();

    // Floating particles
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + t * 0.6;
      const rx = 160 + 30 * Math.sin(t * 0.4 + i);
      const ry = 35 + 15 * Math.sin(t * 0.3 + i * 2);
      ctx.fillStyle = `rgba(187,134,252,${(0.3 + 0.2 * Math.sin(t + i)) * alpha})`;
      ctx.beginPath(); ctx.arc(cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry, 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  _drawBondLengthBars(ctx, alpha) {
    ctx.globalAlpha = alpha;
    const y = 365, barH = 14;
    const bars = [
      { label: 'O—O single: 1.48 Å', len: 1.48, color: DIM, x: 180 },
      { label: 'O₃ actual: 1.28 Å', len: 1.28, color: PURPLE, x: 450 },
      { label: 'O=O double: 1.21 Å', len: 1.21, color: ORANGE, x: 720 },
    ];
    for (const b of bars) {
      const w = (b.len / 1.5) * 120;
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.roundRect(b.x - w / 2, y, w, barH, 3); ctx.fill();
      ctx.fillStyle = WHITE; ctx.font = '12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x, y - 6);
    }
    ctx.globalAlpha = 1;
  }

  /* --- main render --- */
  _render(ctx) {
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    const t = this._time;
    const a = this.atoms;
    const p = this.phase;

    // Fade targets
    this.bondAlpha = lerp(this.bondAlpha, (p.startsWith('bonded') || p.startsWith('fc') || p === 'hybrid' || p === 'proof') ? 1 : 0, 0.08);
    this.fcAlpha = lerp(this.fcAlpha, p.startsWith('fc') ? 1 : 0, 0.06);
    this.hybridAlpha = lerp(this.hybridAlpha, (p === 'hybrid' || p === 'proof') ? 1 : 0, 0.05);
    this.proofAlpha = lerp(this.proofAlpha, p === 'proof' ? 1 : 0, 0.06);

    // Float atoms when not bonded
    if (p === 'floating' || p === 'dragging') {
      for (let i = 0; i < 3; i++) {
        if (this._dragIdx !== i) {
          const phase = this._floatPhase[i];
          // Gentle float
          this.atoms[i].x += Math.sin(t * 0.5 + phase) * 0.3;
          this.atoms[i].y += Math.cos(t * 0.4 + phase * 1.3) * 0.2;
          // Keep in bounds
          this.atoms[i].x = Math.max(50, Math.min(this.W - 50, this.atoms[i].x));
          this.atoms[i].y = Math.max(50, Math.min(this.H - 80, this.atoms[i].y));
        }
      }
    }

    // Delocalized cloud (behind everything)
    if (this.hybridAlpha > 0.01) {
      this._drawDelocalizedCloud(ctx, this.hybridAlpha);
    }

    // Bonds
    if (this.bondAlpha > 0.01) {
      const isA = p === 'bonded-A' || p === 'fc-A';
      const isB = p === 'bonded-B' || p === 'fc-B';
      const isHybrid = p === 'hybrid' || p === 'proof';

      if (isA) {
        this._drawBond(ctx, a[0].x, a[0].y, a[1].x, a[1].y, 2, ORANGE, this.bondAlpha);
        this._drawBond(ctx, a[1].x, a[1].y, a[2].x, a[2].y, 1, ACCENT, this.bondAlpha);
        // Lone pairs
        this._drawLonePairs(ctx, a[0].x, a[0].y, 2, 0);
        this._drawLonePairs(ctx, a[1].x, a[1].y, 1, Math.PI / 2);
        this._drawLonePairs(ctx, a[2].x, a[2].y, 3, Math.PI);
      } else if (isB) {
        this._drawBond(ctx, a[0].x, a[0].y, a[1].x, a[1].y, 1, ACCENT, this.bondAlpha);
        this._drawBond(ctx, a[1].x, a[1].y, a[2].x, a[2].y, 2, ORANGE, this.bondAlpha);
        this._drawLonePairs(ctx, a[0].x, a[0].y, 3, 0);
        this._drawLonePairs(ctx, a[1].x, a[1].y, 1, Math.PI / 2);
        this._drawLonePairs(ctx, a[2].x, a[2].y, 2, Math.PI);
      } else if (isHybrid) {
        this._drawDashedBond(ctx, a[0].x, a[0].y, a[1].x, a[1].y, this.hybridAlpha);
        this._drawDashedBond(ctx, a[1].x, a[1].y, a[2].x, a[2].y, this.hybridAlpha);
        // Bond order labels
        ctx.globalAlpha = this.hybridAlpha;
        ctx.fillStyle = PURPLE; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
        ctx.fillText('1.5', (a[0].x + a[1].x) / 2, a[0].y - 30);
        ctx.fillText('1.5', (a[1].x + a[2].x) / 2, a[1].y - 30);
        ctx.globalAlpha = 1;
      }
    }

    // Formal charge boxes
    if (this.fcAlpha > 0.01) {
      if (p === 'fc-A') {
        this._drawFCBox(ctx, a[0].x, a[0].y, 6, 4, 2, 0, this.fcAlpha);
        this._drawFCBox(ctx, a[1].x, a[1].y, 6, 2, 3, +1, this.fcAlpha);
        this._drawFCBox(ctx, a[2].x, a[2].y, 6, 6, 1, -1, this.fcAlpha);
        this._drawFC(ctx, a[0].x, a[0].y, 0, this.fcAlpha);
        this._drawFC(ctx, a[1].x, a[1].y, +1, this.fcAlpha);
        this._drawFC(ctx, a[2].x, a[2].y, -1, this.fcAlpha);
      } else if (p === 'fc-B') {
        this._drawFCBox(ctx, a[0].x, a[0].y, 6, 6, 1, -1, this.fcAlpha);
        this._drawFCBox(ctx, a[1].x, a[1].y, 6, 2, 3, +1, this.fcAlpha);
        this._drawFCBox(ctx, a[2].x, a[2].y, 6, 4, 2, 0, this.fcAlpha);
        this._drawFC(ctx, a[0].x, a[0].y, -1, this.fcAlpha);
        this._drawFC(ctx, a[1].x, a[1].y, +1, this.fcAlpha);
        this._drawFC(ctx, a[2].x, a[2].y, 0, this.fcAlpha);
      }
    }

    // Atoms (always on top)
    for (let i = 0; i < 3; i++) {
      const highlight = this._dragIdx === i;
      this._drawAtomCircle(ctx, a[i].x, a[i].y, 32, highlight);
      this._drawAtomLabel(ctx, a[i].x, a[i].y, 'O');
      if (this.showDots && (p === 'floating' || p === 'dragging')) {
        this._drawVEDots(ctx, a[i].x, a[i].y, 6);
      }
    }

    // Bond length proof bars
    if (this.proofAlpha > 0.01) {
      this._drawBondLengthBars(ctx, this.proofAlpha);
    }

    // VE badge
    if (this.showDots || this.bondAlpha > 0.5) {
      ctx.fillStyle = '#111828'; ctx.strokeStyle = GREEN; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(this.W - 145, 8, 130, 32, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = GREEN; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
      ctx.fillText('18 valence e⁻', this.W - 80, 28);
    }

    // Structure label
    if (p === 'bonded-A' || p === 'fc-A') {
      ctx.fillStyle = ORANGE; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
      ctx.fillText('Structure A:  O═O—O', this.W / 2, this.H - 12);
    } else if (p === 'bonded-B' || p === 'fc-B') {
      ctx.fillStyle = ACCENT; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
      ctx.fillText('Structure B:  O—O═O', this.W / 2, this.H - 12);
    } else if (p === 'hybrid' || p === 'proof') {
      ctx.fillStyle = PURPLE; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
      ctx.fillText('Resonance Hybrid — the REAL ozone', this.W / 2, this.H - 12);
    }

    // Top label
    if (this.showLabel) {
      ctx.fillStyle = WHITE; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showLabel, this.W / 2, 30);
    }
    if (this.showSubLabel) {
      ctx.fillStyle = GREY; ctx.font = '12px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showSubLabel, this.W / 2, 50);
    }

    // Instruction prompt (for interactive steps)
    if (this.showInstruction) {
      ctx.fillStyle = '#1a1a0a'; ctx.strokeStyle = ORANGE; ctx.lineWidth = 2;
      const iw = ctx.measureText(this.showInstruction).width + 40;
      ctx.beginPath(); ctx.roundRect(this.W / 2 - iw / 2, this.H - 55, iw, 30, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ORANGE; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
      ctx.fillText(this.showInstruction, this.W / 2, this.H - 36);
    }

    // Drag hint arrows (floating phase)
    if (p === 'floating' || p === 'dragging') {
      ctx.fillStyle = `rgba(0,229,255,${0.3 + 0.2 * Math.sin(t * 2)})`;
      ctx.font = '28px sans-serif'; ctx.textAlign = 'center';
      // Arrow toward center between atoms 0 and 1
      ctx.fillText('→', (a[0].x + a[1].x) / 2 - 30, (a[0].y + a[1].y) / 2);
      ctx.fillText('←', (a[1].x + a[2].x) / 2 + 30, (a[1].y + a[2].y) / 2);
    }
  }

  _animate() {
    if (!this.running) return;
    const now = performance.now();
    this._time += (now - this._lastTime) / 1000;
    this._lastTime = now;
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

registerSim('ozoneStoryViz', (canvas, opts) => new OzoneStoryViz(canvas, opts));
