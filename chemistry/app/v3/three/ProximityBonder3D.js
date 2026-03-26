/**
 * 3D proximity bonding: drag atoms near each other to bond.
 * VSEPR auto-rearranges after bonding. Rigid-body drag via delta tracking.
 */
import * as THREE from 'three';
import { Bond3D } from './Bond3D.js';
import { VSEPR } from '../core/VSEPR.js';

const SNAP_DIST = 2.5;
const BOND_DIST = 2.0;

export class ProximityBonder3D {
  constructor(scene, dragController, onBondCreated) {
    this.scene = scene;
    this.drag = dragController;
    this.onBondCreated = onBondCreated;
    this.atoms = [];
    this.bonds = [];
    this._nearPair = null;
    this._hintLine = null;

    dragController.onDragEnd = (atom3d) => this._onDrop(atom3d);
  }

  addAtom(atom3d) { if (!this.atoms.includes(atom3d)) this.atoms.push(atom3d); }
  addBond(bond3d) { if (!this.bonds.includes(bond3d)) this.bonds.push(bond3d); }
  clear() { this.atoms = []; this.bonds = []; this._nearPair = null; this._removeHint(); }

  _maxBonds(atom3d) {
    const ve = atom3d.element.valenceElectrons;
    if (atom3d.element.period === 1) return 1;
    return Math.min(ve, 8 - ve);
  }

  _currentBonds(atom3d) {
    let c = 0;
    for (const b of this.bonds) {
      if (b.atomA === atom3d || b.atomB === atom3d) c += b.order;
    }
    return c;
  }

  _areBonded(a, b) {
    return this.bonds.some(bond =>
      (bond.atomA === a && bond.atomB === b) || (bond.atomA === b && bond.atomB === a)
    );
  }

  /** Call each frame */
  update() {
    const dragging = this.drag.dragTarget;
    this._nearPair = null;

    // Clear all glows except hover
    for (const a of this.atoms) {
      if (a !== this.drag.hovered && a !== dragging) a.setGlow(false);
    }

    if (!dragging || !this.atoms.includes(dragging)) { this._removeHint(); return; }

    let closest = null, closestDist = Infinity;
    for (const atom of this.atoms) {
      if (atom === dragging) continue;
      const dist = dragging.group.position.distanceTo(atom.group.position);
      if (dist < SNAP_DIST && dist < closestDist) {
        if (!this._areBonded(dragging, atom) &&
            this._currentBonds(dragging) < this._maxBonds(dragging) &&
            this._currentBonds(atom) < this._maxBonds(atom)) {
          closest = atom;
          closestDist = dist;
        }
      }
    }

    if (closest) {
      this._nearPair = { dragged: dragging, target: closest, dist: closestDist };
      closest.setGlow(true);
      this._showHint(dragging.group.position, closest.group.position, closestDist);
    } else {
      this._removeHint();
    }
  }

  /** Rigid-body: translate all connected atoms by the drag delta */
  applyRigidBody() {
    const delta = this.drag.getDragDelta();
    if (!delta || delta.length() < 0.0001) return;
    const dragging = this.drag.dragTarget;
    if (!dragging) return;

    const cluster = this._findCluster(dragging);
    for (const atom of cluster) {
      if (atom === dragging) continue;
      atom.group.position.add(delta);
    }
  }

  _onDrop(atom3d) {
    if (!this._nearPair || this._nearPair.dragged !== atom3d) {
      this._removeHint();
      return;
    }
    const { dragged, target, dist } = this._nearPair;
    if (dist < BOND_DIST) {
      const bond = new Bond3D(dragged, target, 1);
      this.bonds.push(bond);
      this.scene.add(bond.group);
      this._arrangeVSEPR(dragged);
      if (this.onBondCreated) this.onBondCreated(bond);
    }
    for (const a of this.atoms) a.setGlow(false);
    this._nearPair = null;
    this._removeHint();
  }

  _arrangeVSEPR(startAtom) {
    const cluster = this._findCluster(startAtom);
    if (cluster.size <= 1) return;

    let central = null, maxBonds = 0;
    for (const atom of cluster) {
      const n = atom.bonds.filter(b => cluster.has(b.atomA) || cluster.has(b.atomB)).length;
      if (n > maxBonds) { maxBonds = n; central = atom; }
    }
    if (!central || maxBonds < 1) return;

    const terminals = [];
    const orders = [];
    for (const bond of central.bonds) {
      const other = bond.atomA === central ? bond.atomB : bond.atomA;
      if (cluster.has(other)) { terminals.push(other); orders.push(bond.order); }
    }

    const bondDomains = terminals.length;
    const bondingE = orders.reduce((s, o) => s + o, 0);
    const lp = VSEPR.lonePairs(central.element, bondingE);
    const cx = central.group.position;
    const { positions } = VSEPR.positionAtoms3D([cx.x, cx.y, cx.z], bondDomains, lp, 1.5);

    for (let i = 0; i < terminals.length; i++) {
      const p = positions[i];
      if (p) terminals[i].group.position.set(p[0], p[1], p[2]);
    }
  }

  _findCluster(start) {
    const visited = new Set();
    const queue = [start];
    while (queue.length) {
      const atom = queue.shift();
      if (visited.has(atom)) continue;
      visited.add(atom);
      for (const bond of atom.bonds) {
        const other = bond.atomA === atom ? bond.atomB : bond.atomA;
        if (this.atoms.includes(other) && !visited.has(other)) queue.push(other);
      }
    }
    return visited;
  }

  _showHint(posA, posB, dist) {
    this._removeHint();
    const geo = new THREE.BufferGeometry().setFromPoints([posA, posB]);
    const mat = new THREE.LineDashedMaterial({
      color: 0x4caf50, dashSize: 0.1, gapSize: 0.05,
      transparent: true, opacity: 1 - dist / SNAP_DIST,
    });
    this._hintLine = new THREE.Line(geo, mat);
    this._hintLine.computeLineDistances();
    this.scene.add(this._hintLine);
  }

  _removeHint() {
    if (this._hintLine) {
      this.scene.remove(this._hintLine);
      this._hintLine.geometry.dispose();
      this._hintLine.material.dispose();
      this._hintLine = null;
    }
  }
}
