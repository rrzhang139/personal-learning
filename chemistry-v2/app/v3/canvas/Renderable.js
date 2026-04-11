/**
 * Base class for everything that renders on the canvas.
 * Provides position, opacity, scale, visibility, hit-testing, and drag support.
 */
export class Renderable {
  constructor({ x = 0, y = 0, width = 0, height = 0 } = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.opacity = 1;
    this.scale = 1;
    this.visible = true;
    this.interactive = false;
    this.draggable = false;
    this.hovered = false;

    /** @type {Renderable|null} */
    this.parent = null;

    /** @type {string} */
    this.id = '';
  }

  /**
   * Override in subclasses. Draw this object on the canvas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} time - elapsed seconds
   */
  render(ctx, time) {}

  /**
   * Override for non-rectangular hit areas.
   * Default: bounding-box test centered on (x, y).
   * @param {number} px
   * @param {number} py
   * @returns {boolean}
   */
  hitTest(px, py) {
    const hw = this.width / 2;
    const hh = this.height / 2;
    return px >= this.x - hw && px <= this.x + hw &&
           py >= this.y - hh && py <= this.y + hh;
  }

  /**
   * Move to a position (instant).
   */
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
}
