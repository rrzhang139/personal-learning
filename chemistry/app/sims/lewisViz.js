import { registerSim } from './registry.js';

const BG     = '#0a0a1a';
const ACCENT = '#00d4ff';
const GREEN  = '#4caf50';
const RED    = '#ef5350';
const ORANGE = '#ff9800';
const YELLOW = '#fdd835';
const GREY   = '#888';

/**
 * Lewis Structure Visualizer
 *
 * Animated step-by-step construction of Lewis structures.
 * User selects molecule, clicks "Next Step" to build.
 * Shows valence electron count, bonding pairs, lone pairs, octet check.
 */

const MOLECULES = [
  {
    name: 'H₂', formula: 'H₂', totalVE: 2,
    atoms: [
      { symbol: 'H', x: 340, y: 200, ve: 1, group: 1 },
      { symbol: 'H', x: 460, y: 200, ve: 1, group: 1 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }],
    lonePairs: [],
    steps: [
      'Count valence electrons: H has 1, × 2 = 2 total',
      'Central atom? With only 2 atoms, just connect them.',
      'Draw a single bond (uses 2 e⁻). Remaining: 0.',
      'Each H has 2 e⁻ (shares the bond) → full! (H only needs 2)',
    ],
  },
  {
    name: 'H₂O', formula: 'H₂O', totalVE: 8,
    atoms: [
      { symbol: 'O', x: 400, y: 180, ve: 6, group: 16 },
      { symbol: 'H', x: 300, y: 260, ve: 1, group: 1 },
      { symbol: 'H', x: 500, y: 260, ve: 1, group: 1 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 }],
    lonePairs: [{ atom: 0, pairs: 2 }],  // 2 lone pairs on O
    steps: [
      'Count valence electrons: O has 6, each H has 1 → 6 + 1 + 1 = 8 total',
      'Central atom: O (least electronegative non-H atom)',
      'Draw single bonds to each H (2 bonds × 2 e⁻ = 4 used). Remaining: 4.',
      'Place remaining 4 e⁻ as 2 lone pairs on O.',
      'Octet check: O has 2 bonds + 2 lone pairs = 8 e⁻ ✓. Each H has 2 e⁻ ✓.',
    ],
  },
  {
    name: 'NH₃', formula: 'NH₃', totalVE: 8,
    atoms: [
      { symbol: 'N', x: 400, y: 170, ve: 5, group: 15 },
      { symbol: 'H', x: 300, y: 270, ve: 1, group: 1 },
      { symbol: 'H', x: 400, y: 290, ve: 1, group: 1 },
      { symbol: 'H', x: 500, y: 270, ve: 1, group: 1 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 }, { from: 0, to: 3, order: 1 }],
    lonePairs: [{ atom: 0, pairs: 1 }],
    steps: [
      'Count valence electrons: N has 5, each H has 1 → 5 + 3 = 8 total',
      'Central atom: N (only non-H atom)',
      'Draw 3 single bonds to H atoms (3 × 2 = 6 used). Remaining: 2.',
      'Place remaining 2 e⁻ as 1 lone pair on N.',
      'Octet check: N has 3 bonds + 1 lone pair = 8 e⁻ ✓. Each H has 2 e⁻ ✓.',
    ],
  },
  {
    name: 'CO₂', formula: 'CO₂', totalVE: 16,
    atoms: [
      { symbol: 'C', x: 400, y: 200, ve: 4, group: 14 },
      { symbol: 'O', x: 270, y: 200, ve: 6, group: 16 },
      { symbol: 'O', x: 530, y: 200, ve: 6, group: 16 },
    ],
    bonds: [{ from: 0, to: 1, order: 2 }, { from: 0, to: 2, order: 2 }],
    lonePairs: [{ atom: 1, pairs: 2 }, { atom: 2, pairs: 2 }],
    steps: [
      'Count valence electrons: C has 4, each O has 6 → 4 + 6 + 6 = 16 total',
      'Central atom: C (less electronegative than O)',
      'Try single bonds first: 2 bonds = 4 e⁻ used. Remaining: 12.',
      'Distribute to outer atoms: each O gets 3 lone pairs (6 e⁻ each). Used: 12. Remaining: 0.',
      'Octet check: each O has 8 ✓, but C only has 4 ✗! Need double bonds.',
      'Convert 1 lone pair from each O into a bond → C=O double bonds.',
      'Now: C has 2 double bonds = 8 e⁻ ✓. Each O has 2 bonds + 2 lone pairs = 8 e⁻ ✓.',
    ],
  },
  {
    name: 'HCN', formula: 'HCN', totalVE: 10,
    atoms: [
      { symbol: 'C', x: 400, y: 200, ve: 4, group: 14 },
      { symbol: 'H', x: 280, y: 200, ve: 1, group: 1 },
      { symbol: 'N', x: 520, y: 200, ve: 5, group: 15 },
    ],
    bonds: [{ from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 3 }],
    lonePairs: [{ atom: 2, pairs: 1 }],
    steps: [
      'Count valence electrons: C has 4, H has 1, N has 5 → 10 total',
      'Central atom: C (between H and N)',
      'Draw single bonds: H—C—N (2 bonds = 4 e⁻). Remaining: 6.',
      'Place on outer atoms: N gets 3 lone pairs (6 e⁻). H full with 2. C only has 4 ✗.',
      'Convert 2 lone pairs from N into bonds → C≡N triple bond.',
      'C has 1 single + 1 triple = 8 e⁻ ✓. N has 1 triple + 1 lone pair = 8 e⁻ ✓. H has 2 ✓.',
    ],
  },
  {
    name: 'CH₄', formula: 'CH₄', totalVE: 8,
    atoms: [
      { symbol: 'C', x: 400, y: 200, ve: 4, group: 14 },
      { symbol: 'H', x: 310, y: 130, ve: 1, group: 1 },
      { symbol: 'H', x: 490, y: 130, ve: 1, group: 1 },
      { symbol: 'H', x: 310, y: 280, ve: 1, group: 1 },
      { symbol: 'H', x: 490, y: 280, ve: 1, group: 1 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 }, { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 }, { from: 0, to: 4, order: 1 },
    ],
    lonePairs: [],
    steps: [
      'Count valence electrons: C has 4, each H has 1 → 4 + 4 = 8 total',
      'Central atom: C',
      'Draw 4 single bonds (4 × 2 = 8 e⁻ used). Remaining: 0.',
      'Octet check: C has 4 bonds = 8 e⁻ ✓. Each H has 2 e⁻ ✓. No lone pairs needed!',
    ],
  },
];

class LewisViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;

    this.currentMol = 0;
    this.currentStep = 0;
    this.maxStepReached = 0;

    // Tracking for checkpoints
    this.moleculesViewed = new Set([0]);
    this.totalStepsAdvanced = 0;
    this.hasBuiltMultiBond = false;  // viewed CO₂ or HCN to completion

    // Buttons
    this.molButtons = MOLECULES.map((m, i) => ({
      id: i, label: m.name,
      x: 20 + i * 75, y: 375, w: 65, h: 30,
    }));

    this.stepButtons = [
      { id: 'prev', label: '◀ Prev', x: 580, y: 375, w: 80, h: 30 },
      { id: 'next', label: 'Next ▶', x: 670, y: 375, w: 80, h: 30 },
      { id: 'auto', label: '▶ Auto', x: 760, y: 375, w: 80, h: 30 },
    ];

    this._autoPlaying = false;
    this._autoTimer = 0;

    this._onClick = this._handleClick.bind(this);
    this.canvas.addEventListener('click', this._onClick);

    this._lastTime = performance.now();
    this._animate();
  }

  get mol() { return MOLECULES[this.currentMol]; }
  get maxStep() { return this.mol.steps.length - 1; }

  _handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.W / rect.width);
    const my = (e.clientY - rect.top) * (this.H / rect.height);

    // Molecule buttons
    for (const btn of this.molButtons) {
      if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
        this.currentMol = btn.id;
        this.currentStep = 0;
        this.maxStepReached = 0;
        this._autoPlaying = false;
        this.moleculesViewed.add(btn.id);
        return;
      }
    }

    // Step buttons
    for (const btn of this.stepButtons) {
      if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
        if (btn.id === 'next' && this.currentStep < this.maxStep) {
          this.currentStep++;
          this.totalStepsAdvanced++;
          if (this.currentStep > this.maxStepReached) this.maxStepReached = this.currentStep;
          if (this.currentStep === this.maxStep && (this.currentMol === 3 || this.currentMol === 4)) {
            this.hasBuiltMultiBond = true;
          }
        } else if (btn.id === 'prev' && this.currentStep > 0) {
          this.currentStep--;
        } else if (btn.id === 'auto') {
          this._autoPlaying = !this._autoPlaying;
          this._autoTimer = 0;
        }
        return;
      }
    }
  }

  _drawAtom(ctx, atom, showDots, showBondsTo) {
    const { symbol, x, y, group } = atom;

    // Atom circle
    const isH = symbol === 'H';
    const r = isH ? 22 : 30;
    ctx.fillStyle = isH ? '#1a2a3a' : '#1a1a3a';
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Symbol
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${isH ? 18 : 22}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y);
  }

  _drawBond(ctx, mol, bond, progress) {
    const a1 = mol.atoms[bond.from];
    const a2 = mol.atoms[bond.to];
    const dx = a2.x - a1.x;
    const dy = a2.y - a1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / dist;
    const ny = dx / dist;

    const offset = bond.order === 1 ? 0 : bond.order === 2 ? 5 : 7;

    for (let i = 0; i < bond.order; i++) {
      const off = (i - (bond.order - 1) / 2) * offset * 2;
      const x1 = a1.x + nx * off;
      const y1 = a1.y + ny * off;
      const x2 = a2.x + nx * off;
      const y2 = a2.y + ny * off;

      // Shorten to not overlap atoms
      const r1 = a1.symbol === 'H' ? 24 : 32;
      const r2 = a2.symbol === 'H' ? 24 : 32;
      const ux = dx / dist;
      const uy = dy / dist;

      ctx.strokeStyle = bond.order === 1 ? ACCENT : bond.order === 2 ? ORANGE : RED;
      ctx.lineWidth = 3;
      ctx.globalAlpha = progress;
      ctx.beginPath();
      ctx.moveTo(x1 + ux * r1, y1 + uy * r1);
      ctx.lineTo(x2 - ux * r2, y2 - uy * r2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  _drawLonePairs(ctx, mol, lp, progress) {
    const atom = mol.atoms[lp.atom];
    const dotR = 4;
    const dist = atom.symbol === 'H' ? 28 : 36;

    // Find directions not occupied by bonds
    const bondAngles = [];
    for (const b of mol.bonds) {
      let other;
      if (b.from === lp.atom) other = mol.atoms[b.to];
      else if (b.to === lp.atom) other = mol.atoms[b.from];
      else continue;
      bondAngles.push(Math.atan2(other.y - atom.y, other.x - atom.x));
    }

    // Place lone pairs in available directions
    const nPairs = lp.pairs;
    const availableAngles = [];
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      let tooClose = false;
      for (const ba of bondAngles) {
        if (Math.abs(a - ba) < 0.6 || Math.abs(a - ba + Math.PI * 2) < 0.6 || Math.abs(a - ba - Math.PI * 2) < 0.6) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) availableAngles.push(a);
    }

    // Pick best-spaced angles
    const chosen = [];
    if (availableAngles.length >= nPairs) {
      const step = Math.floor(availableAngles.length / nPairs);
      for (let i = 0; i < nPairs; i++) {
        chosen.push(availableAngles[(i * step) % availableAngles.length]);
      }
    }

    ctx.fillStyle = YELLOW;
    ctx.globalAlpha = progress;
    for (const angle of chosen) {
      const cx = atom.x + Math.cos(angle) * dist;
      const cy = atom.y + Math.sin(angle) * dist;
      // Draw pair as two dots
      const perpX = -Math.sin(angle) * 5;
      const perpY = Math.cos(angle) * 5;
      ctx.beginPath();
      ctx.arc(cx + perpX, cy + perpY, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - perpX, cy - perpY, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawStructure(ctx) {
    const mol = this.mol;
    const step = this.currentStep;

    // Determine what to show based on step
    // Steps typically: count VE, central atom, draw bonds, distribute lone pairs, octet check
    const showAtoms = true;
    const bondProgress = step >= 2 ? 1 : 0;
    const showMultiBonds = (mol.name === 'CO₂' && step >= 5) || (mol.name === 'HCN' && step >= 4);
    const lonePairProgress = step >= 3 ? 1 : 0;

    // Draw bonds
    if (bondProgress > 0) {
      for (const bond of mol.bonds) {
        const drawOrder = showMultiBonds ? bond.order : 1;
        this._drawBond(ctx, mol, { ...bond, order: drawOrder }, bondProgress);
      }
    }

    // Draw lone pairs
    if (lonePairProgress > 0 && mol.lonePairs.length > 0) {
      for (const lp of mol.lonePairs) {
        // For CO₂/HCN: show more lone pairs initially, then reduce after multi-bond step
        if (showMultiBonds) {
          this._drawLonePairs(ctx, mol, lp, lonePairProgress);
        } else if (step >= 3) {
          // Show with extra lone pairs (pre-multi-bond)
          const extraPairs = mol.name === 'CO₂' ? { ...lp, pairs: 3 } :
                             mol.name === 'HCN' && lp.atom === 2 ? { ...lp, pairs: 3 } : lp;
          this._drawLonePairs(ctx, mol, extraPairs, lonePairProgress);
        }
      }
    }

    // Draw atoms (on top)
    for (const atom of mol.atoms) {
      this._drawAtom(ctx, atom, step >= 1, step >= 2);
    }

    // VE count badge
    if (step >= 0) {
      ctx.fillStyle = '#1a1a2e';
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(610, 50, 180, 50, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = GREEN;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Total Valence e⁻', 700, 70);
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`${mol.totalVE}`, 700, 92);
    }

    // Bond order labels
    if (bondProgress > 0) {
      for (const bond of mol.bonds) {
        const a1 = mol.atoms[bond.from];
        const a2 = mol.atoms[bond.to];
        const mx = (a1.x + a2.x) / 2;
        const my = (a1.y + a2.y) / 2 - 18;
        const drawOrder = showMultiBonds ? bond.order : 1;
        if (drawOrder > 1) {
          ctx.fillStyle = drawOrder === 2 ? ORANGE : RED;
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          const label = drawOrder === 2 ? 'double' : 'triple';
          ctx.fillText(label, mx, my);
        }
      }
    }

    // Octet check (last step)
    if (step === this.maxStep) {
      let y = 115;
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      for (const atom of mol.atoms) {
        const isH = atom.symbol === 'H';
        const needed = isH ? 2 : 8;
        // Count electrons around this atom
        let eCount = 0;
        const atomIdx = mol.atoms.indexOf(atom);
        for (const b of mol.bonds) {
          const drawOrder = showMultiBonds ? b.order : 1;
          if (b.from === atomIdx || b.to === atomIdx) eCount += drawOrder * 2;
        }
        for (const lp of mol.lonePairs) {
          if (lp.atom === atomIdx) eCount += lp.pairs * 2;
        }
        const ok = eCount >= needed;
        ctx.fillStyle = ok ? GREEN : RED;
        ctx.fillText(`${atom.symbol}: ${eCount}/${needed} e⁻ ${ok ? '✓' : '✗'}`, 620, y);
        y += 18;
      }
    }
  }

  _drawStepText(ctx) {
    const step = this.mol.steps[this.currentStep];

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(15, 15, 560, 45);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(15, 15, 560, 45);

    ctx.fillStyle = '#fff';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';

    // Word wrap
    const words = step.split(' ');
    let line = '';
    let y = 32;
    for (const w of words) {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > 540) {
        ctx.fillText(line.trim(), 25, y);
        line = w + ' ';
        y += 17;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), 25, y);

    // Step counter
    ctx.fillStyle = GREY;
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Step ${this.currentStep + 1}/${this.maxStep + 1}`, 570, 55);
  }

  _drawButtons(ctx) {
    // Molecule selector
    ctx.fillStyle = '#ccc';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Select molecule:', 20, 368);

    for (const btn of this.molButtons) {
      const active = btn.id === this.currentMol;
      ctx.fillStyle = active ? '#1a3a2a' : '#1a1a2e';
      ctx.strokeStyle = active ? GREEN : '#444';
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = active ? GREEN : '#ccc';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }

    // Step controls
    for (const btn of this.stepButtons) {
      const disabled = (btn.id === 'prev' && this.currentStep === 0) ||
                       (btn.id === 'next' && this.currentStep === this.maxStep);
      ctx.fillStyle = disabled ? '#111' : btn.id === 'auto' && this._autoPlaying ? '#2a1a1a' : '#1a1a2e';
      ctx.strokeStyle = disabled ? '#333' : btn.id === 'auto' && this._autoPlaying ? RED : ACCENT;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = disabled ? '#555' : '#eee';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = btn.id === 'auto' && this._autoPlaying ? '⏸ Stop' : btn.label;
      ctx.fillText(label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }
  }

  _animate() {
    if (!this.running) return;
    const now = performance.now();
    const dt = now - this._lastTime;
    this._lastTime = now;

    // Auto-play
    if (this._autoPlaying) {
      this._autoTimer += dt;
      if (this._autoTimer > 2500) {
        this._autoTimer = 0;
        if (this.currentStep < this.maxStep) {
          this.currentStep++;
          this.totalStepsAdvanced++;
          if (this.currentStep > this.maxStepReached) this.maxStepReached = this.currentStep;
          if (this.currentStep === this.maxStep && (this.currentMol === 3 || this.currentMol === 4)) {
            this.hasBuiltMultiBond = true;
          }
        } else {
          this._autoPlaying = false;
        }
      }
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Lewis Structure: ${this.mol.formula}`, this.W / 2, this.H / 2 + 170);

    this._drawStructure(ctx);
    this._drawStepText(ctx);
    this._drawButtons(ctx);

    requestAnimationFrame(() => this._animate());
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
  }
}

registerSim('lewisViz', (canvas, opts) => new LewisViz(canvas, opts));
