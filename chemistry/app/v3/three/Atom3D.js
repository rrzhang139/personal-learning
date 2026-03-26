/**
 * 3D Atom: sphere mesh + label sprite + orbital shapes + electron particles + cloud.
 * Does NOT extend Renderable — this is a Three.js wrapper.
 */
import * as THREE from 'three';
import { ElectronConfig } from '../orbitals/ElectronConfig.js';
import { OrbitalMeshFactory } from './OrbitalMeshFactory.js';

const ELECTRON_COLOR = 0xfdd835;

export class Atom3D {
  constructor(element, position = [0, 0, 0]) {
    this.element = element;
    this.group = new THREE.Group();
    this.group.position.set(...position);
    this.group.userData.atom3d = this; // back-reference for raycasting

    // Main sphere
    const r = element.radius / 50; // scale to 3D units
    this.radius = r;
    const geo = new THREE.SphereGeometry(r, 32, 32);
    this.material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(element.color),
      emissive: 0x000000,
      shininess: 60,
    });
    this.sphere = new THREE.Mesh(geo, this.material);
    this.group.add(this.sphere);

    // Label sprite
    this.label = this._createLabel(element.symbol);
    this.group.add(this.label);

    // Cloud (transparent sphere, EN-weighted)
    this.cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(r * 2.5, 24, 24),
      new THREE.MeshPhongMaterial({
        color: new THREE.Color(element.color),
        transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false,
      })
    );
    this.group.add(this.cloudMesh);

    // Orbital shapes group
    this.orbitalGroup = new THREE.Group();
    this.group.add(this.orbitalGroup);
    this._electronConfig = ElectronConfig.build(element.Z);
    this._buildOrbitals();

    // Electron particles
    this.electronMeshes = [];
    this._electronData = [];
    this._buildElectrons();

    // State
    this.bonds = [];
    this.cloudVisible = true;
    this.electronsVisible = true;
    this.orbitalsVisible = false;
    this.orbitalFilter = { s: true, p: true, d: true, f: true };

    this._updateVisibility();
  }

  get position() { return this.group.position; }
  set position(v) { this.group.position.copy(v); }

  setGlow(on) {
    this.material.emissive.set(on ? 0x004400 : 0x000000);
    this.material.emissiveIntensity = on ? 0.8 : 0;
  }

  _createLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.5, 0.5, 1);
    sprite.position.y = this.radius + 0.35;
    return sprite;
  }

  _buildOrbitals() {
    this.orbitalGroup.clear();
    for (const sub of this._electronConfig) {
      const size = 0.4 + sub.n * 0.45;
      for (let i = 0; i < sub.orbitals.length; i++) {
        const orb = sub.orbitals[i];
        const eCount = (orb.spinUp ? 1 : 0) + (orb.spinDown ? 1 : 0);
        let mesh;
        switch (sub.type) {
          case 's': mesh = OrbitalMeshFactory.createS(size * 0.45); break;
          case 'p': mesh = OrbitalMeshFactory.createP(size, i % 3); break;
          case 'd': mesh = OrbitalMeshFactory.createD(size, i % 5); break;
          case 'f': mesh = OrbitalMeshFactory.createF(size, i); break;
        }
        if (mesh) {
          mesh.userData = { type: sub.type, n: sub.n, eCount };
          // Dim empty orbitals
          mesh.traverse(child => {
            if (child.material) {
              child.material.opacity *= (eCount === 0 ? 0.1 : eCount === 1 ? 0.6 : 1.0);
            }
          });
          this.orbitalGroup.add(mesh);
        }
      }
    }
  }

  _buildElectrons() {
    const geo = new THREE.SphereGeometry(0.06, 12, 12);
    for (const sub of this._electronConfig) {
      for (let i = 0; i < sub.orbitals.length; i++) {
        const orb = sub.orbitals[i];
        const eArr = [];
        if (orb.spinUp) eArr.push(0);
        if (orb.spinDown) eArr.push(Math.PI);
        for (const phaseOff of eArr) {
          const mat = new THREE.MeshPhongMaterial({
            color: ELECTRON_COLOR, emissive: ELECTRON_COLOR, emissiveIntensity: 0.8,
          });
          const mesh = new THREE.Mesh(geo, mat);
          this.group.add(mesh);
          this.electronMeshes.push(mesh);
          this._electronData.push({
            mesh, type: sub.type, n: sub.n, orbIndex: i,
            phase: Math.random() * Math.PI * 2 + phaseOff,
            speed: 0.8 + Math.random() * 0.6,
          });
        }
      }
    }
  }

  /** Call each frame to animate electrons */
  updateElectrons(time) {
    for (const e of this._electronData) {
      const t = time * e.speed + e.phase;
      const size = 0.4 + e.n * 0.45;
      const visible = this.electronsVisible && (this.orbitalFilter?.[e.type] ?? true);
      e.mesh.visible = visible;
      if (!visible) continue;

      if (e.type === 's') {
        const r = size * 0.25;
        e.mesh.position.set(Math.cos(t * 1.3) * r, Math.sin(t * 0.9) * r, Math.cos(t * 0.7) * r);
      } else if (e.type === 'p') {
        const axis = e.orbIndex % 3;
        const along = Math.sin(t * 0.6) * size * 0.5;
        const wobble = Math.sin(t * 1.8) * size * 0.06;
        if (axis === 0) e.mesh.position.set(along, wobble, 0);
        else if (axis === 1) e.mesh.position.set(wobble, along, 0);
        else e.mesh.position.set(0, wobble, along);
      } else if (e.type === 'd') {
        const r = size * 0.3;
        const lobe = Math.floor((Math.sin(t * 0.3) + 1) * 2) % 4;
        const angle = lobe * Math.PI / 2 + e.orbIndex * 0.5;
        e.mesh.position.set(
          Math.cos(angle) * r * Math.abs(Math.sin(t * 0.5)),
          Math.sin(angle) * r * Math.abs(Math.sin(t * 0.5)),
          Math.sin(t * 0.4) * r * 0.3,
        );
      } else {
        const r = size * 0.2;
        e.mesh.position.set(
          Math.cos(t * 0.8 + e.orbIndex) * r,
          Math.sin(t * 0.6 + e.orbIndex) * r,
          Math.cos(t * 0.4) * r,
        );
      }
    }
  }

  _updateVisibility() {
    this.cloudMesh.visible = this.cloudVisible && !this.orbitalsVisible;
    this.orbitalGroup.visible = this.orbitalsVisible;
    if (this.orbitalsVisible) {
      this.orbitalGroup.traverse(child => {
        if (child.userData?.type) {
          child.visible = this.orbitalFilter?.[child.userData.type] ?? true;
        }
      });
    }
  }

  /** Call after changing visibility flags */
  refresh() { this._updateVisibility(); }

  dispose() {
    this.group.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  }
}
