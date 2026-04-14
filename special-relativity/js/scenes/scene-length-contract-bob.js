// Length contraction: ALICE'S frame. The ship moves, worldtube tilts.
// Alice's horizontal "now" catches a narrower cross-section (contracted length).
// Bob's tilted "now" catches the full rest length along the tube's own axis.
// The worldlines are parallel, same slope, and pivot on the x-axis at ±L₀/2.
// Origin centered.

import { registerScene } from './registry.js';
import { clearCanvas, worldToScreen } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawGrid, drawAxes, drawTickMarks } from '../tools/grid.js';
import { drawLabel, drawBracket } from '../tools/labels.js';
import { gamma } from '../tools/coordinates.js';

const L0 = 2.4; // rest length — the worldtube always passes through ±L0/2 on the x-axis

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
    return { L: L.toFixed(2), L0: L0.toFixed(1), gamma: g.toFixed(3), beta: this.beta.toFixed(2) };
  }

  _draw() {
    const { ctx, canvas, w, h, origin, scale, beta } = this;
    clearCanvas(ctx, canvas);

    const g = gamma(beta);
    const L = L0 / g;
    const R = 5;
    const halfL0 = L0 / 2;

    // Grid and axes
    drawGrid(ctx, origin, scale, [-R, R], [-R, R], { color: COLORS.grid });
    drawAxes(ctx, origin, scale, {
      xLabel: 'x', tLabel: 't', color: COLORS.ink, lineWidth: 1.5,
      xRange: [-R, R], tRange: [-R, R],
    });
    drawTickMarks(ctx, origin, scale, 'x', 1, { labels: true, range: [-R + 1, R - 1] });
    drawTickMarks(ctx, origin, scale, 't', 1, { labels: true, range: [-R + 1, R - 1] });

    // ── Tilted worldtube ──
    // Both worldlines pivot on the x-axis at x = ±L0/2
    // Slope = beta (ship moves right in Alice's frame)
    // Back worldline: passes through (-L0/2, 0), slope beta → x(t) = -L0/2 + beta*t
    // Front worldline: passes through (+L0/2, 0), slope beta → x(t) = +L0/2 + beta*t
    const tMin = -R, tMax = R;

    // Worldtube fill
    ctx.save();
    ctx.fillStyle = 'rgba(26, 82, 118, 0.06)';
    ctx.beginPath();
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = tMin + (tMax - tMin) * i / steps;
      const { sx, sy } = worldToScreen(-halfL0 + beta * t, t, origin, scale, true);
      if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    for (let i = steps; i >= 0; i--) {
      const t = tMin + (tMax - tMin) * i / steps;
      const { sx, sy } = worldToScreen(halfL0 + beta * t, t, origin, scale, true);
      ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Worldlines
    const drawWL = (xBase) => {
      ctx.save();
      ctx.strokeStyle = COLORS.alice;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const p1 = worldToScreen(xBase + beta * tMin, tMin, origin, scale, true);
      const p2 = worldToScreen(xBase + beta * tMax, tMax, origin, scale, true);
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
      ctx.restore();
    };
    drawWL(-halfL0);
    drawWL(halfL0);

    // ── Alice's horizontal "now" at t = 0 (the x-axis) ──
    // At t=0, back is at -L0/2, front at +L0/2 → horizontal width = L0
    // But the CONTRACTED length is what Alice measures: she sees the endpoints
    // at t=0 separated by L0 on her ruler. Wait — that's L0, not L.
    //
    // The subtlety: the worldlines pivot at ±L0/2, so the horizontal spacing
    // is always L0. The contraction in Alice's frame means L0 IS the contracted
    // length (the ship's rest length is larger). Let me re-derive:
    //
    // If the ship has rest length L_rest and moves at beta, then in Alice's frame
    // the contracted length is L = L_rest / gamma. We want the worldtube to
    // have horizontal spacing = L at t=0 and Bob's tilted slice = L_rest.
    //
    // So: pivot at ±L/2 (not ±L0/2). L0 in our labeling is the REST length.
    // L = L0/gamma is what Alice measures.

    // CORRECTION: use L (contracted) for the horizontal pivot, not L0
    // Redraw worldtube with pivots at ±L/2
    // Actually let me just redo the drawing cleanly.

    // Clear and redraw with correct pivots
    clearCanvas(ctx, canvas);

    const halfL = L / 2; // contracted half-length (Alice's measurement at t=0)

    // Grid and axes (redraw)
    drawGrid(ctx, origin, scale, [-R, R], [-R, R], { color: COLORS.grid });
    drawAxes(ctx, origin, scale, {
      xLabel: 'x', tLabel: 't', color: COLORS.ink, lineWidth: 1.5,
      xRange: [-R, R], tRange: [-R, R],
    });
    drawTickMarks(ctx, origin, scale, 'x', 1, { labels: true, range: [-R + 1, R - 1] });
    drawTickMarks(ctx, origin, scale, 't', 1, { labels: true, range: [-R + 1, R - 1] });

    // Worldtube: pivots at ±L/2 on x-axis, both tilt at slope beta
    // backX(t) = -L/2 + beta*t, frontX(t) = L/2 + beta*t

    // Fill
    ctx.save();
    ctx.fillStyle = 'rgba(26, 82, 118, 0.06)';
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = tMin + (tMax - tMin) * i / steps;
      const { sx, sy } = worldToScreen(-halfL + beta * t, t, origin, scale, true);
      if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    for (let i = steps; i >= 0; i--) {
      const t = tMin + (tMax - tMin) * i / steps;
      const { sx, sy } = worldToScreen(halfL + beta * t, t, origin, scale, true);
      ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Worldlines
    const drawWL2 = (xBase) => {
      ctx.save();
      ctx.strokeStyle = COLORS.alice;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const p1 = worldToScreen(xBase + beta * tMin, tMin, origin, scale, true);
      const p2 = worldToScreen(xBase + beta * tMax, tMax, origin, scale, true);
      ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
      ctx.restore();
    };
    drawWL2(-halfL);
    drawWL2(halfL);

    // Label
    const lblT = -R + 1.5;
    const midX = beta * lblT;
    const lp = worldToScreen(midX, lblT, origin, scale, true);
    drawLabel(ctx, "Ship's worldtube", lp.sx, lp.sy, {
      font: 'italic 12px Georgia, serif', color: COLORS.alice,
      bg: COLORS.bgCanvas, bgPad: 3,
    });

    // ── Alice's slice: horizontal at t=0 ──
    const pbA = worldToScreen(-halfL, 0, origin, scale, true);
    const pfA = worldToScreen(halfL, 0, origin, scale, true);

    ctx.save();
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pbA.sx, pbA.sy); ctx.lineTo(pfA.sx, pfA.sy); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath(); ctx.arc(pbA.sx, pbA.sy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(pfA.sx, pfA.sy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    drawBracket(ctx, pbA.sx, pbA.sy + 4, pfA.sx, pfA.sy + 4,
      'L = ' + L.toFixed(2) + ' (contracted)', {
        color: COLORS.accent, side: 'bottom', offset: 16,
        font: 'bold 12px Georgia, serif', labelColor: COLORS.accent,
      });

    drawLabel(ctx, "Alice's 'now' (horizontal)", pfA.sx + 10, pfA.sy + 4, {
      font: 'italic 11px Georgia, serif', color: COLORS.accent, align: 'left',
      bg: COLORS.bgCanvas, bgPad: 2,
    });

    // ── Bob's slice: tilted through origin, slope = beta ──
    if (beta > 0.01) {
      // Bob's now: t = beta * x
      // Intersect with back worldline: x = -halfL + beta*t, t = beta*x
      // t = beta*(-halfL + beta*t) → t(1-beta²) = -beta*halfL → t = -beta*halfL/(1-beta²)
      const tBack = -beta * halfL / (1 - beta * beta);
      const xBack = -halfL + beta * tBack;
      const tFront = beta * halfL / (1 - beta * beta);
      const xFront = halfL + beta * tFront;

      // Extend the line beyond the worldtube
      const ext1x = xBack - 1;
      const ext1t = beta * ext1x;
      const ext2x = xFront + 1;
      const ext2t = beta * ext2x;

      const p1 = worldToScreen(ext1x, ext1t, origin, scale, true);
      const p2 = worldToScreen(ext2x, ext2t, origin, scale, true);

      ctx.save();
      ctx.strokeStyle = COLORS.bob;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
      ctx.setLineDash([]);

      const pbB = worldToScreen(xBack, tBack, origin, scale, true);
      const pfB = worldToScreen(xFront, tFront, origin, scale, true);
      ctx.fillStyle = COLORS.bob;
      ctx.beginPath(); ctx.arc(pbB.sx, pbB.sy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pfB.sx, pfB.sy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      drawLabel(ctx, "Bob's 'now' (tilted)", p2.sx + 8, p2.sy, {
        font: 'italic 11px Georgia, serif', color: COLORS.bob, align: 'left',
        bg: COLORS.bgCanvas, bgPad: 2,
      });

      drawBracket(ctx, pbB.sx, pbB.sy - 4, pfB.sx, pfB.sy - 4,
        'L\u2080 = ' + L0.toFixed(1) + ' (rest)', {
          color: COLORS.bob, side: 'top', offset: 16,
          font: 'bold 12px Georgia, serif', labelColor: COLORS.bob,
        });
    }

    // ── Title and info ──
    drawLabel(ctx, "Alice's frame (ship moves \u2192)", w / 2, 16, {
      font: 'bold 14px Georgia, serif', color: COLORS.accent,
      bg: COLORS.bgCanvas, bgPad: 4,
    });

    drawLabel(ctx, 'Alice: L = ' + L.toFixed(2), w - 80, 20, {
      font: 'bold 13px Georgia, serif', color: COLORS.accent, align: 'center',
    });
    if (beta > 0.01) {
      drawLabel(ctx, 'Bob: L\u2080 = ' + L0.toFixed(1), w - 80, 40, {
        font: 'bold 13px Georgia, serif', color: COLORS.bob, align: 'center',
      });
      drawLabel(ctx, '\u03B3 = ' + g.toFixed(3), w - 80, 60, {
        font: '12px Georgia, serif', color: COLORS.inkLight, align: 'center',
      });
    }
  }
}

registerScene('length-contract-bob', (canvas, opts) => new LengthContractScene(canvas, opts));
