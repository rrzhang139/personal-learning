import { registerSim } from './registry.js';

/* ── colour palette ─────────────────────────────────── */
const BG        = '#0a0a1a';
const LDF_CLR   = '#4fc3f7';   // blue
const DD_CLR    = '#66bb6a';   // green
const HB_CLR    = '#ffa726';   // orange
const TEXT_CLR  = '#e0e0e0';
const DIM_CLR   = 'rgba(255,255,255,0.35)';

/* ── helpers ────────────────────────────────────────── */
function lerp(a, b, t) { return a + (b - a) * t; }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }

function drawDashedLine(ctx, x1, y1, x2, y2, color, width = 1.5) {
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawLabel(ctx, text, x, y, font = '13px sans-serif', color = TEXT_CLR) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

/* ── water molecule helper ──────────────────────────── */
function drawWater(ctx, cx, cy, angle, scale = 1, showCharges = true) {
  const bondLen = 22 * scale;
  const halfAngle = (104.5 / 2) * Math.PI / 180;
  const cos = Math.cos, sin = Math.sin;

  // H positions relative to O at (cx, cy), rotated by `angle`
  const h1x = cx + bondLen * cos(angle - halfAngle);
  const h1y = cy + bondLen * sin(angle - halfAngle);
  const h2x = cx + bondLen * cos(angle + halfAngle);
  const h2y = cy + bondLen * sin(angle + halfAngle);

  // bonds
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(h1x, h1y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(h2x, h2y); ctx.stroke();

  // O atom
  ctx.beginPath();
  ctx.arc(cx, cy, 8 * scale, 0, Math.PI * 2);
  ctx.fillStyle = '#ef5350';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.stroke();

  // H atoms
  for (const [hx, hy] of [[h1x, h1y], [h2x, h2y]]) {
    ctx.beginPath();
    ctx.arc(hx, hy, 5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#e0e0e0';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.stroke();
  }

  if (showCharges) {
    ctx.font = `${10 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = HB_CLR;
    ctx.fillText('δ−', cx, cy - 10 * scale);
    ctx.fillStyle = LDF_CLR;
    ctx.fillText('δ+', h1x + (h1x - cx) * 0.4, h1y + (h1y - cy) * 0.4);
    ctx.fillText('δ+', h2x + (h2x - cx) * 0.4, h2y + (h2y - cy) * 0.4);
  }

  return { ox: cx, oy: cy, h1x, h1y, h2x, h2y };
}

/* ================================================================== */
/*  ImfViz                                                            */
/* ================================================================== */
export class ImfViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;
    this.time = 0;
    this.mode = (opts.mode || 'compare').toLowerCase();

    // animation state for boiling-bar chart
    this._barProgress = 0;

    // pre-build molecule positions for each mode
    this._initCompare();
    this._initWater();

    this._animate();
  }

  /* ── public API ─────────────────────────────────── */
  setMode(mode) {
    this.mode = mode.toLowerCase();
    this._barProgress = 0;
    this.time = 0;
  }

  stop() { this.running = false; }

  /* ── initialisation helpers ─────────────────────── */
  _initCompare() {
    const third = this.W / 3;
    const cy = this.H * 0.48;

    // LDF molecules (simple circles representing Ar)
    this.ldfMols = [
      { x: third * 0.3,  y: cy - 30, r: 16, dipolePhase: rand(0, 6.28), dipoleSpeed: rand(0.8, 1.6) },
      { x: third * 0.55, y: cy + 25, r: 16, dipolePhase: rand(0, 6.28), dipoleSpeed: rand(0.8, 1.6) },
      { x: third * 0.8,  y: cy - 10, r: 16, dipolePhase: rand(0, 6.28), dipoleSpeed: rand(0.8, 1.6) },
    ];

    // Dipole-dipole molecules (HCl as ovals)
    this.ddMols = [
      { x: third + third * 0.3,  y: cy - 30, angle: -0.15 },
      { x: third + third * 0.55, y: cy + 25, angle:  0.1  },
      { x: third + third * 0.8,  y: cy - 5,  angle: -0.05 },
    ];

    // H-bonding (water) — positions only; drawn with drawWater()
    this.hbMols = [
      { x: 2 * third + third * 0.3,  y: cy - 25, angle: -Math.PI / 2 },
      { x: 2 * third + third * 0.55, y: cy + 30, angle:  Math.PI / 4  },
      { x: 2 * third + third * 0.8,  y: cy - 5,  angle: -Math.PI / 5  },
    ];
  }

  _initWater() {
    // Positions for 8 water molecules in a loose network
    const cx = this.W / 2, cy = this.H / 2;
    const sp = 70;
    this.waterNet = [
      { x: cx,          y: cy,          a: -Math.PI / 2 },
      { x: cx - sp,     y: cy - sp * 0.6, a: Math.PI / 5 },
      { x: cx + sp,     y: cy - sp * 0.5, a: -Math.PI / 3 },
      { x: cx - sp * 0.5, y: cy + sp * 0.7, a: Math.PI / 6 },
      { x: cx + sp * 0.6, y: cy + sp * 0.8, a: -Math.PI / 4 },
      { x: cx - sp * 1.4, y: cy + 5,        a: Math.PI / 3 },
      { x: cx + sp * 1.4, y: cy + 10,       a: -Math.PI / 6 },
      { x: cx,            y: cy - sp * 1.2,  a: Math.PI / 8 },
    ];

    // Ice hexagonal positions (right half of canvas)
    const ix = this.W * 0.73, iy = this.H * 0.5;
    const hexR = 52;
    this.iceMols = [];
    for (let ring = 0; ring < 6; ring++) {
      const a = ring * Math.PI / 3 - Math.PI / 6;
      this.iceMols.push({ x: ix + hexR * Math.cos(a), y: iy + hexR * Math.sin(a), a: a + Math.PI });
    }
    this.iceMols.push({ x: ix, y: iy, a: -Math.PI / 2 });
  }

  /* ── main loop ──────────────────────────────────── */
  _animate() {
    if (!this.running) return;
    this.time += 0.016;
    this._draw();
    requestAnimationFrame(() => this._animate());
  }

  _draw() {
    const ctx = this.ctx;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    switch (this.mode) {
      case 'compare': this._drawCompare(); break;
      case 'boiling': this._drawBoiling(); break;
      case 'water':   this._drawWaterMode(); break;
      default:        this._drawCompare();
    }
  }

  /* ═══════════════════════════════════════════════════
     MODE: compare
     ═══════════════════════════════════════════════════ */
  _drawCompare() {
    const ctx = this.ctx;
    const t = this.time;
    const third = this.W / 3;

    // Dividers
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(third, 30); ctx.lineTo(third, this.H - 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(third * 2, 30); ctx.lineTo(third * 2, this.H - 20); ctx.stroke();

    /* ── LONDON DISPERSION ── */
    const lx = third / 2;
    drawLabel(ctx, 'London Dispersion', lx, 32, 'bold 15px sans-serif', LDF_CLR);
    drawLabel(ctx, 'Weakest — temporary dipoles', lx, 52, '12px sans-serif', DIM_CLR);
    drawLabel(ctx, 'Ar: −186 °C', lx, this.H - 20, '13px sans-serif', LDF_CLR);

    for (const m of this.ldfMols) {
      const wobbleX = Math.sin(t * 1.2 + m.dipolePhase) * 3;
      const wobbleY = Math.cos(t * 0.9 + m.dipolePhase) * 3;
      const px = m.x + wobbleX;
      const py = m.y + wobbleY;

      // base circle
      ctx.beginPath();
      ctx.arc(px, py, m.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79,195,247,0.18)';
      ctx.fill();
      ctx.strokeStyle = LDF_CLR;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // flickering dipole
      const dipolePower = (Math.sin(t * m.dipoleSpeed * 3 + m.dipolePhase) + 1) / 2;
      if (dipolePower > 0.6) {
        const alpha = (dipolePower - 0.6) / 0.4;
        const dipoleAngle = t * 0.5 + m.dipolePhase;
        const dx = Math.cos(dipoleAngle) * m.r * 0.6;
        const dy = Math.sin(dipoleAngle) * m.r * 0.6;
        ctx.font = `${9 + alpha * 3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = LDF_CLR;
        ctx.fillText('δ+', px + dx, py + dy - 2);
        ctx.fillStyle = '#ff8a65';
        ctx.fillText('δ−', px - dx, py - dy - 2);
        ctx.globalAlpha = 1;
      }
    }

    // induced dipole lines between neighbours when both are active
    for (let i = 0; i < this.ldfMols.length; i++) {
      for (let j = i + 1; j < this.ldfMols.length; j++) {
        const a = this.ldfMols[i], b = this.ldfMols[j];
        const pa = (Math.sin(t * a.dipoleSpeed * 3 + a.dipolePhase) + 1) / 2;
        const pb = (Math.sin(t * b.dipoleSpeed * 3 + b.dipolePhase) + 1) / 2;
        if (pa > 0.65 && pb > 0.65) {
          const alpha = Math.min(pa, pb) - 0.6;
          ctx.save();
          ctx.globalAlpha = alpha * 2;
          drawDashedLine(ctx,
            a.x + Math.sin(t * 1.2 + a.dipolePhase) * 3,
            a.y + Math.cos(t * 0.9 + a.dipolePhase) * 3,
            b.x + Math.sin(t * 1.2 + b.dipolePhase) * 3,
            b.y + Math.cos(t * 0.9 + b.dipolePhase) * 3,
            LDF_CLR, 1);
          ctx.restore();
        }
      }
    }

    /* ── DIPOLE-DIPOLE ── */
    const dx = third + third / 2;
    drawLabel(ctx, 'Dipole–Dipole', dx, 32, 'bold 15px sans-serif', DD_CLR);
    drawLabel(ctx, 'Medium — permanent dipoles attract', dx, 52, '12px sans-serif', DIM_CLR);
    drawLabel(ctx, 'HCl: −85 °C', dx, this.H - 20, '13px sans-serif', DD_CLR);

    const ddDrawn = [];
    for (const m of this.ddMols) {
      const wobble = Math.sin(t * 0.7 + m.angle * 3) * 2;
      const px = m.x + wobble;
      const py = m.y + Math.cos(t * 0.6 + m.angle * 2) * 2;
      const a = m.angle + Math.sin(t * 0.4) * 0.08;
      const hw = 22, hh = 11;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a);

      // oval body
      ctx.beginPath();
      ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(102,187,106,0.15)';
      ctx.fill();
      ctx.strokeStyle = DD_CLR;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // permanent charges
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = LDF_CLR;
      ctx.fillText('δ+', -hw * 0.55, 4);
      ctx.fillStyle = '#ff8a65';
      ctx.fillText('δ−', hw * 0.55, 4);

      ctx.restore();

      // record endpoints for bond lines
      ddDrawn.push({
        plusX: px + Math.cos(a) * (-hw * 0.55),
        plusY: py + Math.sin(a) * (-hw * 0.55),
        minusX: px + Math.cos(a) * (hw * 0.55),
        minusY: py + Math.sin(a) * (hw * 0.55),
      });
    }

    // dashed lines between δ+ of one and δ− of another
    for (let i = 0; i < ddDrawn.length; i++) {
      const j = (i + 1) % ddDrawn.length;
      drawDashedLine(ctx,
        ddDrawn[i].minusX, ddDrawn[i].minusY,
        ddDrawn[j].plusX, ddDrawn[j].plusY,
        DD_CLR, 1.5);
    }

    /* ── HYDROGEN BONDING ── */
    const hx = 2 * third + third / 2;
    drawLabel(ctx, 'Hydrogen Bonding', hx, 32, 'bold 15px sans-serif', HB_CLR);
    drawLabel(ctx, 'Strongest IMF — H bonded to N, O, or F', hx, 52, '12px sans-serif', DIM_CLR);
    drawLabel(ctx, 'H₂O: 100 °C', hx, this.H - 20, '13px sans-serif', HB_CLR);

    const hbDrawn = [];
    for (const m of this.hbMols) {
      const wobble = Math.sin(t * 0.5 + m.angle) * 2;
      const px = m.x + wobble;
      const py = m.y + Math.cos(t * 0.4 + m.angle) * 2;
      const info = drawWater(ctx, px, py, m.angle + Math.sin(t * 0.3) * 0.06, 1, true);
      hbDrawn.push(info);
    }

    // hydrogen bonds: H of mol i → O of mol j
    for (let i = 0; i < hbDrawn.length; i++) {
      const j = (i + 1) % hbDrawn.length;
      // pick the H that is closer to the next O
      for (const [hhx, hhy] of [[hbDrawn[i].h1x, hbDrawn[i].h1y], [hbDrawn[i].h2x, hbDrawn[i].h2y]]) {
        const d = Math.hypot(hhx - hbDrawn[j].ox, hhy - hbDrawn[j].oy);
        if (d < 80) {
          drawDashedLine(ctx, hhx, hhy, hbDrawn[j].ox, hbDrawn[j].oy, HB_CLR, 2.5);
          break;
        }
      }
      // fallback: always draw at least one bond to next molecule
      if (true) {
        const dists = [
          Math.hypot(hbDrawn[i].h1x - hbDrawn[j].ox, hbDrawn[i].h1y - hbDrawn[j].oy),
          Math.hypot(hbDrawn[i].h2x - hbDrawn[j].ox, hbDrawn[i].h2y - hbDrawn[j].oy),
        ];
        const pick = dists[0] < dists[1] ? 0 : 1;
        const hh = pick === 0
          ? [hbDrawn[i].h1x, hbDrawn[i].h1y]
          : [hbDrawn[i].h2x, hbDrawn[i].h2y];
        drawDashedLine(ctx, hh[0], hh[1], hbDrawn[j].ox, hbDrawn[j].oy, HB_CLR, 2.5);
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     MODE: boiling
     ═══════════════════════════════════════════════════ */
  _drawBoiling() {
    const ctx = this.ctx;
    this._barProgress = Math.min(this._barProgress + 0.012, 1);
    const prog = this._barProgress;

    const data = [
      { name: 'He',      bp: -269, type: 'LDF',  color: LDF_CLR },
      { name: 'Ar',      bp: -186, type: 'LDF',  color: LDF_CLR },
      { name: 'HCl',     bp:  -85, type: 'D–D',  color: DD_CLR  },
      { name: 'HF',      bp:  19.5,type: 'H-bond',color: HB_CLR },
      { name: 'C₂H₅OH', bp:   78, type: 'H-bond',color: HB_CLR },
      { name: 'H₂O',    bp:  100, type: 'H-bond',color: HB_CLR },
    ];

    const minBP = -290, maxBP = 120;
    const range = maxBP - minBP;
    const leftM = 100, rightM = 60, topM = 70, botM = 70;
    const plotW = this.W - leftM - rightM;
    const plotH = this.H - topM - botM;
    const barW = plotW / data.length * 0.55;
    const gap  = plotW / data.length;

    // title
    drawLabel(ctx, 'Boiling Points & Dominant IMF', this.W / 2, 30, 'bold 17px sans-serif', TEXT_CLR);

    // axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftM, topM);
    ctx.lineTo(leftM, topM + plotH);
    ctx.lineTo(leftM + plotW, topM + plotH);
    ctx.stroke();

    // zero line
    const zeroY = topM + plotH - ((0 - minBP) / range) * plotH;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(leftM, zeroY); ctx.lineTo(leftM + plotW, zeroY); ctx.stroke();
    ctx.setLineDash([]);
    drawLabel(ctx, '0 °C', leftM - 30, zeroY + 4, '11px sans-serif', DIM_CLR);

    // y-axis tick labels
    for (let temp = -250; temp <= 100; temp += 50) {
      const y = topM + plotH - ((temp - minBP) / range) * plotH;
      ctx.fillStyle = DIM_CLR;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${temp}°`, leftM - 8, y + 3);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath(); ctx.moveTo(leftM, y); ctx.lineTo(leftM + plotW, y); ctx.stroke();
    }

    // bars
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const baseY = topM + plotH;  // bottom of chart
      const targetH = ((d.bp - minBP) / range) * plotH;
      const curH = targetH * this._easeOut(prog);
      const bx = leftM + gap * i + (gap - barW) / 2;

      // bar
      const grad = ctx.createLinearGradient(bx, baseY - curH, bx, baseY);
      grad.addColorStop(0, d.color);
      grad.addColorStop(1, d.color.replace(')', ',0.3)').replace('rgb', 'rgba'));
      ctx.fillStyle = grad;
      ctx.fillRect(bx, baseY - curH, barW, curH);

      // glow at top
      ctx.fillStyle = d.color;
      ctx.fillRect(bx, baseY - curH, barW, 2);

      // molecule name
      drawLabel(ctx, d.name, bx + barW / 2, baseY + 16, 'bold 13px sans-serif', TEXT_CLR);

      // IMF type
      drawLabel(ctx, d.type, bx + barW / 2, baseY + 32, '11px sans-serif', d.color);

      // BP value at top of bar
      if (prog > 0.7) {
        const alpha = (prog - 0.7) / 0.3;
        ctx.globalAlpha = alpha;
        drawLabel(ctx, `${d.bp}°C`, bx + barW / 2, baseY - curH - 8, '11px sans-serif', TEXT_CLR);
        ctx.globalAlpha = 1;
      }
    }

    // legend
    const legY = topM + 5;
    const legItems = [
      { label: 'London Dispersion', color: LDF_CLR },
      { label: 'Dipole–Dipole',     color: DD_CLR },
      { label: 'Hydrogen Bonding',  color: HB_CLR },
    ];
    let lx = this.W - rightM - 10;
    ctx.textAlign = 'right';
    for (const it of legItems.reverse()) {
      ctx.font = '11px sans-serif';
      ctx.fillStyle = it.color;
      const tw = ctx.measureText(it.label).width;
      ctx.fillText(it.label, lx, legY);
      ctx.fillRect(lx - tw - 16, legY - 8, 10, 10);
      lx -= tw + 28;
    }
  }

  _easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* ═══════════════════════════════════════════════════
     MODE: water
     ═══════════════════════════════════════════════════ */
  _drawWaterMode() {
    const ctx = this.ctx;
    const t = this.time;

    drawLabel(ctx, 'Liquid Water — Hydrogen Bond Network', this.W * 0.3, 28, 'bold 16px sans-serif', HB_CLR);
    drawLabel(ctx, 'Ice — Open Hexagonal Structure', this.W * 0.73, 28, 'bold 16px sans-serif', LDF_CLR);

    // divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(this.W / 2, 40); ctx.lineTo(this.W / 2, this.H - 20); ctx.stroke();

    /* ── Liquid side (left) ── */
    const liqDrawn = [];
    for (const m of this.waterNet) {
      const jx = Math.sin(t * 0.8 + m.a * 2) * 6;
      const jy = Math.cos(t * 0.6 + m.a * 3) * 6;
      const info = drawWater(ctx, m.x - this.W * 0.2 + jx, m.y + jy, m.a + Math.sin(t * 0.3 + m.a) * 0.15, 0.9, true);
      liqDrawn.push(info);
    }

    // draw H-bonds for close neighbours
    for (let i = 0; i < liqDrawn.length; i++) {
      for (let j = i + 1; j < liqDrawn.length; j++) {
        // try each H of i to O of j and vice versa
        const pairs = [
          [liqDrawn[i].h1x, liqDrawn[i].h1y, liqDrawn[j].ox, liqDrawn[j].oy],
          [liqDrawn[i].h2x, liqDrawn[i].h2y, liqDrawn[j].ox, liqDrawn[j].oy],
          [liqDrawn[j].h1x, liqDrawn[j].h1y, liqDrawn[i].ox, liqDrawn[i].oy],
          [liqDrawn[j].h2x, liqDrawn[j].h2y, liqDrawn[i].ox, liqDrawn[i].oy],
        ];
        for (const [ax, ay, bx, by] of pairs) {
          const d = Math.hypot(ax - bx, ay - by);
          if (d < 55 && d > 15) {
            const alpha = 1 - (d - 15) / 40;
            ctx.globalAlpha = alpha * 0.7;
            drawDashedLine(ctx, ax, ay, bx, by, HB_CLR, 2);
            ctx.globalAlpha = 1;
            break; // one bond per pair is enough visually
          }
        }
      }
    }

    // tetrahedral annotation on central molecule
    const cm = liqDrawn[0];
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(t * 1.5) * 0.2;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = DIM_CLR;
    // lone pair indicators (approximate)
    const lpAngle1 = this.waterNet[0].a + Math.PI + 0.4;
    const lpAngle2 = this.waterNet[0].a + Math.PI - 0.4;
    const lpR = 18;
    for (const la of [lpAngle1, lpAngle2]) {
      const lx = cm.ox + Math.cos(la) * lpR + Math.sin(t * 0.8 + la) * 3 - this.W * 0.0;
      const ly = cm.oy + Math.sin(la) * lpR + Math.cos(t * 0.6 + la) * 3;
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(206,147,216,0.6)';
      ctx.fill();
    }
    ctx.restore();

    drawLabel(ctx, '2 bonds + 2 lone pairs = tetrahedral', this.W * 0.3, this.H - 40, '12px sans-serif', DIM_CLR);

    /* ── Ice side (right) ── */
    const iceDrawn = [];
    for (const m of this.iceMols) {
      const jitter = Math.sin(t * 0.3 + m.a) * 0.8; // very slight vibration
      const info = drawWater(ctx, m.x + jitter, m.y + Math.cos(t * 0.25 + m.a) * 0.8, m.a, 0.85, false);
      iceDrawn.push(info);
    }

    // ice H-bonds (rigid network)
    for (let i = 0; i < iceDrawn.length; i++) {
      for (let j = i + 1; j < iceDrawn.length; j++) {
        const d = Math.hypot(iceDrawn[i].ox - iceDrawn[j].ox, iceDrawn[i].oy - iceDrawn[j].oy);
        if (d < 75) {
          // find closest H-to-O pair
          const pairs = [
            [iceDrawn[i].h1x, iceDrawn[i].h1y, iceDrawn[j].ox, iceDrawn[j].oy],
            [iceDrawn[i].h2x, iceDrawn[i].h2y, iceDrawn[j].ox, iceDrawn[j].oy],
            [iceDrawn[j].h1x, iceDrawn[j].h1y, iceDrawn[i].ox, iceDrawn[i].oy],
            [iceDrawn[j].h2x, iceDrawn[j].h2y, iceDrawn[i].ox, iceDrawn[i].oy],
          ];
          let best = pairs[0], bestD = 999;
          for (const p of pairs) {
            const dd = Math.hypot(p[0] - p[2], p[1] - p[3]);
            if (dd < bestD) { bestD = dd; best = p; }
          }
          drawDashedLine(ctx, best[0], best[1], best[2], best[3], LDF_CLR, 2);
        }
      }
    }

    // annotation
    const annX = this.W * 0.73, annY = this.H - 55;
    ctx.save();
    ctx.globalAlpha = 0.7 + Math.sin(t * 1.2) * 0.15;
    drawLabel(ctx, 'Ice: open hexagonal structure', annX, annY, '12px sans-serif', LDF_CLR);
    drawLabel(ctx, '→ less dense → floats!', annX, annY + 18, 'bold 13px sans-serif', HB_CLR);
    ctx.restore();
  }
}

registerSim('imfViz', (canvas, opts) => new ImfViz(canvas, opts));
