import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('End-to-end tests completed.');
}

export default globalTeardown; 
