/**
 * Ordered collection of Renderables.
 */
export class SceneGraph {
  constructor() {
    /** @type {import('./Renderable.js').Renderable[]} */
    this.objects = [];
    /** @type {Array<(ctx: CanvasRenderingContext2D, time: number) => void>} */
    this.overlays = [];
  }

  /** Add a renderable. Does NOT reset opacity — caller controls that. */
  add(obj) {
    if (!this.objects.includes(obj)) {
      this.objects.push(obj);
    }
  }

  /** Remove a renderable. */
  remove(obj) {
    this.objects = this.objects.filter(o => o !== obj);
  }

  /** Remove all objects. */
  clear() {
    this.objects = [];
  }

  render(ctx, time) {
    for (const obj of this.objects) {
      if (!obj.visible || obj.opacity <= 0) continue;
      ctx.save();
      if (obj.opacity < 1) ctx.globalAlpha = obj.opacity;
      obj.render(ctx, time);
      ctx.restore();
    }
    for (const fn of this.overlays) {
      fn(ctx, time);
    }
  }
}
