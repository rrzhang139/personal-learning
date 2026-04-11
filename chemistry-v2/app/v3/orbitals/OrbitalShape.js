/**
 * 2D drawing functions for orbital shapes.
 * Pure canvas drawing — no dependencies on Atom/Bond/etc.
 *
 * Each function draws directly on a ctx at a given center + angle.
 */

/**
 * Draw an s orbital: filled circle with radial gradient.
 */
export function drawS(ctx, cx, cy, radius, color, alpha) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, withAlpha(color, alpha * 0.8));
  grad.addColorStop(0.5, withAlpha(color, alpha * 0.4));
  grad.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Outline
  ctx.strokeStyle = withAlpha(color, alpha * 0.6);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Draw one lobe of a p orbital: teardrop shape using quadratic Bezier.
 * @param {number} angle — direction the lobe points (radians)
 * @param {number} length — distance from center to tip
 * @param {number} width — max width of the lobe
 */
export function drawLobe(ctx, cx, cy, length, angle, width, color, alpha) {
  const tipX = cx + Math.cos(angle) * length;
  const tipY = cy + Math.sin(angle) * length;
  const nx = -Math.sin(angle);
  const ny = Math.cos(angle);

  // Control points at ~55% along axis, offset by width
  const midFrac = 0.55;
  const mx = cx + Math.cos(angle) * length * midFrac;
  const my = cy + Math.sin(angle) * length * midFrac;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(mx + nx * width, my + ny * width, tipX, tipY);
  ctx.quadraticCurveTo(mx - nx * width, my - ny * width, cx, cy);
  ctx.closePath();

  // Gradient fill along lobe
  const grad = ctx.createLinearGradient(cx, cy, tipX, tipY);
  grad.addColorStop(0, withAlpha(color, alpha * 0.2));
  grad.addColorStop(0.4, withAlpha(color, alpha * 0.7));
  grad.addColorStop(1, withAlpha(color, alpha * 0.3));
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = withAlpha(color, alpha * 0.5);
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Draw a full p orbital: two lobes in opposite directions.
 * @param {number} angle — axis of the dumbbell (0 = horizontal)
 */
export function drawP(ctx, cx, cy, length, angle, color, alpha) {
  drawLobe(ctx, cx, cy, length, angle, length * 0.38, color, alpha);
  drawLobe(ctx, cx, cy, length, angle + Math.PI, length * 0.38, shiftHue(color), alpha);
}

/**
 * Draw a pz orbital (into-screen projection): foreshortened circle.
 */
export function drawPz(ctx, cx, cy, radius, color, alpha) {
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = withAlpha(color, alpha * 0.5);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, withAlpha(color, alpha * 0.3));
  grad.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a d orbital cloverleaf: four lobes at 90° intervals.
 * @param {number} baseAngle — rotation offset
 */
export function drawDCloverleaf(ctx, cx, cy, length, baseAngle, color, alpha) {
  for (let i = 0; i < 4; i++) {
    const angle = baseAngle + i * Math.PI / 2;
    const c = i % 2 === 0 ? color : shiftHue(color);
    drawLobe(ctx, cx, cy, length * 0.65, angle, length * 0.22, c, alpha);
  }
}

/**
 * Draw a dz² orbital: torus ring + foreshortened dumbbell.
 */
export function drawDz2(ctx, cx, cy, length, color, alpha) {
  // Torus ring in xy plane
  ctx.strokeStyle = withAlpha(color, alpha * 0.4);
  ctx.lineWidth = length * 0.12;
  ctx.beginPath();
  ctx.ellipse(cx, cy, length * 0.7, length * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Foreshortened dumbbell
  drawPz(ctx, cx, cy, length * 0.3, color, alpha);
}

/**
 * Draw a simplified f orbital: 6 or 8 lobes.
 */
export function drawF(ctx, cx, cy, length, variant, color, alpha) {
  const lobeCount = variant < 4 ? 6 : 8;
  const offset = variant * Math.PI / (lobeCount * 2);
  for (let i = 0; i < lobeCount; i++) {
    const angle = offset + (i / lobeCount) * Math.PI * 2;
    const c = i % 2 === 0 ? color : shiftHue(color);
    drawLobe(ctx, cx, cy, length * 0.5, angle, length * 0.12, c, alpha * 0.8);
  }
}

// --- Helpers ---

function withAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}

function shiftHue(hex) {
  // Simple complement: invert the first channel
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${(255 - r).toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
