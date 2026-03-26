/**
 * 3D Orbital Viewer using Three.js
 *
 * Shows s, p, d orbital shapes in true 3D.
 * All three p dumbbells are clearly visible (px red, py green, pz blue).
 * Electrons orbit within their orbital shapes.
 * Rotate with mouse drag, zoom with scroll.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ElectronConfig } from './orbitals/ElectronConfig.js';

// --- Colors ---
const COLORS = {
  s: 0x00e5ff,  // cyan
  p: 0xff9800,  // orange
  d: 0x4caf50,  // green
  f: 0xbb86fc,  // purple
};
const P_AXIS_COLORS = [0xff4444, 0x44ff44, 0x4488ff]; // px=red, py=green, pz=blue
const ELECTRON_COLOR = 0xfdd835;
const BG = 0x0a0a1a;

// --- State ---
let currentZ = 8;
let filters = { s: true, p: true, d: true, f: true };
let showAxes = true;
let showShells = false;
let showElectrons = true;

// --- Three.js setup ---
const container = document.getElementById('container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(BG);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / (window.innerHeight - 50), 0.1, 1000);
camera.position.set(4, 3, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight - 50);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// --- Lighting ---
scene.add(new THREE.AmbientLight(0x404060, 1.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);
const backLight = new THREE.DirectionalLight(0x4466ff, 0.4);
backLight.position.set(-3, -2, -4);
scene.add(backLight);

// --- Groups ---
const orbitalGroup = new THREE.Group();
scene.add(orbitalGroup);
const electronGroup = new THREE.Group();
scene.add(electronGroup);
const axesGroup = new THREE.Group();
scene.add(axesGroup);
const shellGroup = new THREE.Group();
scene.add(shellGroup);

// --- Nucleus ---
const nucleusGeo = new THREE.SphereGeometry(0.15, 32, 32);
const nucleusMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x224466 });
const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
scene.add(nucleus);

// --- Axes ---
function buildAxes() {
  axesGroup.clear();
  const len = 4;
  const colors = [0xff4444, 0x44ff44, 0x4488ff];
  const labels = ['x', 'y', 'z'];
  const dirs = [new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1)];

  for (let i = 0; i < 3; i++) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0,0,0), dirs[i].clone().multiplyScalar(len)
    ]);
    const mat = new THREE.LineBasicMaterial({ color: colors[i], transparent: true, opacity: 0.3 });
    axesGroup.add(new THREE.Line(geo, mat));

    // Negative axis (dashed feel via shorter line)
    const geoNeg = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0,0,0), dirs[i].clone().multiplyScalar(-len)
    ]);
    const matNeg = new THREE.LineBasicMaterial({ color: colors[i], transparent: true, opacity: 0.15 });
    axesGroup.add(new THREE.Line(geoNeg, matNeg));
  }
}
buildAxes();

// --- Orbital shape builders ---

function createSLobe(radius, color) {
  const geo = new THREE.SphereGeometry(radius, 32, 32);
  const mat = new THREE.MeshPhongMaterial({
    color, transparent: true, opacity: 0.2,
    side: THREE.DoubleSide, depthWrite: false,
  });
  return new THREE.Mesh(geo, mat);
}

function createPLobe(length, width, color) {
  // One lobe = elongated sphere (scaled)
  const geo = new THREE.SphereGeometry(width, 24, 24);
  geo.scale(1, 1, length / width); // stretch along z
  const mat = new THREE.MeshPhongMaterial({
    color, transparent: true, opacity: 0.35,
    side: THREE.DoubleSide, depthWrite: false,
  });
  return new THREE.Mesh(geo, mat);
}

function createPOrbital(size, axisIndex, n) {
  // Two lobes along the axis
  const group = new THREE.Group();
  const lobeLen = size * 0.7;
  const lobeW = size * 0.3;
  const color = P_AXIS_COLORS[axisIndex];

  const lobe1 = createPLobe(lobeLen, lobeW, color);
  const lobe2 = createPLobe(lobeLen, lobeW, color);

  // Position along the appropriate axis
  if (axisIndex === 0) { // px
    lobe1.position.x = lobeLen * 0.5;
    lobe2.position.x = -lobeLen * 0.5;
    lobe1.rotation.y = Math.PI / 2;
    lobe2.rotation.y = Math.PI / 2;
  } else if (axisIndex === 1) { // py
    lobe1.position.y = lobeLen * 0.5;
    lobe2.position.y = -lobeLen * 0.5;
    lobe1.rotation.x = Math.PI / 2;
    lobe2.rotation.x = Math.PI / 2;
  } else { // pz
    lobe1.position.z = lobeLen * 0.5;
    lobe2.position.z = -lobeLen * 0.5;
  }

  group.add(lobe1, lobe2);
  return group;
}

function createDOrbital(size, variant) {
  const group = new THREE.Group();
  const lobeLen = size * 0.5;
  const lobeW = size * 0.2;

  if (variant < 4) {
    // Cloverleaf: 4 lobes
    for (let i = 0; i < 4; i++) {
      const lobe = createPLobe(lobeLen, lobeW, COLORS.d);
      const angle = (i / 4) * Math.PI * 2 + (variant * Math.PI / 8);
      if (variant === 0) { // dxy
        lobe.position.x = Math.cos(angle) * lobeLen * 0.5;
        lobe.position.y = Math.sin(angle) * lobeLen * 0.5;
        lobe.rotation.z = angle;
      } else if (variant === 1) { // dx2-y2
        lobe.position.x = Math.cos(angle) * lobeLen * 0.5;
        lobe.position.y = Math.sin(angle) * lobeLen * 0.5;
        lobe.rotation.z = angle;
      } else if (variant === 2) { // dxz
        lobe.position.x = Math.cos(angle) * lobeLen * 0.5;
        lobe.position.z = Math.sin(angle) * lobeLen * 0.5;
        lobe.rotation.y = -angle;
      } else { // dyz
        lobe.position.y = Math.cos(angle) * lobeLen * 0.5;
        lobe.position.z = Math.sin(angle) * lobeLen * 0.5;
        lobe.rotation.x = angle;
      }
      group.add(lobe);
    }
  } else {
    // dz2: torus + dumbbell along z
    const torusGeo = new THREE.TorusGeometry(size * 0.4, size * 0.08, 16, 48);
    const torusMat = new THREE.MeshPhongMaterial({
      color: COLORS.d, transparent: true, opacity: 0.25,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 2; // lie flat in xz plane

    const lobe1 = createPLobe(lobeLen * 0.8, lobeW, COLORS.d);
    lobe1.position.z = lobeLen * 0.4;
    const lobe2 = createPLobe(lobeLen * 0.8, lobeW, COLORS.d);
    lobe2.position.z = -lobeLen * 0.4;

    group.add(torus, lobe1, lobe2);
  }
  return group;
}

// --- Electron particle ---
const electronGeo = new THREE.SphereGeometry(0.06, 16, 16);
const electronMat = new THREE.MeshPhongMaterial({
  color: ELECTRON_COLOR, emissive: ELECTRON_COLOR, emissiveIntensity: 0.8,
});

const electronData = []; // { mesh, orbitalType, n, orbIndex, phase, speed }

function createElectron(orbType, n, orbIndex) {
  const mesh = new THREE.Mesh(electronGeo, electronMat.clone());
  const data = {
    mesh, orbitalType: orbType, n, orbIndex,
    phase: Math.random() * Math.PI * 2,
    speed: 0.8 + Math.random() * 0.6,
  };
  electronData.push(data);
  electronGroup.add(mesh);
  return data;
}

// --- Build orbitals for element Z ---
function buildOrbitals(Z) {
  orbitalGroup.clear();
  electronGroup.clear();
  electronData.length = 0;
  shellGroup.clear();

  const config = ElectronConfig.build(Z);

  for (const sub of config) {
    const { n, type, orbitals } = sub;
    const size = 0.5 + n * 0.6; // 3D units

    for (let i = 0; i < orbitals.length; i++) {
      const orb = orbitals[i];
      const eCount = (orb.spinUp ? 1 : 0) + (orb.spinDown ? 1 : 0);
      let mesh;

      switch (type) {
        case 's':
          mesh = createSLobe(size * 0.5, COLORS.s);
          mesh.userData = { type: 's', n };
          orbitalGroup.add(mesh);
          break;
        case 'p':
          mesh = createPOrbital(size, i % 3, n);
          mesh.userData = { type: 'p', n };
          orbitalGroup.add(mesh);
          break;
        case 'd':
          mesh = createDOrbital(size, i % 5);
          mesh.userData = { type: 'd', n };
          orbitalGroup.add(mesh);
          break;
        case 'f':
          // Simplified: small sphere cluster
          mesh = createSLobe(size * 0.35, COLORS.f);
          mesh.rotation.set(i * 0.5, i * 0.7, i * 0.3);
          mesh.userData = { type: 'f', n };
          orbitalGroup.add(mesh);
          break;
      }

      // Create electrons
      if (orb.spinUp) createElectron(type, n, i);
      if (orb.spinDown) createElectron(type, n, i);
    }
  }

  // Shell rings
  for (const [n] of ElectronConfig.byShell(Z)) {
    const r = 0.5 + n * 0.6;
    const ringGeo = new THREE.RingGeometry(r - 0.01, r + 0.01, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.08, side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.userData = { n };
    shellGroup.add(ring);
    // Second ring perpendicular
    const ring2 = ring.clone();
    ring2.rotation.x = Math.PI / 2;
    shellGroup.add(ring2);
  }

  updateFilters();

  // Update info
  document.getElementById('info').textContent =
    `${ElectronConfig.notation(Z)} — Drag to rotate · Scroll to zoom`;
}

// --- Filter visibility ---
function updateFilters() {
  orbitalGroup.traverse(child => {
    if (child.userData?.type) {
      child.visible = filters[child.userData.type] ?? true;
    }
  });
  axesGroup.visible = showAxes;
  shellGroup.visible = showShells;
  electronGroup.visible = showElectrons;
}

// --- Animate electrons ---
function animateElectrons(time) {
  for (const e of electronData) {
    if (!filters[e.orbitalType]) { e.mesh.visible = false; continue; }
    e.mesh.visible = showElectrons;
    if (!showElectrons) continue;

    const t = time * e.speed + e.phase;
    const size = 0.5 + e.n * 0.6;

    if (e.orbitalType === 's') {
      const r = size * 0.3;
      e.mesh.position.set(
        Math.cos(t * 1.3) * r * 0.5,
        Math.sin(t * 0.9) * r * 0.5,
        Math.cos(t * 0.7 + 1) * r * 0.5,
      );
    } else if (e.orbitalType === 'p') {
      const axis = e.orbIndex % 3;
      const along = Math.sin(t * 0.6) * size * 0.5;
      const wobble = Math.sin(t * 1.8) * size * 0.08;
      if (axis === 0) e.mesh.position.set(along, wobble, Math.sin(t * 1.2) * 0.05);
      else if (axis === 1) e.mesh.position.set(wobble, along, Math.sin(t * 1.2) * 0.05);
      else e.mesh.position.set(Math.sin(t * 1.2) * 0.05, wobble, along);
    } else if (e.orbitalType === 'd') {
      const r = size * 0.35;
      const lobe = Math.floor((Math.sin(t * 0.3) + 1) * 2) % 4;
      const angle = lobe * Math.PI / 2 + e.orbIndex * 0.5;
      e.mesh.position.set(
        Math.cos(angle) * r * Math.abs(Math.sin(t * 0.5)),
        Math.sin(angle) * r * Math.abs(Math.sin(t * 0.5)),
        Math.sin(t * 0.4) * r * 0.3,
      );
    } else {
      const r = size * 0.25;
      e.mesh.position.set(
        Math.cos(t * 0.8 + e.orbIndex) * r,
        Math.sin(t * 0.6 + e.orbIndex) * r,
        Math.cos(t * 0.4 + e.orbIndex * 2) * r,
      );
    }
  }
}

// --- Animation loop ---
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();
  controls.update();
  animateElectrons(time);
  renderer.render(scene, camera);
}

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / (window.innerHeight - 50);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight - 50);
});

// --- Toolbar ---
document.querySelector('.toolbar').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const z = btn.dataset.z;
  if (z) {
    currentZ = parseInt(z);
    document.querySelectorAll('[data-z]').forEach(b => b.classList.remove('el-active'));
    btn.classList.add('el-active');
    buildOrbitals(currentZ);
    return;
  }

  const filter = btn.dataset.filter;
  if (filter) {
    filters[filter] = !filters[filter];
    btn.classList.toggle('active', filters[filter]);
    updateFilters();
    return;
  }

  const action = btn.dataset.action;
  if (action === 'toggle-axes') { showAxes = !showAxes; btn.classList.toggle('active', showAxes); updateFilters(); }
  if (action === 'toggle-shells') { showShells = !showShells; btn.classList.toggle('active', showShells); updateFilters(); }
  if (action === 'toggle-electrons') { showElectrons = !showElectrons; btn.classList.toggle('active', showElectrons); updateFilters(); }
  if (action === 'reset-camera') { camera.position.set(4, 3, 5); controls.reset(); }
});

// --- Init ---
buildOrbitals(currentZ);
animate();
