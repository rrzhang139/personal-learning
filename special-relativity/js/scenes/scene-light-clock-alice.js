// Alice's view of the light clock: the clock moves, photon traces a diagonal.
// Slider = velocity v/c (0..0.9). Shows the right triangle stretching.
// NO equations shown here — just the visual.

import { registerScene } from './registry.js';
import { clearCanvas } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawMirror, drawPhoton } from '../tools/physics.js';
import { drawLabel, drawBracket } from '../tools/labels.js';
import { drawArrow } from '../tools/arrows.js';

class LightClockAliceScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width / (window.devicePixelRatio || 1);
    this.h = canvas.height / (window.devicePixelRatio || 1);
    this.v = 0;
  }

  get sliderConfig() {
    return { label: 'velocity v/c', min: 0, max: 0.9, default: 0, format: v => v.toFixed(2) };
  }

  setValue(v) { this.v = v; this._draw(); }
  stop() {}

  _draw() {
    const { ctx, canvas, w, h, v } = this;
    clearCanvas(ctx, canvas);

    const cx = w / 2;
    const mirrorW = 65;
    const topY = 60;
    const botY = 300;
    const d = botY - topY;

    // Horizontal shift: how far the top mirror moves due to clock velocity
    const maxShift = 200;
    const shift = maxShift * v;

    // Mirror positions
    const botMirrorX = cx - shift / 2;
    const topMirrorX = cx + shift / 2;

    // Title
    drawLabel(ctx, "Alice's Frame (the clock moves \u2192)", cx, 24, {
      font: 'bold 14px Georgia, serif', color: COLORS.alice,
    });

    // Bottom mirror (starting position)
    drawMirror(ctx, botMirrorX - mirrorW, botY, botMirrorX + mirrorW, botY, {
      color: COLORS.inkLight, lineWidth: 3,
    });

    // Top mirror (shifted right)
    drawMirror(ctx, topMirrorX - mirrorW, topY, topMirrorX + mirrorW, topY, {
      color: COLORS.inkLight, lineWidth: 3, hashSide: 'left',
    });

    // Motion arrow
    if (v > 0.01) {
      drawArrow(ctx, botMirrorX - mirrorW - 10, botY + 20, botMirrorX + mirrorW + 25, botY + 20, {
        color: COLORS.alice, headSize: 6, lineWidth: 1.2,
      });
      drawLabel(ctx, 'v', botMirrorX + mirrorW + 32, botY + 20, {
        font: 'italic 13px Georgia, serif', color: COLORS.alice, align: 'left',
      });
    }

    // Triangle vertices
    const triBot = { x: botMirrorX, y: botY - 4 };
    const triTop = { x: topMirrorX, y: topY + 4 };
    const triCorner = { x: botMirrorX, y: topY + 4 };

    // Vertical leg (d) — always visible
    ctx.save();
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(triBot.x, triBot.y);
    ctx.lineTo(triCorner.x, triCorner.y);
    ctx.stroke();
    ctx.restore();

    drawLabel(ctx, 'd', triCorner.x - 18, (triBot.y + triCorner.y) / 2, {
      font: 'italic 16px Georgia, serif', color: COLORS.accent,
    });

    // Horizontal leg (v·Δt/2) — visible when v > 0
    if (v > 0.02) {
      ctx.save();
      ctx.strokeStyle = COLORS.alice;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(triCorner.x, triCorner.y);
      ctx.lineTo(triTop.x, triTop.y);
      ctx.stroke();
      ctx.restore();

      drawLabel(ctx, 'v\u00B7\u0394t/2', (triCorner.x + triTop.x) / 2, triCorner.y - 14, {
        font: 'italic 14px Georgia, serif', color: COLORS.alice,
      });

      // Right angle marker
      ctx.save();
      ctx.strokeStyle = COLORS.alice;
      ctx.lineWidth = 1;
      const sq = 8;
      ctx.strokeRect(triCorner.x, triCorner.y, sq, sq);
      ctx.restore();
    }

    // Diagonal (hypotenuse = photon path)
    ctx.save();
    ctx.strokeStyle = COLORS.photon;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(triBot.x, triBot.y);
    ctx.lineTo(triTop.x, triTop.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Hypotenuse label
    if (v > 0.02) {
      const hypMx = (triBot.x + triTop.x) / 2;
      const hypMy = (triBot.y + triTop.y) / 2;
      drawLabel(ctx, 'c\u00B7\u0394t/2', hypMx + 20, hypMy, {
        font: 'italic 14px Georgia, serif', color: COLORS.photon, align: 'left',
      });
    }

    // Photon at midpoint of diagonal
    const photonX = (triBot.x + triTop.x) / 2;
    const photonY = (triBot.y + triTop.y) / 2;
    drawPhoton(ctx, photonX, photonY, { radius: 6 });

    // Pythagorean equation — shown when the triangle is visible
    if (v > 0.05) {
      const eqY = botY + 45;
      drawLabel(ctx, 'Pythagoras:', cx, eqY, {
        font: 'bold italic 13px Georgia, serif', color: COLORS.accent,
      });
      drawLabel(ctx, '(c\u00B7\u0394t/2)\u00B2  =  d\u00B2  +  (v\u00B7\u0394t/2)\u00B2', cx, eqY + 22, {
        font: 'italic 15px Georgia, serif', color: COLORS.ink,
      });
    }

    // Caption
    if (v < 0.02) {
      drawLabel(ctx, 'At v = 0 the path is vertical, same as Bob sees', cx, h - 20, {
        font: 'italic 13px Georgia, serif', color: COLORS.inkLight,
      });
    } else {
      drawLabel(ctx, 'The diagonal path is longer. Same speed, longer path, more time.', cx, h - 20, {
        font: 'italic 13px Georgia, serif', color: COLORS.inkLight,
      });
    }
  }
}

registerScene('light-clock-alice', (canvas, opts) => new LightClockAliceScene(canvas, opts));
