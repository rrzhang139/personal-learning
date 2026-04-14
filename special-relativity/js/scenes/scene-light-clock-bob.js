// Bob's light clock: photon bouncing straight up and down between two mirrors.
// Slider = time (0..1), animates the photon position along the vertical path.

import { registerScene } from './registry.js';
import { clearCanvas } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawMirror, drawPhoton } from '../tools/physics.js';
import { drawLabel, drawBracket } from '../tools/labels.js';

class LightClockBobScene {
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

    const cx = w / 2;
    const mirrorW = 70;
    const topY = 60;
    const botY = 300;
    const d = botY - topY;

    // Title
    drawLabel(ctx, "Bob's Frame (at rest with the clock)", cx, 24, {
      font: 'bold 14px Georgia, serif', color: COLORS.bob,
    });

    // Mirrors
    drawMirror(ctx, cx - mirrorW, topY, cx + mirrorW, topY, { color: COLORS.inkLight, lineWidth: 3, hashSide: 'left' });
    drawMirror(ctx, cx - mirrorW, botY, cx + mirrorW, botY, { color: COLORS.inkLight, lineWidth: 3 });

    // Distance bracket "d"
    drawBracket(ctx, cx - mirrorW - 10, topY, cx - mirrorW - 10, botY, 'd', {
      side: 'left', color: COLORS.accent, font: 'italic 16px Georgia, serif',
      offset: 12, labelColor: COLORS.accent,
    });

    // Photon path (dashed vertical line)
    ctx.save();
    ctx.strokeStyle = COLORS.photon;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(cx, botY - 4);
    ctx.lineTo(cx, topY + 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Photon position: bounces up then down over t=0..1
    // t=0: bottom, t=0.5: top, t=1: bottom again
    let photonFrac;
    if (t <= 0.5) {
      photonFrac = t * 2; // 0 -> 1 (bottom to top)
    } else {
      photonFrac = (1 - t) * 2; // 1 -> 0 (top to bottom)
    }
    const photonY = botY - photonFrac * d;
    drawPhoton(ctx, cx, photonY, { radius: 6 });

    // Tick label
    drawLabel(ctx, 'One tick: \u0394\u03C4 = 2d/c', cx, botY + 35, {
      font: '14px Georgia, serif', color: COLORS.ink,
    });

    // Hint
    drawLabel(ctx, 'The photon bounces straight up and down', cx, h - 20, {
      font: 'italic 13px Georgia, serif', color: COLORS.inkLight,
    });
  }
}

registerScene('light-clock-bob', (canvas, opts) => new LightClockBobScene(canvas, opts));
