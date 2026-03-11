import { registerSim } from './registry.js';

const BG      = '#0a0a1a';
const TEXT     = '#e0e0e0';
const DIM      = 'rgba(255,255,255,0.35)';
const ACCENT   = '#00d4ff';
const GREEN    = '#81c784';
const RED      = '#ef5350';
const ORANGE   = '#ffa726';
const PURPLE   = '#ab47bc';

/* ================================================================
   StoichiometryViz — three modes:
   'moleMap'  Interactive mole converter: grams <-> moles <-> particles
   'stoich'   Step-by-step stoichiometry problem solver
   'limiting' Two-slider limiting reagent explorer
   ================================================================ */

export class StoichiometryViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;
    this.time = 0;
    this.mode = opts.mode || 'moleMap';
    this.hovered = null;

    // ── Mole Map mode ──
    this.moleMapInput = 'grams';   // which box is active: 'grams' | 'moles' | 'particles'
    this.moleMapElement = 'H2O';   // current substance
    this.moleMapElements = ['H2O', 'CO2', 'NaCl', 'O2', 'C', 'Fe'];
    this.moleMapMolarMass = { H2O: 18.02, CO2: 44.01, NaCl: 58.44, O2: 32.00, C: 12.01, Fe: 55.85 };
    this.moleMapGrams = 36.04;     // starting: 2 moles of H2O
    this.moleMapEditing = 'grams'; // which field user is typing in
    this.moleMapTypedValue = '36.04';
    this.moleMapElemIdx = 0;
    // Derived values computed each frame
    this.moleMapMoles = 0;
    this.moleMapParticles = 0;
    // Track if user has interacted
    this.moleMapInteracted = false;

    // ── Stoich mode ──
    this.stoichInputGrams = 10;     // grams of H2 input
    this.stoichMaxGrams = 50;
    this.stoichDragging = false;
    this.stoichInteracted = false;

    // ── Limiting mode ──
    this.limitH2 = 6;    // moles of H2
    this.limitO2 = 2;    // moles of O2
    this.limitMaxMoles = 10;
    this.limitDraggingH2 = false;
    this.limitDraggingO2 = false;
    this.limitInteracted = false;

    // Particles for limiting mode animation
    this.limitParticles = [];
    this._initLimitParticles();

    // Events
    this._onClick = this._onClick.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onDown = this._onDown.bind(this);
    this._onUp = this._onUp.bind(this);
    this._onKey = this._onKey.bind(this);
    canvas.addEventListener('click', this._onClick);
    canvas.addEventListener('mousemove', this._onMove);
    canvas.addEventListener('mousedown', this._onDown);
    canvas.addEventListener('mouseup', this._onUp);
    canvas.addEventListener('mouseleave', this._onUp);
    canvas.tabIndex = 0;
    canvas.addEventListener('keydown', this._onKey);

    this._animate();
  }

  stop() {
    this.running = false;
    this.canvas.removeEventListener('click', this._onClick);
    this.canvas.removeEventListener('mousemove', this._onMove);
    this.canvas.removeEventListener('mousedown', this._onDown);
    this.canvas.removeEventListener('mouseup', this._onUp);
    this.canvas.removeEventListener('mouseleave', this._onUp);
    this.canvas.removeEventListener('keydown', this._onKey);
  }

  /* ── Main loop ── */
  _animate() {
    if (!this.running) return;
    this.time += 1 / 60;
    this.ctx.fillStyle = BG;
    this.ctx.fillRect(0, 0, this.W, this.H);

    if (this.mode === 'moleMap') this._drawMoleMap();
    else if (this.mode === 'stoich') this._drawStoich();
    else if (this.mode === 'limiting') this._drawLimiting();

    requestAnimationFrame(() => this._animate());
  }

  /* ════════════════════════════════════════════════════
     MOLE MAP MODE — interactive grams/moles/particles converter
     ════════════════════════════════════════════════════ */
  _drawMoleMap() {
    const ctx = this.ctx, W = this.W, H = this.H;
    const mm = this.moleMapMolarMass[this.moleMapElement];

    // Compute derived values from grams
    if (this.moleMapEditing === 'grams') {
      const g = parseFloat(this.moleMapTypedValue) || 0;
      this.moleMapGrams = g;
      this.moleMapMoles = g / mm;
      this.moleMapParticles = this.moleMapMoles * 6.022e23;
    } else if (this.moleMapEditing === 'moles') {
      const m = parseFloat(this.moleMapTypedValue) || 0;
      this.moleMapMoles = m;
      this.moleMapGrams = m * mm;
      this.moleMapParticles = m * 6.022e23;
    } else {
      const p = parseFloat(this.moleMapTypedValue) || 0;
      this.moleMapParticles = p;
      this.moleMapMoles = p / 6.022e23;
      this.moleMapGrams = this.moleMapMoles * mm;
    }

    // Title
    this._text('The Mole Map — Convert between grams, moles, and particles',
      W / 2, 24, 'bold 16px sans-serif', ACCENT);

    // Substance selector
    this._text('Substance:', 60, 54, '13px sans-serif', DIM);
    const elemBtns = this.moleMapElements;
    const btnW = 52, btnH = 24, btnGap = 6, btnStartX = 130;
    elemBtns.forEach((el, i) => {
      const x = btnStartX + i * (btnW + btnGap);
      const active = el === this.moleMapElement;
      ctx.fillStyle = active ? '#1a3a4a' : '#141428';
      ctx.strokeStyle = active ? ACCENT : '#333';
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath(); ctx.roundRect(x, 42, btnW, btnH, 4); ctx.fill(); ctx.stroke();
      this._text(el, x + btnW / 2, 54, 'bold 12px sans-serif', active ? ACCENT : TEXT);
    });
    this._text(`Molar mass: ${mm} g/mol`, W - 120, 54, '12px sans-serif', DIM);

    // Three boxes: Grams — Moles — Particles
    const boxW = 220, boxH = 100, gap = 50;
    const totalW = boxW * 3 + gap * 2;
    const startX = (W - totalW) / 2;
    const boxY = 90;

    const boxes = [
      { key: 'grams', label: 'Grams (g)', value: this.moleMapGrams, unit: 'g', color: ORANGE, x: startX },
      { key: 'moles', label: 'Moles (mol)', value: this.moleMapMoles, unit: 'mol', color: ACCENT, x: startX + boxW + gap },
      { key: 'particles', label: 'Particles', value: this.moleMapParticles, unit: '', color: GREEN, x: startX + 2 * (boxW + gap) },
    ];

    boxes.forEach(box => {
      const active = this.moleMapEditing === box.key;
      ctx.fillStyle = active ? '#1a2a3a' : '#111122';
      ctx.strokeStyle = active ? box.color : '#333';
      ctx.lineWidth = active ? 2.5 : 1;
      ctx.beginPath(); ctx.roundRect(box.x, boxY, boxW, boxH, 8); ctx.fill(); ctx.stroke();

      // Label
      this._text(box.label, box.x + boxW / 2, boxY + 18, 'bold 13px sans-serif', box.color);

      // Value
      let displayVal;
      if (active) {
        displayVal = this.moleMapTypedValue + '|';
      } else {
        displayVal = this._formatNumber(box.value, box.key);
      }
      this._text(displayVal, box.x + boxW / 2, boxY + 52, 'bold 20px monospace', TEXT);

      // Unit
      if (box.unit) {
        this._text(box.unit, box.x + boxW / 2, boxY + 78, '12px sans-serif', DIM);
      }

      // Click to edit label
      if (!active) {
        this._text('click to edit', box.x + boxW / 2, boxY + boxH + 14, '10px sans-serif', 'rgba(255,255,255,0.2)');
      } else {
        this._text('typing...', box.x + boxW / 2, boxY + boxH + 14, '10px sans-serif', box.color);
      }
    });

    // Conversion arrows between boxes
    const arrowY = boxY + boxH / 2;
    // Grams -> Moles
    const a1x1 = startX + boxW + 5, a1x2 = startX + boxW + gap - 5;
    this._drawArrow(a1x1, arrowY - 8, a1x2, arrowY - 8, ORANGE);
    this._drawArrow(a1x2, arrowY + 8, a1x1, arrowY + 8, ACCENT);
    this._text('÷ ' + mm, (a1x1 + a1x2) / 2, arrowY - 22, 'bold 11px sans-serif', ORANGE);
    this._text('× ' + mm, (a1x1 + a1x2) / 2, arrowY + 22, 'bold 11px sans-serif', ACCENT);

    // Moles -> Particles
    const a2x1 = startX + boxW + gap + boxW + 5, a2x2 = startX + 2 * (boxW + gap) - 5;
    this._drawArrow(a2x1, arrowY - 8, a2x2, arrowY - 8, ACCENT);
    this._drawArrow(a2x2, arrowY + 8, a2x1, arrowY + 8, GREEN);
    this._text('× 6.022×10²³', (a2x1 + a2x2) / 2, arrowY - 22, 'bold 10px sans-serif', ACCENT);
    this._text('÷ 6.022×10²³', (a2x1 + a2x2) / 2, arrowY + 22, 'bold 10px sans-serif', GREEN);

    // Visual: animated particles showing relative scale
    const vizY = 240;
    this._text('Visual scale:', 60, vizY, '12px sans-serif', DIM);

    // Mole count for visual (cap at some reasonable number)
    const molesForViz = Math.min(Math.max(this.moleMapMoles, 0), 10);

    // Draw animated little molecules
    const numDots = Math.min(Math.round(molesForViz * 15), 120);
    for (let i = 0; i < numDots; i++) {
      const angle = this.time * 0.3 + i * 2.399;
      const radius = 50 + (i % 7) * 18 + Math.sin(this.time + i) * 5;
      const cx = W / 2 + radius * Math.cos(angle + i * 0.02);
      const cy = vizY + 80 + radius * Math.sin(angle + i * 0.03) * 0.5;
      if (cy > vizY + 10 && cy < H - 30 && cx > 40 && cx < W - 40) {
        const alpha = 0.3 + 0.4 * Math.sin(this.time * 2 + i);
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? ACCENT : i % 3 === 1 ? GREEN : ORANGE;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Summary text at bottom
    const summaryY = H - 35;
    const gStr = this._formatNumber(this.moleMapGrams, 'grams');
    const mStr = this._formatNumber(this.moleMapMoles, 'moles');
    const pStr = this._formatNumber(this.moleMapParticles, 'particles');
    this._text(
      `${gStr} g of ${this.moleMapElement}  =  ${mStr} mol  =  ${pStr} particles`,
      W / 2, summaryY, 'bold 13px sans-serif', TEXT
    );
    this._text('Click a box and type a number to convert', W / 2, H - 14, '11px sans-serif', DIM);
  }

  /* ════════════════════════════════════════════════════
     STOICH MODE — step-by-step stoichiometry solver
     Reaction: 2H₂ + O₂ → 2H₂O
     ════════════════════════════════════════════════════ */
  _drawStoich() {
    const ctx = this.ctx, W = this.W, H = this.H;

    this._text('Stoichiometry Step-by-Step', W / 2, 22, 'bold 16px sans-serif', ACCENT);
    this._text('2H₂ + O₂  →  2H₂O', W / 2, 46, 'bold 15px monospace', TEXT);
    this._text('"How many grams of H₂O from a given mass of H₂?"', W / 2, 66, '12px sans-serif', DIM);

    // Slider for input grams of H₂
    const sliderX = 100, sliderW = W - 200, sliderY = 92;
    const sliderVal = this.stoichInputGrams;
    const frac = sliderVal / this.stoichMaxGrams;

    // Slider track
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.roundRect(sliderX, sliderY, sliderW, 8, 4); ctx.fill();
    ctx.fillStyle = ORANGE;
    ctx.beginPath(); ctx.roundRect(sliderX, sliderY, sliderW * frac, 8, 4); ctx.fill();

    // Slider thumb
    const thumbX = sliderX + sliderW * frac;
    ctx.beginPath(); ctx.arc(thumbX, sliderY + 4, 10, 0, Math.PI * 2);
    ctx.fillStyle = ORANGE; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    this._text(sliderVal.toFixed(1) + ' g H₂', thumbX, sliderY - 14, 'bold 13px sans-serif', ORANGE);

    // ── Calculation steps ──
    const molarMassH2 = 2.016;
    const molarMassH2O = 18.02;
    const molesH2 = sliderVal / molarMassH2;
    const molesH2O = molesH2;  // 2:2 ratio = 1:1
    const gramsH2O = molesH2O * molarMassH2O;

    // Step boxes
    const steps = [
      {
        num: 1, label: 'Start: Grams of H₂', color: ORANGE,
        value: `${sliderVal.toFixed(2)} g`, detail: 'Given'
      },
      {
        num: 2, label: 'Convert to moles', color: ACCENT,
        value: `${molesH2.toFixed(3)} mol H₂`,
        detail: `${sliderVal.toFixed(2)} g ÷ ${molarMassH2} g/mol`
      },
      {
        num: 3, label: 'Apply mole ratio', color: PURPLE,
        value: `${molesH2O.toFixed(3)} mol H₂O`,
        detail: `ratio 2H₂ : 2H₂O = 1:1`
      },
      {
        num: 4, label: 'Convert to grams', color: GREEN,
        value: `${gramsH2O.toFixed(2)} g H₂O`,
        detail: `${molesH2O.toFixed(3)} mol × ${molarMassH2O} g/mol`
      },
    ];

    const stepW = 180, stepH = 90, stepGap = 22;
    const stepsTotal = steps.length * stepW + (steps.length - 1) * stepGap;
    const stepStartX = (W - stepsTotal) / 2;
    const stepY = 120;

    steps.forEach((s, i) => {
      const x = stepStartX + i * (stepW + stepGap);
      // Animated highlight sweep
      const highlight = Math.sin(this.time * 1.5 - i * 0.8) > 0.7;
      ctx.fillStyle = highlight ? '#1a2a3a' : '#111122';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = highlight ? 2.5 : 1.5;
      ctx.beginPath(); ctx.roundRect(x, stepY, stepW, stepH, 8); ctx.fill(); ctx.stroke();

      // Step number circle
      ctx.beginPath(); ctx.arc(x + 20, stepY + 20, 12, 0, Math.PI * 2);
      ctx.fillStyle = s.color; ctx.fill();
      this._text(String(s.num), x + 20, stepY + 20, 'bold 12px sans-serif', '#000');

      // Label
      this._text(s.label, x + stepW / 2 + 8, stepY + 20, '11px sans-serif', s.color);

      // Value
      this._text(s.value, x + stepW / 2, stepY + 50, 'bold 16px monospace', TEXT);

      // Detail
      this._text(s.detail, x + stepW / 2, stepY + 72, '10px sans-serif', DIM);

      // Arrow to next
      if (i < steps.length - 1) {
        const ax = x + stepW + 2;
        this._drawArrow(ax, stepY + stepH / 2, ax + stepGap - 4, stepY + stepH / 2, DIM);
      }
    });

    // ── Visual: animated flow diagram ──
    const flowY = 240;
    this._text('The conversion chain:', W / 2, flowY, 'bold 13px sans-serif', DIM);

    // Draw flow: grams H2 -> moles H2 -> moles H2O -> grams H2O
    const flowBoxes = [
      { label: `${sliderVal.toFixed(1)} g`, sub: 'H₂', color: ORANGE },
      { label: `${molesH2.toFixed(2)} mol`, sub: 'H₂', color: ACCENT },
      { label: `${molesH2O.toFixed(2)} mol`, sub: 'H₂O', color: PURPLE },
      { label: `${gramsH2O.toFixed(1)} g`, sub: 'H₂O', color: GREEN },
    ];
    const flowArrows = [
      { label: `÷ ${molarMassH2}`, sub: 'g/mol' },
      { label: '× 1/1', sub: 'mole ratio' },
      { label: `× ${molarMassH2O}`, sub: 'g/mol' },
    ];

    const fbW = 130, fbH = 50, fbGap = 65;
    const fbTotal = flowBoxes.length * fbW + (flowBoxes.length - 1) * fbGap;
    const fbStartX = (W - fbTotal) / 2;
    const fbY = flowY + 18;

    flowBoxes.forEach((fb, i) => {
      const x = fbStartX + i * (fbW + fbGap);
      ctx.fillStyle = '#111122';
      ctx.strokeStyle = fb.color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x, fbY, fbW, fbH, 6); ctx.fill(); ctx.stroke();
      this._text(fb.label, x + fbW / 2, fbY + 18, 'bold 14px monospace', fb.color);
      this._text(fb.sub, x + fbW / 2, fbY + 38, '11px sans-serif', DIM);

      if (i < flowArrows.length) {
        const ax1 = x + fbW + 3, ax2 = x + fbW + fbGap - 3;
        this._drawArrow(ax1, fbY + fbH / 2, ax2, fbY + fbH / 2, DIM);
        this._text(flowArrows[i].label, (ax1 + ax2) / 2, fbY + fbH / 2 - 12, 'bold 10px sans-serif', TEXT);
        this._text(flowArrows[i].sub, (ax1 + ax2) / 2, fbY + fbH / 2 + 12, '9px sans-serif', DIM);
      }
    });

    // ── Animated molecules at bottom ──
    const molY = 350;
    this._text('Reactants consumed', W * 0.25, molY - 12, '11px sans-serif', DIM);
    this._text('Products formed', W * 0.75, molY - 12, '11px sans-serif', DIM);

    // H2 molecules (max ~6 shown)
    const numH2 = Math.min(Math.round(molesH2), 6);
    for (let i = 0; i < numH2; i++) {
      const x = W * 0.08 + i * 40;
      const bob = Math.sin(this.time * 2 + i) * 3;
      this._drawMiniH2(x, molY + 15 + bob);
    }
    if (molesH2 > 6) this._text(`+${(molesH2 - 6).toFixed(1)} more`, W * 0.08 + 6 * 40, molY + 15, '10px sans-serif', DIM);

    // Arrow
    this._text('→', W / 2, molY + 15, 'bold 20px sans-serif', DIM);

    // H2O molecules
    const numH2O = Math.min(Math.round(molesH2O), 6);
    for (let i = 0; i < numH2O; i++) {
      const x = W * 0.58 + i * 45;
      const bob = Math.sin(this.time * 2 + i + 1) * 3;
      this._drawMiniH2O(x, molY + 15 + bob);
    }
    if (molesH2O > 6) this._text(`+${(molesH2O - 6).toFixed(1)} more`, W * 0.58 + 6 * 45, molY + 15, '10px sans-serif', DIM);

    // Result summary
    this._text(
      `${sliderVal.toFixed(1)} g of H₂ produces ${gramsH2O.toFixed(1)} g of H₂O`,
      W / 2, H - 28, 'bold 14px sans-serif', GREEN
    );
    this._text('Drag the slider to change the input amount', W / 2, H - 10, '11px sans-serif', DIM);
  }

  /* ════════════════════════════════════════════════════
     LIMITING MODE — two sliders, animated reagent depletion
     Reaction: 2H₂ + O₂ → 2H₂O
     ════════════════════════════════════════════════════ */
  _drawLimiting() {
    const ctx = this.ctx, W = this.W, H = this.H;

    this._text('Limiting Reagent Explorer', W / 2, 22, 'bold 16px sans-serif', ACCENT);
    this._text('2H₂ + O₂  →  2H₂O', W / 2, 44, 'bold 14px monospace', TEXT);

    // Two sliders
    const slX = 120, slW = W - 240;
    this._drawLimitSlider(slX, 68, slW, 'H₂', this.limitH2, this.limitMaxMoles, ORANGE, 'h2');
    this._drawLimitSlider(slX, 108, slW, 'O₂', this.limitO2, this.limitMaxMoles, ACCENT, 'o2');

    // Calculation
    // 2H2 : 1O2, so H2 needs 2x moles of O2
    const molesH2needed = this.limitO2 * 2;  // H2 needed if O2 is fully used
    const molesO2needed = this.limitH2 / 2;  // O2 needed if H2 is fully used

    let limiting, excess, molesProduct, excessLeft;
    if (this.limitH2 / 2 <= this.limitO2) {
      // H2 is limiting
      limiting = 'H₂';
      excess = 'O₂';
      molesProduct = this.limitH2;  // 2H2 -> 2H2O, so moles H2O = moles H2
      excessLeft = this.limitO2 - this.limitH2 / 2;
    } else {
      // O2 is limiting
      limiting = 'O₂';
      excess = 'H₂';
      molesProduct = this.limitO2 * 2;  // 1 O2 -> 2 H2O
      excessLeft = this.limitH2 - this.limitO2 * 2;
    }

    // Info panel
    const panelY = 148;
    const panelH = 68;
    ctx.fillStyle = '#111122';
    ctx.strokeStyle = limiting === 'H₂' ? ORANGE : ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(40, panelY, W - 80, panelH, 8); ctx.fill(); ctx.stroke();

    const limColor = limiting === 'H₂' ? ORANGE : ACCENT;
    this._text(`Limiting reagent: ${limiting}`, W * 0.25, panelY + 18, 'bold 14px sans-serif', limColor);
    this._text(`${excess} is in excess (${excessLeft.toFixed(1)} mol left over)`, W * 0.25, panelY + 40, '12px sans-serif', DIM);
    this._text(`H₂O produced: ${molesProduct.toFixed(1)} mol`, W * 0.72, panelY + 18, 'bold 14px sans-serif', GREEN);
    this._text(`= ${(molesProduct * 18.02).toFixed(1)} g`, W * 0.72, panelY + 40, '13px sans-serif', GREEN);

    // Sandwich analogy
    const analY = panelY + panelH + 16;
    this._text('Think of it like making sandwiches: 2 slices of bread + 1 slice of cheese = 1 sandwich', W / 2, analY, '11px sans-serif', DIM);

    // ── Visual: animated molecules ──
    const vizY = analY + 26;
    const vizH = H - vizY - 20;
    const vizMidY = vizY + vizH / 2 - 10;

    // Draw reactant area
    this._text('Reactants', W * 0.22, vizY + 6, 'bold 12px sans-serif', DIM);
    this._text('Products', W * 0.78, vizY + 6, 'bold 12px sans-serif', DIM);

    // Dividing arrow
    ctx.strokeStyle = DIM; ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(W / 2, vizY + 18); ctx.lineTo(W / 2, H - 20); ctx.stroke();
    ctx.setLineDash([]);
    this._text('→', W / 2, vizMidY, 'bold 24px sans-serif', DIM);

    // H2 molecules (on left)
    const maxMolShown = 8;
    const h2Used = limiting === 'H₂' ? this.limitH2 : this.limitO2 * 2;
    const h2Leftover = Math.max(0, this.limitH2 - h2Used);
    const h2Total = Math.min(Math.round(this.limitH2), maxMolShown);

    for (let i = 0; i < h2Total; i++) {
      const col = (i % 4);
      const row = Math.floor(i / 4);
      const x = 60 + col * 48;
      const y = vizY + 30 + row * 40;
      const bob = Math.sin(this.time * 1.5 + i) * 2;
      const isUsed = i < Math.round(h2Used);
      if (isUsed) {
        // Faded out (consumed)
        ctx.globalAlpha = 0.25;
      }
      this._drawMiniH2(x, y + bob);
      ctx.globalAlpha = 1;
    }
    this._text(`${this.limitH2.toFixed(1)} mol H₂`, 100, H - 12, '11px sans-serif', ORANGE);

    // O2 molecules
    const o2Used = limiting === 'O₂' ? this.limitO2 : this.limitH2 / 2;
    const o2Total = Math.min(Math.round(this.limitO2), maxMolShown);

    for (let i = 0; i < o2Total; i++) {
      const col = (i % 3);
      const row = Math.floor(i / 3);
      const x = 260 + col * 45;
      const y = vizY + 30 + row * 40;
      const bob = Math.sin(this.time * 1.5 + i + 2) * 2;
      const isUsed = i < Math.round(o2Used);
      if (isUsed) {
        ctx.globalAlpha = 0.25;
      }
      this._drawMiniO2(x, y + bob);
      ctx.globalAlpha = 1;
    }
    this._text(`${this.limitO2.toFixed(1)} mol O₂`, 300, H - 12, '11px sans-serif', ACCENT);

    // Product H2O molecules (on right)
    const h2oTotal = Math.min(Math.round(molesProduct), maxMolShown);
    for (let i = 0; i < h2oTotal; i++) {
      const col = (i % 4);
      const row = Math.floor(i / 4);
      const x = W * 0.58 + col * 50;
      const y = vizY + 30 + row * 40;
      const bob = Math.sin(this.time * 1.5 + i + 4) * 2;
      this._drawMiniH2O(x, y + bob);
    }
    this._text(`${molesProduct.toFixed(1)} mol H₂O`, W * 0.75, H - 12, '11px sans-serif', GREEN);

    // Bar chart on far right
    const barX = W - 90, barW = 30, barMaxH = vizH - 30;
    const barBase = H - 25;
    // H2 bar
    const h2barH = (this.limitH2 / this.limitMaxMoles) * barMaxH;
    ctx.fillStyle = 'rgba(255,167,38,0.3)';
    ctx.fillRect(barX - 35, barBase - h2barH, barW, h2barH);
    ctx.fillStyle = ORANGE;
    ctx.fillRect(barX - 35, barBase - h2barH, barW, 2);
    this._text('H₂', barX - 20, barBase + 12, '10px sans-serif', ORANGE);

    // O2 bar
    const o2barH = (this.limitO2 / this.limitMaxMoles) * barMaxH;
    ctx.fillStyle = 'rgba(0,212,255,0.3)';
    ctx.fillRect(barX + 5, barBase - o2barH, barW, o2barH);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(barX + 5, barBase - o2barH, barW, 2);
    this._text('O₂', barX + 20, barBase + 12, '10px sans-serif', ACCENT);
  }

  _drawLimitSlider(x, y, w, label, value, max, color, key) {
    const ctx = this.ctx;
    const frac = value / max;

    this._text(label + ':', x - 40, y + 4, 'bold 13px sans-serif', color);

    // Track
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.roundRect(x, y, w, 8, 4); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x, y, w * frac, 8, 4); ctx.fill();

    // Thumb
    const thumbX = x + w * frac;
    ctx.beginPath(); ctx.arc(thumbX, y + 4, 9, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    // Value label
    this._text(value.toFixed(1) + ' mol', thumbX, y - 10, 'bold 12px sans-serif', color);
  }

  /* ── Mini molecule renderers ── */
  _drawMiniH2(x, y) {
    this._bond(x - 6, y, x + 6, y, 'rgba(255,255,255,0.3)');
    this._atom(x - 6, y, 5, '#e0e0e0', '');
    this._atom(x + 6, y, 5, '#e0e0e0', '');
  }

  _drawMiniO2(x, y) {
    this._bond(x - 7, y, x + 7, y, 'rgba(255,255,255,0.3)');
    this._atom(x - 7, y, 6, RED, '');
    this._atom(x + 7, y, 6, RED, '');
  }

  _drawMiniH2O(x, y) {
    const ha = 52.25 * Math.PI / 180;
    const bLen = 9;
    const h1x = x + bLen * Math.cos(-ha - Math.PI / 2);
    const h1y = y + bLen * Math.sin(-ha - Math.PI / 2);
    const h2x = x + bLen * Math.cos(ha - Math.PI / 2);
    const h2y = y + bLen * Math.sin(ha - Math.PI / 2);
    this._bond(x, y, h1x, h1y, 'rgba(255,255,255,0.3)');
    this._bond(x, y, h2x, h2y, 'rgba(255,255,255,0.3)');
    this._atom(x, y, 5, RED, '');
    this._atom(h1x, h1y, 3, '#e0e0e0', '');
    this._atom(h2x, h2y, 3, '#e0e0e0', '');
  }

  _initLimitParticles() {
    // Not used for static display; placeholder for future enhancement
  }

  /* ── Drawing helpers ── */

  _text(str, x, y, font = '14px sans-serif', color = TEXT) {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(str, x, y);
  }

  _atom(x, y, r, color, label) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (label) {
      ctx.font = `bold ${Math.max(8, r * 0.65)}px sans-serif`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y);
    }
  }

  _bond(x1, y1, x2, y2, color = 'rgba(255,255,255,0.4)', width = 2) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  _drawArrow(x1, y1, x2, y2, color) {
    const ctx = this.ctx;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    // Arrowhead
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8 * Math.cos(angle - 0.4), y2 - 8 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - 8 * Math.cos(angle + 0.4), y2 - 8 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  _formatNumber(val, context) {
    if (val === 0) return '0';
    if (context === 'particles') {
      if (val === 0) return '0';
      const exp = Math.floor(Math.log10(Math.abs(val)));
      const mantissa = val / Math.pow(10, exp);
      if (exp > 5 || exp < -2) {
        return mantissa.toFixed(2) + '×10^' + exp;
      }
      return val.toFixed(0);
    }
    if (Math.abs(val) < 0.001) return val.toExponential(2);
    if (Math.abs(val) < 1) return val.toFixed(4);
    if (Math.abs(val) < 100) return val.toFixed(2);
    return val.toFixed(1);
  }

  /* ── Event handling ── */

  _getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.W / rect.width),
      y: (e.clientY - rect.top) * (this.H / rect.height),
    };
  }

  _onClick(e) {
    const { x, y } = this._getCanvasCoords(e);

    if (this.mode === 'moleMap') {
      // Check substance buttons
      const btnW = 52, btnH = 24, btnGap = 6, btnStartX = 130;
      this.moleMapElements.forEach((el, i) => {
        const bx = btnStartX + i * (btnW + btnGap);
        if (x >= bx && x <= bx + btnW && y >= 42 && y <= 42 + btnH) {
          this.moleMapElement = el;
          this.moleMapInteracted = true;
        }
      });

      // Check which box was clicked
      const W = this.W;
      const boxW = 220, gap = 50;
      const totalW = boxW * 3 + gap * 2;
      const startX = (W - totalW) / 2;
      const boxY = 90, boxH = 100;

      const keys = ['grams', 'moles', 'particles'];
      keys.forEach((key, i) => {
        const bx = startX + i * (boxW + gap);
        if (x >= bx && x <= bx + boxW && y >= boxY && y <= boxY + boxH) {
          this.moleMapEditing = key;
          // Set typed value to current value of this field
          if (key === 'grams') this.moleMapTypedValue = this.moleMapGrams.toFixed(2);
          else if (key === 'moles') this.moleMapTypedValue = this.moleMapMoles.toFixed(4);
          else this.moleMapTypedValue = this.moleMapParticles.toExponential(3);
          this.canvas.focus();
          this.moleMapInteracted = true;
        }
      });
    }
  }

  _onDown(e) {
    const { x, y } = this._getCanvasCoords(e);

    if (this.mode === 'stoich') {
      const sliderY = 92;
      if (y >= sliderY - 15 && y <= sliderY + 20) {
        this.stoichDragging = true;
        this._updateStoichSlider(x);
      }
    } else if (this.mode === 'limiting') {
      if (y >= 58 && y <= 86) {
        this.limitDraggingH2 = true;
        this._updateLimitSlider(x, 'h2');
      } else if (y >= 98 && y <= 126) {
        this.limitDraggingO2 = true;
        this._updateLimitSlider(x, 'o2');
      }
    }
  }

  _onMove(e) {
    const { x, y } = this._getCanvasCoords(e);

    if (this.mode === 'stoich' && this.stoichDragging) {
      this._updateStoichSlider(x);
    } else if (this.mode === 'limiting') {
      if (this.limitDraggingH2) this._updateLimitSlider(x, 'h2');
      if (this.limitDraggingO2) this._updateLimitSlider(x, 'o2');
    }

    // Cursor
    if (this.mode === 'stoich') {
      const sliderY = 92;
      this.canvas.style.cursor = (y >= sliderY - 15 && y <= sliderY + 20) ? 'pointer' : 'default';
    } else if (this.mode === 'limiting') {
      this.canvas.style.cursor = (y >= 58 && y <= 126) ? 'pointer' : 'default';
    }
  }

  _onUp() {
    this.stoichDragging = false;
    this.limitDraggingH2 = false;
    this.limitDraggingO2 = false;
  }

  _updateStoichSlider(x) {
    const sliderX = 100, sliderW = this.W - 200;
    const frac = Math.max(0, Math.min(1, (x - sliderX) / sliderW));
    this.stoichInputGrams = Math.round(frac * this.stoichMaxGrams * 10) / 10;
    this.stoichInteracted = true;
  }

  _updateLimitSlider(x, which) {
    const slX = 120, slW = this.W - 240;
    const frac = Math.max(0, Math.min(1, (x - slX) / slW));
    const val = Math.round(frac * this.limitMaxMoles * 10) / 10;
    if (which === 'h2') this.limitH2 = val;
    else this.limitO2 = val;
    this.limitInteracted = true;
  }

  _onKey(e) {
    if (this.mode !== 'moleMap') return;

    const key = e.key;
    if (key === 'Backspace') {
      e.preventDefault();
      this.moleMapTypedValue = this.moleMapTypedValue.slice(0, -1);
      if (this.moleMapTypedValue === '') this.moleMapTypedValue = '0';
    } else if (key === 'Tab') {
      e.preventDefault();
      const keys = ['grams', 'moles', 'particles'];
      const idx = keys.indexOf(this.moleMapEditing);
      this.moleMapEditing = keys[(idx + 1) % 3];
      if (this.moleMapEditing === 'grams') this.moleMapTypedValue = this.moleMapGrams.toFixed(2);
      else if (this.moleMapEditing === 'moles') this.moleMapTypedValue = this.moleMapMoles.toFixed(4);
      else this.moleMapTypedValue = this.moleMapParticles.toExponential(3);
    } else if (/^[0-9.]$/.test(key)) {
      e.preventDefault();
      if (this.moleMapTypedValue === '0' && key !== '.') {
        this.moleMapTypedValue = key;
      } else {
        this.moleMapTypedValue += key;
      }
      this.moleMapInteracted = true;
    } else if (key === 'e' || key === 'E') {
      e.preventDefault();
      this.moleMapTypedValue += 'e';
      this.moleMapInteracted = true;
    } else if (key === '+' || key === '-') {
      e.preventDefault();
      this.moleMapTypedValue += key;
    }
  }
}

/* ── Register ── */
registerSim('stoichiometryViz', (canvas, opts) => new StoichiometryViz(canvas, opts));
