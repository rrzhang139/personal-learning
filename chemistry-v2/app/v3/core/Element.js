/**
 * Element lookup table. Pure data — no rendering.
 *
 * Usage:
 *   await Element.load();             // call once at startup
 *   const O = Element.get('O');       // lookup by symbol
 *   const Fe = Element.get(26);       // lookup by Z
 */

let _elements = [];
let _bySymbol = {};
let _byZ = {};

export class Element {
  constructor(data) {
    this.Z = data.Z;
    this.symbol = data.symbol;
    this.name = data.name;
    this.group = data.group;
    this.period = data.period;
    this.EN = data.EN;
    this.valenceElectrons = data.VE;
    this.mass = data.mass;
    this.color = data.color;
    this.radius = data.radius;
  }

  /** The max electrons this atom "wants" (2 for H/He, 8 for most) */
  get targetElectrons() {
    return this.period === 1 ? 2 : 8;
  }

  /**
   * Load element data from JSON. Call once at app start.
   */
  static async load(path = '../data/elements.json') {
    if (_elements.length) return; // already loaded
    const res = await fetch(path);
    const data = await res.json();
    _elements = data.map(d => new Element(d));
    for (const el of _elements) {
      _bySymbol[el.symbol] = el;
      _byZ[el.Z] = el;
    }
  }

  /**
   * Get an Element by symbol ('O') or atomic number (8).
   * @param {string|number} key
   * @returns {Element}
   */
  static get(key) {
    if (typeof key === 'number') return _byZ[key];
    return _bySymbol[key];
  }

  /** All loaded elements */
  static all() { return [..._elements]; }
}
