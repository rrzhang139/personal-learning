// Length contraction: Alice's frame. The ship MOVES, so the worldtube is TILTED.
// Two parallel tilted worldlines (same slope = beta). Fixed rest length L0.
// Alice's horizontal "now" catches a shorter cross-section.
// Bob's tilted "now" catches the full rest length.
// Origin centered. Worldlines pivot on the x-axis at fixed points.

import { registerScene } from './registry.js';
import { clearCanvas, worldToScreen } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawGrid, drawAxes, drawTickMarks } from '../tools/grid.js';
import { drawWorldline } from '../tools/worldline.js';
import { drawLabel, drawBracket } from '../tools/labels.js';
import { gamma } from '../tools/coordinates.js';

const L0 = 2.4;

class LengthContractAliceScene {
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
    const L = L0 / g; // contracted length (what Alice measures horizontally)
    const R = 5;
    const halfL = L / 2;

    // Grid and axes
    drawGrid(ctx, origin, scale, [-R, R], [-R, R], { color: COLORS.grid });
    drawAxes(ctx, origin, scale, {
      xLabel: 'x', tLabel: 't', color: COLORS.ink, lineWidth: 1.5,
      xRange: [-R, R], tRange: [-R, R],
    });
    drawTickMarks(ctx, origin, scale, 'x', 1, { labels: true, range: [-R + 1, R - 1] });
    drawTickMarks(ctx, origin, scale, 't', 1, { labels: true, range: [-R + 1, R - 1] });

    // ── Tilted worldtube ──
    // In Alice's frame the ship moves at velocity beta.
    // At t=0: back at x = -L/2, front at x = +L/2 (contracted positions)
    // Both worldlines have slope beta (tilted, parallel).
    const tMin = -R, tMax = R;

    // Worldtube fill
    ctx.save();
    ctx.fillStyle = 'rgba(26, 82, 118, 0.06)';
    ctx.beginPath();
    const steps = 40;
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

    // Back and front worldlines (parallel, same slope)
    const backPts = [], frontPts = [];
    for (let t = tMin; t <= tMax; t += 0.2) {
      backPts.push({ x: -halfL + beta * t, t });
      frontPts.push({ x: halfL + beta * t, t });
    }
    drawWorldline(ctx, backPts, origin, scale, { color: COLORS.alice, lineWidth: 2.2 });
    drawWorldline(ctx, frontPts, origin, scale, { color: COLORS.alice, lineWidth: 2.2 });

    // Worldtube label
    const lblT = -R + 1.5;
    const midX = beta * lblT;
    const lp = worldToScreen(midX, lblT, origin, scale, true);
    drawLabel(ctx, "Ship's worldtube (moving)", lp.sx, lp.sy, {
      font: 'italic 12px Georgia, serif', color: COLORS.alice,
      bg: COLORS.bgCanvas, bgPad: 3,
    });

    // ── Alice's horizontal "now" at t=0 ──
    const pbA = worldToScreen(-halfL, 0, origin, scale, true);
    const pfA = worldToScreen(halfL, 0, origin, scale, true);

    ctx.save();
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pbA.sx, pbA.sy);
    ctx.lineTo(pfA.sx, pfA.sy);
    ctx.stroke();
    ctx.restore();

    // Dots
    ctx.save();
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath(); ctx.arc(pbA.sx, pbA.sy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(pfA.sx, pfA.sy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Bracket
    drawBracket(ctx, pbA.sx, pbA.sy + 4, pfA.sx, pfA.sy + 4,
      'L = ' + L.toFixed(2) + ' (contracted)', {
        color: COLORS.accent, side: 'bottom', offset: 16,
        font: 'bold 12px Georgia, serif', labelColor: COLORS.accent,
      });

    drawLabel(ctx, "Alice's 'now' (horizontal)", pfA.sx + 10, pfA.sy + 4, {
      font: 'italic 11px Georgia, serif', color: COLORS.accent, align: 'left',
      bg: COLORS.bgCanvas, bgPad: 2,
    });

    // ── Bob's tilted "now" through origin ──
    // Bob moves with the ship at velocity beta. His "now" has slope beta.
    if (beta > 0.01) {
      // Bob's now-line: t = beta * x
      // Intersection with back worldline: x = -halfL + beta*t and t = beta*x
      // => t = beta*(-halfL + beta*t) => t(1-beta²) = -beta*halfL => t = -beta*halfL/(1-beta²)
      const tBack = -beta * halfL / (1 - beta * beta);
      const xBack = -halfL + beta * tBack;
      const tFront = beta * halfL / (1 - beta * beta);
      const xFront = halfL + beta * tFront;

      // Draw the line
      const extX1 = xBack - 1;
      const extT1 = beta * extX1;
      const extX2 = xFront + 1;
      const extT2 = beta * extX2;

      const p1 = worldToScreen(extX1, extT1, origin, scale, true);
      const p2 = worldToScreen(extX2, extT2, origin, scale, true);

      ctx.save();
      ctx.strokeStyle = COLORS.bob;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
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

    // ── Info ──
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

registerScene('length-contract-alice', (canvas, opts) => new LengthContractAliceScene(canvas, opts));
