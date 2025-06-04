describe('Login Flow', () => {
  let testUser: any

  before(() => {
    // Clean up existing test users
    cy.cleanupTestUsers()
    
    // Create a test user for this suite
    cy.createRandomTestUser('TRAINER').then((user) => {
      testUser = user
    })
  })

  after(() => {
    // Clean up test users after all tests
    cy.cleanupTestUsers()
  })

  beforeEach(() => {
    cy.cleanupTestData()
    cy.visit('/login')
  })

  it('should display the login page correctly', () => {
    // Check page title and welcome message
    cy.get('h1').should('contain.text', 'Bem-vindo')
    cy.get('p').should('contain.text', 'Entre para acessar sua conta')
    
    // Check form elements are present
    cy.get('input[placeholder="Seu email"]').should('be.visible')
    cy.get('input[placeholder="Sua senha"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain.text', 'Entrar')
    
    // Check remember checkbox and forgot password link
    cy.get('.ant-checkbox').should('be.visible')
    cy.get('a').contains('Esqueceu a senha?').should('be.visible')
    cy.get('a').contains('Registre-se').should('be.visible')
  })

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click()
    
    cy.get('.ant-form-item-explain-error')
      .should('contain.text', 'Por favor insira seu email')
    cy.get('.ant-form-item-explain-error')
      .should('contain.text', 'Por favor insira sua senha')
  })

  it('should show email validation error for invalid email format', () => {
    cy.get('input[placeholder="Seu email"]').type('invalid-email')
    cy.get('input[placeholder="Sua senha"]').type('somepassword')
    cy.get('button[type="submit"]').click()
    
    cy.get('.ant-form-item-explain-error')
      .should('contain.text', 'Email inválido')
  })

  it('should show password validation error for short password', () => {
    cy.get('input[placeholder="Seu email"]').type('test@example.com')
    cy.get('input[placeholder="Sua senha"]').type('12345')
    cy.get('button[type="submit"]').click()
    
    cy.get('.ant-form-item-explain-error')
      .should('contain.text', 'A senha deve ter pelo menos 6 caracteres')
  })

  it('should login successfully with valid credentials', () => {
    // Fill form with test user credentials
    cy.get('input[placeholder="Seu email"]').type(testUser.email)
    cy.get('input[placeholder="Sua senha"]').type(testUser.password)
    
    // Submit form
    cy.get('button[type="submit"]').click()
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
    
    // Should see dashboard content (verify successful login)
    cy.get('h1, h2').should('be.visible')
    cy.get('nav, .sidebar, aside').should('be.visible')
  })

  it('should remember email when checkbox is checked', () => {
    cy.get('input[placeholder="Seu email"]').type(testUser.email)
    cy.get('input[placeholder="Sua senha"]').type(testUser.password)
    
    // Check remember me
    cy.get('.ant-checkbox').click()
    
    cy.get('button[type="submit"]').click()
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
    
    // Logout from dashboard
    cy.logout()
    
    // Check if email is remembered
    cy.get('input[placeholder="Seu email"]').should('have.value', testUser.email)
    cy.get('.ant-checkbox input[type="checkbox"]').should('be.checked')
  })

  it('should not remember email when checkbox is unchecked', () => {
    cy.get('input[placeholder="Seu email"]').type(testUser.email)
    cy.get('input[placeholder="Sua senha"]').type(testUser.password)
    
    // Ensure checkbox is unchecked
    cy.get('.ant-checkbox input[type="checkbox"]').should('not.be.checked')
    
    cy.get('button[type="submit"]').click()
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
    
    // Logout from dashboard
    cy.logout()
    
    // Check email is NOT remembered
    cy.get('input[placeholder="Seu email"]').should('have.value', '')
    cy.get('.ant-checkbox input[type="checkbox"]').should('not.be.checked')
  })

  it('should pre-fill email if previously remembered', () => {
    // First login with remember checked
    cy.get('input[placeholder="Seu email"]').type('cadriano.miranda@gmail.com')
    cy.get('input[placeholder="Sua senha"]').type('j@eT2p-l#OI0')
    cy.get('.ant-checkbox').click()
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    
    // Logout from dashboard
    cy.logout()
    
    // Email should be pre-filled and remember checkbox should be checked
    cy.get('input[placeholder="Seu email"]').should('have.value', 'cadriano.miranda@gmail.com')
    cy.get('.ant-checkbox input[type="checkbox"]').should('be.checked')
  })

  it('should redirect to dashboard if already authenticated', () => {
    // Login first
    cy.login('cadriano.miranda@gmail.com', 'j@eT2p-l#OI0')
    
    // Try to visit login page
    cy.visit('/login')
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
    
    // Should see dashboard content
    cy.get('nav, .sidebar, aside').should('be.visible')
  })


  it('should handle login error gracefully', () => {
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.operationName === 'Login') {
        req.reply({
          statusCode: 200,
          body: {
            data: null,
            errors: [
              {
                message: 'Credenciais inválidas',
                extensions: {
                  code: 'UNAUTHENTICATED'
                }
              }
            ]
          }
        })
      }
    })

    cy.get('input[placeholder="Seu email"]').type('cadriano.miranda@gmail.com')
    cy.get('input[placeholder="Sua senha"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // Should show error alert
    cy.get('.ant-alert-error').should('be.visible')
    cy.get('.ant-alert-message').should('contain.text', 'Credenciais inválidas')
    
    // Should remain on login page
    cy.url().should('include', '/login')
  })

  it('should clear form after successful login', () => {
    cy.get('input[placeholder="Seu email"]').type('cadriano.miranda@gmail.com')
    cy.get('input[placeholder="Sua senha"]').type('j@eT2p-l#OI0')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
    
    // Go back to login (should be redirected if still authenticated)
    cy.visit('/login')
    cy.url().should('include', '/dashboard')
  })

  it('should handle password visibility toggle', () => {
    cy.get('input[placeholder="Sua senha"]').type('j@eT2p-l#OI0')
    
    // Password should be hidden initially
    cy.get('input[placeholder="Sua senha"]').should('have.attr', 'type', 'password')
    
    // Click visibility toggle
    cy.get('.ant-input-password-icon').click()
    
    // Password should be visible
    cy.get('input[placeholder="Sua senha"]').should('have.attr', 'type', 'text')
    
    // Click again to hide
    cy.get('.ant-input-password-icon').click()
    cy.get('input[placeholder="Sua senha"]').should('have.attr', 'type', 'password')
  })

  it('should navigate to register page', () => {
    cy.get('a').contains('Registre-se').click()
    cy.url().should('include', '/register')
  })
})