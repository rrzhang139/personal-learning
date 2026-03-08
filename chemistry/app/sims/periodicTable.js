import { registerSim } from './registry.js';

// ─── Element Data ───────────────────────────────────────────────────────────
// Full 118 elements. First 36 have precise data; remainder use approximate values.

const CATEGORIES = {
  'alkali-metal':      '#ef5350',
  'alkaline-earth':    '#ff7043',
  'transition-metal':  '#ffa726',
  'post-transition':   '#ffca28',
  'metalloid':         '#66bb6a',
  'nonmetal':          '#4fc3f7',
  'halogen':           '#7e57c2',
  'noble-gas':         '#ec407a',
  'lanthanide':        '#8d6e63',
  'actinide':          '#78909c',
};

// Helper to build element objects
function el(number, symbol, name, mass, category, electronegativity, atomicRadius, ionizationEnergy, electronConfig) {
  return { number, symbol, name, mass, category, electronegativity, atomicRadius, ionizationEnergy, electronConfig };
}

const ELEMENTS = [
  // Period 1
  el(1,   'H',  'Hydrogen',      1.008,   'nonmetal',          2.20, 53,  1312.0, '1s1'),
  el(2,   'He', 'Helium',        4.003,   'noble-gas',         null, 31,  2372.3, '1s2'),
  // Period 2
  el(3,   'Li', 'Lithium',       6.941,   'alkali-metal',      0.98, 167, 520.2,  '[He] 2s1'),
  el(4,   'Be', 'Beryllium',     9.012,   'alkaline-earth',    1.57, 112, 899.5,  '[He] 2s2'),
  el(5,   'B',  'Boron',         10.81,   'metalloid',         2.04, 87,  800.6,  '[He] 2s2 2p1'),
  el(6,   'C',  'Carbon',        12.011,  'nonmetal',          2.55, 77,  1086.5, '[He] 2s2 2p2'),
  el(7,   'N',  'Nitrogen',      14.007,  'nonmetal',          3.04, 75,  1402.3, '[He] 2s2 2p3'),
  el(8,   'O',  'Oxygen',        15.999,  'nonmetal',          3.44, 73,  1313.9, '[He] 2s2 2p4'),
  el(9,   'F',  'Fluorine',      18.998,  'halogen',           3.98, 71,  1681.0, '[He] 2s2 2p5'),
  el(10,  'Ne', 'Neon',          20.180,  'noble-gas',         null, 38,  2080.7, '[He] 2s2 2p6'),
  // Period 3
  el(11,  'Na', 'Sodium',        22.990,  'alkali-metal',      0.93, 190, 495.8,  '[Ne] 3s1'),
  el(12,  'Mg', 'Magnesium',     24.305,  'alkaline-earth',    1.31, 145, 737.7,  '[Ne] 3s2'),
  el(13,  'Al', 'Aluminium',     26.982,  'post-transition',   1.61, 118, 577.5,  '[Ne] 3s2 3p1'),
  el(14,  'Si', 'Silicon',       28.086,  'metalloid',         1.90, 111, 786.5,  '[Ne] 3s2 3p2'),
  el(15,  'P',  'Phosphorus',    30.974,  'nonmetal',          2.19, 98,  1011.8, '[Ne] 3s2 3p3'),
  el(16,  'S',  'Sulfur',        32.065,  'nonmetal',          2.58, 88,  999.6,  '[Ne] 3s2 3p4'),
  el(17,  'Cl', 'Chlorine',      35.453,  'halogen',           3.16, 79,  1251.2, '[Ne] 3s2 3p5'),
  el(18,  'Ar', 'Argon',         39.948,  'noble-gas',         null, 71,  1520.6, '[Ne] 3s2 3p6'),
  // Period 4
  el(19,  'K',  'Potassium',     39.098,  'alkali-metal',      0.82, 243, 418.8,  '[Ar] 4s1'),
  el(20,  'Ca', 'Calcium',       40.078,  'alkaline-earth',    1.00, 194, 589.8,  '[Ar] 4s2'),
  el(21,  'Sc', 'Scandium',      44.956,  'transition-metal',  1.36, 184, 633.1,  '[Ar] 3d1 4s2'),
  el(22,  'Ti', 'Titanium',      47.867,  'transition-metal',  1.54, 176, 658.8,  '[Ar] 3d2 4s2'),
  el(23,  'V',  'Vanadium',      50.942,  'transition-metal',  1.63, 171, 650.9,  '[Ar] 3d3 4s2'),
  el(24,  'Cr', 'Chromium',      51.996,  'transition-metal',  1.66, 166, 652.9,  '[Ar] 3d5 4s1'),
  el(25,  'Mn', 'Manganese',     54.938,  'transition-metal',  1.55, 161, 717.3,  '[Ar] 3d5 4s2'),
  el(26,  'Fe', 'Iron',          55.845,  'transition-metal',  1.83, 156, 762.5,  '[Ar] 3d6 4s2'),
  el(27,  'Co', 'Cobalt',        58.933,  'transition-metal',  1.88, 152, 760.4,  '[Ar] 3d7 4s2'),
  el(28,  'Ni', 'Nickel',        58.693,  'transition-metal',  1.91, 149, 737.1,  '[Ar] 3d8 4s2'),
  el(29,  'Cu', 'Copper',        63.546,  'transition-metal',  1.90, 145, 745.5,  '[Ar] 3d10 4s1'),
  el(30,  'Zn', 'Zinc',          65.380,  'post-transition',   1.65, 142, 906.4,  '[Ar] 3d10 4s2'),
  el(31,  'Ga', 'Gallium',       69.723,  'post-transition',   1.81, 136, 578.8,  '[Ar] 3d10 4s2 4p1'),
  el(32,  'Ge', 'Germanium',     72.640,  'metalloid',         2.01, 125, 762.2,  '[Ar] 3d10 4s2 4p2'),
  el(33,  'As', 'Arsenic',       74.922,  'metalloid',         2.18, 114, 947.0,  '[Ar] 3d10 4s2 4p3'),
  el(34,  'Se', 'Selenium',      78.960,  'nonmetal',          2.55, 103, 941.0,  '[Ar] 3d10 4s2 4p4'),
  el(35,  'Br', 'Bromine',       79.904,  'halogen',           2.96, 94,  1139.9, '[Ar] 3d10 4s2 4p5'),
  el(36,  'Kr', 'Krypton',       83.798,  'noble-gas',         3.00, 88,  1350.8, '[Ar] 3d10 4s2 4p6'),
  // Period 5
  el(37,  'Rb', 'Rubidium',      85.468,  'alkali-metal',      0.82, 265, 403.0,  '[Kr] 5s1'),
  el(38,  'Sr', 'Strontium',     87.620,  'alkaline-earth',    0.95, 219, 549.5,  '[Kr] 5s2'),
  el(39,  'Y',  'Yttrium',       88.906,  'transition-metal',  1.22, 212, 600.0,  '[Kr] 4d1 5s2'),
  el(40,  'Zr', 'Zirconium',     91.224,  'transition-metal',  1.33, 206, 640.1,  '[Kr] 4d2 5s2'),
  el(41,  'Nb', 'Niobium',       92.906,  'transition-metal',  1.60, 198, 652.1,  '[Kr] 4d4 5s1'),
  el(42,  'Mo', 'Molybdenum',    95.960,  'transition-metal',  2.16, 190, 684.3,  '[Kr] 4d5 5s1'),
  el(43,  'Tc', 'Technetium',    98.000,  'transition-metal',  1.90, 183, 702.0,  '[Kr] 4d5 5s2'),
  el(44,  'Ru', 'Ruthenium',     101.07,  'transition-metal',  2.20, 178, 710.2,  '[Kr] 4d7 5s1'),
  el(45,  'Rh', 'Rhodium',       102.91,  'transition-metal',  2.28, 173, 719.7,  '[Kr] 4d8 5s1'),
  el(46,  'Pd', 'Palladium',     106.42,  'transition-metal',  2.20, 169, 804.4,  '[Kr] 4d10'),
  el(47,  'Ag', 'Silver',        107.87,  'transition-metal',  1.93, 165, 731.0,  '[Kr] 4d10 5s1'),
  el(48,  'Cd', 'Cadmium',       112.41,  'post-transition',   1.69, 161, 867.8,  '[Kr] 4d10 5s2'),
  el(49,  'In', 'Indium',        114.82,  'post-transition',   1.78, 156, 558.3,  '[Kr] 4d10 5s2 5p1'),
  el(50,  'Sn', 'Tin',           118.71,  'post-transition',   1.96, 145, 708.6,  '[Kr] 4d10 5s2 5p2'),
  el(51,  'Sb', 'Antimony',      121.76,  'metalloid',         2.05, 133, 834.0,  '[Kr] 4d10 5s2 5p3'),
  el(52,  'Te', 'Tellurium',     127.60,  'metalloid',         2.10, 123, 869.3,  '[Kr] 4d10 5s2 5p4'),
  el(53,  'I',  'Iodine',        126.90,  'halogen',           2.66, 115, 1008.4, '[Kr] 4d10 5s2 5p5'),
  el(54,  'Xe', 'Xenon',         131.29,  'noble-gas',         2.60, 108, 1170.4, '[Kr] 4d10 5s2 5p6'),
  // Period 6
  el(55,  'Cs', 'Caesium',       132.91,  'alkali-metal',      0.79, 298, 375.7,  '[Xe] 6s1'),
  el(56,  'Ba', 'Barium',        137.33,  'alkaline-earth',    0.89, 253, 502.9,  '[Xe] 6s2'),
  // Lanthanides (57-71)
  el(57,  'La', 'Lanthanum',     138.91,  'lanthanide',        1.10, 195, 538.1,  '[Xe] 5d1 6s2'),
  el(58,  'Ce', 'Cerium',        140.12,  'lanthanide',        1.12, 185, 534.4,  '[Xe] 4f1 5d1 6s2'),
  el(59,  'Pr', 'Praseodymium',  140.91,  'lanthanide',        1.13, 247, 527.0,  '[Xe] 4f3 6s2'),
  el(60,  'Nd', 'Neodymium',     144.24,  'lanthanide',        1.14, 206, 533.1,  '[Xe] 4f4 6s2'),
  el(61,  'Pm', 'Promethium',    145.00,  'lanthanide',        1.13, 205, 540.0,  '[Xe] 4f5 6s2'),
  el(62,  'Sm', 'Samarium',      150.36,  'lanthanide',        1.17, 238, 544.5,  '[Xe] 4f6 6s2'),
  el(63,  'Eu', 'Europium',      151.96,  'lanthanide',        1.20, 231, 547.1,  '[Xe] 4f7 6s2'),
  el(64,  'Gd', 'Gadolinium',    157.25,  'lanthanide',        1.20, 233, 593.4,  '[Xe] 4f7 5d1 6s2'),
  el(65,  'Tb', 'Terbium',       158.93,  'lanthanide',        1.10, 225, 565.8,  '[Xe] 4f9 6s2'),
  el(66,  'Dy', 'Dysprosium',    162.50,  'lanthanide',        1.22, 228, 573.0,  '[Xe] 4f10 6s2'),
  el(67,  'Ho', 'Holmium',       164.93,  'lanthanide',        1.23, 226, 581.0,  '[Xe] 4f11 6s2'),
  el(68,  'Er', 'Erbium',        167.26,  'lanthanide',        1.24, 226, 589.3,  '[Xe] 4f12 6s2'),
  el(69,  'Tm', 'Thulium',       168.93,  'lanthanide',        1.25, 222, 596.7,  '[Xe] 4f13 6s2'),
  el(70,  'Yb', 'Ytterbium',     173.05,  'lanthanide',        1.10, 222, 603.4,  '[Xe] 4f14 6s2'),
  el(71,  'Lu', 'Lutetium',      174.97,  'lanthanide',        1.27, 217, 523.5,  '[Xe] 4f14 5d1 6s2'),
  // Back to Period 6 main
  el(72,  'Hf', 'Hafnium',       178.49,  'transition-metal',  1.30, 208, 658.5,  '[Xe] 4f14 5d2 6s2'),
  el(73,  'Ta', 'Tantalum',      180.95,  'transition-metal',  1.50, 200, 761.0,  '[Xe] 4f14 5d3 6s2'),
  el(74,  'W',  'Tungsten',      183.84,  'transition-metal',  2.36, 193, 770.0,  '[Xe] 4f14 5d4 6s2'),
  el(75,  'Re', 'Rhenium',       186.21,  'transition-metal',  1.90, 188, 760.0,  '[Xe] 4f14 5d5 6s2'),
  el(76,  'Os', 'Osmium',        190.23,  'transition-metal',  2.20, 185, 840.0,  '[Xe] 4f14 5d6 6s2'),
  el(77,  'Ir', 'Iridium',       192.22,  'transition-metal',  2.20, 180, 880.0,  '[Xe] 4f14 5d7 6s2'),
  el(78,  'Pt', 'Platinum',      195.08,  'transition-metal',  2.28, 177, 870.0,  '[Xe] 4f14 5d9 6s1'),
  el(79,  'Au', 'Gold',          196.97,  'transition-metal',  2.54, 174, 890.1,  '[Xe] 4f14 5d10 6s1'),
  el(80,  'Hg', 'Mercury',       200.59,  'post-transition',   2.00, 171, 1007.1, '[Xe] 4f14 5d10 6s2'),
  el(81,  'Tl', 'Thallium',      204.38,  'post-transition',   1.62, 156, 589.4,  '[Xe] 4f14 5d10 6s2 6p1'),
  el(82,  'Pb', 'Lead',          207.20,  'post-transition',   2.33, 154, 715.6,  '[Xe] 4f14 5d10 6s2 6p2'),
  el(83,  'Bi', 'Bismuth',       208.98,  'post-transition',   2.02, 143, 703.0,  '[Xe] 4f14 5d10 6s2 6p3'),
  el(84,  'Po', 'Polonium',      209.00,  'post-transition',   2.00, 135, 812.1,  '[Xe] 4f14 5d10 6s2 6p4'),
  el(85,  'At', 'Astatine',      210.00,  'halogen',           2.20, 127, 920.0,  '[Xe] 4f14 5d10 6s2 6p5'),
  el(86,  'Rn', 'Radon',         222.00,  'noble-gas',         2.20, 120, 1037.0, '[Xe] 4f14 5d10 6s2 6p6'),
  // Period 7
  el(87,  'Fr', 'Francium',      223.00,  'alkali-metal',      0.70, 348, 380.0,  '[Rn] 7s1'),
  el(88,  'Ra', 'Radium',        226.00,  'alkaline-earth',    0.90, 283, 509.3,  '[Rn] 7s2'),
  // Actinides (89-103)
  el(89,  'Ac', 'Actinium',      227.00,  'actinide',          1.10, 195, 499.0,  '[Rn] 6d1 7s2'),
  el(90,  'Th', 'Thorium',       232.04,  'actinide',          1.30, 180, 587.0,  '[Rn] 6d2 7s2'),
  el(91,  'Pa', 'Protactinium',  231.04,  'actinide',          1.50, 180, 568.0,  '[Rn] 5f2 6d1 7s2'),
  el(92,  'U',  'Uranium',       238.03,  'actinide',          1.38, 175, 597.6,  '[Rn] 5f3 6d1 7s2'),
  el(93,  'Np', 'Neptunium',     237.00,  'actinide',          1.36, 175, 604.5,  '[Rn] 5f4 6d1 7s2'),
  el(94,  'Pu', 'Plutonium',     244.00,  'actinide',          1.28, 175, 584.7,  '[Rn] 5f6 7s2'),
  el(95,  'Am', 'Americium',     243.00,  'actinide',          1.30, 175, 578.0,  '[Rn] 5f7 7s2'),
  el(96,  'Cm', 'Curium',        247.00,  'actinide',          1.30, 176, 581.0,  '[Rn] 5f7 6d1 7s2'),
  el(97,  'Bk', 'Berkelium',     247.00,  'actinide',          1.30, 176, 601.0,  '[Rn] 5f9 7s2'),
  el(98,  'Cf', 'Californium',   251.00,  'actinide',          1.30, 176, 608.0,  '[Rn] 5f10 7s2'),
  el(99,  'Es', 'Einsteinium',   252.00,  'actinide',          1.30, 176, 619.0,  '[Rn] 5f11 7s2'),
  el(100, 'Fm', 'Fermium',       257.00,  'actinide',          1.30, 176, 627.0,  '[Rn] 5f12 7s2'),
  el(101, 'Md', 'Mendelevium',   258.00,  'actinide',          1.30, 176, 635.0,  '[Rn] 5f13 7s2'),
  el(102, 'No', 'Nobelium',      259.00,  'actinide',          1.30, 176, 642.0,  '[Rn] 5f14 7s2'),
  el(103, 'Lr', 'Lawrencium',    262.00,  'actinide',          1.30, 176, 470.0,  '[Rn] 5f14 7s2 7p1'),
  // Back to Period 7 main
  el(104, 'Rf', 'Rutherfordium', 267.00,  'transition-metal',  null, 157, 580.0,  '[Rn] 5f14 6d2 7s2'),
  el(105, 'Db', 'Dubnium',       268.00,  'transition-metal',  null, 149, 580.0,  '[Rn] 5f14 6d3 7s2'),
  el(106, 'Sg', 'Seaborgium',    271.00,  'transition-metal',  null, 143, 580.0,  '[Rn] 5f14 6d4 7s2'),
  el(107, 'Bh', 'Bohrium',       274.00,  'transition-metal',  null, 141, 580.0,  '[Rn] 5f14 6d5 7s2'),
  el(108, 'Hs', 'Hassium',       277.00,  'transition-metal',  null, 134, 580.0,  '[Rn] 5f14 6d6 7s2'),
  el(109, 'Mt', 'Meitnerium',    278.00,  'transition-metal',  null, 129, 580.0,  '[Rn] 5f14 6d7 7s2'),
  el(110, 'Ds', 'Darmstadtium',  281.00,  'transition-metal',  null, 128, 580.0,  '[Rn] 5f14 6d8 7s2'),
  el(111, 'Rg', 'Roentgenium',   282.00,  'transition-metal',  null, 121, 580.0,  '[Rn] 5f14 6d9 7s2'),
  el(112, 'Cn', 'Copernicium',   285.00,  'post-transition',   null, 122, 580.0,  '[Rn] 5f14 6d10 7s2'),
  el(113, 'Nh', 'Nihonium',      286.00,  'post-transition',   null, 136, 580.0,  '[Rn] 5f14 6d10 7s2 7p1'),
  el(114, 'Fl', 'Flerovium',     289.00,  'post-transition',   null, 143, 580.0,  '[Rn] 5f14 6d10 7s2 7p2'),
  el(115, 'Mc', 'Moscovium',     290.00,  'post-transition',   null, 162, 580.0,  '[Rn] 5f14 6d10 7s2 7p3'),
  el(116, 'Lv', 'Livermorium',   293.00,  'post-transition',   null, 175, 580.0,  '[Rn] 5f14 6d10 7s2 7p4'),
  el(117, 'Ts', 'Tennessine',    294.00,  'halogen',           null, 165, 580.0,  '[Rn] 5f14 6d10 7s2 7p5'),
  el(118, 'Og', 'Oganesson',     294.00,  'noble-gas',         null, 157, 580.0,  '[Rn] 5f14 6d10 7s2 7p6'),
];

// Build a lookup by atomic number
const ELEMENT_MAP = {};
for (const e of ELEMENTS) ELEMENT_MAP[e.number] = e;

// ─── Standard periodic table grid positions ─────────────────────────────────
// Returns { row, col } for each atomic number (0-indexed).
// Rows 0-6 = periods 1-7, row 8 = lanthanides, row 9 = actinides.
function getGridPosition(z) {
  // Period 1
  if (z === 1) return { row: 0, col: 0 };
  if (z === 2) return { row: 0, col: 17 };
  // Period 2
  if (z >= 3 && z <= 4) return { row: 1, col: z - 3 };
  if (z >= 5 && z <= 10) return { row: 1, col: z + 7 };
  // Period 3
  if (z >= 11 && z <= 12) return { row: 2, col: z - 11 };
  if (z >= 13 && z <= 18) return { row: 2, col: z - 1 };
  // Period 4
  if (z >= 19 && z <= 36) return { row: 3, col: z - 19 };
  // Period 5
  if (z >= 37 && z <= 54) return { row: 4, col: z - 37 };
  // Period 6 main row
  if (z >= 55 && z <= 56) return { row: 5, col: z - 55 };
  if (z >= 72 && z <= 86) return { row: 5, col: z - 69 };
  // Period 7 main row
  if (z >= 87 && z <= 88) return { row: 6, col: z - 87 };
  if (z >= 104 && z <= 118) return { row: 6, col: z - 101 };
  // Lanthanides
  if (z >= 57 && z <= 71) return { row: 8, col: z - 55 };
  // Actinides
  if (z >= 89 && z <= 103) return { row: 9, col: z - 87 };
  return { row: 0, col: 0 };
}

// ─── Simulation Class ───────────────────────────────────────────────────────

export class PeriodicTableSim {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Dimensions
    this.cellW = 56;
    this.cellH = 56;
    this.padding = 12;
    this.tableOffsetX = 8;
    this.tableOffsetY = 8;

    canvas.width = 1100;
    canvas.height = 620;

    // State
    this.hoveredElement = null;
    this.selectedElement = null;
    this.onSelect = null;
    this._highlightMode = null;   // 'group' | 'period' | 'category' | 'trend' | null
    this._highlightValue = null;
    this._running = true;

    // Precompute cell rects
    this._cells = [];
    for (const elem of ELEMENTS) {
      const pos = getGridPosition(elem.number);
      // Add gap between main table and lanthanide/actinide rows
      let yOffset = 0;
      if (pos.row >= 8) yOffset = this.cellH * 0.6;
      const x = this.tableOffsetX + pos.col * (this.cellW + 2);
      const y = this.tableOffsetY + pos.row * (this.cellH + 2) + yOffset;
      this._cells.push({ elem, x, y, w: this.cellW, h: this.cellH, pos });
    }

    // Mouse state
    this._mouseX = -1;
    this._mouseY = -1;

    // Bind events
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onClick = this._handleClick.bind(this);
    canvas.addEventListener('mousemove', this._onMouseMove);
    canvas.addEventListener('click', this._onClick);

    // Start render loop
    this._draw();
  }

  // ── Event handlers ──────────────────────────────────────────────────────

  _handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this._mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    this._mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    this.hoveredElement = this._hitTest(this._mouseX, this._mouseY);
    this.canvas.style.cursor = this.hoveredElement ? 'pointer' : 'default';
  }

  _handleClick() {
    if (this.hoveredElement) {
      this.selectedElement = this.hoveredElement;
      if (this.onSelect) this.onSelect(this.selectedElement);
    }
  }

  _hitTest(mx, my) {
    for (const cell of this._cells) {
      if (mx >= cell.x && mx <= cell.x + cell.w && my >= cell.y && my <= cell.y + cell.h) {
        return cell.elem;
      }
    }
    return null;
  }

  // ── Highlight methods ───────────────────────────────────────────────────

  highlightGroup(groupNum) {
    this._highlightMode = 'group';
    this._highlightValue = groupNum;
  }

  highlightPeriod(periodNum) {
    this._highlightMode = 'period';
    this._highlightValue = periodNum;
  }

  highlightCategory(categoryName) {
    this._highlightMode = 'category';
    this._highlightValue = categoryName;
  }

  highlightTrend(trendName) {
    this._highlightMode = 'trend';
    this._highlightValue = trendName;
  }

  clearHighlight() {
    this._highlightMode = null;
    this._highlightValue = null;
  }

  // ── Rendering ───────────────────────────────────────────────────────────

  _getCellColor(cell) {
    if (this._highlightMode === 'trend') {
      return this._getTrendColor(cell.elem);
    }
    const baseColor = CATEGORIES[cell.elem.category] || '#555';
    if (!this._highlightMode) return baseColor;

    let match = false;
    if (this._highlightMode === 'group') {
      match = (cell.pos.col + 1) === this._highlightValue;
    } else if (this._highlightMode === 'period') {
      const period = cell.pos.row < 8 ? cell.pos.row + 1 : (cell.pos.row === 8 ? 6 : 7);
      match = period === this._highlightValue;
    } else if (this._highlightMode === 'category') {
      match = cell.elem.category === this._highlightValue;
    }
    return match ? baseColor : this._dimColor(baseColor, 0.2);
  }

  _dimColor(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
  }

  _getTrendColor(elem) {
    const trend = this._highlightValue;
    const propMap = {
      electronegativity: 'electronegativity',
      atomicRadius: 'atomicRadius',
      ionizationEnergy: 'ionizationEnergy',
      atomicMass: 'mass',
    };
    const prop = propMap[trend];
    if (!prop) return '#555';

    const val = elem[prop];
    if (val == null) return '#333';

    // Compute min/max across all elements for this property
    if (!this._trendRange || this._trendRangeProp !== trend) {
      let min = Infinity, max = -Infinity;
      for (const e of ELEMENTS) {
        const v = e[prop];
        if (v != null) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
      this._trendRange = { min, max };
      this._trendRangeProp = trend;
    }

    const { min, max } = this._trendRange;
    const t = max > min ? (val - min) / (max - min) : 0.5;

    // Gradient: deep blue (low) -> cyan -> yellow -> red (high)
    let r, g, b;
    if (t < 0.33) {
      const s = t / 0.33;
      r = Math.round(30 * (1 - s) + 0 * s);
      g = Math.round(60 * (1 - s) + 200 * s);
      b = Math.round(200 * (1 - s) + 220 * s);
    } else if (t < 0.66) {
      const s = (t - 0.33) / 0.33;
      r = Math.round(0 * (1 - s) + 255 * s);
      g = Math.round(200 * (1 - s) + 220 * s);
      b = Math.round(220 * (1 - s) + 50 * s);
    } else {
      const s = (t - 0.66) / 0.34;
      r = Math.round(255 * (1 - s) + 240 * s);
      g = Math.round(220 * (1 - s) + 60 * s);
      b = Math.round(50 * (1 - s) + 30 * s);
    }
    return `rgb(${r},${g},${b})`;
  }

  _draw() {
    if (!this._running) return;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    // Draw cells
    for (const cell of this._cells) {
      const isHovered = this.hoveredElement && this.hoveredElement.number === cell.elem.number;
      const isSelected = this.selectedElement && this.selectedElement.number === cell.elem.number;
      const color = this._getCellColor(cell);

      // Cell background
      const radius = 4;
      ctx.beginPath();
      ctx.roundRect(cell.x, cell.y, cell.w, cell.h, radius);
      ctx.fillStyle = color;
      ctx.globalAlpha = isHovered ? 1.0 : 0.82;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Border
      if (isSelected) {
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (isHovered) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Atomic number (top-left)
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(cell.elem.number, cell.x + 3, cell.y + 3);

      // Symbol (center)
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cell.elem.symbol, cell.x + cell.w / 2, cell.y + cell.h / 2 - 2);

      // Name (bottom, truncated)
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font = '7px sans-serif';
      ctx.textBaseline = 'bottom';
      const displayName = cell.elem.name.length > 8 ? cell.elem.name.slice(0, 7) + '.' : cell.elem.name;
      ctx.fillText(displayName, cell.x + cell.w / 2, cell.y + cell.h - 2);
    }

    // Labels for lanthanide/actinide rows
    ctx.fillStyle = '#8d6e63';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const lnRow = this._cells.find(c => c.elem.number === 57);
    if (lnRow) ctx.fillText('La-Lu', lnRow.x - 6, lnRow.y + this.cellH / 2);
    ctx.fillStyle = '#78909c';
    const acRow = this._cells.find(c => c.elem.number === 89);
    if (acRow) ctx.fillText('Ac-Lr', acRow.x - 6, acRow.y + this.cellH / 2);

    // Hover popup
    if (this.hoveredElement) {
      this._drawPopup(this.hoveredElement);
    }

    requestAnimationFrame(() => this._draw());
  }

  _drawPopup(elem) {
    const ctx = this.ctx;
    const W = this.canvas.width;

    const popW = 220;
    const popH = 165;
    let popX = this._mouseX + 16;
    let popY = this._mouseY - 10;

    // Keep popup on-screen
    if (popX + popW > W - 4) popX = this._mouseX - popW - 16;
    if (popY + popH > this.canvas.height - 4) popY = this.canvas.height - popH - 4;
    if (popY < 4) popY = 4;

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Background
    ctx.beginPath();
    ctx.roundRect(popX, popY, popW, popH, 8);
    ctx.fillStyle = '#111122';
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Accent border
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Category color bar
    const catColor = CATEGORIES[elem.category] || '#555';
    ctx.fillStyle = catColor;
    ctx.fillRect(popX + 8, popY + 8, 4, popH - 16);

    // Content
    const tx = popX + 20;
    let ty = popY + 22;
    const lineH = 19;

    // Symbol + Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(elem.symbol, tx, ty);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`  ${elem.name}`, tx + ctx.measureText(elem.symbol).width + 2, ty);
    ty += lineH + 4;

    // Details
    const details = [
      ['Atomic #:', `${elem.number}`],
      ['Mass:', `${elem.mass} u`],
      ['Category:', elem.category.replace(/-/g, ' ')],
      ['EN:', elem.electronegativity != null ? `${elem.electronegativity}` : 'N/A'],
      ['Radius:', `${elem.atomicRadius} pm`],
      ['IE:', `${elem.ionizationEnergy} kJ/mol`],
    ];

    ctx.font = '11px sans-serif';
    for (const [label, value] of details) {
      ctx.fillStyle = '#88aacc';
      ctx.fillText(label, tx, ty);
      ctx.fillStyle = '#dddddd';
      ctx.fillText(value, tx + 68, ty);
      ty += lineH - 4;
    }

    // Electron config at bottom
    ty += 2;
    ctx.fillStyle = '#00d4ff';
    ctx.font = '10px monospace';
    ctx.fillText(elem.electronConfig, tx, ty);
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  stop() {
    this._running = false;
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('click', this._onClick);
    this.canvas.style.cursor = 'default';
  }
}

// ─── Register ──────────────────────────────────────────────────────────────

registerSim('periodicTable', (canvas) => new PeriodicTableSim(canvas));
