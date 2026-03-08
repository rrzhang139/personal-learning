import { registerSim } from './registry.js';

const CYAN = '#00d4ff';
const GREEN = '#81c784';
const ORANGE = '#ff9800';
const BG = '#0a0a1a';

export class ReactivityViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.running = true;
    this.time = 0;

    // Animation phase: 'idle' | 'transferring' | 'ionized' | 'bonding' | 'done'
    this.phase = 'idle';
    this.phaseTime = 0;
    this.autoReactTimer = 3;

    // Atom positions
    this.naCenterX = this.W * 0.25;
    this.clCenterX = this.W * 0.75;
    this.centerY = this.H * 0.45;

    // Shell radii
    this.shellRadii = [22, 50, 85];

    // Transferring electron position (interpolated during transfer)
    this.transferElectron = { x: 0, y: 0, progress: 0 };

    // Ion drift offset (for bonding phase)
    this.naDrift = 0;
    this.clDrift = 0;

    // Na shrink / Cl grow factor during ionization
    this.ionScale = { na: 1, cl: 1 };

    // Sparkle particles
    this.sparkles = [];

    // Valence electron angles for Na (1 electron on shell 3)
    this.naValenceAngle = 0;
    // Valence electron angles for Cl (7 electrons on shell 3, gap at index 7)
    this.clValenceAngles = [];
    for (let i = 0; i < 7; i++) {
      this.clValenceAngles.push((i / 8) * Math.PI * 2);
    }
    this.clGapAngle = (7 / 8) * Math.PI * 2; // the empty slot

    this._animate();
  }

  /* ── Public API ── */

  react() {
    if (this.phase !== 'idle') return;
    this.phase = 'transferring';
    this.phaseTime = 0;
    this.transferElectron.progress = 0;
  }

  reset() {
    this.phase = 'idle';
    this.phaseTime = 0;
    this.autoReactTimer = 3;
    this.transferElectron.progress = 0;
    this.naDrift = 0;
    this.clDrift = 0;
    this.ionScale = { na: 1, cl: 1 };
    this.sparkles = [];
  }

  stop() {
    this.running = false;
  }

  /* ── Internal ── */

  _update(dt) {
    this.time += dt;

    // Auto-react after 3 seconds of idle
    if (this.phase === 'idle') {
      this.autoReactTimer -= dt;
      if (this.autoReactTimer <= 0) this.react();
    }

    // Wobble the Na valence electron in idle
    this.naValenceAngle += dt * 1.2;

    // Rotate Cl valence electrons slowly
    for (let i = 0; i < this.clValenceAngles.length; i++) {
      this.clValenceAngles[i] += dt * 0.4;
    }
    this.clGapAngle += dt * 0.4;

    this.phaseTime += dt;

    if (this.phase === 'transferring') {
      // Transfer takes ~2 seconds
      this.transferElectron.progress = Math.min(1, this.phaseTime / 2);
      if (this.transferElectron.progress >= 1) {
        this.phase = 'ionized';
        this.phaseTime = 0;
      }
    }

    if (this.phase === 'ionized') {
      // Shrink Na, grow Cl over 1 second
      const t = Math.min(1, this.phaseTime / 1);
      this.ionScale.na = 1 - t * 0.2;   // shrink to 0.8
      this.ionScale.cl = 1 + t * 0.08;  // grow to 1.08
      if (this.phaseTime >= 1.2) {
        this.phase = 'bonding';
        this.phaseTime = 0;
      }
    }

    if (this.phase === 'bonding') {
      // Drift toward each other over 2 seconds
      const t = Math.min(1, this.phaseTime / 2);
      const ease = t * t * (3 - 2 * t); // smoothstep
      const driftDist = (this.clCenterX - this.naCenterX) * 0.28;
      this.naDrift = ease * driftDist;
      this.clDrift = -ease * driftDist;
      if (this.phaseTime >= 2.2) {
        this.phase = 'done';
        this.phaseTime = 0;
        this._spawnSparkles();
      }
    }

    if (this.phase === 'done') {
      // Update sparkles
      for (const s of this.sparkles) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
      }
      this.sparkles = this.sparkles.filter(s => s.life > 0);
    }
  }

  _spawnSparkles() {
    const cx = (this.naCenterX + this.naDrift + this.clCenterX + this.clDrift) / 2;
    const cy = this.centerY;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;
      this.sparkles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1 + Math.random() * 1.5,
        maxLife: 1 + Math.random() * 1.5,
        size: 1 + Math.random() * 2.5,
        color: [CYAN, GREEN, ORANGE, '#fff'][Math.floor(Math.random() * 4)]
      });
    }
  }

  _draw() {
    const ctx = this.ctx;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.W, this.H);

    // Dividing line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(this.W / 2, 20);
    ctx.lineTo(this.W / 2, this.H - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Why Alkali Metals & Halogens Are the Most Reactive', this.W / 2, 20);

    const naX = this.naCenterX + this.naDrift;
    const clX = this.clCenterX + this.clDrift;
    const cy = this.centerY;

    const reacted = this.phase === 'ionized' || this.phase === 'bonding' || this.phase === 'done';
    const transferring = this.phase === 'transferring';

    // ── Draw Na atom ──
    this._drawAtom(ctx, naX, cy, 'Na', this.ionScale.na, reacted, transferring);

    // ── Draw Cl atom ──
    this._drawAtom(ctx, clX, cy, 'Cl', this.ionScale.cl, reacted, transferring);

    // ── Transferring electron ──
    if (transferring) {
      const p = this.transferElectron.progress;
      const ease = p * p * (3 - 2 * p);
      // Start position: Na outer shell at the gap angle (rightward)
      const startX = naX + Math.cos(0) * this.shellRadii[2];
      const startY = cy + Math.sin(0) * this.shellRadii[2];
      // End position: Cl gap
      const endX = clX + Math.cos(this.clGapAngle) * this.shellRadii[2];
      const endY = cy + Math.sin(this.clGapAngle) * this.shellRadii[2];
      // Arc path — go up in the middle
      const midX = (startX + endX) / 2;
      const midY = cy - 60;
      const t = ease;
      // Quadratic bezier
      const ex = (1-t)*(1-t)*startX + 2*(1-t)*t*midX + t*t*endX;
      const ey = (1-t)*(1-t)*startY + 2*(1-t)*t*midY + t*t*endY;
      this.transferElectron.x = ex;
      this.transferElectron.y = ey;

      // Trail
      for (let i = 0; i < 5; i++) {
        const tt = Math.max(0, t - i * 0.04);
        const tx = (1-tt)*(1-tt)*startX + 2*(1-tt)*tt*midX + tt*tt*endX;
        const ty = (1-tt)*(1-tt)*startY + 2*(1-tt)*tt*midY + tt*tt*endY;
        ctx.beginPath();
        ctx.arc(tx, ty, 4 - i * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${0.5 - i * 0.1})`;
        ctx.fill();
      }

      // Main electron
      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.fillStyle = CYAN;
      ctx.fill();
      ctx.shadowColor = CYAN;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // ── Labels ──
    this._drawLabels(ctx, naX, clX, cy, reacted);

    // ── Sparkles ──
    for (const s of this.sparkles) {
      const alpha = Math.max(0, s.life / s.maxLife);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── "NaCl — Table Salt!" label ──
    if (this.phase === 'done') {
      const alpha = Math.min(1, this.phaseTime / 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NaCl — Table Salt!', this.W / 2, this.H - 30);
      // Subtle glow
      ctx.shadowColor = CYAN;
      ctx.shadowBlur = 15;
      ctx.fillText('NaCl — Table Salt!', this.W / 2, this.H - 30);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  _drawAtom(ctx, cx, cy, element, scale, reacted, transferring) {
    const isNa = element === 'Na';
    const innerElectrons = 2;
    const middleElectrons = 8;

    // Shell colors
    const shellColors = [
      'rgba(255,255,255,0.1)',
      'rgba(255,255,255,0.08)',
      'rgba(255,255,255,0.06)'
    ];

    // Draw shells
    for (let s = 0; s < 3; s++) {
      const r = this.shellRadii[s] * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = shellColors[s];
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Nucleus
    const nucleusR = 10 * scale;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucleusR);
    if (isNa) {
      grad.addColorStop(0, reacted ? ORANGE : '#ff9800cc');
      grad.addColorStop(1, reacted ? '#ff6600' : '#cc660088');
    } else {
      grad.addColorStop(0, reacted ? GREEN : '#81c784cc');
      grad.addColorStop(1, reacted ? '#388e3c' : '#4caf5088');
    }
    ctx.beginPath();
    ctx.arc(cx, cy, nucleusR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Proton count label in nucleus
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isNa ? '11+' : '17+', cx, cy);
    ctx.textBaseline = 'alphabetic';

    // Ion glow
    if (reacted) {
      ctx.beginPath();
      ctx.arc(cx, cy, this.shellRadii[2] * scale + 10, 0, Math.PI * 2);
      ctx.fillStyle = isNa
        ? 'rgba(255,152,0,0.06)'
        : 'rgba(129,199,132,0.06)';
      ctx.fill();
      ctx.strokeStyle = isNa
        ? 'rgba(255,152,0,0.3)'
        : 'rgba(129,199,132,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw inner shell electrons (2)
    const eColor = CYAN;
    for (let i = 0; i < innerElectrons; i++) {
      const angle = (i / innerElectrons) * Math.PI * 2 + this.time * 0.5;
      const ex = cx + Math.cos(angle) * this.shellRadii[0] * scale;
      const ey = cy + Math.sin(angle) * this.shellRadii[0] * scale;
      this._drawElectron(ctx, ex, ey, eColor, 3);
    }

    // Draw middle shell electrons (8)
    for (let i = 0; i < middleElectrons; i++) {
      const angle = (i / middleElectrons) * Math.PI * 2 + this.time * 0.3;
      const ex = cx + Math.cos(angle) * this.shellRadii[1] * scale;
      const ey = cy + Math.sin(angle) * this.shellRadii[1] * scale;
      this._drawElectron(ctx, ex, ey, eColor, 3);
    }

    // Draw outer shell electrons
    if (isNa) {
      if (!reacted && !transferring) {
        // 1 valence electron — wobbling and pulsing
        const wobble = Math.sin(this.time * 3) * 8;
        const pulse = 3.5 + Math.sin(this.time * 5) * 1.5;
        const angle = this.naValenceAngle;
        const r = this.shellRadii[2] * scale + wobble;
        const ex = cx + Math.cos(angle) * r;
        const ey = cy + Math.sin(angle) * r;
        this._drawElectron(ctx, ex, ey, CYAN, pulse, true);
      }
      // If reacted, no outer electron (it was donated)
    } else {
      // Cl: 7 valence electrons + 1 gap
      const outerCount = reacted ? 8 : 7; // after reaction, 8 electrons
      for (let i = 0; i < outerCount; i++) {
        let angle;
        if (reacted) {
          angle = (i / 8) * Math.PI * 2 + this.time * 0.4;
        } else {
          angle = this.clValenceAngles[i];
        }
        const ex = cx + Math.cos(angle) * this.shellRadii[2] * scale;
        const ey = cy + Math.sin(angle) * this.shellRadii[2] * scale;
        this._drawElectron(ctx, ex, ey, eColor, 3);
      }

      // Draw gap (dashed circle) when not reacted and not currently filling
      if (!reacted) {
        const gapAngle = this.clGapAngle;
        const gx = cx + Math.cos(gapAngle) * this.shellRadii[2] * scale;
        const gy = cy + Math.sin(gapAngle) * this.shellRadii[2] * scale;
        ctx.beginPath();
        ctx.arc(gx, gy, 5, 0, Math.PI * 2);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  _drawElectron(ctx, x, y, color, radius, glow = false) {
    if (glow) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = color.replace(')', ',0.15)').replace('rgb', 'rgba');
      // Handle hex color for glow
      ctx.fillStyle = `rgba(0,212,255,0.15)`;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  _drawLabels(ctx, naX, clX, cy, reacted) {
    ctx.textAlign = 'center';

    // Na label
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = ORANGE;
    ctx.fillText(reacted ? 'Na⁺' : 'Sodium (Na)', naX, cy + this.shellRadii[2] + 30);

    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    if (reacted) {
      ctx.fillText('Lost 1 electron → positive ion', naX, cy + this.shellRadii[2] + 48);
    } else {
      ctx.fillText('1 valence electron — wants to LOSE it', naX, cy + this.shellRadii[2] + 48);
    }

    // Z_eff label for Na
    if (!reacted) {
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(255,152,0,0.8)';
      const wobble = Math.sin(this.time * 3) * 8;
      const angle = this.naValenceAngle;
      const r = this.shellRadii[2] + wobble;
      const labelX = naX + Math.cos(angle) * (r + 16);
      const labelY = cy + Math.sin(angle) * (r + 16);
      ctx.fillText('Z_eff ≈ +1', labelX, labelY);
    }

    // Cl label
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = GREEN;
    ctx.fillText(reacted ? 'Cl⁻' : 'Chlorine (Cl)', clX, cy + this.shellRadii[2] + 30);

    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    if (reacted) {
      ctx.fillText('Gained 1 electron → negative ion', clX, cy + this.shellRadii[2] + 48);
    } else {
      ctx.fillText('7 valence electrons — wants to GAIN 1', clX, cy + this.shellRadii[2] + 48);
    }

    // Z_eff label for Cl
    if (!reacted) {
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(129,199,132,0.8)';
      ctx.fillText('Z_eff ≈ +7', clX, cy - this.shellRadii[2] - 16);
    }

    // Ionic bond label during bonding/done
    if (this.phase === 'bonding' || this.phase === 'done') {
      const midX = (naX + clX) / 2;
      const alpha = this.phase === 'bonding'
        ? Math.min(1, this.phaseTime / 1)
        : 1;
      ctx.globalAlpha = alpha;
      ctx.font = '12px monospace';
      ctx.fillStyle = CYAN;
      ctx.fillText('← ionic bond →', midX, cy - 10);
      ctx.globalAlpha = 1;
    }

    // Charge labels on ions
    if (reacted) {
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = ORANGE;
      ctx.fillText('+', naX + this.shellRadii[2] * this.ionScale.na + 14, cy - 6);
      ctx.fillStyle = GREEN;
      ctx.fillText('−', clX - this.shellRadii[2] * this.ionScale.cl - 14, cy - 6);
    }
  }

  _animate(prevTime) {
    if (!this.running) return;
    const now = performance.now() / 1000;
    const dt = prevTime ? Math.min(now - prevTime, 0.05) : 0.016;
    this._update(dt);
    this._draw();
    requestAnimationFrame(() => this._animate(now));
  }
}

registerSim('reactivityViz', (canvas, opts) => new ReactivityViz(canvas, opts));
