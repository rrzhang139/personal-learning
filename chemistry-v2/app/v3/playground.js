/**
 * Playground — molecules with orbital shapes rendered directly on atoms.
 * Toggle "Orbitals" to see s/p/d/f shapes centered on each atom.
 * Use s/p/d/f filter buttons to show/hide specific subshell types.
 */
import { Stage } from './canvas/Stage.js';
import { TextLabel } from './canvas/TextLabel.js';
import { Element } from './core/Element.js';
import { Atom } from './core/Atom.js';
import { Molecule } from './core/Molecule.js';
import { ProximityBonder } from './core/ProximityBonder.js';

// Shared orbital filter — all atoms reference this same object
const orbitalFilter = { s: true, p: true, d: true, f: true };

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
    status.text = 'Add atoms and drag together to bond. Toggle "Orbitals" to see subshell shapes!';
  } catch (err) {
    status.text = 'ERROR: ' + err.message;
    return;
  }

  const bonder = new ProximityBonder(stage, (bond) => {
    status.text = `Bonded! ${bond.atomA.element.symbol}—${bond.atomB.element.symbol}`;
  });

  stage.sceneGraph.overlays.push(() => {
    bonder.update();
    bonder.applyRigidBody(stage.interaction.dragTarget);
  });
  stage.sceneGraph.overlays.push((ctx) => {
    bonder.renderHint(ctx);
  });

  function addAtom(symbol) {
    const el = Element.get(symbol);
    if (!el) return;
    const atom = new Atom(el, 120 + Math.random() * 660, 60 + Math.random() * 320);
    atom.orbitalFilter = orbitalFilter;
    stage.sceneGraph.add(atom);
    bonder.addAtom(atom);
    status.text = `${el.name} (Z=${el.Z}) — ${el.valenceElectrons} VE. Drag near another atom to bond!`;
  }

  function loadMolecule(formula) {
    clearAll();
    try {
      const mol = Molecule.create(formula, 450, 230);
      for (const bond of mol.bonds) {
        stage.sceneGraph.add(bond);
        bonder.addBond(bond);
      }
      for (const atom of mol.atoms) {
        atom.orbitalFilter = orbitalFilter;
        stage.sceneGraph.add(atom);
        bonder.addAtom(atom);
      }
      const geo = mol.geometry ? ` — ${mol.geometry.name} (${mol.geometry.bondAngleDeg}°)` : '';
      status.text = `${formula}${geo}. Toggle "Orbitals" to see subshell shapes on each atom.`;
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

    if (action === 'toggle-orbitals') {
      const atoms = getAllAtoms();
      const on = atoms.length ? !atoms[0].orbitalsVisible : true;
      btn.classList.toggle('active', on);
      for (const a of atoms) a.orbitalsVisible = on;
      if (on) {
        // Turn off simple cloud when orbitals are on (orbitals replace the cloud)
        for (const a of atoms) a.cloudVisible = false;
        document.querySelector('[data-action="toggle-cloud"]')?.classList.remove('active');
      }
    }

    // s/p/d/f filter buttons
    if (action.startsWith('filter-')) {
      const type = action.slice(7); // 's', 'p', 'd', 'f'
      orbitalFilter[type] = !orbitalFilter[type];
      btn.classList.toggle('active', orbitalFilter[type]);
    }

    if (action === 'toggle-float') {
      const atoms = getAllAtoms();
      const on = atoms.length ? !atoms[0].float : true;
      btn.classList.toggle('active', on);
      for (const a of atoms) a.float = on;
    }

    if (action === 'clear') {
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
