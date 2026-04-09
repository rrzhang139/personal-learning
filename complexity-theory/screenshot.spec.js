const { test } = require('@playwright/test');
test('screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8080/');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/view-mode.png', fullPage: false });
  await page.click('#mode-toggle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/editor-mode.png', fullPage: false });
});
