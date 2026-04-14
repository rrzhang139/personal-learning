// Synced firecracker scene: TIME slider (0..1) like the original,
// but Bob's velocity (beta) is set externally by the simultaneity diagram.
// Color-codes events to match: right = Bob's past (red), left = Bob's future (blue).

import { registerScene } from './registry.js';
import { clearCanvas } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawPerson, drawFirecracker, drawLightFlash, drawRocket } from '../tools/physics.js';
import { drawLabel } from '../tools/labels.js';

const PAST_COLOR = '#c62828';
const FUTURE_COLOR = '#1a5276';

class FirecrackerSyncScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width / (window.devicePixelRatio || 1);
    this.h = canvas.height / (window.devicePixelRatio || 1);
    this.t = 0;
    this.beta = 0; // set externally by main.js via setBeta()
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
    const margin = 110;
    const leftFcX = margin;
    const rightFcX = w - margin;
    const fcSpacing = centerX - leftFcX;

    // Ground
    ctx.save();
    ctx.strokeStyle = COLORS.inkFaint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, groundY);
    ctx.lineTo(w - 30, groundY);
    ctx.stroke();
    ctx.restore();

    // Alice at center
    drawPerson(ctx, centerX, groundY, 'Alice', COLORS.alice);

    // Bob moves rightward: position depends on time AND beta
    const bobStartX = centerX;
    const bobTravelDist = fcSpacing * 0.8 * beta;  // proportional to beta, zero when stationary
    const bobX = bobStartX + bobTravelDist * t;

    drawPerson(ctx, bobX, groundY, '', COLORS.bob);
    drawRocket(ctx, bobX + 28, groundY - 28, 0, {
      length: 24, color: COLORS.bob, flameColor: COLORS.accent,
    });
    const bobLabelX = Math.max(bobX + 10, centerX + 55);
    drawLabel(ctx, 'Bob (v = ' + beta.toFixed(2) + 'c \u2192)', bobLabelX, groundY + 18, {
      font: '12px Georgia, serif', color: COLORS.bob, align: 'left',
    });

    // Firecracker devices
    ctx.save();
    ctx.fillStyle = COLORS.inkLight;
    ctx.fillRect(leftFcX - 4, groundY - 18, 8, 18);
    ctx.fillRect(rightFcX - 4, groundY - 18, 8, 18);
    ctx.restore();

    // Equal distance labels at t=0
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
      drawLabel(ctx, 'd', (centerX + leftFcX) / 2, groundY - 68, {
        font: 'italic 13px Georgia, serif', color: COLORS.ink,
      });
      drawLabel(ctx, 'd', (centerX + rightFcX) / 2, groundY - 68, {
        font: 'italic 13px Georgia, serif', color: COLORS.ink,
      });
    }

    // Starbursts (visible for t > 0)
    if (t > 0) {
      const burstSize = Math.min(12, 6 + 8 * (t / 0.1));
      const rightColor = beta > 0.01 ? PAST_COLOR : COLORS.accent;
      const leftColor = beta > 0.01 ? FUTURE_COLOR : COLORS.accent;
      drawFirecracker(ctx, leftFcX, groundY - 22, { color: leftColor, size: burstSize });
      drawFirecracker(ctx, rightFcX, groundY - 22, { color: rightColor, size: burstSize });
    }

    // Light circles (expand with t)
    if (t > 0) {
      const maxRadius = fcSpacing * 2.0;
      const radius = maxRadius * t;
      const opacity = Math.max(0.15, 1 - t * 0.6);
      const rightColor = beta > 0.01 ? PAST_COLOR : COLORS.photon;
      const leftColor = beta > 0.01 ? FUTURE_COLOR : COLORS.photon;
      drawLightFlash(ctx, leftFcX, groundY - 12, radius, { color: leftColor, lineWidth: 2, opacity });
      drawLightFlash(ctx, rightFcX, groundY - 12, radius, { color: rightColor, lineWidth: 2, opacity });
    }

    // Labels
    const rightColor = beta > 0.01 ? PAST_COLOR : COLORS.inkLight;
    const leftColor = beta > 0.01 ? FUTURE_COLOR : COLORS.inkLight;
    drawLabel(ctx, 'Left', leftFcX, groundY + 26, { font: 'bold 12px Georgia, serif', color: leftColor });
    drawLabel(ctx, 'Right', rightFcX, groundY + 26, { font: 'bold 12px Georgia, serif', color: rightColor });

    // Milestone events
    const maxRadius = fcSpacing * 2.0;
    const lightRadius = maxRadius * t;

    // Compute hit times
    const tRightHitsBob = (rightFcX - bobStartX) / (maxRadius + bobTravelDist);
    const tBothHitAlice = fcSpacing / maxRadius;
    const tLeftHitsBob = (bobStartX - leftFcX) / (maxRadius - bobTravelDist);

    const pastRight = t >= tRightHitsBob - 0.01;
    const pastAlice = t >= tBothHitAlice - 0.01;
    const pastLeft = t >= tLeftHitsBob - 0.01;

    // Glow dot helper
    const glowDot = (x, y) => {
      ctx.save();
      ctx.fillStyle = COLORS.photon;
      ctx.shadowColor = COLORS.photonGlow;
      ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    const labelFontBold = 'bold 14px Georgia, serif';
    const labelFont = 'italic 14px Georgia, serif';

    if (pastLeft) {
      glowDot(bobX, groundY - 30);
      drawLabel(ctx, 'Left flash reaches Bob later', w / 2, 28, { color: leftColor, font: labelFontBold });
      drawLabel(ctx, 'Bob says: "Right one fired first!"', w / 2, 48, { color: COLORS.bob, font: labelFont });
    } else if (pastAlice) {
      glowDot(centerX, groundY - 30);
      drawLabel(ctx, 'Both reach Alice at the same time', w / 2, 28, { color: COLORS.alice, font: labelFontBold });
    } else if (pastRight) {
      glowDot(bobX, groundY - 30);
      drawLabel(ctx, 'Right flash reaches Bob first!', w / 2, 28, { color: rightColor, font: labelFontBold });
    }
  }
}

registerScene('firecracker-sync', (canvas, opts) => new FirecrackerSyncScene(canvas, opts));
