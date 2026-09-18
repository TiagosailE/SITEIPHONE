import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const ORIGIN = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `${ORIGIN}/SITEIPHONE/`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node scripts/serve.mjs',
    url: `${ORIGIN}/SITEIPHONE/`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
});
