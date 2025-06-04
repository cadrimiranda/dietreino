// Helper test file for running cleanup commands
// This file is used by the cleanup script

describe('Database Cleanup Helper', () => {
  it('should clean up all test workouts', () => {
    cy.cleanupAllTestWorkouts()
    cy.log('✅ Cleanup completed')
  })
})