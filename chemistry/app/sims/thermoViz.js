import { registerSim } from './registry.js';

const BG      = '#0a0a1a';
const TEXT     = '#e0e0e0';
const DIM      = 'rgba(255,255,255,0.35)';
const ACCENT   = '#00d4ff';
const GREEN    = '#81c784';
const RED      = '#ef5350';
const ORANGE   = '#ffa726';
const PURPLE   = '#ab47bc';
const YELLOW   = '#ffd54f';

/* ================================================================
   ThermoViz — four modes:
   'heatTransfer'  Two containers with particles at different temps
   'specificHeat'  Material selector + mass slider, shows q = mcΔT
   'bondEnergy'    Interactive bond-breaking/forming for CH₄ combustion
   'hessLaw'       Energy level diagram: direct vs multi-step paths
   ================================================================ */

class ThermoViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;
    this.time = 0;
    this.mode = opts.mode || 'heatTransfer';

    // ── Heat Transfer mode ──
    this.htParticlesA = [];
    this.htParticlesB = [];
    this.htTempA = 400;   // K
    this.htTempB = 200;   // K
    this.htSizeA = 80;    // "mass" units (visual size)
    this.htSizeB = 40;
    this.htTransferring = false;
    this.htEquilibrium = false;
    this.htButtons = [];
    this._initHeatTransfer();

    // ── Specific Heat mode ──
    this.shMaterial = 0;   // index into materials array
    this.shMass = 100;     // grams
    this.shEnergyAdded = 0;
    this.shAnimating = false;
    this.shParticles = [];
    this.shButtons = [];
    this.shSliderDragging = false;
    this.materials = [
      { name: 'Water',    c: 4.18, color: ACCENT,  symbol: 'H₂O' },
      { name: 'Iron',     c: 0.449, color: '#aaa',  symbol: 'Fe' },
      { name: 'Copper',   c: 0.385, color: ORANGE,  symbol: 'Cu' },
      { name: 'Aluminum', c: 0.897, color: '#ccc',  symbol: 'Al' },
      { name: 'Glass',    c: 0.84,  color: PURPLE,  symbol: 'SiO₂' },
    ];
    this._initSpecificHeat();

    // ── Bond Energy mode ──
    this.beBroken = { ch: [false,false,false,false], oo: false };
    this.beFormed = { co: [false,false], oh: [false,false,false,false] };
    this.bePhase = 'break'; // 'break' | 'form' | 'done'
    this.beAnimProgress = {};
    this.beHovered = null;

    // ── Hess's Law mode ──
    this.hlPath = 'direct';  // 'direct' | 'steps'
    this.hlAnimProgress = 0;
    this.hlButtons = [];

    // Events
    this._onClick = this._onClick.bind(this);
    this._onMove  = this._onMove.bind(this);
    this._onDown  = this._onDown.bind(this);
    this._onUp    = this._onUp.bind(this);
    canvas.addEventListener('click', this._onClick);
    canvas.addEventListener('mousemove', this._onMove);
    canvas.addEventListener('mousedown', this._onDown);
    canvas.addEventListener('mouseup', this._onUp);

    this._animate();
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
    this.canvas.removeEventListener('mousemove', this._onMove);
    this.canvas.removeEventListener('mousedown', this._onDown);
    this.canvas.removeEventListener('mouseup', this._onUp);
  }

  /* ── Main loop ── */
  _animate() {
    if (!this.running) return;
    const dt = 1 / 60;
    this.time += dt;
    this.ctx.fillStyle = BG;
    this.ctx.fillRect(0, 0, this.W, this.H);

    switch (this.mode) {
      case 'heatTransfer': this._drawHeatTransfer(dt); break;
      case 'specificHeat': this._drawSpecificHeat(dt); break;
      case 'bondEnergy':   this._drawBondEnergy(dt); break;
      case 'hessLaw':      this._drawHessLaw(dt); break;
    }

    requestAnimationFrame(() => this._animate());
  }

  /* ════════════════════════════════════════════
     HEAT TRANSFER MODE
     ════════════════════════════════════════════ */
  _initHeatTransfer() {
    this.htParticlesA = this._makeParticles(24, 50, 60, 320, 280);
    this.htParticlesB = this._makeParticles(12, 530, 60, 320, 280);
    this.htButtons = [
      { label: 'Transfer Heat', x: 380, y: 370, w: 140, h: 36, action: 'transfer' },
      { label: 'Reset', x: 530, y: 370, w: 80, h: 36, action: 'htReset' },
      { label: 'Size A ↑', x: 50, y: 370, w: 90, h: 30, action: 'sizeAup' },
      { label: 'Size A ↓', x: 150, y: 370, w: 90, h: 30, action: 'sizeAdn' },
      { label: 'Size B ↑', x: 660, y: 370, w: 90, h: 30, action: 'sizeBup' },
      { label: 'Size B ↓', x: 760, y: 370, w: 90, h: 30, action: 'sizeBdn' },
    ];
  }

  _makeParticles(n, x0, y0, w, h) {
    const particles = [];
    for (let i = 0; i < n; i++) {
      particles.push({
        x: x0 + Math.random() * w,
        y: y0 + Math.random() * h,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        r: 6 + Math.random() * 3,
      });
    }
    return particles;
  }

  _drawHeatTransfer(dt) {
    const ctx = this.ctx, W = this.W, H = this.H;

    // Transfer logic
    if (this.htTransferring && !this.htEquilibrium) {
      const rate = 0.3;
      // Total energy: proportional to temp * "size"
      const totalE = this.htTempA * this.htSizeA + this.htTempB * this.htSizeB;
      const eqTemp = totalE / (this.htSizeA + this.htSizeB);
      if (this.htTempA > eqTemp + 0.5) {
        this.htTempA -= rate * (this.htTempA - eqTemp) * dt;
        this.htTempB += rate * (this.htTempA - eqTemp) * dt * (this.htSizeA / this.htSizeB);
      } else {
        this.htTempA = eqTemp;
        this.htTempB = eqTemp;
        this.htEquilibrium = true;
      }
    }

    // Container A
    const aX = 50, aY = 60, aW = 320, aH = 280;
    const bX = 530, bY = 60, bW = 320, bH = 280;

    this._drawContainer(aX, aY, aW, aH, `Container A (${this.htSizeA} g)`, this.htTempA, RED);
    this._drawContainer(bX, bY, bW, bH, `Container B (${this.htSizeB} g)`, this.htTempB, ACCENT);

    // Particles
    const speedA = Math.sqrt(this.htTempA / 300) * 3;
    const speedB = Math.sqrt(this.htTempB / 300) * 3;
    this._updateParticles(this.htParticlesA, aX, aY, aW, aH, speedA, dt);
    this._updateParticles(this.htParticlesB, bX, bY, bW, bH, speedB, dt);
    this._drawParticlesSet(this.htParticlesA, this._tempColor(this.htTempA));
    this._drawParticlesSet(this.htParticlesB, this._tempColor(this.htTempB));

    // Energy bars
    this._drawEnergyBar(170, 25, 80, 14, this.htTempA * this.htSizeA / 500, RED, 'Total E');
    this._drawEnergyBar(650, 25, 80, 14, this.htTempB * this.htSizeB / 500, ACCENT, 'Total E');

    // Temperature display
    this._text(`${Math.round(this.htTempA - 273)}°C`, aX + aW/2, aY + aH + 20, 'bold 16px sans-serif', RED);
    this._text(`${Math.round(this.htTempB - 273)}°C`, bX + bW/2, bY + bH + 20, 'bold 16px sans-serif', ACCENT);

    // Heat flow arrow
    if (this.htTransferring && !this.htEquilibrium) {
      const arrowY = 200;
      ctx.strokeStyle = ORANGE;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(aX + aW + 10, arrowY);
      ctx.lineTo(bX - 10, arrowY);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrowhead
      ctx.fillStyle = ORANGE;
      ctx.beginPath();
      ctx.moveTo(bX - 10, arrowY);
      ctx.lineTo(bX - 25, arrowY - 8);
      ctx.lineTo(bX - 25, arrowY + 8);
      ctx.fill();
      this._text('HEAT FLOW →', 450, arrowY - 15, 'bold 14px sans-serif', ORANGE);
    }

    if (this.htEquilibrium) {
      this._text('Thermal Equilibrium!', W/2, 200, 'bold 18px sans-serif', GREEN);
      this._text('Same temperature — no more heat flow', W/2, 222, '13px sans-serif', DIM);
    }

    // Title
    this._text('Heat vs Temperature', W/2, 22, 'bold 16px sans-serif', TEXT);
    this._text('Heat flows from hot → cold until equilibrium. Bigger objects have more total energy at same temp.', W/2, 42, '12px sans-serif', DIM);

    // Buttons
    for (const b of this.htButtons) this._drawButton(b);
  }

  _drawContainer(x, y, w, h, label, temp, color) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    this._text(label, x + w/2, y - 8, '13px sans-serif', color);
  }

  _drawEnergyBar(x, y, w, h, value, color, label) {
    const ctx = this.ctx;
    const maxW = w;
    const fillW = Math.min(value, maxW);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, y, maxW, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, fillW, h);
    this._text(label, x - 5, y + h/2 + 1, '10px sans-serif', DIM, 'right');
  }

  _tempColor(temp) {
    // Map temp to color: cold=blue, hot=red
    const t = Math.max(0, Math.min(1, (temp - 150) / 400));
    const r = Math.floor(50 + t * 205);
    const g = Math.floor(100 - t * 60);
    const b = Math.floor(255 - t * 200);
    return `rgb(${r},${g},${b})`;
  }

  _updateParticles(particles, x0, y0, w, h, speed, dt) {
    for (const p of particles) {
      const mag = Math.sqrt(p.vx*p.vx + p.vy*p.vy) || 1;
      p.vx = (p.vx / mag) * speed + (Math.random()-0.5)*0.3;
      p.vy = (p.vy / mag) * speed + (Math.random()-0.5)*0.3;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < x0 + p.r) { p.x = x0 + p.r; p.vx *= -1; }
      if (p.x > x0 + w - p.r) { p.x = x0 + w - p.r; p.vx *= -1; }
      if (p.y < y0 + p.r) { p.y = y0 + p.r; p.vy *= -1; }
      if (p.y > y0 + h - p.r) { p.y = y0 + h - p.r; p.vy *= -1; }
    }
  }

  _drawParticlesSet(particles, color) {
    const ctx = this.ctx;
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /* ════════════════════════════════════════════
     SPECIFIC HEAT MODE
     ════════════════════════════════════════════ */
  _initSpecificHeat() {
    this.shParticles = this._makeParticles(20, 50, 180, 300, 200);
    this.shButtons = [
      { label: 'Add 1000 J', x: 400, y: 370, w: 120, h: 36, action: 'addEnergy' },
      { label: 'Reset', x: 530, y: 370, w: 80, h: 36, action: 'shReset' },
    ];
    // Material buttons
    this.materials.forEach((m, i) => {
      this.shButtons.push({
        label: m.name, x: 420 + (i % 3) * 160, y: 60 + Math.floor(i / 3) * 40,
        w: 145, h: 32, action: `mat_${i}`,
      });
    });
  }

  _drawSpecificHeat(dt) {
    const ctx = this.ctx, W = this.W, H = this.H;
    const mat = this.materials[this.shMaterial];

    // q = mcΔT => ΔT = q / (mc)
    const deltaT = this.shEnergyAdded / (this.shMass * mat.c);
    const currentTemp = 25 + deltaT; // starting at 25°C

    // Title
    this._text('Specific Heat Capacity: q = m·c·ΔT', W/2, 22, 'bold 16px sans-serif', TEXT);
    this._text('Different materials heat up at different rates with the same energy input', W/2, 42, '12px sans-serif', DIM);

    // Material info
    this._text(`Material: ${mat.name} (${mat.symbol})`, 500, 160, 'bold 15px sans-serif', mat.color);
    this._text(`c = ${mat.c} J/(g·°C)`, 500, 180, '14px sans-serif', mat.color);

    // Mass slider
    this._text(`Mass: ${this.shMass} g`, 500, 220, '14px sans-serif', TEXT);
    const sliderX = 420, sliderY = 235, sliderW = 250;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(sliderX, sliderY, sliderW, 8);
    const knobX = sliderX + ((this.shMass - 10) / 490) * sliderW;
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(knobX, sliderY + 4, 10, 0, Math.PI * 2);
    ctx.fill();
    this.shSliderBounds = { x: sliderX, y: sliderY - 10, w: sliderW, h: 28 };

    // Energy added & temp
    this._text(`Energy added: ${this.shEnergyAdded} J`, 500, 275, '14px sans-serif', ORANGE);
    this._text(`Temperature: ${currentTemp.toFixed(1)}°C`, 500, 300, 'bold 18px sans-serif',
      currentTemp > 100 ? RED : currentTemp > 50 ? ORANGE : ACCENT);
    this._text(`ΔT = ${deltaT.toFixed(1)}°C`, 500, 325, '14px sans-serif', GREEN);

    // Particle container
    const cX = 50, cY = 180, cW = 300, cH = 200;
    ctx.strokeStyle = mat.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(cX, cY, cW, cH);
    this._text(mat.name, cX + cW/2, cY - 8, 'bold 14px sans-serif', mat.color);

    // Particles — speed based on temperature
    const speed = Math.sqrt(Math.max(currentTemp, 0) / 25) * 2;
    this._updateParticles(this.shParticles, cX, cY, cW, cH, speed, dt);
    this._drawParticlesSet(this.shParticles, mat.color);

    // Bar chart comparison
    this._drawSpecificHeatBars(50, 70, 300, 90);

    // Buttons
    for (const b of this.shButtons) {
      const isMat = b.action.startsWith('mat_');
      const matIdx = isMat ? parseInt(b.action.split('_')[1]) : -1;
      const active = isMat && matIdx === this.shMaterial;
      this._drawButton(b, active ? GREEN : null);
    }
  }

  _drawSpecificHeatBars(x, y, w, h) {
    const ctx = this.ctx;
    this._text('Specific heat comparison (J/g·°C)', x + w/2, y - 5, '11px sans-serif', DIM);
    const maxC = 4.5;
    const barH = 12;
    const gap = 4;
    this.materials.forEach((m, i) => {
      const by = y + i * (barH + gap);
      const bw = (m.c / maxC) * w;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(x, by, w, barH);
      ctx.fillStyle = m.color;
      ctx.globalAlpha = i === this.shMaterial ? 1 : 0.4;
      ctx.fillRect(x, by, bw, barH);
      ctx.globalAlpha = 1;
      this._text(`${m.name} ${m.c}`, x + bw + 5, by + barH/2 + 1, '10px sans-serif',
        i === this.shMaterial ? m.color : DIM, 'left');
    });
  }

  /* ════════════════════════════════════════════
     BOND ENERGY MODE
     ════════════════════════════════════════════ */
  _drawBondEnergy(dt) {
    const ctx = this.ctx, W = this.W, H = this.H;

    // CH₄ + 2O₂ → CO₂ + 2H₂O
    // Breaking: 4×C-H (413 each) + 2×O=O (498 each) = 1652 + 996 = 2648 kJ
    // Forming:  2×C=O (799 each) + 4×O-H (463 each) = 1598 + 1852 = 3450 kJ
    // ΔH = 2648 - 3450 = -802 kJ (exothermic)

    const breakBonds = [
      { label: 'C—H', energy: 413, broken: this.beBroken.ch[0], key: 'ch0', x: 120, y: 120 },
      { label: 'C—H', energy: 413, broken: this.beBroken.ch[1], key: 'ch1', x: 120, y: 170 },
      { label: 'C—H', energy: 413, broken: this.beBroken.ch[2], key: 'ch2', x: 120, y: 220 },
      { label: 'C—H', energy: 413, broken: this.beBroken.ch[3], key: 'ch3', x: 120, y: 270 },
      { label: 'O═O', energy: 498, broken: this.beBroken.oo, key: 'oo', x: 300, y: 170 },
      { label: 'O═O', energy: 498, broken: this.beBroken.oo, key: 'oo2', x: 300, y: 230 },
    ];

    const formBonds = [
      { label: 'C═O', energy: 799, formed: this.beFormed.co[0], key: 'co0', x: 580, y: 120 },
      { label: 'C═O', energy: 799, formed: this.beFormed.co[1], key: 'co1', x: 580, y: 170 },
      { label: 'O—H', energy: 463, formed: this.beFormed.oh[0], key: 'oh0', x: 750, y: 120 },
      { label: 'O—H', energy: 463, formed: this.beFormed.oh[1], key: 'oh1', x: 750, y: 170 },
      { label: 'O—H', energy: 463, formed: this.beFormed.oh[2], key: 'oh2', x: 750, y: 220 },
      { label: 'O—H', energy: 463, formed: this.beFormed.oh[3], key: 'oh3', x: 750, y: 270 },
    ];

    // Title
    this._text('Bond Energies — CH₄ + 2O₂ → CO₂ + 2H₂O', W/2, 22, 'bold 16px sans-serif', TEXT);

    // Phase instruction
    if (this.bePhase === 'break') {
      this._text('Click each bond to BREAK it (costs energy)', W/2, 50, '14px sans-serif', RED);
    } else if (this.bePhase === 'form') {
      this._text('Click each bond to FORM it (releases energy)', W/2, 50, '14px sans-serif', GREEN);
    }

    // Breaking side
    this._text('BONDS BROKEN (energy IN)', 200, 80, 'bold 14px sans-serif', RED);
    this._text('Reactants', 200, 96, '12px sans-serif', DIM);
    let totalBroken = 0;
    this.beBondRects = [];

    for (const b of breakBonds) {
      const isBroken = b.key === 'oo2' ? this.beBroken.oo : (b.key === 'oo' ? this.beBroken.oo : this.beBroken.ch[parseInt(b.key.slice(2))] ?? this.beBroken.oo);
      const bx = b.x, by = b.y, bw = 150, bh = 32;

      if (isBroken) {
        totalBroken += b.energy;
        ctx.fillStyle = 'rgba(239,83,80,0.15)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = RED;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
        this._text(`${b.label}  +${b.energy} kJ`, bx + bw/2, by + bh/2 + 1, '13px sans-serif', RED);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = this.beHovered === b.key ? ORANGE : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = this.beHovered === b.key ? 2 : 1;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.lineWidth = 1;
        this._text(`${b.label}  ${b.energy} kJ`, bx + bw/2, by + bh/2 + 1, '13px sans-serif', TEXT);
      }
      if (b.key !== 'oo2') {
        this.beBondRects.push({ key: b.key, x: bx, y: by, w: bw, h: bh, side: 'break' });
      }
    }

    // Forming side
    this._text('BONDS FORMED (energy OUT)', 680, 80, 'bold 14px sans-serif', GREEN);
    this._text('Products', 680, 96, '12px sans-serif', DIM);
    let totalFormed = 0;

    for (const b of formBonds) {
      const isFormed = b.key.startsWith('co') ? this.beFormed.co[parseInt(b.key.slice(2))] : this.beFormed.oh[parseInt(b.key.slice(2))];
      const bx = b.x, by = b.y, bw = 150, bh = 32;

      if (isFormed) {
        totalFormed += b.energy;
        ctx.fillStyle = 'rgba(129,199,132,0.15)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.lineWidth = 1;
        this._text(`${b.label}  −${b.energy} kJ`, bx + bw/2, by + bh/2 + 1, '13px sans-serif', GREEN);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(bx, by, bw, bh);
        const canForm = this.bePhase === 'form';
        ctx.strokeStyle = (canForm && this.beHovered === b.key) ? ORANGE : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = (canForm && this.beHovered === b.key) ? 2 : 1;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.lineWidth = 1;
        this._text(`${b.label}  ${b.energy} kJ`, bx + bw/2, by + bh/2 + 1, '13px sans-serif', canForm ? TEXT : DIM);
      }
      this.beBondRects.push({ key: b.key, x: bx, y: by, w: bw, h: bh, side: 'form' });
    }

    // Arrow between sides
    ctx.strokeStyle = DIM;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(470, 140);
    ctx.lineTo(470, 280);
    ctx.stroke();
    ctx.setLineDash([]);
    this._text('→', 480, 200, '24px sans-serif', DIM);

    // Tallies
    const tallyY = 320;
    this._text(`Breaking total: +${totalBroken} kJ`, 200, tallyY, 'bold 15px sans-serif', RED);
    this._text(`Forming total: −${totalFormed} kJ`, 680, tallyY, 'bold 15px sans-serif', GREEN);

    // ΔH
    const allBroken = this.beBroken.ch.every(b => b) && this.beBroken.oo;
    const allFormed = this.beFormed.co.every(b => b) && this.beFormed.oh.every(b => b);

    if (allBroken && allFormed) {
      this.bePhase = 'done';
      const dH = totalBroken - totalFormed;
      this._text(`ΔH = ${totalBroken} − ${totalFormed} = ${dH} kJ/mol`, W/2, tallyY + 35, 'bold 18px sans-serif', dH < 0 ? GREEN : RED);
      this._text(dH < 0 ? 'EXOTHERMIC — more energy released than consumed!' : 'ENDOTHERMIC', W/2, tallyY + 58, '14px sans-serif', dH < 0 ? GREEN : RED);
      this._text('Forming bonds released 802 kJ more than breaking bonds cost', W/2, tallyY + 78, '12px sans-serif', DIM);
    } else if (allBroken && this.bePhase === 'break') {
      this.bePhase = 'form';
    }

    // Reset button
    this._drawButton({ label: 'Reset', x: W/2 - 40, y: H - 30, w: 80, h: 26, action: 'beReset' });
  }

  /* ════════════════════════════════════════════
     HESS'S LAW MODE
     ════════════════════════════════════════════ */
  _drawHessLaw(dt) {
    const ctx = this.ctx, W = this.W, H = this.H;

    // C(s) + O₂(g) → CO₂(g)  ΔH = −393 kJ
    // Path 1 (direct): C + O₂ → CO₂
    // Path 2 (two steps): C + ½O₂ → CO (ΔH₁ = −110.5 kJ), CO + ½O₂ → CO₂ (ΔH₂ = −282.5 kJ)

    this._text("Hess's Law — Energy is Path-Independent", W/2, 25, 'bold 16px sans-serif', TEXT);
    this._text('The total ΔH is the same whether the reaction happens in one step or many', W/2, 47, '12px sans-serif', DIM);

    // Energy levels
    const leftX = 80, rightX = W - 80;
    const topY = 100, midY = 220, botY = 340;
    const levelW = 200;

    // Top level: C(s) + O₂(g)
    ctx.strokeStyle = RED;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX, topY);
    ctx.lineTo(leftX + levelW, topY);
    ctx.stroke();
    this._text('C(s) + O₂(g)', leftX + levelW/2, topY - 12, 'bold 13px sans-serif', RED);
    this._text('Reactants', leftX + levelW/2, topY + 18, '11px sans-serif', DIM);

    // Middle level: CO(g) + ½O₂(g) — only shown for stepped path
    if (this.hlPath === 'steps') {
      ctx.strokeStyle = ORANGE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W/2 - levelW/2, midY);
      ctx.lineTo(W/2 + levelW/2, midY);
      ctx.stroke();
      this._text('CO(g) + ½O₂(g)', W/2, midY - 12, 'bold 13px sans-serif', ORANGE);
      this._text('Intermediate', W/2, midY + 18, '11px sans-serif', DIM);
    }

    // Bottom level: CO₂(g)
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rightX - levelW, botY);
    ctx.lineTo(rightX, botY);
    ctx.stroke();
    this._text('CO₂(g)', rightX - levelW/2, botY - 12, 'bold 13px sans-serif', GREEN);
    this._text('Products', rightX - levelW/2, botY + 18, '11px sans-serif', DIM);

    // Animate progress
    this.hlAnimProgress = Math.min(this.hlAnimProgress + dt * 0.5, 1);
    const prog = this.hlAnimProgress;

    if (this.hlPath === 'direct') {
      // Direct arrow from top to bottom
      const startX = leftX + levelW;
      const endX = rightX - levelW;
      const arrowProg = Math.min(prog * 1.5, 1);

      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      const cx = (startX + endX) / 2;
      const curX = startX + (endX - startX) * arrowProg;
      const curY = topY + (botY - topY) * arrowProg;
      ctx.moveTo(startX, topY);
      // Curved arrow
      const cpx = cx, cpy = topY + 40;
      if (arrowProg < 1) {
        ctx.quadraticCurveTo(cpx * arrowProg + startX * (1-arrowProg), cpy * arrowProg + topY * (1-arrowProg), curX, curY);
      } else {
        ctx.quadraticCurveTo(cpx, cpy, endX, botY);
      }
      ctx.stroke();

      // Arrow label
      this._text('ΔH = −393 kJ', cx, (topY + botY)/2 - 20, 'bold 16px sans-serif', ACCENT);
      this._text('(one step)', cx, (topY + botY)/2 + 5, '12px sans-serif', ACCENT);

      // ΔH arrow on right
      this._drawDeltaHArrow(rightX + 20, topY, botY, '−393 kJ', ACCENT);
    } else {
      // Two-step path
      const step1Prog = Math.min(prog * 2, 1);
      const step2Prog = Math.max(0, Math.min((prog - 0.5) * 2, 1));

      // Step 1: top → middle
      ctx.strokeStyle = PURPLE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const s1endX = W/2 - levelW/2;
      const s1curX = leftX + levelW + (s1endX - leftX - levelW) * step1Prog;
      const s1curY = topY + (midY - topY) * step1Prog;
      ctx.moveTo(leftX + levelW, topY);
      ctx.lineTo(s1curX, s1curY);
      ctx.stroke();

      if (step1Prog > 0.3) {
        this._text('ΔH₁ = −110.5 kJ', (leftX + levelW + s1endX) / 2, (topY + midY) / 2 - 15, 'bold 13px sans-serif', PURPLE);
        this._text('C + ½O₂ → CO', (leftX + levelW + s1endX) / 2, (topY + midY) / 2 + 5, '11px sans-serif', PURPLE);
      }

      // Step 2: middle → bottom
      if (step2Prog > 0) {
        ctx.strokeStyle = YELLOW;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const s2startX = W/2 + levelW/2;
        const s2endX = rightX - levelW;
        const s2curX = s2startX + (s2endX - s2startX) * step2Prog;
        const s2curY = midY + (botY - midY) * step2Prog;
        ctx.moveTo(s2startX, midY);
        ctx.lineTo(s2curX, s2curY);
        ctx.stroke();

        if (step2Prog > 0.3) {
          this._text('ΔH₂ = −282.5 kJ', (s2startX + s2endX) / 2, (midY + botY) / 2 - 15, 'bold 13px sans-serif', YELLOW);
          this._text('CO + ½O₂ → CO₂', (s2startX + s2endX) / 2, (midY + botY) / 2 + 5, '11px sans-serif', YELLOW);
        }
      }

      // Total ΔH arrow
      this._drawDeltaHArrow(rightX + 20, topY, botY, '−393 kJ', ACCENT);

      // Sum at bottom
      if (prog > 0.8) {
        this._text('ΔH₁ + ΔH₂ = −110.5 + (−282.5) = −393 kJ  ✓  Same!', W/2, botY + 55, 'bold 14px sans-serif', GREEN);
      }
    }

    // Toggle buttons
    this.hlButtons = [
      { label: 'Direct Path', x: W/2 - 170, y: H - 35, w: 140, h: 30, action: 'hlDirect' },
      { label: 'Two-Step Path', x: W/2 + 30, y: H - 35, w: 140, h: 30, action: 'hlSteps' },
    ];
    this._drawButton(this.hlButtons[0], this.hlPath === 'direct' ? ACCENT : null);
    this._drawButton(this.hlButtons[1], this.hlPath === 'steps' ? PURPLE : null);
  }

  _drawDeltaHArrow(x, y1, y2, label, color) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    // Arrowhead
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y2);
    ctx.lineTo(x - 6, y2 - 12);
    ctx.lineTo(x + 6, y2 - 12);
    ctx.fill();
    this._text(label, x + 30, (y1 + y2) / 2, 'bold 14px sans-serif', color, 'left');
    this._text('ΔH', x - 15, (y1 + y2) / 2, '12px sans-serif', DIM, 'right');
  }

  /* ════════════════════════════════════════════
     EVENT HANDLERS
     ════════════════════════════════════════════ */
  _onClick(e) {
    const { x, y } = this._canvasCoords(e);

    if (this.mode === 'heatTransfer') {
      for (const b of this.htButtons) {
        if (this._inRect(x, y, b)) {
          if (b.action === 'transfer') {
            this.htTransferring = true;
          } else if (b.action === 'htReset') {
            this.htTempA = 400; this.htTempB = 200;
            this.htTransferring = false; this.htEquilibrium = false;
          } else if (b.action === 'sizeAup') {
            this.htSizeA = Math.min(200, this.htSizeA + 20);
            this.htParticlesA = this._makeParticles(Math.floor(this.htSizeA / 3.3), 50, 60, 320, 280);
            this.htTransferring = false; this.htEquilibrium = false;
          } else if (b.action === 'sizeAdn') {
            this.htSizeA = Math.max(20, this.htSizeA - 20);
            this.htParticlesA = this._makeParticles(Math.floor(this.htSizeA / 3.3), 50, 60, 320, 280);
            this.htTransferring = false; this.htEquilibrium = false;
          } else if (b.action === 'sizeBup') {
            this.htSizeB = Math.min(200, this.htSizeB + 20);
            this.htParticlesB = this._makeParticles(Math.floor(this.htSizeB / 3.3), 530, 60, 320, 280);
            this.htTransferring = false; this.htEquilibrium = false;
          } else if (b.action === 'sizeBdn') {
            this.htSizeB = Math.max(20, this.htSizeB - 20);
            this.htParticlesB = this._makeParticles(Math.floor(this.htSizeB / 3.3), 530, 60, 320, 280);
            this.htTransferring = false; this.htEquilibrium = false;
          }
        }
      }
    }

    if (this.mode === 'specificHeat') {
      for (const b of this.shButtons) {
        if (this._inRect(x, y, b)) {
          if (b.action === 'addEnergy') {
            this.shEnergyAdded += 1000;
          } else if (b.action === 'shReset') {
            this.shEnergyAdded = 0;
          } else if (b.action.startsWith('mat_')) {
            this.shMaterial = parseInt(b.action.split('_')[1]);
            this.shEnergyAdded = 0;
          }
        }
      }
    }

    if (this.mode === 'bondEnergy') {
      // Check bond clicks
      if (this.beBondRects) {
        for (const r of this.beBondRects) {
          if (this._inRect(x, y, r)) {
            if (r.side === 'break' && this.bePhase === 'break') {
              if (r.key.startsWith('ch')) {
                const idx = parseInt(r.key.slice(2));
                this.beBroken.ch[idx] = true;
              } else if (r.key === 'oo') {
                this.beBroken.oo = true;
              }
            } else if (r.side === 'form' && this.bePhase === 'form') {
              if (r.key.startsWith('co')) {
                const idx = parseInt(r.key.slice(2));
                this.beFormed.co[idx] = true;
              } else if (r.key.startsWith('oh')) {
                const idx = parseInt(r.key.slice(2));
                this.beFormed.oh[idx] = true;
              }
            }
          }
        }
      }
      // Reset button
      if (this._inRect(x, y, { x: this.W/2 - 40, y: this.H - 30, w: 80, h: 26 })) {
        this.beBroken = { ch: [false,false,false,false], oo: false };
        this.beFormed = { co: [false,false], oh: [false,false,false,false] };
        this.bePhase = 'break';
      }
    }

    if (this.mode === 'hessLaw') {
      for (const b of this.hlButtons) {
        if (this._inRect(x, y, b)) {
          if (b.action === 'hlDirect') {
            this.hlPath = 'direct';
            this.hlAnimProgress = 0;
          } else if (b.action === 'hlSteps') {
            this.hlPath = 'steps';
            this.hlAnimProgress = 0;
          }
        }
      }
    }
  }

  _onMove(e) {
    const { x, y } = this._canvasCoords(e);
    this.beHovered = null;

    if (this.mode === 'bondEnergy' && this.beBondRects) {
      for (const r of this.beBondRects) {
        if (this._inRect(x, y, r)) {
          this.beHovered = r.key;
        }
      }
    }

    if (this.mode === 'specificHeat' && this.shSliderDragging) {
      const bounds = this.shSliderBounds;
      if (bounds) {
        const t = Math.max(0, Math.min(1, (x - bounds.x) / bounds.w));
        this.shMass = Math.round(10 + t * 490);
      }
    }

    this.canvas.style.cursor = this.beHovered ? 'pointer' : 'default';
  }

  _onDown(e) {
    const { x, y } = this._canvasCoords(e);
    if (this.mode === 'specificHeat' && this.shSliderBounds) {
      const b = this.shSliderBounds;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        this.shSliderDragging = true;
      }
    }
  }

  _onUp() {
    this.shSliderDragging = false;
  }

  /* ════════════════════════════════════════════
     HELPERS
     ════════════════════════════════════════════ */
  _canvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.W / rect.width),
      y: (e.clientY - rect.top) * (this.H / rect.height),
    };
  }

  _inRect(px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  _text(str, x, y, font, color, align = 'center') {
    const ctx = this.ctx;
    ctx.font = font || '14px sans-serif';
    ctx.fillStyle = color || TEXT;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
    ctx.textAlign = 'left';
  }

  _drawButton(b, activeColor) {
    const ctx = this.ctx;
    const color = activeColor || 'rgba(255,255,255,0.15)';
    ctx.fillStyle = activeColor ? activeColor : 'rgba(255,255,255,0.08)';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = activeColor || 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    this._text(b.label, b.x + b.w/2, b.y + b.h/2, '12px sans-serif', activeColor ? '#000' : TEXT);
  }
}

registerSim('thermoViz', (canvas, opts) => new ThermoViz(canvas, opts));
