/**
 * Handles mouse/touch input on the canvas.
 * Walks SceneGraph in reverse z-order for hit-testing.
 * Emits hover, click, drag events on Renderables.
 */
export class InteractionManager {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('./SceneGraph.js').SceneGraph} sceneGraph
   */
  constructor(canvas, sceneGraph) {
    this.canvas = canvas;
    this.sg = sceneGraph;

    this._dragging = null;   // the Renderable being dragged
    this._dragOffX = 0;
    this._dragOffY = 0;
    this._hovered = null;
    this._mouseDown = false;
    this._lastMouse = { x: 0, y: 0 };

    // Callbacks
    this.onDragEnd = null; // (renderable) => void

    this._bind();
  }

  _bind() {
    const c = this.canvas;
    c.addEventListener('mousedown', e => this._onDown(this._pos(e)));
    c.addEventListener('mousemove', e => this._onMove(this._pos(e)));
    c.addEventListener('mouseup', e => this._onUp(this._pos(e)));
    c.addEventListener('mouseleave', () => this._onUp(this._lastMouse));

    c.addEventListener('touchstart', e => { e.preventDefault(); this._onDown(this._touchPos(e)); }, { passive: false });
    c.addEventListener('touchmove', e => { e.preventDefault(); this._onMove(this._touchPos(e)); }, { passive: false });
    c.addEventListener('touchend', e => this._onUp(this._lastMouse));
  }

  _pos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  _touchPos(e) {
    if (!e.touches.length) return this._lastMouse;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY,
    };
  }

  /**
   * Hit-test scene graph in reverse order (top-most first).
   */
  _hitTest(px, py) {
    const objects = this.sg.objects;
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (obj.visible && obj.interactive && obj.hitTest(px, py)) {
        return obj;
      }
    }
    return null;
  }

  _onDown({ x, y }) {
    this._mouseDown = true;
    this._lastMouse = { x, y };

    const hit = this._hitTest(x, y);
    if (hit && hit.draggable) {
      this._dragging = hit;
      this._dragOffX = hit.x - x;
      this._dragOffY = hit.y - y;
      this.canvas.style.cursor = 'grabbing';
    }
  }

  _onMove({ x, y }) {
    this._lastMouse = { x, y };

    if (this._dragging) {
      this._dragging.x = x + this._dragOffX;
      this._dragging.y = y + this._dragOffY;
      return;
    }

    // Hover
    const hit = this._hitTest(x, y);
    if (hit !== this._hovered) {
      if (this._hovered) { this._hovered.hovered = false; }
      this._hovered = hit;
      if (hit) { hit.hovered = true; }
      this.canvas.style.cursor = hit?.draggable ? 'grab' : hit?.interactive ? 'pointer' : 'default';
    }
  }

  _onUp({ x, y }) {
    if (this._dragging) {
      const obj = this._dragging;
      this._dragging = null;
      this.canvas.style.cursor = 'default';
      if (this.onDragEnd) this.onDragEnd(obj);
    }
    this._mouseDown = false;
  }

  /** True if currently dragging something */
  get isDragging() { return this._dragging !== null; }
}
