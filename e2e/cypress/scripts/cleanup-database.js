// Manual database cleanup script
// Run with: node cypress/scripts/cleanup-database.js

const { execSync } = require('child_process');

console.log('🧹 Cleaning up test data from database...');

try {
  // Method 1: Use Cypress command to clean up
  console.log('Running Cypress cleanup command...');
  execSync('npx cypress run --spec "cypress/support/cleanup-helper.cy.ts"', { stdio: 'inherit' });
  
  console.log('✅ Database cleanup completed!');
} catch (error) {
  console.error('❌ Cleanup failed:', error.message);
  
  // Method 2: Direct GraphQL cleanup
  console.log('Trying direct GraphQL cleanup...');
  
  const cleanup = async () => {
    const fetch = require('node-fetch');
    
    const query = `
      query GetAllWorkouts {
        workouts {
          id
          name
          createdAt
        }
      }
    `;
    
    const deleteQuery = `
      mutation DeleteWorkout($id: ID!) {
        deleteWorkout(id: $id) {
          id
        }
      }
    `;
    
    try {
      // Get workouts
      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      const workouts = data.data?.workouts || [];
      
      // Delete test workouts
      const testWorkouts = workouts.filter(w => 
        w.name.includes('BASE') || 
        w.name.includes('Treino Importado') ||
        w.name.includes('Test') ||
        w.name.includes('teste')
      );
      
      console.log(`Found ${testWorkouts.length} test workouts to delete`);
      
      for (const workout of testWorkouts) {
        await fetch('http://localhost:3001/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: deleteQuery,
            variables: { id: workout.id }
          })
        });
        console.log(`Deleted workout: ${workout.name}`);
      }
      
      console.log('✅ Direct cleanup completed!');
    } catch (err) {
      console.error('❌ Direct cleanup failed:', err.message);
      console.log('💡 Please clean up manually via the application');
    }
  };
  
  cleanup();
}