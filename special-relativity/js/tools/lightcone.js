// Light cone rendering for spacetime diagrams (world coordinates)

import { COLORS } from './colors.js';
import { worldToScreen } from './canvas-utils.js';

/**
 * Draw a light cone emanating from an event at (x0, t0) in world coordinates.
 * Light travels at 45 degrees (c=1 natural units), so the cone boundaries have slope +/-1.
 * Uses yUp=true for spacetime diagram convention (t points up).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x0 — world x of the event
 * @param {number} t0 — world t of the event
 * @param {{ x: number, y: number }} origin — pixel position of world origin
 * @param {number} scale — pixels per world unit
 * @param {object} [opts]
 * @param {string}  [opts.color]      — line color for cone boundaries (default COLORS.lightconeLine)
 * @param {number}  [opts.lineWidth]  — default 1
 * @param {boolean} [opts.dashed]     — dash the boundary lines (default false)
 * @param {boolean} [opts.future]     — draw the future light cone (default true)
 * @param {boolean} [opts.past]       — draw the past light cone (default false)
 * @param {boolean} [opts.fill]       — fill the cone interior (default false)
 * @param {string}  [opts.fillColor]  — interior fill color (default COLORS.lightcone)
 * @param {number}  [opts.extent]     — how far the cone lines extend in world time units (default 5)
 */
export function drawLightCone(ctx, x0, t0, origin, scale, opts = {}) {
  const color = opts.color || COLORS.lightconeLine;
  const lineWidth = opts.lineWidth || 1;
  const dashed = opts.dashed || false;
  const future = opts.future !== undefined ? opts.future : true;
  const past = opts.past || false;
  const fill = opts.fill || false;
  const fillColor = opts.fillColor || COLORS.lightcone;
  const extent = opts.extent || 5;

  const eventScreen = worldToScreen(x0, t0, origin, scale, true);

  ctx.save();

  // --- Future cone ---
  if (future) {
    // Future right: (x0 + e, t0 + e), Future left: (x0 - e, t0 + e)
    const fr = worldToScreen(x0 + extent, t0 + extent, origin, scale, true);
    const fl = worldToScreen(x0 - extent, t0 + extent, origin, scale, true);

    if (fill) {
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(eventScreen.sx, eventScreen.sy);
      ctx.lineTo(fr.sx, fr.sy);
      ctx.lineTo(fl.sx, fl.sy);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (dashed) ctx.setLineDash([5, 4]);

    // Right boundary
    ctx.beginPath();
    ctx.moveTo(eventScreen.sx, eventScreen.sy);
    ctx.lineTo(fr.sx, fr.sy);
    ctx.stroke();

    // Left boundary
    ctx.beginPath();
    ctx.moveTo(eventScreen.sx, eventScreen.sy);
    ctx.lineTo(fl.sx, fl.sy);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  // --- Past cone ---
  if (past) {
    // Past right: (x0 + e, t0 - e), Past left: (x0 - e, t0 - e)
    const pr = worldToScreen(x0 + extent, t0 - extent, origin, scale, true);
    const pl = worldToScreen(x0 - extent, t0 - extent, origin, scale, true);

    if (fill) {
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(eventScreen.sx, eventScreen.sy);
      ctx.lineTo(pr.sx, pr.sy);
      ctx.lineTo(pl.sx, pl.sy);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (dashed) ctx.setLineDash([5, 4]);

    // Right boundary
    ctx.beginPath();
    ctx.moveTo(eventScreen.sx, eventScreen.sy);
    ctx.lineTo(pr.sx, pr.sy);
    ctx.stroke();

    // Left boundary
    ctx.beginPath();
    ctx.moveTo(eventScreen.sx, eventScreen.sy);
    ctx.lineTo(pl.sx, pl.sy);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  ctx.restore();
}
