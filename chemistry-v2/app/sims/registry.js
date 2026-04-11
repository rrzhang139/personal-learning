/** @type {Map<string, function(HTMLCanvasElement, Object): Object>} */
const registry = new Map();

export function registerSim(name, factory) {
  registry.set(name, factory);
}

export { registry };
