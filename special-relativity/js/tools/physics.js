// Physical scene objects: people, mirrors, photons, rockets, etc.
// All coordinates are in screen pixels. Callers convert world->screen before calling.

import { COLORS } from './colors.js';

/**
 * Draw a simple stick figure.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x — center x (feet position)
 * @param {number} y — bottom y (ground level)
 * @param {string} label — name drawn below the figure
 * @param {string} color
 * @param {object} [opts]
 * @param {number} [opts.scale] — size multiplier (default 1 => ~40px tall)
 * @param {string} [opts.font]
 */
export function drawPerson(ctx, x, y, label, color, opts = {}) {
  const s = opts.scale || 1;
  const font = opts.font || `${Math.round(11 * s)}px Georgia, serif`;
  const h = 40 * s; // total height
  const headR = 5 * s;
  const bodyLen = 16 * s;
  const limbLen = 10 * s;

  const headY = y - h + headR;
  const neckY = headY + headR;
  const hipY = neckY + bodyLen;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5 * s;
  ctx.lineCap = 'round';

  // Head
  ctx.beginPath();
  ctx.arc(x, headY, headR, 0, Math.PI * 2);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(x, neckY);
  ctx.lineTo(x, hipY);
  ctx.stroke();

  // Arms (from mid-body)
  const shoulderY = neckY + bodyLen * 0.25;
  ctx.beginPath();
  ctx.moveTo(x - limbLen, shoulderY + limbLen * 0.4);
  ctx.lineTo(x, shoulderY);
  ctx.lineTo(x + limbLen, shoulderY + limbLen * 0.4);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(x - limbLen * 0.7, y);
  ctx.lineTo(x, hipY);
  ctx.lineTo(x + limbLen * 0.7, y);
  ctx.stroke();

  // Label
  if (label) {
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x, y + 4 * s);
  }

  ctx.restore();
}

/**
 * Draw a mirror: thick line with diagonal hash marks on one side.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {object} [opts]
 * @param {string}  [opts.color]    — mirror line color
 * @param {number}  [opts.lineWidth]
 * @param {'left'|'right'} [opts.hashSide] — which side of the line to draw hashes (default 'right')
 */
export function drawMirror(ctx, x1, y1, x2, y2, opts = {}) {
  const color = opts.color || COLORS.inkLight;
  const lineWidth = opts.lineWidth || 3;
  const hashSide = opts.hashSide || 'right';

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;

  // Unit tangent and normal
  const tx = dx / len;
  const ty = dy / len;
  // Normal pointing to the 'right' side when traveling from p1 to p2
  let nx = -ty;
  let ny = tx;
  if (hashSide === 'left') {
    nx = ty;
    ny = -tx;
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  // Main mirror line
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Hash marks
  const hashLen = 6;
  const hashSpacing = 8;
  const numHashes = Math.floor(len / hashSpacing);
  ctx.lineWidth = 1;

  for (let i = 1; i <= numHashes; i++) {
    const frac = i / (numHashes + 1);
    const bx = x1 + dx * frac;
    const by = y1 + dy * frac;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + (nx - tx) * hashLen, by + (ny - ty) * hashLen);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw a photon: filled circle with a glow effect.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {object} [opts]
 * @param {number} [opts.radius]    — default 4
 * @param {string} [opts.color]     — default COLORS.photon
 * @param {number} [opts.glowRadius] — shadow blur radius (default 12)
 * @param {string} [opts.glowColor]  — default COLORS.photonGlow
 */
export function drawPhoton(ctx, x, y, opts = {}) {
  const radius = opts.radius || 4;
  const color = opts.color || COLORS.photon;
  const glowRadius = opts.glowRadius || 12;
  const glowColor = opts.glowColor || COLORS.photonGlow;

  ctx.save();

  // Glow
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = glowRadius;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw again without glow for a crisp center
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw an expanding light flash ring.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x — center x
 * @param {number} y — center y
 * @param {number} radius — current ring radius
 * @param {object} [opts]
 * @param {string} [opts.color]     — default COLORS.photon
 * @param {number} [opts.lineWidth] — default 2
 * @param {number} [opts.opacity]   — 0..1 (default 1)
 */
export function drawLightFlash(ctx, x, y, radius, opts = {}) {
  const color = opts.color || COLORS.photon;
  const lineWidth = opts.lineWidth || 2;
  const opacity = opts.opacity ?? 1;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw a small starburst (firecracker explosion).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x — center x
 * @param {number} y — center y
 * @param {object} [opts]
 * @param {string} [opts.color]     — default COLORS.accent
 * @param {number} [opts.size]      — ray length in px (default 8)
 * @param {number} [opts.lineWidth] — default 1.5
 */
export function drawFirecracker(ctx, x, y, opts = {}) {
  const color = opts.color || COLORS.accent;
  const size = opts.size || 8;
  const lineWidth = opts.lineWidth || 1.5;
  const rays = 8;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  for (let i = 0; i < rays; i++) {
    const angle = (Math.PI * 2 * i) / rays;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
    ctx.stroke();
  }

  // Center dot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw a simple rocket (nose cone + body + flame).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x — center x of the rocket body
 * @param {number} y — center y of the rocket body
 * @param {number} angle — rotation in radians (0 = pointing right)
 * @param {object} [opts]
 * @param {number} [opts.length]     — total length in px (default 50)
 * @param {string} [opts.color]      — body color (default COLORS.inkLight)
 * @param {string} [opts.flameColor] — default COLORS.accent
 */
export function drawRocket(ctx, x, y, angle, opts = {}) {
  const len = opts.length || 50;
  const color = opts.color || COLORS.inkLight;
  const flameColor = opts.flameColor || COLORS.accent;

  const bodyLen = len * 0.55;
  const bodyW = len * 0.16;
  const noseLen = len * 0.25;
  const flameLen = len * 0.2;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Body (rectangle centered at origin)
  ctx.fillStyle = color;
  ctx.fillRect(-bodyLen / 2, -bodyW / 2, bodyLen, bodyW);

  // Nose cone (triangle on the right end)
  ctx.beginPath();
  ctx.moveTo(bodyLen / 2, -bodyW / 2);
  ctx.lineTo(bodyLen / 2 + noseLen, 0);
  ctx.lineTo(bodyLen / 2, bodyW / 2);
  ctx.closePath();
  ctx.fill();

  // Flame (triangle on the left end)
  ctx.fillStyle = flameColor;
  ctx.beginPath();
  ctx.moveTo(-bodyLen / 2, -bodyW * 0.35);
  ctx.lineTo(-bodyLen / 2 - flameLen, 0);
  ctx.lineTo(-bodyLen / 2, bodyW * 0.35);
  ctx.closePath();
  ctx.fill();

  // Fin stubs (two small triangles at the tail)
  ctx.fillStyle = color;
  // Top fin
  ctx.beginPath();
  ctx.moveTo(-bodyLen / 2 + bodyLen * 0.1, -bodyW / 2);
  ctx.lineTo(-bodyLen / 2, -bodyW);
  ctx.lineTo(-bodyLen / 2, -bodyW / 2);
  ctx.closePath();
  ctx.fill();
  // Bottom fin
  ctx.beginPath();
  ctx.moveTo(-bodyLen / 2 + bodyLen * 0.1, bodyW / 2);
  ctx.lineTo(-bodyLen / 2, bodyW);
  ctx.lineTo(-bodyLen / 2, bodyW / 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
