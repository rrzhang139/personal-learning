const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'test.spec.js',
  use: {
    baseURL: 'http://localhost:8082',
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: 'node server.js',
    port: 8082,
    cwd: __dirname,
    reuseExistingServer: true,
  },
});
