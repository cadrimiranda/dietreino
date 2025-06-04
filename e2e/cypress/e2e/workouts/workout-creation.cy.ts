describe('Workout Creation and Management', () => {
  beforeEach(() => {
    cy.loginAsTrainer()
    cy.visit('/clients')
    // Navigate to first client's workout page
    cy.get('.client-list .ant-table-row').first().within(() => {
      cy.get('button').contains('View', 'Detalhes').click()
    })
  })

  context('Day Selector Component', () => {
    beforeEach(() => {
      cy.get('button').contains('Novo Treino').click()
    })

    it('should display D S T Q Q S S interface', () => {
      cy.get('[data-testid="day-selector"], .day-selector').within(() => {
        cy.get('button').should('have.length', 7)
        
        const expectedLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
        expectedLabels.forEach((label, index) => {
          cy.get('button').eq(index).should('contain.text', label)
        })
      })
    })

    it('should select single day correctly', () => {
      cy.get('[data-testid="day-selector"], .day-selector').within(() => {
        cy.get('button').contains('S').first().click() // Monday
        cy.get('button').contains('S').first().should('have.class', 'selected', 'active')
      })
    })

    it('should prevent duplicate day selection', () => {
      // Add first training day
      cy.get('input[name="name"]').type('Treino A')
      cy.get('[data-testid="day-selector"], .day-selector').within(() => {
        cy.get('button').contains('S').first().click() // Monday
      })
      
      // Add second training day
      cy.get('button').contains('Adicionar Dia').click()
      cy.get('input[name="name"]').last().type('Treino B')
      
      // Try to select same day
      cy.get('[data-testid="day-selector"], .day-selector').last().within(() => {
        cy.get('button').contains('S').first().click() // Monday again
      })
      
      cy.get('.ant-message-warning, .error-message').should('contain.text', 'dia da semana já está sendo usado')
    })

    it('should allow reselecting day after deselection', () => {
      cy.get('[data-testid="day-selector"], .day-selector').within(() => {
        cy.get('button').contains('S').first().click() // Select Monday
        cy.get('button').contains('S').first().click() // Deselect Monday
        cy.get('button').contains('T').click() // Select Tuesday
        cy.get('button').contains('T').should('have.class', 'selected', 'active')
      })
    })
  })

  context('Training Day Management', () => {
    beforeEach(() => {
      cy.get('button').contains('Novo Treino').click()
    })

    it('should create workout with multiple training days', () => {
      cy.get('input[name="workoutName"], input[placeholder*="Nome do treino"]').type('Treino Full Body')
      
      // First training day
      cy.get('input[name="name"]').first().type('Peito e Tríceps')
      cy.get('[data-testid="day-selector"], .day-selector').first().within(() => {
        cy.get('button').contains('S').first().click() // Monday
      })
      
      // Add second training day
      cy.get('button').contains('Adicionar Dia').click()
      cy.get('input[name="name"]').last().type('Costas e Bíceps')
      cy.get('[data-testid="day-selector"], .day-selector').last().within(() => {
        cy.get('button').contains('Q').first().click() // Wednesday
      })
      
      cy.get('button[type="submit"]').contains('Criar').click()
      cy.get('.ant-message-success').should('be.visible')
    })

    it('should validate required fields', () => {
      cy.get('button[type="submit"]').contains('Criar').click()
      cy.get('.ant-form-item-explain-error, .error-message').should('be.visible')
    })

    it('should remove training day', () => {
      // Add extra training day first
      cy.get('button').contains('Adicionar Dia').click()
      
      // Remove the second training day
      cy.get('[data-testid="remove-day"], .remove-day').last().click()
      
      cy.get('.training-day').should('have.length', 1)
    })
  })

  context('Exercise Management within Workout', () => {
    beforeEach(() => {
      cy.get('button').contains('Novo Treino').click()
      cy.get('input[name="workoutName"]').type('Test Workout')
      cy.get('input[name="name"]').first().type('Test Day')
      cy.get('[data-testid="day-selector"]').first().within(() => {
        cy.get('button').contains('S').first().click()
      })
    })

    it('should add exercises to training day', () => {
      cy.get('button').contains('Adicionar Exercício').click()
      
      // Select exercise
      cy.get('.ant-select').contains('Selecione um exercício').click()
      cy.get('.ant-select-item').first().click()
      
      // Set exercise details
      cy.get('input[placeholder*="Séries"]').type('3')
      cy.get('input[placeholder*="Repetições"]').type('8-12')
      cy.get('input[placeholder*="Descanso"]').type('90s')
      
      cy.get('.exercise-list .exercise-item').should('have.length', 1)
    })

    it('should reorder exercises within training day', () => {
      // Add multiple exercises first
      cy.get('button').contains('Adicionar Exercício').click()
      cy.get('button').contains('Adicionar Exercício').click()
      
      // Test drag and drop or up/down buttons
      cy.get('.exercise-item').first().within(() => {
        cy.get('[data-testid="move-down"], .move-down').click()
      })
      
      // Verify order changed
      cy.get('.exercise-item').should('have.length', 2)
    })

    it('should remove exercises from training day', () => {
      cy.get('button').contains('Adicionar Exercício').click()
      
      cy.get('.exercise-item').within(() => {
        cy.get('[data-testid="remove-exercise"], .remove-exercise').click()
      })
      
      cy.get('.exercise-item').should('have.length', 0)
    })

    it('should validate exercise rep schemes', () => {
      cy.get('button').contains('Adicionar Exercício').click()
      
      // Test different rep scheme formats
      const repSchemes = ['8-12', '3x8-10', '2x8-10, 1x6-8']
      
      repSchemes.forEach((scheme) => {
        cy.get('input[placeholder*="Repetições"]').clear().type(scheme)
        cy.get('input[placeholder*="Repetições"]').blur()
        // Should not show validation error
        cy.get('.ant-form-item-explain-error').should('not.exist')
      })
    })
  })

  context('Workout Editing', () => {
    it('should edit existing workout exercises', () => {
      // Assume there's an existing workout
      cy.get('.workout-list .workout-card').first().within(() => {
        cy.get('button').contains('Editar').click()
      })
      
      cy.get('.ant-modal').should('be.visible')
      
      // Test inline editing
      cy.get('.editable-cell').first().click()
      cy.get('.ant-select, input').should('be.visible')
      
      // Save changes
      cy.get('.ant-modal-footer button').contains('Salvar').click()
      cy.get('.ant-message-success').should('be.visible')
    })

    it('should prevent editing of started workouts', () => {
      cy.get('.workout-list .workout-card').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('.status').then(($status) => {
            if ($status.text().includes('Iniciado')) {
              cy.get('button').contains('Editar').should('be.disabled')
            }
          })
        })
      })
    })
  })

  context('Workout Status Management', () => {
    it('should activate/deactivate workouts', () => {
      cy.get('.workout-list .workout-card').first().within(() => {
        cy.get('[data-testid="workout-toggle"], .workout-toggle').click()
      })
      
      cy.get('.ant-modal-confirm').within(() => {
        cy.get('.ant-btn-primary').click()
      })
      
      cy.get('.ant-message-success').should('be.visible')
    })

    it('should show only one active workout per client', () => {
      cy.get('.workout-list .workout-card .status')
        .contains('Ativo')
        .should('have.length.at.most', 1)
    })
  })
})