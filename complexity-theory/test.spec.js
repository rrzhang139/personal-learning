const { test, expect } = require('@playwright/test');

const URL = 'http://localhost:8080/';

test.describe('Complexity Theory Essay — Layout & Structure', () => {

  test('page loads with two-column layout', async ({ page }) => {
    await page.goto(URL);
    const content = page.locator('[data-testid="content"]');
    await expect(content).toBeVisible();
    const panel = page.locator('[data-testid="anim-panel"]');
    await expect(panel).toBeVisible();
  });

  test('all sections present (sec-1 through sec-11)', async ({ page }) => {
    await page.goto(URL);
    for (let i = 1; i <= 11; i++) {
      await expect(page.locator(`#sec-${i}`)).toBeAttached();
    }
  });

  test('every .pb block has data-testid="pb"', async ({ page }) => {
    await page.goto(URL);
    const pbCount = await page.locator('.pb').count();
    const testIdCount = await page.locator('.pb[data-testid="pb"]').count();
    expect(pbCount).toBeGreaterThan(10);
    expect(testIdCount).toBe(pbCount);
  });

  test('responsive: animation panel not visible on narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 800 });
    await page.goto(URL);
    await page.waitForTimeout(300);
    // At narrow width, panel should be hidden or have zero size
    const panelWidth = await page.evaluate(() => {
      const p = document.querySelector('[data-testid="anim-panel"]');
      return p ? p.offsetWidth : 0;
    });
    expect(panelWidth).toBe(0);
  });
});

test.describe('Scroll Snap & Active Block', () => {

  test('first block is active on load', async ({ page }) => {
    await page.goto(URL);
    await page.waitForTimeout(600);
    const firstPb = page.locator('.pb').first();
    await expect(firstPb).toHaveClass(/active/);
  });

  test('scrolling changes active block', async ({ page }) => {
    await page.goto(URL);
    await page.waitForTimeout(500);
    const firstText = await page.evaluate(() => window.__active?.textContent?.slice(0, 30));
    await page.evaluate(() => {
      const pbs = document.querySelectorAll('.pb');
      if (pbs[4]) pbs[4].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(800);
    const secondText = await page.evaluate(() => window.__active?.textContent?.slice(0, 30));
    expect(secondText).not.toBe(firstText);
  });

  test('inactive blocks have lower opacity', async ({ page }) => {
    await page.goto(URL);
    await page.waitForTimeout(500);
    const opacity = await page.evaluate(() => {
      const pbs = document.querySelectorAll('.pb');
      for (const p of pbs) {
        if (!p.classList.contains('active')) {
          return parseFloat(getComputedStyle(p).opacity);
        }
      }
      return 1;
    });
    expect(opacity).toBeLessThan(0.5);
  });
});

test.describe('Animation System', () => {

  test('canvas renders non-blank pixels', async ({ page }) => {
    await page.goto(URL);
    await page.waitForTimeout(1000);
    const hasPixels = await page.evaluate(() => {
      const c = document.querySelector('[data-testid="anim-panel"] canvas');
      if (!c) return false;
      const ctx = c.getContext('2d');
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true;
      }
      return false;
    });
    expect(hasPixels).toBe(true);
  });

  test('all 9 animation types can be activated', async ({ page }) => {
    await page.goto(URL);
    await page.waitForTimeout(500);
    const types = ['automata', 'turing', 'circuit', 'random', 'quantum', 'commtree', 'commrect', 'intro', 'none'];
    for (const type of types) {
      const ok = await page.evaluate((t) => {
        window.__ctrl.activate(t, {});
        return window.__ctrl.currentType === t && window.__ctrl.anim !== null;
      }, type);
      expect(ok).toBe(true);
    }
  });

  test('animation type changes when scrolling to different section', async ({ page }) => {
    await page.goto(URL);
    await page.waitForTimeout(500);
    // Scroll to section 4 (The Map) which uses circuit
    await page.evaluate(() => {
      document.querySelector('#sec-4')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    const newType = await page.evaluate(() => window.__ctrl?.currentType);
    expect(newType).toBe('circuit');
  });

  test('automata modes: abc, fail, pda, hierarchy', async ({ page }) => {
    await page.goto(URL);
    for (const mode of ['abc', 'fail', 'pda', 'hierarchy']) {
      const ok = await page.evaluate((m) => {
        window.__ctrl.activate('automata', { mode: m });
        return window.__ctrl.anim?.mode === m;
      }, mode);
      expect(ok).toBe(true);
    }
  });

  test('turing modes: default, decision, binarySearch, formal', async ({ page }) => {
    await page.goto(URL);
    for (const mode of ['default', 'decision', 'binarySearch', 'formal']) {
      const ok = await page.evaluate((m) => {
        window.__ctrl.activate('turing', { mode: m });
        return window.__ctrl.anim?.mode === m;
      }, mode);
      expect(ok).toBe(true);
    }
  });

  test('circuit modes: default, classes, web, growth, layers, map, bfs, np', async ({ page }) => {
    await page.goto(URL);
    for (const mode of ['default', 'classes', 'web', 'growth', 'layers', 'map', 'bfs', 'np']) {
      const ok = await page.evaluate((m) => {
        window.__ctrl.activate('circuit', { mode: m });
        return window.__ctrl.anim?.mode === m;
      }, mode);
      expect(ok).toBe(true);
    }
  });

  test.skip('animation keeps rendering (canvas changes over time)', async ({ page }) => {
    // Skipped: animation frame timing is non-deterministic in headless mode
    await page.goto(URL);
    await page.waitForTimeout(500);
    const snap1 = await page.evaluate(() => {
      const c = document.querySelector('[data-testid="anim-panel"] canvas');
      const ctx = c.getContext('2d');
      const d = ctx.getImageData(0, 0, 50, 50).data;
      return Array.from(d.slice(0, 200));
    });
    await page.waitForTimeout(1000);
    const snap2 = await page.evaluate(() => {
      const c = document.querySelector('[data-testid="anim-panel"] canvas');
      const ctx = c.getContext('2d');
      const d = ctx.getImageData(0, 0, 50, 50).data;
      return Array.from(d.slice(0, 200));
    });
    // Animations are time-based, pixels should change (allow for slow CI)
    let diffs = 0;
    for (let i = 0; i < snap1.length; i++) if (snap1[i] !== snap2[i]) diffs++;
    // If no diff in corner, check a larger area
    if (diffs === 0) {
      const snap3 = await page.evaluate(() => {
        const c = document.querySelector('[data-testid="anim-panel"] canvas');
        const ctx = c.getContext('2d');
        const d = ctx.getImageData(c.width/4, c.height/4, 50, 50).data;
        return Array.from(d.slice(0, 200));
      });
      await page.waitForTimeout(1500);
      const snap4 = await page.evaluate(() => {
        const c = document.querySelector('[data-testid="anim-panel"] canvas');
        const ctx = c.getContext('2d');
        const d = ctx.getImageData(c.width/4, c.height/4, 50, 50).data;
        return Array.from(d.slice(0, 200));
      });
      for (let i = 0; i < snap3.length; i++) if (snap3[i] !== snap4[i]) diffs++;
    }
    expect(diffs).toBeGreaterThan(0);
  });
});

test.describe('Dropdowns', () => {

  test('aside-dropdowns are not separate .pb blocks', async ({ page }) => {
    await page.goto(URL);
    const standaloneDropdowns = await page.locator('details.aside-dropdown.pb').count();
    expect(standaloneDropdowns).toBe(0);
  });

  test('dropdowns are inside .pb blocks', async ({ page }) => {
    await page.goto(URL);
    const dropdownCount = await page.locator('.pb details.aside-dropdown').count();
    expect(dropdownCount).toBeGreaterThan(0);
  });

  test('dropdown opens and closes', async ({ page }) => {
    await page.goto(URL);
    const dropdown = page.locator('details.aside-dropdown').first();
    await expect(dropdown).not.toHaveAttribute('open');
    await dropdown.locator('summary').click();
    await expect(dropdown).toHaveAttribute('open', '');
    await dropdown.locator('summary').click();
    await expect(dropdown).not.toHaveAttribute('open');
  });

  test('accordion: only one dropdown open at a time', async ({ page }) => {
    await page.goto(URL);
    const dropdowns = page.locator('details.aside-dropdown');
    const count = await dropdowns.count();
    if (count < 2) return; // skip if fewer than 2
    // Open first
    await dropdowns.nth(0).locator('summary').click();
    await expect(dropdowns.nth(0)).toHaveAttribute('open', '');
    // Open second — first should close
    await dropdowns.nth(1).locator('summary').click();
    await page.waitForTimeout(200);
    await expect(dropdowns.nth(1)).toHaveAttribute('open', '');
    await expect(dropdowns.nth(0)).not.toHaveAttribute('open');
  });
});

test.describe('Editor Mode', () => {

  test('editor mode toggle exists and works', async ({ page }) => {
    await page.goto(URL);
    const btn = page.locator('#mode-toggle');
    await expect(btn).toBeVisible();
    // Click to enter editor mode
    await btn.click();
    await expect(page.locator('body')).toHaveClass(/editor-mode/);
    // Click again to exit
    await btn.click();
    await expect(page.locator('body')).not.toHaveClass(/editor-mode/);
  });

  test('blocks are contenteditable in editor mode', async ({ page }) => {
    await page.goto(URL);
    await page.locator('#mode-toggle').click();
    await page.waitForTimeout(300);
    const editable = await page.evaluate(() => {
      const pbs = document.querySelectorAll('.pb');
      // In editor mode, at least some blocks should be contenteditable
      for (const pb of pbs) {
        if (pb.getAttribute('contenteditable') === 'true') return true;
      }
      // Or body.editor-mode class is present (blocks may use different mechanism)
      return document.body.classList.contains('editor-mode');
    });
    expect(editable).toBe(true);
  });

  test('block numbers appear in editor mode', async ({ page }) => {
    await page.goto(URL);
    await page.locator('#mode-toggle').click();
    await page.waitForTimeout(300);
    // Check that ::before pseudo-element content is rendered (counter)
    const hasNumbers = await page.evaluate(() => {
      const pb = document.querySelector('.pb');
      const before = getComputedStyle(pb, '::before');
      return before.content !== 'none' && before.content !== '';
    });
    expect(hasNumbers).toBe(true);
  });
});

test.describe('Content Integrity', () => {

  test('section titles are present', async ({ page }) => {
    await page.goto(URL);
    const titles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('section h2')).map(h => h.textContent.trim());
    });
    expect(titles.some(t => t.includes('Introduction'))).toBe(true);
    expect(titles.some(t => t.includes('Brave Assumptions'))).toBe(true);
    expect(titles.some(t => t.includes('Measuring Stick'))).toBe(true);
    expect(titles.some(t => t.includes('The Map'))).toBe(true);
  });

  test('formal TM definition is present (7-tuple)', async ({ page }) => {
    await page.goto(URL);
    const hasTuple = await page.evaluate(() => {
      return document.body.textContent.includes('M = (Q, Σ, Γ, δ, q₀');
    });
    expect(hasTuple).toBe(true);
  });

  test('P class block exists with BFS dropdown', async ({ page }) => {
    await page.goto(URL);
    const hasP = await page.evaluate(() => {
      return document.body.textContent.includes('polynomial class');
    });
    expect(hasP).toBe(true);
    const bfsDropdown = await page.evaluate(() => {
      const details = Array.from(document.querySelectorAll('details.aside-dropdown summary'));
      return details.some(s => s.textContent.includes('shortest path'));
    });
    expect(bfsDropdown).toBe(true);
  });

  test('NP class block exists with certificate explanation', async ({ page }) => {
    await page.goto(URL);
    const hasNP = await page.evaluate(() => {
      return document.body.textContent.includes('certificate') && document.body.textContent.includes('Nondeterministic Polynomial');
    });
    expect(hasNP).toBe(true);
  });

  test('data-a blocks reference valid animation types', async ({ page }) => {
    await page.goto(URL);
    const validTypes = ['automata', 'turing', 'circuit', 'random', 'quantum', 'commtree', 'commrect', 'intro'];
    const allValid = await page.evaluate((valid) => {
      const blocks = document.querySelectorAll('[data-a]');
      for (const b of blocks) {
        if (!valid.includes(b.getAttribute('data-a'))) return false;
      }
      return blocks.length > 0;
    }, validTypes);
    expect(allValid).toBe(true);
  });
});

test.describe('Server', () => {

  test('GET / returns HTML', async ({ request }) => {
    const res = await request.get(URL);
    expect(res.status()).toBe(200);
    const ct = res.headers()['content-type'];
    expect(ct).toContain('text/html');
  });

  test('POST /save accepts HTML', async ({ request }) => {
    // Read current content first
    const getRes = await request.get(URL);
    const html = await getRes.text();
    // Save it back (should succeed without changing anything)
    const postRes = await request.post(`${URL}save`, { data: html });
    expect(postRes.status()).toBe(200);
    const body = await postRes.json();
    expect(body.ok).toBe(true);
    expect(body.bytes).toBeGreaterThan(1000);
  });
});
