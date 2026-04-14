// Spacetime diagram introduction: slider-driven velocity β controls Bob's worldline tilt.
// Origin centered. Four equal quadrants.

import { registerScene } from './registry.js';
import { clearCanvas, worldToScreen } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawGrid, drawAxes, drawTickMarks } from '../tools/grid.js';
import { drawWorldline, drawEvent } from '../tools/worldline.js';
import { drawLabel } from '../tools/labels.js';

class SpacetimeIntroScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width / (window.devicePixelRatio || 1);
    this.h = canvas.height / (window.devicePixelRatio || 1);
    this.origin = { x: this.w / 2, y: this.h / 2 };
    this.scale = 55;
    this.beta = 0.3;
  }

  get sliderConfig() {
    return { label: 'velocity \u03B2', min: 0, max: 0.9, default: 0.3, format: v => v.toFixed(2) };
  }

  setValue(v) { this.beta = v; this._draw(); }
  stop() {}

  _draw() {
    const { ctx, canvas, w, h, origin, scale, beta } = this;
    clearCanvas(ctx, canvas);

    const R = 4;

    // Grid, axes, ticks (symmetric)
    drawGrid(ctx, origin, scale, [-R, R], [-R, R], { color: COLORS.grid });
    drawAxes(ctx, origin, scale, {
      xLabel: 'space (x)', tLabel: 'time (t)', color: COLORS.ink, lineWidth: 1.8,
      xRange: [-R, R], tRange: [-R, R],
    });
    drawTickMarks(ctx, origin, scale, 'x', 1, { labels: true, range: [-R, R] });
    drawTickMarks(ctx, origin, scale, 't', 1, { labels: true, range: [-R, R] });

    // Light rays at 45 degrees
    const ext = R - 0.3;
    const o = worldToScreen(0, 0, origin, scale, true);
    const rEnd = worldToScreen(ext, ext, origin, scale, true);
    const lEnd = worldToScreen(-ext, ext, origin, scale, true);

    ctx.save();
    ctx.strokeStyle = COLORS.photon;
    ctx.lineWidth = 1.8;
    ctx.setLineDash([7, 5]);
    ctx.beginPath(); ctx.moveTo(o.sx, o.sy); ctx.lineTo(rEnd.sx, rEnd.sy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(o.sx, o.sy); ctx.lineTo(lEnd.sx, lEnd.sy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    const rayLabel = worldToScreen(2.8, 2.8, origin, scale, true);
    drawLabel(ctx, 'light (c = 1)', rayLabel.sx + 12, rayLabel.sy - 6, {
      font: 'italic 13px Georgia, serif', color: COLORS.photon,
      bg: COLORS.bgCanvas, bgPad: 2, align: 'left',
    });

    // Alice's worldline (vertical at x=0)
    drawWorldline(ctx, [{ x: 0, t: -R }, { x: 0, t: R }], origin, scale, {
      color: COLORS.alice, lineWidth: 2.5, glow: true,
    });
    const aPos = worldToScreen(0, R - 0.3, origin, scale, true);
    drawLabel(ctx, 'Alice', aPos.sx - 14, aPos.sy, {
      font: 'bold 13px Georgia, serif', color: COLORS.alice, align: 'right',
      bg: COLORS.bgCanvas, bgPad: 2,
    });

    // Bob's worldline
    drawWorldline(ctx, [{ x: -beta * R, t: -R }, { x: beta * R, t: R }], origin, scale, {
      color: COLORS.bob, lineWidth: 2.5, glow: true,
    });
    const bT = R - 0.5;
    const bPos = worldToScreen(beta * bT, bT, origin, scale, true);
    drawLabel(ctx, 'Bob', bPos.sx + 14, bPos.sy, {
      font: 'bold 13px Georgia, serif', color: COLORS.bob, align: 'left',
      bg: COLORS.bgCanvas, bgPad: 2,
    });

    // Event dots
    drawEvent(ctx, 0, 1, origin, scale, { color: COLORS.accent, radius: 5, label: 'Event A', labelOffset: { dx: -50, dy: -2 } });
    drawEvent(ctx, 0, -1, origin, scale, { color: COLORS.accent, radius: 5, label: 'Event B', labelOffset: { dx: -50, dy: -2 } });
    drawEvent(ctx, beta * 2, 2, origin, scale, { color: COLORS.accent, radius: 5, label: 'Event C', labelOffset: { dx: 10, dy: -6 } });

    // Annotation
    if (beta < 0.01) {
      drawLabel(ctx, 'v = 0: worldlines overlap', w / 2, 16, {
        font: 'bold 14px Georgia, serif', color: COLORS.ink, bg: COLORS.bgCanvas, bgPad: 5,
      });
    } else {
      drawLabel(ctx, 'v = ' + beta.toFixed(2) + 'c: Bob\'s worldline tilts', w / 2, 16, {
        font: 'bold 14px Georgia, serif', color: COLORS.ink, bg: COLORS.bgCanvas, bgPad: 5,
      });
    }
  }
}

registerScene('spacetime-intro', (canvas, opts) => new SpacetimeIntroScene(canvas, opts));
