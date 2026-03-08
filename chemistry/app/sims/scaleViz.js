import { registerSim } from './registry.js';

export function drawScaleViz(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(200, 125, 150, 100, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(200, 125, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ef5350';
  ctx.fill();

  ctx.fillStyle = '#888';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('If the atom = a stadium...', 200, 20);
  ctx.fillStyle = '#ef5350';
  ctx.fillText('nucleus = a marble', 200, 245);

  ctx.strokeStyle = '#666';
  ctx.setLineDash([3,3]);
  ctx.beginPath();
  ctx.moveTo(200, 130);
  ctx.lineTo(200, 230);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#00d4ff';
  ctx.font = 'bold 14px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('Actual sizes:', 420, 40);

  ctx.fillStyle = '#e0e0e0';
  ctx.font = '13px system-ui';
  const facts = [
    'Atom diameter: ~1 × 10⁻¹⁰ m',
    'Nucleus diameter: ~1 × 10⁻¹⁵ m',
    '',
    'The nucleus is 100,000× smaller',
    'than the atom!',
    '',
    '99.97% of the atom\'s mass',
    'is in the tiny nucleus.',
  ];
  facts.forEach((line, i) => {
    ctx.fillText(line, 420, 70 + i * 22);
  });
}

registerSim('scaleViz', (canvas) => { drawScaleViz(canvas); return { stop() {} }; });
