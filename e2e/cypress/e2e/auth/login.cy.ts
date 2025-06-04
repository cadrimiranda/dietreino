describe('Authentication - Login Flow', () => {
  beforeEach(() => {
    cy.cleanupTestData()
    cy.visit('/login')
  })

  it('should display login form correctly', () => {
    cy.get('h1, h2').should('contain.text', 'Login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click()
    cy.get('.ant-form-item-explain-error, .error-message').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@test.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    cy.get('.ant-message-error, .error-message, .ant-notification')
      .should('be.visible')
      .and('contain.text', 'inválid')
  })

  it('should login successfully with valid trainer credentials', () => {
    cy.fixture('users').then((users) => {
      cy.get('input[type="email"]').type(users.trainer.email)
      cy.get('input[type="password"]').type(users.trainer.password)
      cy.get('button[type="submit"]').click()

      cy.url().should('not.include', '/login')
      cy.window().its('localStorage.authToken').should('exist')
    })
  })

  it('should redirect authenticated users away from login page', () => {
    cy.loginAsTrainer()
    cy.visit('/login')
    cy.url().should('not.include', '/login')
  })

  it('should maintain session after page refresh', () => {
    cy.loginAsTrainer()
    cy.reload()
    cy.url().should('not.include', '/login')
    cy.window().its('localStorage.authToken').should('exist')
  })

  it('should logout when clicking logout button', () => {
    cy.loginAsTrainer()
    cy.get('[data-testid="logout-button"], .logout, [aria-label="logout"]')
      .first()
      .click()
    
    cy.url().should('include', '/login')
    cy.window().its('localStorage.authToken').should('not.exist')
  })
})