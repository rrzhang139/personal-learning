// Light-clock thought experiment: derive time dilation from Pythagoras.
// Slider-driven scene: "velocity v/c" parameter (0..0.9) controls the
// diagonal path and live gamma calculation.

import { registerScene } from './registry.js';
import { clearCanvas } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawMirror, drawPhoton } from '../tools/physics.js';
import { drawLabel, drawBracket } from '../tools/labels.js';
import { drawArrow } from '../tools/arrows.js';

class LightClockScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width / (window.devicePixelRatio || 1);
    this.h = canvas.height / (window.devicePixelRatio || 1);
    this.v = 0;    // velocity as fraction of c (beta)
    this._draw();
  }

  get sliderConfig() {
    return {
      label: 'velocity v/c',
      min: 0,
      max: 0.9,
      default: 0,
      format: v => v.toFixed(2),
    };
  }

  setValue(v) {
    this.v = v;
    this._draw();
  }

  stop() {}

  // ---- Layout ----
  get _layout() {
    const w = this.w;
    const h = this.h;
    const halfW = w / 2;
    const dividerX = halfW;

    // Bob's frame: left half
    const bobCx = halfW * 0.5;
    const mirrorW = 60;
    const mirrorTopY = 70;
    const mirrorBotY = 230;
    const mirrorDist = mirrorBotY - mirrorTopY;   // "d" in pixels

    // Alice's frame: right half
    const aliceCx = halfW + halfW * 0.5;
    // Max horizontal shift of the top mirror at v=0.9
    const maxShift = 140;

    return {
      w, h, halfW, dividerX,
      bobCx, mirrorW, mirrorTopY, mirrorBotY, mirrorDist,
      aliceCx, maxShift,
    };
  }

  // ---- Main draw ----
  _draw() {
    const { ctx, v } = this;
    clearCanvas(ctx, this.canvas);
    const L = this._layout;

    this._drawBobFrame(L);
    this._drawDivider(L);
    this._drawAliceFrame(L);
    this._drawEquations(L);
  }

  // ---- Bob's frame (left half -- always the same) ----
  _drawBobFrame(L) {
    const { ctx } = this;
    const { bobCx, mirrorW, mirrorTopY, mirrorBotY } = L;
    const halfMW = mirrorW / 2;

    // Title
    drawLabel(ctx, "Bob's Frame (at rest with clock)", bobCx, 24,
      { color: COLORS.bob, font: 'bold 13px Georgia, serif' });

    // Top mirror
    drawMirror(ctx, bobCx - halfMW, mirrorTopY, bobCx + halfMW, mirrorTopY,
      { color: COLORS.inkLight, lineWidth: 3, hashSide: 'left' });

    // Bottom mirror
    drawMirror(ctx, bobCx - halfMW, mirrorBotY, bobCx + halfMW, mirrorBotY,
      { color: COLORS.inkLight, lineWidth: 3, hashSide: 'right' });

    // Bracket for "d" on the left
    drawBracket(ctx, bobCx - halfMW - 8, mirrorTopY, bobCx - halfMW - 8, mirrorBotY, 'd',
      { side: 'left', color: COLORS.accent, font: 'italic 14px Georgia, serif', offset: 10, labelColor: COLORS.accent });

    // Vertical photon path (dashed)
    ctx.save();
    ctx.strokeStyle = COLORS.photon;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(bobCx, mirrorBotY - 6);
    ctx.lineTo(bobCx, mirrorTopY + 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Photon at mid-travel
    const photonY = (mirrorTopY + mirrorBotY) / 2;
    drawPhoton(ctx, bobCx, photonY, { radius: 5 });

    // "d" label beside path
    drawLabel(ctx, 'd', bobCx + 16, (mirrorTopY + mirrorBotY) / 2,
      { color: COLORS.photon, font: 'italic 13px Georgia, serif' });

    // Tick label
    drawLabel(ctx, 'One tick: \u0394\u03C4 = 2d/c', bobCx, mirrorBotY + 30,
      { color: COLORS.ink, font: '13px Georgia, serif' });
  }

  // ---- Divider ----
  _drawDivider(L) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = COLORS.inkFaint;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(L.dividerX, 10);
    ctx.lineTo(L.dividerX, L.h - 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ---- Alice's frame (right half -- changes with v) ----
  _drawAliceFrame(L) {
    const { ctx, v } = this;
    const { aliceCx, mirrorW, mirrorTopY, mirrorBotY, mirrorDist, maxShift } = L;
    const halfMW = mirrorW / 2;

    // Title
    drawLabel(ctx, "Alice's Frame (clock moves \u2192)", aliceCx, 24,
      { color: COLORS.alice, font: 'bold 13px Georgia, serif' });

    // Horizontal shift of mirrors proportional to velocity
    const shift = maxShift * v;   // total horizontal offset between bottom and top mirror positions

    // Bottom mirror at start position (left)
    const startX = aliceCx - shift / 2;
    const startY = mirrorBotY;
    drawMirror(ctx, startX - halfMW, mirrorBotY, startX + halfMW, mirrorBotY,
      { color: COLORS.inkLight, lineWidth: 3, hashSide: 'right' });

    // Top mirror at end position (shifted right)
    const endX = aliceCx + shift / 2;
    const endY = mirrorTopY;
    drawMirror(ctx, endX - halfMW, mirrorTopY, endX + halfMW, mirrorTopY,
      { color: COLORS.inkLight, lineWidth: 3, hashSide: 'left' });

    // Motion arrows below bottom mirror
    if (v > 0.01) {
      drawArrow(ctx, startX - halfMW - 10, mirrorBotY + 18, startX + halfMW + 20, mirrorBotY + 18,
        { color: COLORS.alice, headSize: 6, lineWidth: 1.2 });
      drawLabel(ctx, 'v', startX + halfMW + 28, mirrorBotY + 18,
        { color: COLORS.alice, font: 'italic 12px Georgia, serif' });
    }

    // --- Right triangle ---
    const triBottomLeft = { x: startX, y: startY - 6 };
    const triTopRight = { x: endX, y: endY + 6 };
    const triCorner = { x: startX, y: endY + 6 };   // right-angle corner (top-left)

    // Vertical leg (d) -- always visible
    ctx.save();
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(triBottomLeft.x, triBottomLeft.y);
    ctx.lineTo(triCorner.x, triCorner.y);
    ctx.stroke();
    ctx.restore();

    drawLabel(ctx, 'd', triCorner.x - 16, (triBottomLeft.y + triCorner.y) / 2,
      { color: COLORS.accent, font: 'italic 14px Georgia, serif' });

    // Horizontal leg (v*dt/2) -- only visible when v > 0
    if (v > 0.01) {
      ctx.save();
      ctx.strokeStyle = COLORS.alice;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(triCorner.x, triCorner.y);
      ctx.lineTo(triTopRight.x, triTopRight.y);
      ctx.stroke();
      ctx.restore();

      drawLabel(ctx, 'v\u00B7\u0394t/2', (triCorner.x + triTopRight.x) / 2, triCorner.y - 14,
        { color: COLORS.alice, font: 'italic 13px Georgia, serif' });
    }

    // Hypotenuse (c*dt/2) -- the photon diagonal path
    ctx.save();
    ctx.strokeStyle = COLORS.photon;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(triBottomLeft.x, triBottomLeft.y);
    ctx.lineTo(triTopRight.x, triTopRight.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Photon on the diagonal
    const photonFrac = 0.5;
    const photonX = triBottomLeft.x + (triTopRight.x - triBottomLeft.x) * photonFrac;
    const photonY = triBottomLeft.y + (triTopRight.y - triBottomLeft.y) * photonFrac;
    drawPhoton(ctx, photonX, photonY, { radius: 5 });

    // Hypotenuse label
    if (v > 0.01) {
      const hypMidX = (triBottomLeft.x + triTopRight.x) / 2;
      const hypMidY = (triBottomLeft.y + triTopRight.y) / 2;
      drawLabel(ctx, 'c\u00B7\u0394t/2', hypMidX + 24, hypMidY,
        { color: COLORS.photon, font: 'italic 13px Georgia, serif' });
    }

    // Right angle marker at corner
    if (v > 0.05) {
      const sq = 8;
      ctx.save();
      ctx.strokeStyle = COLORS.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(triCorner.x + sq, triCorner.y);
      ctx.lineTo(triCorner.x + sq, triCorner.y + sq);
      ctx.lineTo(triCorner.x, triCorner.y + sq);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---- Equations below Alice's frame ----
  _drawEquations(L) {
    const { ctx, v } = this;
    const eqX = L.halfW + L.halfW * 0.5;    // centered in right half
    const baseY = L.mirrorBotY + 50;
    const lineH = 22;
    const eqFont = 'italic 14px Georgia, serif';
    const eqFontBold = 'bold 15px Georgia, serif';

    // Compute gamma
    const beta2 = v * v;
    const gamma = 1 / Math.sqrt(1 - beta2);

    // Line 1: gamma formula with live value
    const gammaStr = gamma.toFixed(3);
    this._drawColoredEq(ctx, eqX, baseY,
      [
        { text: '\u03B3', color: COLORS.accent },
        { text: ' = 1/\u221A(1 \u2212 v\u00B2/c\u00B2) = ', color: COLORS.ink },
        { text: gammaStr, color: COLORS.accent },
      ], eqFont);

    // Line 2: time dilation
    const y2 = baseY + lineH;
    this._drawColoredEq(ctx, eqX, y2,
      [
        { text: '\u0394t', color: COLORS.ink },
        { text: ' = ', color: COLORS.ink },
        { text: '\u03B3', color: COLORS.accent },
        { text: ' \u00B7 \u0394\u03C4 = ', color: COLORS.ink },
        { text: gammaStr, color: COLORS.accent },
        { text: ' \u00B7 \u0394\u03C4', color: COLORS.ink },
      ], eqFont);

    // Line 3: summary dilation factor
    const y3 = y2 + lineH * 1.3;
    this._drawColoredEq(ctx, eqX, y3,
      [
        { text: 'Time dilation factor: ', color: COLORS.inkLight },
        { text: gamma.toFixed(2) + '\u00D7', color: COLORS.accent },
      ], eqFontBold);

    // Extra context at extreme values
    if (v < 0.01) {
      const y4 = y3 + lineH * 1.2;
      drawLabel(ctx, 'At v = 0: no dilation, \u03B3 = 1', eqX, y4,
        { color: COLORS.inkLight, font: 'italic 12px Georgia, serif' });
    } else if (v > 0.85) {
      const y4 = y3 + lineH * 1.2;
      drawLabel(ctx, 'At v \u2192 c: \u03B3 diverges, time nearly stops!', eqX, y4,
        { color: COLORS.accent, font: 'italic 12px Georgia, serif' });
    }
  }

  // ---- Helper: draw multi-colored equation segments centered at (cx, cy) ----
  _drawColoredEq(ctx, cx, cy, segments, font) {
    ctx.save();
    ctx.font = font || 'italic 14px Georgia, serif';
    ctx.textBaseline = 'middle';

    // Measure total width
    let totalW = 0;
    for (const seg of segments) {
      totalW += ctx.measureText(seg.text).width;
    }

    // Draw centered
    let x = cx - totalW / 2;
    for (const seg of segments) {
      ctx.fillStyle = seg.color;
      ctx.textAlign = 'left';
      ctx.fillText(seg.text, x, cy);
      x += ctx.measureText(seg.text).width;
    }

    ctx.restore();
  }
}

registerScene('light-clock', (canvas, opts) => new LightClockScene(canvas, opts));
