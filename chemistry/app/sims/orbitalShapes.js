import { registerSim } from './registry.js';

/**
 * OrbitalShapesViz - Interactive orbital shapes visualizer
 *
 * Shows s, p, and d orbital probability clouds with an energy level sidebar.
 * Supports highlighting individual orbitals and gentle rotation animation.
 */
export class OrbitalShapesViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 450;

    this.orbital = opts.orbital || 'all';
    this.shell = opts.shell || 2;

    this.running = true;
    this.animTime = 0;
    this.highlightedOrbital = null;

    // Layout constants
    this.bgColor = '#0a0a1a';
    this.sidebarWidth = 110;
    this.mainWidth = this.canvas.width - this.sidebarWidth;

    // Colors
    this.colors = {
      s: { main: '#ef5350', light: 'rgba(239,83,80,', label: '#ef5350' },
      p: { main: '#4fc3f7', light: 'rgba(79,195,247,', label: '#4fc3f7' },
      d: { main: '#ffa726', light: 'rgba(255,167,38,', label: '#ffa726' },
    };

    this._animFrame = null;
    this._animate();
  }

  // ── Animation Loop ──────────────────────────────────────────────────

  _animate() {
    if (!this.running) return;
    this.animTime += 0.015;
    this._draw();
    this._animFrame = requestAnimationFrame(() => this._animate());
  }

  // ── Main Draw ───────────────────────────────────────────────────────

  _draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, w, h);

    if (this.orbital === 'all') {
      const colW = this.mainWidth / 3;
      this._drawSColumn(0, 0, colW, h);
      this._drawPColumn(colW, 0, colW, h);
      this._drawDColumn(colW * 2, 0, colW, h);
    } else if (this.orbital === 's') {
      this._drawSColumn(0, 0, this.mainWidth, h);
    } else if (this.orbital === 'p') {
      this._drawPColumn(0, 0, this.mainWidth, h);
    } else if (this.orbital === 'd') {
      this._drawDColumn(0, 0, this.mainWidth, h);
    }

    this._drawEnergyLevelSidebar();
  }

  // ── Dimming helper ──────────────────────────────────────────────────

  _dimFactor(orbitalType) {
    if (!this.highlightedOrbital) return 1.0;
    const hl = this.highlightedOrbital.toLowerCase();
    // Match 's', 'p', 'd' or compound like '2p', '3d'
    if (hl === orbitalType || hl.endsWith(orbitalType)) return 1.0;
    return 0.2;
  }

  // ── S Orbital Column ────────────────────────────────────────────────

  _drawSColumn(x, y, w, h) {
    const ctx = this.ctx;
    const cx = x + w / 2;
    const cy = y + h / 2 - 20;
    const dim = this._dimFactor('s');

    ctx.save();
    ctx.globalAlpha = dim;

    // Axes
    this._drawAxes(cx, cy, Math.min(w, h) * 0.35);

    // S orbital: concentric circles with radial gradient (probability cloud)
    const maxR = Math.min(w, h) * 0.28;
    const layers = 8;
    for (let i = layers; i >= 1; i--) {
      const r = maxR * (i / layers);
      const alpha = 0.08 + 0.06 * (1 - i / layers);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(239,83,80,${alpha + 0.12})`);
      grad.addColorStop(0.5, `rgba(239,83,80,${alpha})`);
      grad.addColorStop(1, `rgba(239,83,80,0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Solid sphere outline hint
    ctx.beginPath();
    ctx.arc(cx, cy, maxR * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(239,83,80,${0.25 * dim})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Nucleus
    this._drawNucleus(cx, cy);

    // Label
    ctx.fillStyle = this.colors.s.label;
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('s orbital', cx, y + 30);

    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = `rgba(239,83,80,${0.8 * dim})`;
    ctx.fillText('1 box, max 2e\u207B', cx, h - 18);

    ctx.restore();
  }

  // ── P Orbital Column ────────────────────────────────────────────────

  _drawPColumn(x, y, w, h) {
    const ctx = this.ctx;
    const cx = x + w / 2;
    const cy = y + h / 2 - 20;
    const dim = this._dimFactor('p');
    const swing = Math.sin(this.animTime) * 0.06; // gentle oscillation

    ctx.save();
    ctx.globalAlpha = dim;

    // Axes
    this._drawAxes(cx, cy, Math.min(w, h) * 0.35);

    const lobeLen = Math.min(w, h) * 0.22;

    // px - horizontal lobes
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(swing);
    this._drawDumbbell(0, 0, lobeLen, 0, 'rgba(79,195,247,', 0.4);
    ctx.restore();

    // py - vertical lobes
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 2 + swing * 0.8);
    this._drawDumbbell(0, 0, lobeLen, 0, 'rgba(100,220,255,', 0.35);
    ctx.restore();

    // pz - diagonal/depth lobes
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4 + swing * 0.6);
    this._drawDumbbell(0, 0, lobeLen * 0.8, 0, 'rgba(60,170,230,', 0.3);
    ctx.restore();

    // Nucleus
    this._drawNucleus(cx, cy);

    // Label
    ctx.fillStyle = this.colors.p.label;
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('p orbitals', cx, y + 30);

    // Sub-labels
    ctx.font = '11px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = `rgba(79,195,247,${0.6 * dim})`;
    ctx.fillText('p\u2093  p\u2099  p\u200D\u2098', cx, y + 48);

    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = `rgba(79,195,247,${0.8 * dim})`;
    ctx.fillText('3 boxes, max 6e\u207B', cx, h - 18);

    ctx.restore();
  }

  // ── D Orbital Column ────────────────────────────────────────────────

  _drawDColumn(x, y, w, h) {
    const ctx = this.ctx;
    const cx = x + w / 2;
    const cy = y + h / 2 - 20;
    const dim = this._dimFactor('d');
    const swing = Math.sin(this.animTime * 0.8) * 0.05;

    ctx.save();
    ctx.globalAlpha = dim;

    // Axes
    this._drawAxes(cx, cy, Math.min(w, h) * 0.35);

    const lobeLen = Math.min(w, h) * 0.17;

    // Draw 4-lobe clover pattern (simplified d orbital)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(swing);
    // 4 lobes at 45-degree angles
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const lx = Math.cos(angle) * lobeLen;
      const ly = Math.sin(angle) * lobeLen;
      this._drawLobe(lx, ly, lobeLen * 0.45, 'rgba(255,167,38,', 0.35);
    }
    ctx.restore();

    // Draw a second clover pattern rotated 45 degrees, smaller, as a second d orbital hint
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(swing * 0.7);
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const lx = Math.cos(angle) * lobeLen * 0.7;
      const ly = Math.sin(angle) * lobeLen * 0.7;
      this._drawLobe(lx, ly, lobeLen * 0.3, 'rgba(255,183,77,', 0.2);
    }
    ctx.restore();

    // Nucleus
    this._drawNucleus(cx, cy);

    // Label
    ctx.fillStyle = this.colors.d.label;
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('d orbitals', cx, y + 30);

    ctx.font = '13px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = `rgba(255,167,38,${0.8 * dim})`;
    ctx.fillText('5 boxes, max 10e\u207B', cx, h - 18);

    ctx.restore();
  }

  // ── Drawing Helpers ─────────────────────────────────────────────────

  _drawAxes(cx, cy, len) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 0.8;

    // x axis
    ctx.beginPath();
    ctx.moveTo(cx - len, cy);
    ctx.lineTo(cx + len, cy);
    ctx.stroke();

    // y axis
    ctx.beginPath();
    ctx.moveTo(cx, cy - len);
    ctx.lineTo(cx, cy + len);
    ctx.stroke();

    // z axis (diagonal hint)
    ctx.beginPath();
    ctx.moveTo(cx - len * 0.5, cy + len * 0.5);
    ctx.lineTo(cx + len * 0.5, cy - len * 0.5);
    ctx.stroke();

    // Axis labels
    ctx.font = '10px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.textAlign = 'center';
    ctx.fillText('x', cx + len + 8, cy + 4);
    ctx.fillText('y', cx + 4, cy - len - 4);
    ctx.fillText('z', cx + len * 0.5 + 8, cy - len * 0.5 - 4);
  }

  _drawNucleus(cx, cy) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff1744';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,23,68,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /**
   * Draw a dumbbell shape (two lobes on opposite sides of origin).
   * cx, cy: center of dumbbell (should be 0,0 if pre-translated)
   * len: distance from center to lobe center
   * angle: rotation (already handled by canvas rotation, pass 0)
   * colorPrefix: rgba string prefix e.g. 'rgba(79,195,247,'
   * alpha: base opacity
   */
  _drawDumbbell(cx, cy, len, angle, colorPrefix, alpha) {
    const ctx = this.ctx;
    const lobeR = len * 0.45;

    // Positive lobe
    const px = cx + len * 0.6;
    const py = cy;
    this._drawLobe(px, py, lobeR, colorPrefix, alpha);

    // Negative lobe
    const nx = cx - len * 0.6;
    const ny = cy;
    this._drawLobe(nx, ny, lobeR, colorPrefix, alpha * 0.85);

    // Node at center (thin line connecting lobes)
    ctx.beginPath();
    ctx.moveTo(nx + lobeR * 0.5, cy);
    ctx.lineTo(px - lobeR * 0.5, cy);
    ctx.strokeStyle = `${colorPrefix}${alpha * 0.6})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  /**
   * Draw a single lobe (radial gradient ellipse approximation).
   */
  _drawLobe(cx, cy, r, colorPrefix, alpha) {
    const ctx = this.ctx;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `${colorPrefix}${alpha + 0.15})`);
    grad.addColorStop(0.4, `${colorPrefix}${alpha})`);
    grad.addColorStop(0.75, `${colorPrefix}${alpha * 0.4})`);
    grad.addColorStop(1, `${colorPrefix}0)`);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // ── Energy Level Sidebar ────────────────────────────────────────────

  _drawEnergyLevelSidebar() {
    const ctx = this.ctx;
    const x = this.mainWidth;
    const w = this.sidebarWidth;
    const h = this.canvas.height;

    // Sidebar background
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(x, 0, w, h);

    // Left border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Energy \u2191', x + w / 2, 22);

    // Energy levels (bottom = low energy, top = high energy)
    const levels = [
      { label: '1s', type: 's', boxes: 1 },
      { label: '2s', type: 's', boxes: 1 },
      { label: '2p', type: 'p', boxes: 3 },
      { label: '3s', type: 's', boxes: 1 },
      { label: '3p', type: 'p', boxes: 3 },
      { label: '4s', type: 's', boxes: 1 },
      { label: '3d', type: 'd', boxes: 5 },
      { label: '4p', type: 'p', boxes: 3 },
    ];

    const marginTop = 40;
    const marginBottom = 25;
    const usableH = h - marginTop - marginBottom;
    const step = usableH / (levels.length - 1);

    levels.forEach((lvl, i) => {
      // Position: index 0 = lowest energy = bottom of sidebar
      const ly = h - marginBottom - i * step;
      const lx = x + 12;
      const lineW = w - 24;

      // Determine color
      const color = this.colors[lvl.type].label;
      const isHighlighted =
        !this.highlightedOrbital ||
        this.highlightedOrbital === lvl.type ||
        this.highlightedOrbital === lvl.label;
      const alpha = isHighlighted ? 1.0 : 0.25;

      // Horizontal line
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + lineW, ly);
      ctx.stroke();

      // Label on the left
      ctx.fillStyle = color;
      ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lvl.label, lx, ly - 5);

      // Box count on the right
      ctx.font = '10px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(`[${lvl.boxes}]`, lx + lineW, ly - 5);

      ctx.globalAlpha = 1.0;
    });

    // Arrow along the left side
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    const arrowX = x + 6;
    ctx.beginPath();
    ctx.moveTo(arrowX, h - marginBottom);
    ctx.lineTo(arrowX, marginTop);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(arrowX - 3, marginTop + 6);
    ctx.lineTo(arrowX, marginTop);
    ctx.lineTo(arrowX + 3, marginTop + 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.stroke();
  }

  // ── Public API ──────────────────────────────────────────────────────

  /**
   * Highlight a specific orbital type or level.
   * @param {string} name - e.g. 's', 'p', 'd', '2p', '3d'
   */
  highlightOrbital(name) {
    this.highlightedOrbital = name;
  }

  /**
   * Clear any highlighting; show all orbitals at full opacity.
   */
  clearHighlight() {
    this.highlightedOrbital = null;
  }

  /**
   * Stop the animation loop and clean up.
   */
  stop() {
    this.running = false;
    if (this._animFrame) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }
  }
}

registerSim('orbitalShapes', (canvas, opts) => new OrbitalShapesViz(canvas, opts));
