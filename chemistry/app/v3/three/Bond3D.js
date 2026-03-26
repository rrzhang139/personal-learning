/**
 * 3D Bond: cylinder(s) + EN-biased shared electron cloud + shuttling electrons.
 *
 * The shared cloud is lopsided: center shifted toward the more EN atom,
 * and larger on that side. Shared electrons oscillate along the bond axis,
 * spending more time near the more EN atom.
 */
import * as THREE from 'three';

const BOND_COLORS = { 1: 0x00d4ff, 2: 0xff9800, 3: 0xef5350 };
const BOND_RADIUS = 0.035;
const CLOUD_COLOR = 0xffcc66;
const ELECTRON_COLOR = 0xfdd835;

export class Bond3D {
  constructor(atom3DA, atom3DB, order = 1) {
    this.atomA = atom3DA;
    this.atomB = atom3DB;
    this.order = order;
    this.group = new THREE.Group();
    this.showCloud = true;

    this._cylinders = [];
    this._sharedCloud = null;
    this._sharedElectrons = [];
    this._buildCylinders();
    this._buildSharedCloud();
    this._buildSharedElectrons();

    if (!atom3DA.bonds.includes(this)) atom3DA.bonds.push(this);
    if (!atom3DB.bonds.includes(this)) atom3DB.bonds.push(this);
  }

  /** EN bias: 0.5 = equal, >0.5 = toward atomB */
  get enBias() {
    const enA = this.atomA.element.EN || 2;
    const enB = this.atomB.element.EN || 2;
    return enB / (enA + enB);
  }

  _buildCylinders() {
    for (const c of this._cylinders) {
      this.group.remove(c); c.geometry.dispose(); c.material.dispose();
    }
    this._cylinders = [];
    const drawOrder = Math.ceil(this.order);
    const color = BOND_COLORS[drawOrder] || 0x00d4ff;
    for (let i = 0; i < drawOrder; i++) {
      const geo = new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, 1, 8);
      const mat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.5 });
      const cyl = new THREE.Mesh(geo, mat);
      this._cylinders.push(cyl);
      this.group.add(cyl);
    }
  }

  _buildSharedCloud() {
    // EN-biased shared electron cloud: ellipsoid shifted toward more EN atom
    const cloudGeo = new THREE.SphereGeometry(1, 24, 24);
    const cloudMat = new THREE.MeshPhongMaterial({
      color: CLOUD_COLOR,
      emissive: CLOUD_COLOR,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.12 + this.order * 0.04,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this._sharedCloud = new THREE.Mesh(cloudGeo, cloudMat);
    this.group.add(this._sharedCloud);
  }

  _buildSharedElectrons() {
    // Create 2 electrons per bond order (each bond = 1 shared pair = 2 electrons)
    const geo = new THREE.SphereGeometry(0.06, 10, 10);
    const count = Math.ceil(this.order) * 2;
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshPhongMaterial({
        color: ELECTRON_COLOR,
        emissive: ELECTRON_COLOR,
        emissiveIntensity: 1.0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = {
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.5,
        pairIndex: i % 2,   // 0 or 1 within the pair
        bondIndex: Math.floor(i / 2),
      };
      this._sharedElectrons.push(mesh);
      this.group.add(mesh);
    }
  }

  /** Call each frame */
  update(time) {
    const a = this.atomA.group.position;
    const b = this.atomB.group.position;
    const dir = new THREE.Vector3().subVectors(b, a);
    const length = dir.length();
    if (length < 0.01) return;
    dir.normalize();

    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);

    // Perpendicular for multi-bond offset
    const up = new THREE.Vector3(0, 1, 0);
    const perp = new THREE.Vector3().crossVectors(dir, up);
    if (perp.length() < 0.01) perp.crossVectors(dir, new THREE.Vector3(1, 0, 0));
    perp.normalize();

    // --- Cylinders ---
    const drawOrder = this._cylinders.length;
    const gap = drawOrder === 1 ? 0 : 0.08;
    for (let i = 0; i < drawOrder; i++) {
      const cyl = this._cylinders[i];
      const offset = (i - (drawOrder - 1) / 2) * gap * 2;
      cyl.position.copy(mid.clone().add(perp.clone().multiplyScalar(offset)));
      cyl.scale.y = Math.max(0.01, length - (this.atomA.radius + this.atomB.radius));
      cyl.setRotationFromQuaternion(
        new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
      );
    }

    // --- Shared electron cloud (EN-biased ellipsoid) ---
    if (this._sharedCloud) {
      this._sharedCloud.visible = this.showCloud;
      if (this.showCloud) {
        const bias = this.enBias; // 0.5 = center, >0.5 = toward B
        // Cloud center shifted toward more EN atom
        const cloudCenter = new THREE.Vector3().lerpVectors(a, b, bias);
        this._sharedCloud.position.copy(cloudCenter);

        // Scale: elongated along bond, wider on EN side
        const cloudLen = length * 0.4;
        const cloudWidth = 0.15 + this.order * 0.08;
        // Larger width on the more-EN side by scaling asymmetrically
        const enScale = 1 + Math.abs(bias - 0.5) * 1.5;

        this._sharedCloud.scale.set(cloudWidth * enScale, cloudWidth * enScale, cloudLen);
        this._sharedCloud.setRotationFromQuaternion(
          new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir)
        );

        // Pulse
        if (time !== undefined) {
          const pulse = 1 + Math.sin(time * 1.5) * 0.08;
          this._sharedCloud.scale.multiplyScalar(pulse);
        }
      }
    }

    // --- Shared electrons shuttling along bond ---
    if (time !== undefined) {
      const rA = this.atomA.radius + 0.05;
      const rB = this.atomB.radius + 0.05;
      const startPt = a.clone().add(dir.clone().multiplyScalar(rA));
      const endPt = b.clone().sub(dir.clone().multiplyScalar(rB));
      const enA = this.atomA.element.EN || 2;
      const enB = this.atomB.element.EN || 2;
      const k = enA / enB; // bias exponent

      const perp2 = new THREE.Vector3().crossVectors(dir, perp).normalize();

      for (const eMesh of this._sharedElectrons) {
        const { phase, speed, pairIndex, bondIndex } = eMesh.userData;
        const t = time * speed + phase;

        // Oscillate along bond, biased by EN
        const raw = (Math.sin(t * 1.0) + 1) / 2; // 0 to 1
        const biased = Math.pow(raw, k); // shifts toward B if B more EN

        const pos = new THREE.Vector3().lerpVectors(startPt, endPt, biased);

        // Perpendicular offset for pair separation + slight wobble
        const pOff = (pairIndex === 0 ? -1 : 1) * 0.06;
        const wobble = Math.sin(t * 2.5 + phase) * 0.04;
        pos.add(perp.clone().multiplyScalar(pOff + wobble));
        pos.add(perp2.clone().multiplyScalar(Math.sin(t * 1.8 + phase * 2) * 0.03));

        // Multi-bond offset
        if (drawOrder > 1) {
          const bOff = (bondIndex - (drawOrder - 1) / 2) * 0.12;
          pos.add(perp.clone().multiplyScalar(bOff));
        }

        eMesh.position.copy(pos);
        eMesh.visible = true;
      }
    }
  }

  setOrder(n) {
    this.order = n;
    this._buildCylinders();
    // Rebuild cloud and electrons for new order
    if (this._sharedCloud) { this.group.remove(this._sharedCloud); this._sharedCloud.geometry.dispose(); this._sharedCloud.material.dispose(); }
    for (const e of this._sharedElectrons) { this.group.remove(e); e.geometry.dispose(); e.material.dispose(); }
    this._sharedElectrons = [];
    this._buildSharedCloud();
    this._buildSharedElectrons();
  }

  destroy() {
    this.atomA.bonds = this.atomA.bonds.filter(b => b !== this);
    this.atomB.bonds = this.atomB.bonds.filter(b => b !== this);
    for (const c of this._cylinders) { c.geometry.dispose(); c.material.dispose(); }
    if (this._sharedCloud) { this._sharedCloud.geometry.dispose(); this._sharedCloud.material.dispose(); }
    for (const e of this._sharedElectrons) { e.geometry.dispose(); e.material.dispose(); }
  }
}
