// Token-based formula rendering on canvas
//
// A formula is an array of tokens:
// { text: string, color?: string, size?: number, style?: string, sup?: string, sub?: string }

import { COLORS } from './colors.js';

/**
 * Render a formula (array of tokens) left-to-right at (x, y).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{ text: string, color?: string, size?: number, style?: string, sup?: string, sub?: string }>} tokens
 * @param {number} x — screen x
 * @param {number} y — screen y (baseline)
 * @param {object} [opts]
 * @param {string} [opts.baseFont]  — font family (default 'Georgia, serif')
 * @param {number} [opts.baseSize]  — base font size in px (default 16)
 * @param {string} [opts.baseColor] — default token color
 * @param {'left'|'center'|'right'} [opts.align] — horizontal alignment at x (default 'left')
 */
export function drawFormula(ctx, tokens, x, y, opts = {}) {
  const baseFont = opts.baseFont || 'Georgia, serif';
  const baseSize = opts.baseSize || 16;
  const baseColor = opts.baseColor || COLORS.ink;
  const align = opts.align || 'left';

  // If centered or right-aligned, measure first then offset
  let startX = x;
  if (align === 'center' || align === 'right') {
    const totalWidth = measureFormula(ctx, tokens, opts);
    if (align === 'center') startX = x - totalWidth / 2;
    else startX = x - totalWidth;
  }

  ctx.save();
  ctx.textBaseline = 'alphabetic';

  let curX = startX;

  for (const token of tokens) {
    const size = token.size || baseSize;
    const color = token.color || baseColor;
    const style = token.style || '';  // 'italic', 'bold', 'bold italic', etc.
    const fontStr = _buildFont(style, size, baseFont);

    // Draw main text
    ctx.font = fontStr;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.fillText(token.text, curX, y);

    const mainWidth = ctx.measureText(token.text).width;

    // Superscript
    if (token.sup) {
      const supSize = Math.round(size * 0.6);
      const supFont = _buildFont(style, supSize, baseFont);
      ctx.font = supFont;
      ctx.fillStyle = color;
      const supY = y - size * 0.4;
      ctx.fillText(token.sup, curX + mainWidth, supY);
    }

    // Subscript
    if (token.sub) {
      const subSize = Math.round(size * 0.6);
      const subFont = _buildFont(style, subSize, baseFont);
      ctx.font = subFont;
      ctx.fillStyle = color;
      const subY = y + size * 0.2;
      ctx.fillText(token.sub, curX + mainWidth, subY);
    }

    // Advance cursor: main text + sup/sub width
    let extra = 0;
    if (token.sup) {
      const supSize = Math.round(size * 0.6);
      ctx.font = _buildFont(style, supSize, baseFont);
      extra = Math.max(extra, ctx.measureText(token.sup).width);
    }
    if (token.sub) {
      const subSize = Math.round(size * 0.6);
      ctx.font = _buildFont(style, subSize, baseFont);
      extra = Math.max(extra, ctx.measureText(token.sub).width);
    }

    curX += mainWidth + extra;
  }

  ctx.restore();
}

/**
 * Measure the total width of a formula without drawing it.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{ text: string, color?: string, size?: number, style?: string, sup?: string, sub?: string }>} tokens
 * @param {object} [opts]
 * @param {string} [opts.baseFont]
 * @param {number} [opts.baseSize]
 * @returns {number} total width in pixels
 */
export function measureFormula(ctx, tokens, opts = {}) {
  const baseFont = opts.baseFont || 'Georgia, serif';
  const baseSize = opts.baseSize || 16;

  ctx.save();
  let totalWidth = 0;

  for (const token of tokens) {
    const size = token.size || baseSize;
    const style = token.style || '';
    const fontStr = _buildFont(style, size, baseFont);

    ctx.font = fontStr;
    const mainWidth = ctx.measureText(token.text).width;

    let extra = 0;
    if (token.sup) {
      const supSize = Math.round(size * 0.6);
      ctx.font = _buildFont(style, supSize, baseFont);
      extra = Math.max(extra, ctx.measureText(token.sup).width);
    }
    if (token.sub) {
      const subSize = Math.round(size * 0.6);
      ctx.font = _buildFont(style, subSize, baseFont);
      extra = Math.max(extra, ctx.measureText(token.sub).width);
    }

    totalWidth += mainWidth + extra;
  }

  ctx.restore();
  return totalWidth;
}

/**
 * Draw a multi-line derivation, revealing steps progressively.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<Array<{ text: string, color?: string, size?: number, style?: string, sup?: string, sub?: string }>>} steps
 *   — array of token arrays, one per derivation line
 * @param {number} currentStep — how many steps to show (0-indexed, shows steps 0..currentStep)
 * @param {number} x — screen x
 * @param {number} y — screen y of the first line
 * @param {object} [opts]
 * @param {number}  [opts.lineSpacing] — vertical distance between lines (default 28)
 * @param {number}  [opts.dimOpacity]  — opacity for previous (non-current) steps (default 0.4)
 * @param {string}  [opts.baseFont]
 * @param {number}  [opts.baseSize]
 * @param {string}  [opts.baseColor]
 * @param {'left'|'center'|'right'} [opts.align]
 */
export function drawDerivation(ctx, steps, currentStep, x, y, opts = {}) {
  const lineSpacing = opts.lineSpacing || 28;
  const dimOpacity = opts.dimOpacity ?? 0.4;

  const clamped = Math.max(0, Math.min(currentStep, steps.length - 1));

  ctx.save();

  for (let i = 0; i <= clamped; i++) {
    const isCurrent = i === clamped;
    ctx.globalAlpha = isCurrent ? 1 : dimOpacity;
    drawFormula(ctx, steps[i], x, y + i * lineSpacing, opts);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ---- internal helper ----

function _buildFont(style, size, family) {
  const prefix = style ? style + ' ' : '';
  return `${prefix}${size}px ${family}`;
}
