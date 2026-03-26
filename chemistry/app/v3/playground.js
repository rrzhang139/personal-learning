/**
 * Playground — molecules + orbital view integrated.
 * Click an atom to see its orbitals. ESC to exit orbital view.
 */
import { Stage } from './canvas/Stage.js';
import { TextLabel } from './canvas/TextLabel.js';
import { Element } from './core/Element.js';
import { Atom } from './core/Atom.js';
import { Molecule } from './core/Molecule.js';
import { ProximityBonder } from './core/ProximityBonder.js';
import { OrbitalView } from './orbitals/OrbitalView.js';

let orbitalView = null;  // non-null when orbital view is active
let orbitalAtom = null;

async function init() {
  const canvas = document.getElementById('stage');
  const stage = new Stage(canvas);

  const status = new TextLabel({
    text: 'Loading...', x: 450, y: 480, font: '13px monospace', color: '#666',
  });
  stage.sceneGraph.add(status);
  stage.start();

  try {
    await Element.load('./data/elements.json');
    status.text = 'Add atoms and drag together, or click a molecule. Click an atom to see its orbitals!';
  } catch (err) {
    status.text = 'ERROR: ' + err.message;
    console.error(err);
    return;
  }

  const bonder = new ProximityBonder(stage, (bond) => {
    status.text = `Bonded! ${bond.atomA.element.symbol}—${bond.atomB.element.symbol}. Click an atom to see orbitals.`;
  });

  // --- Overlays ---
  stage.sceneGraph.overlays.push(() => {
    // Skip if orbital view is active
    if (orbitalView) return;
    bonder.update();
    bonder.applyRigidBody(stage.interaction.dragTarget);
  });
  stage.sceneGraph.overlays.push((ctx) => {
    if (orbitalView) return;
    bonder.renderHint(ctx);
  });

  // --- Orbital view overlay ---
  stage.sceneGraph.overlays.push((ctx, time) => {
    if (!orbitalView) return;
    orbitalView.renderFrame(ctx, time);
  });

  // --- Click → orbital view ---
  stage.interaction.onClick = (obj) => {
    if (orbitalView) return; // already in orbital view
    if (obj instanceof Atom) {
      enterOrbitalView(obj);
    }
  };

  function enterOrbitalView(atom) {
    orbitalAtom = atom;
    orbitalView = new OrbitalView(canvas, { Z: atom.element.Z });
    // Hide all molecule objects
    for (const obj of stage.sceneGraph.objects) {
      if (obj !== status) obj._savedVisible = obj.visible;
      if (obj !== status) obj.visible = false;
    }
    status.text = `Orbital view: ${atom.element.name} (Z=${atom.element.Z}). Press ESC or click background to exit.`;
  }

  function exitOrbitalView() {
    if (!orbitalView) return;
    orbitalView.stop();
    orbitalView = null;
    orbitalAtom = null;
    // Restore molecule objects
    for (const obj of stage.sceneGraph.objects) {
      if (obj._savedVisible !== undefined) {
        obj.visible = obj._savedVisible;
        delete obj._savedVisible;
      }
    }
    status.text = 'Click an atom to see orbitals. Drag atoms together to bond.';
  }

  // ESC to exit orbital view
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') exitOrbitalView();
  });
  // Click background to exit
  canvas.addEventListener('click', (e) => {
    if (!orbitalView) return;
    // Let orbital view handle filter button clicks first
    const rect = canvas.getBoundingClientRect();
    const my = ((e.clientY - rect.top) / rect.height) * 500;
    if (my > 440) return; // filter button area
    exitOrbitalView();
  });

  // --- Helpers ---
  function addAtom(symbol) {
    if (orbitalView) return;
    const el = Element.get(symbol);
    if (!el) return;
    const atom = new Atom(el, 120 + Math.random() * 660, 60 + Math.random() * 320);
    stage.sceneGraph.add(atom);
    bonder.addAtom(atom);
    status.text = `${el.name} — click to see orbitals, or drag near another atom to bond.`;
  }

  function loadMolecule(formula) {
    if (orbitalView) exitOrbitalView();
    clearAll();
    try {
      const mol = Molecule.create(formula, 450, 230);
      for (const bond of mol.bonds) {
        stage.sceneGraph.add(bond);
        bonder.addBond(bond);
      }
      for (const atom of mol.atoms) {
        stage.sceneGraph.add(atom);
        bonder.addAtom(atom);
      }
      const geo = mol.geometry ? ` — ${mol.geometry.name} (${mol.geometry.bondAngleDeg}°)` : '';
      status.text = `${formula}${geo}. Click any atom to see its orbitals!`;
    } catch (err) {
      status.text = `Error: ${err.message}`;
    }
  }

  function clearAll() {
    stage.sceneGraph.objects = [status];
    bonder.clear();
  }

  function getAllAtoms() {
    return stage.sceneGraph.objects.filter(o => o instanceof Atom);
  }

  // --- Toolbar ---
  document.querySelector('.toolbar').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    if (!action) return;

    if (action.startsWith('add-')) addAtom(action.slice(4));
    if (action.startsWith('mol-')) loadMolecule(action.slice(4));

    if (action === 'toggle-cloud') {
      const atoms = getAllAtoms();
      const on = atoms.length ? !atoms[0].cloudVisible : true;
      btn.classList.toggle('active', on);
      for (const a of atoms) a.cloudVisible = on;
      for (const o of stage.sceneGraph.objects) {
        if (o.showCloud !== undefined && typeof o.showCloud !== 'function') o.showCloud = on;
      }
    }
    if (action === 'toggle-electrons') {
      const atoms = getAllAtoms();
      const on = atoms.length ? !atoms[0].electronsVisible : true;
      btn.classList.toggle('active', on);
      for (const a of atoms) a.electronsVisible = on;
    }
    if (action === 'toggle-float') {
      const atoms = getAllAtoms();
      const on = atoms.length ? !atoms[0].float : true;
      btn.classList.toggle('active', on);
      for (const a of atoms) a.float = on;
    }
    if (action === 'clear') {
      if (orbitalView) exitOrbitalView();
      clearAll();
      status.text = 'Cleared.';
    }
  });
}

init().catch(err => {
  console.error('Init failed:', err);
  const c = document.getElementById('stage');
  if (c) {
    const ctx = c.getContext('2d');
    c.width = 900; c.height = 500;
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 900, 500);
    ctx.fillStyle = '#ef5350'; ctx.font = '16px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Error: ' + err.message, 450, 250);
  }
});
