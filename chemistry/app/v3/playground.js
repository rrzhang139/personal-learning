/**
 * Playground — interactive test for v3 chemistry primitives.
 *
 * - Add atoms, drag them around
 * - Drag atoms near each other → they glow → release to form a bond
 * - Build preset molecules, drag atoms to see bonds follow
 * - Toggle VE dots, lone pairs, float
 */
import { Stage } from './canvas/Stage.js';
import { TextLabel } from './canvas/TextLabel.js';
import { Element } from './core/Element.js';
import { Atom } from './core/Atom.js';
import { Bond } from './core/Bond.js';
import { Molecule } from './core/Molecule.js';
import { ProximityBonder } from './core/ProximityBonder.js';

// --- State ---
let showDots = false;
let showLP = false;
let showFloat = false;

async function init() {
  await Element.load('./data/elements.json');

  const canvas = document.getElementById('stage');
  const stage = new Stage(canvas);

  // Proximity bonder — the magic interaction layer
  const bonder = new ProximityBonder(stage, (bond) => {
    status.text = `Bond formed! ${bond.atomA.element.symbol}—${bond.atomB.element.symbol} (order ${bond.order})`;
  });

  // Register overlay for proximity hints
  stage.sceneGraph.overlays.push((ctx) => {
    bonder.update();
    bonder.renderHint(ctx);
  });

  // Status label
  const status = new TextLabel({
    text: 'Drag atoms near each other to form bonds!',
    x: 450, y: 485, font: '12px monospace', color: '#555',
  });
  stage.sceneGraph.add(status);

  stage.start();

  // --- Helpers ---
  function addAtom(symbol) {
    const el = Element.get(symbol);
    if (!el) return;
    const x = 150 + Math.random() * 600;
    const y = 80 + Math.random() * 300;
    const atom = new Atom(el, x, y);
    atom.showVEDots(showDots);
    atom.float = showFloat;
    atom.opacity = 0;
    stage.sceneGraph.add(atom);
    stage.tweener.tween(atom, { opacity: 1, scale: 1 }, 300, 'easeOutCubic');
    bonder.addAtom(atom);
    status.text = `${el.name} (${el.symbol}) — ${el.valenceElectrons} VE, EN ${el.EN}`;
  }

  function loadMolecule(formula) {
    clearAll();
    const mol = Molecule.create(formula, 450, 240);
    for (const bond of mol.bonds) {
      bond.opacity = 0;
      stage.sceneGraph.add(bond);
      stage.tweener.tween(bond, { opacity: 1 }, 400, 'easeOut');
      bonder.addBond(bond);
    }
    for (const atom of mol.atoms) {
      atom.showVEDots(showDots);
      atom.showLonePairs(showLP);
      atom.float = showFloat;
      atom.opacity = 0;
      stage.sceneGraph.add(atom);
      stage.tweener.tween(atom, { opacity: 1 }, 400, 'easeOut');
      bonder.addAtom(atom);
    }
    status.text = `${formula} — drag atoms to see bonds follow!`;
  }

  function clearAll() {
    // Remove everything except the status label
    stage.sceneGraph.objects = stage.sceneGraph.objects.filter(o => o === status);
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

    if (action.startsWith('add-')) {
      addAtom(action.slice(4));
    }

    if (action.startsWith('mol-')) {
      loadMolecule(action.slice(4));
    }

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
      const cx = 450, cy = 240, radius = 150;
      for (let i = 0; i < atoms.length; i++) {
        const angle = (i / atoms.length) * Math.PI * 2 - Math.PI / 2;
        stage.tweener.tween(atoms[i], {
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        }, 800, 'easeOutBack');
      }
      setTimeout(() => {
        for (const a of atoms) {
          stage.tweener.tween(a, {
            x: 100 + Math.random() * 700,
            y: 60 + Math.random() * 340,
          }, 600, 'easeOutCubic');
        }
      }, 1500);
      status.text = 'Tween: circle → scatter';
    }

    if (action === 'clear') {
      clearAll();
      status.text = 'Cleared. Add atoms and drag them near each other to bond!';
    }
  });
}

init();
