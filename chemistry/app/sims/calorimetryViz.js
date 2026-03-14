import { registerSim } from './registry.js';

const BG      = '#0a0a1a';
const TEXT     = '#e0e0e0';
const DIM      = 'rgba(255,255,255,0.35)';
const ACCENT   = '#00d4ff';
const GREEN    = '#81c784';
const RED      = '#ef5350';
const ORANGE   = '#ffa726';
const YELLOW   = '#ffd54f';

/* ================================================================
   CalorimetryViz — interactive coffee-cup calorimeter
   - Select a reaction (exothermic or endothermic)
   - Click "Run Reaction" to watch temperature change
   - Live q = mcΔT calculation
   ================================================================ */

class CalorimetryViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;
    this.time = 0;

    // Reactions
    this.reactions = [
      { name: 'NaOH dissolving', formula: 'NaOH(s) → Na⁺(aq) + OH⁻(aq)', type: 'exo',
        massWater: 100, cWater: 4.18, deltaT: 13.7, molesUsed: 1, molarMass: 40,
        desc: 'Exothermic — water heats up' },
      { name: 'NH₄NO₃ dissolving', formula: 'NH₄NO₃(s) → NH₄⁺(aq) + NO₃⁻(aq)', type: 'endo',
        massWater: 100, cWater: 4.18, deltaT: -6.1, molesUsed: 1, molarMass: 80,
        desc: 'Endothermic — water cools down' },
      { name: 'HCl + NaOH', formula: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O', type: 'exo',
        massWater: 200, cWater: 4.18, deltaT: 6.8, molesUsed: 1, molarMass: 0,
        desc: 'Neutralization — exothermic' },
    ];
    this.selectedReaction = 0;
    this.reactionRunning = false;
    this.reactionComplete = false;
    this.reactionProgress = 0;   // 0→1
    this.reactionsRun = 0;
    this.currentTemp = 25.0;
    this.startTemp = 25.0;

    // Water particles
    this.particles = [];
    this._initParticles();

    // Buttons
    this.buttons = [];
    this._buildButtons();

    // Mouse
    this._onClick = this._handleClick.bind(this);
    this.canvas.addEventListener('click', this._onClick);

    this._animate();
  }

  /* ── particles ── */
  _initParticles() {
    this.particles = [];
    const cx = this.W * 0.35, cy = this.H * 0.52;
    const rw = 110, rh = 120;
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: cx + (Math.random() - 0.5) * rw * 2,
        y: cy + (Math.random() - 0.5) * rh * 2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: 3 + Math.random() * 2,
        cx, cy, rw, rh,
      });
    }
  }

  _updateParticles() {
    const speed = 0.5 + (this.currentTemp - 10) / 30;
    for (const p of this.particles) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      if (p.x < p.cx - p.rw || p.x > p.cx + p.rw) p.vx *= -1;
      if (p.y < p.cy - p.rh || p.y > p.cy + p.rh) p.vy *= -1;
    }
  }

  /* ── buttons ── */
  _buildButtons() {
    this.buttons = [];
    const bx = this.W * 0.72;
    // Reaction selector buttons
    this.reactions.forEach((r, i) => {
      this.buttons.push({
        x: bx, y: 40 + i * 50, w: 220, h: 40,
        label: r.name, action: 'select', idx: i,
      });
    });
    // Run button
    this.buttons.push({
      x: bx, y: 210, w: 220, h: 45,
      label: '▶ Run Reaction', action: 'run',
    });
    // Reset button
    this.buttons.push({
      x: bx, y: 265, w: 220, h: 35,
      label: 'Reset', action: 'reset',
    });
  }

  _handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.W / rect.width);
    const my = (e.clientY - rect.top) * (this.H / rect.height);

    for (const b of this.buttons) {
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        if (b.action === 'select' && !this.reactionRunning) {
          this.selectedReaction = b.idx;
          this.reactionComplete = false;
          this.reactionProgress = 0;
          this.currentTemp = 25.0;
        } else if (b.action === 'run' && !this.reactionRunning && !this.reactionComplete) {
          this.reactionRunning = true;
          this.reactionProgress = 0;
          this.startTemp = 25.0;
          this.currentTemp = 25.0;
        } else if (b.action === 'reset') {
          this.reactionRunning = false;
          this.reactionComplete = false;
          this.reactionProgress = 0;
          this.currentTemp = 25.0;
          this.startTemp = 25.0;
        }
      }
    }
  }

  /* ── drawing ── */
  _drawCup(ctx) {
    const cx = this.W * 0.35, cy = this.H * 0.5;
    const cw = 160, ch = 200;
    const top = cy - ch / 2, bot = cy + ch / 2;
    const left = cx - cw / 2, right = cx + cw / 2;

    // Insulation (outer cup)
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left - 10, top - 10);
    ctx.lineTo(left - 10, bot + 10);
    ctx.lineTo(right + 10, bot + 10);
    ctx.lineTo(right + 10, top - 10);
    ctx.stroke();

    // Labels
    ctx.fillStyle = DIM;
    ctx.font = '11px monospace';
    ctx.fillText('insulated', left - 12, bot + 28);
    ctx.fillText('cup', left + 8, bot + 28);

    // Water fill
    const rxn = this.reactions[this.selectedReaction];
    const waterColor = rxn.type === 'exo' && this.reactionProgress > 0
      ? `rgba(239,83,80,${0.1 + this.reactionProgress * 0.15})`
      : rxn.type === 'endo' && this.reactionProgress > 0
        ? `rgba(0,212,255,${0.1 + this.reactionProgress * 0.15})`
        : 'rgba(0,212,255,0.08)';
    ctx.fillStyle = waterColor;
    ctx.fillRect(left, top + 30, cw, ch - 30);

    // Cup outline
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, cw, ch);

    // Thermometer
    const tx = right + 30, ttop = top + 10, tbot = bot - 20;
    const th = tbot - ttop;
    ctx.strokeStyle = TEXT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tx - 6, ttop, 12, th, 4);
    ctx.stroke();
    // Mercury level
    const tempFrac = Math.max(0, Math.min(1, (this.currentTemp - 10) / 50));
    const mercH = th * tempFrac;
    ctx.fillStyle = RED;
    ctx.fillRect(tx - 4, tbot - mercH, 8, mercH);
    // Temp readout
    ctx.fillStyle = TEXT;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.currentTemp.toFixed(1)}°C`, tx, tbot + 22);
    ctx.textAlign = 'left';

    // Bulb
    ctx.beginPath();
    ctx.arc(tx, tbot + 2, 8, 0, Math.PI * 2);
    ctx.fillStyle = RED;
    ctx.fill();
  }

  _drawParticles(ctx) {
    const rxn = this.reactions[this.selectedReaction];
    const isExo = rxn.type === 'exo';
    const intensity = this.reactionProgress;
    for (const p of this.particles) {
      const alpha = 0.5 + intensity * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      if (isExo && intensity > 0) {
        ctx.fillStyle = `rgba(239,83,80,${alpha})`;
      } else if (!isExo && intensity > 0) {
        ctx.fillStyle = `rgba(0,212,255,${alpha})`;
      } else {
        ctx.fillStyle = `rgba(0,212,255,0.5)`;
      }
      ctx.fill();
    }
  }

  _drawButtons(ctx) {
    for (const b of this.buttons) {
      const isSelected = b.action === 'select' && b.idx === this.selectedReaction;
      const isRun = b.action === 'run';
      ctx.fillStyle = isSelected ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.07)';
      if (isRun && !this.reactionRunning && !this.reactionComplete) {
        ctx.fillStyle = 'rgba(76,175,80,0.3)';
      }
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 6);
      ctx.fill();
      ctx.strokeStyle = isSelected ? ACCENT : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSelected ? ACCENT : TEXT;
      ctx.font = isRun ? 'bold 14px monospace' : '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 4);
      ctx.textAlign = 'left';
    }
  }

  _drawCalculation(ctx) {
    const rxn = this.reactions[this.selectedReaction];
    const y0 = 320;
    const bx = this.W * 0.72;

    ctx.fillStyle = DIM;
    ctx.font = '11px monospace';
    ctx.fillText(rxn.formula, bx, y0);
    ctx.fillText(rxn.desc, bx, y0 + 16);

    if (this.reactionProgress > 0) {
      const dT = rxn.deltaT * this.reactionProgress;
      const q = rxn.massWater * rxn.cWater * Math.abs(dT);

      ctx.fillStyle = TEXT;
      ctx.font = '13px monospace';
      ctx.fillText(`m = ${rxn.massWater} g`, bx, y0 + 42);
      ctx.fillText(`c = ${rxn.cWater} J/(g·°C)`, bx, y0 + 58);
      ctx.fillText(`ΔT = ${dT > 0 ? '+' : ''}${dT.toFixed(1)}°C`, bx, y0 + 74);

      ctx.fillStyle = rxn.type === 'exo' ? RED : ACCENT;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`q = ${q.toFixed(0)} J`, bx, y0 + 96);

      if (this.reactionComplete && rxn.molarMass > 0) {
        const qFull = rxn.massWater * rxn.cWater * Math.abs(rxn.deltaT);
        const qPerMol = qFull / rxn.molesUsed;
        const sign = rxn.type === 'exo' ? '-' : '+';
        ctx.fillStyle = YELLOW;
        ctx.font = '12px monospace';
        ctx.fillText(`ΔH = ${sign}${(qPerMol / 1000).toFixed(1)} kJ/mol`, bx, y0 + 116);
      }
    }
  }

  /* ── main loop ── */
  _animate() {
    if (!this.running) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    this.time++;

    // Update reaction progress
    if (this.reactionRunning && this.reactionProgress < 1) {
      this.reactionProgress += 0.008;
      if (this.reactionProgress >= 1) {
        this.reactionProgress = 1;
        this.reactionRunning = false;
        this.reactionComplete = true;
        this.reactionsRun++;
      }
      const rxn = this.reactions[this.selectedReaction];
      this.currentTemp = this.startTemp + rxn.deltaT * this.reactionProgress;
    }

    this._updateParticles();

    // Title
    ctx.fillStyle = TEXT;
    ctx.font = 'bold 14px monospace';
    ctx.fillText('Coffee-Cup Calorimeter', 20, 24);

    this._drawCup(ctx);
    this._drawParticles(ctx);
    this._drawButtons(ctx);
    this._drawCalculation(ctx);

    requestAnimationFrame(() => this._animate());
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
  }
}

registerSim('calorimetryViz', (canvas, opts) => new CalorimetryViz(canvas, opts));
