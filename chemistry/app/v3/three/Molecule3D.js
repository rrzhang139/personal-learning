/**
 * 3D Molecule factory: creates Atom3D + Bond3D with VSEPR 3D geometry.
 */
import { Element } from '../core/Element.js';
import { VSEPR } from '../core/VSEPR.js';
import { Atom3D } from './Atom3D.js';
import { Bond3D } from './Bond3D.js';

export class Molecule3D {
  constructor(atoms = [], bonds = []) {
    this.atoms = atoms;
    this.bonds = bonds;
    this.geometry = null;
  }

  /** All Three.js groups to add to scene */
  get groups() {
    return [...this.bonds.map(b => b.group), ...this.atoms.map(a => a.group)];
  }

  static create(formula, center = [0, 0, 0]) {
    const builders = {
      'H2': () => Molecule3D._diatomic('H', 'H', 1, center),
      'O2': () => Molecule3D._diatomic('O', 'O', 2, center),
      'N2': () => Molecule3D._diatomic('N', 'N', 3, center),
      'HF': () => Molecule3D._diatomic('H', 'F', 1, center),
      'HCl': () => Molecule3D._diatomic('H', 'Cl', 1, center),
      'H2O': () => Molecule3D._central('O', ['H','H'], [1,1], center),
      'CO2': () => Molecule3D._central('C', ['O','O'], [2,2], center),
      'CH4': () => Molecule3D._central('C', ['H','H','H','H'], [1,1,1,1], center),
      'NH3': () => Molecule3D._central('N', ['H','H','H'], [1,1,1], center),
      'O3':  () => Molecule3D._central('O', ['O','O'], [2,1], center),
      'NaCl': () => Molecule3D._diatomic('Na', 'Cl', 1, center),
      'BF3': () => Molecule3D._central('B', ['F','F','F'], [1,1,1], center),
    };
    const builder = builders[formula];
    if (!builder) throw new Error(`Unknown formula: ${formula}`);
    return builder();
  }

  static _diatomic(sym1, sym2, order, center) {
    const mol = new Molecule3D();
    const a = new Atom3D(Element.get(sym1), [center[0] - 0.8, center[1], center[2]]);
    const b = new Atom3D(Element.get(sym2), [center[0] + 0.8, center[1], center[2]]);
    mol.atoms.push(a, b);
    mol.bonds.push(new Bond3D(a, b, order));
    return mol;
  }

  static _central(centralSym, terminalSyms, bondOrders, center) {
    const mol = new Molecule3D();
    const centralEl = Element.get(centralSym);
    const central = new Atom3D(centralEl, center);
    mol.atoms.push(central);

    const bondDomains = terminalSyms.length;
    const bondingE = bondOrders.reduce((s, o) => s + o, 0);
    const lonePairs = VSEPR.lonePairs(centralEl, bondingE);

    const { positions, layout } = VSEPR.positionAtoms3D(center, bondDomains, lonePairs, 1.5);
    mol.geometry = layout;

    for (let i = 0; i < terminalSyms.length; i++) {
      const el = Element.get(terminalSyms[i]);
      const pos = positions[i];
      const terminal = new Atom3D(el, pos);
      mol.atoms.push(terminal);
      mol.bonds.push(new Bond3D(central, terminal, bondOrders[i]));
    }

    return mol;
  }
}
