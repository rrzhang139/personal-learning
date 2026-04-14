import { registry } from './scenes/registry.js';
import { setupCanvas } from './tools/canvas-utils.js';

// Import all scenes (they self-register)
import './scenes/scene-firecracker.js';
import './scenes/scene-firecracker-alice.js';
import './scenes/scene-firecracker-bob.js';
import './scenes/scene-light-clock-bob.js';
import './scenes/scene-light-clock-alice.js';
import './scenes/scene-spacetime-intro.js';
import './scenes/scene-simultaneity.js';
import './scenes/scene-firecracker-sync.js';
import './scenes/scene-length-contract-bob.js';
import './scenes/scene-interval-math.js';

const CANVAS_HEIGHT = 420;

// Map from container element to { scene, config }
const sceneMap = new Map();

function mountScenes() {
  const containers = document.querySelectorAll('.viz-container[data-scene]');

  containers.forEach(container => {
    const sceneName = container.dataset.scene;
    const factory = registry.get(sceneName);
    if (!factory) {
      console.warn(`Scene "${sceneName}" not found in registry`);
      return;
    }

    const canvas = container.querySelector('canvas');
    if (!canvas) return;

    const opts = container.dataset.opts ? JSON.parse(container.dataset.opts) : {};
    const containerWidth = container.clientWidth;
    setupCanvas(canvas, containerWidth, opts.height || CANVAS_HEIGHT);

    const scene = factory(canvas, opts);
    sceneMap.set(container, scene);
    wireSlider(container, scene);
  });

  // Second pass: wire beta-from links
  wireBetaLinks();
}

function wireSlider(container, scene) {
  const sliderDiv = container.querySelector('.viz-slider');
  if (!sliderDiv) return;

  const label = sliderDiv.querySelector('.viz-slider-label');
  const range = sliderDiv.querySelector('.viz-range');
  const valueDisplay = sliderDiv.querySelector('.viz-slider-value');

  const config = scene.sliderConfig;
  if (!config) return;

  const steps = 1000;
  range.min = 0;
  range.max = steps;
  const defaultNorm = (config.default - config.min) / (config.max - config.min);
  range.value = Math.round(defaultNorm * steps);
  label.textContent = config.label;

  const format = config.format || (v => v.toFixed(2));
  valueDisplay.textContent = format(config.default);

  const sceneName = container.dataset.scene;

  function update(value) {
    scene.setValue(value);
    valueDisplay.textContent = format(value);
    if (scene.liveValues) {
      const vals = scene.liveValues();
      document.querySelectorAll(`.live-val[data-scene="${sceneName}"]`).forEach(span => {
        const key = span.dataset.key;
        if (key && vals[key] !== undefined) {
          span.textContent = vals[key];
        }
      });
    }
  }

  const syncGroup = container.dataset.sync;

  range.addEventListener('input', () => {
    const norm = range.value / steps;
    const value = config.min + norm * (config.max - config.min);
    update(value);

    // Sync: update all other containers in the same sync group
    if (syncGroup) {
      document.querySelectorAll(`.viz-container[data-sync="${syncGroup}"]`).forEach(other => {
        if (other === container) return;
        const otherRange = other.querySelector('.viz-range');
        if (otherRange && otherRange.value !== range.value) {
          otherRange.value = range.value;
          otherRange.dispatchEvent(new Event('input'));
        }
      });
    }

    // Push beta to any dependent scenes
    pushBeta(container);
  });

  update(config.default);
}

// Wire data-beta-from: when the source scene's slider changes,
// push the value as beta to the dependent scene
function wireBetaLinks() {
  document.querySelectorAll('.viz-container[data-beta-from]').forEach(depContainer => {
    const sourceId = depContainer.dataset.betaFrom;
    const sourceContainer = document.getElementById(sourceId);
    if (!sourceContainer) return;

    // Push initial beta from the source
    const sourceScene = sceneMap.get(sourceContainer);
    const depScene = sceneMap.get(depContainer);
    if (sourceScene && depScene && depScene.setBeta) {
      const sourceConfig = sourceScene.sliderConfig;
      const sourceRange = sourceContainer.querySelector('.viz-range');
      const norm = sourceRange.value / 1000;
      const beta = sourceConfig.min + norm * (sourceConfig.max - sourceConfig.min);
      depScene.setBeta(beta);

      // Show beta label on the dependent container
      const betaLabel = document.createElement('span');
      betaLabel.className = 'viz-beta-label';
      betaLabel.style.cssText = 'font-family: Crimson Text, Georgia, serif; font-size: 13px; font-style: italic; color: #6b5344; margin-left: 12px;';
      betaLabel.textContent = '(\u03B2 = ' + beta.toFixed(2) + ')';
      const sliderDiv = depContainer.querySelector('.viz-slider');
      if (sliderDiv) sliderDiv.appendChild(betaLabel);
    }
  });
}

function pushBeta(sourceContainer) {
  const sourceId = sourceContainer.id;
  if (!sourceId) return;

  document.querySelectorAll(`.viz-container[data-beta-from="${sourceId}"]`).forEach(depContainer => {
    const sourceScene = sceneMap.get(sourceContainer);
    const depScene = sceneMap.get(depContainer);
    if (!sourceScene || !depScene || !depScene.setBeta) return;

    const sourceConfig = sourceScene.sliderConfig;
    const sourceRange = sourceContainer.querySelector('.viz-range');
    const norm = sourceRange.value / 1000;
    const beta = sourceConfig.min + norm * (sourceConfig.max - sourceConfig.min);
    depScene.setBeta(beta);

    // Update beta label
    const betaLabel = depContainer.querySelector('.viz-beta-label');
    if (betaLabel) betaLabel.textContent = '(\u03B2 = ' + beta.toFixed(2) + ')';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  mountScenes();
});
