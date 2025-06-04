describe('Client Management', () => {
  beforeEach(() => {
    cy.loginAsTrainer()
    cy.visit('/clients')
  })

  it('should display clients list page', () => {
    cy.get('h1, h2').should('contain.text', 'Client')
    cy.get('[data-testid="client-list"], .client-list, .ant-table').should('be.visible')
  })

  it('should show client cards in grid view', () => {
    cy.get('[data-testid="view-toggle"], .view-toggle').click()
    cy.get('.client-card, [data-testid="client-card"]').should('be.visible')
  })

  it('should filter clients by status', () => {
    cy.get('.ant-select-selector').contains('Status').click()
    cy.get('.ant-select-item').contains('Ativo').click()
    cy.get('.client-list .ant-table-row, .client-card').should('be.visible')
  })

  it('should search clients by name', () => {
    cy.get('input[placeholder*="Buscar"], input[placeholder*="Search"]').type('Test')
    cy.get('.client-list .ant-table-row, .client-card').should('contain.text', 'Test')
  })

  context('Client CRUD Operations', () => {
    it('should create a new client', () => {
      cy.get('[data-testid="add-client"], .add-client, button').contains('Novo').click()
      
      cy.get('input[name="name"], input[placeholder*="Nome"]').type('João Silva')
      cy.get('input[name="email"], input[type="email"]').type('joao@test.com')
      cy.get('input[name="phone"], input[placeholder*="Telefone"]').type('11999999999')
      
      cy.get('button[type="submit"], .ant-btn-primary').contains('Salvar').click()
      
      cy.get('.ant-message-success, .ant-notification-notice-success').should('be.visible')
      cy.get('.client-list').should('contain.text', 'João Silva')
    })

    it('should edit an existing client', () => {
      cy.get('.client-list .ant-table-row').first().within(() => {
        cy.get('.ant-dropdown-trigger, [data-testid="client-actions"]').click()
      })
      
      cy.get('.ant-dropdown-menu-item').contains('Editar').click()
      
      cy.get('input[name="name"], input[placeholder*="Nome"]').clear().type('João Silva Editado')
      cy.get('button[type="submit"], .ant-btn-primary').contains('Salvar').click()
      
      cy.get('.ant-message-success').should('be.visible')
      cy.get('.client-list').should('contain.text', 'João Silva Editado')
    })

    it('should delete a client', () => {
      cy.get('.client-list .ant-table-row').first().within(() => {
        cy.get('.ant-dropdown-trigger, [data-testid="client-actions"]').click()
      })
      
      cy.get('.ant-dropdown-menu-item').contains('Excluir').click()
      cy.get('.ant-modal-confirm .ant-btn-dangerous').click()
      
      cy.get('.ant-message-success').should('be.visible')
    })

    it('should view client details', () => {
      cy.get('.client-list .ant-table-row').first().within(() => {
        cy.get('button, .ant-btn').contains('View', 'Detalhes').click()
      })
      
      cy.url().should('include', '/clients/')
      cy.get('h1, h2').should('contain.text', 'Detalhes')
    })
  })

  context('Client Workout Management', () => {
    beforeEach(() => {
      cy.get('.client-list .ant-table-row').first().within(() => {
        cy.get('button, .ant-btn').contains('View', 'Detalhes').click()
      })
    })

    it('should create a new workout for client', () => {
      cy.get('button').contains('Novo Treino').click()
      
      cy.get('input[name="name"], input[placeholder*="Nome"]').type('Treino de Segunda')
      
      // Test day selector functionality
      cy.get('[data-testid="day-selector"], .day-selector').within(() => {
        cy.get('button').contains('S').first().click() // Segunda
      })
      
      cy.get('button[type="submit"], .ant-btn-primary').contains('Criar').click()
      
      cy.get('.ant-message-success').should('be.visible')
      cy.get('.workout-list').should('contain.text', 'Treino de Segunda')
    })

    it('should edit workout exercises', () => {
      cy.get('.workout-list .workout-card').first().within(() => {
        cy.get('button').contains('Editar').click()
      })
      
      cy.get('.ant-modal').should('be.visible')
      cy.get('.ant-modal-title').should('contain.text', 'Editar Treino')
      
      // Add an exercise
      cy.get('button').contains('Adicionar Exercício').click()
      
      // Select exercise from dropdown
      cy.get('.ant-select').first().click()
      cy.get('.ant-select-item').first().click()
      
      // Set reps and rest
      cy.get('input[placeholder*="Séries"]').clear().type('3')
      cy.get('input[placeholder*="Repetições"]').clear().type('8-12')
      cy.get('input[placeholder*="Descanso"]').clear().type('90s')
      
      cy.get('.ant-modal-footer button').contains('Salvar').click()
      
      cy.get('.ant-message-success').should('be.visible')
    })

    it('should reorder training days via drag and drop', () => {
      cy.get('.workout-list .workout-card').first().within(() => {
        cy.get('button').contains('Editar').click()
      })
      
      // Test drag and drop functionality
      cy.get('.training-day-tab').first().trigger('dragstart')
      cy.get('.training-day-tab').last().trigger('drop')
      
      cy.get('.ant-modal-footer button').contains('Salvar').click()
      cy.get('.ant-message-success').should('be.visible')
    })

    it('should prevent editing started workouts', () => {
      // Assuming there's a started workout
      cy.get('.workout-list .workout-card').contains('Iniciado').within(() => {
        cy.get('button').contains('Editar').should('be.disabled')
      })
    })
  })

  context('Excel Import/Export', () => {
    it('should import workout from Excel file', () => {
      cy.get('button').contains('Importar').click()
      
      const fileName = 'workout-test.xlsx'
      cy.fixture(fileName, 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then(fileContent => {
          cy.get('input[type="file"]').selectFile({
            contents: fileContent,
            fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
        })
      
      cy.get('button').contains('Upload').click()
      cy.get('.ant-message-success').should('be.visible')
    })
  })
})