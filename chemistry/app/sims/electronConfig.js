import { registerSim } from './registry.js';

// Element data for Z=1..36
const ELEMENTS = [
  null, // index 0 unused
  { symbol: 'H',  name: 'Hydrogen' },
  { symbol: 'He', name: 'Helium' },
  { symbol: 'Li', name: 'Lithium' },
  { symbol: 'Be', name: 'Beryllium' },
  { symbol: 'B',  name: 'Boron' },
  { symbol: 'C',  name: 'Carbon' },
  { symbol: 'N',  name: 'Nitrogen' },
  { symbol: 'O',  name: 'Oxygen' },
  { symbol: 'F',  name: 'Fluorine' },
  { symbol: 'Ne', name: 'Neon' },
  { symbol: 'Na', name: 'Sodium' },
  { symbol: 'Mg', name: 'Magnesium' },
  { symbol: 'Al', name: 'Aluminium' },
  { symbol: 'Si', name: 'Silicon' },
  { symbol: 'P',  name: 'Phosphorus' },
  { symbol: 'S',  name: 'Sulfur' },
  { symbol: 'Cl', name: 'Chlorine' },
  { symbol: 'Ar', name: 'Argon' },
  { symbol: 'K',  name: 'Potassium' },
  { symbol: 'Ca', name: 'Calcium' },
  { symbol: 'Sc', name: 'Scandium' },
  { symbol: 'Ti', name: 'Titanium' },
  { symbol: 'V',  name: 'Vanadium' },
  { symbol: 'Cr', name: 'Chromium' },
  { symbol: 'Mn', name: 'Manganese' },
  { symbol: 'Fe', name: 'Iron' },
  { symbol: 'Co', name: 'Cobalt' },
  { symbol: 'Ni', name: 'Nickel' },
  { symbol: 'Cu', name: 'Copper' },
  { symbol: 'Zn', name: 'Zinc' },
  { symbol: 'Ga', name: 'Gallium' },
  { symbol: 'Ge', name: 'Germanium' },
  { symbol: 'As', name: 'Arsenic' },
  { symbol: 'Se', name: 'Selenium' },
  { symbol: 'Br', name: 'Bromine' },
  { symbol: 'Kr', name: 'Krypton' },
];

// Orbital filling order (Aufbau principle) for elements 1-36
const ORBITAL_ORDER = [
  { name: '1s', type: 's', maxE: 2,  boxes: 1 },
  { name: '2s', type: 's', maxE: 2,  boxes: 1 },
  { name: '2p', type: 'p', maxE: 6,  boxes: 3 },
  { name: '3s', type: 's', maxE: 2,  boxes: 1 },
  { name: '3p', type: 'p', maxE: 6,  boxes: 3 },
  { name: '4s', type: 's', maxE: 2,  boxes: 1 },
  { name: '3d', type: 'd', maxE: 10, boxes: 5 },
  { name: '4p', type: 'p', maxE: 6,  boxes: 3 },
];

// Color by orbital type
const ORBITAL_COLORS = {
  s: '#ef5350',
  p: '#4fc3f7',
  d: '#ffa726',
  f: '#66bb6a',
};

// Superscript digits for notation
const SUPERSCRIPTS = {
  '0': '\u2070', '1': '\u00b9', '2': '\u00b2', '3': '\u00b3', '4': '\u2074',
  '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079',
};

function toSuperscript(n) {
  return String(n).split('').map(d => SUPERSCRIPTS[d]).join('');
}

/**
 * Compute the electron filling sequence respecting Aufbau, Hund's rule, and Pauli exclusion.
 * Returns an array of steps. Each step is { orbitalIndex, boxIndex, spin } where
 * spin is 'up' or 'down'.
 *
 * Hund's rule: within a subshell, fill each box with one up-arrow first, then go back
 * and fill with down-arrows.
 */
function computeFillSequence(atomicNumber) {
  const steps = [];
  let remaining = atomicNumber;

  for (let oi = 0; oi < ORBITAL_ORDER.length && remaining > 0; oi++) {
    const orb = ORBITAL_ORDER[oi];
    const electronsHere = Math.min(remaining, orb.maxE);
    remaining -= electronsHere;

    // Hund's rule: fill up-arrows across all boxes first, then down-arrows
    let placed = 0;
    // Phase 1: one up arrow per box
    for (let b = 0; b < orb.boxes && placed < electronsHere; b++) {
      steps.push({ orbitalIndex: oi, boxIndex: b, spin: 'up' });
      placed++;
    }
    // Phase 2: down arrows (go back through boxes)
    for (let b = 0; b < orb.boxes && placed < electronsHere; b++) {
      steps.push({ orbitalIndex: oi, boxIndex: b, spin: 'down' });
      placed++;
    }
  }

  return steps;
}

/**
 * Build the electron configuration notation string up to a given number of electrons placed.
 * e.g. "1s² 2s² 2p⁶ 3s²"
 */
function buildNotation(steps, upToStep) {
  // Count electrons per orbital
  const counts = {};
  for (let i = 0; i <= upToStep; i++) {
    const orbName = ORBITAL_ORDER[steps[i].orbitalIndex].name;
    counts[orbName] = (counts[orbName] || 0) + 1;
  }
  // Build string in filling order (unique, preserving order)
  const seen = new Set();
  const parts = [];
  for (let i = 0; i <= upToStep; i++) {
    const orbName = ORBITAL_ORDER[steps[i].orbitalIndex].name;
    if (!seen.has(orbName)) {
      seen.add(orbName);
      parts.push(orbName + toSuperscript(counts[orbName]));
    }
  }
  return parts.join(' ');
}


export class ElectronConfigViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 450;

    this.atomicNumber = opts.element || 1;
    this.running = false;

    // Animation state
    this._steps = [];
    this._currentStep = -1;
    this._animProgress = 0; // 0..1 for current electron animation
    this._animFrame = null;

    this._start();
  }

  setElement(atomicNumber) {
    this.stop();
    this.atomicNumber = Math.max(1, Math.min(36, atomicNumber));
    this._start();
  }

  stop() {
    this.running = false;
    if (this._animFrame) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }
  }

  _start() {
    this._steps = computeFillSequence(this.atomicNumber);
    this._currentStep = -1;
    this._animProgress = 0;
    this.running = true;
    this._lastTime = null;
    this._animFrame = requestAnimationFrame(t => this._tick(t));
  }

  _tick(timestamp) {
    if (!this.running) return;

    if (!this._lastTime) this._lastTime = timestamp;
    const dt = (timestamp - this._lastTime) / 1000;
    this._lastTime = timestamp;

    // Advance animation
    if (this._currentStep < this._steps.length - 1) {
      this._animProgress += dt * 2.5; // speed: ~0.4s per electron
      if (this._animProgress >= 1) {
        this._animProgress = 0;
        this._currentStep++;
        // If we just finished the last step, stay there
        if (this._currentStep >= this._steps.length - 1) {
          this._currentStep = this._steps.length - 1;
          this._animProgress = 1;
        }
      }
    }

    this._draw();
    this._animFrame = requestAnimationFrame(t => this._tick(t));
  }

  _draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    const elem = ELEMENTS[this.atomicNumber];

    // --- Title ---
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`${elem.symbol} - ${elem.name}  (Z = ${this.atomicNumber})`, W / 2, 32);

    // Layout constants
    const diagramLeft = 30;
    const diagramRight = 420;
    const diagramTop = 55;
    const rowHeight = 44;
    const boxSize = 28;
    const boxGap = 4;
    const textRight = 440;

    // --- Energy level diagram (left side) ---
    // Draw orbitals from bottom (lowest energy) to top (highest energy)
    // But on screen, lowest energy at the BOTTOM
    const totalOrbitals = ORBITAL_ORDER.length;

    for (let oi = 0; oi < totalOrbitals; oi++) {
      const orb = ORBITAL_ORDER[oi];
      const color = ORBITAL_COLORS[orb.type];
      // y position: lowest energy (oi=0) at bottom
      const row = totalOrbitals - 1 - oi;
      const y = diagramTop + row * rowHeight;

      // Orbital label
      ctx.textAlign = 'left';
      ctx.fillStyle = color;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(orb.name, diagramLeft, y + boxSize / 2 + 5);

      // Energy line
      const lineX = diagramLeft + 36;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lineX, y + boxSize / 2);
      ctx.lineTo(lineX + orb.boxes * (boxSize + boxGap) + 10, y + boxSize / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Boxes
      const boxStartX = lineX + 14;
      for (let b = 0; b < orb.boxes; b++) {
        const bx = boxStartX + b * (boxSize + boxGap);
        const by = y;

        // Box outline
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, boxSize, boxSize);

        // Draw electrons (arrows) in this box
        this._drawElectronsInBox(ctx, oi, b, bx, by, boxSize, color);
      }
    }

    // --- Notation (right side) ---
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '13px monospace';
    ctx.fillText('Electron Configuration:', textRight, diagramTop + 10);

    if (this._currentStep >= 0) {
      const notation = buildNotation(this._steps, this._currentStep);
      // Wrap notation text
      const maxLineWidth = W - textRight - 15;
      const words = notation.split(' ');
      let line = '';
      let lineY = diagramTop + 32;
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#00d4ff';

      for (const word of words) {
        const testLine = line ? line + ' ' + word : word;
        const m = ctx.measureText(testLine);
        if (m.width > maxLineWidth && line) {
          ctx.fillText(line, textRight, lineY);
          line = word;
          lineY += 24;
        } else {
          line = testLine;
        }
      }
      if (line) {
        ctx.fillText(line, textRight, lineY);
      }

      // Total electrons placed
      const totalPlaced = this._currentStep + 1;
      ctx.font = '13px monospace';
      ctx.fillStyle = '#e0e0e0';
      ctx.fillText(`Electrons placed: ${totalPlaced} / ${this.atomicNumber}`, textRight, lineY + 36);
    }

    // --- Legend ---
    const legendY = H - 30;
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    const types = [
      { label: 's orbital', color: ORBITAL_COLORS.s },
      { label: 'p orbital', color: ORBITAL_COLORS.p },
      { label: 'd orbital', color: ORBITAL_COLORS.d },
      { label: 'f orbital', color: ORBITAL_COLORS.f },
    ];
    let lx = diagramLeft;
    for (const t of types) {
      ctx.fillStyle = t.color;
      ctx.fillRect(lx, legendY - 8, 12, 12);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillText(t.label, lx + 16, legendY + 2);
      lx += 110;
    }
  }

  _drawElectronsInBox(ctx, orbitalIndex, boxIndex, bx, by, size, color) {
    // Determine how many electrons are placed in this specific box
    // considering all completed steps and the currently animating one
    let hasUp = false;
    let hasDown = false;
    let animatingUp = false;
    let animatingDown = false;

    for (let i = 0; i <= this._currentStep; i++) {
      const step = this._steps[i];
      if (step.orbitalIndex === orbitalIndex && step.boxIndex === boxIndex) {
        if (step.spin === 'up') hasUp = true;
        else hasDown = true;
      }
    }

    // Check if the NEXT step (currently animating) targets this box
    const nextStep = this._currentStep + 1;
    if (nextStep < this._steps.length) {
      const step = this._steps[nextStep];
      if (step.orbitalIndex === orbitalIndex && step.boxIndex === boxIndex) {
        if (step.spin === 'up') animatingUp = true;
        else animatingDown = true;
      }
    }

    const arrowMargin = 4;
    const arrowWidth = (size - arrowMargin * 3) / 2;

    // Draw up arrow (left half of box)
    if (hasUp || animatingUp) {
      const alpha = animatingUp ? this._animProgress : 1;
      const dropOffset = animatingUp ? (1 - this._animProgress) * 20 : 0;
      this._drawArrow(ctx, bx + arrowMargin, by + arrowMargin - dropOffset, arrowWidth, size - arrowMargin * 2, 'up', color, alpha);
    }

    // Draw down arrow (right half of box)
    if (hasDown || animatingDown) {
      const alpha = animatingDown ? this._animProgress : 1;
      const dropOffset = animatingDown ? (1 - this._animProgress) * 20 : 0;
      this._drawArrow(ctx, bx + arrowMargin * 2 + arrowWidth, by + arrowMargin - dropOffset, arrowWidth, size - arrowMargin * 2, 'down', color, alpha);
    }
  }

  _drawArrow(ctx, x, y, w, h, direction, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    const cx = x + w / 2;
    const tipY = direction === 'up' ? y + 4 : y + h - 4;
    const tailY = direction === 'up' ? y + h - 4 : y + 4;
    const arrowHeadSize = 5;

    // Shaft
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.lineTo(cx, tailY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    if (direction === 'up') {
      ctx.moveTo(cx, tipY);
      ctx.lineTo(cx - arrowHeadSize, tipY + arrowHeadSize * 1.5);
      ctx.lineTo(cx + arrowHeadSize, tipY + arrowHeadSize * 1.5);
    } else {
      ctx.moveTo(cx, tipY);
      ctx.lineTo(cx - arrowHeadSize, tipY - arrowHeadSize * 1.5);
      ctx.lineTo(cx + arrowHeadSize, tipY - arrowHeadSize * 1.5);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

registerSim('electronConfig', (canvas, opts) => new ElectronConfigViz(canvas, opts));
