const { test, expect } = require('@playwright/test');

const URL = 'http://localhost:8080/';

test.describe('Complexity Theory Essay', () => {

  test('page loads with two-column layout', async ({ page }) => {
    await page.goto(URL);
    const content = page.locator('[data-testid="content"]');
    await expect(content).toBeVisible();
    const panel = page.locator('[data-testid="anim-panel"]');
    await expect(panel).toBeVisible();
    // No TOC sidebar
    const toc = page.locator('[data-testid="toc"]');
    await expect(toc).toHaveCount(0);
  });

  test('first paragraph is active on load', async ({ page }) => {
    await page.goto(URL);
    await page.waitForTimeout(500);
    const active = await page.evaluate(() => window.__active?.tagName);
    expect(['P','DIV']).toContain(active);
    const firstPb = page.locator('.pb').first();
    await expect(firstPb).toHaveClass(/active/);
  });

  test('animation canvas is not blank', async ({ page }) => {
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

  test('scrolling to another paragraph changes active', async ({ page }) => {
    await page.goto(URL);
    await page.waitForTimeout(500);
    const firstText = await page.evaluate(() => window.__active?.textContent?.slice(0, 30));
    // Use scrollIntoView on the 5th paragraph to ensure snap lands on a different one
    await page.evaluate(() => {
      const pbs = document.querySelectorAll('.pb');
      if (pbs[4]) pbs[4].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(800);
    const secondText = await page.evaluate(() => window.__active?.textContent?.slice(0, 30));
    expect(secondText).not.toBe(firstText);
  });

  test('animation type changes when scrolling to different section', async ({ page }) => {
    await page.goto(URL);
    await page.waitForTimeout(500);
    const initialType = await page.evaluate(() => window.__ctrl?.currentType);
    // Scroll to section 4 (The Map) which uses circuit
    await page.evaluate(() => {
      document.querySelector('#sec-4')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    const newType = await page.evaluate(() => window.__ctrl?.currentType);
    expect(newType).toBe('circuit');
  });

  test('all 7 animation types can be activated', async ({ page }) => {
    await page.goto(URL);
    const types = ['automata', 'turing', 'circuit', 'random', 'quantum', 'commtree', 'commrect'];
    for (const type of types) {
      const ok = await page.evaluate((t) => {
        window.__ctrl.activate(t, {});
        return window.__ctrl.currentType === t && window.__ctrl.anim !== null;
      }, type);
      expect(ok).toBe(true);
    }
  });

  test('inactive paragraphs have lower opacity', async ({ page }) => {
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

  test('responsive: animation panel hides on narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 800 });
    await page.goto(URL);
    const panel = page.locator('[data-testid="anim-panel"]');
    await expect(panel).toBeHidden();
  });
});
