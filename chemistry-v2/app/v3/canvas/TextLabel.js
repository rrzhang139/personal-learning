/**
 * Canvas-rendered text label.
 */
import { Renderable } from './Renderable.js';

export class TextLabel extends Renderable {
  constructor({ text = '', x = 0, y = 0, font = '14px monospace', color = '#fff', align = 'center', maxWidth = 0 } = {}) {
    super({ x, y });
    this.text = text;
    this.font = font;
    this.color = color;
    this.align = align;
    this.maxWidth = maxWidth;
  }

  render(ctx) {
    if (!this.text) return;
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.textAlign = this.align;
    ctx.textBaseline = 'middle';

    if (this.maxWidth > 0) {
      this._drawWrapped(ctx);
    } else {
      ctx.fillText(this.text, this.x, this.y);
    }
  }

  _drawWrapped(ctx) {
    const words = this.text.split(' ');
    let line = '';
    let y = this.y;
    const lineH = parseInt(this.font) * 1.4;

    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > this.maxWidth && line) {
        ctx.fillText(line.trim(), this.x, y);
        line = word + ' ';
        y += lineH;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), this.x, y);
  }

  hitTest() { return false; } // labels are not interactive
}
