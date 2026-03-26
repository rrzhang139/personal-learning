/**
 * 2D drawing functions for hybrid orbitals and sigma/pi bonds.
 * Completely separate from OrbitalShape.js (pure atomic orbitals).
 *
 * Hybrid orbitals are "lopsided" — one large lobe pointing toward
 * the bond, one small lobe toward the nucleus.
 *
 * Sigma bonds: sausage-shaped overlap between two atoms.
 * Pi bonds: two lobes above and below the bond axis.
 */
import { drawLobe } from './OrbitalShape.js';

/**
 * Draw a single hybrid orbital lobe (lopsided teardrop).
 * Large lobe points toward `angle`, small lobe opposite.
 *
 * @param {number} lobeRatio — 0.6–0.8, how lopsided (larger = more asymmetric)
 */
export function drawHybridOrbital(ctx, cx, cy, size, angle, color, alpha, lobeRatio = 0.7) {
  // Large lobe toward the bond
  drawLobe(ctx, cx, cy, size * lobeRatio, angle, size * 0.3, color, alpha);
  // Small lobe opposite (toward nucleus)
  drawLobe(ctx, cx, cy, size * (1 - lobeRatio) * 0.6, angle + Math.PI, size * 0.12, color, alpha * 0.3);
}

/**
 * Draw a sigma bond: sausage-shaped electron density between two atoms.
 * @param {number} x1,y1 — atom A position
 * @param {number} x2,y2 — atom B position
 * @param {number} rA,rB — atom radii (to offset from center)
 */
export function drawSigmaBond(ctx, x1, y1, x2, y2, rA, rB, color, alpha) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const ux = dx / dist, uy = dy / dist;
  const nx = -uy, ny = ux;

  // Start/end points (offset from atom centers)
  const sx = x1 + ux * rA, sy = y1 + uy * rA;
  const ex = x2 - ux * rB, ey = y2 - uy * rB;
  const mx = (sx + ex) / 2, my = (sy + ey) / 2;
  const halfLen = dist * 0.4;
  const width = 12;

  // Sausage shape: elliptical gradient along bond axis
  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(Math.atan2(dy, dx));

  const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, width * 1.5);
  grad.addColorStop(0, withAlpha(color, alpha * 0.6));
  grad.addColorStop(0.6, withAlpha(color, alpha * 0.3));
  grad.addColorStop(1, withAlpha(color, 0));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, halfLen, width, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle outline
  ctx.strokeStyle = withAlpha(color, alpha * 0.3);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, halfLen, width, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw a pi bond: two lobes above and below the bond axis.
 * @param {number} x1,y1 — atom A position
 * @param {number} x2,y2 — atom B position
 */
export function drawPiBond(ctx, x1, y1, x2, y2, color, alpha) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const angle = Math.atan2(dy, dx);
  const halfLen = dist * 0.35;
  const offset = 20; // distance above/below bond axis

  // Two lobes perpendicular to bond axis
  const nx = -Math.sin(angle), ny = Math.cos(angle);

  // Top lobe
  ctx.save();
  ctx.translate(mx + nx * offset, my + ny * offset);
  ctx.rotate(angle);
  const grad1 = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
  grad1.addColorStop(0, withAlpha(color, alpha * 0.5));
  grad1.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = grad1;
  ctx.beginPath();
  ctx.ellipse(0, 0, halfLen, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = withAlpha(color, alpha * 0.25);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Bottom lobe
  ctx.save();
  ctx.translate(mx - nx * offset, my - ny * offset);
  ctx.rotate(angle);
  const grad2 = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
  grad2.addColorStop(0, withAlpha(color, alpha * 0.5));
  grad2.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.ellipse(0, 0, halfLen, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = withAlpha(color, alpha * 0.25);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function withAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}
