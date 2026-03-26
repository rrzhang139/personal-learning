/**
 * Molecule = Atoms + Bonds, with VSEPR-computed geometry.
 */
import { Element } from './Element.js';
import { Atom } from './Atom.js';
import { Bond } from './Bond.js';
import { VSEPR } from './VSEPR.js';

export class Molecule {
  constructor(atoms = [], bonds = []) {
    this.atoms = atoms;
    this.bonds = bonds;
  }

  addAtom(element, x, y) {
    const atom = new Atom(element, x, y);
    this.atoms.push(atom);
    return atom;
  }

  addBond(atomA, atomB, order = 1) {
    const bond = new Bond(atomA, atomB, order);
    this.bonds.push(bond);
    return bond;
  }

  get renderables() {
    return [...this.bonds, ...this.atoms];
  }

  assignElectrons() {
    for (const atom of this.atoms) atom.assignElectronStates();
  }

  applySpringPhysics(draggedAtom = null, strength = 0.03) {
    for (const bond of this.bonds) {
      const a = bond.atomA;
      const b = bond.atomB;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const target = (a.r + b.r) + 30;
      if (dist < 1) continue;
      const force = (dist - target) * strength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (a !== draggedAtom) { a.x += fx; a.y += fy; }
      if (b !== draggedAtom) { b.x -= fx; b.y -= fy; }
    }
  }

  /**
   * Smart factory: builds common molecules using VSEPR geometry.
   */
  static create(formula, cx = 450, cy = 250) {
    const builders = {
      'H2': Molecule._diatomic('H', 'H', 1, cx, cy),
      'O2': Molecule._diatomic('O', 'O', 2, cx, cy),
      'N2': Molecule._diatomic('N', 'N', 3, cx, cy),
      'HF': Molecule._diatomic('H', 'F', 1, cx, cy),
      'HCl': Molecule._diatomic('H', 'Cl', 1, cx, cy),
      'H2O': Molecule._centralWithTerminals('O', ['H', 'H'], [1, 1], cx, cy),
      'CO2': Molecule._centralWithTerminals('C', ['O', 'O'], [2, 2], cx, cy),
      'CH4': Molecule._centralWithTerminals('C', ['H', 'H', 'H', 'H'], [1, 1, 1, 1], cx, cy),
      'NH3': Molecule._centralWithTerminals('N', ['H', 'H', 'H'], [1, 1, 1], cx, cy),
      'O3':  Molecule._centralWithTerminals('O', ['O', 'O'], [2, 1], cx, cy),
      'NaCl': Molecule._diatomic('Na', 'Cl', 1, cx, cy),
      'BF3': Molecule._centralWithTerminals('B', ['F', 'F', 'F'], [1, 1, 1], cx, cy),
      'PCl5': Molecule._centralWithTerminals('P', ['Cl', 'Cl', 'Cl', 'Cl', 'Cl'], [1,1,1,1,1], cx, cy),
      'SF6': Molecule._centralWithTerminals('S', ['F', 'F', 'F', 'F', 'F', 'F'], [1,1,1,1,1,1], cx, cy),
    };
    const mol = builders[formula];
    if (!mol) throw new Error(`Unknown formula: ${formula}`);
    mol.assignElectrons();
    return mol;
  }

  /**
   * Build a diatomic molecule (H₂, O₂, N₂, HCl, etc.)
   */
  static _diatomic(sym1, sym2, order, cx, cy) {
    const mol = new Molecule();
    const bondLen = 55;
    const a = mol.addAtom(Element.get(sym1), cx - bondLen, cy);
    const b = mol.addAtom(Element.get(sym2), cx + bondLen, cy);
    mol.addBond(a, b, order);
    return mol;
  }

  /**
   * Build a molecule with one central atom and N terminal atoms,
   * using VSEPR to compute geometry.
   *
   * @param {string} centralSym — central atom symbol
   * @param {string[]} terminalSyms — terminal atom symbols
   * @param {number[]} bondOrders — bond order for each terminal
   * @param {number} cx — center x
   * @param {number} cy — center y
   */
  static _centralWithTerminals(centralSym, terminalSyms, bondOrders, cx, cy) {
    const mol = new Molecule();
    const centralEl = Element.get(centralSym);
    const central = mol.addAtom(centralEl, cx, cy);

    // Count electron domains
    const bondDomains = terminalSyms.length; // each bond = 1 domain (even double/triple)
    const bondingElectrons = bondOrders.reduce((sum, o) => sum + o, 0);
    const lonePairCount = VSEPR.lonePairs(centralEl, bondingElectrons);

    // Get VSEPR positions
    const bondLength = 65 + (terminalSyms.length > 4 ? 10 : 0);
    const { positions, layout } = VSEPR.positionAtoms(cx, cy, bondDomains, lonePairCount, bondLength);

    // Create terminal atoms at VSEPR positions
    for (let i = 0; i < terminalSyms.length; i++) {
      const el = Element.get(terminalSyms[i]);
      const pos = positions[i];
      const terminal = mol.addAtom(el, pos.x, pos.y);
      mol.addBond(central, terminal, bondOrders[i]);
    }

    // Store geometry info on molecule for display
    mol.geometry = layout;

    return mol;
  }
}
