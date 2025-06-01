# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DietTreinoAI is a monorepo fitness and nutrition management platform with three components:
- **Backend**: NestJS GraphQL API with PostgreSQL
- **Frontend**: Vue 3 web application  
- **Mobile**: React Native/Expo mobile app

## Development Commands

### Backend (NestJS + GraphQL)
```bash
cd backend
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run lint             # Lint and fix code

# Database migrations
npm run migration:generate --name=MigrationName
npm run migration:run    # Apply pending migrations
npm run migration:revert # Revert last migration
```

### Frontend (Vue 3 + Vite)
```bash
cd frontend
npm run dev              # Start dev server (includes GraphQL codegen)
npm run generate         # Generate GraphQL types/composables
npm run build            # Build for production
npm run test             # Run tests with Vitest
npm run test:ui          # Run tests with UI
```

### Mobile (React Native + Expo)
```bash
cd mobile
npx expo start           # Start Expo development server
npx expo run:android     # Run on Android
npx expo run:ios         # Run on iOS
npm run test             # Run Jest tests
```

## Architecture

### Backend Architecture
- **Modular NestJS**: Domain modules in `src/modules/` (auth, users, workout, exercise, etc.)
- **GraphQL Code-First**: Schema auto-generated from TypeScript decorators
- **TypeORM**: Database entities in `src/entities/` with migrations in `src/migrations/`
- **JWT Authentication**: Multi-role system (CLIENT, TRAINER, NUTRITIONIST)
- **Base Entity Pattern**: Common fields (id, createdAt, updatedAt) inherited by all entities

**Key modules**: auth, users, workout, training-day, exercise, xlsx (Excel processing), weekly-load

### Frontend Architecture  
- **Vue 3 Composition API**: Business logic in `src/composables/`
- **Auto-generated GraphQL**: Types and composables generated from backend schema
- **Component Libraries**: Ant Design Vue + PrimeVue + Tailwind CSS
- **Apollo Client**: GraphQL state management
- **Authentication**: JWT token management with refresh token support

**Key patterns**: GraphQL composables for API calls, auth guards on routes, reactive authentication state

### Mobile Architecture
- **Expo Router**: File-based routing in `app/` directory
- **UI Kitten**: Eva Design System for consistent UI
- **Zustand**: Lightweight state management
- **Component Structure**: Modular workout and exercise components

## GraphQL Integration

The frontend automatically generates TypeScript types and Vue composables from the backend GraphQL schema:

```bash
# Frontend generates types on dev start, or manually:
npm run generate
```

Key files:
- `frontend/src/generated/graphql.ts` - Auto-generated types and composables
- `frontend/codegen.yml` - GraphQL Codegen configuration
- `backend/src/schema.graphql` - Auto-generated schema

## Database Schema

Core entities and relationships:
- **User**: Multi-role (Client/Trainer/Nutritionist) with optional trainer assignment
- **Workout**: Weekly training programs with active status (one active per user)
- **TrainingDay**: Daily structure within workouts (max 7 days per workout) 
- **Exercise**: Exercise catalog with video links
- **TrainingDayExercise**: Junction with rep schemes and rest intervals

Key constraints:
- Users can have multiple workouts but only one active
- Workouts limited to 7 training days maximum
- Trainer-client relationships supported

## Authentication System

- **JWT-based**: Access tokens (15min) + refresh tokens (7 days)
- **Auto-refresh**: Frontend automatically refreshes tokens before expiration
- **Role-based access**: Guards implemented in GraphQL resolvers and Vue router
- **Session monitoring**: Automatic logout on token expiration

## Excel Processing

Backend supports Excel file uploads for bulk workout imports via the xlsx module. Files are processed and converted to workout structures.

## Testing

- **Backend**: Jest with TestContainers for integration tests
- **Frontend**: Vitest for unit tests with Vue Test Utils
- **Mobile**: Jest Expo for React Native testing

Run specific tests:
```bash
npm test -- filename.spec.ts  # Run specific test file
npm run test:watch            # Watch mode
```

## Key Development Notes

- Frontend automatically runs GraphQL codegen on `npm run dev`
- Backend uses code-first GraphQL - schema is generated from TypeScript
- All three apps use TypeScript with strict type checking
- Authentication state is shared between Apollo Client and Vue Router
- Mobile uses Expo managed workflow with custom development builds
- Database migrations must be generated and run manually