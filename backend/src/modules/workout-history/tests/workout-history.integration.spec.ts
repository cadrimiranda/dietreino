import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

import {
  WorkoutHistory,
  WorkoutHistoryExercise,
  WorkoutHistoryExerciseSet,
  User,
  Workout,
  Exercise,
} from '@/entities';
import { UserRole } from '../../../utils/roles.enum';
import { WorkoutHistoryModule } from '../workout-history.module';
import { WorkoutHistoryService } from '../workout-history.service';
import { WorkoutHistoryResolver } from '../workout-history.resolver';
import { CreateWorkoutHistoryInput } from '../dto/create-workout-history.input';

describe('WorkoutHistory Integration Tests', () => {
  let app: INestApplication;
  let service: WorkoutHistoryService;
  let resolver: WorkoutHistoryResolver;
  let workoutHistoryRepo: Repository<WorkoutHistory>;
  let userRepo: Repository<User>;
  let workoutRepo: Repository<Workout>;
  let exerciseRepo: Repository<Exercise>;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getPassword(),
          database: container.getDatabase(),
          entities: [
            WorkoutHistory,
            WorkoutHistoryExercise,
            WorkoutHistoryExerciseSet,
            User,
            Workout,
            Exercise,
          ],
          synchronize: true,
          logging: false,
        }),
        WorkoutHistoryModule,
        TypeOrmModule.forFeature([User, Workout, Exercise]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<WorkoutHistoryService>(WorkoutHistoryService);
    resolver = moduleFixture.get<WorkoutHistoryResolver>(
      WorkoutHistoryResolver,
    );
    workoutHistoryRepo = moduleFixture.get('WorkoutHistoryRepository');
    userRepo = moduleFixture.get('UserRepository');
    workoutRepo = moduleFixture.get('WorkoutRepository');
    exerciseRepo = moduleFixture.get('ExerciseRepository');
  });

  afterAll(async () => {
    await app?.close();
    await container?.stop();
  });

  beforeEach(async () => {
    // Clean all tables before each test
    await workoutHistoryRepo.query(
      'TRUNCATE TABLE workout_history_exercise_sets CASCADE',
    );
    await workoutHistoryRepo.query(
      'TRUNCATE TABLE workout_history_exercises CASCADE',
    );
    await workoutHistoryRepo.query('TRUNCATE TABLE workout_history CASCADE');
    await workoutRepo.query('TRUNCATE TABLE workout CASCADE');
    await exerciseRepo.query('TRUNCATE TABLE exercise CASCADE');
    await userRepo.query('TRUNCATE TABLE users CASCADE');
  });

  describe('Service Integration Tests', () => {
    it('should create a complete workout history', async () => {
      // Setup test data
      const user = await userRepo.save({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: UserRole.CLIENT,
      });

      const workout = await workoutRepo.save({
        user: user,
        name: 'Test Workout',
        week_start: new Date('2024-01-15'),
        week_end: new Date('2024-01-21'),
        is_active: true,
      });

      const exercise = await exerciseRepo.save({
        name: 'Supino Reto',
        muscle_group: 'Peito',
        equipment: 'Barra',
        instructions: 'Execute o movimento',
      });

      const createInput: CreateWorkoutHistoryInput = {
        userId: user.id.toString(),
        workoutId: workout.id.toString(),
        executedAt: new Date('2024-01-15T10:00:00Z'),
        workoutName: 'Test Workout',
        trainingDayOrder: 1,
        trainingDayName: 'Peito e Tríceps',
        notes: 'Treino completo',
        durationMinutes: 60,
        exercises: [
          {
            exerciseId: exercise.id.toString(),
            order: 1,
            exerciseName: 'Supino Reto',
            plannedSets: 3,
            completedSets: 3,
            notes: 'Boa execução',
            sets: [
              {
                setNumber: 1,
                weight: 80,
                reps: 12,
                plannedRepsMin: 10,
                plannedRepsMax: 12,
                restSeconds: 60,
                isCompleted: true,
                isFailure: false,
                notes: 'Primeira série',
                executedAt: new Date('2024-01-15T10:05:00Z'),
              },
              {
                setNumber: 2,
                weight: 80,
                reps: 11,
                plannedRepsMin: 10,
                plannedRepsMax: 12,
                restSeconds: 60,
                isCompleted: true,
                isFailure: false,
                notes: 'Segunda série',
                executedAt: new Date('2024-01-15T10:07:00Z'),
              },
              {
                setNumber: 3,
                weight: 80,
                reps: 9,
                plannedRepsMin: 10,
                plannedRepsMax: 12,
                restSeconds: 60,
                isCompleted: false,
                isFailure: true,
                notes: 'Falhou na terceira',
                executedAt: new Date('2024-01-15T10:09:00Z'),
              },
            ],
          },
        ],
      };

      // Execute
      const result = await service.create(createInput);

      // Verify
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.workoutName).toBe('Test Workout');
      expect(result.durationMinutes).toBe(60);
      expect(result.workoutHistoryExercises).toHaveLength(1);

      const exercise1 = result.workoutHistoryExercises[0];
      expect(exercise1.exerciseName).toBe('Supino Reto');
      expect(exercise1.plannedSets).toBe(3);
      expect(exercise1.completedSets).toBe(3);
      expect(exercise1.workoutHistoryExerciseSets).toHaveLength(3);

      const sets = exercise1.workoutHistoryExerciseSets;
      expect(sets[0].reps).toBe(12);
      expect(sets[0].isCompleted).toBe(true);
      expect(sets[0].isFailure).toBe(false);
      expect(sets[2].reps).toBe(9);
      expect(sets[2].isCompleted).toBe(false);
      expect(sets[2].isFailure).toBe(true);
    });

    it('should find workout histories by user', async () => {
      // Setup test data
      const user = await userRepo.save({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: UserRole.CLIENT,
      });

      const workout = await workoutRepo.save({
        user: user,
        name: 'Test Workout',
        week_start: new Date('2024-01-15'),
        week_end: new Date('2024-01-21'),
        is_active: true,
      });

      const workoutHistory = await workoutHistoryRepo.save({
        user: user,
        workout: workout,
        executedAt: new Date('2024-01-15T10:00:00Z'),
        workoutName: 'Test Workout',
        trainingDayOrder: 1,
        trainingDayName: 'Peito e Tríceps',
        notes: 'Treino completo',
        durationMinutes: 60,
      });

      // Execute
      const results = await service.findByUserId(user.id.toString());

      // Verify
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(workoutHistory.id);
      expect(results[0].workoutName).toBe('Test Workout');
    });

    it('should delete workout history and cascades', async () => {
      // Setup test data
      const user = await userRepo.save({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: UserRole.CLIENT,
      });

      const workout = await workoutRepo.save({
        user: user,
        name: 'Test Workout',
        week_start: new Date('2024-01-15'),
        week_end: new Date('2024-01-21'),
        is_active: true,
      });

      const exercise = await exerciseRepo.save({
        name: 'Supino Reto',
        muscle_group: 'Peito',
        equipment: 'Barra',
        instructions: 'Execute o movimento',
      });

      const createInput: CreateWorkoutHistoryInput = {
        userId: user.id.toString(),
        workoutId: workout.id.toString(),
        executedAt: new Date('2024-01-15T10:00:00Z'),
        workoutName: 'Test Workout',
        trainingDayOrder: 1,
        trainingDayName: 'Peito e Tríceps',
        durationMinutes: 60,
        exercises: [
          {
            exerciseId: exercise.id.toString(),
            order: 1,
            exerciseName: 'Supino Reto',
            plannedSets: 1,
            completedSets: 1,
            sets: [
              {
                setNumber: 1,
                weight: 80,
                reps: 12,
                isCompleted: true,
                isFailure: false,
                executedAt: new Date('2024-01-15T10:05:00Z'),
              },
            ],
          },
        ],
      };

      const created = await service.create(createInput);

      // Execute delete
      const deleted = await service.delete(created.id.toString());

      // Verify
      expect(deleted).toBe(true);
      const found = await service.findById(created.id.toString());
      expect(found).toBeNull();
    });
  });

  describe('Resolver Integration Tests', () => {
    it('should create workout history via resolver', async () => {
      // Setup test data
      const user = await userRepo.save({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: UserRole.CLIENT,
      });

      const workout = await workoutRepo.save({
        user: user,
        name: 'Test Workout',
        week_start: new Date('2024-01-15'),
        week_end: new Date('2024-01-21'),
        is_active: true,
      });

      const exercise = await exerciseRepo.save({
        name: 'Supino Reto',
        muscle_group: 'Peito',
        equipment: 'Barra',
        instructions: 'Execute o movimento',
      });

      const createInput: CreateWorkoutHistoryInput = {
        userId: user.id.toString(),
        workoutId: workout.id.toString(),
        executedAt: new Date('2024-01-15T10:00:00Z'),
        workoutName: 'Test Workout',
        trainingDayOrder: 1,
        trainingDayName: 'Peito e Tríceps',
        durationMinutes: 60,
        exercises: [
          {
            exerciseId: exercise.id.toString(),
            order: 1,
            exerciseName: 'Supino Reto',
            plannedSets: 1,
            completedSets: 1,
            sets: [
              {
                setNumber: 1,
                weight: 80,
                reps: 12,
                isCompleted: true,
                isFailure: false,
                executedAt: new Date('2024-01-15T10:05:00Z'),
              },
            ],
          },
        ],
      };

      // Execute
      const result = await resolver.createWorkoutHistory(createInput);

      // Verify
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.workoutName).toBe('Test Workout');
      expect(result.workoutHistoryExercises).toHaveLength(1);
    });
  });
});
