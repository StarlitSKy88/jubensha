import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Starting end-to-end tests...');
}

export default globalSetup; 
