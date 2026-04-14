// Length contraction: worldtube in the SHIP'S rest frame.
// The worldtube is FIXED (vertical parallel lines, width = L₀).
// Slider controls the relative velocity. Alice's tilted "now" line slices
// the worldtube at an angle, producing a different measurement.
// The worldlines never move or converge.

import { registerScene } from './registry.js';
import { clearCanvas, worldToScreen } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawGrid, drawAxes, drawTickMarks } from '../tools/grid.js';
import { drawWorldline } from '../tools/worldline.js';
import { drawLabel, drawBracket } from '../tools/labels.js';
import { gamma } from '../tools/coordinates.js';

const L0 = 2.4; // rest length (fixed width of the worldtube)

class LengthContractScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width / (window.devicePixelRatio || 1);
    this.h = canvas.height / (window.devicePixelRatio || 1);
    this.origin = { x: this.w / 2, y: this.h / 2 };
    this.scale = 50;
    this.beta = 0.5;
  }

  get sliderConfig() {
    return { label: 'velocity \u03B2', min: 0, max: 0.9, default: 0.5, format: v => v.toFixed(2) };
  }

  setValue(v) { this.beta = v; this._draw(); }
  stop() {}

  liveValues() {
    const g = gamma(this.beta);
    const L = L0 / g;
    return {
      L: L.toFixed(2),
      L0: L0.toFixed(1),
      gamma: g.toFixed(3),
      beta: this.beta.toFixed(2),
    };
  }

  _draw() {
    const { ctx, canvas, w, h, origin, scale, beta } = this;
    clearCanvas(ctx, canvas);

    const g = gamma(beta);
    const L = L0 / g;
    const R = 5;
    const halfL = L0 / 2;

    // Grid and axes (centered)
    drawGrid(ctx, origin, scale, [-R, R], [-R, R], { color: COLORS.grid });
    drawAxes(ctx, origin, scale, {
      xLabel: 'x', tLabel: 't', color: COLORS.ink, lineWidth: 1.5,
      xRange: [-R, R], tRange: [-R, R],
    });
    drawTickMarks(ctx, origin, scale, 'x', 1, { labels: true, range: [-R + 1, R - 1] });
    drawTickMarks(ctx, origin, scale, 't', 1, { labels: true, range: [-R + 1, R - 1] });

    // ── FIXED worldtube: two VERTICAL parallel lines at x = ±L0/2 ──
    // These never move or change. The ship is at rest in this frame (Bob's frame).
    const tMin = -R, tMax = R;

    // Worldtube fill
    ctx.save();
    ctx.fillStyle = 'rgba(26, 82, 118, 0.06)';
    const bl = worldToScreen(-halfL, tMin, origin, scale, true);
    const tr = worldToScreen(halfL, tMax, origin, scale, true);
    ctx.fillRect(bl.sx, tr.sy, tr.sx - bl.sx, bl.sy - tr.sy);
    ctx.restore();

    // Worldlines (vertical)
    drawWorldline(ctx,
      [{ x: -halfL, t: tMin }, { x: -halfL, t: tMax }],
      origin, scale, { color: COLORS.alice, lineWidth: 2.2 }
    );
    drawWorldline(ctx,
      [{ x: halfL, t: tMin }, { x: halfL, t: tMax }],
      origin, scale, { color: COLORS.alice, lineWidth: 2.2 }
    );

    // Labels
    const backLabel = worldToScreen(-halfL, tMax - 0.5, origin, scale, true);
    drawLabel(ctx, 'back', backLabel.sx - 10, backLabel.sy, {
      font: '11px Georgia, serif', color: COLORS.alice, align: 'right',
    });
    const frontLabel = worldToScreen(halfL, tMax - 0.5, origin, scale, true);
    drawLabel(ctx, 'front', frontLabel.sx + 10, frontLabel.sy, {
      font: '11px Georgia, serif', color: COLORS.alice, align: 'left',
    });

    // ── Bob's "now" = horizontal (he's at rest with the ship) ──
    const bobBack = worldToScreen(-halfL, 0, origin, scale, true);
    const bobFront = worldToScreen(halfL, 0, origin, scale, true);

    // Highlight Bob's slice on the x-axis
    ctx.save();
    ctx.strokeStyle = COLORS.bob;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bobBack.sx, bobBack.sy);
    ctx.lineTo(bobFront.sx, bobFront.sy);
    ctx.stroke();
    ctx.restore();

    // Dots at intersections
    ctx.save();
    ctx.fillStyle = COLORS.bob;
    ctx.beginPath(); ctx.arc(bobBack.sx, bobBack.sy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bobFront.sx, bobFront.sy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Bracket
    drawBracket(ctx, bobBack.sx, bobBack.sy + 4, bobFront.sx, bobFront.sy + 4,
      'L\u2080 = ' + L0.toFixed(1) + ' (rest length)', {
        color: COLORS.bob, side: 'bottom', offset: 16,
        font: 'bold 12px Georgia, serif', labelColor: COLORS.bob,
      });

    drawLabel(ctx, "Bob's 'now' (horizontal)", bobFront.sx + 10, bobFront.sy + 4, {
      font: 'italic 11px Georgia, serif', color: COLORS.bob, align: 'left',
      bg: COLORS.bgCanvas, bgPad: 2,
    });

    // ── Alice's "now" = tilted (she's moving relative to the ship) ──
    // In the ship's rest frame, Alice moves at -beta.
    // Her simultaneity line through the origin: t = -beta * x
    // (tilts DOWN to the right)
    if (beta > 0.01) {
      const aliceNowX1 = -R;
      const aliceNowT1 = -beta * aliceNowX1; // = beta * R (positive)
      const aliceNowX2 = R;
      const aliceNowT2 = -beta * aliceNowX2; // = -beta * R (negative)

      const ap1 = worldToScreen(aliceNowX1, aliceNowT1, origin, scale, true);
      const ap2 = worldToScreen(aliceNowX2, aliceNowT2, origin, scale, true);

      ctx.save();
      ctx.strokeStyle = COLORS.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(ap1.sx, ap1.sy);
      ctx.lineTo(ap2.sx, ap2.sy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      drawLabel(ctx, "Alice's 'now' (tilted)", ap2.sx - 10, ap2.sy + 14, {
        font: 'italic 11px Georgia, serif', color: COLORS.accent, align: 'right',
        bg: COLORS.bgCanvas, bgPad: 2,
      });

      // Where Alice's "now" intersects the worldtube:
      // Back worldline at x = -halfL: t = -beta * (-halfL) = beta * halfL
      // Front worldline at x = halfL: t = -beta * halfL
      const aliceBackT = beta * halfL;
      const aliceFrontT = -beta * halfL;

      const aBack = worldToScreen(-halfL, aliceBackT, origin, scale, true);
      const aFront = worldToScreen(halfL, aliceFrontT, origin, scale, true);

      ctx.save();
      ctx.fillStyle = COLORS.accent;
      ctx.beginPath(); ctx.arc(aBack.sx, aBack.sy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(aFront.sx, aFront.sy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // The HORIZONTAL distance between these points is still L0 on Bob's diagram.
      // But Alice's measurement in HER frame = L0 / gamma.
      // Show this as a computed value label.
      const midX = (aBack.sx + aFront.sx) / 2;
      const midY = (aBack.sy + aFront.sy) / 2;
      drawLabel(ctx, 'Alice measures: L = ' + L.toFixed(2), midX, midY - 18, {
        font: 'bold 12px Georgia, serif', color: COLORS.accent,
        bg: COLORS.bgCanvas, bgPad: 3,
      });
    }

    // Worldtube label (inside, near bottom)
    drawLabel(ctx, "Ship's worldtube (at rest)", 0, h - 30, {
      font: 'italic 12px Georgia, serif', color: COLORS.alice,
      bg: COLORS.bgCanvas, bgPad: 3,
    });
    drawLabel(ctx, '(width fixed at L\u2080 = ' + L0.toFixed(1) + ')', 0 , h - 14, {
      font: 'italic 11px Georgia, serif', color: COLORS.inkLight,
    });

    // ── Info panel ──
    drawLabel(ctx, 'Bob: L\u2080 = ' + L0.toFixed(1), w - 80, 20, {
      font: 'bold 13px Georgia, serif', color: COLORS.bob, align: 'center',
    });
    if (beta > 0.01) {
      drawLabel(ctx, 'Alice: L = ' + L.toFixed(2), w - 80, 40, {
        font: 'bold 13px Georgia, serif', color: COLORS.accent, align: 'center',
      });
      drawLabel(ctx, '\u03B3 = ' + g.toFixed(3), w - 80, 60, {
        font: '12px Georgia, serif', color: COLORS.inkLight, align: 'center',
      });
    }

    // Bottom annotation
    if (beta < 0.02) {
      drawLabel(ctx, 'At rest: Alice and Bob agree on the length', w / 2, 16, {
        font: 'italic 13px Georgia, serif', color: COLORS.inkLight,
        bg: COLORS.bgCanvas, bgPad: 4,
      });
    } else {
      drawLabel(ctx, 'Same worldtube. Different "now." Different length.', w / 2, 16, {
        font: 'bold italic 13px Georgia, serif', color: COLORS.accent,
        bg: COLORS.bgCanvas, bgPad: 4,
      });
    }
  }
}

registerScene('length-contract', (canvas, opts) => new LengthContractScene(canvas, opts));
