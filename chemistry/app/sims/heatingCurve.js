import { registerSim } from './registry.js';

export function drawHeatingCurve(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pad = { top: 40, right: 30, bottom: 50, left: 70 };
  const gW = W - pad.left - pad.right;
  const gH = H - pad.top - pad.bottom;

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, H - pad.bottom);
  ctx.lineTo(W - pad.right, H - pad.bottom);
  ctx.stroke();

  ctx.fillStyle = '#888';
  ctx.font = '13px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Heat Added →', W/2, H - 10);
  ctx.save();
  ctx.translate(18, H/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillText('Temperature (°C)', 0, 0);
  ctx.restore();

  const segments = [
    [0, 15, -20, 0, 'Ice\nwarming', '#4fc3f7'],
    [15, 35, 0, 0, 'MELTING', '#00bcd4'],
    [35, 55, 0, 100, 'Water\nwarming', '#81c784'],
    [55, 80, 100, 100, 'BOILING', '#ff9800'],
    [80, 100, 100, 130, 'Steam\nwarming', '#ef5350'],
  ];

  const tempToY = (t) => pad.top + gH - ((t + 30) / 170) * gH;
  const pctToX = (p) => pad.left + (p / 100) * gW;

  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  [0, 100].forEach(t => {
    const y = tempToY(t);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.textAlign = 'right';
    ctx.fillText(`${t}°C`, pad.left - 8, y + 4);
  });
  ctx.setLineDash([]);

  segments.forEach(([x0, x1, t0, t1, label, color]) => {
    const px0 = pctToX(x0), px1 = pctToX(x1);
    const py0 = tempToY(t0), py1 = tempToY(t1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px1, py1); ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    const midX = (px0 + px1) / 2;
    const midY = (py0 + py1) / 2;
    const offset = (t0 === t1) ? -20 : 0;
    label.split('\n').forEach((line, i) => {
      ctx.fillText(line, midX, midY + offset + i * 14);
    });
  });

  ctx.fillStyle = '#00bcd4';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'center';
  const annX = pctToX(25), annY = tempToY(0) + 50;
  ctx.fillText('← Temperature FLAT here!', annX, annY);
  ctx.fillText('Energy breaks bonds,', annX, annY + 16);
  ctx.fillText('not speed.', annX, annY + 32);
}

registerSim('heatingCurve', (canvas) => { drawHeatingCurve(canvas); return { stop() {} }; });
