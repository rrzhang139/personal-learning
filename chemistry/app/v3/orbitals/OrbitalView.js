/**
 * OrbitalView: self-contained orbital visualization.
 *
 * Renders shells, subshells, and orbital shapes for any element Z.
 * Has its own filter toggles (s/p/d/f), drawn on canvas.
 * Completely isolated — does NOT import Atom, Bond, Molecule, etc.
 *
 * Usage:
 *   const view = new OrbitalView(canvas, { Z: 8 });
 *   view.start();
 *   // To change element: view.setElement(26);
 *   // To filter: view.toggleFilter('p');
 */
import { ElectronConfig } from './ElectronConfig.js';
import { drawS, drawP, drawPz, drawDCloverleaf, drawDz2, drawF } from './OrbitalShape.js';

const BG = '#0a0a1a';
const WHITE = '#fff';
const GREY = '#888';
const DIM = '#333';
const COLORS = ElectronConfig.SUBSHELL_COLORS;

// P orbital orientations (2D projected angles)
const P_ANGLES = [0, Math.PI / 2, null]; // px=horizontal, py=vertical, pz=into screen
// D orbital base angles
const D_ANGLES = [Math.PI / 4, 0, null, null, 'dz2']; // dxy, dx2-y2, dxz, dyz, dz2

export class OrbitalView {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ Z: number }} opts
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.cx = this.W / 2;
    this.cy = this.H / 2;
    this.running = false;

    this.Z = opts.Z || 8;
    this.config = [];
    this.shells = new Map();

    // Filter: which subshell types are visible
    this.filters = { s: true, p: true, d: true, f: true };

    // Render mode
    this.showLabels = true;
    this.showElectronDots = true;

    // Animation
    this._time = 0;
    this._lastTime = 0;

    // Filter buttons (rendered on canvas)
    this._filterButtons = [
      { type: 's', x: 20, y: this.H - 45, w: 50, h: 30, color: COLORS.s },
      { type: 'p', x: 80, y: this.H - 45, w: 50, h: 30, color: COLORS.p },
      { type: 'd', x: 140, y: this.H - 45, w: 50, h: 30, color: COLORS.d },
      { type: 'f', x: 200, y: this.H - 45, w: 50, h: 30, color: COLORS.f },
    ];

    // Click handler
    this._onClick = this._handleClick.bind(this);
    this.canvas.addEventListener('click', this._onClick);

    this.setElement(this.Z);
  }

  setElement(Z) {
    this.Z = Z;
    this.config = ElectronConfig.build(Z);
    this.shells = ElectronConfig.byShell(Z);
  }

  toggleFilter(type) {
    this.filters[type] = !this.filters[type];
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._lastTime = performance.now() / 1000;
    this._loop();
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
  }

  _handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * this.W;
    const my = ((e.clientY - rect.top) / rect.height) * this.H;

    for (const btn of this._filterButtons) {
      if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
        this.toggleFilter(btn.type);
        return;
      }
    }
  }

  _shellRadius(n) {
    return 45 + n * 55;
  }

  _loop() {
    if (!this.running) return;
    const now = performance.now() / 1000;
    this._time += now - this._lastTime;
    this._lastTime = now;

    this._render();
    requestAnimationFrame(() => this._loop());
  }

  _render() {
    const ctx = this.ctx;
    const t = this._time;

    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    // Nucleus
    ctx.fillStyle = '#1a2a3a';
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Element symbol
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Look up symbol from Z — we only have the Z, derive symbol from config
    const symbols = { 1:'H',2:'He',5:'B',6:'C',7:'N',8:'O',9:'F',10:'Ne',11:'Na',15:'P',16:'S',17:'Cl',26:'Fe' };
    ctx.fillText(symbols[this.Z] || `Z=${this.Z}`, this.cx, this.cy);

    // Draw each shell
    for (const [n, subshells] of this.shells) {
      const shellR = this._shellRadius(n);

      // Shell ring
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, shellR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Shell label
      if (this.showLabels) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`n=${n}`, this.cx - shellR - 25, this.cy - 3);
      }

      // Draw subshells
      let subAngleOffset = -Math.PI / 2; // start from top
      for (const sub of subshells) {
        this._drawSubshell(ctx, sub, shellR, subAngleOffset, t);
        subAngleOffset += Math.PI / (subshells.length + 0.5);
      }
    }

    // Notation string at top
    ctx.fillStyle = GREY;
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ElectronConfig.notation(this.Z), this.W / 2, 25);

    // Filter buttons
    this._drawFilterButtons(ctx);

    // Element info
    ctx.fillStyle = DIM;
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Z = ${this.Z}`, this.W - 20, 25);
  }

  _drawSubshell(ctx, sub, shellR, baseAngle, time) {
    const { type, label, orbitals } = sub;
    const color = COLORS[type] || '#fff';
    const visible = this.filters[type];
    const alpha = visible ? 0.7 : 0.06;

    const orbCount = orbitals.length;

    // Place orbitals along the shell at this subshell's angular position
    for (let i = 0; i < orbCount; i++) {
      const orb = orbitals[i];
      const electronCount = (orb.spinUp ? 1 : 0) + (orb.spinDown ? 1 : 0);
      const orbAlpha = alpha * (electronCount === 0 ? 0.2 : electronCount === 1 ? 0.6 : 1.0);

      // Position: spread orbitals of this subshell along the shell arc
      const spread = type === 's' ? 0 : (Math.PI * 0.3);
      const orbAngle = baseAngle + (i - (orbCount - 1) / 2) * (spread / Math.max(orbCount - 1, 1));
      const ox = this.cx + Math.cos(orbAngle) * shellR;
      const oy = this.cy + Math.sin(orbAngle) * shellR;

      // Draw the orbital shape
      const size = 20 + sub.n * 6;

      switch (type) {
        case 's':
          drawS(ctx, this.cx, this.cy, shellR * 0.3 + sub.n * 8, color, orbAlpha * 0.4);
          break;
        case 'p':
          if (P_ANGLES[i] !== null) {
            drawP(ctx, ox, oy, size, P_ANGLES[i], color, orbAlpha);
          } else {
            drawPz(ctx, ox, oy, size * 0.5, color, orbAlpha);
          }
          break;
        case 'd':
          if (D_ANGLES[i] === 'dz2') {
            drawDz2(ctx, ox, oy, size, color, orbAlpha);
          } else if (D_ANGLES[i] !== null) {
            drawDCloverleaf(ctx, ox, oy, size, D_ANGLES[i], color, orbAlpha);
          } else {
            // dxz, dyz — show as p-like with foreshortened component
            drawP(ctx, ox, oy, size * 0.7, i * Math.PI / 5, color, orbAlpha);
            drawPz(ctx, ox, oy, size * 0.3, color, orbAlpha * 0.5);
          }
          break;
        case 'f':
          drawF(ctx, ox, oy, size, i, color, orbAlpha);
          break;
      }

      // Electron dots inside the orbital
      if (this.showElectronDots && visible) {
        this._drawElectronDots(ctx, ox, oy, orb, type, size, time);
      }
    }

    // Subshell label
    if (this.showLabels && visible) {
      const labelAngle = baseAngle;
      const lx = this.cx + Math.cos(labelAngle) * (shellR + 25);
      const ly = this.cy + Math.sin(labelAngle) * (shellR + 25);
      ctx.fillStyle = color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const sup = { 0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹',10:'¹⁰' };
      ctx.fillText(`${label}${sup[sub.electrons] || sub.electrons}`, lx, ly);
    }
  }

  _drawElectronDots(ctx, cx, cy, orbital, type, size, time) {
    const drawDot = (offsetAngle, phase) => {
      const r = size * 0.4;
      const t = time * 1.5 + phase;
      const x = cx + Math.cos(t + offsetAngle) * r * 0.6;
      const y = cy + Math.sin(t * 0.8 + offsetAngle) * r * 0.6;
      ctx.shadowColor = '#fdd835';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#fdd835';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    if (orbital.spinUp) drawDot(0, 0);
    if (orbital.spinDown) drawDot(Math.PI, 2.5);
  }

  _drawFilterButtons(ctx) {
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const btn of this._filterButtons) {
      const on = this.filters[btn.type];
      ctx.fillStyle = on ? btn.color + '33' : '#111';
      ctx.strokeStyle = on ? btn.color : DIM;
      ctx.lineWidth = on ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = on ? btn.color : DIM;
      ctx.fillText(btn.type, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }

    // Label
    ctx.fillStyle = GREY;
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Filter subshells:', 20, this.H - 55);
  }
}
