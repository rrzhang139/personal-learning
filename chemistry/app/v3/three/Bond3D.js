/**
 * 3D Bond: cylinder mesh between two Atom3D instances.
 * Updates position each frame to follow atoms.
 */
import * as THREE from 'three';

const BOND_COLORS = { 1: 0x00d4ff, 2: 0xff9800, 3: 0xef5350 };
const BOND_RADIUS = 0.04;

export class Bond3D {
  constructor(atom3DA, atom3DB, order = 1) {
    this.atomA = atom3DA;
    this.atomB = atom3DB;
    this.order = order;
    this.group = new THREE.Group();

    this._cylinders = [];
    this._buildCylinders();

    // Register on atoms
    if (!atom3DA.bonds.includes(this)) atom3DA.bonds.push(this);
    if (!atom3DB.bonds.includes(this)) atom3DB.bonds.push(this);
  }

  _buildCylinders() {
    for (const c of this._cylinders) {
      this.group.remove(c);
      c.geometry.dispose();
      c.material.dispose();
    }
    this._cylinders = [];

    const drawOrder = Math.ceil(this.order);
    const color = BOND_COLORS[drawOrder] || 0x00d4ff;
    const gap = drawOrder === 1 ? 0 : 0.08;

    for (let i = 0; i < drawOrder; i++) {
      const geo = new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, 1, 8);
      const mat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.7 });
      const cyl = new THREE.Mesh(geo, mat);
      cyl.userData.offsetIndex = i;
      cyl.userData.offsetTotal = drawOrder;
      this._cylinders.push(cyl);
      this.group.add(cyl);
    }
  }

  /** Call each frame to reposition cylinders between atoms */
  update() {
    const a = this.atomA.group.position;
    const b = this.atomB.group.position;
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(b, a);
    const length = dir.length();
    dir.normalize();

    // Perpendicular vector for multi-bond offset
    const up = new THREE.Vector3(0, 1, 0);
    const perp = new THREE.Vector3().crossVectors(dir, up);
    if (perp.length() < 0.01) perp.crossVectors(dir, new THREE.Vector3(1, 0, 0));
    perp.normalize();

    const drawOrder = this._cylinders.length;
    const gap = drawOrder === 1 ? 0 : 0.08;

    for (let i = 0; i < drawOrder; i++) {
      const cyl = this._cylinders[i];
      const offset = (i - (drawOrder - 1) / 2) * gap * 2;
      const pos = mid.clone().add(perp.clone().multiplyScalar(offset));

      cyl.position.copy(pos);
      cyl.scale.y = length - (this.atomA.radius + this.atomB.radius);

      // Orient cylinder along bond axis
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0), dir
      );
      cyl.setRotationFromQuaternion(quat);
    }
  }

  setOrder(n) {
    this.order = n;
    this._buildCylinders();
  }

  destroy() {
    this.atomA.bonds = this.atomA.bonds.filter(b => b !== this);
    this.atomB.bonds = this.atomB.bonds.filter(b => b !== this);
    for (const c of this._cylinders) {
      c.geometry.dispose(); c.material.dispose();
    }
  }
}
