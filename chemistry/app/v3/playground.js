/**
 * Playground — interactive test for v3 chemistry primitives.
 */
import { Stage } from './canvas/Stage.js';
import { TextLabel } from './canvas/TextLabel.js';
import { Element } from './core/Element.js';
import { Atom } from './core/Atom.js';
import { Molecule } from './core/Molecule.js';
import { ProximityBonder } from './core/ProximityBonder.js';

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
    status.text = 'Add atoms and drag them together to bond — or click a molecule preset!';
  } catch (err) {
    status.text = 'ERROR: ' + err.message;
    console.error(err);
    return;
  }

  const bonder = new ProximityBonder(stage, (bond) => {
    status.text = `Bonded! ${bond.atomA.element.symbol}—${bond.atomB.element.symbol}. Watch the electrons shuttle!`;
  });

  // Every frame: proximity hints + spring physics for ALL bonds
  stage.sceneGraph.overlays.push(() => {
    bonder.update();
    bonder.applySpringPhysics(stage.interaction.dragTarget);
  });
  stage.sceneGraph.overlays.push((ctx) => {
    bonder.renderHint(ctx);
  });

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
      for (const bond of mol.bonds) {
        stage.sceneGraph.add(bond);
        bonder.addBond(bond);
      }
      for (const atom of mol.atoms) {
        stage.sceneGraph.add(atom);
        bonder.addAtom(atom);
      }
      const ens = mol.atoms.map(a => `${a.element.symbol}(${a.element.EN})`).join(' · ');
      status.text = `${formula} — EN: ${ens}. Drag an atom — the rest follow!`;
    } catch (err) {
      status.text = `Error: ${err.message}`;
      console.error(err);
    }
  }

  function clearAll() {
    stage.sceneGraph.objects = [status];
    bonder.clear();
  }

  function getAllAtoms() {
    return stage.sceneGraph.objects.filter(o => o instanceof Atom);
  }

  // Toolbar
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
      // Also toggle bond clouds
      for (const o of stage.sceneGraph.objects) {
        if (o.showCloud !== undefined && typeof o.showCloud !== 'function') {
          o.showCloud = on;
        }
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
