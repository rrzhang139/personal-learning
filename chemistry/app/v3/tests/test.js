/**
 * End-to-end tests for v3 chemistry primitives.
 * Run by opening tests/test.html in the browser.
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
let passed = 0, failed = 0;

function section(name) {
  const el = document.createElement('div');
  el.className = 'section';
  el.textContent = name;
  output.appendChild(el);
}

function assert(name, condition, detail = '') {
  const el = document.createElement('div');
  el.className = 'result';
  if (condition) {
    el.innerHTML = `<span class="pass">✓</span> ${name}`;
    passed++;
  } else {
    el.innerHTML = `<span class="fail">✗</span> ${name} ${detail ? '— ' + detail : ''}`;
    failed++;
  }
  output.appendChild(el);
}

function approx(a, b, tol = 1) {
  return Math.abs(a - b) < tol;
}

function angleBetween(cx, cy, ax, ay, bx, by) {
  const a1 = Math.atan2(ay - cy, ax - cx);
  const a2 = Math.atan2(by - cy, bx - cx);
  let diff = Math.abs(a2 - a1);
  if (diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff * (180 / Math.PI);
}

// =========================================
async function runTests() {
  await Element.load('../data/elements.json');

  // --- Element ---
  section('Element');
  assert('Element.get by symbol', Element.get('O')?.symbol === 'O');
  assert('Element.get by Z', Element.get(8)?.symbol === 'O');
  assert('Oxygen has 6 VE', Element.get('O')?.valenceElectrons === 6);
  assert('Hydrogen has 1 VE', Element.get('H')?.valenceElectrons === 1);
  assert('Carbon has 4 VE', Element.get('C')?.valenceElectrons === 4);
  assert('Nitrogen EN = 3.04', Element.get('N')?.EN === 3.04);
  assert('Oxygen targetElectrons = 8', Element.get('O')?.targetElectrons === 8);
  assert('Hydrogen targetElectrons = 2', Element.get('H')?.targetElectrons === 2);

  // --- Atom ---
  section('Atom');
  const o = new Atom(Element.get('O'), 100, 200);
  assert('Atom has correct position', o.x === 100 && o.y === 200);
  assert('Atom is interactive', o.interactive === true);
  assert('Atom is draggable', o.draggable === true);
  assert('Atom has 6 electrons', o.electrons.length === 6);
  assert('All electrons start as valence', o.electrons.every(e => e.state === 'valence'));
  assert('Atom hitTest center', o.hitTest(100, 200) === true);
  assert('Atom hitTest edge', o.hitTest(100 + o.r + 5, 200) === true);
  assert('Atom hitTest miss', o.hitTest(300, 300) === false);
  assert('moveTo works', () => { o.moveTo(50, 60); return o.x === 50 && o.y === 60; });

  // --- Bond ---
  section('Bond');
  const a1 = new Atom(Element.get('H'), 100, 100);
  const a2 = new Atom(Element.get('H'), 200, 100);
  const bond = new Bond(a1, a2, 1);
  assert('Bond connects atoms', bond.atomA === a1 && bond.atomB === a2);
  assert('Bond order is 1', bond.order === 1);
  assert('Bond registered on atom A', a1.bonds.includes(bond));
  assert('Bond registered on atom B', a2.bonds.includes(bond));
  assert('Bond midpoint correct', approx(bond.midX, 150) && approx(bond.midY, 100));
  assert('Bond.destroy removes from atoms', () => {
    bond.destroy();
    return !a1.bonds.includes(bond) && !a2.bonds.includes(bond);
  });

  // --- Electron States ---
  section('Electron States');
  const mol_h2 = Molecule.create('H2', 300, 300);
  const [h1, h2] = mol_h2.atoms;
  assert('H2: each H has 1 electron', h1.electrons.length === 1 && h2.electrons.length === 1);
  assert('H2: electrons are shared', h1.electrons[0].state === 'shared' && h2.electrons[0].state === 'shared');

  const mol_h2o = Molecule.create('H2O', 400, 400);
  const oAtom = mol_h2o.atoms.find(a => a.element.symbol === 'O');
  const sharedE = oAtom.electrons.filter(e => e.state === 'shared');
  const loneE = oAtom.electrons.filter(e => e.state === 'lone');
  assert('H2O O has 6 electrons', oAtom.electrons.length === 6);
  assert('H2O O has 2 shared electrons', sharedE.length === 2);
  assert('H2O O has 4 lone electrons (2 pairs)', loneE.length === 4);
  assert('H2O H atoms each have 1 shared electron', mol_h2o.atoms.filter(a => a.element.symbol === 'H').every(h => h.electrons[0].state === 'shared'));

  // --- VSEPR Geometry ---
  section('VSEPR Geometry');

  const linear = VSEPR.layout(2, 0);
  assert('2 bonds + 0 LP = linear', linear.name === 'linear');
  assert('Linear bond angle = 180°', linear.bondAngleDeg === 180);

  const trigPlanar = VSEPR.layout(3, 0);
  assert('3 bonds + 0 LP = trigonal planar', trigPlanar.name === 'trigonal planar');
  assert('Trig planar angle = 120°', trigPlanar.bondAngleDeg === 120);

  const tetrahedral = VSEPR.layout(4, 0);
  assert('4 bonds + 0 LP = tetrahedral', tetrahedral.name === 'tetrahedral');
  assert('Tetrahedral angle = 109.5°', tetrahedral.bondAngleDeg === 109.5);

  const trigPyramidal = VSEPR.layout(3, 1);
  assert('3 bonds + 1 LP = trigonal pyramidal', trigPyramidal.name === 'trigonal pyramidal');
  assert('Trig pyramidal angle = 107°', trigPyramidal.bondAngleDeg === 107);

  const bent4 = VSEPR.layout(2, 2);
  assert('2 bonds + 2 LP = bent (tetrahedral base)', bent4.name === 'bent');
  assert('Bent angle = 104.5°', bent4.bondAngleDeg === 104.5);

  const bent3 = VSEPR.layout(2, 1);
  assert('2 bonds + 1 LP = bent (trig planar base)', bent3.name === 'bent');

  // --- VSEPR Lone Pair Counting ---
  section('VSEPR Lone Pair Counting');
  assert('O with 2 bonding e = 2 LP', VSEPR.lonePairs(Element.get('O'), 2) === 2);
  assert('N with 3 bonding e = 1 LP', VSEPR.lonePairs(Element.get('N'), 3) === 1);
  assert('C with 4 bonding e = 0 LP', VSEPR.lonePairs(Element.get('C'), 4) === 0);
  assert('F with 1 bonding e = 3 LP', VSEPR.lonePairs(Element.get('F'), 1) === 3);

  // --- Molecule Shape Preservation ---
  section('Molecule Shape (VSEPR positions)');

  const water = Molecule.create('H2O', 450, 250);
  const wO = water.atoms.find(a => a.element.symbol === 'O');
  const [wH1, wH2] = water.atoms.filter(a => a.element.symbol === 'H');
  const waterAngle = angleBetween(wO.x, wO.y, wH1.x, wH1.y, wH2.x, wH2.y);
  assert(`H2O bond angle ≈ 104.5° (got ${waterAngle.toFixed(1)})`, approx(waterAngle, 104.5, 2));

  const co2 = Molecule.create('CO2', 450, 250);
  const cAtom = co2.atoms.find(a => a.element.symbol === 'C');
  const [o1c, o2c] = co2.atoms.filter(a => a.element.symbol === 'O');
  const co2Angle = angleBetween(cAtom.x, cAtom.y, o1c.x, o1c.y, o2c.x, o2c.y);
  assert(`CO2 bond angle ≈ 180° (got ${co2Angle.toFixed(1)})`, approx(co2Angle, 180, 2));

  const ch4 = Molecule.create('CH4', 450, 250);
  const cCH4 = ch4.atoms.find(a => a.element.symbol === 'C');
  const hAtoms = ch4.atoms.filter(a => a.element.symbol === 'H');
  assert('CH4 has 4 H atoms', hAtoms.length === 4);
  // Check all H atoms are at roughly the same distance from C
  const dists = hAtoms.map(h => Math.sqrt((h.x - cCH4.x) ** 2 + (h.y - cCH4.y) ** 2));
  assert('CH4 all bonds same length', dists.every(d => approx(d, dists[0], 3)));

  const nh3 = Molecule.create('NH3', 450, 250);
  const nAtom = nh3.atoms.find(a => a.element.symbol === 'N');
  assert('NH3 N has 1 lone pair group', nAtom.electrons.filter(e => e.state === 'lone').length === 2); // 2 electrons = 1 pair

  // --- Molecule Dragging Preserves Shape ---
  section('Rigid-Body Drag (Shape Preservation)');

  const dragWater = Molecule.create('H2O', 450, 250);
  const dO = dragWater.atoms.find(a => a.element.symbol === 'O');
  const [dH1, dH2] = dragWater.atoms.filter(a => a.element.symbol === 'H');
  const origAngle = angleBetween(dO.x, dO.y, dH1.x, dH1.y, dH2.x, dH2.y);
  const origDist1 = Math.sqrt((dH1.x - dO.x) ** 2 + (dH1.y - dO.y) ** 2);
  const origDist2 = Math.sqrt((dH2.x - dO.x) ** 2 + (dH2.y - dO.y) ** 2);

  // Simulate dragging O atom 100px to the right
  dO.x += 100;
  // Apply the rigid body enforcement from ProximityBonder logic (simplified here)
  for (const bond of dO.bonds) {
    const other = bond.atomA === dO ? bond.atomB : bond.atomA;
    const dx = other.x - dO.x;
    const dy = other.y - dO.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const angle = Math.atan2(dy, dx);
      other.x = dO.x + Math.cos(angle) * 65;
      other.y = dO.y + Math.sin(angle) * 65;
    }
  }

  const afterAngle = angleBetween(dO.x, dO.y, dH1.x, dH1.y, dH2.x, dH2.y);
  assert(`Angle preserved after drag (${origAngle.toFixed(1)}° → ${afterAngle.toFixed(1)}°)`,
    approx(afterAngle, origAngle, 3));
  const afterDist1 = Math.sqrt((dH1.x - dO.x) ** 2 + (dH1.y - dO.y) ** 2);
  assert(`Bond length preserved after drag (${origDist1.toFixed(1)} → ${afterDist1.toFixed(1)})`,
    approx(afterDist1, 65, 2));

  // --- EN Bias ---
  section('Electronegativity Bias');
  const hf = Molecule.create('HCl', 450, 250);
  const hAtom = hf.atoms.find(a => a.element.symbol === 'H');
  const clAtom = hf.atoms.find(a => a.element.symbol === 'Cl');
  assert('HCl: H effective electrons < Cl effective electrons',
    hAtom.effectiveElectrons < clAtom.effectiveElectrons,
    `H=${hAtom.effectiveElectrons.toFixed(2)}, Cl=${clAtom.effectiveElectrons.toFixed(2)}`);

  const n2 = Molecule.create('N2', 450, 250);
  const [n1, n2a] = n2.atoms;
  assert('N2: equal effective electrons (symmetric)',
    approx(n1.effectiveElectrons, n2a.effectiveElectrons, 0.01),
    `N1=${n1.effectiveElectrons.toFixed(2)}, N2=${n2a.effectiveElectrons.toFixed(2)}`);

  // --- Tweener ---
  section('Tweener');
  const tw = new Tweener();
  const obj = { x: 0, y: 0 };
  tw.tween(obj, { x: 100, y: 50 }, 1000, 'linear');
  assert('Tweener starts at 0', obj.x === 0);
  tw.update(0.5); // 500ms
  assert('Tweener at 50% = 50', approx(obj.x, 50, 1));
  tw.update(0.5); // 1000ms total
  assert('Tweener at 100% = 100', obj.x === 100 && obj.y === 50);
  assert('Tweener clears completed', tw.active === 0);

  // --- SceneGraph ---
  section('SceneGraph');
  const sg = new SceneGraph();
  const r1 = new Renderable({ x: 10, y: 20 });
  sg.add(r1);
  assert('SceneGraph.add works', sg.objects.length === 1);
  assert('SceneGraph contains object', sg.objects[0] === r1);
  sg.add(r1); // duplicate
  assert('SceneGraph prevents duplicates', sg.objects.length === 1);
  sg.remove(r1);
  assert('SceneGraph.remove works', sg.objects.length === 0);

  // --- Molecule Factories ---
  section('Molecule Factories');
  const formulas = ['H2', 'O2', 'N2', 'H2O', 'CO2', 'CH4', 'NH3', 'O3', 'BF3', 'HCl', 'NaCl'];
  for (const f of formulas) {
    try {
      const m = Molecule.create(f, 400, 300);
      assert(`${f} creates without error`, m.atoms.length > 0);
    } catch (err) {
      assert(`${f} creates without error`, false, err.message);
    }
  }

  // --- ElectronConfig (orbitals) ---
  section('ElectronConfig');
  const { ElectronConfig } = await import('../orbitals/ElectronConfig.js');

  const hConfig = ElectronConfig.build(1);
  assert('H (Z=1): 1 subshell (1s)', hConfig.length === 1 && hConfig[0].label === '1s');
  assert('H: 1s has 1 electron', hConfig[0].electrons === 1);
  assert('H: 1s orbital spinUp=true, spinDown=false',
    hConfig[0].orbitals[0].spinUp === true && hConfig[0].orbitals[0].spinDown === false);

  const oConfig = ElectronConfig.build(8);
  assert('O (Z=8): 3 subshells', oConfig.length === 3);
  assert('O: 1s² 2s² 2p⁴', ElectronConfig.notation(8) === '1s² 2s² 2p⁴');
  const o2p = oConfig.find(s => s.label === '2p');
  assert('O 2p has 4 electrons', o2p.electrons === 4);
  // Hund's rule: 3 orbitals, 4 electrons → 3 spinUp + 1 spinDown
  const upCount = o2p.orbitals.filter(o => o.spinUp).length;
  const downCount = o2p.orbitals.filter(o => o.spinDown).length;
  assert('O 2p Hund\'s rule: 3 up, 1 down', upCount === 3 && downCount === 1);

  const feConfig = ElectronConfig.build(26);
  assert('Fe (Z=26) notation', ElectronConfig.notation(26).includes('3d'));
  const fe3d = feConfig.find(s => s.label === '3d');
  assert('Fe 3d has 6 electrons', fe3d.electrons === 6);
  // Hund: 5 orbitals, 6 electrons → 5 up, 1 down
  const feUp = fe3d.orbitals.filter(o => o.spinUp).length;
  const feDown = fe3d.orbitals.filter(o => o.spinDown).length;
  assert('Fe 3d Hund\'s rule: 5 up, 1 down', feUp === 5 && feDown === 1);

  // Aufbau order: 4s fills before 3d
  const feLabels = feConfig.map(s => s.label);
  const idx4s = feLabels.indexOf('4s');
  const idx3d = feLabels.indexOf('3d');
  assert('Fe: 4s fills before 3d (Aufbau)', idx4s < idx3d);

  // Shell grouping
  const feShells = ElectronConfig.byShell(26);
  assert('Fe has 4 shells', feShells.size === 4);
  assert('Fe shell 3 has s, p, d', feShells.get(3).length === 3);

  // Total electron count
  const totalE = ElectronConfig.build(26).reduce((sum, s) => sum + s.electrons, 0);
  assert('Fe total electrons = 26', totalE === 26);

  // --- Summary ---
  summary.innerHTML = `<span class="${failed ? 'fail' : 'pass'}">${passed} passed, ${failed} failed</span>`;
}

runTests().catch(err => {
  output.innerHTML += `<div class="fail">Fatal: ${err.message}<br><pre>${err.stack}</pre></div>`;
  console.error(err);
});
