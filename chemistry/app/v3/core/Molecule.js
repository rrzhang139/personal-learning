/**
 * Molecule = collection of Atoms + Bonds.
 * Provides factory methods and layout helpers.
 */
import { Element } from './Element.js';
import { Atom } from './Atom.js';
import { Bond } from './Bond.js';

export class Molecule {
  /**
   * @param {Atom[]} atoms
   * @param {Bond[]} bonds
   */
  constructor(atoms = [], bonds = []) {
    this.atoms = atoms;
    this.bonds = bonds;
  }

  /** Add an atom. */
  addAtom(element, x, y) {
    const atom = new Atom(element, x, y);
    this.atoms.push(atom);
    return atom;
  }

  /** Add a bond between two atoms. */
  addBond(atomA, atomB, order = 1) {
    const bond = new Bond(atomA, atomB, order);
    this.bonds.push(bond);
    return bond;
  }

  /** All renderables (bonds first, then atoms on top). */
  get renderables() {
    return [...this.bonds, ...this.atoms];
  }

  /** Reassign electron states on all atoms (call after building). */
  assignElectrons() {
    for (const atom of this.atoms) {
      atom.assignElectronStates();
    }
  }

  /**
   * Spring physics: when one atom is dragged, pull connected atoms toward it.
   * Call each frame.
   * @param {Atom|null} draggedAtom — the atom being dragged (skip it)
   * @param {number} strength — spring constant (0.02 = gentle)
   */
  applySpringPhysics(draggedAtom = null, strength = 0.03) {
    for (const bond of this.bonds) {
      const a = bond.atomA;
      const b = bond.atomB;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const targetDist = (a.r + b.r) + 30; // ideal bond length

      if (dist < 1) continue;
      const force = (dist - targetDist) * strength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (a !== draggedAtom) { a.x += fx; a.y += fy; }
      if (b !== draggedAtom) { b.x -= fx; b.y -= fy; }
    }
  }

  /**
   * Factory: create common molecules by formula.
   * Returns positioned molecule centered at (cx, cy).
   */
  static create(formula, cx = 450, cy = 250) {
    let mol;
    switch (formula) {
      case 'H2': mol = Molecule._H2(cx, cy); break;
      case 'O2': mol = Molecule._O2(cx, cy); break;
      case 'N2': mol = Molecule._N2(cx, cy); break;
      case 'H2O': mol = Molecule._H2O(cx, cy); break;
      case 'CO2': mol = Molecule._CO2(cx, cy); break;
      case 'CH4': mol = Molecule._CH4(cx, cy); break;
      case 'NH3': mol = Molecule._NH3(cx, cy); break;
      case 'O3': mol = Molecule._O3(cx, cy); break;
      case 'NaCl': mol = Molecule._NaCl(cx, cy); break;
      default:
        throw new Error(`Unknown formula: ${formula}. Add it to Molecule.create().`);
    }
    mol.assignElectrons();
    return mol;
  }

  // --- Factory helpers ---

  static _H2(cx, cy) {
    const mol = new Molecule();
    const h1 = mol.addAtom(Element.get('H'), cx - 40, cy);
    const h2 = mol.addAtom(Element.get('H'), cx + 40, cy);
    mol.addBond(h1, h2, 1);
    return mol;
  }

  static _O2(cx, cy) {
    const mol = new Molecule();
    const o1 = mol.addAtom(Element.get('O'), cx - 50, cy);
    const o2 = mol.addAtom(Element.get('O'), cx + 50, cy);
    mol.addBond(o1, o2, 2);
    o1.setLonePairs(2);
    o2.setLonePairs(2);
    return mol;
  }

  static _N2(cx, cy) {
    const mol = new Molecule();
    const n1 = mol.addAtom(Element.get('N'), cx - 50, cy);
    const n2 = mol.addAtom(Element.get('N'), cx + 50, cy);
    mol.addBond(n1, n2, 3);
    n1.setLonePairs(1);
    n2.setLonePairs(1);
    return mol;
  }

  static _H2O(cx, cy) {
    const mol = new Molecule();
    const o = mol.addAtom(Element.get('O'), cx, cy - 20);
    const h1 = mol.addAtom(Element.get('H'), cx - 60, cy + 40);
    const h2 = mol.addAtom(Element.get('H'), cx + 60, cy + 40);
    mol.addBond(o, h1, 1);
    mol.addBond(o, h2, 1);
    o.setLonePairs(2);
    return mol;
  }

  static _CO2(cx, cy) {
    const mol = new Molecule();
    const c = mol.addAtom(Element.get('C'), cx, cy);
    const o1 = mol.addAtom(Element.get('O'), cx - 80, cy);
    const o2 = mol.addAtom(Element.get('O'), cx + 80, cy);
    mol.addBond(c, o1, 2);
    mol.addBond(c, o2, 2);
    o1.setLonePairs(2);
    o2.setLonePairs(2);
    return mol;
  }

  static _CH4(cx, cy) {
    const mol = new Molecule();
    const c = mol.addAtom(Element.get('C'), cx, cy);
    const h1 = mol.addAtom(Element.get('H'), cx - 55, cy - 45);
    const h2 = mol.addAtom(Element.get('H'), cx + 55, cy - 45);
    const h3 = mol.addAtom(Element.get('H'), cx - 55, cy + 45);
    const h4 = mol.addAtom(Element.get('H'), cx + 55, cy + 45);
    mol.addBond(c, h1, 1);
    mol.addBond(c, h2, 1);
    mol.addBond(c, h3, 1);
    mol.addBond(c, h4, 1);
    return mol;
  }

  static _NH3(cx, cy) {
    const mol = new Molecule();
    const n = mol.addAtom(Element.get('N'), cx, cy - 15);
    const h1 = mol.addAtom(Element.get('H'), cx - 60, cy + 35);
    const h2 = mol.addAtom(Element.get('H'), cx, cy + 55);
    const h3 = mol.addAtom(Element.get('H'), cx + 60, cy + 35);
    mol.addBond(n, h1, 1);
    mol.addBond(n, h2, 1);
    mol.addBond(n, h3, 1);
    n.setLonePairs(1);
    return mol;
  }

  static _O3(cx, cy) {
    const mol = new Molecule();
    const o1 = mol.addAtom(Element.get('O'), cx - 100, cy);
    const o2 = mol.addAtom(Element.get('O'), cx, cy);
    const o3 = mol.addAtom(Element.get('O'), cx + 100, cy);
    mol.addBond(o1, o2, 2);
    mol.addBond(o2, o3, 1);
    o1.setLonePairs(2);
    o2.setLonePairs(1);
    o3.setLonePairs(3);
    return mol;
  }

  static _NaCl(cx, cy) {
    const mol = new Molecule();
    const na = mol.addAtom(Element.get('Na'), cx - 55, cy);
    const cl = mol.addAtom(Element.get('Cl'), cx + 55, cy);
    mol.addBond(na, cl, 1);
    na.charge = +1;
    cl.charge = -1;
    return mol;
  }
}
