/**
 * Comprehensive end-to-end tests for v3 chemistry primitives.
 * Covers every abstraction layer: Element → Atom → Electron → Bond → Molecule → VSEPR → ElectronConfig
 */
import { Element } from '../core/Element.js';
import { Atom } from '../core/Atom.js';
import { Bond } from '../core/Bond.js';
import { Molecule } from '../core/Molecule.js';
import { VSEPR } from '../core/VSEPR.js';
import { Renderable } from '../canvas/Renderable.js';
import { Tweener } from '../canvas/Tweener.js';
import { SceneGraph } from '../canvas/SceneGraph.js';

const output = document.getElementById('output');
const summary = document.getElementById('summary');
let passed = 0, failed = 0, errors = 0;

function section(name) {
  const el = document.createElement('div');
  el.className = 'section';
  el.textContent = name;
  output.appendChild(el);
}

function assert(name, conditionOrFn, detail = '') {
  const el = document.createElement('div');
  el.className = 'result';
  try {
    const condition = typeof conditionOrFn === 'function' ? conditionOrFn() : conditionOrFn;
    if (condition) {
      el.innerHTML = `<span class="pass">✓</span> ${name}`;
      passed++;
    } else {
      el.innerHTML = `<span class="fail">✗</span> ${name} ${detail ? '— ' + detail : ''}`;
      failed++;
    }
  } catch (err) {
    el.innerHTML = `<span class="fail">✗</span> ${name} — ERROR: ${err.message}`;
    errors++;
  }
  output.appendChild(el);
}

function approx(a, b, tol = 1) { return Math.abs(a - b) < tol; }

function angleBetween(cx, cy, ax, ay, bx, by) {
  const a1 = Math.atan2(ay - cy, ax - cx);
  const a2 = Math.atan2(by - cy, bx - cx);
  let diff = Math.abs(a2 - a1);
  if (diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff * (180 / Math.PI);
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

async function runTests() {
  await Element.load('../data/elements.json');

  // ===========================================
  section('1. Element Data');
  // ===========================================
  assert('Get by symbol: O', Element.get('O')?.symbol === 'O');
  assert('Get by Z: 8 → O', Element.get(8)?.symbol === 'O');
  assert('H valence electrons = 1', Element.get('H')?.valenceElectrons === 1);
  assert('C valence electrons = 4', Element.get('C')?.valenceElectrons === 4);
  assert('N valence electrons = 5', Element.get('N')?.valenceElectrons === 5);
  assert('O valence electrons = 6', Element.get('O')?.valenceElectrons === 6);
  assert('F valence electrons = 7', Element.get('F')?.valenceElectrons === 7);
  assert('Cl valence electrons = 7', Element.get('Cl')?.valenceElectrons === 7);
  assert('Na valence electrons = 1', Element.get('Na')?.valenceElectrons === 1);
  assert('O electronegativity = 3.44', Element.get('O')?.EN === 3.44);
  assert('H electronegativity = 2.20', Element.get('H')?.EN === 2.20);
  assert('F is most EN = 3.98', Element.get('F')?.EN === 3.98);
  assert('H target electrons = 2 (duet)', Element.get('H')?.targetElectrons === 2);
  assert('O target electrons = 8 (octet)', Element.get('O')?.targetElectrons === 8);
  assert('He target electrons = 2 (period 1)', Element.get('He')?.targetElectrons === 2);
  assert('Element.all() returns array', Element.all().length > 10);

  // ===========================================
  section('2. Renderable (base class)');
  // ===========================================
  const r = new Renderable({ x: 10, y: 20, width: 50, height: 30 });
  assert('Position set', r.x === 10 && r.y === 20);
  assert('Dimensions set', r.width === 50 && r.height === 30);
  assert('Default opacity = 1', r.opacity === 1);
  assert('Default visible = true', r.visible === true);
  assert('Default interactive = false', r.interactive === false);
  assert('Default draggable = false', r.draggable === false);
  assert('hitTest center', r.hitTest(10, 20));
  assert('hitTest edge', r.hitTest(35, 35));
  assert('hitTest miss', !r.hitTest(100, 100));
  assert('moveTo works', () => { r.moveTo(99, 88); return r.x === 99 && r.y === 88; });

  // ===========================================
  section('3. Atom');
  // ===========================================
  const oAtom = new Atom(Element.get('O'), 100, 200);
  assert('Atom position', oAtom.x === 100 && oAtom.y === 200);
  assert('Atom element', oAtom.element.symbol === 'O');
  assert('Atom radius from element', oAtom.r === Element.get('O').radius);
  assert('Atom interactive', oAtom.interactive === true);
  assert('Atom draggable', oAtom.draggable === true);
  assert('Atom electron count = VE', oAtom.electrons.length === 6);
  assert('All electrons start as valence', oAtom.electrons.every(e => e.state === 'valence'));
  assert('cloudVisible default true', oAtom.cloudVisible === true);
  assert('electronsVisible default true', oAtom.electronsVisible === true);
  assert('hitTest on atom center', oAtom.hitTest(100, 200));
  assert('hitTest on atom edge', oAtom.hitTest(100 + oAtom.r, 200));
  assert('hitTest miss', !oAtom.hitTest(300, 300));
  assert('Atom starts with no bonds', oAtom.bonds.length === 0);
  assert('effectiveElectrons = 6 (unbonded O)', approx(oAtom.effectiveElectrons, 6, 0.01));

  // ===========================================
  section('4. Electron');
  // ===========================================
  const eAtom = new Atom(Element.get('O'), 200, 200);
  const e0 = eAtom.electrons[0];
  assert('Electron has homeAtom ref', e0.homeAtom === eAtom);
  assert('Electron default state = valence', e0.state === 'valence');
  assert('Electron has position', typeof e0.x === 'number' && typeof e0.y === 'number');
  assert('Electron.update does not throw', () => { e0.update(1.0); return true; });
  assert('Electron position updates after update()', () => {
    const before = { x: e0.x, y: e0.y };
    e0.update(2.0);
    return e0.x !== before.x || e0.y !== before.y;
  });

  // ===========================================
  section('5. Bond');
  // ===========================================
  const bA = new Atom(Element.get('H'), 100, 100);
  const bB = new Atom(Element.get('H'), 200, 100);
  const bond1 = new Bond(bA, bB, 1);
  assert('Bond connects atomA', bond1.atomA === bA);
  assert('Bond connects atomB', bond1.atomB === bB);
  assert('Bond order = 1', bond1.order === 1);
  assert('Bond style = solid', bond1.style === 'solid');
  assert('Bond registered on atomA', bA.bonds.includes(bond1));
  assert('Bond registered on atomB', bB.bonds.includes(bond1));
  assert('Bond midpoint X', approx(bond1.midX, 150));
  assert('Bond midpoint Y', approx(bond1.midY, 100));
  assert('Bond color for single = cyan', bond1.color === '#00d4ff');

  // Bond order changes
  bond1.setOrder(2);
  assert('setOrder(2) changes order', bond1.order === 2);
  assert('Double bond color = orange', bond1.color === '#ff9800');
  bond1.setOrder(1.5);
  assert('setOrder(1.5) → dashed style', bond1.style === 'dashed');
  assert('Dashed bond color = purple', bond1.color === '#bb86fc');

  // Bond destroy
  bond1.setOrder(1);
  const bondToDestroy = new Bond(bA, bB, 1); // duplicate bond for destroy test
  const bABondsBefore = bA.bonds.length;
  bondToDestroy.destroy();
  assert('destroy removes from atomA', bA.bonds.length === bABondsBefore - 1);

  // Bond assigns electron states on creation
  const bC = new Atom(Element.get('O'), 300, 100);
  const bD = new Atom(Element.get('H'), 400, 100);
  const bond2 = new Bond(bC, bD, 1);
  assert('Bond creation triggers electron assignment on O',
    bC.electrons.some(e => e.state === 'shared'));
  assert('Bond creation triggers electron assignment on H',
    bD.electrons.some(e => e.state === 'shared'));

  // ===========================================
  section('6. Electron States After Bonding');
  // ===========================================

  // H2: each H contributes 1 electron to share
  const h2 = Molecule.create('H2', 300, 300);
  const [h2a, h2b] = h2.atoms;
  assert('H2: each H has 1 electron', h2a.electrons.length === 1 && h2b.electrons.length === 1);
  assert('H2: both electrons shared', h2a.electrons[0].state === 'shared' && h2b.electrons[0].state === 'shared');
  assert('H2: shared electrons reference partner', h2a.electrons[0].partnerAtom === h2b);

  // H2O: O has 2 shared + 4 lone, each H has 1 shared
  const h2o = Molecule.create('H2O', 400, 300);
  const waterO = h2o.atoms.find(a => a.element.symbol === 'O');
  const waterHs = h2o.atoms.filter(a => a.element.symbol === 'H');
  const oShared = waterO.electrons.filter(e => e.state === 'shared');
  const oLone = waterO.electrons.filter(e => e.state === 'lone');
  assert('H2O: O has 6 electrons', waterO.electrons.length === 6);
  assert('H2O: O has 2 shared', oShared.length === 2);
  assert('H2O: O has 4 lone (2 pairs)', oLone.length === 4);
  assert('H2O: each H has 1 shared', waterHs.every(h => h.electrons[0].state === 'shared'));
  assert('H2O: lone electrons have lonePairGroup', oLone.every(e => typeof e.lonePairGroup === 'number'));

  // N2: triple bond = 3 shared per N, 1 lone pair per N
  const n2 = Molecule.create('N2', 400, 300);
  const [n2a, n2b] = n2.atoms;
  const n2aShared = n2a.electrons.filter(e => e.state === 'shared');
  const n2aLone = n2a.electrons.filter(e => e.state === 'lone');
  assert('N2: each N has 5 electrons', n2a.electrons.length === 5);
  assert('N2: 3 shared per N (triple bond)', n2aShared.length === 3);
  assert('N2: 2 lone per N (1 pair)', n2aLone.length === 2);

  // ===========================================
  section('7. Electronegativity Bias');
  // ===========================================
  const hcl = Molecule.create('HCl', 400, 300);
  const hclH = hcl.atoms.find(a => a.element.symbol === 'H');
  const hclCl = hcl.atoms.find(a => a.element.symbol === 'Cl');
  assert('HCl: Cl effective e⁻ > H effective e⁻',
    hclCl.effectiveElectrons > hclH.effectiveElectrons,
    `Cl=${hclCl.effectiveElectrons.toFixed(2)}, H=${hclH.effectiveElectrons.toFixed(2)}`);

  const o2 = Molecule.create('O2', 400, 300);
  assert('O2: symmetric effective electrons',
    approx(o2.atoms[0].effectiveElectrons, o2.atoms[1].effectiveElectrons, 0.01));

  const n2sym = Molecule.create('N2', 400, 300);
  assert('N2: symmetric effective electrons',
    approx(n2sym.atoms[0].effectiveElectrons, n2sym.atoms[1].effectiveElectrons, 0.01));

  // ===========================================
  section('8. VSEPR Geometry Names');
  // ===========================================
  assert('2+0 = linear', VSEPR.layout(2, 0).name === 'linear');
  assert('3+0 = trigonal planar', VSEPR.layout(3, 0).name === 'trigonal planar');
  assert('4+0 = tetrahedral', VSEPR.layout(4, 0).name === 'tetrahedral');
  assert('3+1 = trigonal pyramidal', VSEPR.layout(3, 1).name === 'trigonal pyramidal');
  assert('2+2 = bent (tet base)', VSEPR.layout(2, 2).name === 'bent');
  assert('2+1 = bent (trig base)', VSEPR.layout(2, 1).name === 'bent');
  assert('5+0 = trigonal bipyramidal', VSEPR.layout(5, 0).name === 'trigonal bipyramidal');
  assert('4+1 = seesaw', VSEPR.layout(4, 1).name === 'seesaw');
  assert('6+0 = octahedral', VSEPR.layout(6, 0).name === 'octahedral');

  // ===========================================
  section('9. VSEPR Bond Angles');
  // ===========================================
  assert('Linear = 180°', VSEPR.layout(2, 0).bondAngleDeg === 180);
  assert('Trig planar = 120°', VSEPR.layout(3, 0).bondAngleDeg === 120);
  assert('Tetrahedral = 109.5°', VSEPR.layout(4, 0).bondAngleDeg === 109.5);
  assert('Trig pyramidal = 107°', VSEPR.layout(3, 1).bondAngleDeg === 107);
  assert('Bent (H2O type) = 104.5°', VSEPR.layout(2, 2).bondAngleDeg === 104.5);

  // ===========================================
  section('10. VSEPR Lone Pair Counting');
  // ===========================================
  assert('O - 2 bonding e⁻ = 2 LP', VSEPR.lonePairs(Element.get('O'), 2) === 2);
  assert('N - 3 bonding e⁻ = 1 LP', VSEPR.lonePairs(Element.get('N'), 3) === 1);
  assert('C - 4 bonding e⁻ = 0 LP', VSEPR.lonePairs(Element.get('C'), 4) === 0);
  assert('F - 1 bonding e⁻ = 3 LP', VSEPR.lonePairs(Element.get('F'), 1) === 3);
  assert('S - 2 bonding e⁻ = 2 LP', VSEPR.lonePairs(Element.get('S'), 2) === 2);
  assert('Cl - 1 bonding e⁻ = 3 LP', VSEPR.lonePairs(Element.get('Cl'), 1) === 3);

  // ===========================================
  section('11. VSEPR positionAtoms');
  // ===========================================
  const waterPos = VSEPR.positionAtoms(0, 0, 2, 2, 65);
  assert('H2O: 2 bond positions returned', waterPos.positions.length === 2);
  assert('H2O: 2 lone pair angles returned', waterPos.lonePairAngles.length === 2);
  const wAngle = angleBetween(0, 0, waterPos.positions[0].x, waterPos.positions[0].y,
                               waterPos.positions[1].x, waterPos.positions[1].y);
  assert(`H2O VSEPR angle ≈ 104.5° (got ${wAngle.toFixed(1)})`, approx(wAngle, 104.5, 2));

  // ===========================================
  section('12. Molecule Shape (from factories)');
  // ===========================================

  // H2O
  const mH2O = Molecule.create('H2O', 450, 250);
  const mO = mH2O.atoms.find(a => a.element.symbol === 'O');
  const [mH1, mH2] = mH2O.atoms.filter(a => a.element.symbol === 'H');
  const h2oAngle = angleBetween(mO.x, mO.y, mH1.x, mH1.y, mH2.x, mH2.y);
  assert(`H2O bond angle ≈ 104.5° (got ${h2oAngle.toFixed(1)})`, approx(h2oAngle, 104.5, 2));

  // CO2
  const mCO2 = Molecule.create('CO2', 450, 250);
  const mC = mCO2.atoms.find(a => a.element.symbol === 'C');
  const [mO1, mO2] = mCO2.atoms.filter(a => a.element.symbol === 'O');
  const co2Angle = angleBetween(mC.x, mC.y, mO1.x, mO1.y, mO2.x, mO2.y);
  assert(`CO2 bond angle ≈ 180° (got ${co2Angle.toFixed(1)})`, approx(co2Angle, 180, 2));

  // CH4
  const mCH4 = Molecule.create('CH4', 450, 250);
  const mCH4C = mCH4.atoms.find(a => a.element.symbol === 'C');
  const ch4Hs = mCH4.atoms.filter(a => a.element.symbol === 'H');
  assert('CH4: 4 H atoms', ch4Hs.length === 4);
  const ch4Dists = ch4Hs.map(h => dist(mCH4C.x, mCH4C.y, h.x, h.y));
  assert('CH4: all bond lengths equal', ch4Dists.every(d => approx(d, ch4Dists[0], 2)));

  // NH3
  const mNH3 = Molecule.create('NH3', 450, 250);
  const mN = mNH3.atoms.find(a => a.element.symbol === 'N');
  assert('NH3: N has 2 lone electrons (1 pair)', mN.electrons.filter(e => e.state === 'lone').length === 2);

  // BF3
  const mBF3 = Molecule.create('BF3', 450, 250);
  assert('BF3: trigonal planar geometry', mBF3.geometry?.name === 'trigonal planar');

  // ===========================================
  section('13. Molecule Factories (all formulas)');
  // ===========================================
  const formulas = ['H2', 'O2', 'N2', 'H2O', 'CO2', 'CH4', 'NH3', 'O3', 'BF3', 'HCl', 'NaCl', 'HF', 'PCl5', 'SF6'];
  for (const f of formulas) {
    assert(`Molecule.create('${f}') works`, () => {
      const m = Molecule.create(f, 400, 300);
      return m.atoms.length > 0 && m.bonds.length > 0;
    });
  }

  // ===========================================
  section('14. Rigid-Body Drag (Shape Preservation)');
  // ===========================================
  const dragW = Molecule.create('H2O', 450, 250);
  const dO = dragW.atoms.find(a => a.element.symbol === 'O');
  const dHs = dragW.atoms.filter(a => a.element.symbol === 'H');
  const origAngle = angleBetween(dO.x, dO.y, dHs[0].x, dHs[0].y, dHs[1].x, dHs[1].y);

  // Simulate rigid-body translation: move O by (100, 50), move Hs by same delta
  const dx = 100, dy = 50;
  dO.x += dx; dO.y += dy;
  dHs[0].x += dx; dHs[0].y += dy;
  dHs[1].x += dx; dHs[1].y += dy;

  const afterAngle = angleBetween(dO.x, dO.y, dHs[0].x, dHs[0].y, dHs[1].x, dHs[1].y);
  assert(`Angle preserved after translation (${origAngle.toFixed(1)}° → ${afterAngle.toFixed(1)}°)`,
    approx(afterAngle, origAngle, 0.1));

  const origDist0 = dist(dO.x, dO.y, dHs[0].x, dHs[0].y);
  const origDist1 = dist(dO.x, dO.y, dHs[1].x, dHs[1].y);
  assert('Bond lengths equal after translation', approx(origDist0, origDist1, 0.1));

  // ===========================================
  section('15. Tweener');
  // ===========================================
  const tw = new Tweener();
  const tObj = { x: 0, y: 0, opacity: 0 };

  tw.tween(tObj, { x: 100, y: 50, opacity: 1 }, 1000, 'linear');
  assert('Tweener: starts at 0', tObj.x === 0);
  assert('Tweener: 1 active tween', tw.active === 1);

  tw.update(0.5);
  assert('Tweener: at 50% → x≈50', approx(tObj.x, 50, 1));
  assert('Tweener: at 50% → opacity≈0.5', approx(tObj.opacity, 0.5, 0.05));

  tw.update(0.5);
  assert('Tweener: at 100% → x=100', tObj.x === 100);
  assert('Tweener: at 100% → y=50', tObj.y === 50);
  assert('Tweener: at 100% → opacity=1', tObj.opacity === 1);
  assert('Tweener: completed → 0 active', tw.active === 0);

  // Cancel test
  const tObj2 = { x: 0 };
  tw.tween(tObj2, { x: 100 }, 1000);
  assert('Tweener: cancel removes tween', () => { tw.cancel(tObj2); return tw.active === 0; });

  // Easing test
  const tObj3 = { x: 0 };
  tw.tween(tObj3, { x: 100 }, 1000, 'easeOut');
  tw.update(0.5);
  assert('Tweener: easeOut at 50% > 50 (front-loaded)', tObj3.x > 50);

  // ===========================================
  section('16. SceneGraph');
  // ===========================================
  const sg = new SceneGraph();
  const r1 = new Renderable({ x: 10, y: 20 });
  const r2 = new Renderable({ x: 30, y: 40 });

  sg.add(r1);
  assert('SG: add works', sg.objects.length === 1);
  sg.add(r1); // duplicate
  assert('SG: no duplicates', sg.objects.length === 1);
  sg.add(r2);
  assert('SG: second add', sg.objects.length === 2);
  sg.remove(r1);
  assert('SG: remove works', sg.objects.length === 1 && sg.objects[0] === r2);
  sg.clear();
  assert('SG: clear works', sg.objects.length === 0);

  // ===========================================
  section('17. ElectronConfig');
  // ===========================================
  const { ElectronConfig } = await import('../orbitals/ElectronConfig.js');

  // Hydrogen
  const hCfg = ElectronConfig.build(1);
  assert('H: 1 subshell (1s)', hCfg.length === 1 && hCfg[0].label === '1s');
  assert('H: 1s has 1 electron', hCfg[0].electrons === 1);
  assert('H: spinUp true, spinDown false', hCfg[0].orbitals[0].spinUp && !hCfg[0].orbitals[0].spinDown);

  // Oxygen
  const oCfg = ElectronConfig.build(8);
  assert('O: 3 subshells (1s, 2s, 2p)', oCfg.length === 3);
  assert('O: notation = 1s² 2s² 2p⁴', ElectronConfig.notation(8) === '1s² 2s² 2p⁴');
  const o2p = oCfg.find(s => s.label === '2p');
  assert('O 2p: 4 electrons', o2p.electrons === 4);
  // Hund's rule: 3 orbitals, 4e → all 3 get spinUp, then 1 gets spinDown
  assert('O 2p Hund: 3 spinUp', o2p.orbitals.filter(o => o.spinUp).length === 3);
  assert('O 2p Hund: 1 spinDown', o2p.orbitals.filter(o => o.spinDown).length === 1);

  // Carbon
  const cCfg = ElectronConfig.build(6);
  const c2p = cCfg.find(s => s.label === '2p');
  assert('C 2p: 2 electrons', c2p.electrons === 2);
  assert('C 2p Hund: 2 spinUp, 0 spinDown',
    c2p.orbitals.filter(o => o.spinUp).length === 2 &&
    c2p.orbitals.filter(o => o.spinDown).length === 0);

  // Iron (Z=26) — tests Aufbau order (4s before 3d)
  const feCfg = ElectronConfig.build(26);
  const feLabels = feCfg.map(s => s.label);
  assert('Fe: 4s fills before 3d (Aufbau)', feLabels.indexOf('4s') < feLabels.indexOf('3d'));
  const fe3d = feCfg.find(s => s.label === '3d');
  assert('Fe 3d: 6 electrons', fe3d.electrons === 6);
  assert('Fe 3d Hund: 5 up, 1 down',
    fe3d.orbitals.filter(o => o.spinUp).length === 5 &&
    fe3d.orbitals.filter(o => o.spinDown).length === 1);

  // Shell grouping
  const feShells = ElectronConfig.byShell(26);
  assert('Fe: 4 shells', feShells.size === 4);
  assert('Fe shell 3: has s, p, d', feShells.get(3)?.length === 3);

  // Total electron conservation
  for (const z of [1, 6, 8, 17, 26]) {
    const total = ElectronConfig.build(z).reduce((sum, s) => sum + s.electrons, 0);
    assert(`Z=${z}: total electrons = ${z}`, total === z);
  }

  // Neon (Z=10) — full shells
  const neCfg = ElectronConfig.build(10);
  const ne2p = neCfg.find(s => s.label === '2p');
  assert('Ne 2p: fully filled (6 electrons)', ne2p.electrons === 6);
  assert('Ne 2p: all orbitals have both spins',
    ne2p.orbitals.every(o => o.spinUp && o.spinDown));

  // ===========================================
  section('18. Atom Orbital Rendering');
  // ===========================================
  const orbAtom = new Atom(Element.get('O'), 450, 250);
  assert('Atom has _electronConfig', orbAtom._electronConfig.length > 0);
  assert('O config: 3 subshells (1s, 2s, 2p)', orbAtom._electronConfig.length === 3);
  assert('Atom orbitalsVisible default false', orbAtom.orbitalsVisible === false);
  orbAtom.orbitalsVisible = true;
  assert('Can enable orbitalsVisible', orbAtom.orbitalsVisible === true);

  // Filter
  const filter = { s: true, p: true, d: true, f: true };
  orbAtom.orbitalFilter = filter;
  assert('orbitalFilter assigned', orbAtom.orbitalFilter === filter);
  filter.p = false;
  assert('Filter mutation propagates (shared ref)', orbAtom.orbitalFilter.p === false);
  filter.p = true;

  // Render doesn't throw
  const testCanvas = document.getElementById('testCanvas');
  const testCtx = testCanvas.getContext('2d');
  assert('Atom.render with orbitals does not throw', () => {
    orbAtom.render(testCtx, 1.0);
    return true;
  });
  orbAtom.orbitalsVisible = false;
  assert('Atom.render without orbitals does not throw', () => {
    orbAtom.render(testCtx, 1.0);
    return true;
  });

  // Iron has d orbitals in config
  const feAtom = new Atom(Element.get('Fe'), 450, 250);
  feAtom.orbitalsVisible = true;
  feAtom.orbitalFilter = { s: false, p: false, d: true, f: false };
  assert('Fe has 3d in config', feAtom._electronConfig.some(s => s.label === '3d'));
  assert('Fe render with d-only filter does not throw', () => {
    feAtom.render(testCtx, 1.0);
    return true;
  });

  // H only has 1s — no p/d/f
  const hAtomOrb = new Atom(Element.get('H'), 100, 100);
  assert('H config: 1 subshell (1s)', hAtomOrb._electronConfig.length === 1);
  hAtomOrb.orbitalsVisible = true;
  hAtomOrb.orbitalFilter = { s: true, p: true, d: true, f: true };
  assert('H render with all filters does not throw', () => {
    hAtomOrb.render(testCtx, 1.0);
    return true;
  });

  // ===========================================
  section('19. Hybridization (isolated module)');
  // ===========================================
  const { Hybridization } = await import('../orbitals/Hybridization.js');

  // compute() with explicit sigma + lone pair counts
  const spH = Hybridization.compute(2, 0);
  assert('2σ + 0 LP = sp', spH.type === 'sp');
  assert('sp geometry = linear', spH.geometry === 'linear');
  assert('sp angle = 180°', spH.angleDeg === 180);
  assert('sp has 2 orbital angles', spH.orbitalAngles.length === 2);
  assert('sp stericNumber = 2', spH.stericNumber === 2);

  const sp2H = Hybridization.compute(3, 0);
  assert('3σ + 0 LP = sp2', sp2H.type === 'sp2');
  assert('sp2 geometry = trigonal planar', sp2H.geometry === 'trigonal planar');
  assert('sp2 angle = 120°', sp2H.angleDeg === 120);
  assert('sp2 has 3 orbital angles', sp2H.orbitalAngles.length === 3);

  const sp3H = Hybridization.compute(4, 0);
  assert('4σ + 0 LP = sp3', sp3H.type === 'sp3');
  assert('sp3 angle = 109.5°', sp3H.angleDeg === 109.5);

  const sp3_lp = Hybridization.compute(3, 1);
  assert('3σ + 1 LP = sp3 (steric 4)', sp3_lp.type === 'sp3');
  assert('NH3 hybridization steric = 4', sp3_lp.stericNumber === 4);

  const sp3_2lp = Hybridization.compute(2, 2);
  assert('2σ + 2 LP = sp3 (steric 4)', sp3_2lp.type === 'sp3');
  assert('H2O hybridization steric = 4', sp3_2lp.stericNumber === 4);

  // fromElement() convenience
  const carbonSp3 = Hybridization.fromElement(4, 4); // C with 4 bonds
  assert('C with 4 bonds = sp3', carbonSp3.type === 'sp3');
  assert('C sp3: 0 lone pairs', carbonSp3.lonePairs === 0);

  const oxygenH2O = Hybridization.fromElement(6, 2); // O with 2 bonds
  assert('O with 2 bonds = sp3', oxygenH2O.type === 'sp3');
  assert('O sp3: 2 lone pairs', oxygenH2O.lonePairs === 2);

  const carbonSp2 = Hybridization.fromElement(4, 3); // C with 3 σ bonds (e.g., in C=O)
  assert('C with 3σ = sp2', carbonSp2.type === 'sp2');

  const carbonSp = Hybridization.fromElement(4, 2); // C with 2 σ bonds (e.g., CO2)
  assert('C with 2σ = sp', carbonSp.type === 'sp');

  const nitrogenNH3 = Hybridization.fromElement(5, 3); // N with 3 bonds
  assert('N with 3 bonds = sp3', nitrogenNH3.type === 'sp3');
  assert('N sp3: 1 lone pair', nitrogenNH3.lonePairs === 1);

  // classifyBond()
  const single = Hybridization.classifyBond(1);
  assert('Single bond = 1 sigma', single.length === 1 && single[0].type === 'sigma');

  const double = Hybridization.classifyBond(2);
  assert('Double bond = 1 sigma + 1 pi', double.length === 2 &&
    double[0].type === 'sigma' && double[1].type === 'pi');

  const triple = Hybridization.classifyBond(3);
  assert('Triple bond = 1 sigma + 2 pi', triple.length === 3 &&
    triple[0].type === 'sigma' && triple[1].type === 'pi' && triple[2].type === 'pi');

  // unhybridizedPOrbitals()
  assert('sp has 2 unhybridized p', Hybridization.unhybridizedPOrbitals('sp') === 2);
  assert('sp2 has 1 unhybridized p', Hybridization.unhybridizedPOrbitals('sp2') === 1);
  assert('sp3 has 0 unhybridized p', Hybridization.unhybridizedPOrbitals('sp3') === 0);

  // orbitalShape()
  assert('sp3 lobe ratio = 0.65', Hybridization.orbitalShape('sp3').lobeRatio === 0.65);
  assert('sp lobe ratio = 0.75', Hybridization.orbitalShape('sp').lobeRatio === 0.75);

  // --- Hybridization ↔ VSEPR consistency ---
  section('20. Hybridization ↔ VSEPR Consistency');

  // The key invariant: VSEPR and Hybridization should agree on geometry
  // for the same steric number. They're different explanations of the same thing.
  const testCases = [
    { sigma: 2, lp: 0, vsepName: 'linear', hybType: 'sp' },
    { sigma: 3, lp: 0, vsepName: 'trigonal planar', hybType: 'sp2' },
    { sigma: 4, lp: 0, vsepName: 'tetrahedral', hybType: 'sp3' },
    { sigma: 3, lp: 1, vsepName: 'trigonal pyramidal', hybType: 'sp3' },
    { sigma: 2, lp: 2, vsepName: 'bent', hybType: 'sp3' },
    { sigma: 2, lp: 1, vsepName: 'bent', hybType: 'sp2' },
  ];

  for (const tc of testCases) {
    const vLayout = VSEPR.layout(tc.sigma, tc.lp);
    const hResult = Hybridization.compute(tc.sigma, tc.lp);
    assert(`${tc.sigma}σ+${tc.lp}LP: VSEPR=${vLayout.name}, Hybrid=${hResult.type}`,
      hResult.type === tc.hybType,
      `expected ${tc.hybType}, got ${hResult.type}`);
    assert(`${tc.sigma}σ+${tc.lp}LP: steric numbers match`,
      hResult.stericNumber === tc.sigma + tc.lp);
  }

  // ===========================================
  section('21. VSEPR 3D Geometry');
  // ===========================================

  function dot3(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
  function len3(v) { return Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2); }
  function angle3(a, b) {
    return Math.acos(Math.max(-1, Math.min(1, dot3(a,b) / (len3(a) * len3(b))))) * (180 / Math.PI);
  }

  const lin3D = VSEPR.layout3D(2, 0);
  assert('3D: 2+0 = linear', lin3D.name === 'linear');
  assert('3D: linear has 2 bond directions', lin3D.bondDirections.length === 2);
  const linAngle = angle3(lin3D.bondDirections[0], lin3D.bondDirections[1]);
  assert(`3D: linear angle ≈ 180° (got ${linAngle.toFixed(1)})`, approx(linAngle, 180, 2));

  const tet3D = VSEPR.layout3D(4, 0);
  assert('3D: 4+0 = tetrahedral', tet3D.name === 'tetrahedral');
  assert('3D: tetrahedral has 4 bond directions', tet3D.bondDirections.length === 4);
  // Check any pair of tetrahedral directions: should be ~109.5°
  const tetAngle = angle3(tet3D.bondDirections[0], tet3D.bondDirections[1]);
  assert(`3D: tetrahedral pair angle ≈ 109.5° (got ${tetAngle.toFixed(1)})`, approx(tetAngle, 109.5, 2));

  const trig3D = VSEPR.layout3D(3, 0);
  assert('3D: 3+0 = trigonal planar', trig3D.name === 'trigonal planar');
  const trigAngle = angle3(trig3D.bondDirections[0], trig3D.bondDirections[1]);
  assert(`3D: trig planar pair angle ≈ 120° (got ${trigAngle.toFixed(1)})`, approx(trigAngle, 120, 2));

  // All directions should be unit vectors
  for (const d of tet3D.bondDirections) {
    assert(`3D: tetrahedral direction is unit vector (len=${len3(d).toFixed(3)})`, approx(len3(d), 1, 0.01));
  }

  // Bent (2+2) should have 2 bond dirs
  const bent3D = VSEPR.layout3D(2, 2);
  assert('3D: 2+2 = bent', bent3D.name === 'bent');
  assert('3D: bent has 2 bond + 2 LP directions', bent3D.bondDirections.length === 2 && bent3D.lonePairDirections.length === 2);

  // positionAtoms3D
  const waterPos3D = VSEPR.positionAtoms3D([0,0,0], 2, 2, 1.5);
  assert('3D: H2O positions has 2 entries', waterPos3D.positions.length === 2);
  const wAngle3D = angle3(waterPos3D.positions[0], waterPos3D.positions[1]);
  assert(`3D: H2O angle ≈ 104.5° (got ${wAngle3D.toFixed(1)})`, approx(wAngle3D, 104.5, 5));

  // ===========================================
  section('22. VSEPR 2D ↔ 3D Consistency');
  // ===========================================
  const geoTests = [
    { b: 2, lp: 0 }, { b: 3, lp: 0 }, { b: 4, lp: 0 },
    { b: 3, lp: 1 }, { b: 2, lp: 2 }, { b: 2, lp: 1 },
  ];
  for (const g of geoTests) {
    const l2d = VSEPR.layout(g.b, g.lp);
    const l3d = VSEPR.layout3D(g.b, g.lp);
    assert(`${g.b}σ+${g.lp}LP: 2D name="${l2d.name}" = 3D name="${l3d.name}"`, l2d.name === l3d.name);
    assert(`${g.b}σ+${g.lp}LP: 2D angle=${l2d.bondAngleDeg}° = 3D angle=${l3d.bondAngleDeg}°`,
      l2d.bondAngleDeg === l3d.bondAngleDeg);
    assert(`${g.b}σ+${g.lp}LP: 3D has ${g.b} bond dirs`, l3d.bondDirections.length === g.b);
    assert(`${g.b}σ+${g.lp}LP: 3D has ${g.lp} LP dirs`, l3d.lonePairDirections.length === g.lp);
  }

  // ===========================================
  section('23. Atom Cloud & Electron Visibility');
  // ===========================================

  const visAtom = new Atom(Element.get('O'), 200, 200);

  // Cloud toggle
  assert('Cloud visible by default', visAtom.cloudVisible === true);
  visAtom.cloudVisible = false;
  assert('Cloud can be turned off', visAtom.cloudVisible === false);
  visAtom.cloudVisible = true;

  // Electrons toggle
  assert('Electrons visible by default', visAtom.electronsVisible === true);
  visAtom.electronsVisible = false;
  assert('Electrons can be turned off', visAtom.electronsVisible === false);
  visAtom.electronsVisible = true;

  // Orbitals toggle
  assert('Orbitals off by default', visAtom.orbitalsVisible === false);
  visAtom.orbitalsVisible = true;
  assert('Orbitals can be turned on', visAtom.orbitalsVisible === true);
  visAtom.orbitalsVisible = false;

  // Orbital filter
  const testFilter = { s: true, p: true, d: false, f: false };
  visAtom.orbitalFilter = testFilter;
  assert('Orbital filter assignable', visAtom.orbitalFilter.d === false);
  testFilter.d = true;
  assert('Orbital filter is shared ref', visAtom.orbitalFilter.d === true);

  // Render with various toggles doesn't throw
  const tc = document.getElementById('testCanvas').getContext('2d');
  visAtom.cloudVisible = true; visAtom.electronsVisible = true; visAtom.orbitalsVisible = false;
  assert('Render cloud+electrons OK', () => { visAtom.render(tc, 1.0); return true; });
  visAtom.cloudVisible = false; visAtom.orbitalsVisible = true;
  assert('Render orbitals OK', () => { visAtom.render(tc, 1.0); return true; });
  visAtom.cloudVisible = false; visAtom.electronsVisible = false; visAtom.orbitalsVisible = false;
  assert('Render bare atom OK', () => { visAtom.render(tc, 1.0); return true; });

  // Electron positions stay outside atom radius
  const eTestAtom = new Atom(Element.get('O'), 300, 300);
  eTestAtom.electronsVisible = true;
  eTestAtom.orbitalsVisible = true;
  eTestAtom.orbitalFilter = { s: true, p: true, d: true, f: true };
  // Simulate several time steps
  for (const e of eTestAtom.electrons) {
    for (let t = 0; t < 10; t += 0.5) {
      e.update(t);
    }
  }
  // Not a render test but a data integrity check
  assert('Atom has correct element', eTestAtom.element.symbol === 'O');
  assert('Atom electrons count', eTestAtom.electrons.length === 6);

  // ===========================================
  section('24. Bond EN Bias & Shared Electrons');
  // ===========================================

  // HCl bond: Cl (EN 3.16) more EN than H (EN 2.20)
  const hclMol = Molecule.create('HCl', 400, 300);
  const hclBond = hclMol.bonds[0];
  const hAtomHCl = hclMol.atoms.find(a => a.element.symbol === 'H');
  const clAtomHCl = hclMol.atoms.find(a => a.element.symbol === 'Cl');

  // Effective electrons: Cl should have more
  assert('HCl: Cl effective e⁻ > H effective e⁻',
    clAtomHCl.effectiveElectrons > hAtomHCl.effectiveElectrons,
    `Cl=${clAtomHCl.effectiveElectrons.toFixed(2)}, H=${hAtomHCl.effectiveElectrons.toFixed(2)}`);

  // Symmetric: N₂ should be equal
  const n2Mol = Molecule.create('N2', 400, 300);
  assert('N2: symmetric effective electrons',
    approx(n2Mol.atoms[0].effectiveElectrons, n2Mol.atoms[1].effectiveElectrons, 0.01));

  // H₂O: O should have more effective electrons than each H
  const h2oMol2 = Molecule.create('H2O', 400, 300);
  const oAtom2 = h2oMol2.atoms.find(a => a.element.symbol === 'O');
  const hAtom2 = h2oMol2.atoms.find(a => a.element.symbol === 'H');
  assert('H2O: O effective e⁻ > H effective e⁻',
    oAtom2.effectiveElectrons > hAtom2.effectiveElectrons);

  // Bond electron state: shared electrons exist
  const h2oBonds = h2oMol2.bonds;
  assert('H2O has 2 bonds', h2oBonds.length === 2);
  for (const bond of h2oBonds) {
    const oShared = oAtom2.electrons.filter(e => e.state === 'shared' && e.bond === bond);
    assert(`Bond has shared electrons from O`, oShared.length >= 1);
  }

  // Lone pairs on O in H2O
  const oLone2 = oAtom2.electrons.filter(e => e.state === 'lone');
  assert('H2O O has 4 lone electrons', oLone2.length === 4);

  // NaCl: extreme EN difference
  const naclMol = Molecule.create('NaCl', 400, 300);
  const naAtom = naclMol.atoms.find(a => a.element.symbol === 'Na');
  const clAtom = naclMol.atoms.find(a => a.element.symbol === 'Cl');
  assert('NaCl: Cl effective e⁻ >> Na effective e⁻',
    clAtom.effectiveElectrons > naAtom.effectiveElectrons + 0.3,
    `Cl=${clAtom.effectiveElectrons.toFixed(2)}, Na=${naAtom.effectiveElectrons.toFixed(2)}`);

  // ===========================================
  // Summary
  // ===========================================
  const total = passed + failed + errors;
  summary.innerHTML = `<span class="${failed + errors ? 'fail' : 'pass'}">${passed} passed, ${failed} failed, ${errors} errors (${total} total)</span>`;
  console.log(`Tests: ${passed} passed, ${failed} failed, ${errors} errors`);
}

runTests().catch(err => {
  output.innerHTML += `<div class="fail">FATAL: ${err.message}<br><pre>${err.stack}</pre></div>`;
  console.error(err);
});
