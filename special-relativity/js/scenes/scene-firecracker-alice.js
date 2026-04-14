// Alice alone: two firecrackers at equal distances, light propagates, both reach her simultaneously.
// Time slider (0..1). No Bob. Just the simple baseline.

import { registerScene } from './registry.js';
import { clearCanvas } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawPerson, drawFirecracker, drawLightFlash } from '../tools/physics.js';
import { drawLabel } from '../tools/labels.js';

class FirecrackerAliceScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width / (window.devicePixelRatio || 1);
    this.h = canvas.height / (window.devicePixelRatio || 1);
    this.t = 0;
  }

  get sliderConfig() {
    return { label: 'time', min: 0, max: 1, default: 0, format: v => v.toFixed(2) };
  }

  setValue(v) { this.t = v; this._draw(); }
  stop() {}

  _draw() {
    const { ctx, canvas, w, h, t } = this;
    clearCanvas(ctx, canvas);

    const groundY = h * 0.6;
    const centerX = w / 2;
    const margin = 120;
    const leftFcX = margin;
    const rightFcX = w - margin;
    const fcSpacing = centerX - leftFcX;

    // Ground
    ctx.save();
    ctx.strokeStyle = COLORS.inkFaint;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, groundY); ctx.lineTo(w - 30, groundY); ctx.stroke();
    ctx.restore();

    // Alice at center
    drawPerson(ctx, centerX, groundY, 'Alice', COLORS.alice);

    // Firecrackers
    ctx.save();
    ctx.fillStyle = COLORS.inkLight;
    ctx.fillRect(leftFcX - 4, groundY - 18, 8, 18);
    ctx.fillRect(rightFcX - 4, groundY - 18, 8, 18);
    ctx.restore();

    drawLabel(ctx, 'Left', leftFcX, groundY + 26, { font: '12px Georgia, serif', color: COLORS.inkLight });
    drawLabel(ctx, 'Right', rightFcX, groundY + 26, { font: '12px Georgia, serif', color: COLORS.inkLight });

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

    // Starbursts
    if (t > 0) {
      const size = Math.min(12, 6 + 8 * (t / 0.1));
      drawFirecracker(ctx, leftFcX, groundY - 22, { color: COLORS.accent, size });
      drawFirecracker(ctx, rightFcX, groundY - 22, { color: COLORS.accent, size });
    }

    // Light circles
    if (t > 0) {
      const maxRadius = fcSpacing * 2.0;
      const radius = maxRadius * t;
      const opacity = Math.max(0.15, 1 - t * 0.6);
      drawLightFlash(ctx, leftFcX, groundY - 12, radius, { color: COLORS.photon, lineWidth: 2, opacity });
      drawLightFlash(ctx, rightFcX, groundY - 12, radius, { color: COLORS.photon, lineWidth: 2, opacity });
    }

    // Both reach Alice at the same time
    const maxRadius = fcSpacing * 2.0;
    const tHitAlice = fcSpacing / maxRadius; // = 0.5

    if (t >= tHitAlice - 0.01) {
      ctx.save();
      ctx.fillStyle = COLORS.photon;
      ctx.shadowColor = COLORS.photonGlow;
      ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(centerX, groundY - 30, 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      drawLabel(ctx, 'Both flashes reach Alice at the same time', w / 2, 28, {
        font: 'bold 14px Georgia, serif', color: COLORS.alice,
      });
      drawLabel(ctx, 'Simultaneous!', w / 2, 48, {
        font: 'bold italic 14px Georgia, serif', color: COLORS.green,
      });
    }
  }
}

registerScene('firecracker-alice', (canvas, opts) => new FirecrackerAliceScene(canvas, opts));
