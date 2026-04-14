// Spacetime diagram grid, axes, and tick marks

import { COLORS } from './colors.js';
import { worldToScreen } from './canvas-utils.js';

/**
 * Draw a faint grid of lines in world-coordinate space.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} origin — pixel position of world origin
 * @param {number} scale — pixels per world unit
 * @param {[number, number]} rangeX — [min, max] world x
 * @param {[number, number]} rangeT — [min, max] world t (y-axis in spacetime)
 * @param {object} [opts]
 * @param {string}  [opts.color]     — grid line color
 * @param {number}  [opts.lineWidth] — grid line width
 * @param {number}  [opts.step]      — spacing between grid lines in world units (default 1)
 */
export function drawGrid(ctx, origin, scale, rangeX, rangeT, opts = {}) {
  const color = opts.color || COLORS.grid;
  const lineWidth = opts.lineWidth || 0.5;
  const step = opts.step || 1;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  // Vertical lines (constant x)
  for (let x = Math.ceil(rangeX[0] / step) * step; x <= rangeX[1]; x += step) {
    const top = worldToScreen(x, rangeT[1], origin, scale, true);
    const bot = worldToScreen(x, rangeT[0], origin, scale, true);
    ctx.beginPath();
    ctx.moveTo(top.sx, top.sy);
    ctx.lineTo(bot.sx, bot.sy);
    ctx.stroke();
  }

  // Horizontal lines (constant t)
  for (let t = Math.ceil(rangeT[0] / step) * step; t <= rangeT[1]; t += step) {
    const left  = worldToScreen(rangeX[0], t, origin, scale, true);
    const right = worldToScreen(rangeX[1], t, origin, scale, true);
    ctx.beginPath();
    ctx.moveTo(left.sx, left.sy);
    ctx.lineTo(right.sx, right.sy);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw the main x and t axes through the origin with arrowheads.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} origin — pixel position of world origin
 * @param {number} scale — pixels per world unit
 * @param {object} [opts]
 * @param {string}  [opts.xLabel]    — label for the x-axis (default 'x')
 * @param {string}  [opts.tLabel]    — label for the t-axis (default 't')
 * @param {string}  [opts.color]     — axis color
 * @param {number}  [opts.lineWidth] — axis line width
 * @param {boolean} [opts.yUp]       — t axis points up (default true)
 * @param {[number, number]} [opts.xRange] — world range for x-axis extent
 * @param {[number, number]} [opts.tRange] — world range for t-axis extent
 */
export function drawAxes(ctx, origin, scale, opts = {}) {
  const color = opts.color || COLORS.ink;
  const lineWidth = opts.lineWidth || 1.5;
  const xLabel = opts.xLabel ?? 'x';
  const tLabel = opts.tLabel ?? 't';
  const yUp = opts.yUp !== undefined ? opts.yUp : true;
  const xRange = opts.xRange || [-4, 4];
  const tRange = opts.tRange || [-1, 6];
  const headSize = 8;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  // --- X axis ---
  const xStart = worldToScreen(xRange[0], 0, origin, scale, yUp);
  const xEnd   = worldToScreen(xRange[1], 0, origin, scale, yUp);
  ctx.beginPath();
  ctx.moveTo(xStart.sx, xStart.sy);
  ctx.lineTo(xEnd.sx, xEnd.sy);
  ctx.stroke();

  // Arrowhead on x-axis (positive direction)
  _drawArrowhead(ctx, xEnd.sx, xEnd.sy, 0, headSize, color);

  // X label
  if (xLabel) {
    ctx.font = 'italic 14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(xLabel, xEnd.sx - 2, xEnd.sy + 8);
  }

  // --- T axis ---
  const tStart = worldToScreen(0, tRange[0], origin, scale, yUp);
  const tEnd   = worldToScreen(0, tRange[1], origin, scale, yUp);
  ctx.beginPath();
  ctx.moveTo(tStart.sx, tStart.sy);
  ctx.lineTo(tEnd.sx, tEnd.sy);
  ctx.stroke();

  // Arrowhead on t-axis (positive direction = upward if yUp)
  const tAngle = yUp ? -Math.PI / 2 : Math.PI / 2;
  _drawArrowhead(ctx, tEnd.sx, tEnd.sy, tAngle, headSize, color);

  // T label
  if (tLabel) {
    ctx.font = 'italic 14px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tLabel, tEnd.sx + 8, tEnd.sy + 2);
  }

  ctx.restore();
}

/**
 * Draw tick marks along an axis.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} origin
 * @param {number} scale
 * @param {'x'|'t'} axis — which axis to draw ticks on
 * @param {number} interval — one tick per `interval` world units
 * @param {object} [opts]
 * @param {number}  [opts.size]      — tick half-length in pixels (default 4)
 * @param {string}  [opts.color]
 * @param {boolean} [opts.labels]    — show numeric labels (default false)
 * @param {boolean} [opts.yUp]       — default true
 * @param {[number, number]} [opts.range] — world range for ticks
 */
export function drawTickMarks(ctx, origin, scale, axis, interval, opts = {}) {
  const size = opts.size || 4;
  const color = opts.color || COLORS.ink;
  const labels = opts.labels || false;
  const yUp = opts.yUp !== undefined ? opts.yUp : true;
  const range = opts.range || (axis === 'x' ? [-4, 4] : [-1, 6]);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;

  const start = Math.ceil(range[0] / interval) * interval;

  for (let v = start; v <= range[1]; v += interval) {
    if (Math.abs(v) < 1e-9) continue; // skip origin

    let p, perpX, perpY;

    if (axis === 'x') {
      p = worldToScreen(v, 0, origin, scale, yUp);
      perpX = 0;
      perpY = size;
    } else {
      p = worldToScreen(0, v, origin, scale, yUp);
      perpX = size;
      perpY = 0;
    }

    ctx.beginPath();
    ctx.moveTo(p.sx - perpX, p.sy - perpY);
    ctx.lineTo(p.sx + perpX, p.sy + perpY);
    ctx.stroke();

    if (labels) {
      ctx.font = '11px Georgia, serif';
      if (axis === 'x') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(String(v), p.sx, p.sy + size + 3);
      } else {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(v), p.sx - size - 3, p.sy);
      }
    }
  }

  ctx.restore();
}

// ---- internal helper ----

function _drawArrowhead(ctx, tipX, tipY, angle, size, color) {
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
