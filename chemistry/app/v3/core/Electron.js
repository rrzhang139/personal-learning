/**
 * A single electron particle.
 *
 * States:
 * - 'valence': orbiting its home atom freely (not bonded)
 * - 'lone': part of a lone pair — positioned RELATIVE to current bond geometry
 * - 'shared': shuttles between two bonded atoms, biased by EN
 */
export class Electron {
  constructor(homeAtom, orbitIndex = 0) {
    this.homeAtom = homeAtom;
    this.orbitIndex = orbitIndex;
    this.state = 'valence';

    // Shared bond info
    this.bond = null;
    this.partnerAtom = null;
    this.pairIndex = 0;

    // Lone pair info (slot within the lone pair group)
    this.lonePairGroup = 0;  // which lone pair group (0, 1, 2, ...)
    this.lonePairSlot = 0;   // 0 or 1 within the group

    // Animation
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 1.5 + Math.random() * 1.0;
    this.x = 0;
    this.y = 0;
    this.radius = 3.5;
    this.glow = 0.6 + Math.random() * 0.4;
  }

  update(time) {
    const t = time * this.speed + this.phase;
    switch (this.state) {
      case 'valence': this._updateValence(t); break;
      case 'lone': this._updateLone(t); break;
      case 'shared': this._updateShared(t); break;
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

  /**
   * Lone pair — angle computed DYNAMICALLY from current bond positions.
   * This way lone pairs always face away from bonds even when atoms are dragged.
   */
  _updateLone(t) {
    const a = this.homeAtom;

    // Compute current bond angles
    const bondAngles = [];
    for (const bond of a.bonds) {
      const other = bond.atomA === a ? bond.atomB : bond.atomA;
      bondAngles.push(Math.atan2(other.y - a.y, other.x - a.x));
    }

    // Find the angle for this lone pair group, opposite to bonds
    let angle;
    if (bondAngles.length === 0) {
      // No bonds — distribute evenly
      const totalGroups = Math.ceil(a.electrons.filter(e => e.state === 'lone').length / 2);
      angle = (this.lonePairGroup / Math.max(totalGroups, 1)) * Math.PI * 2 - Math.PI / 2;
    } else if (bondAngles.length === 1) {
      // One bond — lone pairs spread on the opposite side
      const totalGroups = Math.ceil(a.electrons.filter(e => e.state === 'lone').length / 2);
      const baseAngle = bondAngles[0] + Math.PI; // opposite to bond
      const spread = Math.PI * 0.8;
      angle = baseAngle + (this.lonePairGroup - (totalGroups - 1) / 2) * (spread / Math.max(totalGroups - 1, 1));
    } else {
      // Multiple bonds — find gaps between bonds and place lone pairs there
      const sorted = [...bondAngles].sort((a, b) => a - b);
      const gaps = [];
      for (let i = 0; i < sorted.length; i++) {
        const next = sorted[(i + 1) % sorted.length];
        let gap = next - sorted[i];
        if (gap <= 0) gap += Math.PI * 2;
        gaps.push({ angle: sorted[i] + gap / 2, size: gap });
      }
      gaps.sort((a, b) => b.size - a.size); // largest gaps first
      const gapInfo = gaps[this.lonePairGroup % gaps.length];
      angle = gapInfo ? gapInfo.angle : bondAngles[0] + Math.PI;
    }

    const dist = a.r + 14;
    const wobble = Math.sin(t * 1.5) * 2;
    const perpOff = (this.lonePairSlot === 0 ? -4 : 4);
    const px = a.x + Math.cos(angle) * (dist + wobble);
    const py = a.y + Math.sin(angle) * (dist + wobble);
    this.x = px + Math.cos(angle + Math.PI / 2) * perpOff;
    this.y = py + Math.sin(angle + Math.PI / 2) * perpOff;
  }

  _updateShared(t) {
    if (!this.bond || !this.partnerAtom) return;
    const a = this.homeAtom;
    const b = this.partnerAtom;

    const enA = a.element.EN || 2.0;
    const enB = b.element.EN || 2.0;

    // Oscillation biased by EN
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

    this.x = ax + (bx - ax) * biased + nx * perpOff;
    this.y = ay + (by - ay) * biased + ny * perpOff;
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
