// Simultaneity: slider-driven velocity β shows how Bob's "now" line tilts.
// Events on the x-axis (Alice's "now"). Origin centered. Four equal quadrants.

import { registerScene } from './registry.js';
import { clearCanvas, worldToScreen } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawGrid, drawAxes, drawTickMarks } from '../tools/grid.js';
import { drawWorldline, drawEvent } from '../tools/worldline.js';
import { drawLabel } from '../tools/labels.js';
import { drawArrow } from '../tools/arrows.js';

class SimultaneityScene {
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

    const R = 4; // symmetric range: -R to R on both axes

    // Grid and axes (centered, symmetric)
    drawGrid(ctx, origin, scale, [-R, R], [-R, R], { color: COLORS.grid });
    drawAxes(ctx, origin, scale, {
      xLabel: 'x', tLabel: 't', color: COLORS.ink, lineWidth: 1.5,
      xRange: [-R, R], tRange: [-R, R],
    });
    drawTickMarks(ctx, origin, scale, 'x', 1, { labels: true, range: [-R, R] });
    drawTickMarks(ctx, origin, scale, 't', 1, { labels: true, range: [-R, R] });

    // 45-degree light rays (reference)
    const ext = R - 0.3;
    const oScreen = worldToScreen(0, 0, origin, scale, true);
    const rEnd = worldToScreen(ext, ext, origin, scale, true);
    const lEnd = worldToScreen(-ext, ext, origin, scale, true);
    ctx.save();
    ctx.strokeStyle = COLORS.photon;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(oScreen.sx, oScreen.sy); ctx.lineTo(rEnd.sx, rEnd.sy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(oScreen.sx, oScreen.sy); ctx.lineTo(lEnd.sx, lEnd.sy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();

    const rayPos = worldToScreen(2.5, 2.5, origin, scale, true);
    drawLabel(ctx, 'light', rayPos.sx + 10, rayPos.sy + 4, {
      font: 'italic 11px Georgia, serif', color: COLORS.photon,
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

    // Alice's "now" = the x-axis itself. Label it.
    const nowLabelPos = worldToScreen(R - 0.5, 0, origin, scale, true);
    drawLabel(ctx, "Alice's 'now' (x-axis)", nowLabelPos.sx, nowLabelPos.sy + 18, {
      font: 'italic 11px Georgia, serif', color: COLORS.alice,
      bg: COLORS.bgCanvas, bgPad: 2,
    });

    // Two firecracker events ON the x-axis: (-2, 0) and (2, 0)
    // Color-coded: right = below Bob's now (his past), left = above (his future)
    const PAST_COLOR = '#c62828';   // red
    const FUTURE_COLOR = '#1a5276'; // blue
    const rightColor = beta > 0.01 ? PAST_COLOR : COLORS.accent;
    const leftColor = beta > 0.01 ? FUTURE_COLOR : COLORS.accent;

    drawEvent(ctx, -2, 0, origin, scale, {
      color: leftColor, radius: 6,
      label: beta > 0.01 ? 'Left (Bob\'s future)' : 'Left',
      labelOffset: { dx: -10, dy: 14 },
      font: 'bold 11px Georgia, serif',
    });
    drawEvent(ctx, 2, 0, origin, scale, {
      color: rightColor, radius: 6,
      label: beta > 0.01 ? 'Right (Bob\'s past)' : 'Right',
      labelOffset: { dx: 10, dy: 14 },
      font: 'bold 11px Georgia, serif',
    });

    // Bob's worldline from origin (tilted by beta)
    if (beta > 0.001) {
      drawWorldline(ctx, [{ x: -beta * R, t: -R }, { x: beta * R, t: R }], origin, scale, {
        color: COLORS.bob, lineWidth: 2.5, glow: true,
      });
      const bPos = worldToScreen(beta * (R - 0.3), R - 0.3, origin, scale, true);
      drawLabel(ctx, 'Bob', bPos.sx + 14, bPos.sy, {
        font: 'bold 13px Georgia, serif', color: COLORS.bob, align: 'left',
        bg: COLORS.bgCanvas, bgPad: 2,
      });
    }

    // Bob's "now" line: tilts through origin with slope β in (x, t) space.
    // Line: t = β * x
    const bobNowX1 = -R;
    const bobNowT1 = beta * bobNowX1;
    const bobNowX2 = R;
    const bobNowT2 = beta * bobNowX2;

    const bp1 = worldToScreen(bobNowX1, bobNowT1, origin, scale, true);
    const bp2 = worldToScreen(bobNowX2, bobNowT2, origin, scale, true);

    ctx.save();
    ctx.strokeStyle = COLORS.bob;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(bp1.sx, bp1.sy);
    ctx.lineTo(bp2.sx, bp2.sy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    if (beta > 0.01) {
      drawLabel(ctx, "Bob's 'now'", bp2.sx - 10, bp2.sy - 14, {
        font: 'italic 12px Georgia, serif', color: COLORS.bob,
        bg: COLORS.bgCanvas, bgPad: 2, align: 'right',
      });

      // Region labels: below the line = Bob's past, above = Bob's future
      const pastPos = worldToScreen(2.5, -1.5, origin, scale, true);
      drawLabel(ctx, "Bob's past \u2193", pastPos.sx, pastPos.sy, {
        font: 'italic 11px Georgia, serif', color: 'rgba(198, 40, 40, 0.5)',
        bg: COLORS.bgCanvas, bgPad: 2,
      });
      const futurePos = worldToScreen(-2.5, 1.5, origin, scale, true);
      drawLabel(ctx, "\u2191 Bob's future", futurePos.sx, futurePos.sy, {
        font: 'italic 11px Georgia, serif', color: 'rgba(26, 82, 118, 0.5)',
        bg: COLORS.bgCanvas, bgPad: 2,
      });
    }

    // Time gap at the Right event (2, 0):
    // Bob's "now" at x=2 has t = β*2. The Right event is at t=0.
    // So Bob says the Right event happened at t' < 0 (earlier).
    const deltaT = beta * 2;

    if (deltaT > 0.02) {
      const eR = worldToScreen(2, 0, origin, scale, true);
      const bobNowAtRight = worldToScreen(2, beta * 2, origin, scale, true);

      // Arrow from Right event to Bob's now-line at x=2
      drawArrow(ctx, eR.sx + 6, eR.sy, eR.sx + 6, bobNowAtRight.sy, {
        color: COLORS.bob, lineWidth: 1.5, headSize: 7,
      });

      const gapMidY = (eR.sy + bobNowAtRight.sy) / 2;
      drawLabel(ctx, '\u0394t = ' + (deltaT).toFixed(2), eR.sx + 22, gapMidY, {
        font: '12px Georgia, serif', color: COLORS.bob, align: 'left',
        bg: COLORS.bgCanvas, bgPad: 2,
      });
    }

    // Top annotation
    if (beta < 0.01) {
      drawLabel(ctx, 'Both events on Alice\'s "now" line. Simultaneous!', w / 2, 18, {
        font: 'bold 14px Georgia, serif', color: COLORS.green,
        bg: COLORS.bgCanvas, bgPad: 5,
      });
    } else {
      drawLabel(ctx, 'Bob\'s "now" is tilted. The right event is earlier for Bob.', w / 2, 18, {
        font: 'bold 14px Georgia, serif', color: COLORS.red,
        bg: COLORS.bgCanvas, bgPad: 5,
      });
    }
  }
}

registerScene('simultaneity', (canvas, opts) => new SimultaneityScene(canvas, opts));
