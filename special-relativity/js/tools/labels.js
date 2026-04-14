// Text rendering utilities for canvas labels, annotations, and brackets

import { COLORS } from './colors.js';

/**
 * Draw a text label at the given screen position.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x — screen x
 * @param {number} y — screen y
 * @param {object} [opts]
 * @param {string}  [opts.font]      — CSS font string (default '13px Georgia, serif')
 * @param {string}  [opts.color]     — text color
 * @param {string}  [opts.align]     — textAlign (default 'center')
 * @param {string}  [opts.baseline]  — textBaseline (default 'middle')
 * @param {string}  [opts.bg]        — background fill color behind text
 * @param {number}  [opts.bgPad]     — padding around the background rect in px (default 3)
 * @param {number}  [opts.maxWidth]  — max width for the text
 */
export function drawLabel(ctx, text, x, y, opts = {}) {
  const font = opts.font || '13px Georgia, serif';
  const color = opts.color || COLORS.ink;
  const align = opts.align || 'center';
  const baseline = opts.baseline || 'middle';
  const bgPad = opts.bgPad ?? 3;

  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  // Background rect
  if (opts.bg) {
    const metrics = ctx.measureText(text);
    const tw = opts.maxWidth ? Math.min(metrics.width, opts.maxWidth) : metrics.width;
    const th = parseInt(font, 10) || 13;

    // Compute rect x based on alignment
    let rx;
    if (align === 'center') rx = x - tw / 2 - bgPad;
    else if (align === 'right') rx = x - tw - bgPad;
    else rx = x - bgPad;

    // Compute rect y based on baseline
    let ry;
    if (baseline === 'middle') ry = y - th / 2 - bgPad;
    else if (baseline === 'bottom') ry = y - th - bgPad;
    else ry = y - bgPad;

    ctx.fillStyle = opts.bg;
    ctx.fillRect(rx, ry, tw + bgPad * 2, th + bgPad * 2);
  }

  ctx.fillStyle = color;
  if (opts.maxWidth) {
    ctx.fillText(text, x, y, opts.maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }

  ctx.restore();
}

/**
 * Draw an annotation: a leader line from a target point to a label position, with text.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} labelX — where the text goes (screen x)
 * @param {number} labelY — where the text goes (screen y)
 * @param {number} targetX — point being annotated (screen x)
 * @param {number} targetY — point being annotated (screen y)
 * @param {object} [opts]
 * @param {string}  [opts.font]
 * @param {string}  [opts.color]     — text color
 * @param {string}  [opts.lineColor] — leader line color
 * @param {number}  [opts.lineWidth]
 * @param {boolean} [opts.dashed]
 * @param {string}  [opts.align]     — text alignment at label end (default auto)
 */
export function drawAnnotation(ctx, text, labelX, labelY, targetX, targetY, opts = {}) {
  const font = opts.font || '12px Georgia, serif';
  const color = opts.color || COLORS.inkLight;
  const lineColor = opts.lineColor || COLORS.inkFaint;
  const lineWidth = opts.lineWidth || 1;
  const dashed = opts.dashed || false;

  // Determine text alignment from relative position if not specified
  const align = opts.align || (labelX >= targetX ? 'left' : 'right');

  ctx.save();

  // Leader line
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  if (dashed) ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(targetX, targetY);
  ctx.lineTo(labelX, labelY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label text
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const nudge = align === 'left' ? 4 : -4;
  ctx.fillText(text, labelX + nudge, labelY);

  ctx.restore();
}

/**
 * Draw a bracket (simple [ shape) between two points with a centered label.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {string} label — text to display at the bracket's midpoint
 * @param {object} [opts]
 * @param {string}  [opts.color]      — bracket line color
 * @param {number}  [opts.lineWidth]
 * @param {'left'|'right'|'top'|'bottom'} [opts.side] — which side the bracket extends toward (default 'bottom')
 * @param {string}  [opts.font]
 * @param {string}  [opts.labelColor]
 * @param {number}  [opts.offset]     — how far the bracket extends from the line between the two points (default 12)
 */
export function drawBracket(ctx, x1, y1, x2, y2, label, opts = {}) {
  const color = opts.color || COLORS.ink;
  const lineWidth = opts.lineWidth || 1.5;
  const side = opts.side || 'bottom';
  const font = opts.font || '12px Georgia, serif';
  const labelColor = opts.labelColor || opts.color || COLORS.ink;
  const offset = opts.offset || 12;

  // Compute perpendicular offset direction
  let dx = 0, dy = 0;
  switch (side) {
    case 'bottom': dy = offset; break;
    case 'top':    dy = -offset; break;
    case 'right':  dx = offset; break;
    case 'left':   dx = -offset; break;
  }

  // The bracket is 3 segments:
  // end-cap at p1 -> offset p1 -> offset p2 -> end-cap at p2
  const ox1 = x1 + dx, oy1 = y1 + dy;
  const ox2 = x2 + dx, oy2 = y2 + dy;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(ox1, oy1);
  ctx.lineTo(ox2, oy2);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Label at midpoint of the offset segment
  const mx = (ox1 + ox2) / 2;
  const my = (oy1 + oy2) / 2;

  ctx.font = font;
  ctx.fillStyle = labelColor;
  ctx.textAlign = 'center';

  // Place label further out from the bracket
  const labelNudge = 10;
  let lx = mx, ly = my;
  switch (side) {
    case 'bottom': ly += labelNudge; ctx.textBaseline = 'top'; break;
    case 'top':    ly -= labelNudge; ctx.textBaseline = 'bottom'; break;
    case 'right':  lx += labelNudge; ctx.textBaseline = 'middle'; break;
    case 'left':   lx -= labelNudge; ctx.textBaseline = 'middle'; break;
  }

  ctx.fillText(label, lx, ly);

  ctx.restore();
}
