# Special Relativity Essay — Part 2 Specs

## Part 2: Consequences and Constraints

Part 1 builds the framework: postulates -> simultaneity -> time dilation -> length contraction -> the interval -> Lorentz transformation. Part 2 explores what the framework *means*.

---

## Sections

### Section 8: Light Cone Structure
- The light cone as a geometric object in spacetime
- Future light cone, past light cone, "elsewhere"
- Events inside the cone are causally connected; events outside are not
- Visual: interactive light cone from an event. Drag the event around. Show which other events are inside/outside the cone.
- The light cone is *invariant* under Lorentz transformations — this is what the transformation *protects*

### Section 9: Causality
- Why faster-than-light travel breaks causality
- If you could send a signal outside the light cone, there exists a frame where the reply arrives before the question
- Visual: show a superluminal signal. Lorentz-boost the diagram. Watch cause and effect reverse.
- The light cone is not just geometry — it's the boundary of what can influence what

### Section 10: Relativistic Momentum and Energy
- Start with Newton's p = mv. Show it fails at high speed (momentum should go to infinity as v -> c)
- Relativistic momentum: p = gamma * mv. The gamma factor again.
- Kinetic energy: expand gamma in a Taylor series. First term: mc². That's the rest energy.
- E² = (pc)² + (mc²)² — the full energy-momentum relation
- Visual: plot E vs p. Show the parabolic Newtonian approximation vs the hyperbolic relativistic curve. Show how they converge at low v.
- E = mc²: set p = 0. Rest energy. A stationary object has energy proportional to its mass.
- Visual: show a nuclear reaction. Mass before vs mass after. The missing mass became kinetic energy.

### Section 11: Paradoxes Resolved
- **Twin paradox**: one twin stays, one flies out and back. The traveling twin ages less. Why isn't it symmetric? Because the traveling twin *accelerates* (changes frames). Show on a spacetime diagram: the traveling twin's worldline is kinked. The stay-at-home twin's worldline is straight. Straight worldlines maximize proper time.
- Visual: spacetime diagram with both worldlines. Show proper time ticking along each. The kinked path accumulates less proper time.
- **Barn-pole paradox**: a pole longer than the barn fits inside when moving? Yes — because "fits inside" means "both ends inside simultaneously," and simultaneity is relative. Alice (barn frame) says both doors close at the same time with the pole inside. Bob (pole frame) says the front door opens before the back door closes.
- Visual: worldtube diagram showing the pole's worldtube passing through the barn's worldtube. Alice's horizontal slice vs Bob's tilted slice.
- **Ladder paradox variant**: similar resolution via simultaneity

### Section 12: Four-Vectors and Invariants (optional, advanced)
- Position four-vector: (ct, x, y, z)
- Momentum four-vector: (E/c, px, py, pz)
- The dot product of four-vectors is invariant — same rule as the interval
- This is the deep structure: special relativity is about what stays the same, not what changes

---

## Visual Tools Needed (beyond Part 1)

- **Draggable events**: click and drag events on the spacetime diagram
- **Lorentz boost slider**: smoothly animate the transformation of the entire diagram as beta changes
- **Energy-momentum plot**: standard 2D plot with curves
- **Proper time ticker**: dots moving along worldlines at proper-time intervals, showing different accumulated times
- **Nuclear reaction diagram**: before/after mass comparison

## Notes
- Each section should follow the same essay format as Part 1: text paragraphs with embedded interactive canvas visuals
- Reuse all Part 1 tools (grid, worldline, lightcone, coordinates, labels, etc.)
- The Lorentz boost slider could be added retroactively to Part 1 scenes too
