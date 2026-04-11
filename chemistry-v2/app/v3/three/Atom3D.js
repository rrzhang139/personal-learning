/**
 * 3D Atom: vivid sphere + label + cloud + orbital shapes + electrons.
 * Electrons orbit OUTSIDE the atom core. Cloud is clearly visible.
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
    this.group.userData.atom3d = this;

    // Scale: element radius (px) → 3D units
    const r = element.radius / 50;
    this.radius = r;

    // Main sphere — vivid color with slight self-glow
    const color = new THREE.Color(element.color);
    const geo = new THREE.SphereGeometry(r, 32, 32);
    this.material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.15),
      emissiveIntensity: 1,
      shininess: 80,
      specular: 0x444444,
    });
    this.sphere = new THREE.Mesh(geo, this.material);
    this.group.add(this.sphere);

    // Label sprite (always faces camera)
    this.label = this._createLabel(element.symbol);
    this.group.add(this.label);

    // Cloud — clearly visible, EN-weighted size
    const cloudR = r * 3.0;
    this._cloudRadius = cloudR;
    this.cloudMesh = this._createCloud(cloudR, color);
    this.group.add(this.cloudMesh);

    // Orbital shapes
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
    this.selected = false;
    this.dimmed = false;

    this._updateVisibility();
  }

  get position() { return this.group.position; }
  set position(v) { this.group.position.copy(v); }

  setGlow(on) {
    const c = new THREE.Color(this.element.color);
    if (on) {
      this.material.emissive.set(0x22ff44);
      this.material.emissiveIntensity = 0.6;
    } else {
      this.material.emissive.copy(c.clone().multiplyScalar(0.15));
      this.material.emissiveIntensity = 1;
    }
  }

  setSelected(on) {
    this.selected = on;
    if (on) {
      this.material.emissive.set(0x00aaff);
      this.material.emissiveIntensity = 0.8;
    } else {
      this.setGlow(false);
    }
  }

  setDimmed(on) {
    this.dimmed = on;
    this.sphere.material.opacity = on ? 0.3 : 1.0;
    this.sphere.material.transparent = on;
    this.label.material.opacity = on ? 0.3 : 1.0;
  }

  _createLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.6, 0.6, 1);
    sprite.position.y = this.radius + 0.4;
    return sprite;
  }

  _createCloud(cloudR, baseColor) {
    // Multi-layer cloud for a soft glow effect
    const group = new THREE.Group();

    // Inner glow (brighter)
    const innerGeo = new THREE.SphereGeometry(cloudR * 0.6, 24, 24);
    const innerMat = new THREE.MeshPhongMaterial({
      color: baseColor.clone(),
      transparent: true, opacity: 0.2,
      side: THREE.DoubleSide, depthWrite: false,
      emissive: baseColor.clone().multiplyScalar(0.3),
      emissiveIntensity: 1,
    });
    group.add(new THREE.Mesh(innerGeo, innerMat));

    // Outer glow (softer)
    const outerGeo = new THREE.SphereGeometry(cloudR, 24, 24);
    const outerMat = new THREE.MeshPhongMaterial({
      color: baseColor.clone(),
      transparent: true, opacity: 0.1,
      side: THREE.DoubleSide, depthWrite: false,
      emissive: baseColor.clone().multiplyScalar(0.15),
      emissiveIntensity: 1,
    });
    group.add(new THREE.Mesh(outerGeo, outerMat));

    return group;
  }

  _buildOrbitals() {
    this.orbitalGroup.clear();
    for (const sub of this._electronConfig) {
      const size = 0.4 + sub.n * 0.5;
      for (let i = 0; i < sub.orbitals.length; i++) {
        const orb = sub.orbitals[i];
        const eCount = (orb.spinUp ? 1 : 0) + (orb.spinDown ? 1 : 0);
        let mesh;
        switch (sub.type) {
          case 's': mesh = OrbitalMeshFactory.createS(size * 0.5); break;
          case 'p': mesh = OrbitalMeshFactory.createP(size, i % 3); break;
          case 'd': mesh = OrbitalMeshFactory.createD(size, i % 5); break;
          case 'f': mesh = OrbitalMeshFactory.createF(size, i); break;
        }
        if (mesh) {
          mesh.userData = { type: sub.type, n: sub.n, eCount };
          mesh.traverse(child => {
            if (child.material) {
              child.material.opacity *= (eCount === 0 ? 0.08 : eCount === 1 ? 0.5 : 1.0);
            }
          });
          this.orbitalGroup.add(mesh);
        }
      }
    }
  }

  _buildElectrons() {
    const geo = new THREE.SphereGeometry(0.07, 12, 12);
    for (const sub of this._electronConfig) {
      for (let i = 0; i < sub.orbitals.length; i++) {
        const orb = sub.orbitals[i];
        const eArr = [];
        if (orb.spinUp) eArr.push(0);
        if (orb.spinDown) eArr.push(Math.PI);
        for (const phaseOff of eArr) {
          const mat = new THREE.MeshPhongMaterial({
            color: ELECTRON_COLOR,
            emissive: ELECTRON_COLOR,
            emissiveIntensity: 1.2,
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

  /** Animate electrons OUTSIDE the atom core */
  updateElectrons(time) {
    const coreR = this.radius + 0.1; // minimum distance from center

    for (const e of this._electronData) {
      const t = time * e.speed + e.phase;
      const size = 0.4 + e.n * 0.5;
      const visible = this.electronsVisible && (this.orbitalFilter?.[e.type] ?? true);
      e.mesh.visible = visible && !this.dimmed;
      if (!visible) continue;

      // Base orbit radius — always outside the atom sphere
      const orbitR = Math.max(size * 0.5, coreR + 0.05 + (e.n - 1) * 0.15);

      let px, py, pz;

      if (e.type === 's') {
        // Orbit on a tilted circle outside the core
        const tilt = e.phase * 0.5;
        px = Math.cos(t * 1.1) * orbitR * 0.8;
        py = Math.sin(t * 1.1) * Math.cos(tilt) * orbitR * 0.8;
        pz = Math.sin(t * 1.1) * Math.sin(tilt) * orbitR * 0.8;
      } else if (e.type === 'p') {
        // Oscillate along dumbbell axis, staying outside core
        const axis = e.orbIndex % 3;
        const along = Math.sin(t * 0.7) * size * 0.6;
        const sign = along >= 0 ? 1 : -1;
        const clampedAlong = sign * Math.max(Math.abs(along), coreR);
        const wobble = Math.sin(t * 2.0 + e.phase) * size * 0.08;
        if (axis === 0) { px = clampedAlong; py = wobble; pz = 0; }
        else if (axis === 1) { px = wobble; py = clampedAlong; pz = 0; }
        else { px = 0; py = wobble; pz = clampedAlong; }
      } else if (e.type === 'd') {
        const r = Math.max(size * 0.35, coreR);
        const lobe = Math.floor((Math.sin(t * 0.35) + 1) * 2) % 4;
        const angle = lobe * Math.PI / 2 + e.orbIndex * 0.5;
        const extent = Math.abs(Math.sin(t * 0.5));
        px = Math.cos(angle) * r * Math.max(extent, 0.3);
        py = Math.sin(angle) * r * Math.max(extent, 0.3);
        pz = Math.sin(t * 0.4) * r * 0.3;
      } else {
        const r = Math.max(size * 0.25, coreR);
        px = Math.cos(t * 0.8 + e.orbIndex) * r;
        py = Math.sin(t * 0.6 + e.orbIndex) * r;
        pz = Math.cos(t * 0.4) * r;
      }

      e.mesh.position.set(px, py, pz);
    }

    // Pulse cloud
    if (this.cloudMesh.visible) {
      const pulse = 1 + Math.sin(time * 1.5) * 0.05;
      this.cloudMesh.scale.setScalar(pulse);
    }
  }

  _updateVisibility() {
    this.cloudMesh.visible = this.cloudVisible && !this.orbitalsVisible && !this.dimmed;
    this.orbitalGroup.visible = this.orbitalsVisible && !this.dimmed;
    if (this.orbitalsVisible) {
      this.orbitalGroup.traverse(child => {
        if (child.userData?.type) {
          child.visible = this.orbitalFilter?.[child.userData.type] ?? true;
        }
      });
    }
    for (const em of this.electronMeshes) {
      em.visible = this.electronsVisible && !this.dimmed;
    }
  }

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
