/// <reference types="cypress" />
import 'cypress-file-upload'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * 登录命令
       * @example cy.login('username', 'password')
       */
      login(username: string, password: string): Chainable<void>

      /**
       * 附加文件命令
       * @example cy.get('input').attachFile('example.json')
       */
      attachFile(filePath: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

// 登录命令
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-test="username-input"]').type(username)
  cy.get('[data-test="password-input"]').type(password)
  cy.get('[data-test="login-button"]').click()
  cy.url().should('include', '/workspace')
})

// 文件附加命令
Cypress.Commands.add('attachFile', { prevSubject: 'element' }, (subject, filePath) => {
  return cy.wrap(subject).then((input) => {
    cy.fixture(filePath).then((fileContent) => {
      const blob = new Blob([fileContent], { type: 'text/plain' })
      const file = new File([blob], filePath, { type: 'text/plain' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      return cy.wrap(input).trigger('change', { force: true })
    })
  })
}) 