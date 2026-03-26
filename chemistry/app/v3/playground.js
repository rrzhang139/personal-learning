/**
 * Playground — interactive test for v3 chemistry primitives.
 */
import { Stage } from './canvas/Stage.js';
import { TextLabel } from './canvas/TextLabel.js';
import { Element } from './core/Element.js';
import { Atom } from './core/Atom.js';
import { Molecule } from './core/Molecule.js';
import { ProximityBonder } from './core/ProximityBonder.js';

let showDots = false;
let showLP = false;
let showFloat = false;

async function init() {
  const canvas = document.getElementById('stage');
  const stage = new Stage(canvas);

  // Status label (renders immediately as a sanity check)
  const status = new TextLabel({
    text: 'Loading elements...',
    x: 450, y: 480, font: '13px monospace', color: '#666',
  });
  stage.sceneGraph.add(status);
  stage.start();

  // Load element data
  try {
    await Element.load('./data/elements.json');
    status.text = 'Ready! Click toolbar buttons to add atoms, then drag them near each other.';
  } catch (err) {
    status.text = 'ERROR loading elements: ' + err.message;
    console.error('Element load failed:', err);
    return;
  }

  // Proximity bonder
  const bonder = new ProximityBonder(stage, (bond) => {
    status.text = `Bond created: ${bond.atomA.element.symbol}—${bond.atomB.element.symbol}`;
  });

  // Overlay for proximity hints (runs every frame)
  stage.sceneGraph.overlays.push((ctx) => {
    bonder.update();
    bonder.renderHint(ctx);
  });

  // --- Actions ---
  function addAtom(symbol) {
    const el = Element.get(symbol);
    if (!el) { status.text = `Unknown element: ${symbol}`; return; }
    const x = 120 + Math.random() * 660;
    const y = 60 + Math.random() * 320;
    const atom = new Atom(el, x, y);
    atom.showVEDots(showDots);
    atom.float = showFloat;
    stage.sceneGraph.add(atom);
    bonder.addAtom(atom);
    status.text = `Added ${el.name} (${el.symbol}) — ${el.valenceElectrons} VE, EN: ${el.EN}. Drag near another atom to bond!`;
  }

  function loadMolecule(formula) {
    clearAll();
    try {
      const mol = Molecule.create(formula, 450, 230);
      // Add bonds first (render behind atoms)
      for (const bond of mol.bonds) {
        stage.sceneGraph.add(bond);
        bonder.addBond(bond);
      }
      // Add atoms on top
      for (const atom of mol.atoms) {
        atom.showVEDots(showDots);
        atom.showLonePairs(showLP);
        atom.float = showFloat;
        stage.sceneGraph.add(atom);
        bonder.addAtom(atom);
      }
      status.text = `${formula} — drag any atom to see bonds follow!`;
    } catch (err) {
      status.text = `Error building ${formula}: ${err.message}`;
      console.error(err);
    }
  }

  function clearAll() {
    stage.sceneGraph.objects = [status]; // keep only status
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

    if (action === 'toggle-dots') {
      showDots = !showDots;
      btn.classList.toggle('active', showDots);
      for (const a of getAllAtoms()) a.showVEDots(showDots);
    }
    if (action === 'toggle-lp') {
      showLP = !showLP;
      btn.classList.toggle('active', showLP);
      for (const a of getAllAtoms()) a.showLonePairs(showLP);
    }
    if (action === 'toggle-float') {
      showFloat = !showFloat;
      btn.classList.toggle('active', showFloat);
      for (const a of getAllAtoms()) a.float = showFloat;
    }
    if (action === 'tween-demo') {
      const atoms = getAllAtoms();
      if (!atoms.length) { status.text = 'Add some atoms first!'; return; }
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
      status.text = 'Tween: circle → scatter';
    }
    if (action === 'clear') {
      clearAll();
      status.text = 'Cleared.';
    }
  });
}

init().catch(err => {
  console.error('Init failed:', err);
  const canvas = document.getElementById('stage');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = 900; canvas.height = 500;
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 900, 500);
    ctx.fillStyle = '#ef5350'; ctx.font = '16px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Error: ' + err.message, 450, 250);
  }
});
