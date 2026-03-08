import { registerSim } from './registry.js';

export class MetalNonmetalViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width || 900;
    this.H = canvas.height || 500;
    this.mode = (opts.mode || 'sea');  // 'sea' | 'conductivity'
    this.running = true;
    this.time = 0;

    // Halves
    this.midX = this.W / 2;

    // Build atoms and electrons for each side
    this._initMetalAtoms();
    this._initMetalElectrons();
    this._initNonmetalAtoms();

    this._animate();
  }

  /* ── Metal side: atoms in a grid ── */

  _initMetalAtoms() {
    this.metalAtoms = [];
    const cols = 4, rows = 3;
    const padX = 60, padY = 80;
    const spacingX = (this.midX - 2 * padX) / (cols - 1);
    const spacingY = (this.H - 2 * padY) / (rows - 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.metalAtoms.push({
          x: padX + c * spacingX,
          y: padY + r * spacingY,
          radius: 18
        });
      }
    }
  }

  _initMetalElectrons() {
    this.metalElectrons = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      this.metalElectrons.push({
        x: 20 + Math.random() * (this.midX - 40),
        y: 50 + Math.random() * (this.H - 100),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 2.5
      });
    }
  }

  /* ── Nonmetal side: atoms scattered irregularly ── */

  _initNonmetalAtoms() {
    this.nonmetalAtoms = [];
    const positions = [
      [0.18, 0.22], [0.55, 0.18], [0.82, 0.25],
      [0.30, 0.42], [0.65, 0.40], [0.12, 0.60],
      [0.48, 0.62], [0.80, 0.58], [0.25, 0.80],
      [0.60, 0.78], [0.85, 0.82], [0.42, 0.30]
    ];
    const halfW = this.midX;
    for (const [fx, fy] of positions) {
      const numElectrons = 4 + Math.floor(Math.random() * 3);
      const electrons = [];
      for (let e = 0; e < numElectrons; e++) {
        const angle = (2 * Math.PI / numElectrons) * e;
        const orbitR = 22 + Math.random() * 6;
        electrons.push({ angle, orbitR, speed: 0.015 + Math.random() * 0.015 });
      }
      this.nonmetalAtoms.push({
        x: this.midX + 30 + fx * (halfW - 60),
        y: 50 + fy * (this.H - 100),
        radius: 15,
        electrons
      });
    }
  }

  /* ── Mode switching ── */

  setMode(mode) {
    this.mode = mode;
    // Reset electron velocities when switching modes
    if (mode === 'sea') {
      for (const e of this.metalElectrons) {
        e.vx = (Math.random() - 0.5) * 1.5;
        e.vy = (Math.random() - 0.5) * 1.5;
      }
    }
  }

  /* ── Update logic ── */

  _update() {
    this.time += 1;
    this._updateMetalElectrons();
    this._updateNonmetalElectrons();
  }

  _updateMetalElectrons() {
    for (const e of this.metalElectrons) {
      if (this.mode === 'conductivity') {
        // Electrons drift from left (–) to right (+) to show current
        e.vx += 0.06;
        e.vy += (Math.random() - 0.5) * 0.3;
      } else {
        // Random sea wandering
        e.vx += (Math.random() - 0.5) * 0.25;
        e.vy += (Math.random() - 0.5) * 0.25;
      }

      // Damping
      e.vx *= 0.96;
      e.vy *= 0.96;

      // Clamp speed
      const maxSpd = this.mode === 'conductivity' ? 3.5 : 2;
      const spd = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
      if (spd > maxSpd) { e.vx *= maxSpd / spd; e.vy *= maxSpd / spd; }

      e.x += e.vx;
      e.y += e.vy;

      // Boundary: keep in left half
      if (e.x < 8) { e.x = 8; e.vx = Math.abs(e.vx); }
      if (e.x > this.midX - 8) {
        // In conductivity mode, wrap around to simulate continuous current
        if (this.mode === 'conductivity') {
          e.x = 10;
        } else {
          e.x = this.midX - 8;
          e.vx = -Math.abs(e.vx);
        }
      }
      if (e.y < 40) { e.y = 40; e.vy = Math.abs(e.vy); }
      if (e.y > this.H - 40) { e.y = this.H - 40; e.vy = -Math.abs(e.vy); }
    }
  }

  _updateNonmetalElectrons() {
    for (const atom of this.nonmetalAtoms) {
      for (const el of atom.electrons) {
        el.angle += el.speed;
      }
    }
  }

  /* ── Drawing ── */

  _draw() {
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, this.W, this.H);

    this._drawDivider(ctx);
    this._drawMetalSide(ctx);
    this._drawNonmetalSide(ctx);
    this._drawLabels(ctx);

    if (this.mode === 'conductivity') {
      this._drawVoltageSymbols(ctx);
      this._drawConductivityNote(ctx);
    }
  }

  _drawDivider(ctx) {
    // Dividing line
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.midX, 0);
    ctx.lineTo(this.midX, this.H);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // VS badge
    const vsY = this.H / 2;
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.midX, vsY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VS', this.midX, vsY);
  }

  _drawMetalSide(ctx) {
    // Glow behind each atom core
    for (const a of this.metalAtoms) {
      const grad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius + 12);
      grad.addColorStop(0, 'rgba(255,200,80,0.15)');
      grad.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius + 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Atom cores — warm gold/orange
    for (const a of this.metalAtoms) {
      const grad = ctx.createRadialGradient(a.x - 4, a.y - 4, 2, a.x, a.y, a.radius);
      grad.addColorStop(0, '#ffe082');
      grad.addColorStop(0.6, '#ffb74d');
      grad.addColorStop(1, '#e65100');
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,224,130,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // "+" symbol inside atom
      ctx.fillStyle = '#4a2000';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', a.x, a.y);
    }

    // Electrons — cyan/blue dots
    for (const e of this.metalElectrons) {
      // Tiny glow
      ctx.beginPath();
      ctx.arc(e.x, e.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,230,255,0.12)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.mode === 'conductivity'
        ? `hsl(${190 + Math.sin(this.time * 0.05 + e.x) * 20}, 100%, 65%)`
        : '#00e5ff';
      ctx.fill();
    }
  }

  _drawNonmetalSide(ctx) {
    for (const atom of this.nonmetalAtoms) {
      // Faint orbital ring
      const maxOrbit = Math.max(...atom.electrons.map(e => e.orbitR));
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, maxOrbit, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(130,180,130,0.10)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Atom core — muted gray-green
      const grad = ctx.createRadialGradient(atom.x - 3, atom.y - 3, 2, atom.x, atom.y, atom.radius);
      grad.addColorStop(0, '#a0b8a0');
      grad.addColorStop(0.6, '#6e8b6e');
      grad.addColorStop(1, '#3a5a3a');
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, atom.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(160,200,160,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Bound electrons orbiting this atom
      for (const el of atom.electrons) {
        const ex = atom.x + Math.cos(el.angle) * el.orbitR;
        const ey = atom.y + Math.sin(el.angle) * el.orbitR;

        // Tiny glow
        ctx.beginPath();
        ctx.arc(ex, ey, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,255,180,0.10)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#90ee90';
        ctx.fill();
      }
    }
  }

  _drawLabels(ctx) {
    // Title: METAL
    ctx.fillStyle = '#ffe082';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('METAL (Sodium)', this.midX / 2, 10);

    // Subtitle
    ctx.fillStyle = 'rgba(0,229,255,0.8)';
    ctx.font = '12px monospace';
    ctx.fillText('Electrons flow freely (delocalized)', this.midX / 2, 32);

    // Title: NONMETAL
    ctx.fillStyle = '#a0b8a0';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('NONMETAL (Sulfur)', this.midX + (this.W - this.midX) / 2, 10);

    // Subtitle
    ctx.fillStyle = 'rgba(144,238,144,0.8)';
    ctx.font = '12px monospace';
    ctx.fillText('Electrons held tightly (localized)', this.midX + (this.W - this.midX) / 2, 32);

    // Mode indicator
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`mode: ${this.mode}`, this.W - 12, this.H - 10);
  }

  _drawVoltageSymbols(ctx) {
    const leftX = this.midX / 2;

    // Negative terminal (left edge)
    ctx.fillStyle = '#ff5252';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u2013', 18, this.H / 2);

    // Positive terminal (right edge of metal half)
    ctx.fillStyle = '#69f0ae';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('+', this.midX - 18, this.H / 2);

    // Arrow showing electron flow direction
    const arrowY = this.H - 55;
    ctx.strokeStyle = 'rgba(0,229,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, arrowY);
    ctx.lineTo(this.midX - 50, arrowY);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(this.midX - 50, arrowY);
    ctx.lineTo(this.midX - 60, arrowY - 6);
    ctx.lineTo(this.midX - 60, arrowY + 6);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,229,255,0.5)';
    ctx.fill();

    ctx.fillStyle = 'rgba(0,229,255,0.6)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('e\u207B flow \u2192', leftX, arrowY - 12);

    // Nonmetal side — "No current" message
    const rightCenterX = this.midX + (this.W - this.midX) / 2;
    ctx.fillStyle = 'rgba(255,82,82,0.6)';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('\u2717 No current flows', rightCenterX, this.H - 55);
    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(255,82,82,0.4)';
    ctx.fillText('Electrons cannot move between atoms', rightCenterX, this.H - 38);
  }

  _drawConductivityNote(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Voltage applied \u2014 metals conduct, nonmetals do not', this.W / 2, this.H - 10);
  }

  /* ── Animation loop ── */

  _animate() {
    if (!this.running) return;
    this._update();
    this._draw();
    requestAnimationFrame(() => this._animate());
  }

  stop() {
    this.running = false;
  }
}

registerSim('metalNonmetalViz', (canvas, opts) => new MetalNonmetalViz(canvas, opts));
