import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: '../tests/e2e/cypress/support/e2e.ts',
    specPattern: '../tests/e2e/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: '../tests/e2e/cypress/fixtures',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 30000,
    watchForFileChanges: true,
    experimentalSessionAndOrigin: true
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: '../tests/e2e/cypress/support/component.ts'
  }
}) 