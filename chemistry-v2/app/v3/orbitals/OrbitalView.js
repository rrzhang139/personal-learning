/**
 * OrbitalView: visualizes electron orbitals for any element.
 *
 * ALL orbitals are centered on the nucleus:
 * - s: concentric spheres (circles), bigger for higher n
 * - p: dumbbells through the nucleus (px, py, pz), bigger for higher n
 * - d: cloverleafs through the nucleus, bigger for higher n
 * - f: multi-lobe through the nucleus, bigger for higher n
 *
 * Shell rings are energy-level indicators only, not orbital positions.
 *
 * Can run standalone (own RAF loop) or be rendered by an external loop.
 */
import { ElectronConfig } from './ElectronConfig.js';
import { drawS, drawP, drawPz, drawDCloverleaf, drawDz2, drawF } from './OrbitalShape.js';

const BG = '#0a0a1a';
const WHITE = '#fff';
const GREY = '#888';
const DIM = '#333';
const COLORS = ElectronConfig.SUBSHELL_COLORS;

// Orbital sizes scale with n
function orbitalSize(n, type) {
  const base = { s: 30, p: 40, d: 35, f: 30 };
  return (base[type] || 30) + n * 18;
}

// P orbital orientations: px=0°, py=90°, pz=into screen
const P_ORIENTATIONS = [0, Math.PI / 2, null];
// D orbital orientations
const D_ORIENTATIONS = [Math.PI / 4, 0, Math.PI / 6, Math.PI / 3, 'dz2'];

// Element symbols by Z (for display)
const SYMBOLS = {1:'H',2:'He',3:'Li',5:'B',6:'C',7:'N',8:'O',9:'F',10:'Ne',11:'Na',12:'Mg',15:'P',16:'S',17:'Cl',19:'K',20:'Ca',26:'Fe',29:'Cu',35:'Br',53:'I'};

export class OrbitalView {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width || 900;
    this.H = canvas.height || 500;
    this.cx = this.W / 2;
    this.cy = this.H / 2;
    this.running = false;

    this.Z = opts.Z || 8;
    this.config = [];
    this.shells = new Map();

    this.filters = { s: true, p: true, d: true, f: true };
    this.showLabels = true;
    this.showElectronDots = true;

    this._time = 0;
    this._lastTime = 0;

    this._filterButtons = [
      { type: 's', x: 20, y: this.H - 45, w: 50, h: 30, color: COLORS.s },
      { type: 'p', x: 80, y: this.H - 45, w: 50, h: 30, color: COLORS.p },
      { type: 'd', x: 140, y: this.H - 45, w: 50, h: 30, color: COLORS.d },
      { type: 'f', x: 200, y: this.H - 45, w: 50, h: 30, color: COLORS.f },
    ];

    this._onClick = this._handleClick.bind(this);
    this.canvas.addEventListener('click', this._onClick);

    this.setElement(this.Z);
  }

  setElement(Z) {
    this.Z = Z;
    this.config = ElectronConfig.build(Z);
    this.shells = ElectronConfig.byShell(Z);
  }

  toggleFilter(type) { this.filters[type] = !this.filters[type]; }

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

  _shellRadius(n) { return 40 + n * 55; }

  _loop() {
    if (!this.running) return;
    const now = performance.now() / 1000;
    this._time += now - this._lastTime;
    this._lastTime = now;
    this._render();
    requestAnimationFrame(() => this._loop());
  }

  /**
   * Public render method — can be called externally (e.g., from Stage overlay)
   * instead of using the internal loop.
   */
  renderFrame(ctx, time) {
    this._time = time;
    const savedCtx = this.ctx;
    this.ctx = ctx;
    this._render();
    this.ctx = savedCtx;
  }

  _render() {
    const ctx = this.ctx;
    const t = this._time;

    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    // Shell rings (energy level indicators — dashed circles)
    for (const [n] of this.shells) {
      const r = this._shellRadius(n);
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Shell label
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`n=${n}`, this.cx - r - 8, this.cy + 4);
    }

    // Draw all orbitals CENTERED ON THE NUCLEUS
    // Render order: f (back) → d → p → s (front) for nice layering
    const renderOrder = ['f', 'd', 'p', 's'];
    for (const type of renderOrder) {
      for (const sub of this.config) {
        if (sub.type !== type) continue;
        if (!this.filters[type]) continue;
        this._drawSubshellCentered(ctx, sub, t);
      }
    }

    // Nucleus
    ctx.fillStyle = '#0d1b2a';
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Element symbol
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(SYMBOLS[this.Z] || `${this.Z}`, this.cx, this.cy);

    // Notation at top
    ctx.fillStyle = GREY;
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ElectronConfig.notation(this.Z), this.W / 2, 25);

    // Z indicator
    ctx.fillStyle = DIM;
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Z = ${this.Z}`, this.W - 20, 25);

    // Filter buttons
    this._drawFilterButtons(ctx);

    // Legend
    this._drawLegend(ctx);
  }

  /**
   * Draw a subshell's orbitals ALL CENTERED on the nucleus.
   * Size scales with n so higher shells' orbitals are bigger.
   */
  _drawSubshellCentered(ctx, sub, time) {
    const { n, type, label, orbitals, electrons } = sub;
    const color = COLORS[type];
    const size = orbitalSize(n, type);

    // Alpha based on electron fill
    const maxE = ElectronConfig.MAX_ELECTRONS[type];
    const fillRatio = electrons / maxE;
    const baseAlpha = 0.15 + fillRatio * 0.55;

    for (let i = 0; i < orbitals.length; i++) {
      const orb = orbitals[i];
      const eCount = (orb.spinUp ? 1 : 0) + (orb.spinDown ? 1 : 0);
      const orbAlpha = eCount === 0 ? baseAlpha * 0.15 : baseAlpha * (0.4 + eCount * 0.3);

      switch (type) {
        case 's':
          drawS(ctx, this.cx, this.cy, size, color, orbAlpha);
          break;
        case 'p':
          if (P_ORIENTATIONS[i] !== null) {
            drawP(ctx, this.cx, this.cy, size, P_ORIENTATIONS[i], color, orbAlpha);
          } else {
            drawPz(ctx, this.cx, this.cy, size * 0.5, color, orbAlpha);
          }
          break;
        case 'd':
          if (D_ORIENTATIONS[i] === 'dz2') {
            drawDz2(ctx, this.cx, this.cy, size, color, orbAlpha);
          } else if (D_ORIENTATIONS[i] !== null) {
            drawDCloverleaf(ctx, this.cx, this.cy, size, D_ORIENTATIONS[i], color, orbAlpha);
          } else {
            drawP(ctx, this.cx, this.cy, size * 0.7, i * Math.PI / 5, color, orbAlpha);
          }
          break;
        case 'f':
          drawF(ctx, this.cx, this.cy, size, i, color, orbAlpha);
          break;
      }

      // Electron dots within the orbital
      if (this.showElectronDots && eCount > 0) {
        this._drawOrbitalElectrons(ctx, orb, type, i, size, time);
      }
    }

    // Subshell label along shell ring
    if (this.showLabels) {
      const shellR = this._shellRadius(n);
      // Place label at a unique angle per subshell type
      const typeOffset = { s: -Math.PI / 2, p: -Math.PI / 4, d: 0, f: Math.PI / 4 };
      const angle = (typeOffset[type] || 0);
      const lx = this.cx + Math.cos(angle) * (shellR + 18);
      const ly = this.cy + Math.sin(angle) * (shellR + 18);
      const sup = {0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹',10:'¹⁰',11:'¹¹',12:'¹²',13:'¹³',14:'¹⁴'};
      ctx.fillStyle = color;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${label}${sup[electrons] || electrons}`, lx, ly);
    }
  }

  _drawOrbitalElectrons(ctx, orbital, type, orbIndex, size, time) {
    const drawDot = (phase, offsetAngle) => {
      const t = time * 1.2 + phase;
      let ex, ey;

      if (type === 's') {
        // Wander inside sphere
        const r = size * 0.5;
        ex = this.cx + Math.cos(t * 1.1 + offsetAngle) * r * 0.6;
        ey = this.cy + Math.sin(t * 0.9 + offsetAngle) * r * 0.6;
      } else if (type === 'p') {
        // Wander along dumbbell axis
        const angle = P_ORIENTATIONS[orbIndex] ?? 0;
        const along = Math.sin(t * 0.8) * size * 0.6;
        const perp = Math.sin(t * 1.5 + offsetAngle) * size * 0.12;
        ex = this.cx + Math.cos(angle) * along - Math.sin(angle) * perp;
        ey = this.cy + Math.sin(angle) * along + Math.cos(angle) * perp;
      } else {
        // General: wander in area
        const r = size * 0.4;
        ex = this.cx + Math.cos(t * 0.9 + offsetAngle * 3) * r;
        ey = this.cy + Math.sin(t * 0.7 + offsetAngle * 2) * r;
      }

      ctx.shadowColor = '#fdd835';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#fdd835';
      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    if (orbital.spinUp) drawDot(0, 0);
    if (orbital.spinDown) drawDot(2.5, Math.PI);
  }

  _drawFilterButtons(ctx) {
    ctx.fillStyle = GREY;
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Filter:', 20, this.H - 58);

    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const btn of this._filterButtons) {
      const on = this.filters[btn.type];
      ctx.fillStyle = on ? '#1a2a1a' : '#111';
      ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
      ctx.strokeStyle = on ? btn.color : DIM;
      ctx.lineWidth = on ? 2.5 : 1;
      ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
      ctx.fillStyle = on ? btn.color : '#555';
      ctx.fillText(btn.type, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
  }

  _drawLegend(ctx) {
    const x = this.W - 130;
    let y = this.H - 90;
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';

    for (const [type, color] of Object.entries(COLORS)) {
      const shape = { s: '● sphere', p: '⌇ dumbbell', d: '✦ cloverleaf', f: '✿ multi-lobe' };
      ctx.fillStyle = this.filters[type] ? color : '#444';
      ctx.fillText(`${type}: ${shape[type]}`, x, y);
      y += 14;
    }
  }
}
