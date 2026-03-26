/**
 * Visual atom with electron cloud, draggable.
 *
 * Each atom owns Electron objects. The cloud aura size reflects
 * how many electrons it controls (own + shared biased by EN).
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

    // Display toggles
    this._showCloud = true;
    this._showElectrons = true;

    // State
    this.charge = 0;
    this.formalCharge = null;
    this._showFC = false;
    this._snapGlow = false;

    // Float animation
    this.float = false;
    this._floatPhase = Math.random() * Math.PI * 2;
    this._floatSpeed = 0.3 + Math.random() * 0.4;

    // Bonds
    /** @type {import('./Bond.js').Bond[]} */
    this.bonds = [];

    // Electrons — create one per valence electron
    /** @type {Electron[]} */
    this.electrons = [];
    for (let i = 0; i < element.valenceElectrons; i++) {
      this.electrons.push(new Electron(this, i));
    }
  }

  showCloud(on) { this._showCloud = on; }
  showElectrons(on) { this._showElectrons = on; }
  showFC(on) { this._showFC = on; }
  showVEDots(on) { this._showElectrons = on; }
  showLonePairs(on) { /* lone pairs are now part of electron system */ }

  setFormalCharge(fc) {
    this.formalCharge = fc;
    this._showFC = fc !== null && fc !== undefined;
  }

  setLonePairs(count) {
    // Configure electron states for lone pairs
    // This is called by Molecule factories after bonds are set up
    this._assignElectronStates();
  }

  /** Count how many of this atom's electrons are currently shared in bonds */
  get sharedElectronCount() {
    return this.electrons.filter(e => e.state === 'shared').length;
  }

  /** Count how many electrons this atom "effectively" has (for cloud size) */
  get effectiveElectrons() {
    let count = 0;
    for (const e of this.electrons) {
      if (e.state === 'valence' || e.state === 'lone') {
        count += 1;
      } else if (e.state === 'shared') {
        // Shared electrons: weight by EN bias (more EN = more "ownership")
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
   * Assign electron states based on bonds.
   * Called after bonds are created.
   */
  _assignElectronStates() {
    // Reset all to valence
    for (const e of this.electrons) {
      e.state = 'valence';
      e.bond = null;
      e.partnerAtom = null;
    }

    let electronIdx = 0;

    // For each bond, assign electrons as shared
    for (const bond of this.bonds) {
      const other = bond.atomA === this ? bond.atomB : bond.atomA;
      const pairsNeeded = Math.ceil(bond.order);

      for (let p = 0; p < pairsNeeded && electronIdx < this.electrons.length; p++) {
        const e = this.electrons[electronIdx];
        e.state = 'shared';
        e.bond = bond;
        e.partnerAtom = other;
        e.pairIndex = p % 2;
        electronIdx++;
      }
    }

    // Remaining electrons become lone pairs
    const remaining = this.electrons.filter(e => e.state === 'valence');
    const bondAngles = this.bonds.map(b => {
      const other = b.atomA === this ? b.atomB : b.atomA;
      return Math.atan2(other.y - this.y, other.x - this.x);
    });

    // Find available angles for lone pairs
    const loneAngles = [];
    if (bondAngles.length === 0) {
      for (let i = 0; i < Math.ceil(remaining.length / 2); i++) {
        loneAngles.push((i / Math.ceil(remaining.length / 2)) * Math.PI * 2 - Math.PI / 2);
      }
    } else {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        let ok = true;
        for (const ba of bondAngles) {
          const diff = Math.abs(((a - ba) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
          if (diff < 0.8) { ok = false; break; }
        }
        if (ok) loneAngles.push(a);
      }
    }

    let pairIdx = 0;
    for (let i = 0; i < remaining.length; i++) {
      const e = remaining[i];
      e.state = 'lone';
      const angleslot = Math.floor(pairIdx / 2);
      e.loneAngle = loneAngles[angleslot % loneAngles.length] || 0;
      e.lonePairSlot = pairIdx % 2;
      pairIdx++;
    }
  }

  /** Circle hit test */
  hitTest(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= (this.r + 12) * (this.r + 12);
  }

  render(ctx, time) {
    let drawX = this.x;
    let drawY = this.y;

    // Float
    if (this.float) {
      drawX += Math.sin(time * this._floatSpeed + this._floatPhase) * 10;
      drawY += Math.cos(time * this._floatSpeed * 0.7 + this._floatPhase * 1.3) * 7;
    }

    // Electron cloud aura
    if (this._showCloud) {
      this._renderCloud(ctx, drawX, drawY, time);
    }

    // Glow on hover or snap
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

    // Update and draw electrons
    if (this._showElectrons) {
      for (const e of this.electrons) {
        e.update(time);
        e.draw(ctx);
      }
    }

    // Formal charge badge
    if (this._showFC && this.formalCharge != null && this.formalCharge !== 0) {
      this._renderFC(ctx, drawX, drawY);
    }
  }

  /** Electron density cloud — size based on effective electron count */
  _renderCloud(ctx, cx, cy, time) {
    const effectiveE = this.effectiveElectrons;
    const maxE = this.element.targetElectrons;
    // Cloud radius: scales with how many electrons this atom "owns"
    const baseR = this.r + 10;
    const cloudR = baseR + (effectiveE / maxE) * 30;
    const pulse = 1 + Math.sin(time * 1.2 + this._floatPhase) * 0.05;

    const r = cloudR * pulse;
    const grad = ctx.createRadialGradient(cx, cy, this.r * 0.5, cx, cy, r);

    // Color from element, semi-transparent
    const color = this.element.color;
    // Parse hex color
    const cr = parseInt(color.slice(1, 3), 16);
    const cg = parseInt(color.slice(3, 5), 16);
    const cb = parseInt(color.slice(5, 7), 16);

    const intensity = 0.08 + (effectiveE / maxE) * 0.12;
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},${intensity})`);
    grad.addColorStop(0.6, `rgba(${cr},${cg},${cb},${intensity * 0.5})`);
    grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  _renderFC(ctx, cx, cy) {
    const fc = this.formalCharge;
    const color = fc > 0 ? '#ef5350' : '#4caf50';
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
