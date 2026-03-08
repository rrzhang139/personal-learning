import { registerSim } from './registry.js';

/**
 * VseprViz - Interactive VSEPR molecular geometry visualizer
 *
 * Shows 3D-perspective molecular shapes with bond angles, lone pairs,
 * and geometry labels. Supports gentle rotation animation for a 3D feel.
 */
export class VseprViz {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = 900;
    this.canvas.height = 500;

    this.running = true;
    this.animTime = 0;

    // Layout constants
    this.bgColor = '#0a0a1a';
    this.sidebarWidth = 200;
    this.mainCx = this.sidebarWidth + (this.canvas.width - this.sidebarWidth) / 2;
    this.mainCy = this.canvas.height / 2 + 20;

    // Colors
    this.centralColor = '#00d4ff';
    this.surroundColor = '#d0d0d0';
    this.bondColor = '#ffffff';
    this.lonePairColor = 'rgba(180,80,220,';  // prefix for alpha
    this.angleColor = '#ff9800';
    this.bgPanel = 'rgba(255,255,255,0.03)';

    // Molecule data: positions defined as 3D unit vectors, projected with perspective
    this.molecules = this._buildMoleculeData();

    // Current selection
    this.currentMolecule = opts.molecule || 'CH4';
    this.hoveredButton = null;

    // Mouse interaction
    this._onClick = this._handleClick.bind(this);
    this._onMove = this._handleMove.bind(this);
    this.canvas.addEventListener('click', this._onClick);
    this.canvas.addEventListener('mousemove', this._onMove);

    this._animFrame = null;
    this._animate();
  }

  // ── Molecule Definitions ────────────────────────────────────────────

  _buildMoleculeData() {
    const cos = Math.cos, sin = Math.sin;
    const deg = a => a * Math.PI / 180;

    return {
      BeCl2: {
        name: 'BeCl\u2082',
        central: 'Be',
        surrounding: [
          { label: 'Cl', pos: [1, 0, 0] },
          { label: 'Cl', pos: [-1, 0, 0] },
        ],
        lonePairs: [],
        bondAngle: '180\u00b0',
        shapeName: 'Linear',
        electronGeometry: 'Linear',
        molecularGeometry: 'Linear',
        sameGeometry: true,
      },
      BF3: {
        name: 'BF\u2083',
        central: 'B',
        surrounding: [
          { label: 'F', pos: [0, -1, 0] },
          { label: 'F', pos: [cos(deg(210)), -sin(deg(210)), 0] },
          { label: 'F', pos: [cos(deg(330)), -sin(deg(330)), 0] },
        ],
        lonePairs: [],
        bondAngle: '120\u00b0',
        shapeName: 'Trigonal Planar',
        electronGeometry: 'Trigonal Planar',
        molecularGeometry: 'Trigonal Planar',
        sameGeometry: true,
      },
      CH4: {
        name: 'CH\u2084',
        central: 'C',
        surrounding: [
          { label: 'H', pos: [0, -1, 0] },
          { label: 'H', pos: [0.943, 0.333, 0] },
          { label: 'H', pos: [-0.471, 0.333, 0.816] },
          { label: 'H', pos: [-0.471, 0.333, -0.816] },
        ],
        lonePairs: [],
        bondAngle: '109.5\u00b0',
        shapeName: 'Tetrahedral',
        electronGeometry: 'Tetrahedral',
        molecularGeometry: 'Tetrahedral',
        sameGeometry: true,
      },
      NH3: {
        name: 'NH\u2083',
        central: 'N',
        surrounding: [
          { label: 'H', pos: [0.943, 0.333, 0] },
          { label: 'H', pos: [-0.471, 0.333, 0.816] },
          { label: 'H', pos: [-0.471, 0.333, -0.816] },
        ],
        lonePairs: [
          { pos: [0, -1, 0] },
        ],
        bondAngle: '107\u00b0',
        shapeName: 'Trigonal Pyramidal',
        electronGeometry: 'Tetrahedral',
        molecularGeometry: 'Trigonal Pyramidal',
        sameGeometry: false,
      },
      H2O: {
        name: 'H\u2082O',
        central: 'O',
        surrounding: [
          { label: 'H', pos: [0.943, 0.333, 0] },
          { label: 'H', pos: [-0.943, 0.333, 0] },
        ],
        lonePairs: [
          { pos: [0, -1, 0.4] },
          { pos: [0, -1, -0.4] },
        ],
        bondAngle: '104.5\u00b0',
        shapeName: 'Bent',
        electronGeometry: 'Tetrahedral',
        molecularGeometry: 'Bent',
        sameGeometry: false,
      },
      PCl5: {
        name: 'PCl\u2085',
        central: 'P',
        surrounding: [
          // Equatorial (3 atoms at 120 degrees in the horizontal plane)
          { label: 'Cl', pos: [1, 0, 0] },
          { label: 'Cl', pos: [-0.5, 0, 0.866] },
          { label: 'Cl', pos: [-0.5, 0, -0.866] },
          // Axial (top and bottom)
          { label: 'Cl', pos: [0, -1, 0] },
          { label: 'Cl', pos: [0, 1, 0] },
        ],
        lonePairs: [],
        bondAngle: '90\u00b0/120\u00b0',
        shapeName: 'Trigonal Bipyramidal',
        electronGeometry: 'Trigonal Bipyramidal',
        molecularGeometry: 'Trigonal Bipyramidal',
        sameGeometry: true,
      },
      SF6: {
        name: 'SF\u2086',
        central: 'S',
        surrounding: [
          { label: 'F', pos: [1, 0, 0] },
          { label: 'F', pos: [-1, 0, 0] },
          { label: 'F', pos: [0, 1, 0] },
          { label: 'F', pos: [0, -1, 0] },
          { label: 'F', pos: [0, 0, 1] },
          { label: 'F', pos: [0, 0, -1] },
        ],
        lonePairs: [],
        bondAngle: '90\u00b0',
        shapeName: 'Octahedral',
        electronGeometry: 'Octahedral',
        molecularGeometry: 'Octahedral',
        sameGeometry: true,
      },
    };
  }

  // ── 3D Projection Helpers ───────────────────────────────────────────

  /**
   * Rotate a 3D point around the Y axis by angle theta.
   */
  _rotateY(p, theta) {
    const c = Math.cos(theta), s = Math.sin(theta);
    return [
      p[0] * c + p[2] * s,
      p[1],
      -p[0] * s + p[2] * c,
    ];
  }

  /**
   * Project a 3D point to 2D with simple perspective.
   * Returns { x, y, z, scale } where scale indicates depth.
   */
  _project(p3d, cx, cy, radius) {
    const fov = 3.5; // perspective strength
    const scale = fov / (fov + p3d[2]);
    return {
      x: cx + p3d[0] * radius * scale,
      y: cy + p3d[1] * radius * scale,
      z: p3d[2],
      scale,
    };
  }

  // ── Animation Loop ──────────────────────────────────────────────────

  _animate() {
    if (!this.running) return;
    this.animTime += 0.008;
    this._draw();
    this._animFrame = requestAnimationFrame(() => this._animate());
  }

  // ── Main Draw ───────────────────────────────────────────────────────

  _draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, w, h);

    this._drawSidebar();
    this._drawMolecule();
  }

  // ── Sidebar ─────────────────────────────────────────────────────────

  _drawSidebar() {
    const ctx = this.ctx;
    const sw = this.sidebarWidth;
    const h = this.canvas.height;

    // Panel background
    ctx.fillStyle = this.bgPanel;
    ctx.fillRect(0, 0, sw, h);

    // Right border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sw, 0);
    ctx.lineTo(sw, h);
    ctx.stroke();

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Select Molecule', sw / 2, 30);

    // Molecule buttons
    const keys = Object.keys(this.molecules);
    const btnH = 46;
    const btnW = 170;
    const startY = 50;
    const btnX = (sw - btnW) / 2;

    this._buttonRects = [];

    keys.forEach((key, i) => {
      const mol = this.molecules[key];
      const by = startY + i * (btnH + 8);
      const isSelected = key === this.currentMolecule;
      const isHovered = key === this.hoveredButton;

      // Button background
      if (isSelected) {
        ctx.fillStyle = 'rgba(0,212,255,0.15)';
        ctx.strokeStyle = '#00d4ff';
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      }

      this._roundRect(ctx, btnX, by, btnW, btnH, 6);
      ctx.fill();
      ctx.stroke();

      // Molecule name
      ctx.fillStyle = isSelected ? '#00d4ff' : 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(mol.name, btnX + 12, by + 19);

      // Shape name
      ctx.fillStyle = isSelected ? 'rgba(0,212,255,0.7)' : 'rgba(255,255,255,0.45)';
      ctx.font = '11px "Segoe UI", Arial, sans-serif';
      ctx.fillText(mol.molecularGeometry, btnX + 12, by + 36);

      // Angle on the right
      ctx.fillStyle = isSelected ? 'rgba(255,152,0,0.9)' : 'rgba(255,255,255,0.35)';
      ctx.font = '11px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(mol.bondAngle, btnX + btnW - 10, by + 28);

      this._buttonRects.push({ key, x: btnX, y: by, w: btnW, h: btnH });
    });
  }

  // ── Molecule Renderer ───────────────────────────────────────────────

  _drawMolecule() {
    const ctx = this.ctx;
    const mol = this.molecules[this.currentMolecule];
    if (!mol) return;

    const cx = this.mainCx;
    const cy = this.mainCy;
    const radius = 130; // bond length in pixels
    const rotAngle = Math.sin(this.animTime) * 0.5; // gentle oscillation

    // Collect all items (atoms + lone pairs) with their projected positions
    const items = [];

    // Surrounding atoms
    mol.surrounding.forEach((atom, idx) => {
      const rotated = this._rotateY(atom.pos, rotAngle);
      const proj = this._project(rotated, cx, cy, radius);
      items.push({ type: 'atom', label: atom.label, proj, idx, rotated });
    });

    // Lone pairs
    mol.lonePairs.forEach((lp, idx) => {
      // Normalize lone pair position
      const len = Math.sqrt(lp.pos[0] ** 2 + lp.pos[1] ** 2 + lp.pos[2] ** 2);
      const normalized = lp.pos.map(v => v / len);
      const rotated = this._rotateY(normalized, rotAngle);
      const proj = this._project(rotated, cx, cy, radius * 0.75);
      items.push({ type: 'lonePair', proj, idx, rotated });
    });

    // Sort by z (back to front) for proper layering
    items.sort((a, b) => a.proj.z - b.proj.z);

    // Draw items back to front
    items.forEach(item => {
      if (item.type === 'atom') {
        this._drawBond(ctx, cx, cy, item.proj);
        this._drawSurroundingAtom(ctx, item.proj, item.label);
      } else {
        this._drawLonePair(ctx, cx, cy, item.proj);
      }
    });

    // Draw central atom on top
    this._drawCentralAtom(ctx, cx, cy, mol.central);

    // Draw bond angle arcs (between first two surrounding atoms)
    if (mol.surrounding.length >= 2) {
      this._drawAngleArc(ctx, cx, cy, mol, rotAngle, radius);
    }

    // Shape name label
    this._drawShapeLabel(ctx, mol);
  }

  // ── Bond Drawing ────────────────────────────────────────────────────

  _drawBond(ctx, cx, cy, proj) {
    const alpha = 0.4 + 0.6 * proj.scale;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 3 * proj.scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(proj.x, proj.y);
    ctx.stroke();
  }

  // ── Atom Drawing ────────────────────────────────────────────────────

  _drawCentralAtom(ctx, cx, cy, label) {
    const r = 22;

    // Glow
    const glow = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 2);
    glow.addColorStop(0, 'rgba(0,212,255,0.25)');
    glow.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Atom circle
    const grad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, r);
    grad.addColorStop(0, '#66e0ff');
    grad.addColorStop(0.6, '#00d4ff');
    grad.addColorStop(1, '#0099bb');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Outline
    ctx.strokeStyle = 'rgba(0,212,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy);
    ctx.textBaseline = 'alphabetic';
  }

  _drawSurroundingAtom(ctx, proj, label) {
    const baseR = 16;
    const r = baseR * proj.scale;
    const brightness = 0.4 + 0.6 * proj.scale;
    const bVal = Math.round(brightness * 208 + 47);
    const color = `rgb(${bVal},${bVal},${bVal})`;

    // Atom circle
    const grad = ctx.createRadialGradient(
      proj.x - 2 * proj.scale, proj.y - 2 * proj.scale, 1,
      proj.x, proj.y, r
    );
    grad.addColorStop(0, `rgba(255,255,255,${brightness.toFixed(2)})`);
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, `rgba(${Math.round(bVal * 0.6)},${Math.round(bVal * 0.6)},${Math.round(bVal * 0.6)},${brightness.toFixed(2)})`);

    ctx.beginPath();
    ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Outline
    ctx.strokeStyle = `rgba(255,255,255,${(brightness * 0.4).toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    ctx.fillStyle = `rgba(0,0,0,${brightness.toFixed(2)})`;
    ctx.font = `bold ${Math.round(11 * proj.scale)}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, proj.x, proj.y);
    ctx.textBaseline = 'alphabetic';
  }

  // ── Lone Pair Drawing ───────────────────────────────────────────────

  _drawLonePair(ctx, cx, cy, proj) {
    const alpha = 0.15 + 0.25 * proj.scale;
    const lobeR = 25 * proj.scale;

    // Draw the "line" from center to lobe
    ctx.strokeStyle = `rgba(180,80,220,${(alpha * 0.6).toFixed(2)})`;
    ctx.lineWidth = 2 * proj.scale;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(proj.x, proj.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Two small lobes side by side to represent lone pair
    const perpX = -(proj.y - cy);
    const perpY = (proj.x - cx);
    const perpLen = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
    const offset = lobeR * 0.45;
    const nx = perpX / perpLen * offset;
    const ny = perpY / perpLen * offset;

    for (const sign of [-1, 1]) {
      const lx = proj.x + sign * nx;
      const ly = proj.y + sign * ny;

      const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lobeR);
      grad.addColorStop(0, `rgba(200,100,255,${(alpha + 0.15).toFixed(2)})`);
      grad.addColorStop(0.5, `rgba(180,80,220,${alpha.toFixed(2)})`);
      grad.addColorStop(1, 'rgba(180,80,220,0)');

      ctx.beginPath();
      ctx.ellipse(lx, ly, lobeR, lobeR * 0.7, Math.atan2(proj.y - cy, proj.x - cx), 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Label
    ctx.fillStyle = `rgba(200,140,255,${(alpha + 0.2).toFixed(2)})`;
    ctx.font = `${Math.round(10 * proj.scale)}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('lone pair', proj.x, proj.y + lobeR + 12 * proj.scale);
  }

  // ── Angle Arc Drawing ──────────────────────────────────────────────

  _drawAngleArc(ctx, cx, cy, mol, rotAngle, radius) {
    // Draw angle between the first two surrounding atoms
    const a0 = this._rotateY(mol.surrounding[0].pos, rotAngle);
    const a1 = this._rotateY(mol.surrounding[1].pos, rotAngle);

    const p0 = this._project(a0, cx, cy, radius);
    const p1 = this._project(a1, cx, cy, radius);

    // Vectors from center to projected atom positions
    const v0x = p0.x - cx, v0y = p0.y - cy;
    const v1x = p1.x - cx, v1y = p1.y - cy;

    const angle0 = Math.atan2(v0y, v0x);
    const angle1 = Math.atan2(v1y, v1x);

    // Draw arc
    const arcR = 40;
    ctx.strokeStyle = this.angleColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();

    // Determine sweep direction (shortest arc)
    let start = angle0;
    let end = angle1;
    let diff = end - start;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    if (diff >= 0) {
      ctx.arc(cx, cy, arcR, start, start + diff);
    } else {
      ctx.arc(cx, cy, arcR, start, start + diff, true);
    }
    ctx.stroke();

    // Angle label at midpoint of arc
    const midAngle = start + diff / 2;
    const labelR = arcR + 16;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly = cy + Math.sin(midAngle) * labelR;

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.9;
    ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mol.bondAngle, lx, ly);
    ctx.textBaseline = 'alphabetic';

    ctx.globalAlpha = 1.0;
  }

  // ── Shape Label ─────────────────────────────────────────────────────

  _drawShapeLabel(ctx, mol) {
    const cx = this.mainCx;
    const topY = 35;

    // Main shape name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mol.shapeName} \u2014 ${mol.bondAngle}`, cx, topY);

    // Molecule formula
    ctx.fillStyle = this.centralColor;
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.fillText(mol.name, cx, topY + 25);

    // Electron geometry vs molecular geometry (if they differ)
    if (!mol.sameGeometry) {
      const geoY = this.canvas.height - 50;

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Electron Geometry:', cx - 90, geoY);
      ctx.fillStyle = 'rgba(200,140,255,0.9)';
      ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
      ctx.fillText(mol.electronGeometry, cx - 90, geoY + 17);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Molecular Geometry:', cx + 90, geoY);
      ctx.fillStyle = 'rgba(0,212,255,0.9)';
      ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
      ctx.fillText(mol.molecularGeometry, cx + 90, geoY + 17);

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, geoY - 5);
      ctx.lineTo(cx, geoY + 22);
      ctx.stroke();
    }

    // Lone pair count
    if (mol.lonePairs.length > 0) {
      ctx.fillStyle = 'rgba(200,140,255,0.7)';
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      const lpText = `${mol.lonePairs.length} lone pair${mol.lonePairs.length > 1 ? 's' : ''} on central atom`;
      ctx.fillText(lpText, cx, this.canvas.height - 15);
    }
  }

  // ── Mouse Interaction ───────────────────────────────────────────────

  _getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  _handleClick(e) {
    const { x, y } = this._getCanvasCoords(e);
    if (!this._buttonRects) return;

    for (const btn of this._buttonRects) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        this.setMolecule(btn.key);
        break;
      }
    }
  }

  _handleMove(e) {
    const { x, y } = this._getCanvasCoords(e);
    this.hoveredButton = null;

    if (!this._buttonRects) return;
    for (const btn of this._buttonRects) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        this.hoveredButton = btn.key;
        this.canvas.style.cursor = 'pointer';
        return;
      }
    }
    this.canvas.style.cursor = 'default';
  }

  // ── Utility ─────────────────────────────────────────────────────────

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Public API ──────────────────────────────────────────────────────

  /**
   * Switch to a different molecule.
   * @param {string} name - molecule key, e.g. 'CH4', 'H2O', 'NH3', 'BeCl2', 'BF3', 'PCl5', 'SF6'
   */
  setMolecule(name) {
    if (this.molecules[name]) {
      this.currentMolecule = name;
    }
  }

  /**
   * Stop the animation loop and clean up event listeners.
   */
  stop() {
    this.running = false;
    if (this._animFrame) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }
    this.canvas.removeEventListener('click', this._onClick);
    this.canvas.removeEventListener('mousemove', this._onMove);
  }
}

registerSim('vseprViz', (canvas, opts) => new VseprViz(canvas, opts));
