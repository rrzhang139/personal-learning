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
   * Apply spring physics to ALL tracked bonds — so dragging one bonded
   * atom pulls its neighbors, whether from a Molecule or free-bonded.
   * @param {object|null} dragTarget — the currently dragged atom (skip it)
   */
  applySpringPhysics(dragTarget) {
    for (const bond of this.bonds) {
      const a = bond.atomA;
      const b = bond.atomB;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const target = (a.r + b.r) + 30;
      if (dist < 1) continue;
      const force = (dist - target) * 0.04;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (a !== dragTarget) { a.x += fx; a.y += fy; }
      if (b !== dragTarget) { b.x -= fx; b.y -= fy; }
    }
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
