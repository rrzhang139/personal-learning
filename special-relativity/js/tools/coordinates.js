// Lorentz-boosted coordinate frames and simultaneity lines

import { COLORS } from './colors.js';
import { worldToScreen } from './canvas-utils.js';

/**
 * Lorentz factor gamma for a given velocity beta (in units of c).
 * @param {number} beta — v/c, must satisfy |beta| < 1
 * @returns {number}
 */
export function gamma(beta) {
  return 1 / Math.sqrt(1 - beta * beta);
}

/**
 * Lorentz transformation from frame S to frame S' moving at velocity beta.
 * Uses natural units (c = 1).
 * @param {number} x — position in S
 * @param {number} t — time in S
 * @param {number} beta — v/c of S' relative to S
 * @returns {{ xp: number, tp: number }}
 */
export function lorentzTransform(x, t, beta) {
  const g = gamma(beta);
  return {
    xp: g * (x - beta * t),
    tp: g * (t - beta * x),
  };
}

/**
 * Draw both axes of a Lorentz-boosted reference frame.
 *
 * For a frame moving at velocity beta (in natural units c=1):
 * - The t' axis (worldline of the moving origin) tilts from vertical by angle arctan(beta) toward the light cone
 * - The x' axis (line of simultaneity through the origin) tilts from horizontal by the same angle toward the light cone
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} origin — pixel position of the world origin
 * @param {number} scale — pixels per world unit
 * @param {number} beta — velocity of the boosted frame (v/c)
 * @param {object} [opts]
 * @param {string}  [opts.color]      — axis color
 * @param {number}  [opts.lineWidth]
 * @param {string}  [opts.xLabel]     — label for x' axis (default "x'")
 * @param {string}  [opts.tLabel]     — label for t' axis (default "t'")
 * @param {number}  [opts.extent]     — how far axes extend in world units (default 5)
 * @param {boolean} [opts.dashed]     — draw dashed axes (default false)
 * @param {boolean} [opts.gridLines]  — draw grid lines of constant x' and t' (default false)
 * @param {string}  [opts.gridColor]  — color for grid lines
 */
export function drawFrame(ctx, origin, scale, beta, opts = {}) {
  const color = opts.color || COLORS.alice;
  const lineWidth = opts.lineWidth || 1.5;
  const xLabel = opts.xLabel ?? "x'";
  const tLabel = opts.tLabel ?? "t'";
  const extent = opts.extent || 5;
  const dashed = opts.dashed || false;
  const gridLines = opts.gridLines || false;
  const gridColor = opts.gridColor || color;
  const headSize = 7;

  // Tilt angle: both axes tilt by arctan(beta) toward the 45-degree light cone line
  // t' axis direction in world coords: (beta, 1) normalized scaled by extent
  // x' axis direction in world coords: (1, beta) normalized scaled by extent

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  if (dashed) ctx.setLineDash([6, 4]);

  // --- t' axis ---
  // The t' axis goes through (x, t) = k*(beta, 1) for k in [-extent, extent]
  const tNeg = worldToScreen(-extent * beta, -extent, origin, scale, true);
  const tPos = worldToScreen(extent * beta, extent, origin, scale, true);

  ctx.beginPath();
  ctx.moveTo(tNeg.sx, tNeg.sy);
  ctx.lineTo(tPos.sx, tPos.sy);
  ctx.stroke();

  // Arrowhead on t' axis (positive end)
  const tAngle = Math.atan2(tNeg.sy - tPos.sy, tPos.sx - tNeg.sx); // screen angle
  _arrowhead(ctx, tPos.sx, tPos.sy, tAngle, headSize, color);

  // t' label
  if (tLabel) {
    ctx.setLineDash([]);
    ctx.font = 'italic 13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tLabel, tPos.sx + 8, tPos.sy);
    if (dashed) ctx.setLineDash([6, 4]);
  }

  // --- x' axis ---
  // The x' axis goes through (x, t) = k*(1, beta) for k in [-extent, extent]
  const xNeg = worldToScreen(-extent, -extent * beta, origin, scale, true);
  const xPos = worldToScreen(extent, extent * beta, origin, scale, true);

  ctx.beginPath();
  ctx.moveTo(xNeg.sx, xNeg.sy);
  ctx.lineTo(xPos.sx, xPos.sy);
  ctx.stroke();

  // Arrowhead on x' axis (positive end)
  const xAngle = Math.atan2(xPos.sy - xNeg.sy, xPos.sx - xNeg.sx);
  _arrowhead(ctx, xPos.sx, xPos.sy, xAngle, headSize, color);

  // x' label
  if (xLabel) {
    ctx.setLineDash([]);
    ctx.font = 'italic 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(xLabel, xPos.sx, xPos.sy + 8);
    if (dashed) ctx.setLineDash([6, 4]);
  }

  ctx.setLineDash([]);

  // --- Grid lines (constant x' and constant t') ---
  if (gridLines) {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;

    // Lines of constant t': parallel to x' axis, offset along t' axis
    for (let k = -extent; k <= extent; k++) {
      if (k === 0) continue;
      // Offset along t' direction, then draw a line in x' direction
      const baseX = k * beta;
      const baseT = k * 1;
      const p1 = worldToScreen(baseX - extent, baseT - extent * beta, origin, scale, true);
      const p2 = worldToScreen(baseX + extent, baseT + extent * beta, origin, scale, true);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    }

    // Lines of constant x': parallel to t' axis, offset along x' axis
    for (let k = -extent; k <= extent; k++) {
      if (k === 0) continue;
      const baseX = k * 1;
      const baseT = k * beta;
      const p1 = worldToScreen(baseX - extent * beta, baseT - extent, origin, scale, true);
      const p2 = worldToScreen(baseX + extent * beta, baseT + extent, origin, scale, true);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

/**
 * Draw a line of constant t' (simultaneity line) through the spacetime diagram.
 *
 * For a frame moving at velocity beta, a line of constant t' = T has slope beta
 * in the (x, t) plane. Specifically, t = beta * x + T/gamma (when expressed in S coordinates
 * passing through the t' axis at world time T/gamma... but more precisely, the line
 * of events where t' = T is: t = beta * x + T * gamma * (1 - beta^2) = beta * x + T / gamma.
 *
 * Simpler: the locus t' = T in (x, t) coords satisfies: gamma*(t - beta*x) = T,
 * so t = beta*x + T/gamma.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} tPrime — the t' value (proper time in the boosted frame)
 * @param {{ x: number, y: number }} origin
 * @param {number} scale
 * @param {number} beta
 * @param {object} [opts]
 * @param {string}  [opts.color]
 * @param {number}  [opts.lineWidth]
 * @param {boolean} [opts.dashed]
 * @param {number}  [opts.extent]    — x-range for the line in world units (default 5)
 * @param {string}  [opts.label]     — label to draw at the right end
 */
export function drawSimultaneityLine(ctx, tPrime, origin, scale, beta, opts = {}) {
  const color = opts.color || COLORS.alice;
  const lineWidth = opts.lineWidth || 1;
  const dashed = opts.dashed !== undefined ? opts.dashed : true;
  const extent = opts.extent || 5;
  const g = gamma(beta);
  const tIntercept = tPrime / g;

  // Line: t = beta * x + tIntercept
  const x1 = -extent;
  const t1 = beta * x1 + tIntercept;
  const x2 = extent;
  const t2 = beta * x2 + tIntercept;

  const p1 = worldToScreen(x1, t1, origin, scale, true);
  const p2 = worldToScreen(x2, t2, origin, scale, true);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  if (dashed) ctx.setLineDash([5, 4]);

  ctx.beginPath();
  ctx.moveTo(p1.sx, p1.sy);
  ctx.lineTo(p2.sx, p2.sy);
  ctx.stroke();
  ctx.setLineDash([]);

  if (opts.label) {
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(opts.label, p2.sx + 4, p2.sy - 2);
  }

  ctx.restore();
}

// ---- internal helper ----

function _arrowhead(ctx, tipX, tipY, angle, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(tipX, tipY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.4);
  ctx.lineTo(-size, size * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
