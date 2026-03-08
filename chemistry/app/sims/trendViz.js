import { registerSim } from './registry.js';

// ── Element data for Z = 1..36 (H to Kr) ──────────────────────────────
const ELEMENTS = [
  'H','He','Li','Be','B','C','N','O','F','Ne',
  'Na','Mg','Al','Si','P','S','Cl','Ar',
  'K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr'
];

const NOBLE_GASES  = new Set(['He','Ne','Ar','Kr']);
const ALKALI_METALS = new Set(['Li','Na','K']);

// Period boundaries: index of first element in each period
// Period 1: H,He (0-1)   Period 2: Li-Ne (2-9)   Period 3: Na-Ar (10-17)   Period 4: K-Kr (18-35)
const PERIOD_BOUNDARIES = [
  { start: 0,  end: 1,  label: 'Period 1' },
  { start: 2,  end: 9,  label: 'Period 2' },
  { start: 10, end: 17, label: 'Period 3' },
  { start: 18, end: 35, label: 'Period 4' },
];

const TREND_DATA = {
  atomicRadius: {
    label: 'Atomic Radius',
    unit: 'pm',
    description: 'Decreases across a period, increases down a group',
    acrossArrow: 'Decreases \u2192',
    downArrow: 'Increases \u2193',
    values: [
      25,31,145,105,85,70,65,60,50,38,
      180,150,125,110,100,100,100,71,
      220,180,160,140,135,140,140,140,135,135,135,135,130,125,115,115,115,88
    ],
  },
  ionizationEnergy: {
    label: 'First Ionization Energy',
    unit: 'kJ/mol',
    description: 'Increases across a period, decreases down a group',
    acrossArrow: 'Increases \u2192',
    downArrow: 'Decreases \u2193',
    values: [
      1312,2372,520,900,801,1086,1402,1314,1681,2081,
      496,738,578,786,1012,1000,1251,1521,
      419,590,633,659,651,653,717,762,760,737,745,906,579,762,947,941,1140,1351
    ],
  },
  electronegativity: {
    label: 'Electronegativity',
    unit: 'Pauling',
    description: 'Increases across a period, decreases down a group',
    acrossArrow: 'Increases \u2192',
    downArrow: 'Decreases \u2193',
    values: [
      2.2,0,0.98,1.57,2.04,2.55,3.04,3.44,3.98,0,
      0.93,1.31,1.61,1.90,2.19,2.58,3.16,0,
      0.82,1.00,1.36,1.54,1.63,1.66,1.55,1.83,1.88,1.91,1.90,1.65,1.81,2.01,2.18,2.55,2.96,3.00
    ],
  },
};

// ── Theme colours ──────────────────────────────────────────────────────
const THEME = {
  bg:          '#0a0a1a',
  axes:        '#555',
  text:        '#e0e0e0',
  accent:      '#00d4ff',
  nobleGas:    '#ec407a',
  alkali:      '#ef5350',
  barStart:    '#4fc3f7',
  barEnd:      '#81c784',
  periodLine:  'rgba(85,85,85,0.5)',
  periodLabel: 'rgba(224,224,224,0.45)',
};

// ── Helper: interpolate hex colours ────────────────────────────────────
function lerpColor(a, b, t) {
  const pa = [parseInt(a.slice(1,3),16), parseInt(a.slice(3,5),16), parseInt(a.slice(5,7),16)];
  const pb = [parseInt(b.slice(1,3),16), parseInt(b.slice(3,5),16), parseInt(b.slice(5,7),16)];
  const r = Math.round(pa[0] + (pb[0]-pa[0])*t);
  const g = Math.round(pa[1] + (pb[1]-pa[1])*t);
  const bl = Math.round(pa[2] + (pb[2]-pa[2])*t);
  return `rgb(${r},${g},${bl})`;
}

// ── Easing ─────────────────────────────────────────────────────────────
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ── TrendViz class ─────────────────────────────────────────────────────
export class TrendViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 400;

    this.trend = opts.trend || 'atomicRadius';
    this.animate = opts.animate !== undefined ? opts.animate : true;
    this.running = false;

    // Animation state
    this._progress = this.animate ? 0 : 1;   // 0..1
    this._startTime = null;
    this._animDuration = 1200; // ms

    // Layout constants
    this._margin = { top: 50, right: 30, bottom: 60, left: 70 };
    this._plotW = canvas.width  - this._margin.left - this._margin.right;
    this._plotH = canvas.height - this._margin.top  - this._margin.bottom;

    this._start();
  }

  // ── Public API ───────────────────────────────────────────────────────
  setTrend(trendName) {
    if (!TREND_DATA[trendName]) return;
    this.trend = trendName;
    this._progress = this.animate ? 0 : 1;
    this._startTime = null;
    if (!this.running) this._start();
  }

  stop() {
    this.running = false;
  }

  // ── Animation loop ───────────────────────────────────────────────────
  _start() {
    this.running = true;
    this._startTime = null;
    const tick = (ts) => {
      if (!this.running) return;

      if (this._startTime === null) this._startTime = ts;
      const elapsed = ts - this._startTime;

      if (this.animate && this._progress < 1) {
        this._progress = Math.min(1, elapsed / this._animDuration);
      } else {
        this._progress = 1;
      }

      this._draw();

      if (this._progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Keep running flag true but stop requesting frames
        // (re-triggered by setTrend)
      }
    };
    requestAnimationFrame(tick);
  }

  // ── Drawing ──────────────────────────────────────────────────────────
  _draw() {
    const { ctx, canvas } = this;
    const { top, right, bottom, left } = this._margin;
    const W = this._plotW;
    const H = this._plotH;
    const data = TREND_DATA[this.trend];
    const values = data.values;
    const n = ELEMENTS.length;
    const maxVal = Math.max(...values);
    const ease = easeOutCubic(this._progress);

    // ── Background ────────────────────────────────────────────────────
    ctx.fillStyle = THEME.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── Title ─────────────────────────────────────────────────────────
    ctx.fillStyle = THEME.accent;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${data.label} (${data.unit}) — Elements 1-36`, canvas.width / 2, 22);

    // ── Subtitle (trend description) ──────────────────────────────────
    ctx.fillStyle = THEME.text;
    ctx.font = '11px monospace';
    ctx.fillText(data.description, canvas.width / 2, 40);

    // ── Axes ──────────────────────────────────────────────────────────
    ctx.strokeStyle = THEME.axes;
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Y axis
    ctx.moveTo(left, top);
    ctx.lineTo(left, top + H);
    // X axis
    ctx.lineTo(left + W, top + H);
    ctx.stroke();

    // ── Y-axis ticks & labels ─────────────────────────────────────────
    const yTicks = 5;
    ctx.fillStyle = THEME.text;
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= yTicks; i++) {
      const val = (maxVal / yTicks) * i;
      const y = top + H - (H * i / yTicks);
      ctx.fillText(val.toFixed(maxVal < 10 ? 2 : 0), left - 8, y + 3);

      // grid line
      ctx.strokeStyle = 'rgba(85,85,85,0.25)';
      ctx.beginPath();
      ctx.moveTo(left + 1, y);
      ctx.lineTo(left + W, y);
      ctx.stroke();
    }

    // Y-axis label
    ctx.save();
    ctx.translate(14, top + H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = THEME.text;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${data.label} (${data.unit})`, 0, 0);
    ctx.restore();

    // ── Period boundary dashed lines ──────────────────────────────────
    const barW = W / n;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = THEME.periodLine;
    ctx.lineWidth = 1;
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = THEME.periodLabel;

    for (const p of PERIOD_BOUNDARIES) {
      // Vertical line at start of period (except Period 1)
      if (p.start > 0) {
        const x = left + p.start * barW;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, top + H);
        ctx.stroke();
      }
      // Period label at centre of the period range
      const cx = left + ((p.start + p.end) / 2 + 0.5) * barW;
      ctx.fillText(p.label, cx, top + H + 52);
    }
    ctx.setLineDash([]);

    // ── Bars ──────────────────────────────────────────────────────────
    const gap = 1;
    for (let i = 0; i < n; i++) {
      const sym = ELEMENTS[i];
      const v = values[i];
      // How many elements have "appeared" so far in animation
      const elemProgress = this.animate
        ? Math.max(0, Math.min(1, (ease * n - i) / 3))
        : 1;

      const barH = (v / maxVal) * H * elemProgress;
      const x = left + i * barW + gap;
      const y = top + H - barH;
      const w = barW - gap * 2;

      // Colour
      let color;
      if (NOBLE_GASES.has(sym)) {
        color = THEME.nobleGas;
      } else if (ALKALI_METALS.has(sym)) {
        color = THEME.alkali;
      } else {
        color = lerpColor(THEME.barStart, THEME.barEnd, i / (n - 1));
      }

      ctx.globalAlpha = Math.min(1, elemProgress);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, barH);

      // Element symbol on X axis
      ctx.fillStyle = THEME.text;
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.min(1, elemProgress);
      ctx.fillText(sym, left + (i + 0.5) * barW, top + H + 12);

      ctx.globalAlpha = 1;
    }

    // ── Connected dots overlay ────────────────────────────────────────
    ctx.beginPath();
    ctx.strokeStyle = THEME.accent;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < n; i++) {
      const elemProgress = this.animate
        ? Math.max(0, Math.min(1, (ease * n - i) / 3))
        : 1;
      if (elemProgress <= 0) break;
      const v = values[i];
      const cx = left + (i + 0.5) * barW;
      const cy = top + H - (v / maxVal) * H * elemProgress;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Dots
    for (let i = 0; i < n; i++) {
      const elemProgress = this.animate
        ? Math.max(0, Math.min(1, (ease * n - i) / 3))
        : 1;
      if (elemProgress <= 0) break;
      const v = values[i];
      const cx = left + (i + 0.5) * barW;
      const cy = top + H - (v / maxVal) * H * elemProgress;

      let dotColor;
      if (NOBLE_GASES.has(ELEMENTS[i])) dotColor = THEME.nobleGas;
      else if (ALKALI_METALS.has(ELEMENTS[i])) dotColor = THEME.alkali;
      else dotColor = THEME.accent;

      ctx.globalAlpha = elemProgress;
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── Trend annotation arrows ───────────────────────────────────────
    if (this._progress >= 1) {
      this._drawTrendAnnotations(data);
    }

    // ── Legend ─────────────────────────────────────────────────────────
    this._drawLegend();
  }

  _drawTrendAnnotations(data) {
    const ctx = this.ctx;
    const { top, left } = this._margin;
    const W = this._plotW;

    // "Across period" arrow — drawn along the top of the plot
    ctx.save();
    ctx.strokeStyle = THEME.accent;
    ctx.fillStyle = THEME.accent;
    ctx.lineWidth = 1.5;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';

    const arrowY = top + 14;
    const arrowX1 = left + W * 0.55;
    const arrowX2 = left + W * 0.88;

    // Arrow line
    ctx.beginPath();
    ctx.moveTo(arrowX1, arrowY);
    ctx.lineTo(arrowX2, arrowY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(arrowX2, arrowY);
    ctx.lineTo(arrowX2 - 6, arrowY - 4);
    ctx.lineTo(arrowX2 - 6, arrowY + 4);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillText(`Across period: ${data.acrossArrow}`, arrowX1, arrowY - 6);

    // "Down group" arrow — drawn on the right side
    const downX = left + W + 8;
    const downY1 = top + 40;
    const downY2 = top + this._plotH * 0.5;

    ctx.beginPath();
    ctx.moveTo(downX, downY1);
    ctx.lineTo(downX, downY2);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(downX, downY2);
    ctx.lineTo(downX - 4, downY2 - 6);
    ctx.lineTo(downX + 4, downY2 - 6);
    ctx.closePath();
    ctx.fill();

    // Vertical label
    ctx.save();
    ctx.translate(downX + 12, (downY1 + downY2) / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = '9px monospace';
    ctx.fillText(`Down group: ${data.downArrow}`, 0, 0);
    ctx.restore();

    ctx.restore();
  }

  _drawLegend() {
    const ctx = this.ctx;
    const x = this._margin.left + 4;
    const y = this._margin.top + 6;

    ctx.font = '9px monospace';
    ctx.textAlign = 'left';

    const items = [
      { color: THEME.nobleGas, label: 'Noble gas' },
      { color: THEME.alkali,   label: 'Alkali metal' },
      { color: lerpColor(THEME.barStart, THEME.barEnd, 0.5), label: 'Other elements' },
    ];

    items.forEach((item, i) => {
      const iy = y + i * 14;
      ctx.fillStyle = item.color;
      ctx.fillRect(x, iy - 6, 10, 10);
      ctx.fillStyle = THEME.text;
      ctx.fillText(item.label, x + 14, iy + 3);
    });
  }
}

// ── Register with simulation registry ──────────────────────────────────
registerSim('trendViz', (canvas, opts) => new TrendViz(canvas, opts));
