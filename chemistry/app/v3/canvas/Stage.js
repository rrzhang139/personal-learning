/**
 * Full-screen canvas manager.
 * Owns RAF loop, SceneGraph, InteractionManager, Tweener.
 */
import { SceneGraph } from './SceneGraph.js';
import { InteractionManager } from './InteractionManager.js';
import { Tweener } from './Tweener.js';

const BG = '#0a0a1a';
const LOGICAL_W = 900;
const LOGICAL_H = 500;

export class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Fixed logical resolution
    this.canvas.width = LOGICAL_W;
    this.canvas.height = LOGICAL_H;

    this.sceneGraph = new SceneGraph();
    this.tweener = new Tweener();
    this.interaction = new InteractionManager(this);

    this._running = false;
    this._startTime = 0;
    this._lastTime = 0;
  }

  get W() { return LOGICAL_W; }
  get H() { return LOGICAL_H; }

  /**
   * Convert page coordinates to canvas logical coordinates.
   */
  pageToCanvas(pageX, pageY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((pageX - rect.left) / rect.width) * LOGICAL_W,
      y: ((pageY - rect.top) / rect.height) * LOGICAL_H,
    };
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._startTime = performance.now() / 1000;
    this._lastTime = this._startTime;
    this._loop();
  }

  stop() { this._running = false; }

  _loop() {
    if (!this._running) return;
    const now = performance.now() / 1000;
    const dt = Math.min(now - this._lastTime, 0.05);
    const time = now - this._startTime;
    this._lastTime = now;

    this.tweener.update(dt);

    const ctx = this.ctx;
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    this.sceneGraph.render(ctx, time);

    requestAnimationFrame(() => this._loop());
  }
}
