const { test, expect } = require('@playwright/test');

test.describe('Page Structure', () => {
  test('page loads with title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Special Relativity/);
    await expect(page.locator('.essay-header h1')).toHaveText('Special Relativity');
  });

  test('key sections present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#sec-prereqs')).toBeVisible();
    // Check sections that have content (some may be emptied via edit mode)
    for (const id of ['sec-1', 'sec-2', 'sec-3', 'sec-4', 'sec-6', 'sec-7']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test('prerequisites section has correct content', async ({ page }) => {
    await page.goto('/');
    const text = await page.locator('#sec-prereqs').textContent();
    expect(text).toContain('Pythagorean theorem');
    expect(text).toContain('algebra');
  });
});

test.describe('Styling', () => {
  test('parchment background color', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toContain('244');
    expect(bg).toContain('234');
  });

  test('serif font family', async ({ page }) => {
    await page.goto('/');
    const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(font.toLowerCase()).toMatch(/crimson|georgia|serif/);
  });
});

test.describe('Visualization Containers', () => {
  test('all 7 viz containers exist with correct scene names', async ({ page }) => {
    await page.goto('/');
    const scenes = ['firecracker-alice', 'firecracker', 'firecracker-bob',
                     'light-clock-bob', 'light-clock-alice', 'spacetime-intro',
                     'simultaneity', 'firecracker-sync', 'length-contract-bob', 'interval-math'];
    for (const name of scenes) {
      const container = page.locator(`.viz-container[data-scene="${name}"]`).first();
      await expect(container).toBeVisible();
    }
  });

  test('each container has a canvas and slider', async ({ page }) => {
    await page.goto('/');
    const containers = page.locator('.viz-container');
    const count = await containers.count();
    expect(count).toBeGreaterThanOrEqual(10);
    for (let i = 0; i < count; i++) {
      await expect(containers.nth(i).locator('canvas')).toBeVisible();
      await expect(containers.nth(i).locator('.viz-slider')).toBeVisible();
      await expect(containers.nth(i).locator('.viz-range')).toBeVisible();
    }
  });
});

test.describe('No JavaScript Errors', () => {
  test('page loads without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });
});

test.describe('Canvas Rendering', () => {
  const scenes = ['firecracker-alice', 'firecracker', 'firecracker-bob',
                   'light-clock-bob', 'light-clock-alice', 'spacetime-intro',
                   'firecracker-sync', 'simultaneity', 'length-contract-bob', 'interval-math'];

  for (const name of scenes) {
    test(`${name} canvas is non-blank`, async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const container = page.locator(`.viz-container[data-scene="${name}"]`);
      await container.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const isNonBlank = await page.evaluate((sceneName) => {
        const canvas = document.querySelector(`.viz-container[data-scene="${sceneName}"] canvas`);
        if (!canvas) return false;
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let nonBg = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (Math.abs(r - 250) > 10 || Math.abs(g - 243) > 10 || Math.abs(b - 227) > 10) {
            nonBg++;
          }
        }
        return nonBg > 100;
      }, name);

      expect(isNonBlank).toBe(true);
    });
  }
});

test.describe('Slider Controls', () => {
  test('slider has a label and value display', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const container = page.locator('.viz-container[data-scene="firecracker"]');
    const label = container.locator('.viz-slider-label');
    const value = container.locator('.viz-slider-value');

    await expect(label).not.toBeEmpty();
    await expect(value).not.toBeEmpty();
  });

  test('dragging slider changes the value display', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const container = page.locator('.viz-container[data-scene="light-clock-alice"]');
    const range = container.locator('.viz-range');
    const value = container.locator('.viz-slider-value');

    const before = await value.textContent();
    // Set slider to midpoint
    await range.fill('500');
    await page.waitForTimeout(100);
    const after = await value.textContent();

    expect(before).not.toEqual(after);
  });

  for (const name of ['firecracker-alice', 'firecracker', 'firecracker-bob',
                       'light-clock-bob', 'light-clock-alice', 'spacetime-intro',
                       'firecracker-sync', 'simultaneity',
                       'length-contract-bob', 'interval-math']) {
    test(`${name} canvas changes when slider moves`, async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const container = page.locator(`.viz-container[data-scene="${name}"]`);
      await container.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const changed = await page.evaluate((sceneName) => {
        const canvas = document.querySelector(`.viz-container[data-scene="${sceneName}"] canvas`);
        if (!canvas) return false;
        const ctx = canvas.getContext('2d');

        // Capture at current slider position
        const img0 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        // Move slider to a different position
        const range = canvas.closest('.viz-container').querySelector('.viz-range');
        const current = parseInt(range.value);
        range.value = current < 500 ? 800 : 200;
        range.dispatchEvent(new Event('input'));

        // Capture after
        const img1 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        let diff = 0;
        for (let i = 0; i < img0.length; i += 4) {
          if (img0[i] !== img1[i] || img0[i + 1] !== img1[i + 1] || img0[i + 2] !== img1[i + 2]) {
            diff++;
          }
        }
        return diff > 50;
      }, name);

      expect(changed).toBe(true);
    });
  }
});

// ── Visual legibility: sweep each scene and check no dense pixel clusters (text overlap) ──
// Approach: at each slider position, sample horizontal scan lines through the label regions.
// If too many dark pixels are packed together, it indicates overlapping text.
test.describe('Label Legibility (no text overlap)', () => {
  // For each scene, test several slider positions that previously caused overlap
  const sweeps = [
    { scene: 'firecracker-alice', positions: [0, 300, 500, 800] },
    { scene: 'firecracker', positions: [0, 300, 420, 500, 650, 800, 1000] },
    { scene: 'firecracker-bob', positions: [0, 200, 400, 600, 800, 1000] },
    { scene: 'light-clock-bob', positions: [0, 300, 500, 700, 1000] },
    { scene: 'light-clock-alice', positions: [0, 300, 500, 700, 900, 1000] },
    { scene: 'spacetime-intro', positions: [0, 300, 500, 800, 1000] },
    { scene: 'firecracker-sync', positions: [0, 300, 500, 700, 900] },
    { scene: 'simultaneity', positions: [0, 300, 500, 700, 900] },
    { scene: 'length-contract-bob', positions: [0, 200, 500, 700, 900] },
    { scene: 'interval-math', positions: [0, 200, 500, 800, 1000] },
  ];

  for (const { scene, positions } of sweeps) {
    test(`${scene} renders cleanly at all slider positions`, async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(500);

      const container = page.locator(`.viz-container[data-scene="${scene}"]`);
      await container.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      for (const pos of positions) {
        // Set slider
        const range = container.locator('.viz-range');
        await range.fill(String(pos));
        await page.waitForTimeout(100);

        // Check the canvas is non-blank and doesn't have a massive
        // concentration of dark pixels in a tiny area (text pile-up)
        const result = await page.evaluate(({ sceneName, sliderPos }) => {
          const canvas = document.querySelector(`.viz-container[data-scene="${sceneName}"] canvas`);
          if (!canvas) return { ok: false, reason: 'no canvas' };
          const ctx = canvas.getContext('2d');
          const w = canvas.width;
          const h = canvas.height;

          // Scan the top 15% of the canvas (where labels tend to overlap)
          const labelRegionH = Math.floor(h * 0.15);
          const data = ctx.getImageData(0, 0, w, labelRegionH).data;

          // Count "ink" pixels (dark, non-background)
          // Background is ~(250, 243, 227). Ink is significantly darker.
          let inkPixels = 0;
          const rowCounts = new Array(labelRegionH).fill(0);

          for (let y = 0; y < labelRegionH; y++) {
            for (let x = 0; x < w; x++) {
              const idx = (y * w + x) * 4;
              const r = data[idx], g = data[idx + 1], b = data[idx + 2];
              // A pixel is "ink" if it's substantially darker than the background
              if (r < 180 && g < 180 && b < 180) {
                inkPixels++;
                rowCounts[y]++;
              }
            }
          }

          // Check for overlap: if multiple adjacent rows each have >40% ink coverage,
          // that's likely overlapping text (normal text has gaps between lines)
          let maxConsecutiveDense = 0;
          let currentRun = 0;
          const denseThreshold = w * 0.35; // 35% of row width covered in ink

          for (let y = 0; y < labelRegionH; y++) {
            if (rowCounts[y] > denseThreshold) {
              currentRun++;
              maxConsecutiveDense = Math.max(maxConsecutiveDense, currentRun);
            } else {
              currentRun = 0;
            }
          }

          // More than 20 consecutive dense rows in the label region = likely overlap
          return {
            ok: maxConsecutiveDense < 20,
            maxConsecutiveDense,
            inkPixels,
            labelRegionH,
          };
        }, { sceneName: scene, sliderPos: pos });

        expect(result.ok, `${scene} at slider=${pos}: ${result.maxConsecutiveDense} consecutive dense rows in label region`).toBe(true);
      }
    });
  }
});
