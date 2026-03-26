/**
 * Factory for 3D orbital meshes (s, p, d, f).
 * Returns THREE.Group or THREE.Mesh for each orbital type.
 */
import * as THREE from 'three';

const P_COLORS = [0xff4444, 0x44ff44, 0x4488ff]; // px=red, py=green, pz=blue
const S_COLOR = 0x00e5ff;
const D_COLOR = 0x4caf50;
const F_COLOR = 0xbb86fc;

function lobeMesh(length, width, color, opacity = 0.3) {
  const geo = new THREE.SphereGeometry(width, 20, 20);
  geo.scale(1, 1, length / width);
  const mat = new THREE.MeshPhongMaterial({
    color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false,
  });
  return new THREE.Mesh(geo, mat);
}

export class OrbitalMeshFactory {
  /** s orbital: transparent sphere */
  static createS(radius, color = S_COLOR) {
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshPhongMaterial({
      color, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false,
    });
    return new THREE.Mesh(geo, mat);
  }

  /** p orbital: two lobes along an axis (0=x, 1=y, 2=z) */
  static createP(size, axisIndex) {
    const group = new THREE.Group();
    const lobeLen = size * 0.7;
    const lobeW = size * 0.28;
    const color = P_COLORS[axisIndex % 3];

    const lobe1 = lobeMesh(lobeLen, lobeW, color);
    const lobe2 = lobeMesh(lobeLen, lobeW, color);

    const offset = lobeLen * 0.5;
    if (axisIndex === 0) {
      lobe1.position.x = offset; lobe2.position.x = -offset;
      lobe1.rotation.y = Math.PI / 2; lobe2.rotation.y = Math.PI / 2;
    } else if (axisIndex === 1) {
      lobe1.position.y = offset; lobe2.position.y = -offset;
      lobe1.rotation.x = Math.PI / 2; lobe2.rotation.x = Math.PI / 2;
    } else {
      lobe1.position.z = offset; lobe2.position.z = -offset;
    }

    group.add(lobe1, lobe2);
    return group;
  }

  /** d orbital: cloverleaf (variants 0-3) or dz2 (variant 4) */
  static createD(size, variant) {
    const group = new THREE.Group();
    const lobeLen = size * 0.5;
    const lobeW = size * 0.18;

    if (variant < 4) {
      for (let i = 0; i < 4; i++) {
        const lobe = lobeMesh(lobeLen, lobeW, D_COLOR, 0.25);
        const angle = (i / 4) * Math.PI * 2 + variant * Math.PI / 8;
        const offset = lobeLen * 0.4;
        if (variant <= 1) {
          lobe.position.x = Math.cos(angle) * offset;
          lobe.position.y = Math.sin(angle) * offset;
          lobe.rotation.z = angle;
        } else if (variant === 2) {
          lobe.position.x = Math.cos(angle) * offset;
          lobe.position.z = Math.sin(angle) * offset;
          lobe.rotation.y = -angle;
        } else {
          lobe.position.y = Math.cos(angle) * offset;
          lobe.position.z = Math.sin(angle) * offset;
          lobe.rotation.x = angle;
        }
        group.add(lobe);
      }
    } else {
      // dz2: torus + z-axis lobes
      const torusGeo = new THREE.TorusGeometry(size * 0.35, size * 0.07, 16, 48);
      const torusMat = new THREE.MeshPhongMaterial({
        color: D_COLOR, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2;
      const l1 = lobeMesh(lobeLen * 0.7, lobeW, D_COLOR, 0.25);
      l1.position.z = lobeLen * 0.35;
      const l2 = lobeMesh(lobeLen * 0.7, lobeW, D_COLOR, 0.25);
      l2.position.z = -lobeLen * 0.35;
      group.add(torus, l1, l2);
    }
    return group;
  }

  /** f orbital (simplified): small multi-lobe cluster */
  static createF(size, variant) {
    const group = new THREE.Group();
    const count = variant < 4 ? 6 : 8;
    for (let i = 0; i < count; i++) {
      const lobe = lobeMesh(size * 0.3, size * 0.1, F_COLOR, 0.2);
      const phi = (i / count) * Math.PI * 2 + variant * 0.3;
      const theta = Math.PI / 3 + (i % 2) * Math.PI / 3;
      lobe.position.set(
        Math.sin(theta) * Math.cos(phi) * size * 0.35,
        Math.sin(theta) * Math.sin(phi) * size * 0.35,
        Math.cos(theta) * size * 0.35,
      );
      group.add(lobe);
    }
    return group;
  }
}
