/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to paste text into an element
     * @example cy.get('.editor').paste('Hello, World!')
     */
    paste(text: string): Chainable<Element>
  }
}

// Add custom commands
Cypress.Commands.add('paste', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).trigger('paste', {
    clipboardData: {
      getData: () => text
    }
  })
})

// Configure global behavior
beforeEach(() => {
  // Preserve cookie between tests
  Cypress.Cookies.preserveOnce('session_id', 'remember_token')
})

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from failing the test
  console.error('Uncaught exception:', err)
  return false
})

// Add custom assertions
chai.use((chai, utils) => {
  // Add custom assertions here
}) 