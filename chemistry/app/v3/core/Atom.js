/**
 * Visual atom: circle with element symbol, draggable, shows VE dots, lone pairs, formal charge.
 * This is THE core reusable primitive for every chemistry lesson.
 */
import { Renderable } from '../canvas/Renderable.js';

const GLOW_COLOR = '#00e5ff';
const DOT_COLOR = '#fdd835';
const FC_PLUS = '#ef5350';
const FC_MINUS = '#4caf50';

export class Atom extends Renderable {
  /**
   * @param {import('./Element.js').Element} element
   * @param {number} x
   * @param {number} y
   */
  constructor(element, x = 0, y = 0) {
    const r = element.radius || 24;
    super({ x, y, width: r * 2, height: r * 2 });
    this.element = element;
    this.r = r;
    this.interactive = true;
    this.draggable = true;

    // Display toggles
    this._showVEDots = false;
    this._showLonePairs = false;
    this._showFC = false;

    // State
    this.charge = 0;          // ionic charge
    this.formalCharge = null;  // null = don't show, number = show
    this.lonePairCount = 0;
    this.lonePairAngles = [];  // computed from bonds

    // Float animation
    this.float = false;
    this._floatPhase = Math.random() * Math.PI * 2;
    this._floatSpeed = 0.3 + Math.random() * 0.4;

    // Snap glow (set by ProximityBonder)
    this._snapGlow = false;

    // Bonds connected to this atom (set by Bond constructor)
    /** @type {import('./Bond.js').Bond[]} */
    this.bonds = [];
  }

  showVEDots(on) { this._showVEDots = on; }
  showLonePairs(on) { this._showLonePairs = on; }
  showFC(on) { this._showFC = on; }

  setLonePairs(count) {
    this.lonePairCount = count;
    this._showLonePairs = count > 0;
    this._computeLonePairAngles();
  }

  setFormalCharge(fc) {
    this.formalCharge = fc;
    this._showFC = fc !== null && fc !== undefined;
  }

  /** Get angles where bonds connect (for placing lone pairs opposite) */
  _computeLonePairAngles() {
    const bondAngles = [];
    for (const bond of this.bonds) {
      const other = bond.atomA === this ? bond.atomB : bond.atomA;
      bondAngles.push(Math.atan2(other.y - this.y, other.x - this.x));
    }

    // Place lone pairs in gaps between bonds
    this.lonePairAngles = [];
    if (bondAngles.length === 0) {
      // No bonds — distribute evenly
      for (let i = 0; i < this.lonePairCount; i++) {
        this.lonePairAngles.push((i / this.lonePairCount) * Math.PI * 2 - Math.PI / 2);
      }
    } else {
      // Find available angles
      const available = [];
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        let tooClose = false;
        for (const ba of bondAngles) {
          const diff = Math.abs(((a - ba) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
          if (diff < 0.7) { tooClose = true; break; }
        }
        if (!tooClose) available.push(a);
      }
      const step = Math.max(1, Math.floor(available.length / Math.max(this.lonePairCount, 1)));
      for (let i = 0; i < this.lonePairCount && i * step < available.length; i++) {
        this.lonePairAngles.push(available[i * step]);
      }
    }
  }

  /** Circle hit test */
  hitTest(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= (this.r + 8) * (this.r + 8);
  }

  render(ctx, time) {
    let drawX = this.x;
    let drawY = this.y;

    // Float animation
    if (this.float) {
      drawX += Math.sin(time * this._floatSpeed + this._floatPhase) * 10;
      drawY += Math.cos(time * this._floatSpeed * 0.7 + this._floatPhase * 1.3) * 7;
    }

    // Glow on hover or snap proximity
    const glowing = this.hovered || this._snapGlow;
    if (glowing) {
      ctx.shadowColor = this._snapGlow ? '#4caf50' : GLOW_COLOR;
      ctx.shadowBlur = this._snapGlow ? 30 : 20;
    }

    // Main circle
    ctx.fillStyle = '#0d1b2a';
    ctx.strokeStyle = this._snapGlow ? '#4caf50' : this.hovered ? GLOW_COLOR : this.element.color;
    ctx.lineWidth = glowing ? 3 : 2;
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Element symbol
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${this.r > 26 ? 22 : 18}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.element.symbol, drawX, drawY);

    // Valence electron dots (around atom when not bonded)
    if (this._showVEDots) {
      this._renderVEDots(ctx, drawX, drawY, time);
    }

    // Lone pairs (on bonded atoms)
    if (this._showLonePairs && this.lonePairCount > 0) {
      this._renderLonePairs(ctx, drawX, drawY);
    }

    // Formal charge badge
    if (this._showFC && this.formalCharge !== null && this.formalCharge !== 0) {
      this._renderFC(ctx, drawX, drawY);
    }
  }

  _renderVEDots(ctx, cx, cy, time) {
    ctx.fillStyle = DOT_COLOR;
    const count = this.element.valenceElectrons;
    const dist = this.r + 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _renderLonePairs(ctx, cx, cy) {
    ctx.fillStyle = DOT_COLOR;
    const dist = this.r + 14;
    for (const angle of this.lonePairAngles) {
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const perpX = -Math.sin(angle) * 4;
      const perpY = Math.cos(angle) * 4;
      ctx.beginPath(); ctx.arc(px + perpX, py + perpY, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px - perpX, py - perpY, 3.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  _renderFC(ctx, cx, cy) {
    const fc = this.formalCharge;
    const color = fc > 0 ? FC_PLUS : FC_MINUS;
    const fcX = cx + this.r * 0.7;
    const fcY = cy - this.r * 0.7;
    ctx.fillStyle = color;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fc > 0 ? `+${fc}` : `${fc}`, fcX, fcY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(fcX, fcY, 11, 0, Math.PI * 2);
    ctx.stroke();
  }
}
