/**
 * Playground — interactive test for v3 chemistry primitives.
 * Electrons orbit, clouds merge, spring physics pulls molecules.
 */
import { Stage } from './canvas/Stage.js';
import { TextLabel } from './canvas/TextLabel.js';
import { Element } from './core/Element.js';
import { Atom } from './core/Atom.js';
import { Molecule } from './core/Molecule.js';
import { ProximityBonder } from './core/ProximityBonder.js';

/** @type {Molecule|null} */
let currentMol = null;

async function init() {
  const canvas = document.getElementById('stage');
  const stage = new Stage(canvas);

  const status = new TextLabel({
    text: 'Loading elements...',
    x: 450, y: 480, font: '13px monospace', color: '#666',
  });
  stage.sceneGraph.add(status);
  stage.start();

  try {
    await Element.load('./data/elements.json');
    status.text = 'Click a molecule button, or add atoms and drag them together!';
  } catch (err) {
    status.text = 'ERROR: ' + err.message;
    console.error(err);
    return;
  }

  // Proximity bonder for free atoms
  const bonder = new ProximityBonder(stage, (bond) => {
    // After bond forms, reassign electrons
    bond.atomA._assignElectronStates();
    bond.atomB._assignElectronStates();
    status.text = `Bonded! ${bond.atomA.element.symbol}—${bond.atomB.element.symbol}. Electrons now shared — watch them shuttle!`;
  });

  // --- Overlays: proximity hints + spring physics ---
  stage.sceneGraph.overlays.push((ctx, time) => {
    bonder.update();
    bonder.renderHint(ctx);

    // Spring physics: if a molecule exists, pull connected atoms
    if (currentMol) {
      const dragged = stage.interaction.dragTarget;
      currentMol.applySpringPhysics(dragged, 0.04);
    }
  });

  // --- Helpers ---
  function addAtom(symbol) {
    const el = Element.get(symbol);
    if (!el) { status.text = `Unknown: ${symbol}`; return; }
    const atom = new Atom(el, 120 + Math.random() * 660, 60 + Math.random() * 320);
    stage.sceneGraph.add(atom);
    bonder.addAtom(atom);
    status.text = `${el.name} — EN: ${el.EN}, ${el.valenceElectrons} VE. Drag near another atom!`;
  }

  function loadMolecule(formula) {
    clearAll();
    try {
      const mol = Molecule.create(formula, 450, 230);
      currentMol = mol;
      for (const bond of mol.bonds) {
        stage.sceneGraph.add(bond);
        bonder.addBond(bond);
      }
      for (const atom of mol.atoms) {
        stage.sceneGraph.add(atom);
        bonder.addAtom(atom);
      }
      // Show EN comparison for polar bonds
      const ens = mol.atoms.map(a => `${a.element.symbol}(${a.element.EN})`).join(' · ');
      status.text = `${formula} — EN: ${ens}. Drag atoms — molecule follows!`;
    } catch (err) {
      status.text = `Error: ${err.message}`;
      console.error(err);
    }
  }

  function clearAll() {
    stage.sceneGraph.objects = [status];
    bonder.clear();
    currentMol = null;
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
      const on = !getAllAtoms()[0]?._showCloud;
      btn.classList.toggle('active', on);
      for (const a of getAllAtoms()) a.showCloud(on);
      for (const o of stage.sceneGraph.objects) {
        if (o.showCloud !== undefined) o.showCloud = on;
      }
    }
    if (action === 'toggle-electrons') {
      const on = !getAllAtoms()[0]?._showElectrons;
      btn.classList.toggle('active', on);
      for (const a of getAllAtoms()) a.showElectrons(on);
    }
    if (action === 'toggle-float') {
      const on = !getAllAtoms()[0]?.float;
      btn.classList.toggle('active', on);
      for (const a of getAllAtoms()) a.float = on;
    }
    if (action === 'tween-demo') {
      const atoms = getAllAtoms();
      if (!atoms.length) { status.text = 'Add atoms first!'; return; }
      const cx = 450, cy = 230, r = 150;
      atoms.forEach((a, i) => {
        const angle = (i / atoms.length) * Math.PI * 2 - Math.PI / 2;
        stage.tweener.tween(a, { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }, 800, 'easeOutBack');
      });
      setTimeout(() => {
        for (const a of atoms) {
          stage.tweener.tween(a, { x: 100 + Math.random() * 700, y: 60 + Math.random() * 340 }, 600, 'easeOutCubic');
        }
      }, 1500);
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
