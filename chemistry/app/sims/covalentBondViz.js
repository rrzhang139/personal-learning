import { registerSim } from './registry.js';

const TAU = Math.PI * 2;
const BG = '#0a0a1a';
const ELECTRON_COLOR = '#00d4ff';
const ELECTRON_GLOW = 'rgba(0,212,255,0.25)';

// Atom color palette
const ATOM_COLORS = {
  H:  { fill: '#e8e8e8', stroke: '#aaaaaa', label: 'H',  en: 2.20 },
  Cl: { fill: '#44dd44', stroke: '#22aa22', label: 'Cl', en: 3.16 },
  O:  { fill: '#ff4444', stroke: '#cc2222', label: 'O',  en: 3.44 },
};

export class CovalentBondViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width  || 900;
    this.H = canvas.height || 500;
    this.running = true;
    this.time = 0;
    this.mode = opts.mode || 'sharing';
    this._animate();
  }

  /* ---- public API ---- */

  setMode(mode) {
    if (['sharing', 'polar', 'double'].includes(mode)) {
      this.mode = mode;
      this.time = 0;          // reset animation on mode switch
    }
  }

  stop() { this.running = false; }

  /* ---- animation loop ---- */

  _animate() {
    if (!this.running) return;
    this.time += 0.012;       // ~0.72 per second at 60fps
    this._draw();
    requestAnimationFrame(() => this._animate());
  }

  /* ---- drawing dispatch ---- */

  _draw() {
    const ctx = this.ctx;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    if (this.mode === 'sharing') this._drawSharing(ctx);
    else if (this.mode === 'polar') this._drawPolar(ctx);
    else if (this.mode === 'double') this._drawDouble(ctx);

    this._drawModeIndicator(ctx);
  }

  /* ===========================================================
   *  MODE: sharing  (H—H single covalent bond)
   * =========================================================== */

  _drawSharing(ctx) {
    const cx = this.W / 2, cy = this.H / 2 - 20;
    const t = this.time;

    // Atoms breathe in toward each other over time, then hold
    const approachProgress = Math.min(1, t / 3);           // 0→1 over 3s
    const ease = 1 - Math.pow(1 - approachProgress, 3);    // ease-out cubic
    const maxSep = 160, minSep = 62;
    const sep = maxSep - (maxSep - minSep) * ease;         // half-distance
    const atomR = 38;

    const lx = cx - sep, rx = cx + sep;

    // Overlap glow (visible once atoms are close)
    if (sep < 110) {
      const overlapAlpha = Math.min(0.25, (110 - sep) / 200);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      grad.addColorStop(0, `rgba(0,212,255,${overlapAlpha})`);
      grad.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 80, cy - 80, 160, 160);
    }

    // Draw atoms (H left, H right)
    this._drawAtom(ctx, lx, cy, atomR, ATOM_COLORS.H);
    this._drawAtom(ctx, rx, cy, atomR, ATOM_COLORS.H);

    // Draw electron shells (faint rings)
    this._drawShell(ctx, lx, cy, atomR + 18);
    this._drawShell(ctx, rx, cy, atomR + 18);

    // Non-bonding electron dots — each H has 1 electron initially
    // Before bonding: show each alone; after bonding: shared pair in the middle
    if (approachProgress < 0.5) {
      // Each H has its own lonely electron orbiting
      const eAngle = t * 2.5;
      this._drawElectron(ctx, lx + Math.cos(eAngle) * (atomR + 12),
                               cy + Math.sin(eAngle) * (atomR + 12));
      this._drawElectron(ctx, rx + Math.cos(eAngle + Math.PI) * (atomR + 12),
                               cy + Math.sin(eAngle + Math.PI) * (atomR + 12));
    } else {
      // Shared pair — figure-8 / lemniscate between the two nuclei
      const a = sep * 0.85;   // half-width of figure-8
      for (let i = 0; i < 2; i++) {
        const phase = i * Math.PI;        // two electrons offset by π
        const angle = t * 2.0 + phase;
        const { x, y } = this._lemniscate(angle, a, 22);
        this._drawElectron(ctx, cx + x, cy + y);
      }
    }

    // Labels
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('H — H : Shared electron pair = covalent bond', cx, cy + 100);

    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#aaccdd';
    ctx.fillText('Each H started with 1 electron. By sharing, both "feel" 2 → full shell (like He).', cx, cy + 125);

    // Electron count annotations
    if (approachProgress >= 0.5) {
      ctx.font = '12px monospace';
      ctx.fillStyle = ELECTRON_COLOR;
      ctx.fillText('1e⁻ + 1e⁻ shared', cx, cy - 75);
      ctx.fillText('= 2e⁻ around each atom', cx, cy - 58);
    }
  }

  /* ===========================================================
   *  MODE: polar  (H—Cl polar covalent bond)
   * =========================================================== */

  _drawPolar(ctx) {
    const cx = this.W / 2, cy = this.H / 2 - 20;
    const t = this.time;

    const atomH_R = 30;
    const atomCl_R = 48;
    const sep = 72;    // half-distance from center (offset for size diff)
    const hx = cx - sep - 10, clx = cx + sep - 10;

    // Electron density cloud — denser toward Cl
    this._drawDensityCloud(ctx, hx, clx, cy, 0.65);   // bias 0→1, 0.65 = toward Cl

    // Draw atoms
    this._drawAtom(ctx, hx, cy, atomH_R, ATOM_COLORS.H);
    this._drawAtom(ctx, clx, cy, atomCl_R, ATOM_COLORS.Cl);

    // Shells
    this._drawShell(ctx, hx, cy, atomH_R + 16);
    this._drawShell(ctx, clx, cy, atomCl_R + 22);

    // Cl lone pairs (3 lone pairs around Cl, not shared)
    const lpR = atomCl_R + 16;
    const lpAngles = [-Math.PI * 0.35, Math.PI * 0.35, 0];
    for (const base of lpAngles) {
      const a1 = base + Math.PI * 0.5;   // oriented away from bond
      for (let d = -4; d <= 4; d += 8) {
        this._drawElectron(ctx,
          clx + Math.cos(a1) * lpR + Math.cos(a1 + Math.PI / 2) * d,
          cy  + Math.sin(a1) * lpR + Math.sin(a1 + Math.PI / 2) * d, 2.5);
      }
    }

    // Shared electrons — skewed lemniscate (spend more time near Cl)
    const bondMidX = (hx + clx) / 2 + 18;   // shifted toward Cl
    const halfW = (clx - hx) * 0.4;
    for (let i = 0; i < 2; i++) {
      const phase = i * Math.PI;
      const angle = t * 1.8 + phase;
      // Bias: electrons move slower near Cl (spend more time)
      const biasAngle = angle + 0.35 * Math.sin(angle);
      const { x, y } = this._lemniscate(biasAngle, halfW, 18);
      this._drawElectron(ctx, bondMidX + x, cy + y);
    }

    // Partial charges
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6666';
    ctx.fillText('δ+', hx, cy - atomH_R - 14);
    ctx.fillStyle = '#66aaff';
    ctx.fillText('δ−', clx, cy - atomCl_R - 14);

    // Dipole arrow
    this._drawDipoleArrow(ctx, hx + 12, cy + atomH_R + 28, clx - 12, cy + atomCl_R + 28);

    // Labels
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('H — Cl : Electrons pulled toward Cl (EN = 3.16 vs 2.20)', cx, cy + 110);

    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#aaccdd';
    ctx.fillText('Polar covalent bond: unequal sharing creates partial charges (dipole).', cx, cy + 135);
  }

  /* ===========================================================
   *  MODE: double  (O=O double bond)
   * =========================================================== */

  _drawDouble(ctx) {
    const cx = this.W / 2, cy = this.H / 2 - 20;
    const t = this.time;

    const atomR = 42;
    const sep = 68;
    const lx = cx - sep, rx = cx + sep;

    // Overlap glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
    grad.addColorStop(0, 'rgba(0,212,255,0.18)');
    grad.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - 90, cy - 90, 180, 180);

    // Draw atoms
    this._drawAtom(ctx, lx, cy, atomR, ATOM_COLORS.O);
    this._drawAtom(ctx, rx, cy, atomR, ATOM_COLORS.O);

    // Shells
    this._drawShell(ctx, lx, cy, atomR + 20);
    this._drawShell(ctx, rx, cy, atomR + 20);

    // Lone pairs on each O (2 lone pairs each, above/below far side)
    for (const ax of [lx, rx]) {
      const dir = ax < cx ? -1 : 1;
      for (const yOff of [-18, 18]) {
        for (let d = -4; d <= 4; d += 8) {
          this._drawElectron(ctx,
            ax + dir * (atomR + 14) + d,
            cy + yOff, 2.5);
        }
      }
    }

    // Sigma bond — figure-8 along axis
    const sigmaA = sep * 0.7;
    for (let i = 0; i < 2; i++) {
      const phase = i * Math.PI;
      const angle = t * 2.0 + phase;
      const { x, y } = this._lemniscate(angle, sigmaA, 14);
      this._drawElectron(ctx, cx + x, cy + y);
    }

    // Pi bond — figure-8 perpendicular, shifted above/below axis
    const piA = sep * 0.55;
    for (let i = 0; i < 2; i++) {
      const phase = i * Math.PI;
      const angle = t * 2.0 + phase + Math.PI / 2;
      const { x, y } = this._lemniscate(angle, piA, 10);
      // Pi bond electrons oscillate above and below the axis
      const piY = cy + y + Math.sin(angle) * 22;
      this._drawElectron(ctx, cx + x, piY, 3.5, '#ff66ff');
    }

    // Bond line indicators (σ and π labels)
    ctx.font = '12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = ELECTRON_COLOR;
    ctx.fillText('σ bond', cx, cy - 3);
    ctx.fillStyle = '#ff66ff';
    ctx.fillText('π bond', cx, cy + 50);

    // Labels
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('O = O : Double bond — 2 shared pairs (4 electrons)', cx, cy + 110);

    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#aaccdd';
    ctx.fillText('σ (sigma): head-on overlap along the axis  |  π (pi): side-by-side overlap above & below', cx, cy + 135);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#ffaaaa';
    ctx.fillText('Each O needs 2e⁻ → shares 2 pairs → both complete their octet', cx, cy + 160);
  }

  /* ===========================================================
   *  Shared drawing helpers
   * =========================================================== */

  /** Lemniscate of Bernoulli: figure-8 parametric curve */
  _lemniscate(angle, a, b) {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const denom = 1 + s * s;
    return {
      x: a * c / denom,
      y: b * s * c / denom,
    };
  }

  _drawAtom(ctx, x, y, r, color) {
    // Outer glow
    const glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 1.3);
    glow.addColorStop(0, color.fill);
    glow.addColorStop(0.7, color.fill + '44');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.3, 0, TAU);
    ctx.fill();

    // Solid core
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = color.fill;
    ctx.fill();
    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(r * 0.7)}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(color.label, x, y + 1);
    ctx.textBaseline = 'alphabetic';
  }

  _drawShell(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.strokeStyle = 'rgba(100,180,220,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _drawElectron(ctx, x, y, r = 3.5, color = ELECTRON_COLOR) {
    // Glow
    ctx.beginPath();
    ctx.arc(x, y, r + 5, 0, TAU);
    ctx.fillStyle = color === ELECTRON_COLOR ? ELECTRON_GLOW : color + '40';
    ctx.fill();
    // Dot
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
  }

  _drawDipoleArrow(ctx, x1, y1, x2, y2) {
    const headLen = 10;
    const dx = x2 - x1, dy = y2 - y1;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = '#ffcc44';
    ctx.fill();

    // "+" crossbar on the tail end (dipole convention)
    const cx = x1, cy2 = y1;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy2);
    ctx.lineTo(cx + 5, cy2);
    ctx.moveTo(cx, cy2 - 5);
    ctx.lineTo(cx, cy2 + 5);
    ctx.strokeStyle = '#ffcc44';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /** Asymmetric electron density cloud for polar bonds */
  _drawDensityCloud(ctx, hx, clx, cy, bias) {
    // bias 0.5 = symmetric, >0.5 = toward clx
    const midX = hx + (clx - hx) * bias;
    const spread = (clx - hx) * 0.7;
    const grad = ctx.createRadialGradient(midX, cy, 5, midX, cy, spread);
    grad.addColorStop(0, 'rgba(0,212,255,0.12)');
    grad.addColorStop(0.5, 'rgba(0,212,255,0.05)');
    grad.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(hx - 60, cy - 80, (clx - hx) + 120, 160);
  }

  /** Small mode indicator in top-left */
  _drawModeIndicator(ctx) {
    const modes = ['sharing', 'polar', 'double'];
    const labels = ['H—H Single', 'H—Cl Polar', 'O=O Double'];
    ctx.font = '12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i < modes.length; i++) {
      const active = modes[i] === this.mode;
      ctx.fillStyle = active ? '#00d4ff' : '#445566';
      ctx.fillText((active ? '● ' : '○ ') + labels[i], 16, 24 + i * 20);
    }
  }
}

registerSim('covalentBondViz', (canvas, opts) => new CovalentBondViz(canvas, opts));
