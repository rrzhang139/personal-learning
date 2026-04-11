/**
 * Unified 3D Chemistry Playground.
 *
 * All features from 2D playground + 3D orbital viewer in one scene:
 * - Add atoms (3D spheres), drag to bond, VSEPR auto-arrange
 * - Molecule presets with correct 3D geometry
 * - Rigid-body drag (whole molecule moves)
 * - Electron particles orbiting within orbital shapes
 * - Cloud / Orbital / Electron toggles
 * - s/p/d/f filter for orbital visibility
 * - Orbit camera (drag background), zoom (scroll)
 */
import { Element } from './core/Element.js';
import { ElectronConfig } from './orbitals/ElectronConfig.js';
import { SceneManager } from './three/SceneManager.js';
import { Atom3D } from './three/Atom3D.js';
import { Molecule3D } from './three/Molecule3D.js';
import { DragController } from './three/DragController.js';
import { ProximityBonder3D } from './three/ProximityBonder3D.js';

const orbitalFilter = { s: true, p: true, d: true, f: true };
const info = document.getElementById('info');

async function init() {
  await Element.load('./data/elements.json');

  const container = document.getElementById('container');
  const sm = new SceneManager(container);

  let selectedAtom = null;

  const drag = new DragController(sm.camera, sm.renderer.domElement, sm.controls);
  const bonder = new ProximityBonder3D(sm.scene, drag, (bond) => {
    info.textContent = `Bonded! ${bond.atomA.element.symbol}—${bond.atomB.element.symbol}`;
  });

  // Click to select/inspect an atom
  drag.onClick = (atom3d) => {
    if (selectedAtom === atom3d) {
      // Deselect
      deselectAll();
      info.textContent = 'Deselected. Drag atoms to bond.';
    } else {
      deselectAll();
      selectedAtom = atom3d;
      atom3d.setSelected(true);
      // Dim all other atoms
      for (const a of bonder.atoms) {
        if (a !== atom3d) a.setDimmed(true);
      }
      const el = atom3d.element;
      const config = ElectronConfig.notation(el.Z);
      info.textContent = `${el.name} (Z=${el.Z}) — EN: ${el.EN} — ${config}. Click again to deselect.`;
    }
  };

  function deselectAll() {
    if (selectedAtom) selectedAtom.setSelected(false);
    selectedAtom = null;
    for (const a of bonder.atoms) a.setDimmed(false);
  }

  // Update loop
  sm.onUpdate((time) => {
    bonder.update();
    bonder.applyRigidBody();
    // Update all bonds (reposition cylinders + shared electrons + cloud)
    for (const b of bonder.bonds) b.update(time);
    // Animate electrons on all atoms
    for (const a of bonder.atoms) a.updateElectrons(time);
  });

  sm.start();
  info.textContent = 'Add atoms and drag together to bond, or click a molecule preset!';

  // --- Helpers ---
  function addAtom(symbol) {
    const el = Element.get(symbol);
    if (!el) return;
    const x = (Math.random() - 0.5) * 4;
    const z = (Math.random() - 0.5) * 4;
    const atom = new Atom3D(el, [x, 0, z]);
    atom.orbitalFilter = orbitalFilter;
    sm.scene.add(atom.group);
    drag.addDraggable(atom.sphere);
    bonder.addAtom(atom);
    info.textContent = `${el.name} (Z=${el.Z}) — drag near another atom to bond!`;
  }

  function loadMolecule(formula) {
    clearAll();
    try {
      const mol = Molecule3D.create(formula, [0, 0, 0]);
      for (const bond of mol.bonds) {
        sm.scene.add(bond.group);
        bonder.addBond(bond);
        bond.update();
      }
      for (const atom of mol.atoms) {
        atom.orbitalFilter = orbitalFilter;
        sm.scene.add(atom.group);
        drag.addDraggable(atom.sphere);
        bonder.addAtom(atom);
      }
      const geo = mol.geometry ? ` — ${mol.geometry.name} (${mol.geometry.bondAngleDeg}°)` : '';
      info.textContent = `${formula}${geo}. Drag to move, orbit: drag background.`;
    } catch (err) {
      info.textContent = `Error: ${err.message}`;
      console.error(err);
    }
  }

  function clearAll() {
    for (const a of bonder.atoms) { sm.scene.remove(a.group); a.dispose(); }
    for (const b of bonder.bonds) { sm.scene.remove(b.group); }
    bonder.clear();
    drag.clearDraggables();
  }

  function getAllAtoms() { return bonder.atoms; }

  function refreshAll() {
    for (const a of getAllAtoms()) a.refresh();
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
      for (const a of atoms) { a.cloudVisible = on; a.refresh(); }
    }

    if (action === 'toggle-electrons') {
      const atoms = getAllAtoms();
      const on = atoms.length ? !atoms[0].electronsVisible : true;
      btn.classList.toggle('active', on);
      for (const a of atoms) { a.electronsVisible = on; a.refresh(); }
    }

    if (action === 'toggle-orbitals') {
      const atoms = getAllAtoms();
      const on = atoms.length ? !atoms[0].orbitalsVisible : true;
      btn.classList.toggle('active', on);
      for (const a of atoms) {
        a.orbitalsVisible = on;
        if (on) a.cloudVisible = false;
        a.refresh();
      }
      if (on) document.querySelector('[data-action="toggle-cloud"]')?.classList.remove('active');
    }

    if (action.startsWith('filter-')) {
      const type = action.slice(7);
      orbitalFilter[type] = !orbitalFilter[type];
      btn.classList.toggle('active', orbitalFilter[type]);
      refreshAll();
    }

    if (action === 'reset-view') {
      sm.camera.position.set(5, 4, 6);
      sm.controls.reset();
    }

    if (action === 'clear') {
      clearAll();
      info.textContent = 'Cleared.';
    }
  });
}

init().catch(err => {
  console.error('Init failed:', err);
  document.getElementById('info').textContent = 'Error: ' + err.message;
});
