// Simultaneity thought experiment: Alice and Bob observe two firecrackers.
// Slider-driven scene: "time" parameter (0..1) controls the entire animation.

import { registerScene } from './registry.js';
import { clearCanvas } from '../tools/canvas-utils.js';
import { COLORS } from '../tools/colors.js';
import { drawPerson, drawFirecracker, drawLightFlash, drawRocket } from '../tools/physics.js';
import { drawLabel } from '../tools/labels.js';
import { drawArrow } from '../tools/arrows.js';

class FirecrackerScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width / (window.devicePixelRatio || 1);
    this.h = canvas.height / (window.devicePixelRatio || 1);
    this.t = 0;
    this._draw();
  }

  get sliderConfig() {
    return {
      label: 'time',
      min: 0,
      max: 1,
      default: 0,
      format: v => v.toFixed(2),
    };
  }

  setValue(v) {
    this.t = v;
    this._draw();
  }

  stop() {}

  // ---- Layout constants ----
  get _layout() {
    const w = this.w;
    const h = this.h;
    const groundY = h * 0.65;
    const centerX = w / 2;
    const fcEdgeMargin = 130;                    // px from edge to firecracker
    const leftFcX = fcEdgeMargin;
    const rightFcX = w - fcEdgeMargin;
    const fcSpacing = centerX - leftFcX;         // distance from center to each firecracker
    const fcY = groundY;
    const bobV = 0.35;                           // Bob's velocity as fraction of c (for visuals)
    return { w, h, groundY, centerX, fcSpacing, leftFcX, rightFcX, fcY, bobV };
  }

  // ---- Main draw ----
  _draw() {
    const { ctx, t } = this;
    clearCanvas(ctx, this.canvas);
    const L = this._layout;
    const { w, h, groundY, centerX, leftFcX, rightFcX, fcY, fcSpacing, bobV } = L;

    // --- Ground line ---
    this._drawGround(groundY);

    // --- Firecracker devices ---
    this._drawFirecrackerDevice(leftFcX, fcY);
    this._drawFirecrackerDevice(rightFcX, fcY);
    drawLabel(ctx, 'Left', leftFcX, fcY + 24, { color: COLORS.inkLight, font: '12px Georgia, serif' });
    drawLabel(ctx, 'Right', rightFcX, fcY + 24, { color: COLORS.inkLight, font: '12px Georgia, serif' });

    // --- Alice (always at center) ---
    drawPerson(ctx, centerX, groundY, 'Alice', COLORS.alice);

    // --- Bob (drifts rightward with time) ---
    // At t=0 Bob is slightly left of center; he moves right at bobV
    const bobStartX = centerX - fcSpacing * 0.12;
    const bobTravelDist = fcSpacing * 0.6;       // total distance Bob covers over t=0..1
    const bobX = bobStartX + bobTravelDist * t;
    drawPerson(ctx, bobX, groundY, '', COLORS.bob);
    // Rocket behind Bob
    drawRocket(ctx, bobX + 30, groundY - 28, 0, { length: 28, color: COLORS.bob, flameColor: COLORS.accent });
    // Position Bob's label to avoid overlapping Alice's label
    const bobLabelX = Math.max(bobX + 12, centerX + 60);
    drawLabel(ctx, 'Bob (moving \u2192)', bobLabelX, groundY + 18,
      { color: COLORS.bob, font: '12px Georgia, serif', align: 'left' });

    // --- Equal distance labels at t~0 ---
    if (t < 0.08) {
      this._drawEqualDistanceLines(centerX, leftFcX, rightFcX, groundY);
    }

    // --- Starbursts (firecrackers going off): visible for all t > 0 ---
    if (t > 0) {
      const burstSize = Math.min(14, 6 + 8 * (t / 0.1));    // grow quickly then cap
      drawFirecracker(ctx, leftFcX, fcY - 12, { color: COLORS.accent, size: burstSize });
      drawFirecracker(ctx, rightFcX, fcY - 12, { color: COLORS.accent, size: burstSize });
    }

    // --- Light circles (expand with t) ---
    if (t > 0) {
      // Max radius the flash can reach across the full time span
      const maxRadius = fcSpacing * 2.0;
      const radius = maxRadius * t;
      // Fade opacity as circles get very large
      const opacity = Math.max(0.15, 1 - t * 0.6);
      drawLightFlash(ctx, leftFcX, fcY - 12, radius, { color: COLORS.photon, lineWidth: 2, opacity });
      drawLightFlash(ctx, rightFcX, fcY - 12, radius, { color: COLORS.photon, lineWidth: 2, opacity });
    }

    // --- Event: right flash reaches Bob ---
    // Distance from right firecracker to Bob (at current t)
    const distRightToBob = rightFcX - bobX;
    // The light circle radius at time t
    const maxRadius = fcSpacing * 2.0;
    const lightRadius = maxRadius * t;

    // Time when right flash reaches Bob:
    // lightRadius >= distRightToBob  =>  maxRadius * t_hit = rightFcX - bobX(t_hit)
    // Solve: maxRadius * t = rightFcX - (bobStartX + bobTravelDist * t)
    //   t * (maxRadius + bobTravelDist) = rightFcX - bobStartX
    const tRightHitsBob = (rightFcX - bobStartX) / (maxRadius + bobTravelDist);

    // Time when both flashes reach Alice (she's at center, equidistant):
    // maxRadius * t = fcSpacing  =>  t = fcSpacing / maxRadius
    const tBothHitAlice = fcSpacing / maxRadius;

    // Time when left flash reaches Bob:
    // lightRadius >= bobX - leftFcX  =>  maxRadius * t = bobX - leftFcX
    //   maxRadius * t = (bobStartX + bobTravelDist * t) - leftFcX
    //   t * (maxRadius - bobTravelDist) = bobStartX - leftFcX
    const tLeftHitsBob = (bobStartX - leftFcX) / (maxRadius - bobTravelDist);

    // --- Milestone labels (show only the LATEST milestone, not all at once) ---
    const labelFont = 'italic 14px Georgia, serif';
    const labelFontBold = 'bold 14px Georgia, serif';

    const pastRight = t >= tRightHitsBob - 0.01;
    const pastAlice = t >= tBothHitAlice - 0.01;
    const pastLeft  = t >= tLeftHitsBob - 0.01;

    // Determine which single milestone to show
    if (pastLeft) {
      // Phase 3: left flash reached Bob
      this._drawGlowDot(bobX, groundY - 30);
      drawLabel(ctx, 'Left flash reaches Bob later', w / 2, 28,
        { color: COLORS.bob, font: labelFontBold });
      drawLabel(ctx, 'Bob says: "Right one fired first!"', w / 2, 48,
        { color: COLORS.bob, font: labelFont });
    } else if (pastAlice) {
      // Phase 2: both flashes reached Alice
      this._drawGlowDot(centerX, groundY - 30);
      drawLabel(ctx, 'Both reach Alice at the same time', w / 2, 28,
        { color: COLORS.alice, font: labelFontBold });
    } else if (pastRight) {
      // Phase 1: right flash reached Bob
      this._drawGlowDot(bobX, groundY - 30);
      drawLabel(ctx, 'Right flash reaches Bob first!', w / 2, 28,
        { color: COLORS.accent, font: labelFontBold });
    }
  }

  // ---- Helper: glow dot ----
  _drawGlowDot(x, y) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = COLORS.photon;
    ctx.shadowColor = COLORS.photonGlow;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---- Helper: ground line ----
  _drawGround(groundY) {
    const { ctx, w } = this;
    ctx.save();
    ctx.strokeStyle = COLORS.inkFaint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, groundY);
    ctx.lineTo(w - 30, groundY);
    ctx.stroke();
    ctx.restore();
  }

  // ---- Helper: firecracker device (small rectangle + fuse dot) ----
  _drawFirecrackerDevice(x, y) {
    const { ctx } = this;
    const rw = 8;
    const rh = 18;
    ctx.save();
    ctx.fillStyle = COLORS.inkLight;
    ctx.fillRect(x - rw / 2, y - rh, rw, rh);
    // Fuse dot on top
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.arc(x, y - rh - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---- Helper: equal distance dotted lines ----
  _drawEqualDistanceLines(centerX, leftX, rightX, y) {
    const { ctx } = this;
    const lineY = y - 55;
    ctx.save();
    ctx.strokeStyle = COLORS.inkFaint;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Left line
    ctx.beginPath();
    ctx.moveTo(centerX, lineY);
    ctx.lineTo(leftX, lineY);
    ctx.stroke();

    // Right line
    ctx.beginPath();
    ctx.moveTo(centerX, lineY);
    ctx.lineTo(rightX, lineY);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();

    // "d" labels
    const midLeft = (centerX + leftX) / 2;
    const midRight = (centerX + rightX) / 2;
    drawLabel(ctx, 'd', midLeft, lineY - 10, { color: COLORS.ink, font: 'italic 13px Georgia, serif' });
    drawLabel(ctx, 'd', midRight, lineY - 10, { color: COLORS.ink, font: 'italic 13px Georgia, serif' });
  }
}

registerScene('firecracker', (canvas, opts) => new FirecrackerScene(canvas, opts));
