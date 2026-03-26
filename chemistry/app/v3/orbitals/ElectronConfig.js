/**
 * Pure data: computes electron filling for any element.
 * Follows Aufbau, Pauli exclusion, Hund's rule.
 * Zero dependencies on rendering code.
 */

const FILLING_ORDER = [
  '1s','2s','2p','3s','3p','4s','3d','4p','5s','4d',
  '5p','6s','4f','5d','6p','7s','5f','6d','7p',
];

const ORBITAL_COUNT = { s: 1, p: 3, d: 5, f: 7 };
const MAX_ELECTRONS = { s: 2, p: 6, d: 10, f: 14 };
const SUBSHELL_COLORS = { s: '#00e5ff', p: '#ff9800', d: '#4caf50', f: '#bb86fc' };

export class ElectronConfig {
  /**
   * Build the full electron configuration for atomic number Z.
   * Returns an array of filled subshells, each with orbital-level detail.
   *
   * @param {number} Z
   * @returns {Array<{n: number, type: string, label: string, electrons: number,
   *           orbitals: Array<{ml: number, spinUp: boolean, spinDown: boolean}>}>}
   */
  static build(Z) {
    let remaining = Z;
    const result = [];

    for (const label of FILLING_ORDER) {
      if (remaining <= 0) break;
      const n = parseInt(label[0]);
      const type = label[1];
      const orbCount = ORBITAL_COUNT[type];
      const maxE = orbCount * 2;
      const take = Math.min(remaining, maxE);
      remaining -= take;

      // Build orbitals with Hund's rule
      const orbitals = [];
      for (let ml = 0; ml < orbCount; ml++) {
        orbitals.push({ ml, spinUp: false, spinDown: false });
      }

      // Phase 1: fill one electron (spin up) per orbital
      for (let i = 0; i < Math.min(take, orbCount); i++) {
        orbitals[i].spinUp = true;
      }

      // Phase 2: pair remaining (spin down)
      const leftover = take - Math.min(take, orbCount);
      for (let i = 0; i < leftover; i++) {
        orbitals[i].spinDown = true;
      }

      result.push({ n, type, label, electrons: take, orbitals });
    }

    return result;
  }

  /**
   * Get notation string like "1s² 2s² 2p⁴"
   */
  static notation(Z) {
    const superscripts = { 0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹',10:'¹⁰',11:'¹¹',12:'¹²',13:'¹³',14:'¹⁴' };
    return ElectronConfig.build(Z)
      .map(s => `${s.label}${superscripts[s.electrons] || s.electrons}`)
      .join(' ');
  }

  /**
   * Group configuration by shell number.
   * @param {number} Z
   * @returns {Map<number, Array>} shell n → array of subshell entries
   */
  static byShell(Z) {
    const config = ElectronConfig.build(Z);
    const shells = new Map();
    for (const entry of config) {
      if (!shells.has(entry.n)) shells.set(entry.n, []);
      shells.get(entry.n).push(entry);
    }
    return shells;
  }

  static get FILLING_ORDER() { return FILLING_ORDER; }
  static get ORBITAL_COUNT() { return ORBITAL_COUNT; }
  static get MAX_ELECTRONS() { return MAX_ELECTRONS; }
  static get SUBSHELL_COLORS() { return SUBSHELL_COLORS; }
}
