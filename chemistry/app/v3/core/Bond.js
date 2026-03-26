/**
 * Visual bond between two Atoms. Renders 1–3 lines.
 * Auto-updates position when atoms move (references, not copies).
 */
import { Renderable } from '../canvas/Renderable.js';

const SINGLE_COLOR = '#00d4ff';
const DOUBLE_COLOR = '#ff9800';
const TRIPLE_COLOR = '#ef5350';
const DASHED_COLOR = '#bb86fc';

export class Bond extends Renderable {
  /**
   * @param {import('./Atom.js').Atom} atomA
   * @param {import('./Atom.js').Atom} atomB
   * @param {number} order - 1, 1.5, 2, or 3
   */
  constructor(atomA, atomB, order = 1) {
    super();
    this.atomA = atomA;
    this.atomB = atomB;
    this.order = order;
    this.style = order === 1.5 ? 'dashed' : 'solid';

    // Register with atoms
    if (!atomA.bonds.includes(this)) atomA.bonds.push(this);
    if (!atomB.bonds.includes(this)) atomB.bonds.push(this);
  }

  /** Change bond order and update style */
  setOrder(n) {
    this.order = n;
    this.style = n === 1.5 ? 'dashed' : 'solid';
  }

  get color() {
    if (this.style === 'dashed') return DASHED_COLOR;
    if (this.order >= 3) return TRIPLE_COLOR;
    if (this.order >= 2) return DOUBLE_COLOR;
    return SINGLE_COLOR;
  }

  /** Bonds position between their atoms — center for hit testing */
  get x() { return (this.atomA.x + this.atomB.x) / 2; }
  get y() { return (this.atomA.y + this.atomB.y) / 2; }

  hitTest() { return false; } // bonds are not directly interactive (yet)

  render(ctx) {
    const a = this.atomA;
    const b = this.atomB;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const ux = dx / dist;
    const uy = dy / dist;
    const nx = -uy;
    const ny = ux;

    // Shorten to not overlap atom circles
    const rA = a.r + 2;
    const rB = b.r + 2;
    const x1 = a.x + ux * rA;
    const y1 = a.y + uy * rA;
    const x2 = b.x - ux * rB;
    const y2 = b.y - uy * rB;

    const drawOrder = Math.ceil(this.order);
    const gap = drawOrder === 1 ? 0 : 7;

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;

    if (this.style === 'dashed') {
      ctx.setLineDash([6, 4]);
    }

    for (let i = 0; i < drawOrder; i++) {
      const off = (i - (drawOrder - 1) / 2) * gap * 2;
      ctx.beginPath();
      ctx.moveTo(x1 + nx * off, y1 + ny * off);
      ctx.lineTo(x2 + nx * off, y2 + ny * off);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Bond order label for fractional bonds
    if (this.order !== Math.floor(this.order)) {
      ctx.fillStyle = DASHED_COLOR;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.order.toString(), this.x, this.y - 18);
    }
  }

  /**
   * Remove this bond from its atoms' bond lists.
   */
  destroy() {
    this.atomA.bonds = this.atomA.bonds.filter(b => b !== this);
    this.atomB.bonds = this.atomB.bonds.filter(b => b !== this);
  }
}
