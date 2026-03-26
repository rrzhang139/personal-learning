# Feature Specs — Chemistry v3 App

This document is auto-updated by a Claude Code stop hook. Each section captures a user request and its implementation status.

---

## Completed Features

### 1. Canvas Engine (Renderable, Stage, SceneGraph, Tweener, InteractionManager)
- Full-screen canvas with RAF loop, DPI-aware coordinate mapping
- Base Renderable class with position, opacity, hitTest, draggable
- SceneGraph: ordered add/remove, overlay system
- Tweener: property animation with easing functions
- InteractionManager: mouse/touch → hover, click, drag detection

### 2. Chemistry Primitives (Element, Atom, Bond, Molecule)
- Element: lookup table from elements.json (20 elements, Z/symbol/EN/VE/color/radius)
- Atom: draggable, electron cloud, VE dots, lone pairs, formal charge, orbital shapes
- Bond: connects two atoms, order 1/1.5/2/3, auto-follows atoms, EN-biased shared cloud
- Molecule: factory with VSEPR-computed geometry for 14 formulas

### 3. Electron System
- Electron class: valence/lone/shared states
- Shared electrons shuttle between atoms biased by electronegativity
- Lone pairs position dynamically (VSEPR-aware gap detection, relative to current bonds)
- Electrons assigned orbital info (type, n, angle, size) for orbital-aware movement
- When orbitals visible: electrons move within their orbital shape boundaries

### 4. VSEPR Geometry Engine
- Computes molecular geometry from electron domain count (2–6 domains)
- Returns bond angles, lone pair angles, shape name
- Covers: linear, trig planar, tetrahedral, trig pyramidal, bent, seesaw, T-shaped, square planar, octahedral
- VSEPR.positionAtoms() places terminal atoms at computed angles
- VSEPR.lonePairs() counts lone pairs from valence electrons

### 5. Proximity Bonding (drag atoms together)
- Drag atom near another → green glow + hint line
- Release → bond forms + VSEPR auto-rearrangement of entire cluster
- Respects valence limits
- Rigid-body dragging: whole molecule translates preserving shape

### 6. Orbital Visualization (on atoms)
- ElectronConfig: Aufbau/Hund/Pauli filling for any Z
- OrbitalShape: 2D canvas drawing for s/p/d/f (sphere, dumbbell, cloverleaf, multi-lobe)
- All orbitals centered on nucleus, size scales with n
- s/p/d/f filter buttons in toolbar
- Orbitals rendered directly on atoms in molecule view (not separate page)

### 7. Hybridization Module (isolated)
- Hybridization.compute(sigma, lonePairs) → sp/sp2/sp3/sp3d/sp3d2
- Hybridization.fromElement(VE, sigmaBonds) → auto-calculates
- Hybridization.classifyBond(order) → sigma/pi classification
- HybridOrbitalShape: lopsided hybrid lobes, sigma sausage, pi lobes
- NOT yet wired into playground (pure computation + drawing ready)

### 8. Test Suite (80+ assertions)
- Covers all layers: Element → Atom → Electron → Bond → Molecule → VSEPR → ElectronConfig → Hybridization
- VSEPR ↔ Hybridization consistency tests

---

## Pending / Requested Features

### 9. Wire Hybridization into Playground
- Add "Hybrid" toggle to toolbar
- Replace pure orbital shapes with hybrid orbital shapes when enabled
- Show sigma/pi bonds visually (sausage + lobes)
- Electrons move within hybrid orbital boundaries

### 10. Audio Narration + Scene System
- Scene system: sequence of visual states with audio
- SceneRunner: plays scenes, handles transitions, audio sync
- AudioPlayer: MP3 playback with TTS fallback
- Lesson format: array of scenes (not complex stepMeta/buildSteps)

### 11. Storytelling Lessons (animation-first)
- All visuals, no text blocks
- One anchor molecule per lesson
- Visuals sync with narration (event-driven)
- Progressive reveal
- Short audio-based quizzes

---

## Conversation Log (auto-appended by stop hook)

<!-- STOP_HOOK_MARKER — new entries appended below this line -->

### 2025-03-25 — Unified 3D Playground
- Merged all 2D playground features into Three.js 3D scene (playground-3d.html)
- New three/ module: SceneManager, Atom3D, Bond3D, DragController, ProximityBonder3D, Molecule3D, OrbitalMeshFactory
- VSEPR.js extended with layout3D() + positionAtoms3D() — true 3D vectors (tetrahedral, trig planar, etc.)
- Raycasting drag on camera-perpendicular plane, orbit controls auto-disable during drag
- All bonds render as cylinders, update position dynamically
- 20+ new tests for VSEPR 3D geometry + 2D↔3D consistency
- 2D playground fully preserved (no changes to canvas/ or core/)

### 2025-03-25 — 3D Orbital Viewer + Hybridization Module
- Built Three.js 3D orbital viewer showing all three p dumbbells (px/py/pz) clearly in 3D space with rotation/zoom
- Added Hybridization.js (isolated): computes sp/sp2/sp3 from sigma+LP count, classifies sigma vs pi bonds
- Added HybridOrbitalShape.js: drawing for hybrid lobes, sigma sausage, pi lobes
- Orbital shapes now rendered on atoms in molecule playground with s/p/d/f filter
- Electrons move within their orbital boundaries (s=sphere wander, p=dumbbell oscillation, d=lobe hopping)
- 30+ new tests for hybridization + VSEPR consistency
- Set up FEATURE_SPECS.md + stop hook for auto-tracking feature requests
