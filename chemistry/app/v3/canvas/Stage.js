/**
 * The full-screen canvas manager.
 * Owns the RAF loop, DPI scaling, SceneGraph, InteractionManager, Tweener.
 */
import { SceneGraph } from './SceneGraph.js';
import { InteractionManager } from './InteractionManager.js';
import { Tweener } from './Tweener.js';

const BG = '#0a0a1a';

export class Stage {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sceneGraph = new SceneGraph();
    this.tweener = new Tweener();
    this.interaction = new InteractionManager(canvas, this.sceneGraph);

    this._running = false;
    this._startTime = 0;
    this._lastTime = 0;

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  /** Logical width of the canvas (before DPI scaling) */
  get W() { return this.canvas.width; }
  /** Logical height of the canvas (before DPI scaling) */
  get H() { return this.canvas.height; }

  _resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    // Keep a fixed logical size for consistent rendering
    this.canvas.width = 900;
    this.canvas.height = 500;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
  }

  /**
   * Start the render loop.
   */
  start() {
    if (this._running) return;
    this._running = true;
    this._startTime = performance.now() / 1000;
    this._lastTime = this._startTime;
    this._loop();
  }

  /**
   * Stop the render loop.
   */
  stop() {
    this._running = false;
  }

  _loop() {
    if (!this._running) return;
    const now = performance.now() / 1000;
    const dt = Math.min(now - this._lastTime, 0.05); // cap at 50ms
    const time = now - this._startTime;
    this._lastTime = now;

    // Update tweens
    this.tweener.update(dt);

    // Clear and render
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    this.sceneGraph.render(ctx, time);

    requestAnimationFrame(() => this._loop());
  }
}
