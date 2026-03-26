/**
 * Visual bond between two Atoms. Renders 1–3 lines.
 * Auto-updates when atoms move (holds references to atoms).
 */
import { Renderable } from '../canvas/Renderable.js';

const SINGLE_COLOR = '#00d4ff';
const DOUBLE_COLOR = '#ff9800';
const TRIPLE_COLOR = '#ef5350';
const DASHED_COLOR = '#bb86fc';

export class Bond extends Renderable {
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

  /** Midpoint between atoms. */
  get midX() { return (this.atomA.x + this.atomB.x) / 2; }
  get midY() { return (this.atomA.y + this.atomB.y) / 2; }

  hitTest() { return false; }

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

    if (this.style === 'dashed') ctx.setLineDash([6, 4]);

    for (let i = 0; i < drawOrder; i++) {
      const off = (i - (drawOrder - 1) / 2) * gap * 2;
      ctx.beginPath();
      ctx.moveTo(x1 + nx * off, y1 + ny * off);
      ctx.lineTo(x2 + nx * off, y2 + ny * off);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Fractional bond order label
    if (this.order !== Math.floor(this.order)) {
      ctx.fillStyle = DASHED_COLOR;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.order.toString(), this.midX, this.midY - 18);
    }
  }

  destroy() {
    this.atomA.bonds = this.atomA.bonds.filter(b => b !== this);
    this.atomB.bonds = this.atomB.bonds.filter(b => b !== this);
  }
}
