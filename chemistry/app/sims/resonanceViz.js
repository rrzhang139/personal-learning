import { registerSim } from './registry.js';

const BG     = '#0a0a1a';
const ACCENT = '#00d4ff';
const GREEN  = '#4caf50';
const RED    = '#ef5350';
const ORANGE = '#ff9800';
const YELLOW = '#fdd835';
const GREY   = '#888';
const PURPLE = '#bb86fc';

/**
 * Resonance & Formal Charge Visualizer
 *
 * Shows multiple Lewis structures for the same molecule,
 * calculates formal charge on each atom, and animates
 * the "blend" (resonance hybrid) with delocalized electrons.
 */

const EXAMPLES = [
  {
    name: 'O₃ (ozone)',
    totalVE: 18,
    structures: [
      {
        label: 'Structure A',
        atoms: [
          { symbol: 'O', x: 250, y: 190, fc: 0 },
          { symbol: 'O', x: 400, y: 190, fc: +1 },
          { symbol: 'O', x: 550, y: 190, fc: -1 },
        ],
        bonds: [{ from: 0, to: 1, order: 2 }, { from: 1, to: 2, order: 1 }],
        lonePairs: [
          { atom: 0, count: 2 }, { atom: 1, count: 1 }, { atom: 2, count: 3 },
        ],
      },
      {
        label: 'Structure B',
        atoms: [
          { symbol: 'O', x: 250, y: 190, fc: -1 },
          { symbol: 'O', x: 400, y: 190, fc: +1 },
          { symbol: 'O', x: 550, y: 190, fc: 0 },
        ],
        bonds: [{ from: 0, to: 1, order: 1 }, { from: 1, to: 2, order: 2 }],
        lonePairs: [
          { atom: 0, count: 3 }, { atom: 1, count: 1 }, { atom: 2, count: 2 },
        ],
      },
    ],
    hybrid: 'Each O—O bond is 1.5 order. Electrons delocalized across all three O atoms.',
    fcExplain: 'FC = (valence e⁻) − (lone pair e⁻) − (½ bonding e⁻)',
  },
  {
    name: 'CO₃²⁻ (carbonate)',
    totalVE: 24,
    structures: [
      {
        label: 'Structure A',
        atoms: [
          { symbol: 'C', x: 400, y: 160, fc: 0 },
          { symbol: 'O', x: 270, y: 250, fc: -1 },
          { symbol: 'O', x: 530, y: 250, fc: -1 },
          { symbol: 'O', x: 400, y: 280, fc: 0 },
        ],
        bonds: [{ from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 }, { from: 0, to: 3, order: 2 }],
        lonePairs: [
          { atom: 1, count: 3 }, { atom: 2, count: 3 }, { atom: 3, count: 2 },
        ],
      },
      {
        label: 'Structure B',
        atoms: [
          { symbol: 'C', x: 400, y: 160, fc: 0 },
          { symbol: 'O', x: 270, y: 250, fc: 0 },
          { symbol: 'O', x: 530, y: 250, fc: -1 },
          { symbol: 'O', x: 400, y: 280, fc: -1 },
        ],
        bonds: [{ from: 0, to: 1, order: 2 }, { from: 0, to: 2, order: 1 }, { from: 0, to: 3, order: 1 }],
        lonePairs: [
          { atom: 1, count: 2 }, { atom: 2, count: 3 }, { atom: 3, count: 3 },
        ],
      },
      {
        label: 'Structure C',
        atoms: [
          { symbol: 'C', x: 400, y: 160, fc: 0 },
          { symbol: 'O', x: 270, y: 250, fc: -1 },
          { symbol: 'O', x: 530, y: 250, fc: 0 },
          { symbol: 'O', x: 400, y: 280, fc: -1 },
        ],
        bonds: [{ from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 2 }, { from: 0, to: 3, order: 1 }],
        lonePairs: [
          { atom: 1, count: 3 }, { atom: 2, count: 2 }, { atom: 3, count: 3 },
        ],
      },
    ],
    hybrid: 'All three C—O bonds are equal (1.33 order). The 2⁻ charge is spread equally over all three O atoms.',
    fcExplain: 'Each resonance structure has FC summing to −2 (the ion charge).',
  },
  {
    name: 'NO₂⁻ (nitrite)',
    totalVE: 18,
    structures: [
      {
        label: 'Structure A',
        atoms: [
          { symbol: 'N', x: 400, y: 170, fc: 0 },
          { symbol: 'O', x: 280, y: 250, fc: -1 },
          { symbol: 'O', x: 520, y: 250, fc: 0 },
        ],
        bonds: [{ from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 2 }],
        lonePairs: [
          { atom: 0, count: 1 }, { atom: 1, count: 3 }, { atom: 2, count: 2 },
        ],
      },
      {
        label: 'Structure B',
        atoms: [
          { symbol: 'N', x: 400, y: 170, fc: 0 },
          { symbol: 'O', x: 280, y: 250, fc: 0 },
          { symbol: 'O', x: 520, y: 250, fc: -1 },
        ],
        bonds: [{ from: 0, to: 1, order: 2 }, { from: 0, to: 2, order: 1 }],
        lonePairs: [
          { atom: 0, count: 1 }, { atom: 1, count: 2 }, { atom: 2, count: 3 },
        ],
      },
    ],
    hybrid: 'Both N—O bonds are equal (1.5 order). The negative charge is shared between both O atoms.',
    fcExplain: 'Formal charges sum to −1 (the ion charge) in each structure.',
  },
];

class ResonanceViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;

    this.currentExample = 0;
    this.currentStructure = 0;
    this.showHybrid = false;
    this.showFC = true;

    // Tracking
    this.examplesViewed = new Set([0]);
    this.hybridViewed = false;
    this.structuresSwitched = 0;

    // Buttons
    this._buildButtons();

    this._onClick = this._handleClick.bind(this);
    this.canvas.addEventListener('click', this._onClick);

    this._lastTime = performance.now();
    this._pulsePhase = 0;
    this._animate();
  }

  _buildButtons() {
    const ex = EXAMPLES[this.currentExample];
    this.exButtons = EXAMPLES.map((e, i) => ({
      id: i, label: e.name,
      x: 15 + i * 195, y: 380, w: 185, h: 28,
    }));

    this.structButtons = [];
    const nStruct = ex.structures.length;
    for (let i = 0; i < nStruct; i++) {
      this.structButtons.push({
        id: i, label: ex.structures[i].label,
        x: 620, y: 60 + i * 38, w: 130, h: 30,
      });
    }
    this.structButtons.push({
      id: 'hybrid', label: '⟷ Hybrid',
      x: 620, y: 60 + nStruct * 38, w: 130, h: 30,
    });
    this.structButtons.push({
      id: 'fc', label: this.showFC ? '👁 FC: ON' : '👁 FC: OFF',
      x: 620, y: 60 + (nStruct + 1) * 38, w: 130, h: 30,
    });
  }

  get example() { return EXAMPLES[this.currentExample]; }
  get structure() { return this.example.structures[this.currentStructure]; }

  _handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.W / rect.width);
    const my = (e.clientY - rect.top) * (this.H / rect.height);

    for (const btn of this.exButtons) {
      if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
        this.currentExample = btn.id;
        this.currentStructure = 0;
        this.showHybrid = false;
        this.examplesViewed.add(btn.id);
        this._buildButtons();
        return;
      }
    }

    for (const btn of this.structButtons) {
      if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
        if (btn.id === 'hybrid') {
          this.showHybrid = true;
          this.hybridViewed = true;
        } else if (btn.id === 'fc') {
          this.showFC = !this.showFC;
          this._buildButtons();
        } else {
          this.currentStructure = btn.id;
          this.showHybrid = false;
          this.structuresSwitched++;
        }
        return;
      }
    }
  }

  _drawBond(ctx, x1, y1, x2, y2, order, pulse) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / dist;
    const ny = dx / dist;
    const ux = dx / dist;
    const uy = dy / dist;

    const offset = order <= 1 ? 0 : order <= 2 ? 6 : 7;
    const r1 = 28, r2 = 28;

    for (let i = 0; i < Math.ceil(order); i++) {
      const off = (i - (Math.ceil(order) - 1) / 2) * offset * 2;
      const sx = x1 + ux * r1 + nx * off;
      const sy = y1 + uy * r1 + ny * off;
      const ex = x2 - ux * r2 + nx * off;
      const ey = y2 - uy * r2 + ny * off;

      if (this.showHybrid && order !== Math.floor(order)) {
        // Dashed for fractional bonds
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = PURPLE;
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(pulse);
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = order === 1 ? ACCENT : order === 2 ? ORANGE : RED;
      }
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
  }

  _drawAtom(ctx, atom, pulse) {
    const { symbol, x, y, fc } = atom;
    const r = 26;

    ctx.fillStyle = '#1a1a3a';
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y);

    // Formal charge
    if (this.showFC && fc !== 0) {
      const fcX = x + 20;
      const fcY = y - 20;
      const color = fc > 0 ? RED : GREEN;
      ctx.fillStyle = color;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(fc > 0 ? `+${fc}` : `${fc}`, fcX, fcY);

      // Circle around FC
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fcX, fcY, 11, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  _drawLonePairs(ctx, atom, count) {
    const dist = 34;
    // Place lone pairs around atom avoiding bond directions
    const angles = [];
    const step = Math.PI * 2 / Math.max(count, 1);
    const startAngle = -Math.PI / 2;
    for (let i = 0; i < count; i++) {
      angles.push(startAngle + i * step);
    }

    ctx.fillStyle = YELLOW;
    for (const angle of angles) {
      const cx = atom.x + Math.cos(angle) * dist;
      const cy = atom.y + Math.sin(angle) * dist;
      const px = -Math.sin(angle) * 4;
      const py = Math.cos(angle) * 4;
      ctx.beginPath();
      ctx.arc(cx + px, cy + py, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - px, cy - py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawStructure(ctx, struct, pulse) {
    // Bonds
    for (const bond of struct.bonds) {
      const a1 = struct.atoms[bond.from];
      const a2 = struct.atoms[bond.to];
      this._drawBond(ctx, a1.x, a1.y, a2.x, a2.y, bond.order, pulse);
    }

    // Lone pairs
    if (struct.lonePairs) {
      for (const lp of struct.lonePairs) {
        this._drawLonePairs(ctx, struct.atoms[lp.atom], lp.count);
      }
    }

    // Atoms (on top)
    for (const atom of struct.atoms) {
      this._drawAtom(ctx, atom, pulse);
    }
  }

  _drawHybrid(ctx, pulse) {
    const ex = this.example;
    const base = ex.structures[0];

    // Draw with averaged bond orders
    const avgBonds = base.bonds.map((b, i) => {
      let sum = 0;
      for (const s of ex.structures) sum += s.bonds[i].order;
      return { ...b, order: sum / ex.structures.length };
    });

    for (const bond of avgBonds) {
      const a1 = base.atoms[bond.from];
      const a2 = base.atoms[bond.to];
      this._drawBond(ctx, a1.x, a1.y, a2.x, a2.y, bond.order, pulse);
    }

    // Atoms with no FC (hybrid)
    for (const atom of base.atoms) {
      this._drawAtom(ctx, { ...atom, fc: 0 }, pulse);
    }

    // Delocalized electron cloud
    ctx.fillStyle = `rgba(187, 134, 252, ${0.08 + 0.05 * Math.sin(pulse)})`;
    const cx = base.atoms.reduce((s, a) => s + a.x, 0) / base.atoms.length;
    const cy = base.atoms.reduce((s, a) => s + a.y, 0) / base.atoms.length;
    const spread = 100 + 10 * Math.sin(pulse);
    ctx.beginPath();
    ctx.ellipse(cx, cy, spread, spread * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hybrid description
    ctx.fillStyle = PURPLE;
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    const words = ex.hybrid.split(' ');
    let line = '', y = 320;
    for (const w of words) {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > 500) {
        ctx.fillText(line.trim(), 400, y);
        line = w + ' ';
        y += 17;
      } else line = test;
    }
    ctx.fillText(line.trim(), 400, y);
  }

  _drawInfo(ctx) {
    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(this.example.name, 15, 30);
    ctx.font = '13px monospace';
    ctx.fillStyle = ACCENT;
    ctx.fillText(`Total VE: ${this.example.totalVE}`, 15, 50);

    if (!this.showHybrid) {
      ctx.fillStyle = '#aaa';
      ctx.fillText(this.structure.label, 15, 70);
    } else {
      ctx.fillStyle = PURPLE;
      ctx.fillText('Resonance Hybrid (real molecule)', 15, 70);
    }

    // FC formula
    ctx.fillStyle = GREY;
    ctx.font = '11px monospace';
    ctx.fillText('FC = (valence e⁻) − (lone pair e⁻) − (½ bonding e⁻)', 15, 360);
  }

  _drawButtons(ctx) {
    for (const btn of this.exButtons) {
      const active = btn.id === this.currentExample;
      ctx.fillStyle = active ? '#1a3a2a' : '#1a1a2e';
      ctx.strokeStyle = active ? GREEN : '#444';
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = active ? GREEN : '#ccc';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }

    for (const btn of this.structButtons) {
      const isHybrid = btn.id === 'hybrid';
      const isFC = btn.id === 'fc';
      const active = isHybrid ? this.showHybrid :
                     isFC ? this.showFC :
                     (!this.showHybrid && btn.id === this.currentStructure);
      ctx.fillStyle = active ? (isHybrid ? '#2a1a3a' : isFC ? '#2a2a1a' : '#1a3a2a') : '#1a1a2e';
      ctx.strokeStyle = active ? (isHybrid ? PURPLE : isFC ? YELLOW : GREEN) : '#444';
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = active ? '#fff' : '#ccc';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
  }

  _animate() {
    if (!this.running) return;
    const now = performance.now();
    this._lastTime = now;
    this._pulsePhase += 0.03;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    if (this.showHybrid) {
      this._drawHybrid(ctx, this._pulsePhase);
    } else {
      this._drawStructure(ctx, this.structure, this._pulsePhase);
    }

    this._drawInfo(ctx);
    this._drawButtons(ctx);

    // Double-headed arrow between structures hint
    if (!this.showHybrid && this.example.structures.length > 1) {
      ctx.fillStyle = 'rgba(187,134,252,0.4)';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⟷', 400, 345);
      ctx.font = '10px monospace';
      ctx.fillText('resonance structures — switch right →', 400, 360);
    }

    requestAnimationFrame(() => this._animate());
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
  }
}

registerSim('resonanceViz', (canvas, opts) => new ResonanceViz(canvas, opts));
