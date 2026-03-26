/**
 * A single electron particle.
 *
 * States:
 * - 'valence': orbiting its home atom (not yet bonded)
 * - 'lone': part of a lone pair, orbits at a fixed angle
 * - 'shared': part of a bond, shuttles between two atoms biased by EN
 *
 * The electron is NOT a Renderable — it's managed and drawn by Atom/Bond.
 */
export class Electron {
  /**
   * @param {import('./Atom.js').Atom} homeAtom
   * @param {number} orbitIndex — which slot (0-7) in the valence shell
   */
  constructor(homeAtom, orbitIndex = 0) {
    this.homeAtom = homeAtom;
    this.orbitIndex = orbitIndex;
    this.state = 'valence'; // 'valence' | 'lone' | 'shared'

    // Shared bond info
    this.bond = null;
    this.partnerAtom = null;
    this.pairIndex = 0;     // 0 or 1 within a shared pair

    // Lone pair info
    this.loneAngle = 0;     // base angle for lone pair
    this.lonePairSlot = 0;  // 0 or 1 within the pair

    // Animation
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 1.5 + Math.random() * 1.0;
    this.x = 0;
    this.y = 0;
    this.radius = 3.5;

    // Visual
    this.glow = 0.6 + Math.random() * 0.4;
  }

  /**
   * Update position based on state and time.
   * @param {number} time — elapsed seconds
   */
  update(time) {
    const t = time * this.speed + this.phase;

    if (this.state === 'valence') {
      this._updateValence(t);
    } else if (this.state === 'lone') {
      this._updateLone(t);
    } else if (this.state === 'shared') {
      this._updateShared(t);
    }
  }

  /** Orbit around home atom in a circle */
  _updateValence(t) {
    const a = this.homeAtom;
    const count = a.element.valenceElectrons;
    const baseAngle = (this.orbitIndex / count) * Math.PI * 2 - Math.PI / 2;
    const orbitR = a.r + 16;
    // Slight wobble
    const wobble = Math.sin(t * 2.5) * 3;
    this.x = a.x + Math.cos(baseAngle + Math.sin(t * 0.8) * 0.15) * (orbitR + wobble);
    this.y = a.y + Math.sin(baseAngle + Math.sin(t * 0.8) * 0.15) * (orbitR + wobble);
  }

  /** Orbit at a fixed angle (lone pair) — gentle oscillation */
  _updateLone(t) {
    const a = this.homeAtom;
    const dist = a.r + 14;
    const perpOff = (this.lonePairSlot === 0 ? -4 : 4);
    const wobble = Math.sin(t * 1.5) * 2;
    const angle = this.loneAngle;
    const px = a.x + Math.cos(angle) * (dist + wobble);
    const py = a.y + Math.sin(angle) * (dist + wobble);
    this.x = px + Math.cos(angle + Math.PI / 2) * perpOff;
    this.y = py + Math.sin(angle + Math.PI / 2) * perpOff;
  }

  /** Shuttle between two bonded atoms, biased by electronegativity */
  _updateShared(t) {
    if (!this.bond || !this.partnerAtom) return;
    const a = this.homeAtom;
    const b = this.partnerAtom;

    // EN bias: higher EN atom pulls electron toward it
    // enBias: 0.5 = equal sharing, >0.5 = toward b, <0.5 = toward a
    const enA = a.element.EN || 2.0;
    const enB = b.element.EN || 2.0;
    const enBias = enB / (enA + enB); // 0.5 for equal, higher if B more EN

    // Oscillation: electron moves along bond axis
    // Use sin wave but shift center toward more EN atom
    const raw = (Math.sin(t * 1.2) + 1) / 2; // 0 to 1

    // Bias the raw value toward the more EN side
    // Power function: raw^k shifts distribution
    // k < 1 = spend more time near 1 (atom B side)
    // k > 1 = spend more time near 0 (atom A side)
    const k = enA / enB; // if B is more EN, k < 1 → biased toward B
    const biased = Math.pow(raw, k);

    // Perpendicular offset for pair separation
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / dist;
    const ny = dx / dist;
    const perpOff = (this.pairIndex === 0 ? -5 : 5);

    // Position along bond
    const margin = a.r + 4;
    const endMargin = b.r + 4;
    const ax = a.x + (dx / dist) * margin;
    const ay = a.y + (dy / dist) * margin;
    const bx = b.x - (dx / dist) * endMargin;
    const by = b.y - (dy / dist) * endMargin;

    this.x = ax + (bx - ax) * biased + nx * perpOff;
    this.y = ay + (by - ay) * biased + ny * perpOff;
  }

  /**
   * Draw the electron.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    // Glow
    ctx.shadowColor = this.state === 'shared' ? '#ff9800' : '#fdd835';
    ctx.shadowBlur = 8 * this.glow;
    ctx.fillStyle = this.state === 'shared' ? '#ffcc80' : '#fdd835';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
