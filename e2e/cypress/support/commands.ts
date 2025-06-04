// Custom commands for DietTreinoAI E2E tests

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      loginAsTrainer(): Chainable<void>
      loginAsClient(): Chainable<void>
      createTestUser(role: 'CLIENT' | 'TRAINER' | 'NUTRITIONIST'): Chainable<any>
      cleanupTestData(): Chainable<void>
      visitFrontend(path?: string): Chainable<void>
      waitForGraphQL(operationName: string): Chainable<any>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/login')
    cy.window().its('localStorage').should('contain.key', 'authToken')
  })
})

// Login as predefined trainer
Cypress.Commands.add('loginAsTrainer', () => {
  cy.login('trainer@dietreino.com', 'password123')
})

// Login as predefined client
Cypress.Commands.add('loginAsClient', () => {
  cy.login('client@dietreino.com', 'password123')
})

// Create test user via GraphQL
Cypress.Commands.add('createTestUser', (role: 'CLIENT' | 'TRAINER' | 'NUTRITIONIST') => {
  const mutation = `
    mutation CreateUser($input: UserInput!) {
      createUser(input: $input) {
        id
        email
        name
        role
      }
    }
  `
  
  const variables = {
    input: {
      email: `test-${role.toLowerCase()}-${Date.now()}@test.com`,
      name: `Test ${role}`,
      password: 'test123',
      role: role
    }
  }

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('BACKEND_URL')}/graphql`,
    body: {
      query: mutation,
      variables
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body.data.createUser
  })
})

// Clean up test data
Cypress.Commands.add('cleanupTestData', () => {
  // This would implement cleanup logic
  // For now, we'll just clear localStorage
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Visit frontend with base URL
Cypress.Commands.add('visitFrontend', (path: string = '') => {
  cy.visit(`${Cypress.env('FRONTEND_URL')}${path}`)
})

// Wait for specific GraphQL operation
Cypress.Commands.add('waitForGraphQL', (operationName: string) => {
  cy.intercept('POST', '**/graphql', (req) => {
    if (req.body.operationName === operationName) {
      req.alias = operationName
    }
  })
  cy.wait(`@${operationName}`)
})

export {}