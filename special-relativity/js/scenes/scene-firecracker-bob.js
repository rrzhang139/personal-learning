// Bob's frame: Bob is STATIONARY at the center. Both firecrackers equidistant.
// The RIGHT firecracker fires FIRST (earlier in Bob's time).
// Light from both travels at c. Right flash arrives first because it was emitted earlier.
// Time slider (0..1). The offset between emissions depends on beta (set externally).

import { registerScene } from './registry.js';
import { clearCanvas } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawPerson, drawFirecracker, drawLightFlash } from '../tools/physics.js';
import { drawLabel } from '../tools/labels.js';

const PAST_COLOR = '#c62828';
const FUTURE_COLOR = '#1a5276';

class FirecrackerBobScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width / (window.devicePixelRatio || 1);
    this.h = canvas.height / (window.devicePixelRatio || 1);
    this.t = 0;
    this.beta = 0.5; // set externally
  }

  get sliderConfig() {
    return { label: 'time', min: 0, max: 1, default: 0, format: v => v.toFixed(2) };
  }

  setValue(v) { this.t = v; this._draw(); }
  setBeta(b) { this.beta = b; this._draw(); }
  stop() {}

  _draw() {
    const { ctx, canvas, w, h, t, beta } = this;
    clearCanvas(ctx, canvas);

    const groundY = h * 0.6;
    const centerX = w / 2;
    const margin = 120;
    const leftFcX = margin;
    const rightFcX = w - margin;
    const fcSpacing = centerX - leftFcX;

    // The time offset: in Bob's frame, the right firecracker fires earlier.
    // The offset is proportional to beta (more speed = more desync).
    // We normalize so that at beta=0 both fire at t=0.2, and the offset grows with beta.
    const baseFireTime = 0.15;
    const maxOffset = 0.25;
    const offset = maxOffset * beta;
    const rightFireTime = baseFireTime;           // right fires first
    const leftFireTime = baseFireTime + offset;   // left fires later

    // Ground
    ctx.save();
    ctx.strokeStyle = COLORS.inkFaint;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, groundY); ctx.lineTo(w - 30, groundY); ctx.stroke();
    ctx.restore();

    // Bob at center (STATIONARY)
    drawPerson(ctx, centerX, groundY, 'Bob (at rest)', COLORS.bob);

    // Firecrackers
    ctx.save();
    ctx.fillStyle = COLORS.inkLight;
    ctx.fillRect(leftFcX - 4, groundY - 18, 8, 18);
    ctx.fillRect(rightFcX - 4, groundY - 18, 8, 18);
    ctx.restore();

    // Assumptions box at top
    drawLabel(ctx, "Bob's frame: he is at rest. Light is c from both directions. Equal distances.", w / 2, 16, {
      font: 'italic 12px Georgia, serif', color: COLORS.inkLight,
      bg: COLORS.bgCanvas, bgPad: 4,
    });

    // Equal distance labels
    if (t < 0.05) {
      ctx.save();
      ctx.strokeStyle = COLORS.inkFaint;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      const lineY = groundY - 55;
      ctx.beginPath(); ctx.moveTo(centerX, lineY); ctx.lineTo(leftFcX, lineY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(centerX, lineY); ctx.lineTo(rightFcX, lineY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      drawLabel(ctx, 'd', (centerX + leftFcX) / 2, groundY - 68, { font: 'italic 13px Georgia, serif', color: COLORS.ink });
      drawLabel(ctx, 'd', (centerX + rightFcX) / 2, groundY - 68, { font: 'italic 13px Georgia, serif', color: COLORS.ink });
    }

    // Right firecracker fires first
    const rightFired = t >= rightFireTime;
    const leftFired = t >= leftFireTime;

    // Starbursts
    if (rightFired) {
      const size = Math.min(12, 6 + 8 * ((t - rightFireTime) / 0.1));
      drawFirecracker(ctx, rightFcX, groundY - 22, { color: PAST_COLOR, size: Math.max(0, size) });
    }
    if (leftFired) {
      const size = Math.min(12, 6 + 8 * ((t - leftFireTime) / 0.1));
      drawFirecracker(ctx, leftFcX, groundY - 22, { color: FUTURE_COLOR, size: Math.max(0, size) });
    }

    // Light circles — each starts expanding from its own fire time
    const maxRadius = fcSpacing * 2.5;

    if (rightFired) {
      const elapsed = t - rightFireTime;
      const radius = maxRadius * elapsed;
      const opacity = Math.max(0.15, 1 - elapsed * 0.8);
      drawLightFlash(ctx, rightFcX, groundY - 12, radius, { color: PAST_COLOR, lineWidth: 2, opacity });
    }
    if (leftFired) {
      const elapsed = t - leftFireTime;
      const radius = maxRadius * elapsed;
      const opacity = Math.max(0.15, 1 - elapsed * 0.8);
      drawLightFlash(ctx, leftFcX, groundY - 12, radius, { color: FUTURE_COLOR, lineWidth: 2, opacity });
    }

    // Labels
    drawLabel(ctx, 'Right', rightFcX, groundY + 26, { font: 'bold 12px Georgia, serif', color: PAST_COLOR });
    drawLabel(ctx, 'Left', leftFcX, groundY + 26, { font: 'bold 12px Georgia, serif', color: FUTURE_COLOR });

    // Timeline annotations
    if (t < rightFireTime) {
      drawLabel(ctx, 'Nothing has happened yet', w / 2, 38, {
        font: 'italic 13px Georgia, serif', color: COLORS.inkLight,
      });
    } else if (t >= rightFireTime && !leftFired) {
      drawLabel(ctx, 'Right firecracker fires first!', w / 2, 38, {
        font: 'bold 14px Georgia, serif', color: PAST_COLOR,
      });
      if (beta > 0.01) {
        drawLabel(ctx, '(Left hasn\'t fired yet in Bob\'s frame)', w / 2, 56, {
          font: 'italic 13px Georgia, serif', color: FUTURE_COLOR,
        });
      }
    } else if (leftFired) {
      // Both have fired. Check arrivals.
      const rightArrival = rightFireTime + fcSpacing / maxRadius;
      const leftArrival = leftFireTime + fcSpacing / maxRadius;

      if (t < rightArrival) {
        drawLabel(ctx, 'Both have fired. Light propagating...', w / 2, 38, {
          font: 'italic 13px Georgia, serif', color: COLORS.inkLight,
        });
      } else if (t < leftArrival) {
        ctx.save();
        ctx.fillStyle = COLORS.photon;
        ctx.shadowColor = COLORS.photonGlow;
        ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(centerX, groundY - 30, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        drawLabel(ctx, 'Right flash reaches Bob first!', w / 2, 38, {
          font: 'bold 14px Georgia, serif', color: PAST_COLOR,
        });
        drawLabel(ctx, 'Same speed, same distance, but emitted earlier.', w / 2, 56, {
          font: 'italic 13px Georgia, serif', color: COLORS.inkLight,
        });
      } else {
        ctx.save();
        ctx.fillStyle = COLORS.photon;
        ctx.shadowColor = COLORS.photonGlow;
        ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(centerX, groundY - 30, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        drawLabel(ctx, 'Both flashes received. Right arrived first.', w / 2, 38, {
          font: 'bold 14px Georgia, serif', color: COLORS.ink,
        });
        drawLabel(ctx, 'Equal speeds + equal distances + different arrival = different emission times.', w / 2, 56, {
          font: 'italic 12px Georgia, serif', color: COLORS.accent,
        });
      }
    }
  }
}

registerScene('firecracker-bob', (canvas, opts) => new FirecrackerBobScene(canvas, opts));
