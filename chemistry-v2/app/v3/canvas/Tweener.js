/**
 * Lightweight property tween engine.
 * Usage: tweener.tween(obj, { x: 100, opacity: 1 }, 600, 'easeOutCubic')
 */

const EASINGS = {
  linear: t => t,
  easeIn: t => t * t,
  easeOut: t => 1 - (1 - t) * (1 - t),
  easeInOut: t => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2,
  easeOutCubic: t => 1 - (1 - t) ** 3,
  easeOutBack: t => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
};

export class Tweener {
  constructor() {
    /** @type {Array<{obj, props, startVals, endVals, duration, elapsed, easing, resolve}>} */
    this._tweens = [];
  }

  /**
   * Animate properties of an object over time.
   * @param {object} obj - target object
   * @param {object} props - { x: 100, opacity: 1, ... }
   * @param {number} duration - milliseconds
   * @param {string} easing - easing function name
   * @returns {Promise} resolves when tween completes
   */
  tween(obj, props, duration = 400, easing = 'easeOut') {
    // Cancel any existing tweens on the same object+properties
    const propKeys = Object.keys(props);
    this._tweens = this._tweens.filter(t => {
      if (t.obj !== obj) return true;
      const overlap = Object.keys(t.endVals).some(k => propKeys.includes(k));
      if (overlap) { t.resolve?.(); return false; }
      return true;
    });

    const startVals = {};
    for (const key of propKeys) {
      startVals[key] = obj[key] ?? 0;
    }

    return new Promise(resolve => {
      this._tweens.push({
        obj, startVals, endVals: { ...props },
        duration: duration / 1000, elapsed: 0,
        easing: EASINGS[easing] || EASINGS.easeOut,
        resolve,
      });
    });
  }

  /**
   * Cancel all tweens on an object.
   */
  cancel(obj) {
    this._tweens = this._tweens.filter(t => {
      if (t.obj === obj) { t.resolve?.(); return false; }
      return true;
    });
  }

  /**
   * Called each frame by Stage.
   * @param {number} dt - delta time in seconds
   */
  update(dt) {
    const done = [];
    for (const t of this._tweens) {
      t.elapsed += dt;
      const progress = Math.min(t.elapsed / t.duration, 1);
      const eased = t.easing(progress);

      for (const key in t.endVals) {
        t.obj[key] = t.startVals[key] + (t.endVals[key] - t.startVals[key]) * eased;
      }

      if (progress >= 1) done.push(t);
    }

    for (const t of done) {
      // Snap to final values
      for (const key in t.endVals) t.obj[key] = t.endVals[key];
      t.resolve?.();
    }

    this._tweens = this._tweens.filter(t => !done.includes(t));
  }

  /** Number of active tweens */
  get active() { return this._tweens.length; }
}
