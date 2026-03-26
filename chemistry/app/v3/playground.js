/**
 * Playground — test harness for the v3 chemistry primitives.
 * Drag atoms, build molecules, toggle VE dots / lone pairs, watch tweens.
 */
import { Stage } from './canvas/Stage.js';
import { Element } from './core/Element.js';
import { Atom } from './core/Atom.js';
import { Bond } from './core/Bond.js';
import { Molecule } from './core/Molecule.js';
import { TextLabel } from './canvas/TextLabel.js';

// --- State ---
let showDots = false;
let showLP = false;
let showFloat = false;
const allAtoms = [];     // track all atoms for toggles
const allBonds = [];

// --- Init ---
async function init() {
  await Element.load('./data/elements.json');

  const canvas = document.getElementById('stage');
  const stage = new Stage(canvas);
  stage.start();

  // Status label
  const status = new TextLabel({
    text: 'Drag atoms around. Click toolbar to add atoms or molecules.',
    x: 450, y: 480, font: '12px monospace', color: '#555',
  });
  stage.sceneGraph.add(status);

  // --- Toolbar actions ---
  document.querySelector('.toolbar').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;

    // Add single atom
    if (action?.startsWith('add-')) {
      const symbol = action.slice(4);
      const el = Element.get(symbol);
      if (!el) return;
      const x = 200 + Math.random() * 500;
      const y = 120 + Math.random() * 260;
      const atom = new Atom(el, x, y);
      atom.showVEDots(showDots);
      atom.float = showFloat;
      atom.opacity = 0;
      allAtoms.push(atom);
      stage.sceneGraph.add(atom);
      stage.tweener.tween(atom, { opacity: 1 }, 300, 'easeOut');
      status.text = `Added ${el.name} (${el.symbol}) — ${el.valenceElectrons} VE, EN ${el.EN}`;
    }

    // Add molecule
    if (action?.startsWith('mol-')) {
      const formula = action.slice(4);
      clearAll();
      const mol = Molecule.create(formula, 450, 250);
      for (const bond of mol.bonds) {
        allBonds.push(bond);
        bond.opacity = 0;
        stage.sceneGraph.add(bond);
        stage.tweener.tween(bond, { opacity: 1 }, 400, 'easeOut');
      }
      for (const atom of mol.atoms) {
        atom.showVEDots(showDots);
        atom.showLonePairs(showLP);
        atom.float = showFloat;
        atom.opacity = 0;
        allAtoms.push(atom);
        stage.sceneGraph.add(atom);
        stage.tweener.tween(atom, { opacity: 1 }, 400, 'easeOut');
      }
      status.text = `Built ${formula} — drag atoms to see bonds follow`;
    }

    // Toggle VE dots
    if (action === 'toggle-dots') {
      showDots = !showDots;
      btn.textContent = `VE Dots: ${showDots ? 'ON' : 'OFF'}`;
      btn.classList.toggle('active', showDots);
      for (const a of allAtoms) a.showVEDots(showDots);
    }

    // Toggle lone pairs
    if (action === 'toggle-lp') {
      showLP = !showLP;
      btn.textContent = `Lone Pairs: ${showLP ? 'ON' : 'OFF'}`;
      btn.classList.toggle('active', showLP);
      for (const a of allAtoms) a.showLonePairs(showLP);
    }

    // Toggle float
    if (action === 'toggle-float') {
      showFloat = !showFloat;
      btn.textContent = `Float: ${showFloat ? 'ON' : 'OFF'}`;
      btn.classList.toggle('active', showFloat);
      for (const a of allAtoms) a.float = showFloat;
    }

    // Tween demo
    if (action === 'tween-demo') {
      if (allAtoms.length === 0) {
        status.text = 'Add some atoms first!';
        return;
      }
      // Arrange in circle, then scatter
      const cx = 450, cy = 250, radius = 150;
      const n = allAtoms.length;
      // Phase 1: circle
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        stage.tweener.tween(allAtoms[i], {
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        }, 800, 'easeOutBack');
      }
      // Phase 2: scatter back after delay
      setTimeout(() => {
        for (const a of allAtoms) {
          stage.tweener.tween(a, {
            x: 100 + Math.random() * 700,
            y: 80 + Math.random() * 340,
          }, 600, 'easeOutCubic');
        }
      }, 1500);
      status.text = 'Tween: circle → scatter';
    }

    // Clear
    if (action === 'clear') {
      clearAll();
      status.text = 'Cleared. Add atoms or molecules to start.';
    }
  });

  function clearAll() {
    for (const b of allBonds) {
      b.destroy();
      stage.sceneGraph.objects = stage.sceneGraph.objects.filter(o => o !== b);
    }
    for (const a of allAtoms) {
      stage.sceneGraph.objects = stage.sceneGraph.objects.filter(o => o !== a);
    }
    allAtoms.length = 0;
    allBonds.length = 0;
  }
}

init();
