/**
 * Handles mouse/touch → hover, click, drag on Renderables.
 * Uses Stage.pageToCanvas() for coordinate mapping.
 */
export class InteractionManager {
  /**
   * @param {import('./Stage.js').Stage} stage
   */
  constructor(stage) {
    this.stage = stage;
    this.canvas = stage.canvas;
    this.sg = stage.sceneGraph;

    this._dragging = null;
    this._dragOffX = 0;
    this._dragOffY = 0;
    this._hovered = null;

    /** Called when a drag ends. @type {(renderable) => void} */
    this.onDragEnd = null;

    this._bind();
  }

  _bind() {
    const c = this.canvas;

    c.addEventListener('mousedown', e => {
      const p = this.stage.pageToCanvas(e.clientX, e.clientY);
      this._onDown(p);
    });

    c.addEventListener('mousemove', e => {
      const p = this.stage.pageToCanvas(e.clientX, e.clientY);
      this._onMove(p);
    });

    c.addEventListener('mouseup', e => {
      const p = this.stage.pageToCanvas(e.clientX, e.clientY);
      this._onUp(p);
    });

    c.addEventListener('mouseleave', () => {
      this._onUp({ x: 0, y: 0 });
    });

    c.addEventListener('touchstart', e => {
      e.preventDefault();
      if (e.touches.length) {
        const p = this.stage.pageToCanvas(e.touches[0].clientX, e.touches[0].clientY);
        this._onDown(p);
      }
    }, { passive: false });

    c.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length) {
        const p = this.stage.pageToCanvas(e.touches[0].clientX, e.touches[0].clientY);
        this._onMove(p);
      }
    }, { passive: false });

    c.addEventListener('touchend', () => {
      this._onUp({ x: 0, y: 0 });
    });
  }

  /** Hit test scene graph top-to-bottom (reverse array = front first). */
  _hitTest(px, py) {
    const objects = this.sg.objects;
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (obj.visible && obj.interactive && obj.opacity > 0.1 && obj.hitTest(px, py)) {
        return obj;
      }
    }
    return null;
  }

  _onDown({ x, y }) {
    const hit = this._hitTest(x, y);
    if (hit && hit.draggable) {
      this._dragging = hit;
      this._dragOffX = hit.x - x;
      this._dragOffY = hit.y - y;
      this.canvas.style.cursor = 'grabbing';
    }
  }

  _onMove({ x, y }) {
    if (this._dragging) {
      this._dragging.x = x + this._dragOffX;
      this._dragging.y = y + this._dragOffY;
      return;
    }

    // Hover
    const hit = this._hitTest(x, y);
    if (hit !== this._hovered) {
      if (this._hovered) this._hovered.hovered = false;
      this._hovered = hit;
      if (hit) hit.hovered = true;
      this.canvas.style.cursor = hit?.draggable ? 'grab' : hit?.interactive ? 'pointer' : 'default';
    }
  }

  _onUp() {
    if (this._dragging) {
      const obj = this._dragging;
      this._dragging = null;
      this.canvas.style.cursor = 'default';
      if (this.onDragEnd) this.onDragEnd(obj);
    }
  }

  get isDragging() { return this._dragging !== null; }
  get dragTarget() { return this._dragging; }
}
