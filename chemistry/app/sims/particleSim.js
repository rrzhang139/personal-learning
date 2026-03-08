import { registerSim } from './registry.js';

const MELTING = 33, BOILING = 66;

export class ParticleSim {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.numParticles = opts.numParticles || 35;
    this.temperature = opts.temperature || 15;
    this.particles = [];
    this.running = true;
    this._initParticles();
    this._animate();
  }

  get state() {
    if (this.temperature < MELTING) return 'SOLID';
    if (this.temperature < BOILING) return 'LIQUID';
    return 'GAS';
  }

  _initParticles() {
    this.particles = [];
    const cols = 7, rows = 5;
    const sx = this.W / 2 - cols * 16, sy = this.H / 2 - rows * 16 + 40;
    for (let i = 0; i < this.numParticles; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      this.particles.push({
        x: sx + c * 32 + 16, y: sy + r * 32 + 16,
        homeX: sx + c * 32 + 16, homeY: sy + r * 32 + 16,
        vx: 0, vy: 0, radius: 7
      });
    }
  }

  _update() {
    const t = this.temperature / 100;
    const state = this.state;
    for (const p of this.particles) {
      if (state === 'SOLID') {
        const j = t * 10;
        p.x = p.homeX + (Math.random() - 0.5) * j;
        p.y = p.homeY + (Math.random() - 0.5) * j;
      } else if (state === 'LIQUID') {
        p.vx += (Math.random() - 0.5) * t * 3;
        p.vy += (Math.random() - 0.5) * t * 3 + 0.12;
        p.vx *= 0.92; p.vy *= 0.92;
        p.x += p.vx; p.y += p.vy;
        if (p.y > this.H - 15) { p.y = this.H - 15; p.vy *= -0.5; }
        if (p.y < this.H * 0.3) p.vy += 0.3;
        if (p.x < 15) { p.x = 15; p.vx *= -0.8; }
        if (p.x > this.W - 15) { p.x = this.W - 15; p.vx *= -0.8; }
      } else {
        p.vx += (Math.random() - 0.5) * t * 5;
        p.vy += (Math.random() - 0.5) * t * 5;
        p.vx *= 0.95; p.vy *= 0.95;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 12) { p.x = 12; p.vx = Math.abs(p.vx); }
        if (p.x > this.W - 12) { p.x = this.W - 12; p.vx = -Math.abs(p.vx); }
        if (p.y < 12) { p.y = 12; p.vy = Math.abs(p.vy); }
        if (p.y > this.H - 12) { p.y = this.H - 12; p.vy = -Math.abs(p.vy); }
      }
    }
  }

  _draw() {
    const ctx = this.ctx;
    const t = this.temperature;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, this.W, this.H);

    if (this.state === 'SOLID') {
      ctx.strokeStyle = 'rgba(79,195,247,0.12)';
      ctx.lineWidth = 1;
      for (let i = 0; i < this.particles.length; i++)
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          if (Math.sqrt(dx*dx + dy*dy) < 40) {
            ctx.beginPath();
            ctx.moveTo(this.particles[i].x, this.particles[i].y);
            ctx.lineTo(this.particles[j].x, this.particles[j].y);
            ctx.stroke();
          }
        }
    }

    for (const p of this.particles) {
      let r, g, b;
      if (t < 50) {
        const f = t / 50;
        r = 70 + f * 50; g = 150 + f * 80; b = 255 - f * 100;
      } else {
        const f = (t - 50) / 50;
        r = 120 + f * 135; g = 230 - f * 150; b = 155 - f * 120;
      }
      if (t > 50) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${t/400})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.stroke();
    }
  }

  _animate() {
    if (!this.running) return;
    this._update();
    this._draw();
    requestAnimationFrame(() => this._animate());
  }

  stop() { this.running = false; }
}

registerSim('particleSim', (canvas, opts) => new ParticleSim(canvas, opts));
