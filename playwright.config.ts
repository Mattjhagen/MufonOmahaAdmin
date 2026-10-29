import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/responsive',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
