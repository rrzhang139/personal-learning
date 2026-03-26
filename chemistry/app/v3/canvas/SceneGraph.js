/**
 * Ordered collection of Renderables. Handles z-order, add/remove with transitions.
 */
export class SceneGraph {
  constructor() {
    /** @type {import('./Renderable.js').Renderable[]} */
    this.objects = [];
  }

  /**
   * Add a renderable to the scene graph.
   * @param {import('./Renderable.js').Renderable} obj
   * @param {import('./Tweener.js').Tweener} [tweener] - optional, for fade-in
   * @param {number} [fadeIn] - ms to fade in
   */
  add(obj, tweener, fadeIn = 0) {
    if (this.objects.includes(obj)) return;
    if (fadeIn > 0 && tweener) {
      obj.opacity = 0;
      this.objects.push(obj);
      tweener.tween(obj, { opacity: 1 }, fadeIn);
    } else {
      obj.opacity = 1;
      this.objects.push(obj);
    }
  }

  /**
   * Remove a renderable.
   * @param {import('./Renderable.js').Renderable} obj
   * @param {import('./Tweener.js').Tweener} [tweener]
   * @param {number} [fadeOut] - ms to fade out before removal
   */
  async remove(obj, tweener, fadeOut = 0) {
    if (!this.objects.includes(obj)) return;
    if (fadeOut > 0 && tweener) {
      await tweener.tween(obj, { opacity: 0 }, fadeOut);
    }
    this.objects = this.objects.filter(o => o !== obj);
  }

  /**
   * Remove all objects.
   */
  clear() {
    this.objects = [];
  }

  /**
   * Render all visible objects in order.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} time - elapsed seconds
   */
  render(ctx, time) {
    for (const obj of this.objects) {
      if (!obj.visible || obj.opacity <= 0) continue;
      ctx.save();
      if (obj.opacity < 1) ctx.globalAlpha = obj.opacity;
      if (obj.scale !== 1) {
        ctx.translate(obj.x, obj.y);
        ctx.scale(obj.scale, obj.scale);
        ctx.translate(-obj.x, -obj.y);
      }
      obj.render(ctx, time);
      ctx.restore();
    }
  }
}
