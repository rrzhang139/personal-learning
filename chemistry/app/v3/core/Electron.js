/**
 * A single electron particle.
 *
 * When the parent atom has orbitalsVisible=true, the electron moves
 * within its assigned orbital shape:
 * - s orbital: wanders inside the sphere
 * - p orbital: moves along the dumbbell axis between both lobes
 * - d/f: wanders in the orbital region
 *
 * When orbitals are off, uses simpler orbit/lone-pair/shared movement.
 */
export class Electron {
  constructor(homeAtom, orbitIndex = 0) {
    this.homeAtom = homeAtom;
    this.orbitIndex = orbitIndex;
    this.state = 'valence';

    this.bond = null;
    this.partnerAtom = null;
    this.pairIndex = 0;

    this.lonePairGroup = 0;
    this.lonePairSlot = 0;

    // Orbital info (set by Atom.assignElectronStates)
    this.orbitalType = null;  // 's', 'p', 'd', 'f'
    this.orbitalN = 0;        // principal quantum number
    this.orbitalAngle = null;  // orientation for p/d (radians, null=pz/dz2)
    this.orbitalSize = 0;     // size in pixels

    this.phase = Math.random() * Math.PI * 2;
    this.speed = 1.5 + Math.random() * 1.0;
    this.x = 0;
    this.y = 0;
    this.radius = 3.5;
    this.glow = 0.6 + Math.random() * 0.4;
  }

  update(time) {
    const t = time * this.speed + this.phase;
    const useOrbital = this.homeAtom.orbitalsVisible && this.orbitalType;

    if (this.state === 'shared') {
      this._updateShared(t, useOrbital);
    } else if (useOrbital) {
      this._updateInOrbital(t);
    } else if (this.state === 'valence') {
      this._updateValence(t);
    } else if (this.state === 'lone') {
      this._updateLone(t);
    }
  }

  /** Move within the orbital shape centered on the home atom */
  _updateInOrbital(t) {
    const a = this.homeAtom;
    const size = this.orbitalSize || 40;
    const type = this.orbitalType;

    if (type === 's') {
      // Wander inside sphere
      const r = size * 0.6;
      const wanderT = t * 0.7;
      this.x = a.x + Math.cos(wanderT * 1.3 + this.phase) * r * 0.5;
      this.y = a.y + Math.sin(wanderT * 0.9 + this.phase) * r * 0.5;

    } else if (type === 'p') {
      const angle = this.orbitalAngle;
      if (angle !== null) {
        // Move along dumbbell axis — oscillate between both lobes
        const along = Math.sin(t * 0.6) * size * 0.75;
        // Slight perpendicular wobble inside the lobe width
        const wobble = Math.sin(t * 1.8 + this.phase) * size * 0.15;
        this.x = a.x + Math.cos(angle) * along - Math.sin(angle) * wobble;
        this.y = a.y + Math.sin(angle) * along + Math.cos(angle) * wobble;
      } else {
        // pz (into screen) — small circle wander
        const r = size * 0.25;
        this.x = a.x + Math.cos(t * 0.8) * r;
        this.y = a.y + Math.sin(t * 0.6) * r;
      }

    } else if (type === 'd') {
      // Wander in cloverleaf region
      const baseAngle = (typeof this.orbitalAngle === 'number') ? this.orbitalAngle : 0;
      const lobe = Math.floor((Math.sin(t * 0.4) + 1) * 2) % 4;
      const lobeAngle = baseAngle + lobe * Math.PI / 2;
      const r = size * 0.45;
      const along = (0.3 + Math.abs(Math.sin(t * 0.7)) * 0.7) * r;
      this.x = a.x + Math.cos(lobeAngle + Math.sin(t * 0.3) * 0.2) * along;
      this.y = a.y + Math.sin(lobeAngle + Math.sin(t * 0.3) * 0.2) * along;

    } else {
      // f or fallback — general wander
      const r = size * 0.4;
      this.x = a.x + Math.cos(t * 0.9 + this.phase * 3) * r;
      this.y = a.y + Math.sin(t * 0.7 + this.phase * 2) * r;
    }
  }

  _updateValence(t) {
    const a = this.homeAtom;
    const count = a.element.valenceElectrons;
    const baseAngle = (this.orbitIndex / count) * Math.PI * 2 - Math.PI / 2;
    const orbitR = a.r + 16;
    const wobble = Math.sin(t * 2.5) * 3;
    this.x = a.x + Math.cos(baseAngle + Math.sin(t * 0.8) * 0.15) * (orbitR + wobble);
    this.y = a.y + Math.sin(baseAngle + Math.sin(t * 0.8) * 0.15) * (orbitR + wobble);
  }

  _updateLone(t) {
    const a = this.homeAtom;
    const bondAngles = [];
    for (const bond of a.bonds) {
      const other = bond.atomA === a ? bond.atomB : bond.atomA;
      bondAngles.push(Math.atan2(other.y - a.y, other.x - a.x));
    }

    let angle;
    if (bondAngles.length === 0) {
      const totalGroups = Math.ceil(a.electrons.filter(e => e.state === 'lone').length / 2);
      angle = (this.lonePairGroup / Math.max(totalGroups, 1)) * Math.PI * 2 - Math.PI / 2;
    } else if (bondAngles.length === 1) {
      const totalGroups = Math.ceil(a.electrons.filter(e => e.state === 'lone').length / 2);
      const baseAngle = bondAngles[0] + Math.PI;
      const spread = Math.PI * 0.8;
      angle = baseAngle + (this.lonePairGroup - (totalGroups - 1) / 2) * (spread / Math.max(totalGroups - 1, 1));
    } else {
      const sorted = [...bondAngles].sort((a, b) => a - b);
      const gaps = [];
      for (let i = 0; i < sorted.length; i++) {
        const next = sorted[(i + 1) % sorted.length];
        let gap = next - sorted[i];
        if (gap <= 0) gap += Math.PI * 2;
        gaps.push({ angle: sorted[i] + gap / 2, size: gap });
      }
      gaps.sort((a, b) => b.size - a.size);
      angle = gaps[this.lonePairGroup % gaps.length]?.angle ?? bondAngles[0] + Math.PI;
    }

    const dist = a.r + 14;
    const wobble = Math.sin(t * 1.5) * 2;
    const perpOff = (this.lonePairSlot === 0 ? -4 : 4);
    const px = a.x + Math.cos(angle) * (dist + wobble);
    const py = a.y + Math.sin(angle) * (dist + wobble);
    this.x = px + Math.cos(angle + Math.PI / 2) * perpOff;
    this.y = py + Math.sin(angle + Math.PI / 2) * perpOff;
  }

  /**
   * Shared electron: shuttles between bonded atoms.
   * When orbitals are visible, stays within the orbital overlap region.
   */
  _updateShared(t, useOrbital) {
    if (!this.bond || !this.partnerAtom) return;
    const a = this.homeAtom;
    const b = this.partnerAtom;

    const enA = a.element.EN || 2.0;
    const enB = b.element.EN || 2.0;
    const raw = (Math.sin(t * 1.2) + 1) / 2;
    const k = enA / enB;
    const biased = Math.pow(raw, k);

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / dist;
    const ny = dx / dist;
    const perpOff = (this.pairIndex === 0 ? -5 : 5);

    const margin = a.r + 4;
    const endMargin = b.r + 4;
    const ax = a.x + (dx / dist) * margin;
    const ay = a.y + (dy / dist) * margin;
    const bx = b.x - (dx / dist) * endMargin;
    const by = b.y - (dy / dist) * endMargin;

    let ex = ax + (bx - ax) * biased + nx * perpOff;
    let ey = ay + (by - ay) * biased + ny * perpOff;

    // When orbitals visible: add wobble within orbital lobe width
    if (useOrbital && this.orbitalType === 'p' && this.orbitalAngle !== null) {
      const lobeWidth = this.orbitalSize * 0.2;
      const wobble = Math.sin(t * 2.0 + this.phase) * lobeWidth;
      ex += nx * wobble;
      ey += ny * wobble;
    }

    this.x = ex;
    this.y = ey;
  }

  draw(ctx) {
    ctx.shadowColor = this.state === 'shared' ? '#ff9800' : '#fdd835';
    ctx.shadowBlur = 8 * this.glow;
    ctx.fillStyle = this.state === 'shared' ? '#ffcc80' : '#fdd835';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
