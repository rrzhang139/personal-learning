// DPI-aware canvas setup and coordinate transforms

import { COLORS } from './colors.js';

/**
 * Set up a canvas for high-DPI rendering.
 * Adjusts the canvas buffer size for devicePixelRatio and scales the context.
 * @param {HTMLCanvasElement} canvas
 * @param {number} width  — logical CSS width in pixels
 * @param {number} height — logical CSS height in pixels
 * @returns {{ ctx: CanvasRenderingContext2D, dpr: number, width: number, height: number }}
 */
export function setupCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  return { ctx, dpr, width, height };
}

/**
 * Clear the entire canvas and fill with a background color.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {string} [color] — defaults to COLORS.bgCanvas
 */
export function clearCanvas(ctx, canvas, color) {
  const fillColor = color || COLORS.bgCanvas;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

/**
 * Convert world coordinates to screen (pixel) coordinates.
 * @param {number} x — world x
 * @param {number} y — world y (or t for spacetime diagrams)
 * @param {{ x: number, y: number }} origin — pixel position of the world origin on canvas
 * @param {number} scale — pixels per world unit
 * @param {boolean} [yUp=false] — if true, positive y points upward (for spacetime: t goes up)
 * @returns {{ sx: number, sy: number }}
 */
export function worldToScreen(x, y, origin, scale, yUp = false) {
  const sx = origin.x + x * scale;
  const sy = yUp
    ? origin.y - y * scale
    : origin.y + y * scale;
  return { sx, sy };
}

/**
 * Convert screen (pixel) coordinates back to world coordinates.
 * @param {number} px — screen x
 * @param {number} py — screen y
 * @param {{ x: number, y: number }} origin — pixel position of the world origin on canvas
 * @param {number} scale — pixels per world unit
 * @param {boolean} [yUp=false]
 * @returns {{ x: number, y: number }}
 */
export function screenToWorld(px, py, origin, scale, yUp = false) {
  const x = (px - origin.x) / scale;
  const y = yUp
    ? (origin.y - py) / scale
    : (py - origin.y) / scale;
  return { x, y };
}
