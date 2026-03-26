/**
 * Visual atom with electron cloud and electron particles.
 * Electrons orbit, lone pairs face away from bonds dynamically.
 * Cloud size reflects EN-weighted electron ownership.
 */
import { Renderable } from '../canvas/Renderable.js';
import { Electron } from './Electron.js';

const GLOW_COLOR = '#00e5ff';

export class Atom extends Renderable {
  constructor(element, x = 0, y = 0) {
    const r = element.radius || 24;
    super({ x, y, width: r * 2, height: r * 2 });
    this.element = element;
    this.r = r;
    this.interactive = true;
    this.draggable = true;

    // Display toggles — plain properties (not methods!) so they can be set freely
    this.cloudVisible = true;
    this.electronsVisible = true;

    // State
    this.charge = 0;
    this.formalCharge = null;
    this.fcVisible = false;
    this._snapGlow = false;

    // Float animation
    this.float = false;
    this._floatPhase = Math.random() * Math.PI * 2;
    this._floatSpeed = 0.3 + Math.random() * 0.4;

    // Bonds connected to this atom
    /** @type {import('./Bond.js').Bond[]} */
    this.bonds = [];

    // Electrons — one per valence electron
    /** @type {Electron[]} */
    this.electrons = [];
    for (let i = 0; i < element.valenceElectrons; i++) {
      this.electrons.push(new Electron(this, i));
    }
  }

  /** Convenience setters for backward compat */
  showVEDots(on) { this.electronsVisible = on; }
  showLonePairs() { /* handled by electron system */ }
  showFC(on) { this.fcVisible = on; }

  setFormalCharge(fc) {
    this.formalCharge = fc;
    this.fcVisible = fc !== null && fc !== undefined;
  }

  setLonePairs() {
    this.assignElectronStates();
  }

  /** EN-weighted effective electron count (for cloud size) */
  get effectiveElectrons() {
    let count = 0;
    for (const e of this.electrons) {
      if (e.state === 'valence' || e.state === 'lone') {
        count += 1;
      } else if (e.state === 'shared') {
        const other = e.partnerAtom;
        if (other) {
          const myEN = this.element.EN || 2;
          const otherEN = other.element.EN || 2;
          count += myEN / (myEN + otherEN);
        } else {
          count += 0.5;
        }
      }
    }
    return count;
  }

  /**
   * Assign electron states based on current bonds.
   * Call after bonds change. Lone pair ANGLES are computed dynamically
   * in Electron._updateLone(), not here — so they update when atoms move.
   */
  assignElectronStates() {
    // Reset all to valence
    for (const e of this.electrons) {
      e.state = 'valence';
      e.bond = null;
      e.partnerAtom = null;
    }

    let idx = 0;

    // Assign shared electrons for each bond
    for (const bond of this.bonds) {
      const other = bond.atomA === this ? bond.atomB : bond.atomA;
      const needed = Math.ceil(bond.order);
      for (let p = 0; p < needed && idx < this.electrons.length; p++) {
        const e = this.electrons[idx++];
        e.state = 'shared';
        e.bond = bond;
        e.partnerAtom = other;
        e.pairIndex = p % 2;
      }
    }

    // Remaining become lone pairs — assign group/slot indices
    // (actual angles computed dynamically each frame by Electron)
    let groupIdx = 0;
    let slotInGroup = 0;
    for (const e of this.electrons) {
      if (e.state !== 'valence') continue;
      e.state = 'lone';
      e.lonePairGroup = groupIdx;
      e.lonePairSlot = slotInGroup;
      slotInGroup++;
      if (slotInGroup >= 2) {
        slotInGroup = 0;
        groupIdx++;
      }
    }
  }

  hitTest(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= (this.r + 12) * (this.r + 12);
  }

  render(ctx, time) {
    let drawX = this.x;
    let drawY = this.y;

    if (this.float) {
      drawX += Math.sin(time * this._floatSpeed + this._floatPhase) * 10;
      drawY += Math.cos(time * this._floatSpeed * 0.7 + this._floatPhase * 1.3) * 7;
    }

    // Electron cloud aura
    if (this.cloudVisible) {
      this._renderCloud(ctx, drawX, drawY, time);
    }

    // Glow
    const glowing = this.hovered || this._snapGlow;
    if (glowing) {
      ctx.shadowColor = this._snapGlow ? '#4caf50' : GLOW_COLOR;
      ctx.shadowBlur = this._snapGlow ? 30 : 20;
    }

    // Atom circle
    ctx.fillStyle = '#0d1b2a';
    ctx.strokeStyle = this._snapGlow ? '#4caf50' : this.hovered ? GLOW_COLOR : this.element.color;
    ctx.lineWidth = glowing ? 3 : 2;
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Symbol
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${this.r > 26 ? 22 : 18}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.element.symbol, drawX, drawY);

    // Electrons
    if (this.electronsVisible) {
      for (const e of this.electrons) {
        e.update(time);
        e.draw(ctx);
      }
    }

    // Formal charge
    if (this.fcVisible && this.formalCharge != null && this.formalCharge !== 0) {
      this._renderFC(ctx, drawX, drawY);
    }
  }

  _renderCloud(ctx, cx, cy, time) {
    const eff = this.effectiveElectrons;
    const maxE = this.element.targetElectrons;
    const ratio = eff / maxE;
    const baseR = this.r + 10;
    const cloudR = baseR + ratio * 35;
    const pulse = 1 + Math.sin(time * 1.2 + this._floatPhase) * 0.05;
    const r = cloudR * pulse;

    // Parse element color
    const c = this.element.color;
    const cr = parseInt(c.slice(1, 3), 16);
    const cg = parseInt(c.slice(3, 5), 16);
    const cb = parseInt(c.slice(5, 7), 16);

    const intensity = 0.15 + ratio * 0.25;
    const grad = ctx.createRadialGradient(cx, cy, this.r * 0.3, cx, cy, r);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},${intensity})`);
    grad.addColorStop(0.4, `rgba(${cr},${cg},${cb},${intensity * 0.6})`);
    grad.addColorStop(0.7, `rgba(${cr},${cg},${cb},${intensity * 0.25})`);
    grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  _renderFC(ctx, cx, cy) {
    const fc = this.formalCharge;
    const color = fc > 0 ? '#ef5350' : '#4caf50';
    const fx = cx + this.r * 0.7;
    const fy = cy - this.r * 0.7;
    ctx.fillStyle = color;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fc > 0 ? `+${fc}` : `${fc}`, fx, fy);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(fx, fy, 11, 0, Math.PI * 2);
    ctx.stroke();
  }
}
