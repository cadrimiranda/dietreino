# DietTreinoAI E2E Tests

End-to-end testing suite using Cypress for the DietTreinoAI monorepo project.

## Overview

This E2E testing project covers:
- **Authentication flows** (login/logout)
- **Client management** (CRUD operations)
- **Workout creation and editing**
- **Day selector functionality** (D S T Q Q S S interface)
- **Exercise management**
- **Excel import/export**

## Project Structure

```
e2e/
├── cypress/
│   ├── e2e/                    # Test specifications
│   │   ├── auth/
│   │   │   └── login.cy.ts
│   │   ├── clients/
│   │   │   └── client-management.cy.ts
│   │   └── workouts/
│   │       └── workout-creation.cy.ts
│   ├── fixtures/               # Test data
│   │   └── users.json
│   └── support/               # Support files and commands
│       ├── commands.ts        # Custom Cypress commands
│       └── e2e.ts            # Global configuration
├── cypress.config.ts          # Cypress configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   The tests are configured to use:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:3001`
   - Mobile: `http://localhost:8081`

3. **Ensure test data exists:**
   Create test users in your database:
   ```json
   {
     "trainer": {
       "email": "trainer@dietreino.com",
       "password": "password123",
       "role": "TRAINER"
     },
     "client": {
       "email": "client@dietreino.com", 
       "password": "password123",
       "role": "CLIENT"
     }
   }
   ```

## Running Tests

### Interactive Mode (Cypress UI)
```bash
npm run cypress:open
```

### Headless Mode
```bash
npm run cypress:run
```

### Specific Browser
```bash
npm run cypress:run:chrome
```

### Development Mode
```bash
npm run test:dev
```

## Custom Commands

The project includes custom Cypress commands for common operations:

- `cy.login(email, password)` - Login with credentials
- `cy.loginAsTrainer()` - Login as predefined trainer
- `cy.loginAsClient()` - Login as predefined client
- `cy.createTestUser(role)` - Create test user via GraphQL
- `cy.cleanupTestData()` - Clean up test data
- `cy.visitFrontend(path)` - Visit frontend URL
- `cy.waitForGraphQL(operationName)` - Wait for GraphQL operations

## Test Coverage

### Authentication Tests (`auth/login.cy.ts`)
- ✅ Login form validation
- ✅ Invalid credentials handling
- ✅ Successful login flow
- ✅ Session persistence
- ✅ Logout functionality

### Client Management Tests (`clients/client-management.cy.ts`)
- ✅ Client list display (table/grid views)
- ✅ Client filtering and search
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Client details navigation
- ✅ Workout management for clients
- ✅ Excel import/export

### Workout Creation Tests (`workouts/workout-creation.cy.ts`)
- ✅ Day selector component (D S T Q Q S S interface)
- ✅ Training day management
- ✅ Exercise addition and management
- ✅ Workout editing with inline edits
- ✅ Drag and drop functionality
- ✅ Validation and error handling

## Key Features Tested

### Day Selector Component
Tests the unique D S T Q Q S S (Dom/Seg/Ter/Qua/Qui/Sex/Sáb) interface:
- Single day selection
- Duplicate day prevention
- Day conflict validation
- Visual feedback for selected days

### Workout Editor
Tests the advanced workout editing modal:
- Inline editing of exercises
- Drag and drop reordering
- Rep scheme parsing ("8-12", "3x8-10", etc.)
- Rest interval configuration
- Training day management

### GraphQL Integration
Tests GraphQL operations:
- Mutations for creating/updating data
- Query result validation
- Error handling
- Loading states

## Best Practices

1. **Test Isolation**: Each test cleans up after itself
2. **Custom Commands**: Reusable commands for common operations
3. **Page Object Pattern**: Organized selectors and actions
4. **Fixtures**: Centralized test data management
5. **TypeScript**: Full type safety for tests

## CI/CD Integration

The tests are designed to run in CI environments:
- Headless execution
- Video recording on failures
- Screenshot capture
- Configurable browser selection

## Troubleshooting

### Common Issues

1. **Tests failing due to timing**: Use `cy.waitForGraphQL()` for async operations
2. **Element not found**: Check if selectors match the actual DOM
3. **Authentication issues**: Verify test user credentials exist
4. **Network requests**: Ensure backend is running on port 3001

### Debug Mode
Run tests with debug information:
```bash
DEBUG=cypress:* npm run cypress:run
```

## Contributing

When adding new tests:
1. Follow the existing structure
2. Use TypeScript for type safety
3. Add custom commands for reusable functionality
4. Include proper test data cleanup
5. Document test scenarios clearly