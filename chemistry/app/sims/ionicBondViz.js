import { registerSim } from './registry.js';

const CYAN = '#00d4ff';
const GOLD = '#ffc107';
const GREEN = '#6fbf73';
const TEXT = '#e0e0e0';
const BG = '#0a0a1a';

export class IonicBondViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;
    this.time = 0;

    this.mode = (opts.mode === 'lattice') ? 'lattice' : 'transfer';

    // ── Transfer mode state ──
    this.phase = 'idle';        // 'idle' | 'transferring' | 'ionized' | 'bonding' | 'done'
    this.phaseTime = 0;
    this.autoStartTimer = 2;    // seconds before auto-starting transfer

    this.naCenterX = this.W * 0.28;
    this.clCenterX = this.W * 0.72;
    this.centerY = this.H * 0.48;

    this.shellRadii = [20, 48, 82];

    this.transferElectron = { x: 0, y: 0, progress: 0 };
    this.naDrift = 0;
    this.clDrift = 0;
    this.ionScale = { na: 1, cl: 1 };

    // Na valence angle (1 electron on shell 3)
    this.naValenceAngle = 0;
    // Cl valence angles (7 electrons evenly in 8 slots)
    this.clValenceAngles = [];
    for (let i = 0; i < 7; i++) {
      this.clValenceAngles.push((i / 8) * Math.PI * 2);
    }
    this.clGapAngle = (7 / 8) * Math.PI * 2;

    // ── Lattice mode state ──
    this.latticeRows = 5;
    this.latticeCols = 6;
    this.hoveredIon = null;

    // Mouse tracking for lattice hover
    this._onMouseMove = this._onMouseMove.bind(this);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this._onMouseLeave = () => { this.hoveredIon = null; };
    this.canvas.addEventListener('mouseleave', this._onMouseLeave);

    this._animate();
  }

  /* ── Public API ── */

  setMode(mode) {
    if (mode !== 'transfer' && mode !== 'lattice') return;
    this.mode = mode;
    if (mode === 'transfer') this._resetTransfer();
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
  }

  /* ── Internal: transfer mode ── */

  _resetTransfer() {
    this.phase = 'idle';
    this.phaseTime = 0;
    this.autoStartTimer = 2;
    this.transferElectron.progress = 0;
    this.naDrift = 0;
    this.clDrift = 0;
    this.ionScale = { na: 1, cl: 1 };
    this.naValenceAngle = 0;
    this.clValenceAngles = [];
    for (let i = 0; i < 7; i++) {
      this.clValenceAngles.push((i / 8) * Math.PI * 2);
    }
    this.clGapAngle = (7 / 8) * Math.PI * 2;
  }

  _startTransfer() {
    if (this.phase !== 'idle') return;
    this.phase = 'transferring';
    this.phaseTime = 0;
    this.transferElectron.progress = 0;
  }

  /* ── Update ── */

  _update(dt) {
    this.time += dt;

    if (this.mode === 'transfer') {
      this._updateTransfer(dt);
    }
    // Lattice mode has no state updates beyond time (for pulsing)
  }

  _updateTransfer(dt) {
    // Auto-start after idle period
    if (this.phase === 'idle') {
      this.autoStartTimer -= dt;
      if (this.autoStartTimer <= 0) this._startTransfer();
    }

    // Wobble Na valence electron
    this.naValenceAngle += dt * 1.2;

    // Rotate Cl valence electrons
    for (let i = 0; i < this.clValenceAngles.length; i++) {
      this.clValenceAngles[i] += dt * 0.4;
    }
    this.clGapAngle += dt * 0.4;

    this.phaseTime += dt;

    if (this.phase === 'transferring') {
      this.transferElectron.progress = Math.min(1, this.phaseTime / 2);
      if (this.transferElectron.progress >= 1) {
        this.phase = 'ionized';
        this.phaseTime = 0;
      }
    }

    if (this.phase === 'ionized') {
      const t = Math.min(1, this.phaseTime / 1);
      this.ionScale.na = 1 - t * 0.2;
      this.ionScale.cl = 1 + t * 0.1;
      if (this.phaseTime >= 1.2) {
        this.phase = 'bonding';
        this.phaseTime = 0;
      }
    }

    if (this.phase === 'bonding') {
      const t = Math.min(1, this.phaseTime / 2);
      const ease = t * t * (3 - 2 * t);
      const driftDist = (this.clCenterX - this.naCenterX) * 0.26;
      this.naDrift = ease * driftDist;
      this.clDrift = -ease * driftDist;
      if (this.phaseTime >= 2.2) {
        this.phase = 'done';
        this.phaseTime = 0;
      }
    }
  }

  /* ── Draw ── */

  _draw() {
    const ctx = this.ctx;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    if (this.mode === 'transfer') {
      this._drawTransfer(ctx);
    } else {
      this._drawLattice(ctx);
    }
  }

  /* ── Transfer mode drawing ── */

  _drawTransfer(ctx) {
    const naX = this.naCenterX + this.naDrift;
    const clX = this.clCenterX + this.clDrift;
    const cy = this.centerY;
    const reacted = this.phase === 'ionized' || this.phase === 'bonding' || this.phase === 'done';
    const transferring = this.phase === 'transferring';

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Ionic Bonding — Electron Transfer', this.W / 2, 22);

    // Electronegativity difference label
    if (!reacted) {
      const pulse = 0.6 + Math.sin(this.time * 2) * 0.15;
      ctx.globalAlpha = pulse;
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = CYAN;
      ctx.fillText('ΔEN = 3.16 − 0.93 = 2.23 → IONIC', this.W / 2, 50);
      ctx.globalAlpha = 1;

      // Arrow from Na to Cl
      const arrowY = cy - this.shellRadii[2] - 30;
      ctx.strokeStyle = 'rgba(0,212,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(naX + 40, arrowY);
      ctx.lineTo(clX - 40, arrowY);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrowhead
      ctx.fillStyle = 'rgba(0,212,255,0.5)';
      ctx.beginPath();
      ctx.moveTo(clX - 40, arrowY);
      ctx.lineTo(clX - 50, arrowY - 5);
      ctx.lineTo(clX - 50, arrowY + 5);
      ctx.closePath();
      ctx.fill();
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(0,212,255,0.6)';
      ctx.fillText('e⁻ transfer', this.W / 2, arrowY - 8);
    }

    // Draw atoms
    this._drawAtom(ctx, naX, cy, 'Na', this.ionScale.na, reacted, transferring);
    this._drawAtom(ctx, clX, cy, 'Cl', this.ionScale.cl, reacted, transferring);

    // Transferring electron animation
    if (transferring) {
      this._drawTransferElectron(ctx, naX, clX, cy);
    }

    // Labels below atoms
    this._drawTransferLabels(ctx, naX, clX, cy, reacted);

    // Final bond label
    if (this.phase === 'done') {
      const alpha = Math.min(1, this.phaseTime / 1.2);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.shadowColor = CYAN;
      ctx.shadowBlur = 15;
      ctx.fillText('Na⁺Cl⁻ — Ionic Bond', this.W / 2, this.H - 30);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Ionic bond marker during bonding/done
    if (this.phase === 'bonding' || this.phase === 'done') {
      const midX = (naX + clX) / 2;
      const bondAlpha = this.phase === 'bonding' ? Math.min(1, this.phaseTime / 1) : 1;
      ctx.globalAlpha = bondAlpha;
      ctx.font = '12px monospace';
      ctx.fillStyle = CYAN;
      ctx.textAlign = 'center';
      ctx.fillText('← electrostatic attraction →', midX, cy - 10);
      ctx.globalAlpha = 1;
    }
  }

  _drawAtom(ctx, cx, cy, element, scale, reacted, transferring) {
    const isNa = element === 'Na';
    const innerE = 2;
    const middleE = 8;

    const shellAlpha = ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.09)', 'rgba(255,255,255,0.06)'];

    // Draw electron shells
    for (let s = 0; s < 3; s++) {
      const r = this.shellRadii[s] * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = shellAlpha[s];
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Nucleus
    const nR = 10 * scale;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nR);
    if (isNa) {
      grad.addColorStop(0, reacted ? GOLD : '#ffc107cc');
      grad.addColorStop(1, reacted ? '#c79100' : '#c7910088');
    } else {
      grad.addColorStop(0, reacted ? GREEN : '#6fbf73cc');
      grad.addColorStop(1, reacted ? '#3a7d3e' : '#3a7d3e88');
    }
    ctx.beginPath();
    ctx.arc(cx, cy, nR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Proton count
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isNa ? '11+' : '17+', cx, cy);
    ctx.textBaseline = 'alphabetic';

    // Ion glow
    if (reacted) {
      const glowR = this.shellRadii[2] * scale + 12;
      const pulse = 0.04 + Math.sin(this.time * 2.5) * 0.02;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      if (isNa) {
        ctx.fillStyle = `rgba(100,150,255,${pulse})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(100,150,255,0.35)';
      } else {
        ctx.fillStyle = `rgba(255,80,80,${pulse})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,80,80,0.35)';
      }
      ctx.lineWidth = 2;
      ctx.stroke();

      // + or − label on the ion
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = isNa ? 'rgba(100,180,255,0.9)' : 'rgba(255,100,100,0.9)';
      ctx.fillText(isNa ? '+' : '−', cx, cy - this.shellRadii[2] * scale - 18);
    }

    // Inner electrons (shell 1: 2 electrons)
    for (let i = 0; i < innerE; i++) {
      const angle = (i / innerE) * Math.PI * 2 + this.time * 0.5;
      const ex = cx + Math.cos(angle) * this.shellRadii[0] * scale;
      const ey = cy + Math.sin(angle) * this.shellRadii[0] * scale;
      this._drawElectron(ctx, ex, ey, CYAN, 3);
    }

    // Middle electrons (shell 2: 8 electrons)
    for (let i = 0; i < middleE; i++) {
      const angle = (i / middleE) * Math.PI * 2 + this.time * 0.3;
      const ex = cx + Math.cos(angle) * this.shellRadii[1] * scale;
      const ey = cy + Math.sin(angle) * this.shellRadii[1] * scale;
      this._drawElectron(ctx, ex, ey, CYAN, 3);
    }

    // Outer electrons (shell 3)
    if (isNa) {
      if (!reacted && !transferring) {
        // 1 valence electron — wobbles and pulses
        const wobble = Math.sin(this.time * 3) * 8;
        const pulse = 3.5 + Math.sin(this.time * 5) * 1.5;
        const r = this.shellRadii[2] * scale + wobble;
        const ex = cx + Math.cos(this.naValenceAngle) * r;
        const ey = cy + Math.sin(this.naValenceAngle) * r;
        this._drawElectron(ctx, ex, ey, CYAN, pulse, true);
      }
      // After reaction: no outer electron
    } else {
      // Cl: 7 electrons (or 8 after reaction)
      const count = reacted ? 8 : 7;
      for (let i = 0; i < count; i++) {
        let angle;
        if (reacted) {
          angle = (i / 8) * Math.PI * 2 + this.time * 0.4;
        } else {
          angle = this.clValenceAngles[i];
        }
        const ex = cx + Math.cos(angle) * this.shellRadii[2] * scale;
        const ey = cy + Math.sin(angle) * this.shellRadii[2] * scale;
        this._drawElectron(ctx, ex, ey, CYAN, 3);
      }

      // Empty slot (dashed circle) when not reacted
      if (!reacted) {
        const gx = cx + Math.cos(this.clGapAngle) * this.shellRadii[2] * scale;
        const gy = cy + Math.sin(this.clGapAngle) * this.shellRadii[2] * scale;
        ctx.beginPath();
        ctx.arc(gx, gy, 5, 0, Math.PI * 2);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Shell electron count labels
    if (!reacted) {
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.textAlign = 'left';
      const labelX = cx + this.shellRadii[2] * scale + 10;
      ctx.fillText(isNa ? '2-8-1' : '2-8-7', labelX, cy + 4);
      ctx.textAlign = 'center';
    }
  }

  _drawElectron(ctx, x, y, color, radius, glow = false) {
    if (glow) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,0.15)';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  _drawTransferElectron(ctx, naX, clX, cy) {
    const p = this.transferElectron.progress;
    const ease = p * p * (3 - 2 * p);

    const startX = naX + Math.cos(0) * this.shellRadii[2];
    const startY = cy + Math.sin(0) * this.shellRadii[2];
    const endX = clX + Math.cos(this.clGapAngle) * this.shellRadii[2];
    const endY = cy + Math.sin(this.clGapAngle) * this.shellRadii[2];

    const midX = (startX + endX) / 2;
    const midY = cy - 70;
    const t = ease;

    // Quadratic bezier
    const ex = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
    const ey = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
    this.transferElectron.x = ex;
    this.transferElectron.y = ey;

    // Trail
    for (let i = 0; i < 6; i++) {
      const tt = Math.max(0, t - i * 0.035);
      const tx = (1 - tt) * (1 - tt) * startX + 2 * (1 - tt) * tt * midX + tt * tt * endX;
      const ty = (1 - tt) * (1 - tt) * startY + 2 * (1 - tt) * tt * midY + tt * tt * endY;
      ctx.beginPath();
      ctx.arc(tx, ty, 4 - i * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${0.5 - i * 0.08})`;
      ctx.fill();
    }

    // Main electron
    ctx.beginPath();
    ctx.arc(ex, ey, 5, 0, Math.PI * 2);
    ctx.fillStyle = CYAN;
    ctx.fill();
    ctx.shadowColor = CYAN;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawTransferLabels(ctx, naX, clX, cy, reacted) {
    ctx.textAlign = 'center';

    // Na label
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = GOLD;
    ctx.fillText(reacted ? 'Na⁺ (cation)' : 'Sodium (Na)', naX, cy + this.shellRadii[2] + 30);

    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    if (reacted) {
      ctx.fillText('Lost 1e⁻ → positive ion', naX, cy + this.shellRadii[2] + 48);
    } else {
      ctx.fillText('1 valence e⁻ — wants to lose it', naX, cy + this.shellRadii[2] + 48);
      ctx.fillStyle = 'rgba(255,193,7,0.6)';
      ctx.fillText('EN = 0.93 (low)', naX, cy + this.shellRadii[2] + 64);
    }

    // Cl label
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = GREEN;
    ctx.fillText(reacted ? 'Cl⁻ (anion)' : 'Chlorine (Cl)', clX, cy + this.shellRadii[2] + 30);

    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    if (reacted) {
      ctx.fillText('Gained 1e⁻ → negative ion', clX, cy + this.shellRadii[2] + 48);
    } else {
      ctx.fillText('7 valence e⁻ — wants to gain 1', clX, cy + this.shellRadii[2] + 48);
      ctx.fillStyle = 'rgba(111,191,115,0.6)';
      ctx.fillText('EN = 3.16 (high)', clX, cy + this.shellRadii[2] + 64);
    }
  }

  /* ── Lattice mode drawing ── */

  _drawLattice(ctx) {
    const rows = this.latticeRows;
    const cols = this.latticeCols;
    const spacing = 70;
    const naR = 16;
    const clR = 24;

    const gridW = (cols - 1) * spacing;
    const gridH = (rows - 1) * spacing;
    const offsetX = (this.W - gridW) / 2;
    const offsetY = (this.H - gridH) / 2 - 10;

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NaCl Crystal Lattice — every ion attracts all nearby opposite ions', this.W / 2, 22);

    // Build ion positions for neighbor highlighting
    const ions = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * spacing;
        const y = offsetY + r * spacing;
        const isNa = (r + c) % 2 === 0;
        ions.push({ r, c, x, y, isNa, radius: isNa ? naR : clR });
      }
    }

    // Determine hovered ion's nearest neighbors
    let hoveredNeighbors = new Set();
    let hoveredIdx = -1;
    if (this.hoveredIon !== null) {
      hoveredIdx = this.hoveredIon;
      const hi = ions[hoveredIdx];
      for (let i = 0; i < ions.length; i++) {
        if (i === hoveredIdx) continue;
        const dr = Math.abs(ions[i].r - hi.r);
        const dc = Math.abs(ions[i].c - hi.c);
        // Nearest neighbors: adjacent in row or column (not diagonal)
        if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
          hoveredNeighbors.add(i);
        }
      }
    }

    // Draw dashed attraction lines between opposite-charge neighbors
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1;
    for (let i = 0; i < ions.length; i++) {
      const a = ions[i];
      for (let j = i + 1; j < ions.length; j++) {
        const b = ions[j];
        if (a.isNa === b.isNa) continue; // same charge — no bond line
        const dr = Math.abs(a.r - b.r);
        const dc = Math.abs(a.c - b.c);
        if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
          const isHighlighted = hoveredIdx >= 0 &&
            ((i === hoveredIdx && hoveredNeighbors.has(j)) ||
             (j === hoveredIdx && hoveredNeighbors.has(i)));
          ctx.strokeStyle = isHighlighted
            ? 'rgba(0,212,255,0.6)'
            : 'rgba(255,255,255,0.12)';
          ctx.lineWidth = isHighlighted ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.setLineDash([]);

    // Draw ions
    const pulse = 1 + Math.sin(this.time * 1.8) * 0.04;

    for (let i = 0; i < ions.length; i++) {
      const ion = ions[i];
      const r = ion.radius * pulse;
      const isHighlighted = i === hoveredIdx || hoveredNeighbors.has(i);

      // Glow
      if (isHighlighted) {
        ctx.beginPath();
        ctx.arc(ion.x, ion.y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = ion.isNa
          ? 'rgba(100,150,255,0.12)'
          : 'rgba(255,80,80,0.12)';
        ctx.fill();
      }

      // Pulsing glow ring
      const glowAlpha = 0.08 + Math.sin(this.time * 1.8 + i * 0.5) * 0.04;
      ctx.beginPath();
      ctx.arc(ion.x, ion.y, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = ion.isNa
        ? `rgba(100,150,255,${glowAlpha})`
        : `rgba(255,80,80,${glowAlpha})`;
      ctx.fill();

      // Ion body
      const grad = ctx.createRadialGradient(
        ion.x - r * 0.2, ion.y - r * 0.2, 0,
        ion.x, ion.y, r
      );
      if (ion.isNa) {
        grad.addColorStop(0, '#ffe082');
        grad.addColorStop(1, '#c79100');
      } else {
        grad.addColorStop(0, '#a5d6a7');
        grad.addColorStop(1, '#388e3c');
      }
      ctx.beginPath();
      ctx.arc(ion.x, ion.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Charge label
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(ion.isNa ? '+' : '−', ion.x, ion.y);
    }

    ctx.textBaseline = 'alphabetic';

    // Legend
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    // Na+ legend
    const grad1 = ctx.createRadialGradient(30, this.H - 30, 0, 30, this.H - 30, 8);
    grad1.addColorStop(0, '#ffe082');
    grad1.addColorStop(1, '#c79100');
    ctx.beginPath();
    ctx.arc(30, this.H - 30, 8, 0, Math.PI * 2);
    ctx.fillStyle = grad1;
    ctx.fill();
    ctx.fillStyle = TEXT;
    ctx.fillText('Na⁺ (small, lost e⁻)', 44, this.H - 26);

    // Cl- legend
    const grad2 = ctx.createRadialGradient(30, this.H - 52, 0, 30, this.H - 52, 12);
    grad2.addColorStop(0, '#a5d6a7');
    grad2.addColorStop(1, '#388e3c');
    ctx.beginPath();
    ctx.arc(30, this.H - 52, 12, 0, Math.PI * 2);
    ctx.fillStyle = grad2;
    ctx.fill();
    ctx.fillStyle = TEXT;
    ctx.fillText('Cl⁻ (large, gained e⁻)', 48, this.H - 48);

    // Hover hint
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px monospace';
    ctx.fillText('Hover an ion to see its neighbors', this.W - 16, this.H - 12);
  }

  /* ── Mouse handling for lattice ── */

  _onMouseMove(e) {
    if (this.mode !== 'lattice') { this.hoveredIon = null; return; }

    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.W / rect.width);
    const my = (e.clientY - rect.top) * (this.H / rect.height);

    const spacing = 70;
    const gridW = (this.latticeCols - 1) * spacing;
    const gridH = (this.latticeRows - 1) * spacing;
    const offsetX = (this.W - gridW) / 2;
    const offsetY = (this.H - gridH) / 2 - 10;

    let closest = -1;
    let closestDist = Infinity;

    for (let r = 0; r < this.latticeRows; r++) {
      for (let c = 0; c < this.latticeCols; c++) {
        const x = offsetX + c * spacing;
        const y = offsetY + r * spacing;
        const d = Math.hypot(mx - x, my - y);
        if (d < closestDist) {
          closestDist = d;
          closest = r * this.latticeCols + c;
        }
      }
    }

    this.hoveredIon = closestDist < 35 ? closest : null;
  }

  /* ── Animation loop ── */

  _animate(prevTime) {
    if (!this.running) return;
    const now = performance.now() / 1000;
    const dt = prevTime ? Math.min(now - prevTime, 0.05) : 0.016;
    this._update(dt);
    this._draw();
    requestAnimationFrame(() => this._animate(now));
  }
}

registerSim('ionicBondViz', (canvas, opts) => new IonicBondViz(canvas, opts));
