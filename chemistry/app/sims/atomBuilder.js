import { registerSim } from './registry.js';

const ELEMENTS = ['?','H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg'];

export class AtomBuilder {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.cx = this.W / 2;
    this.cy = this.H / 2;
    this.angle = 0;
    this.running = true;
    this.p = opts.protons || 0;
    this.n = opts.neutrons || 0;
    this.e = opts.electrons || 0;
    this.onUpdate = opts.onUpdate || null;
    this._animate();
  }

  getValues() {
    return { p: this.p, n: this.n, e: this.e };
  }

  setValues(p, n, e) {
    this.p = p;
    this.n = n;
    this.e = e;
  }

  getInfo() {
    const { p, n, e } = this;
    const element = ELEMENTS[p] || '?';
    const mass = p + n;
    const charge = p - e;
    const chargeStr = charge === 0 ? 'neutral' : (charge > 0 ? `+${charge}` : `${charge}`);
    let info = `<strong style="color:var(--accent)">${element}</strong>`;
    info += ` | Z=${p} | A=${mass} | charge: ${chargeStr}`;
    if (p > 0 && p === e) info += ' <span style="color:var(--green)">✓ neutral atom</span>';
    if (p > 0 && p !== e) info += ` <span style="color:var(--orange)">${p > e ? 'cation (+)' : 'anion (−)'}</span>`;
    return info;
  }

  _draw() {
    const { ctx, cx, cy, W, H, p, n, e } = this;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    const nucRadius = Math.max(15, Math.sqrt(p + n) * 12);
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucRadius + 20);
    grd.addColorStop(0, 'rgba(239,83,80,0.2)');
    grd.addColorStop(1, 'rgba(239,83,80,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, nucRadius + 20, 0, Math.PI * 2);
    ctx.fill();

    const total = p + n;
    for (let i = 0; i < total; i++) {
      const a = (i / total) * Math.PI * 2 + (i % 2) * 0.5;
      const r = (i < 4) ? 0 : nucRadius * 0.6 * Math.sqrt(i / total);
      const px = cx + Math.cos(a) * r + (Math.random()-0.5)*3;
      const py = cy + Math.sin(a) * r + (Math.random()-0.5)*3;
      const isProton = i < p;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = isProton ? '#ef5350' : '#777';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.stroke();
    }

    if (e > 0) {
      const shells = [];
      if (e <= 2) shells.push(e);
      else if (e <= 10) { shells.push(2); shells.push(e - 2); }
      else { shells.push(2); shells.push(8); shells.push(e - 10); }

      const orbitRadii = [80, 130, 175];
      shells.forEach((count, si) => {
        const r = orbitRadii[si];
        ctx.strokeStyle = 'rgba(79,195,247,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        for (let j = 0; j < count; j++) {
          const ea = this.angle * (1 + si * 0.3) + (j / count) * Math.PI * 2;
          const ex = cx + Math.cos(ea) * r;
          const ey = cy + Math.sin(ea) * r;
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#4fc3f7';
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(79,195,247,0.4)';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`n=${si+1} (${count}e⁻)`, cx + r + 20, cy - 10);
      });
    }

    this.angle += 0.01;
  }

  _animate() {
    if (!this.running) return;
    this._draw();
    requestAnimationFrame(() => this._animate());
  }

  stop() { this.running = false; }
}

registerSim('atomBuilder', (canvas, opts) => new AtomBuilder(canvas, opts));
