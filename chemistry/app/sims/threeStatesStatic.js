import { registerSim } from './registry.js';

export function drawThreeStates(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const boxW = 220, boxH = 240, gap = 30;
  const startX = (W - 3 * boxW - 2 * gap) / 2;

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  const states = [
    { name: 'SOLID', color: '#4fc3f7', desc: 'Locked in place' },
    { name: 'LIQUID', color: '#81c784', desc: 'Slide around' },
    { name: 'GAS', color: '#ef5350', desc: 'Fly freely' },
  ];

  states.forEach((s, i) => {
    const x = startX + i * (boxW + gap);
    const y = 10;

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, boxW, boxH);

    ctx.fillStyle = s.color;
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(s.name, x + boxW/2, y + boxH + 25);

    ctx.fillStyle = '#888';
    ctx.font = '12px system-ui';
    ctx.fillText(s.desc, x + boxW/2, y + boxH + 42);

    const particles = [];
    if (i === 0) {
      for (let r = 0; r < 5; r++)
        for (let c = 0; c < 6; c++)
          particles.push({ x: x + 30 + c * 30 + (Math.random()-0.5)*3,
                           y: y + 30 + r * 38 + (Math.random()-0.5)*3 });
    } else if (i === 1) {
      for (let k = 0; k < 30; k++)
        particles.push({ x: x + 15 + Math.random() * (boxW - 30),
                         y: y + boxH * 0.35 + Math.random() * (boxH * 0.6) });
    } else {
      for (let k = 0; k < 18; k++)
        particles.push({ x: x + 15 + Math.random() * (boxW - 30),
                         y: y + 15 + Math.random() * (boxH - 30) });
    }

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.stroke();
    });

    if (i === 0) {
      ctx.strokeStyle = 'rgba(79,195,247,0.15)';
      ctx.lineWidth = 1;
      particles.forEach((p1, idx) => {
        particles.forEach((p2, jdx) => {
          if (jdx > idx) {
            const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (d < 42) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
      });
    }

    if (i === 2) {
      particles.forEach(p => {
        const dx = (Math.random() - 0.5) * 20;
        const dy = (Math.random() - 0.5) * 20;
        ctx.strokeStyle = 'rgba(239,83,80,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + dx, p.y + dy);
        ctx.stroke();
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(p.x + dx, p.y + dy);
        ctx.lineTo(p.x + dx - 5*Math.cos(angle-0.4), p.y + dy - 5*Math.sin(angle-0.4));
        ctx.moveTo(p.x + dx, p.y + dy);
        ctx.lineTo(p.x + dx - 5*Math.cos(angle+0.4), p.y + dy - 5*Math.sin(angle+0.4));
        ctx.stroke();
      });
    }
  });

  ctx.fillStyle = '#666';
  ctx.font = '24px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('→', startX + boxW + gap/2, 130);
  ctx.fillText('→', startX + 2*boxW + gap + gap/2, 130);
  ctx.font = '11px system-ui';
  ctx.fillText('+heat', startX + boxW + gap/2, 150);
  ctx.fillText('+heat', startX + 2*boxW + gap + gap/2, 150);
}

registerSim('threeStatesStatic', (canvas) => { drawThreeStates(canvas); return { stop() {} }; });
