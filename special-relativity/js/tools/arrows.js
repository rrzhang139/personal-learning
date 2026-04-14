// Arrow drawing primitives (screen coordinates)

import { COLORS } from './colors.js';

/**
 * Draw an arrow from (x1, y1) to (x2, y2) with an arrowhead at the tip.
 * All coordinates are in screen pixels.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {object} [opts]
 * @param {string}  [opts.color]       — line and head color
 * @param {number}  [opts.lineWidth]   — line thickness
 * @param {number}  [opts.headSize]    — arrowhead length in pixels (default 10)
 * @param {boolean} [opts.dashed]      — draw a dashed line
 * @param {string}  [opts.label]       — text to draw at the midpoint
 * @param {{ dx: number, dy: number }} [opts.labelOffset] — pixel offset for the label
 */
export function drawArrow(ctx, x1, y1, x2, y2, opts = {}) {
  const color = opts.color || COLORS.ink;
  const lineWidth = opts.lineWidth || 1.5;
  const headSize = opts.headSize || 10;
  const dashed = opts.dashed || false;

  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  // Shaft
  if (dashed) {
    ctx.setLineDash([6, 4]);
  }
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrowhead
  arrowhead(ctx, x2, y2, angle, headSize, { color, filled: true });

  // Label at midpoint
  if (opts.label) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const off = opts.labelOffset || { dx: 0, dy: -10 };
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(opts.label, mx + off.dx, my + off.dy);
  }

  ctx.restore();
}

/**
 * Draw just the arrowhead triangle at a given tip position.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} tipX
 * @param {number} tipY
 * @param {number} angle  — direction the arrow points (radians)
 * @param {number} size   — length of the arrowhead in pixels
 * @param {object} [opts]
 * @param {string}  [opts.color]
 * @param {boolean} [opts.filled] — fill the triangle (default true)
 */
export function arrowhead(ctx, tipX, tipY, angle, size, opts = {}) {
  const color = opts.color || COLORS.ink;
  const filled = opts.filled !== undefined ? opts.filled : true;
  const halfAngle = Math.PI / 7; // ~25 degrees opening

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(
    tipX - size * Math.cos(angle - halfAngle),
    tipY - size * Math.sin(angle - halfAngle)
  );
  ctx.lineTo(
    tipX - size * Math.cos(angle + halfAngle),
    tipY - size * Math.sin(angle + halfAngle)
  );
  ctx.closePath();

  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }

  ctx.restore();
}
