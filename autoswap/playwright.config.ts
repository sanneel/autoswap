import { defineConfig, devices } from '@playwright/test';

// End-to-end suite runs against a deployed URL rather than a local server:
// the site is static and its data comes from Supabase, so there is nothing
// meaningful to assert against a build that cannot reach the real feed.
// Override the target with BASE_URL when checking a preview deployment.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL || 'https://autoswap.ge',
    trace: 'on-first-retry',
    // The feed is a live network round-trip to Supabase; the default 5s
    // assertion window is tight for the slowest breakpoint on a cold cache.
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  expect: { timeout: 10_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
