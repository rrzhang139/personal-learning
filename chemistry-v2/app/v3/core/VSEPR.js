/**
 * VSEPR Geometry Engine
 *
 * Computes molecular geometry from electron domain count.
 * Returns 2D-projected angles for bond and lone pair placement.
 *
 * Electron domains = bonding pairs + lone pairs around a central atom.
 * Each double/triple bond counts as ONE domain.
 *
 * Usage:
 *   const layout = VSEPR.layout(bondCount, lonePairCount);
 *   // layout.bondAngles = [angle1, angle2, ...]  (radians)
 *   // layout.lonePairAngles = [angle1, ...]
 *   // layout.name = 'bent'
 *   // layout.electronGeometry = 'tetrahedral'
 *   // layout.idealBondAngle = 104.5  (degrees)
 */

// 2D angle layouts for each total electron domain count.
// Lone pairs are placed in positions that maximize repulsion
// (they're "fatter" than bonding pairs, so they take equatorial
// or spread positions). Angles in radians, 0 = right, π/2 = down.

// For 2D projection of 3D geometries:
// - Linear: trivial
// - Trigonal planar: trivial
// - Tetrahedral: project so bonds visible, lone pairs on "back" side
const DEG = Math.PI / 180;

/**
 * Predefined 2D layouts indexed by [totalDomains].
 * Each entry maps lonePairCount → { bondAngles[], lonePairAngles[], name, electronGeometry, bondAngleDeg }
 */
const LAYOUTS = {
  // 1 domain: just one bond direction
  1: {
    0: {
      bondAngles: [0],
      lonePairAngles: [],
      name: 'terminal',
      electronGeometry: 'terminal',
      bondAngleDeg: 0,
    },
  },

  // 2 domains: linear
  2: {
    0: {
      bondAngles: [-90 * DEG, 90 * DEG],
      lonePairAngles: [],
      name: 'linear',
      electronGeometry: 'linear',
      bondAngleDeg: 180,
    },
    1: {
      bondAngles: [90 * DEG],
      lonePairAngles: [-90 * DEG],
      name: 'terminal',
      electronGeometry: 'linear',
      bondAngleDeg: 0,
    },
  },

  // 3 domains: trigonal planar base
  3: {
    0: {
      bondAngles: [-90 * DEG, 30 * DEG, 150 * DEG],
      lonePairAngles: [],
      name: 'trigonal planar',
      electronGeometry: 'trigonal planar',
      bondAngleDeg: 120,
    },
    1: {
      // 2 bonds + 1 LP → bent (like SO₂, O₃)
      bondAngles: [30 * DEG, 150 * DEG],
      lonePairAngles: [-90 * DEG],
      name: 'bent',
      electronGeometry: 'trigonal planar',
      bondAngleDeg: 117,
    },
    2: {
      bondAngles: [-90 * DEG],
      lonePairAngles: [30 * DEG, 150 * DEG],
      name: 'linear',
      electronGeometry: 'trigonal planar',
      bondAngleDeg: 0,
    },
  },

  // 4 domains: tetrahedral base
  4: {
    0: {
      // Tetrahedral projected to 2D: two bonds down-ish, two up-ish
      bondAngles: [-54.75 * DEG, 54.75 * DEG, (180 + 54.75) * DEG, (180 - 54.75) * DEG],
      lonePairAngles: [],
      name: 'tetrahedral',
      electronGeometry: 'tetrahedral',
      bondAngleDeg: 109.5,
    },
    1: {
      // 3 bonds + 1 LP → trigonal pyramidal (NH₃)
      // LP on top, three bonds spread below
      bondAngles: [-30 * DEG, 90 * DEG, 210 * DEG],
      lonePairAngles: [-120 * DEG],
      name: 'trigonal pyramidal',
      electronGeometry: 'tetrahedral',
      bondAngleDeg: 107,
    },
    2: {
      // 2 bonds + 2 LP → bent (H₂O)
      // LPs on top, bonds going down at ~104.5° angle
      bondAngles: [(90 + 52.25) * DEG, (90 - 52.25) * DEG],
      lonePairAngles: [(-90 + 52.25) * DEG, (-90 - 52.25) * DEG],
      name: 'bent',
      electronGeometry: 'tetrahedral',
      bondAngleDeg: 104.5,
    },
    3: {
      bondAngles: [90 * DEG],
      lonePairAngles: [-30 * DEG, -150 * DEG, 210 * DEG],
      name: 'linear',
      electronGeometry: 'tetrahedral',
      bondAngleDeg: 0,
    },
  },

  // 5 domains: trigonal bipyramidal
  5: {
    0: {
      bondAngles: [-90 * DEG, 0, 90 * DEG, 150 * DEG, 210 * DEG],
      lonePairAngles: [],
      name: 'trigonal bipyramidal',
      electronGeometry: 'trigonal bipyramidal',
      bondAngleDeg: 120,
    },
    1: {
      bondAngles: [-90 * DEG, 0, 90 * DEG, 180 * DEG],
      lonePairAngles: [45 * DEG],
      name: 'seesaw',
      electronGeometry: 'trigonal bipyramidal',
      bondAngleDeg: 117,
    },
    2: {
      bondAngles: [-90 * DEG, 0, 90 * DEG],
      lonePairAngles: [150 * DEG, 210 * DEG],
      name: 'T-shaped',
      electronGeometry: 'trigonal bipyramidal',
      bondAngleDeg: 90,
    },
  },

  // 6 domains: octahedral
  6: {
    0: {
      bondAngles: [0, 60 * DEG, 120 * DEG, 180 * DEG, 240 * DEG, 300 * DEG],
      lonePairAngles: [],
      name: 'octahedral',
      electronGeometry: 'octahedral',
      bondAngleDeg: 90,
    },
    1: {
      bondAngles: [0, 72 * DEG, 144 * DEG, 216 * DEG, 288 * DEG],
      lonePairAngles: [90 * DEG],
      name: 'square pyramidal',
      electronGeometry: 'octahedral',
      bondAngleDeg: 90,
    },
    2: {
      bondAngles: [0, 90 * DEG, 180 * DEG, 270 * DEG],
      lonePairAngles: [45 * DEG, 225 * DEG],
      name: 'square planar',
      electronGeometry: 'octahedral',
      bondAngleDeg: 90,
    },
  },
};

// 3D direction vectors for each geometry (true 3D, not projected)
const DIRECTIONS_3D = {
  2: {
    0: { bond: [[0,0,1],[0,0,-1]], lone: [] },
    1: { bond: [[0,0,1]], lone: [[0,0,-1]] },
  },
  3: {
    0: { bond: [[0,0,1],[0.866,0,-0.5],[-0.866,0,-0.5]], lone: [] },
    1: { bond: [[0.866,0,-0.5],[-0.866,0,-0.5]], lone: [[0,0,1]] },
    2: { bond: [[0,0,-1]], lone: [[0.866,0,0.5],[-0.866,0,0.5]] },
  },
  4: {
    0: { bond: [[0.577,0.577,0.577],[0.577,-0.577,-0.577],[-0.577,0.577,-0.577],[-0.577,-0.577,0.577]], lone: [] },
    1: { bond: [[0.577,-0.577,-0.577],[-0.577,-0.577,0.577],[0,-0.333,0.943]], lone: [[0,1,0]] },
    2: { bond: [[0.577,-0.577,-0.577],[-0.577,-0.577,0.577]], lone: [[0,0.577,0.816],[0,0.577,-0.816]] },
    3: { bond: [[0,-1,0]], lone: [[0.577,0.577,0.577],[-0.577,0.577,-0.577],[-0.577,-0.577,0.577]] },
  },
  5: {
    0: { bond: [[1,0,0],[-0.5,0,0.866],[-0.5,0,-0.866],[0,1,0],[0,-1,0]], lone: [] },
    1: { bond: [[1,0,0],[-0.5,0,0.866],[-0.5,0,-0.866],[0,1,0]], lone: [[0,-1,0]] },
    2: { bond: [[1,0,0],[-0.5,0,0.866],[-0.5,0,-0.866]], lone: [[0,1,0],[0,-1,0]] },
  },
  6: {
    0: { bond: [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]], lone: [] },
    1: { bond: [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0]], lone: [[0,-1,0]] },
    2: { bond: [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]], lone: [[0,1,0],[0,-1,0]] },
  },
};

export class VSEPR {
  /**
   * Compute the VSEPR layout for a central atom.
   *
   * @param {number} bondCount — number of bonding domains (each multi-bond = 1)
   * @param {number} lonePairCount — number of lone pair domains
   * @returns {{ bondAngles: number[], lonePairAngles: number[], name: string,
   *             electronGeometry: string, bondAngleDeg: number }}
   */
  static layout(bondCount, lonePairCount) {
    const total = bondCount + lonePairCount;
    const group = LAYOUTS[total];
    if (group && group[lonePairCount]) {
      return group[lonePairCount];
    }
    // Fallback: distribute evenly
    const angles = [];
    for (let i = 0; i < total; i++) {
      angles.push((i / total) * Math.PI * 2 - Math.PI / 2);
    }
    return {
      bondAngles: angles.slice(0, bondCount),
      lonePairAngles: angles.slice(bondCount),
      name: 'unknown',
      electronGeometry: 'unknown',
      bondAngleDeg: (360 / total),
    };
  }

  /**
   * Position bonded atoms around a central atom using VSEPR geometry.
   *
   * @param {number} cx — central atom x
   * @param {number} cy — central atom y
   * @param {number} bondCount — bonding domains
   * @param {number} lonePairCount — lone pair domains
   * @param {number} bondLength — distance from central to bonded atom (px)
   * @returns {{ positions: {x:number, y:number}[], lonePairAngles: number[], layout: object }}
   */
  static positionAtoms(cx, cy, bondCount, lonePairCount, bondLength = 70) {
    const layout = VSEPR.layout(bondCount, lonePairCount);
    const positions = layout.bondAngles.map(angle => ({
      x: cx + Math.cos(angle) * bondLength,
      y: cy + Math.sin(angle) * bondLength,
    }));
    return { positions, lonePairAngles: layout.lonePairAngles, layout };
  }

  /**
   * Count lone pair domains for a given element after forming N bonds.
   * Uses (valence electrons - bonding electrons) / 2.
   *
   * @param {import('./Element.js').Element} element
   * @param {number} bondElectrons — total electrons used in bonding
   * @returns {number}
   */
  /**
   * 3D layout: returns unit direction vectors (as [x,y,z] arrays).
   */
  static layout3D(bondCount, lonePairCount) {
    const total = bondCount + lonePairCount;
    const group = DIRECTIONS_3D[total];
    const entry = group?.[lonePairCount];
    const layout2D = VSEPR.layout(bondCount, lonePairCount);

    if (entry) {
      return {
        bondDirections: entry.bond.map(d => [...d]),
        lonePairDirections: entry.lone.map(d => [...d]),
        name: layout2D.name,
        electronGeometry: layout2D.electronGeometry,
        bondAngleDeg: layout2D.bondAngleDeg,
      };
    }
    // Fallback: distribute evenly in XZ plane
    const all = [];
    for (let i = 0; i < total; i++) {
      const a = (i / total) * Math.PI * 2;
      all.push([Math.cos(a), 0, Math.sin(a)]);
    }
    return {
      bondDirections: all.slice(0, bondCount),
      lonePairDirections: all.slice(bondCount),
      name: layout2D.name,
      electronGeometry: layout2D.electronGeometry,
      bondAngleDeg: layout2D.bondAngleDeg,
    };
  }

  /**
   * 3D positioning: place atoms around a center point.
   * @param {number[]} center — [x, y, z]
   * @param {number} bondCount
   * @param {number} lonePairCount
   * @param {number} bondLength
   * @returns {{ positions: number[][], lonePairDirections: number[][], layout: object }}
   */
  static positionAtoms3D(center, bondCount, lonePairCount, bondLength = 1.5) {
    const layout = VSEPR.layout3D(bondCount, lonePairCount);
    const positions = layout.bondDirections.map(d => [
      center[0] + d[0] * bondLength,
      center[1] + d[1] * bondLength,
      center[2] + d[2] * bondLength,
    ]);
    return { positions, lonePairDirections: layout.lonePairDirections, layout };
  }

  static lonePairs(element, bondElectrons) {
    return Math.max(0, Math.floor((element.valenceElectrons - bondElectrons) / 2));
  }
}
