/**
 * 3D drag controller using raycasting.
 * Drag atoms on a camera-perpendicular plane. Disables orbit controls during drag.
 */
import * as THREE from 'three';

export class DragController {
  constructor(camera, domElement, orbitControls) {
    this.camera = camera;
    this.domElement = domElement;
    this.orbitControls = orbitControls;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragPlane = new THREE.Plane();
    this.intersection = new THREE.Vector3();

    this.dragTarget = null;    // Atom3D being dragged
    this.dragOffset = new THREE.Vector3();
    this.hovered = null;       // Atom3D being hovered
    this._prevDragPos = null;  // for rigid-body delta tracking

    /** @type {THREE.Object3D[]} */
    this.draggables = [];  // sphere meshes to raycast against

    this.onDragEnd = null;  // callback(atom3D)

    domElement.addEventListener('pointerdown', (e) => this._onDown(e));
    domElement.addEventListener('pointermove', (e) => this._onMove(e));
    domElement.addEventListener('pointerup', (e) => this._onUp(e));
  }

  /** Register a sphere mesh as draggable, linked to its Atom3D */
  addDraggable(sphereMesh) {
    this.draggables.push(sphereMesh);
  }

  removeDraggable(sphereMesh) {
    this.draggables = this.draggables.filter(m => m !== sphereMesh);
  }

  clearDraggables() { this.draggables = []; }

  _toNDC(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _raycastAtoms() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.draggables, false);
    if (hits.length > 0) {
      // Walk up to find the Atom3D
      let obj = hits[0].object;
      while (obj && !obj.userData?.atom3d) obj = obj.parent;
      return { atom3d: obj?.userData?.atom3d || null, point: hits[0].point };
    }
    return null;
  }

  _onDown(event) {
    this._toNDC(event);
    const hit = this._raycastAtoms();
    if (hit?.atom3d) {
      this.dragTarget = hit.atom3d;
      this.orbitControls.enabled = false;
      this.domElement.style.cursor = 'grabbing';

      // Drag plane: perpendicular to camera, through atom position
      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);
      this.dragPlane.setFromNormalAndCoplanarPoint(camDir, hit.atom3d.group.position);

      // Offset so atom doesn't snap to cursor
      this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection);
      this.dragOffset.subVectors(hit.atom3d.group.position, this.intersection);
      this._prevDragPos = hit.atom3d.group.position.clone();
    }
  }

  _onMove(event) {
    this._toNDC(event);

    if (this.dragTarget) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      if (this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection)) {
        this.dragTarget.group.position.copy(this.intersection.add(this.dragOffset));
      }
      return;
    }

    // Hover
    const hit = this._raycastAtoms();
    if (hit?.atom3d !== this.hovered) {
      if (this.hovered) this.hovered.setGlow(false);
      this.hovered = hit?.atom3d || null;
      if (this.hovered) this.hovered.setGlow(true);
      this.domElement.style.cursor = this.hovered ? 'grab' : 'default';
    }
  }

  _onUp() {
    if (this.dragTarget) {
      const atom = this.dragTarget;
      this.dragTarget = null;
      this.orbitControls.enabled = true;
      this.domElement.style.cursor = 'default';
      if (this.onDragEnd) this.onDragEnd(atom);
      this._prevDragPos = null;
    }
  }

  /** Get the delta the dragged atom moved since last call (for rigid-body) */
  getDragDelta() {
    if (!this.dragTarget || !this._prevDragPos) return null;
    const delta = new THREE.Vector3().subVectors(this.dragTarget.group.position, this._prevDragPos);
    this._prevDragPos = this.dragTarget.group.position.clone();
    return delta;
  }
}
