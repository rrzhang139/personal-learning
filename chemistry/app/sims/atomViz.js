import { registerSim } from './registry.js';

export class AtomViz {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.cx = this.W / 2;
    this.cy = this.H / 2;
    this.angle = 0;
    this.running = true;
    this._animate();
  }

  _draw() {
    const { ctx, cx, cy, W, H } = this;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    const orbits = [100, 160, 220];
    orbits.forEach(r => {
      ctx.strokeStyle = 'rgba(79,195,247,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.4, 0.3, 0, Math.PI * 2);
      ctx.stroke();
    });

    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
    grd.addColorStop(0, 'rgba(239,83,80,0.3)');
    grd.addColorStop(1, 'rgba(239,83,80,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fill();

    const nucPositions = [
      [-8,-8],[8,-8],[0,8],[-12,4],[12,4],[0,-12],
      [-4, 4],[4,-4],[8,8],[-8,8],[4,12],[-4,-12]
    ];
    nucPositions.forEach((pos, i) => {
      const isProton = i < 6;
      ctx.beginPath();
      ctx.arc(cx + pos[0] * 1.5, cy + pos[1] * 1.5, 10, 0, Math.PI * 2);
      ctx.fillStyle = isProton ? '#ef5350' : '#888';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(isProton ? 'p+' : 'n', cx + pos[0]*1.5, cy + pos[1]*1.5 + 3);
    });

    const electrons = [
      { orbit: 0, phase: 0 }, { orbit: 0, phase: Math.PI },
      { orbit: 1, phase: 0.5 }, { orbit: 1, phase: 2 }, { orbit: 1, phase: 3.8 },
      { orbit: 2, phase: 1 },
    ];
    electrons.forEach(e => {
      const r = orbits[e.orbit];
      const a = this.angle + e.phase;
      const ex = cx + Math.cos(a) * r;
      const ey = cy + Math.sin(a) * r * 0.4;
      ctx.beginPath();
      ctx.arc(ex, ey, 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79,195,247,0.2)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex, ey, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#4fc3f7';
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('e-', ex, ey + 2.5);
    });

    ctx.fillStyle = '#ef5350';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Nucleus', cx, cy + 40);
    ctx.fillStyle = '#666';
    ctx.font = '11px system-ui';
    ctx.fillText('(protons + neutrons)', cx, cy + 55);
    ctx.fillStyle = '#4fc3f7';
    ctx.fillText('electrons', cx + 180, cy - 80);

    this.angle += 0.015;
  }

  _animate() {
    if (!this.running) return;
    this._draw();
    requestAnimationFrame(() => this._animate());
  }

  stop() { this.running = false; }
}

registerSim('atomViz', (canvas) => new AtomViz(canvas));
