/**
 * Hybridization Engine — completely isolated from VSEPR.
 *
 * Computes hybridization state and hybrid orbital geometry for any atom
 * based on its sigma bonds + lone pairs. Also determines sigma vs pi
 * bond classification.
 *
 * Zero imports from core/ (Atom, Bond, etc.) — works with plain numbers.
 * Can be used alongside VSEPR without interference.
 *
 * Usage:
 *   const h = Hybridization.compute(sigmaBonds, lonePairs);
 *   // h.type = 'sp3'
 *   // h.angles = [angle1, angle2, ...]  (radians, 2D projected)
 *   // h.geometry = 'tetrahedral'
 *
 *   const bondType = Hybridization.classifyBond(bondOrder, bondIndex);
 *   // bondType = { sigma: true, pi: false }
 */

const DEG = Math.PI / 180;

/**
 * Hybridization lookup: (sigma bonds + lone pairs) → hybridization state.
 * Each entry has the hybrid orbital angles (2D projected) for visualization.
 */
const HYBRID_TABLE = {
  2: {
    type: 'sp',
    geometry: 'linear',
    angleDeg: 180,
    // Two hybrid orbitals pointing opposite directions
    orbitalAngles: [0, Math.PI],
  },
  3: {
    type: 'sp2',
    geometry: 'trigonal planar',
    angleDeg: 120,
    orbitalAngles: [-90 * DEG, 30 * DEG, 150 * DEG],
  },
  4: {
    type: 'sp3',
    geometry: 'tetrahedral',
    angleDeg: 109.5,
    // 2D projection of tetrahedral
    orbitalAngles: [-54.75 * DEG, 54.75 * DEG, (180 + 54.75) * DEG, (180 - 54.75) * DEG],
  },
  5: {
    type: 'sp3d',
    geometry: 'trigonal bipyramidal',
    angleDeg: 120,
    orbitalAngles: [-90 * DEG, 0, 90 * DEG, 150 * DEG, 210 * DEG],
  },
  6: {
    type: 'sp3d2',
    geometry: 'octahedral',
    angleDeg: 90,
    orbitalAngles: [0, 60 * DEG, 120 * DEG, 180 * DEG, 240 * DEG, 300 * DEG],
  },
};

export class Hybridization {
  /**
   * Compute hybridization for an atom.
   *
   * @param {number} sigmaBonds — number of sigma bonds (= number of bonded neighbors)
   * @param {number} lonePairs — number of lone pairs
   * @returns {{ type: string, geometry: string, angleDeg: number,
   *             orbitalAngles: number[], stericNumber: number,
   *             sigmaBonds: number, lonePairs: number }}
   */
  static compute(sigmaBonds, lonePairs) {
    const stericNumber = sigmaBonds + lonePairs;
    const entry = HYBRID_TABLE[stericNumber];

    if (!entry) {
      // Fallback for stericNumber = 1 or unusual cases
      return {
        type: stericNumber <= 1 ? 's' : 'sp',
        geometry: stericNumber <= 1 ? 'terminal' : 'linear',
        angleDeg: 180,
        orbitalAngles: stericNumber <= 1 ? [0] : [0, Math.PI],
        stericNumber,
        sigmaBonds,
        lonePairs,
      };
    }

    return {
      type: entry.type,
      geometry: entry.geometry,
      angleDeg: entry.angleDeg,
      orbitalAngles: [...entry.orbitalAngles],
      stericNumber,
      sigmaBonds,
      lonePairs,
    };
  }

  /**
   * Compute hybridization from element data.
   * Convenience method that calculates lone pairs from valence electrons.
   *
   * @param {number} valenceElectrons — element's VE count
   * @param {number} sigmaBonds — number of bonded neighbors
   * @returns {object} same as compute()
   */
  static fromElement(valenceElectrons, sigmaBonds) {
    const bondingElectrons = sigmaBonds; // each sigma bond uses 1 VE from this atom
    const lonePairs = Math.max(0, Math.floor((valenceElectrons - bondingElectrons) / 2));
    return Hybridization.compute(sigmaBonds, lonePairs);
  }

  /**
   * Classify each bond in a multi-bond as sigma or pi.
   *
   * Rule: first bond = sigma, additional bonds = pi.
   *
   * @param {number} bondOrder — 1, 2, or 3
   * @returns {Array<{type: 'sigma'|'pi', index: number}>}
   */
  static classifyBond(bondOrder) {
    const result = [];
    const intOrder = Math.ceil(bondOrder);
    for (let i = 0; i < intOrder; i++) {
      result.push({
        type: i === 0 ? 'sigma' : 'pi',
        index: i,
      });
    }
    return result;
  }

  /**
   * Get the unhybridized p orbitals (for pi bonds).
   * After hybridization, leftover p orbitals form pi bonds.
   *
   * @param {string} hybridType — 'sp', 'sp2', 'sp3', etc.
   * @returns {number} number of unhybridized p orbitals available for pi bonds
   */
  static unhybridizedPOrbitals(hybridType) {
    switch (hybridType) {
      case 's': return 3;    // no p used in hybrid
      case 'sp': return 2;   // 1 p used, 2 remain
      case 'sp2': return 1;  // 2 p used, 1 remains
      case 'sp3': return 0;  // all 3 p used
      case 'sp3d': return 0;
      case 'sp3d2': return 0;
      default: return 0;
    }
  }

  /**
   * Describe the hybrid orbital shape for visualization.
   * Hybrid orbitals are "lopsided" — larger lobe toward the bond,
   * small lobe toward the nucleus.
   *
   * @param {string} hybridType
   * @returns {{ lobeRatio: number, description: string }}
   */
  static orbitalShape(hybridType) {
    // All sp-type hybrids have one large lobe + one small lobe
    // The ratio describes how "lopsided" they are
    switch (hybridType) {
      case 'sp':  return { lobeRatio: 0.75, description: 'Two large lobes, 180° apart' };
      case 'sp2': return { lobeRatio: 0.70, description: 'Three lobes, 120° apart, flat' };
      case 'sp3': return { lobeRatio: 0.65, description: 'Four lobes, 109.5° apart, 3D' };
      default:    return { lobeRatio: 0.60, description: 'Multiple lobes' };
    }
  }
}
