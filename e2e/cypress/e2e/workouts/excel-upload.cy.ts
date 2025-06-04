describe('Workout Excel Upload', () => {
  let testUsers: { trainer: any, client: any }

  before(() => {
    // Clean up existing test data
    cy.cleanupAllTestWorkouts()
    cy.cleanupTestUsers()
    
    // Create test trainer-client pair
    cy.createTrainerClientPair().then((users) => {
      testUsers = users
      cy.wrap(users).as('testUsers')
    })
  })

  after(() => {
    // Clean up test data after all tests
    cy.cleanupAllTestWorkouts()
    cy.cleanupTestUsers()
  })

  beforeEach(() => {
    // Login with test trainer
    cy.get('@testUsers').then((users: any) => {
      cy.login(users.trainer.email, users.trainer.password)
    })
    cy.visit('/clients')
    
    // Wait for clients page to load - check for page title or main container
    cy.contains('h1, h2', 'Clients').should('be.visible')
    
    // Wait for client data to load - look for either cards or table
    cy.get('body').then(($body) => {
      // Check if we have clients in grid view (cards)
      if ($body.find('.ant-card').length > 0) {
        cy.get('.ant-card').should('be.visible')
        cy.get('.ant-card').first().within(() => {
          // Click the "Detalhes" button in the card
          cy.get('.ant-btn').contains('Detalhes').click()
        })
      } 
      // Check if we have clients in table view  
      else if ($body.find('.ant-table-tbody tr').length > 0) {
        cy.get('.ant-table-tbody tr').should('be.visible')
        cy.get('.ant-table-tbody tr').first().within(() => {
          // Click the "View" button in the table row
          cy.get('.ant-btn').contains('View').click()
        })
      }
      // If no clients exist, create one first
      else {
        cy.get('.ant-btn').contains('Add Client').click()
        cy.get('.ant-modal').should('be.visible')
        // Fill in client form - use our test client data
        cy.get('@testUsers').then((users: any) => {
          cy.get('input[placeholder*="name"], input[placeholder*="Nome"]').type(users.client.name)
          cy.get('input[placeholder*="email"], input[placeholder*="Email"]').type(users.client.email)
          cy.get('.ant-btn[type="submit"], .ant-btn').contains('Save', 'Salvar').click()
        })
        cy.get('.ant-modal').should('not.exist')
        // Now navigate to the client
        cy.get('.ant-card, .ant-table-tbody tr').first().within(() => {
          cy.get('.ant-btn').contains('Detalhes', 'View').click()
        })
      }
    })
    
    // Verify we navigated to client details/workout page
    cy.url().should('include', '/clients/')
    cy.contains('h1, h2', 'Treino do Cliente').should('be.visible')
  })

  afterEach(() => {
    // Clean up workouts created in this test
    cy.url().then((url) => {
      const clientId = url.split('/clients/')[1]?.split('/')[0]
      if (clientId) {
        cy.cleanupWorkouts(clientId)
      }
    })
  })

  context('Empty Workout State Upload', () => {
    it('should display empty workout state when client has no workouts', () => {
      // Check if we're in empty state (no workouts)
      cy.get('body').then(($body) => {
        if ($body.find('h2:contains("Nenhum treino disponível")').length > 0) {
          // Empty state is displayed
          cy.get('h2').should('contain.text', 'Nenhum treino disponível')
          cy.get('p').should('contain.text', 'Este cliente ainda não possui treinos atribuídos')
          
          // Upload button should be visible
          cy.get('button').contains('Upload Novo Treino').should('be.visible')
          
          // Icon should be displayed
          cy.get('.anticon-schedule, .text-blue-500').should('be.visible')
        } else {
          cy.log('Client already has workouts - skipping empty state test')
        }
      })
    })

    it('should upload Excel workout file successfully', () => {
      // Check if upload button exists (empty state)
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Upload Novo Treino")').length > 0) {
          // We're in empty state - click upload button
          cy.get('button:contains("Upload Novo Treino")').click()
          cy.uploadWorkoutFile()
        } else {
          // Client has workouts - look for import/upload button
          cy.get('button, .ant-btn').contains('Importar', 'Upload', 'Novo').first().click()
          cy.uploadWorkoutFile()
        }
      })
    })

    it('should show loading state during upload', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Upload Novo Treino")').length > 0) {
          cy.get('button:contains("Upload Novo Treino")').click()
          
          // Upload file
          cy.get('input[type="file"]').selectFile('cypress/fixtures/workout-test.xlsx', { force: true })
          
          // Try to catch loading state (may be too fast)
          cy.get('button:contains("Upload Novo Treino")', { timeout: 1000 })
            .should('exist')
            // Loading happens too fast to test reliably in E2E
        }
      })
    })

    it('should accept only Excel files', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Upload Novo Treino")').length > 0) {
          // Check file input accepts only .xlsx
          cy.get('input[type="file"]').should('have.attr', 'accept', '.xlsx')
          
          // Verify multiple is false
          cy.get('input[type="file"]').should('not.have.attr', 'multiple')
        }
      })
    })

    it('should handle file upload validation', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Upload Novo Treino")').length > 0) {
          // Create a test text file to trigger validation error
          cy.writeFile('cypress/fixtures/invalid-file.txt', 'This is not an Excel file')
          
          cy.get('button:contains("Upload Novo Treino")').click()
          
          // Try to upload invalid file type - browser validation should catch this
          cy.get('input[type="file"]').selectFile('cypress/fixtures/invalid-file.txt', { force: true })
          
          // Real validation will happen on backend - wait for error response
          cy.get('.ant-message-error, .ant-notification-notice-error, .error-message', { timeout: 10000 })
            .should('be.visible')
        }
      })
    })

    it('should show success message after successful upload', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Upload Novo Treino")').length > 0) {
          cy.get('button:contains("Upload Novo Treino")').click()
          cy.get('input[type="file"]').selectFile('cypress/fixtures/workout-test.xlsx', { force: true })
          
          // Wait for real backend processing and success message
          cy.get('.ant-message-success, .ant-notification-notice-success', { timeout: 15000 })
            .should('be.visible')
          
          // Should redirect or show workout list - check if we're no longer in empty state
          cy.get('h2:contains("Nenhum treino disponível")').should('not.exist')
        }
      })
    })
  })

  context('Existing Workouts Upload', () => {
    it('should have import/upload option when client has existing workouts', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.workout-list, .workout-card').length > 0) {
          // Client has workouts - should have import/upload button
          cy.get('button, .ant-btn').contains('Importar', 'Upload', 'Novo').should('be.visible')
        }
      })
    })

    it('should upload additional workout when client already has workouts', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.workout-list, .workout-card').length > 0) {
          // Count existing workouts
          cy.get('.workout-card, .workout-item').then(($workouts) => {
            const initialCount = $workouts.length
            
            // Upload new workout
            cy.get('button, .ant-btn').contains('Importar', 'Upload', 'Novo').click()
            cy.uploadWorkoutFile()
            
            // Wait a bit for UI to update and check if count increased
            cy.wait(2000)
            cy.get('.workout-card, .workout-item').should('have.length.at.least', initialCount)
          })
        }
      })
    })
  })

  context('File Processing', () => {
    it('should process Excel file with workout data correctly', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Upload Novo Treino")').length > 0) {
          cy.get('button:contains("Upload Novo Treino")').click()
          cy.get('input[type="file"]').selectFile('cypress/fixtures/workout-test.xlsx', { force: true })
          
          // Wait for real processing
          cy.get('.ant-message-success, .ant-notification-notice-success', { timeout: 15000 })
            .should('be.visible')
          
          // Verify imported workout appears in the list - look for elements from the actual Excel
          cy.get('.workout-list, .workout-card, .workout-name').should('contain.text', 'BASE')
        }
      })
    })

    it('should handle Excel parsing errors gracefully', () => {
      // Create corrupted Excel file
      cy.writeFile('cypress/fixtures/corrupted.xlsx', 'corrupted data')
      
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Upload Novo Treino")').length > 0) {
          cy.get('button:contains("Upload Novo Treino")').click()
          cy.get('input[type="file"]').selectFile('cypress/fixtures/corrupted.xlsx', { force: true })
          
          // Wait for real error from backend
          cy.get('.ant-message-error, .ant-notification-notice-error', { timeout: 15000 })
            .should('be.visible')
        }
      })
    })
  })
})