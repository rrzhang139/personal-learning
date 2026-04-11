/**
 * Visual atom with electron cloud, orbital shapes, draggable.
 *
 * Rendering modes:
 * - cloudVisible: simple EN-weighted radial gradient
 * - orbitalsVisible: actual orbital shapes (s sphere, p dumbbell, etc.) centered on atom
 * - electronsVisible: electron particle dots
 *
 * orbitalFilter controls which subshell types are drawn: { s: true, p: true, d: false, f: false }
 */
import { Renderable } from '../canvas/Renderable.js';
import { Electron } from './Electron.js';
import { ElectronConfig } from '../orbitals/ElectronConfig.js';
import { drawS, drawP, drawPz, drawDCloverleaf, drawDz2, drawF } from '../orbitals/OrbitalShape.js';

const GLOW_COLOR = '#00e5ff';
const COLORS = ElectronConfig.SUBSHELL_COLORS;

// Orbital sizes scale with principal quantum number — large enough to see
function orbSize(n, type) {
  const base = { s: 35, p: 55, d: 50, f: 45 };
  return (base[type] || 35) + n * 20;
}

const P_ANGLES = [0, Math.PI / 2, null]; // px, py, pz
const D_ANGLES = [Math.PI / 4, 0, Math.PI / 6, Math.PI / 3, 'dz2'];

export class Atom extends Renderable {
  constructor(element, x = 0, y = 0) {
    const r = element.radius || 24;
    super({ x, y, width: r * 2, height: r * 2 });
    this.element = element;
    this.r = r;
    this.interactive = true;
    this.draggable = true;

    // Display toggles
    this.cloudVisible = true;
    this.electronsVisible = true;
    this.orbitalsVisible = false;  // show orbital shapes on the atom

    // Shared filter reference — set by playground, shared across all atoms
    // { s: true, p: true, d: true, f: true }
    this.orbitalFilter = null;

    this.charge = 0;
    this.formalCharge = null;
    this.fcVisible = false;
    this._snapGlow = false;

    this.float = false;
    this._floatPhase = Math.random() * Math.PI * 2;
    this._floatSpeed = 0.3 + Math.random() * 0.4;

    /** @type {import('./Bond.js').Bond[]} */
    this.bonds = [];

    /** @type {Electron[]} */
    this.electrons = [];
    for (let i = 0; i < element.valenceElectrons; i++) {
      this.electrons.push(new Electron(this, i));
    }

    // Cache electron config for orbital rendering
    this._electronConfig = ElectronConfig.build(element.Z);
  }

  showVEDots(on) { this.electronsVisible = on; }
  showLonePairs() {}
  showFC(on) { this.fcVisible = on; }

  setFormalCharge(fc) {
    this.formalCharge = fc;
    this.fcVisible = fc !== null && fc !== undefined;
  }

  setLonePairs() { this.assignElectronStates(); }

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
        } else count += 0.5;
      }
    }
    return count;
  }

  assignElectronStates() {
    for (const e of this.electrons) {
      e.state = 'valence'; e.bond = null; e.partnerAtom = null;
      e.orbitalType = null; e.orbitalN = 0; e.orbitalAngle = null; e.orbitalSize = 0;
    }

    // Map electrons to their orbital types from the config.
    // Walk the config to assign orbital info to each electron in order.
    let cfgIdx = 0;
    const flatOrbitals = [];
    for (const sub of this._electronConfig) {
      for (let oi = 0; oi < sub.orbitals.length; oi++) {
        const orb = sub.orbitals[oi];
        if (orb.spinUp) flatOrbitals.push({ n: sub.n, type: sub.type, orbIndex: oi });
        if (orb.spinDown) flatOrbitals.push({ n: sub.n, type: sub.type, orbIndex: oi });
      }
    }
    // Assign orbital info to each electron (valence electrons map 1:1 in order)
    for (let i = 0; i < this.electrons.length && i < flatOrbitals.length; i++) {
      // Only assign to valence-shell electrons (last N in flatOrbitals)
    }
    // Actually: assign from the END of flatOrbitals (valence electrons are the outermost)
    const veStart = flatOrbitals.length - this.electrons.length;
    for (let i = 0; i < this.electrons.length; i++) {
      const orbInfo = flatOrbitals[veStart + i];
      if (orbInfo) {
        const e = this.electrons[i];
        e.orbitalType = orbInfo.type;
        e.orbitalN = orbInfo.n;
        e.orbitalSize = orbSize(orbInfo.n, orbInfo.type);
        // Orientation for p/d orbitals
        if (orbInfo.type === 'p') {
          e.orbitalAngle = P_ANGLES[orbInfo.orbIndex % 3];
        } else if (orbInfo.type === 'd') {
          e.orbitalAngle = D_ANGLES[orbInfo.orbIndex % 5];
        }
      }
    }

    // Now assign bond/lone states as before
    let idx = 0;
    for (const bond of this.bonds) {
      const other = bond.atomA === this ? bond.atomB : bond.atomA;
      const needed = Math.ceil(bond.order);
      for (let p = 0; p < needed && idx < this.electrons.length; p++) {
        const e = this.electrons[idx++];
        e.state = 'shared'; e.bond = bond; e.partnerAtom = other; e.pairIndex = p % 2;
      }
    }
    let groupIdx = 0, slotInGroup = 0;
    for (const e of this.electrons) {
      if (e.state !== 'valence') continue;
      e.state = 'lone'; e.lonePairGroup = groupIdx; e.lonePairSlot = slotInGroup;
      slotInGroup++;
      if (slotInGroup >= 2) { slotInGroup = 0; groupIdx++; }
    }
  }

  hitTest(px, py) {
    const dx = px - this.x, dy = py - this.y;
    return dx * dx + dy * dy <= (this.r + 12) * (this.r + 12);
  }

  render(ctx, time) {
    let drawX = this.x, drawY = this.y;
    if (this.float) {
      drawX += Math.sin(time * this._floatSpeed + this._floatPhase) * 10;
      drawY += Math.cos(time * this._floatSpeed * 0.7 + this._floatPhase * 1.3) * 7;
    }

    // Orbital shapes (behind atom circle)
    if (this.orbitalsVisible) {
      this._renderOrbitals(ctx, drawX, drawY, time);
    }

    // Simple cloud (if orbitals not shown)
    if (this.cloudVisible && !this.orbitalsVisible) {
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
    ctx.beginPath(); ctx.arc(drawX, drawY, this.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    // Symbol
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${this.r > 26 ? 22 : 18}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.element.symbol, drawX, drawY);

    // Electrons
    if (this.electronsVisible) {
      for (const e of this.electrons) { e.update(time); e.draw(ctx); }
    }

    // Formal charge
    if (this.fcVisible && this.formalCharge != null && this.formalCharge !== 0) {
      this._renderFC(ctx, drawX, drawY);
    }
  }

  /**
   * Draw actual orbital shapes centered on this atom.
   * Uses the full electron config (all shells, not just valence).
   */
  _renderOrbitals(ctx, cx, cy, time) {
    const filter = this.orbitalFilter || { s: true, p: true, d: true, f: true };

    // Render back-to-front: f → d → p → s
    const order = ['f', 'd', 'p', 's'];
    for (const type of order) {
      if (!filter[type]) continue;

      for (const sub of this._electronConfig) {
        if (sub.type !== type) continue;
        const size = orbSize(sub.n, type);
        const maxE = ElectronConfig.MAX_ELECTRONS[type];
        const fillRatio = sub.electrons / maxE;
        const baseAlpha = 0.1 + fillRatio * 0.5;

        for (let i = 0; i < sub.orbitals.length; i++) {
          const orb = sub.orbitals[i];
          const eCount = (orb.spinUp ? 1 : 0) + (orb.spinDown ? 1 : 0);
          const alpha = eCount === 0 ? baseAlpha * 0.1 : baseAlpha * (0.3 + eCount * 0.35);
          const color = COLORS[type];

          switch (type) {
            case 's':
              drawS(ctx, cx, cy, size, color, alpha);
              break;
            case 'p':
              if (P_ANGLES[i] !== null) drawP(ctx, cx, cy, size, P_ANGLES[i], color, alpha);
              else drawPz(ctx, cx, cy, size * 0.5, color, alpha);
              break;
            case 'd':
              if (D_ANGLES[i] === 'dz2') drawDz2(ctx, cx, cy, size, color, alpha);
              else if (D_ANGLES[i] !== null) drawDCloverleaf(ctx, cx, cy, size, D_ANGLES[i], color, alpha);
              else drawP(ctx, cx, cy, size * 0.7, i * Math.PI / 5, color, alpha);
              break;
            case 'f':
              drawF(ctx, cx, cy, size, i, color, alpha);
              break;
          }
        }
      }
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
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  }

  _renderFC(ctx, cx, cy) {
    const fc = this.formalCharge;
    const color = fc > 0 ? '#ef5350' : '#4caf50';
    const fx = cx + this.r * 0.7, fy = cy - this.r * 0.7;
    ctx.fillStyle = color; ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fc > 0 ? `+${fc}` : `${fc}`, fx, fy);
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(fx, fy, 11, 0, Math.PI * 2); ctx.stroke();
  }
}
