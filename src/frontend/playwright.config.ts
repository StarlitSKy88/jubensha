import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e/tests',
  timeout: 30000,
  retries: 2,
  workers: 3,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'Chrome',
      use: {
        browserName: 'chromium'
      }
    },
    {
      name: 'Firefox',
      use: {
        browserName: 'firefox'
      }
    },
    {
      name: 'Safari',
      use: {
        browserName: 'webkit'
      }
    }
  ],
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  outputDir: 'test-results',
  globalSetup: require.resolve('./tests/e2e/utils/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/utils/global-teardown')
};

export default config; 