/**
 * ProximityBonder: watches atom positions and auto-creates bonds
 * when atoms are dragged close together.
 *
 * - While dragging: atoms within snap distance glow
 * - On drop: if close enough, a bond forms between them
 * - Respects valence limits (H can only bond once, etc.)
 */
import { Bond } from './Bond.js';
import { VSEPR } from './VSEPR.js';

const SNAP_DISTANCE = 120;  // px to trigger glow
const BOND_DISTANCE = 100;  // px to actually bond on drop
const BOND_LENGTH = 65;     // px between bonded atoms

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

  /** Called when a drag ends. Creates bond if close enough, then rearranges via VSEPR. */
  _onDrop(obj) {
    if (!this._nearestPair || this._nearestPair.dragged !== obj) {
      for (const a of this.atoms) a._snapGlow = false;
      return;
    }

    const { dragged, target, dist } = this._nearestPair;

    if (dist < BOND_DISTANCE) {
      // Create the bond
      const bond = new Bond(dragged, target, 1);
      this.bonds.push(bond);
      this.stage.sceneGraph.add(bond);

      // After bond forms, rearrange the entire cluster into correct VSEPR geometry
      this._arrangeClusterVSEPR(dragged);

      if (this.onBondCreated) this.onBondCreated(bond);
    }

    for (const a of this.atoms) a._snapGlow = false;
    this._nearestPair = null;
  }

  /**
   * After a bond forms, find the central atom in the cluster and
   * rearrange all atoms into the correct VSEPR geometry with tweened animation.
   */
  _arrangeClusterVSEPR(startAtom) {
    const cluster = this._findCluster(startAtom);
    if (cluster.size <= 1) return;

    // Find the central atom: the one with the most bonds
    let central = null;
    let maxBonds = 0;
    for (const atom of cluster) {
      // Only count bonds within this cluster
      const clusterBonds = atom.bonds.filter(b => {
        const other = b.atomA === atom ? b.atomB : b.atomA;
        return cluster.has(other);
      });
      if (clusterBonds.length > maxBonds) {
        maxBonds = clusterBonds.length;
        central = atom;
      }
    }

    if (!central || maxBonds < 1) return;

    // Get the terminal atoms bonded to central (within cluster)
    const terminals = [];
    const bondOrders = [];
    for (const bond of central.bonds) {
      const other = bond.atomA === central ? bond.atomB : bond.atomA;
      if (cluster.has(other)) {
        terminals.push(other);
        bondOrders.push(bond.order);
      }
    }

    if (terminals.length === 0) return;

    // Count electron domains for VSEPR
    const bondDomains = terminals.length;
    const bondingElectrons = bondOrders.reduce((s, o) => s + o, 0);
    const lonePairCount = VSEPR.lonePairs(central.element, bondingElectrons);

    // Get VSEPR positions
    const { positions } = VSEPR.positionAtoms(
      central.x, central.y, bondDomains, lonePairCount, BOND_LENGTH
    );

    // Tween central atom stays in place, terminals move to VSEPR positions
    for (let i = 0; i < terminals.length; i++) {
      const pos = positions[i];
      if (pos) {
        this.stage.tweener.tween(terminals[i], {
          x: pos.x, y: pos.y,
        }, 500, 'easeOutCubic');
      }
    }

    // Reassign electron states after rearrangement
    setTimeout(() => {
      for (const atom of cluster) {
        atom.assignElectronStates();
      }
    }, 100);
  }

  /**
   * Rigid-body molecule dragging.
   *
   * Dead simple approach: track how much the dragged atom moved
   * this frame (delta), and translate every connected atom by the
   * same delta. This perfectly preserves all angles and distances.
   */
  applyRigidBody(dragTarget) {
    if (!dragTarget || !this.atoms.includes(dragTarget)) {
      this._prevDragPos = null;
      return;
    }

    // First frame of drag: just record position, don't move anything
    if (!this._prevDragPos) {
      this._prevDragPos = { x: dragTarget.x, y: dragTarget.y };
      return;
    }

    // Compute delta from last frame
    const dx = dragTarget.x - this._prevDragPos.x;
    const dy = dragTarget.y - this._prevDragPos.y;
    this._prevDragPos = { x: dragTarget.x, y: dragTarget.y };

    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return;

    // Find all atoms connected to dragTarget
    const cluster = this._findCluster(dragTarget);

    // Translate every other atom in the cluster by the same delta
    for (const atom of cluster) {
      if (atom === dragTarget) continue;
      atom.x += dx;
      atom.y += dy;
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
