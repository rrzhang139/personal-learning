// Worldline tilt: Bob's coordinate axes scissor toward the light cone.
// Origin centered. Four equal quadrants.

import { registerScene } from './registry.js';
import { clearCanvas, worldToScreen } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawGrid, drawAxes, drawTickMarks } from '../tools/grid.js';
import { drawLightCone } from '../tools/lightcone.js';
import { drawFrame, gamma } from '../tools/coordinates.js';
import { drawLabel } from '../tools/labels.js';

class WorldlineTiltScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width / (window.devicePixelRatio || 1);
    this.h = canvas.height / (window.devicePixelRatio || 1);
    this.origin = { x: this.w / 2, y: this.h / 2 };
    this.scale = 55;
    this.beta = 0;
  }

  get sliderConfig() {
    return { label: 'velocity \u03B2', min: 0, max: 0.9, default: 0, format: v => v.toFixed(2) };
  }

  setValue(v) { this.beta = v; this._draw(); }
  stop() {}

  _draw() {
    const { ctx, canvas, w, h, origin, scale, beta } = this;
    clearCanvas(ctx, canvas);

    const R = 4;

    // Alice's faint grid
    drawGrid(ctx, origin, scale, [-R, R], [-R, R], { color: COLORS.grid });

    // Bob's tilted grid (when β > 0.1)
    if (beta > 0.1) {
      drawFrame(ctx, origin, scale, beta, {
        color: COLORS.bob, lineWidth: 0, xLabel: '', tLabel: '',
        gridLines: true, gridColor: COLORS.bob, extent: R,
      });
    }

    // Alice's axes
    drawAxes(ctx, origin, scale, {
      xLabel: 'x', tLabel: 't', color: COLORS.ink,
      lineWidth: beta > 0.01 ? 1.2 : 1.8,
      xRange: [-R, R], tRange: [-R, R],
    });
    drawTickMarks(ctx, origin, scale, 'x', 1, { labels: true, range: [-R, R] });
    drawTickMarks(ctx, origin, scale, 't', 1, { labels: true, range: [-R, R] });

    if (beta > 0.01) {
      const axPos = worldToScreen(R - 0.3, 0, origin, scale, true);
      drawLabel(ctx, "(Alice's x)", axPos.sx, axPos.sy + 18, {
        font: 'italic 11px Georgia, serif', color: COLORS.inkLight,
      });
      const atPos = worldToScreen(0, R - 0.3, origin, scale, true);
      drawLabel(ctx, "(Alice's t)", atPos.sx - 30, atPos.sy + 10, {
        font: 'italic 11px Georgia, serif', color: COLORS.inkLight,
      });
    }

    // Light cone (both future and past)
    drawLightCone(ctx, 0, 0, origin, scale, {
      color: COLORS.photon, lineWidth: 1.5, dashed: true,
      future: true, past: true, fill: true,
      fillColor: COLORS.lightcone, extent: R + 0.5,
    });

    // Light cone label
    const lcPos = worldToScreen(R - 0.2, R - 0.2, origin, scale, true);
    drawLabel(ctx, 'light cone', lcPos.sx + 10, lcPos.sy - 8, {
      font: 'italic 11px Georgia, serif', color: COLORS.photon,
      bg: COLORS.bgCanvas, bgPad: 2, align: 'left',
    });

    // Bob's frame axes
    if (beta > 0.01) {
      drawFrame(ctx, origin, scale, beta, {
        color: COLORS.bob, lineWidth: 2.2,
        xLabel: "x'", tLabel: "t'", extent: R,
      });
    }

    // Info
    const g = gamma(beta);
    drawLabel(ctx, 'v = ' + beta.toFixed(2) + 'c', w / 2, 16, {
      font: 'bold 15px Georgia, serif', color: COLORS.ink,
      bg: COLORS.bgCanvas, bgPad: 5,
    });

    if (beta > 0.01) {
      drawLabel(ctx, '\u03B3 = ' + g.toFixed(3), w / 2, 38, {
        font: 'italic 13px Georgia, serif', color: COLORS.bob,
        bg: COLORS.bgCanvas, bgPad: 3,
      });
    }

    if (beta < 0.01) {
      drawLabel(ctx, "Bob's axes align with Alice's", w / 2, 38, {
        font: 'italic 13px Georgia, serif', color: COLORS.inkLight,
        bg: COLORS.bgCanvas, bgPad: 3,
      });
    }

    if (beta > 0.7) {
      drawLabel(ctx, 'Both axes squeeze toward 45\u00b0', w / 2, 58, {
        font: 'italic 13px Georgia, serif', color: COLORS.bob,
        bg: COLORS.bgCanvas, bgPad: 3,
      });
    }
  }
}

registerScene('worldline-tilt', (canvas, opts) => new WorldlineTiltScene(canvas, opts));
