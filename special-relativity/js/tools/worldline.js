// Worldline rendering in spacetime diagrams (world coordinates, converts internally)

import { COLORS } from './colors.js';
import { worldToScreen } from './canvas-utils.js';

/**
 * Draw a polyline through a list of world-coordinate points on a spacetime diagram.
 * Uses yUp=true so the t-axis points upward.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, t: number }[]} points — world coordinates
 * @param {{ x: number, y: number }} origin — pixel position of world origin
 * @param {number} scale — pixels per world unit
 * @param {object} [opts]
 * @param {string}  [opts.color]     — line color
 * @param {number}  [opts.lineWidth]
 * @param {boolean} [opts.dashed]
 * @param {boolean} [opts.glow]      — add a subtle glow behind the line
 */
export function drawWorldline(ctx, points, origin, scale, opts = {}) {
  if (!points || points.length < 2) return;

  const color = opts.color || COLORS.ink;
  const lineWidth = opts.lineWidth || 2;
  const dashed = opts.dashed || false;
  const glow = opts.glow || false;

  const screenPts = points.map(p => worldToScreen(p.x, p.t, origin, scale, true));

  ctx.save();

  // Optional glow pass
  if (glow) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth + 4;
    ctx.globalAlpha = 0.15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(screenPts[0].sx, screenPts[0].sy);
    for (let i = 1; i < screenPts.length; i++) {
      ctx.lineTo(screenPts[i].sx, screenPts[i].sy);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Main line
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (dashed) ctx.setLineDash([6, 4]);

  ctx.beginPath();
  ctx.moveTo(screenPts[0].sx, screenPts[0].sy);
  for (let i = 1; i < screenPts.length; i++) {
    ctx.lineTo(screenPts[i].sx, screenPts[i].sy);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

/**
 * Draw an event marker (dot) at a world coordinate with optional label.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x — world x
 * @param {number} t — world t
 * @param {{ x: number, y: number }} origin — pixel position of world origin
 * @param {number} scale — pixels per world unit
 * @param {object} [opts]
 * @param {string}  [opts.color]       — dot color
 * @param {number}  [opts.radius]      — dot radius in px (default 4)
 * @param {string}  [opts.label]       — text label
 * @param {{ dx: number, dy: number }} [opts.labelOffset] — offset from the dot (default {dx:8, dy:-8})
 * @param {string}  [opts.font]
 */
export function drawEvent(ctx, x, t, origin, scale, opts = {}) {
  const color = opts.color || COLORS.accent;
  const radius = opts.radius || 4;
  const font = opts.font || '12px Georgia, serif';
  const labelOffset = opts.labelOffset || { dx: 8, dy: -8 };

  const { sx, sy } = worldToScreen(x, t, origin, scale, true);

  ctx.save();

  // Dot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(sx, sy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Label
  if (opts.label) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(opts.label, sx + labelOffset.dx, sy + labelOffset.dy);
  }

  ctx.restore();
}
