/**
 * Three.js scene, camera, renderer, lights, controls, RAF loop.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    this.camera.position.set(5, 4, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.autoRotate = false;

    // Lighting
    this.scene.add(new THREE.AmbientLight(0x404060, 1.5));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 5, 5);
    this.scene.add(dir);
    const back = new THREE.DirectionalLight(0x4466ff, 0.4);
    back.position.set(-3, -2, -4);
    this.scene.add(back);

    this.clock = new THREE.Clock();
    this._updateCallbacks = [];
    this._running = false;

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const el = this.renderer.domElement.parentElement;
    if (!el) return;
    const w = el.clientWidth || window.innerWidth;
    const h = el.clientHeight || (window.innerHeight - 50);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /** Register a callback to run each frame: fn(time, dt) */
  onUpdate(fn) { this._updateCallbacks.push(fn); }

  start() {
    if (this._running) return;
    this._running = true;
    this._loop();
  }

  stop() { this._running = false; }

  _loop() {
    if (!this._running) return;
    const dt = this.clock.getDelta();
    const time = this.clock.getElapsedTime();
    this.controls.update();
    for (const fn of this._updateCallbacks) fn(time, dt);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this._loop());
  }
}
