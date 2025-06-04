// Custom commands for DietTreinoAI E2E tests

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      loginAsTrainer(): Chainable<void>
      loginAsClient(): Chainable<void>
      loginAsRandomTrainer(): Chainable<any>
      loginAsRandomClient(): Chainable<any>
      logout(): Chainable<void>
      uploadWorkoutFile(): Chainable<void>
      createTestUser(role: 'CLIENT' | 'TRAINER' | 'NUTRITIONIST'): Chainable<any>
      createRandomTestUser(role: 'CLIENT' | 'TRAINER' | 'NUTRITIONIST'): Chainable<any>
      createTrainerClientPair(): Chainable<{trainer: any, client: any}>
      cleanupTestData(): Chainable<void>
      cleanupTestUsers(): Chainable<void>
      cleanupWorkouts(clientId?: string): Chainable<void>
      cleanupAllTestWorkouts(): Chainable<void>
      visitFrontend(path?: string): Chainable<void>
      waitForGraphQL(operationName: string): Chainable<any>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    
    // Wait for page to load
    cy.get('input[placeholder="Seu email"]').should('be.visible')
    cy.get('input[placeholder="Sua senha"]').should('be.visible')
    
    // Fill form
    cy.get('input[placeholder="Seu email"]').clear().type(email)
    cy.get('input[placeholder="Sua senha"]').clear().type(password)
    
    // Submit
    cy.get('button[type="submit"]').click()
    
    // Wait for redirect - this is what matters
    cy.url().should('not.include', '/login', { timeout: 10000 })
    
    // Verify we're in dashboard by checking for navigation/sidebar
    cy.get('nav, .sidebar, aside').should('be.visible')
  })
})

// Login as predefined trainer
Cypress.Commands.add('loginAsTrainer', () => {
  cy.login('cadriano.miranda@gmail.com', 'j@eT2p-l#OI0')
})

// Login as predefined client
Cypress.Commands.add('loginAsClient', () => {
  cy.login('client@dietreino.com', 'password123')
})

// Logout command
Cypress.Commands.add('logout', () => {
  // Try to find and click user avatar first (topbar approach)
  cy.get('body').then(($body) => {
    // Look for the user avatar (blue circle with initials in topbar)
    if ($body.find('.bg-blue-500.text-white').length > 0) {
      // Click the button containing the user avatar
      cy.get('.bg-blue-500.text-white').parent('button').click()
      // Wait for dropdown and click logout
      cy.wait(500) // Wait for dropdown animation
      cy.get('button').contains('Sair').should('be.visible').click()
    } else {
      // Fallback: use sidebar logout (visible when sidebar is open)
      cy.get('button').contains('Sair').click()
    }
  })
  
  // Verify logout was successful
  cy.url().should('include', '/login')
})

// Create test user via GraphQL
Cypress.Commands.add('createTestUser', (role: 'CLIENT' | 'TRAINER' | 'NUTRITIONIST') => {
  const mutation = `
    mutation UpsertUser($userInput: UserInput!) {
      upsertUser(userInput: $userInput) {
        id
        email
        name
        role
      }
    }
  `
  
  const variables = {
    userInput: {
      email: `test-${role.toLowerCase()}-${Date.now()}@test.com`,
      name: `Test ${role}`,
      password: 'test123',
      role: role,
      phone: `+55 11 9${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
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
    return response.body.data.upsertUser
  })
})

// Create random test user with realistic data
Cypress.Commands.add('createRandomTestUser', (role: 'CLIENT' | 'TRAINER' | 'NUTRITIONIST') => {
  const randomId = Math.random().toString(36).substring(2, 15)
  
  return cy.fixture('brazilian-names').then((names) => {
    // Generate realistic Brazilian names
    const firstName = names.firstNames[Math.floor(Math.random() * names.firstNames.length)]
    const lastName = names.lastNames[Math.floor(Math.random() * names.lastNames.length)]
    const fullName = `${firstName} ${lastName}`
  
    // If creating a CLIENT, first create a TRAINER to assign
    if (role === 'CLIENT') {
      return cy.createRandomTestUser('TRAINER').then((trainer) => {
        const mutation = `
          mutation UpsertUser($userInput: UserInput!) {
            upsertUser(userInput: $userInput) {
              id
              email
              name
              role
              createdAt
            }
          }
        `
        
        const userData = {
          userInput: {
            email: `cypress-${role.toLowerCase()}-${randomId}@e2e-test.com`,
            name: fullName,
            password: 'CypressTest123!',
            role: role,
            trainerId: trainer.id,
            phone: `+55 11 9${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
          }
        }

        return cy.request({
          method: 'POST',
          url: `${Cypress.env('BACKEND_URL')}/graphql`,
          body: {
            query: mutation,
            variables: userData
          },
          headers: {
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200 && response.body.data?.upsertUser) {
            const user = response.body.data.upsertUser
            console.log(`✅ Created test client: ${user.name} (${user.email}) assigned to trainer ${trainer.name}`)
            
            return {
              ...user,
              password: 'CypressTest123!',
              trainer: trainer
            }
          } else {
            console.log(`❌ Failed to create client: ${JSON.stringify(response.body)}`)
            throw new Error(`Failed to create test client: ${response.body.errors?.[0]?.message || 'Unknown error'}`)
          }
        })
      })
    } else {
      // Create TRAINER or NUTRITIONIST (no assignment needed)
      const mutation = `
        mutation UpsertUser($userInput: UserInput!) {
          upsertUser(userInput: $userInput) {
            id
            email
            name
            role
            createdAt
          }
        }
      `
      
      const userData = {
        userInput: {
          email: `cypress-${role.toLowerCase()}-${randomId}@e2e-test.com`,
          name: fullName,
          password: 'CypressTest123!',
          role: role,
          phone: `+55 11 9${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        }
      }

      return cy.request({
        method: 'POST',
        url: `${Cypress.env('BACKEND_URL')}/graphql`,
        body: {
          query: mutation,
          variables: userData
        },
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 && response.body.data?.upsertUser) {
          const user = response.body.data.upsertUser
          console.log(`✅ Created test user: ${user.name} (${user.email})`)
          
          return {
            ...user,
            password: 'CypressTest123!'
          }
        } else {
          console.log(`❌ Failed to create user: ${JSON.stringify(response.body)}`)
          throw new Error(`Failed to create test user: ${response.body.errors?.[0]?.message || 'Unknown error'}`)
        }
      })
    }
  })
})

// Login as random trainer (creates if not exists)
Cypress.Commands.add('loginAsRandomTrainer', () => {
  return cy.createRandomTestUser('TRAINER').then((user) => {
    cy.login(user.email, user.password)
    return user
  })
})

// Login as random client (creates if not exists)  
Cypress.Commands.add('loginAsRandomClient', () => {
  return cy.createRandomTestUser('CLIENT').then((user) => {
    cy.login(user.email, user.password)
    return user
  })
})

// Create trainer-client pair with relationship
Cypress.Commands.add('createTrainerClientPair', () => {
  return cy.createRandomTestUser('TRAINER').then((trainer) => {
    return cy.createRandomTestUser('CLIENT').then((client) => {
      // Since CLIENT creation now automatically assigns to TRAINER,
      // the relationship is already established. Just return both users.
      console.log(`✅ Created trainer-client pair: ${trainer.name} -> ${client.name}`)
      return { trainer, client }
    })
  })
})

// Clean up test data
Cypress.Commands.add('cleanupTestData', () => {
  // Clear browser data
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Clean up test users
Cypress.Commands.add('cleanupTestUsers', () => {
  const deleteUserMutation = `
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id) {
        id
      }
    }
  `

  const getUsersQuery = `
    query GetUsers {
      users {
        id
        email
        name
        createdAt
      }
    }
  `

  cy.request({
    method: 'POST',
    url: `${Cypress.env('BACKEND_URL')}/graphql`,
    body: {
      query: getUsersQuery
    },
    headers: {
      'Content-Type': 'application/json'
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body.data?.users) {
      const users = response.body.data.users
      
      // Delete test users (identified by email pattern)
      const testUsers = users.filter((user: any) => 
        user.email.includes('cypress-') || 
        user.email.includes('@e2e-test.com') ||
        user.email.includes('test-') ||
        user.name.includes('Test ')
      )
      
      cy.log(`Found ${testUsers.length} test users to clean up`)
      
      testUsers.forEach((user: any) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('BACKEND_URL')}/graphql`,
          body: {
            query: deleteUserMutation,
            variables: { id: user.id }
          },
          headers: {
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((deleteResponse) => {
          if (deleteResponse.status === 200) {
            cy.log(`✅ Deleted test user: ${user.name} (${user.email})`)
          }
        })
      })
    }
  })
})

// Clean up workouts for specific client
Cypress.Commands.add('cleanupWorkouts', (clientId?: string) => {
  const deleteWorkoutMutation = `
    mutation DeleteWorkout($id: ID!) {
      deleteWorkout(id: $id) {
        id
      }
    }
  `

  // Get all workouts and delete test ones
  const getWorkoutsQuery = `
    query GetWorkouts($clientId: ID) {
      workouts(clientId: $clientId) {
        id
        name
        createdAt
      }
    }
  `

  cy.request({
    method: 'POST',
    url: `${Cypress.env('BACKEND_URL')}/graphql`,
    body: {
      query: getWorkoutsQuery,
      variables: clientId ? { clientId } : {}
    },
    headers: {
      'Content-Type': 'application/json'
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body.data?.workouts) {
      const workouts = response.body.data.workouts
      
      // Delete workouts that look like test data
      workouts.forEach((workout: any) => {
        if (
          workout.name.includes('BASE') || 
          workout.name.includes('Treino Importado') ||
          workout.name.includes('Test') ||
          workout.name.includes('teste')
        ) {
          cy.request({
            method: 'POST',
            url: `${Cypress.env('BACKEND_URL')}/graphql`,
            body: {
              query: deleteWorkoutMutation,
              variables: { id: workout.id }
            },
            headers: {
              'Content-Type': 'application/json'
            },
            failOnStatusCode: false
          })
        }
      })
    }
  })
})

// Clean up all test workouts from all clients
Cypress.Commands.add('cleanupAllTestWorkouts', () => {
  const deleteWorkoutMutation = `
    mutation DeleteWorkout($id: ID!) {
      deleteWorkout(id: $id) {
        id
      }
    }
  `

  const getAllWorkoutsQuery = `
    query GetAllWorkouts {
      workouts {
        id
        name
        createdAt
      }
    }
  `

  cy.request({
    method: 'POST',
    url: `${Cypress.env('BACKEND_URL')}/graphql`,
    body: {
      query: getAllWorkoutsQuery
    },
    headers: {
      'Content-Type': 'application/json'
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body.data?.workouts) {
      const workouts = response.body.data.workouts
      
      // Delete workouts created in the last hour (likely test data)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      workouts.forEach((workout: any) => {
        const createdAt = new Date(workout.createdAt)
        if (
          createdAt > oneHourAgo || 
          workout.name.includes('BASE') || 
          workout.name.includes('Treino Importado') ||
          workout.name.includes('Test') ||
          workout.name.includes('teste')
        ) {
          cy.request({
            method: 'POST',
            url: `${Cypress.env('BACKEND_URL')}/graphql`,
            body: {
              query: deleteWorkoutMutation,
              variables: { id: workout.id }
            },
            headers: {
              'Content-Type': 'application/json'
            },
            failOnStatusCode: false
          })
        }
      })
    }
  })
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

// Upload workout file command
Cypress.Commands.add('uploadWorkoutFile', () => {
  // Upload the file and let the real backend process it
  cy.get('input[type="file"]').selectFile('cypress/fixtures/workout-test.xlsx', { force: true })
  
  // Wait for real processing and verify success
  cy.get('.ant-message-success, .ant-notification-notice-success', { timeout: 15000 })
    .should('be.visible')
})

export {}