// Database management commands for E2E tests

declare global {
  namespace Cypress {
    interface Chainable {
      resetDatabase(): Chainable<void>
      seedTestData(): Chainable<void>
      cleanupTestWorkoutsFromDB(): Chainable<void>
    }
  }
}

// Reset database to clean state (use with caution!)
Cypress.Commands.add('resetDatabase', () => {
  // Only run in test environment
  if (Cypress.env('NODE_ENV') !== 'test') {
    throw new Error('Database reset is only allowed in test environment')
  }

  const resetMutation = `
    mutation ResetTestDatabase {
      resetTestDatabase {
        success
        message
      }
    }
  `

  cy.request({
    method: 'POST',
    url: `${Cypress.env('BACKEND_URL')}/graphql`,
    body: {
      query: resetMutation
    },
    headers: {
      'Content-Type': 'application/json'
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 200) {
      cy.log('Database reset not available - continuing with manual cleanup')
    }
  })
})

// Seed database with basic test data
Cypress.Commands.add('seedTestData', () => {
  // Create test users and basic data if needed
  cy.log('Seeding test data...')
  
  // This could create test users, clients, etc.
  // For now, we rely on existing data
})

// Clean up test workouts directly from database
Cypress.Commands.add('cleanupTestWorkoutsFromDB', () => {
  // Delete workouts via SQL if GraphQL mutations are not available
  const query = `
    DELETE FROM workouts 
    WHERE name LIKE '%BASE%' 
       OR name LIKE '%Treino Importado%'
       OR name LIKE '%Test%'
       OR name LIKE '%teste%'
       OR created_at > NOW() - INTERVAL '1 hour'
  `

  // This would require a direct database connection
  // For now, we use GraphQL approach
  cy.cleanupAllTestWorkouts()
})

export {}