describe('Editor', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('loads editor successfully', () => {
    cy.get('.editor').should('exist')
    cy.get('.editor-toolbar').should('exist')
    cy.get('.editor-content').should('exist')
  })

  it('creates new line on enter', () => {
    cy.get('.editor-line').first().type('First line{enter}')
    cy.get('.editor-line').should('have.length', 2)
  })

  it('deletes line on backspace', () => {
    cy.get('.editor-line').first().type('First line{enter}Second line')
    cy.get('.editor-line').last().type('{backspace}'.repeat('Second line'.length))
    cy.get('.editor-line').should('have.length', 1)
  })

  it('handles line selection', () => {
    cy.get('.editor-line').first().click()
    cy.get('.editor-line').first().should('have.class', 'is-active')
  })

  it('supports copy and paste', () => {
    const text = 'Test content'
    cy.get('.editor-line').first().type(text)
    cy.get('.editor-line').first().trigger('keydown', { key: 'c', ctrlKey: true })
    cy.get('.editor-line').first().trigger('keydown', { key: 'v', ctrlKey: true })
    cy.get('.editor-line').first().should('contain', text + text)
  })

  it('handles file drop', () => {
    cy.fixture('test.txt').then((fileContent) => {
      cy.get('.editor').trigger('drop', {
        dataTransfer: {
          files: [
            new File([fileContent], 'test.txt', { type: 'text/plain' })
          ]
        }
      })
      cy.get('.editor-line').should('contain', fileContent)
    })
  })

  it('shows performance metrics', () => {
    cy.get('.performance-monitor').should('exist')
    cy.get('.editor-line').first().type('Test performance{enter}')
    cy.get('.performance-monitor').should('contain', 'update-line')
  })

  it('handles large content', () => {
    const lines = Array(1000).fill('Test line')
    cy.get('.editor').paste(lines.join('\n'))
    cy.get('.virtual-scroll').should('exist')
    cy.get('.editor-line').should('have.length.greaterThan', 0)
  })

  it('supports keyboard shortcuts', () => {
    // Save
    cy.get('.editor-line').first().type('Test content')
    cy.get('body').trigger('keydown', { key: 's', ctrlKey: true })
    cy.get('.save-indicator').should('be.visible')

    // Undo
    cy.get('body').trigger('keydown', { key: 'z', ctrlKey: true })
    cy.get('.editor-line').first().should('be.empty')

    // Redo
    cy.get('body').trigger('keydown', { key: 'y', ctrlKey: true })
    cy.get('.editor-line').first().should('contain', 'Test content')
  })

  it('handles error states', () => {
    cy.intercept('POST', '/api/save', {
      statusCode: 500,
      body: { error: 'Test error' }
    })
    cy.get('body').trigger('keydown', { key: 's', ctrlKey: true })
    cy.get('.error-message').should('contain', 'Test error')
  })

  it('shows loading states', () => {
    cy.intercept('GET', '/api/content', {
      delay: 1000,
      fixture: 'content.json'
    })
    cy.visit('/')
    cy.get('.loading-indicator').should('be.visible')
    cy.get('.loading-indicator').should('not.exist')
  })
}) 