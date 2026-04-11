/**
 * Visual bond between two Atoms.
 *
 * Renders:
 * - The bond line(s) (single/double/triple)
 * - A merged electron cloud between the atoms, asymmetric by EN
 */
import { Renderable } from '../canvas/Renderable.js';

const SINGLE_COLOR = '#00d4ff';
const DOUBLE_COLOR = '#ff9800';
const TRIPLE_COLOR = '#ef5350';
const DASHED_COLOR = '#bb86fc';
const CLOUD_COLOR = { r: 255, g: 200, b: 100 }; // warm shared-electron cloud

export class Bond extends Renderable {
  constructor(atomA, atomB, order = 1) {
    super();
    this.atomA = atomA;
    this.atomB = atomB;
    this.order = order;
    this.style = order === 1.5 ? 'dashed' : 'solid';
    this.showCloud = true;

    // Register with atoms
    if (!atomA.bonds.includes(this)) atomA.bonds.push(this);
    if (!atomB.bonds.includes(this)) atomB.bonds.push(this);

    // Assign electron states on both atoms
    atomA.assignElectronStates();
    atomB.assignElectronStates();
  }

  setOrder(n) {
    this.order = n;
    this.style = n === 1.5 ? 'dashed' : 'solid';
    this.atomA.assignElectronStates();
    this.atomB.assignElectronStates();
  }

  get color() {
    if (this.style === 'dashed') return DASHED_COLOR;
    if (this.order >= 3) return TRIPLE_COLOR;
    if (this.order >= 2) return DOUBLE_COLOR;
    return SINGLE_COLOR;
  }

  get midX() { return (this.atomA.x + this.atomB.x) / 2; }
  get midY() { return (this.atomA.y + this.atomB.y) / 2; }

  /** EN bias: 0 to 1, where 0.5 = equal. Higher = toward atomB. */
  get enBias() {
    const enA = this.atomA.element.EN || 2;
    const enB = this.atomB.element.EN || 2;
    return enB / (enA + enB);
  }

  hitTest() { return false; }

  render(ctx, time) {
    // 1. Draw the shared electron cloud (behind bond lines)
    if (this.showCloud) {
      this._renderSharedCloud(ctx, time);
    }

    // 2. Draw bond lines
    this._renderLines(ctx);

    // 3. Bond order label for fractional bonds
    if (this.order !== Math.floor(this.order)) {
      ctx.fillStyle = DASHED_COLOR;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.order.toString(), this.midX, this.midY - 22);
    }
  }

  /**
   * Draw the shared electron cloud — an elliptical gradient between
   * the two atoms, shifted toward the more EN atom.
   */
  _renderSharedCloud(ctx, time) {
    const a = this.atomA;
    const b = this.atomB;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const bias = this.enBias; // 0.5 = center, >0.5 = toward B
    const pulse = 1 + Math.sin(time * 1.5) * 0.06;

    // Cloud center shifted by EN
    const cx = a.x + dx * bias;
    const cy = a.y + dy * bias;

    // Cloud size: larger for higher bond order, asymmetric
    const cloudR = (20 + this.order * 12) * pulse;

    // Use an elliptical gradient along bond axis
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.atan2(dy, dx));

    // Elongated along bond axis, wider on the more-EN side
    const lenA = dist * bias;      // distance from A to cloud center
    const lenB = dist * (1 - bias); // distance from B to cloud center
    const halfLen = Math.max(lenA, lenB) * 0.6;

    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, halfLen);
    const { r, g, b: bl } = CLOUD_COLOR;
    const intensity = 0.12 + this.order * 0.08;
    grad.addColorStop(0, `rgba(${r},${g},${bl},${intensity})`);
    grad.addColorStop(0.4, `rgba(${r},${g},${bl},${intensity * 0.5})`);
    grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);

    ctx.fillStyle = grad;
    ctx.scale(1.0, cloudR / halfLen); // stretch perpendicular to make it wide
    ctx.beginPath();
    ctx.arc(0, 0, halfLen, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _renderLines(ctx) {
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
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4; // subtle lines — cloud is the main visual

    if (this.style === 'dashed') ctx.setLineDash([6, 4]);

    for (let i = 0; i < drawOrder; i++) {
      const off = (i - (drawOrder - 1) / 2) * gap * 2;
      ctx.beginPath();
      ctx.moveTo(x1 + nx * off, y1 + ny * off);
      ctx.lineTo(x2 + nx * off, y2 + ny * off);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  destroy() {
    this.atomA.bonds = this.atomA.bonds.filter(b => b !== this);
    this.atomB.bonds = this.atomB.bonds.filter(b => b !== this);
    this.atomA.assignElectronStates();
    this.atomB.assignElectronStates();
  }
}
