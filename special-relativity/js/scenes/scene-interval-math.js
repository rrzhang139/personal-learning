// Scene 7: The Interval and the Math — live derivation driven by velocity slider
// As v/c changes, all the math updates: γ, time dilation, the interval, length contraction, Lorentz transform

import { registerScene } from './registry.js';
import { clearCanvas } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawLabel } from '../tools/labels.js';
import { drawBracket } from '../tools/labels.js';
import { drawMirror, drawPhoton } from '../tools/physics.js';
import { drawFormula } from '../tools/math-renderer.js';

const T = (text, color, style) => ({ text, color, style });
const Ts = (text, color, sup) => ({ text, color, sup });

const INK = COLORS.ink;
const ACC = COLORS.accent;
const ALI = COLORS.alice;
const BOB = COLORS.bob;
const GRN = COLORS.green;
const PHO = COLORS.photon;

class IntervalMathScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width / (window.devicePixelRatio || 1);
    this.h = canvas.height / (window.devicePixelRatio || 1);
    this.v = 0;
  }

  get sliderConfig() {
    return {
      label: 'velocity v/c',
      min: 0, max: 0.95, default: 0.5,
      format: v => v.toFixed(2),
    };
  }

  setValue(v) { this.v = v; this._draw(); }
  stop() {}

  _draw() {
    const { ctx, w, h, v } = this;
    clearCanvas(ctx, this.canvas);

    const beta = v;
    const gamma = beta > 0 ? 1 / Math.sqrt(1 - beta * beta) : 1;
    const L0 = 2.0;
    const L = L0 / gamma;

    // ── Left side: Light clock diagram ──
    const clockX = 160;
    const topY = 60;
    const botY = 220;
    const d = botY - topY; // pixel distance between mirrors
    const mirrorW = 55;

    // Mirrors
    drawMirror(ctx, clockX - mirrorW, topY, clockX + mirrorW, topY, { color: COLORS.inkFaint, hashSide: 'left' });
    drawMirror(ctx, clockX - mirrorW, botY, clockX + mirrorW, botY, { color: COLORS.inkFaint });

    // The triangle: vertical leg d, horizontal leg proportional to v
    const maxHoriz = 120; // max horizontal shift at v=0.95
    const horiz = maxHoriz * beta;

    // Draw the right triangle
    const triLeft = clockX;
    const triRight = clockX + horiz;

    // Vertical leg (always at triLeft)
    ctx.save();
    ctx.strokeStyle = ALI;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(triLeft, botY);
    ctx.lineTo(triLeft, topY);
    ctx.stroke();

    // Horizontal leg (at top)
    if (beta > 0.01) {
      ctx.strokeStyle = BOB;
      ctx.beginPath();
      ctx.moveTo(triLeft, topY);
      ctx.lineTo(triRight, topY);
      ctx.stroke();
    }

    // Diagonal (hypotenuse)
    ctx.strokeStyle = PHO;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(triLeft, botY);
    ctx.lineTo(triRight, topY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Right angle marker
    if (beta > 0.05) {
      ctx.save();
      ctx.strokeStyle = ALI;
      ctx.lineWidth = 1;
      const sq = 8;
      ctx.strokeRect(triLeft, topY, sq, sq);
      ctx.restore();
    }

    // Photon at the top of the diagonal
    drawPhoton(ctx, triRight, topY + 4);

    // Triangle labels
    drawLabel(ctx, 'd', triLeft - 16, (topY + botY) / 2, {
      font: 'italic 15px Georgia, serif', color: ACC,
    });
    if (beta > 0.05) {
      drawLabel(ctx, `v\u0394t/2`, (triLeft + triRight) / 2, topY - 12, {
        font: 'italic 13px Georgia, serif', color: BOB, align: 'center',
      });
      drawLabel(ctx, `c\u0394t/2`, (triLeft + triRight) / 2 - 30, (topY + botY) / 2, {
        font: 'italic 13px Georgia, serif', color: PHO, align: 'center',
      });
    }

    // ── Right side: Live math ──
    const mathX = w * 0.6;
    let y = 48;
    const sp = 28;

    // Title: velocity
    drawLabel(ctx, `v/c = ${beta.toFixed(2)}`, mathX, y, {
      font: 'bold 16px Georgia, serif', color: INK, align: 'center',
    });
    y += sp + 4;

    // γ = 1/√(1 - v²/c²) = [value]
    const gammaStr = gamma.toFixed(3);
    const gammaEq = [
      T('\u03B3', ACC, 'bold'),
      T(' = 1/\u221A(1 \u2212 v\u00B2/c\u00B2) = ', INK),
      T(gammaStr, ACC, 'bold'),
    ];
    drawFormula(ctx, gammaEq, mathX, y, { baseSize: 16, align: 'center' });
    y += sp + 2;

    // Divider
    ctx.save();
    ctx.strokeStyle = COLORS.inkFaint;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(mathX - 140, y - 6);
    ctx.lineTo(mathX + 140, y - 6);
    ctx.stroke();
    ctx.restore();

    // Time dilation: Δt = γ · Δτ
    drawLabel(ctx, 'Time dilation', mathX, y, {
      font: 'bold italic 13px Georgia, serif', color: COLORS.inkLight, align: 'center',
    });
    y += 20;
    const tdEq = [
      T('\u0394t = ', INK),
      T(gammaStr, ACC, 'bold'),
      T(' \u00B7 \u0394\u03C4', BOB),
    ];
    drawFormula(ctx, tdEq, mathX, y, { baseSize: 16, align: 'center' });
    y += sp + 6;

    // Length contraction: L = L₀/γ
    drawLabel(ctx, 'Length contraction', mathX, y, {
      font: 'bold italic 13px Georgia, serif', color: COLORS.inkLight, align: 'center',
    });
    y += 20;
    const lcEq = [
      T('L = L', INK),
      T('\u2080', INK),
      T('/\u03B3 = ', INK),
      T(`${L0.toFixed(1)}/${gammaStr} = `, INK),
      T(L.toFixed(3), ACC, 'bold'),
    ];
    drawFormula(ctx, lcEq, mathX, y, { baseSize: 16, align: 'center' });
    y += sp + 6;

    // Spacetime interval: s² = Δx² - c²Δt² (invariant)
    drawLabel(ctx, 'Spacetime interval (invariant)', mathX, y, {
      font: 'bold italic 13px Georgia, serif', color: COLORS.inkLight, align: 'center',
    });
    y += 20;
    const intEq = [
      T('s\u00B2', GRN, 'bold'),
      T(' = \u0394x\u00B2 \u2212 c\u00B2\u0394t\u00B2', INK),
    ];
    drawFormula(ctx, intEq, mathX, y, { baseSize: 16, align: 'center' });
    y += sp + 6;

    // Lorentz transformation
    drawLabel(ctx, 'Lorentz transformation', mathX, y, {
      font: 'bold italic 13px Georgia, serif', color: COLORS.inkLight, align: 'center',
    });
    y += 20;
    const lx = [
      T("x' = ", GRN),
      T('\u03B3', ACC, 'bold'),
      T('(x \u2212 vt)', INK),
    ];
    drawFormula(ctx, lx, mathX, y, { baseSize: 15, align: 'center' });
    y += 22;
    const lt = [
      T("t' = ", GRN),
      T('\u03B3', ACC, 'bold'),
      T('(t \u2212 ', INK),
      T('vx/c\u00B2', COLORS.red, 'bold'),
      T(')', INK),
    ];
    drawFormula(ctx, lt, mathX, y, { baseSize: 15, align: 'center' });
    y += sp + 4;

    // The vx/c² term
    if (beta > 0.01) {
      const vxc2 = beta.toFixed(2);
      drawLabel(ctx, `simultaneity shift: vx/c\u00B2 = ${vxc2}\u00B7x`, mathX, y, {
        font: 'italic 12px Georgia, serif', color: COLORS.red, align: 'center',
      });
    }

    // ── Bottom caption ──
    drawLabel(ctx, beta < 0.01
      ? 'At v = 0: no relativistic effects'
      : beta > 0.85
        ? 'Near light speed: extreme time dilation and length contraction'
        : 'Drag the slider to see how all quantities change with velocity',
      w / 2, h - 16, {
        font: 'italic 13px Georgia, serif', color: COLORS.inkLight, align: 'center',
      });
  }
}

registerScene('interval-math', (canvas, opts) => new IntervalMathScene(canvas, opts));
