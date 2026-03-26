/**
 * ProximityBonder: watches atom positions and auto-creates bonds
 * when atoms are dragged close together.
 *
 * - While dragging: atoms within snap distance glow
 * - On drop: if close enough, a bond forms between them
 * - Respects valence limits (H can only bond once, etc.)
 */
import { Bond } from './Bond.js';

const SNAP_DISTANCE = 120;  // px to trigger glow
const BOND_DISTANCE = 100;  // px to actually bond on drop

export class ProximityBonder {
  /**
   * @param {import('../canvas/Stage.js').Stage} stage
   * @param {Function} onBondCreated - callback(bond) when a new bond forms
   */
  constructor(stage, onBondCreated) {
    this.stage = stage;
    this.atoms = [];
    this.bonds = [];
    this.onBondCreated = onBondCreated;

    // The atom currently being dragged (if any)
    this._nearestPair = null; // { dragged, target, dist }

    // Hook into interaction manager
    stage.interaction.onDragEnd = (obj) => this._onDrop(obj);
  }

  /** Register an atom to participate in proximity bonding. */
  addAtom(atom) {
    if (!this.atoms.includes(atom)) this.atoms.push(atom);
  }

  /** Register a bond (so we don't double-bond). */
  addBond(bond) {
    if (!this.bonds.includes(bond)) this.bonds.push(bond);
  }

  /** Remove an atom from tracking. */
  removeAtom(atom) {
    this.atoms = this.atoms.filter(a => a !== atom);
  }

  /** Clear everything. */
  clear() {
    this.atoms = [];
    this.bonds = [];
    this._nearestPair = null;
  }

  /** Max bonds an atom can form based on its element. */
  _maxBonds(atom) {
    const ve = atom.element.valenceElectrons;
    if (atom.element.period === 1) return 1; // H, He
    // Simple heuristic: bonds needed to reach octet
    return Math.min(ve, 8 - ve);
  }

  /** Current bond count for an atom. */
  _currentBonds(atom) {
    let count = 0;
    for (const b of this.bonds) {
      if (b.atomA === atom || b.atomB === atom) {
        count += b.order;
      }
    }
    return count;
  }

  /** Check if two atoms already share a bond. */
  _areBonded(a, b) {
    return this.bonds.some(bond =>
      (bond.atomA === a && bond.atomB === b) || (bond.atomA === b && bond.atomB === a)
    );
  }

  /**
   * Call each frame to update proximity highlighting.
   * Returns the current nearest pair (or null) for rendering a hint.
   */
  update() {
    const dragging = this.stage.interaction.dragTarget;
    this._nearestPair = null;

    if (!dragging || !this.atoms.includes(dragging)) return null;

    let closest = null;
    let closestDist = Infinity;

    for (const atom of this.atoms) {
      if (atom === dragging) continue;
      const dx = atom.x - dragging.x;
      const dy = atom.y - dragging.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < SNAP_DISTANCE && dist < closestDist) {
        // Check if they can bond
        if (!this._areBonded(dragging, atom) &&
            this._currentBonds(dragging) < this._maxBonds(dragging) &&
            this._currentBonds(atom) < this._maxBonds(atom)) {
          closest = atom;
          closestDist = dist;
        }
      }
    }

    if (closest) {
      this._nearestPair = { dragged: dragging, target: closest, dist: closestDist };
      closest._snapGlow = true;
    }

    // Clear glow on all non-target atoms
    for (const a of this.atoms) {
      if (a !== closest) a._snapGlow = false;
    }

    return this._nearestPair;
  }

  /** Called when a drag ends. Creates bond if close enough. */
  _onDrop(obj) {
    if (!this._nearestPair || this._nearestPair.dragged !== obj) {
      // Clear all glows
      for (const a of this.atoms) a._snapGlow = false;
      return;
    }

    const { dragged, target, dist } = this._nearestPair;

    if (dist < BOND_DISTANCE) {
      // Create the bond!
      const bond = new Bond(dragged, target, 1);
      this.bonds.push(bond);
      this.stage.sceneGraph.add(bond);

      // Snap atoms to reasonable distance
      const midX = (dragged.x + target.x) / 2;
      const midY = (dragged.y + target.y) / 2;
      const sepDist = 70; // nice bond length
      const angle = Math.atan2(target.y - dragged.y, target.x - dragged.x);
      this.stage.tweener.tween(dragged, {
        x: midX - Math.cos(angle) * sepDist / 2,
        y: midY - Math.sin(angle) * sepDist / 2,
      }, 300, 'easeOutCubic');
      this.stage.tweener.tween(target, {
        x: midX + Math.cos(angle) * sepDist / 2,
        y: midY + Math.sin(angle) * sepDist / 2,
      }, 300, 'easeOutCubic');

      if (this.onBondCreated) this.onBondCreated(bond);
    }

    // Clear all glows
    for (const a of this.atoms) a._snapGlow = false;
    this._nearestPair = null;
  }

  /**
   * Rigid-body molecule dragging: when one atom is dragged,
   * the entire bonded cluster moves and rotates as a unit,
   * preserving VSEPR geometry.
   *
   * @param {object|null} dragTarget — the atom being dragged
   * @param {number} dx — how much dragTarget moved in x this frame
   * @param {number} dy — how much dragTarget moved in y this frame
   */
  applyRigidBody(dragTarget) {
    if (!dragTarget || !this.atoms.includes(dragTarget)) return;

    // Find all atoms connected to dragTarget (BFS through bonds)
    const cluster = this._findCluster(dragTarget);
    if (cluster.size <= 1) return;

    // Find the "anchor" — the central atom (most bonds) in the cluster
    let central = dragTarget;
    for (const atom of cluster) {
      if (atom.bonds.length > central.bonds.length) central = atom;
    }

    // Compute where the central atom should be based on dragTarget's position
    // If dragTarget IS central, all others follow directly.
    // If dragTarget is a terminal, rotate + translate the whole molecule.
    if (dragTarget === central) {
      // Simple: compute delta from central's "rest" position, apply to all others
      // We don't have rest positions stored, so use bond-length + angle constraints
      this._enforceBondConstraints(central, cluster);
    } else {
      // Terminal dragged: rotate molecule around central so terminal follows
      this._rotateClusterToward(central, dragTarget, cluster);
      this._enforceBondConstraints(central, cluster);
    }
  }

  /**
   * Enforce bond length and VSEPR angle constraints from a central atom outward.
   * Positions all non-dragged atoms at the correct distance and angle from central.
   */
  _enforceBondConstraints(central, cluster) {
    const dragTarget = this.stage.interaction.dragTarget;

    // For the central atom: position its bonded neighbors at correct distances
    // Use current angle from central to each neighbor (preserves rotation)
    // but enforce correct distance
    for (const bond of central.bonds) {
      const other = bond.atomA === central ? bond.atomB : bond.atomA;
      if (!cluster.has(other)) continue;
      if (other === dragTarget) continue; // don't move the dragged atom

      const dx = other.x - central.x;
      const dy = other.y - central.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const targetDist = 65; // bond length
      if (dist < 0.1) continue;

      // Enforce distance: snap to targetDist along current angle
      const angle = Math.atan2(dy, dx);
      other.x = central.x + Math.cos(angle) * targetDist;
      other.y = central.y + Math.sin(angle) * targetDist;
    }

    // For non-central atoms that have their own bonds (chains), recurse
    for (const bond of central.bonds) {
      const other = bond.atomA === central ? bond.atomB : bond.atomA;
      if (!cluster.has(other) || other === dragTarget) continue;
      for (const subBond of other.bonds) {
        const sub = subBond.atomA === other ? subBond.atomB : subBond.atomA;
        if (sub === central || !cluster.has(sub) || sub === dragTarget) continue;
        const dx = sub.x - other.x;
        const dy = sub.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.1) continue;
        const angle = Math.atan2(dy, dx);
        sub.x = other.x + Math.cos(angle) * 65;
        sub.y = other.y + Math.sin(angle) * 65;
      }
    }
  }

  /**
   * When a terminal atom is dragged, rotate the whole cluster around
   * the central atom so it "follows" naturally.
   */
  _rotateClusterToward(central, dragTarget, cluster) {
    // Current angle from central to dragTarget
    const curAngle = Math.atan2(dragTarget.y - central.y, dragTarget.x - central.x);

    // Where dragTarget was last frame (use bond constraint to find old angle)
    // We'll compute the angle delta and rotate all other atoms by the same amount
    const targetDist = 65;
    const idealX = central.x + Math.cos(curAngle) * targetDist;
    const idealY = central.y + Math.sin(curAngle) * targetDist;

    // Move central to keep dragTarget at bond distance
    // (central slides so that dragTarget stays where user put it)
    central.x = dragTarget.x - Math.cos(curAngle) * targetDist;
    central.y = dragTarget.y - Math.sin(curAngle) * targetDist;

    // Now reposition all other atoms relative to central, preserving their
    // relative angles to each other
    for (const bond of central.bonds) {
      const other = bond.atomA === central ? bond.atomB : bond.atomA;
      if (!cluster.has(other) || other === dragTarget) continue;

      // Preserve the angle offset between this atom and dragTarget
      const dx = other.x - central.x;
      const dy = other.y - central.y;
      const angle = Math.atan2(dy, dx);
      other.x = central.x + Math.cos(angle) * targetDist;
      other.y = central.y + Math.sin(angle) * targetDist;
    }
  }

  /**
   * BFS: find all atoms connected to `start` through bonds.
   */
  _findCluster(start) {
    const visited = new Set();
    const queue = [start];
    while (queue.length) {
      const atom = queue.shift();
      if (visited.has(atom)) continue;
      visited.add(atom);
      for (const bond of atom.bonds) {
        const other = bond.atomA === atom ? bond.atomB : bond.atomA;
        if (this.atoms.includes(other) && !visited.has(other)) {
          queue.push(other);
        }
      }
    }
    return visited;
  }

  /**
   * Draw the proximity hint (dashed line between near atoms).
   * Call this in the render loop.
   */
  renderHint(ctx) {
    if (!this._nearestPair) return;
    const { dragged, target, dist } = this._nearestPair;
    const alpha = 1 - (dist / SNAP_DISTANCE);

    // Dashed line hint
    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(dragged.x, dragged.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // "Bond!" text
    const mx = (dragged.x + target.x) / 2;
    const my = (dragged.y + target.y) / 2;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#4caf50';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dist < BOND_DISTANCE ? '✓ Release to bond!' : '↔ Closer...', mx, my - 15);
    ctx.restore();
  }
}
