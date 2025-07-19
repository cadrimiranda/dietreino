import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

export type CreateRepSchemeInput = {
  maxReps: Scalars['Float']['input'];
  minReps: Scalars['Float']['input'];
  sets: Scalars['Float']['input'];
};

export type CreateRestIntervalInput = {
  intervalTime: Scalars['String']['input'];
  order: Scalars['Float']['input'];
};

export type CreateTrainingDayExerciseInput = {
  exerciseId: Scalars['ID']['input'];
  order: Scalars['Float']['input'];
  repSchemes: Array<CreateRepSchemeInput>;
  restIntervals: Array<CreateRestIntervalInput>;
};

export type CreateTrainingDayInput = {
  dayOfWeek: Scalars['Float']['input'];
  exercises: Array<CreateTrainingDayExerciseInput>;
  name: Scalars['String']['input'];
  order: Scalars['Float']['input'];
};

export type CreateWorkoutHistoryExerciseInput = {
  completedSets: Scalars['Int']['input'];
  exerciseId: Scalars['ID']['input'];
  exerciseName: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  order: Scalars['Int']['input'];
  plannedSets: Scalars['Int']['input'];
  sets: Array<CreateWorkoutHistoryExerciseSetInput>;
};

export type CreateWorkoutHistoryExerciseSetInput = {
  executedAt: Scalars['DateTime']['input'];
  isCompleted: Scalars['Boolean']['input'];
  isFailure: Scalars['Boolean']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  plannedRepsMax?: InputMaybe<Scalars['Int']['input']>;
  plannedRepsMin?: InputMaybe<Scalars['Int']['input']>;
  reps: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  setNumber: Scalars['Int']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateWorkoutHistoryInput = {
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  executedAt: Scalars['DateTime']['input'];
  exercises: Array<CreateWorkoutHistoryExerciseInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  trainingDayName: Scalars['String']['input'];
  trainingDayOrder: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
  workoutId: Scalars['ID']['input'];
  workoutName: Scalars['String']['input'];
};

export type CreateWorkoutInput = {
  name: Scalars['String']['input'];
  trainingDays: Array<CreateTrainingDayInput>;
  userId: Scalars['ID']['input'];
  weekEnd: Scalars['String']['input'];
  weekStart: Scalars['String']['input'];
};

export type Exercise = {
  __typename?: 'Exercise';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  videoLink?: Maybe<Scalars['String']['output']>;
};

export type ExerciseInfo = {
  __typename?: 'ExerciseInfo';
  name: Scalars['String']['output'];
  rawReps: Scalars['String']['output'];
  repSchemes: Array<RepRange>;
  restIntervals: Array<Scalars['String']['output']>;
};

export type ExerciseType = {
  __typename?: 'ExerciseType';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  videoLink?: Maybe<Scalars['String']['output']>;
};

export type ExerciseUpsertDto = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  videoLink?: InputMaybe<Scalars['String']['input']>;
};

export type ImportXlsxUserWorkoutInput = {
  file: Scalars['Upload']['input'];
  userId: Scalars['String']['input'];
  weekEnd: Scalars['String']['input'];
  weekStart: Scalars['String']['input'];
  workoutId?: InputMaybe<Scalars['String']['input']>;
  workoutName: Scalars['String']['input'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  user: UserType;
};

export type Mutation = {
  __typename?: 'Mutation';
  activateWorkout: WorkoutType;
  addWorkoutToUser: WorkoutType;
  assignNutritionist: UserType;
  assignTrainer: UserType;
  createWorkout: WorkoutType;
  createWorkoutHistory: WorkoutHistoryType;
  deactivateWorkout: WorkoutType;
  deleteExercise: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  deleteWorkout: Scalars['Boolean']['output'];
  deleteWorkoutHistory: Scalars['Boolean']['output'];
  extractWorkoutSheet: Array<SheetExercises>;
  importXlsxAndCreateWorkout: WorkoutType;
  login: LoginResponse;
  me: UserType;
  refreshToken: LoginResponse;
  toggleWorkoutActive: WorkoutType;
  updateWorkout?: Maybe<WorkoutType>;
  updateWorkoutExercises: WorkoutType;
  upsertExercise: ExerciseType;
  upsertUser: UserType;
};


export type MutationActivateWorkoutArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAddWorkoutToUserArgs = {
  clientId: Scalars['ID']['input'];
  workoutInput: CreateWorkoutInput;
};


export type MutationAssignNutritionistArgs = {
  clientId: Scalars['ID']['input'];
  nutritionistId: Scalars['ID']['input'];
};


export type MutationAssignTrainerArgs = {
  clientId: Scalars['ID']['input'];
  trainerId: Scalars['ID']['input'];
};


export type MutationCreateWorkoutArgs = {
  input: CreateWorkoutInput;
};


export type MutationCreateWorkoutHistoryArgs = {
  createWorkoutHistoryInput: CreateWorkoutHistoryInput;
};


export type MutationDeactivateWorkoutArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteExerciseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkoutArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkoutHistoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationExtractWorkoutSheetArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationImportXlsxAndCreateWorkoutArgs = {
  input: ImportXlsxUserWorkoutInput;
};


export type MutationLoginArgs = {
  loginInput: LoginInput;
};


export type MutationRefreshTokenArgs = {
  refreshTokenInput: RefreshTokenInput;
};


export type MutationToggleWorkoutActiveArgs = {
  input: ToggleWorkoutActiveInput;
};


export type MutationUpdateWorkoutArgs = {
  updateWorkoutInput: UpdateWorkoutInput;
};


export type MutationUpdateWorkoutExercisesArgs = {
  input: UpdateWorkoutExercisesInput;
};


export type MutationUpsertExerciseArgs = {
  input: ExerciseUpsertDto;
};


export type MutationUpsertUserArgs = {
  userInput: UserInput;
};

export type Query = {
  __typename?: 'Query';
  clientForProfessional: UserType;
  exercise?: Maybe<ExerciseType>;
  exercises: Array<ExerciseType>;
  nutritionistClients: Array<UserType>;
  trainerClients: Array<UserType>;
  user: UserType;
  users: Array<UserType>;
  workout?: Maybe<WorkoutType>;
  workoutHistories: Array<WorkoutHistoryType>;
  workoutHistoriesByUser: Array<WorkoutHistoryType>;
  workoutHistoriesByUserAndDate: Array<WorkoutHistoryType>;
  workoutHistoriesByUserAndDateRange: Array<WorkoutHistoryType>;
  workoutHistoriesByWorkout: Array<WorkoutHistoryType>;
  workoutHistory?: Maybe<WorkoutHistoryType>;
  workouts: Array<WorkoutType>;
};


export type QueryClientForProfessionalArgs = {
  clientId: Scalars['ID']['input'];
  professionalId: Scalars['ID']['input'];
};


export type QueryExerciseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryNutritionistClientsArgs = {
  nutritionistId: Scalars['ID']['input'];
};


export type QueryTrainerClientsArgs = {
  trainerId: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkoutArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkoutHistoriesByUserArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryWorkoutHistoriesByUserAndDateArgs = {
  date: Scalars['DateTime']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryWorkoutHistoriesByUserAndDateRangeArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryWorkoutHistoriesByWorkoutArgs = {
  workoutId: Scalars['ID']['input'];
};


export type QueryWorkoutHistoryArgs = {
  id: Scalars['ID']['input'];
};

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

export type RepRange = {
  __typename?: 'RepRange';
  maxReps: Scalars['Int']['output'];
  minReps: Scalars['Int']['output'];
  sets: Scalars['Int']['output'];
};

export type RepScheme = {
  __typename?: 'RepScheme';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  maxReps: Scalars['Float']['output'];
  minReps: Scalars['Float']['output'];
  sets: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type RestInterval = {
  __typename?: 'RestInterval';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  intervalTime: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SheetData = {
  __typename?: 'SheetData';
  data: Array<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
};

export type SheetExercises = {
  __typename?: 'SheetExercises';
  exercises: Array<ExerciseInfo>;
  sheetName: Scalars['String']['output'];
};

export type ToggleWorkoutActiveInput = {
  active: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};

export type TrainingDay = {
  __typename?: 'TrainingDay';
  createdAt: Scalars['DateTime']['output'];
  dayOfWeek: Scalars['Float']['output'];
  focus?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  trainingDayExercises: Array<TrainingDayExercise>;
  updatedAt: Scalars['DateTime']['output'];
  workout: Workout;
};

export type TrainingDayExercise = {
  __typename?: 'TrainingDayExercise';
  createdAt: Scalars['DateTime']['output'];
  exercise: Exercise;
  id: Scalars['ID']['output'];
  order: Scalars['Float']['output'];
  repSchemes: Array<RepScheme>;
  restIntervals: Array<RestInterval>;
  updatedAt: Scalars['DateTime']['output'];
};

export type UpdateRepSchemeInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  maxReps: Scalars['Int']['input'];
  minReps: Scalars['Int']['input'];
  sets: Scalars['Int']['input'];
};

export type UpdateRestIntervalInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  intervalTime: Scalars['String']['input'];
  order: Scalars['Int']['input'];
};

export type UpdateTrainingDayExerciseInput = {
  exerciseId: Scalars['ID']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  order: Scalars['Int']['input'];
  repSchemes: Array<UpdateRepSchemeInput>;
  restIntervals: Array<UpdateRestIntervalInput>;
};

export type UpdateTrainingDayInput = {
  dayOfWeek: Scalars['Int']['input'];
  exercises: Array<UpdateTrainingDayExerciseInput>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
};

export type UpdateWorkoutExercisesInput = {
  trainingDays: Array<UpdateTrainingDayInput>;
  workoutId: Scalars['ID']['input'];
};

export type UpdateWorkoutInput = {
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  weekEnd?: InputMaybe<Scalars['DateTime']['input']>;
  weekStart?: InputMaybe<Scalars['DateTime']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isPasswordAutoGenerated: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  role: UserRole;
  updatedAt: Scalars['DateTime']['output'];
  workouts?: Maybe<Array<Workout>>;
};

export type UserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nutritionistId?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  trainerId?: InputMaybe<Scalars['String']['input']>;
};

export enum UserRole {
  Client = 'CLIENT',
  Nutritionist = 'NUTRITIONIST',
  Trainer = 'TRAINER'
}

export type UserType = {
  __typename?: 'UserType';
  clients_as_nutritionist?: Maybe<Array<UserType>>;
  clients_as_trainer?: Maybe<Array<UserType>>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  generatedPassword?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nutritionist?: Maybe<UserType>;
  phone?: Maybe<Scalars['String']['output']>;
  role: UserRole;
  trainer?: Maybe<UserType>;
  updatedAt: Scalars['DateTime']['output'];
  workouts?: Maybe<Array<WorkoutType>>;
};

export type Workout = {
  __typename?: 'Workout';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  trainingDays: Array<TrainingDay>;
  trainingDaysBitfield: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  week_end: Scalars['DateTime']['output'];
  week_start: Scalars['DateTime']['output'];
};

export type WorkoutHistory = {
  __typename?: 'WorkoutHistory';
  createdAt: Scalars['DateTime']['output'];
  durationMinutes?: Maybe<Scalars['Float']['output']>;
  executedAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  trainingDayName: Scalars['String']['output'];
  trainingDayOrder: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  workout: Workout;
  workoutHistoryExercises: Array<WorkoutHistoryExercise>;
  workoutName: Scalars['String']['output'];
};

export type WorkoutHistoryExercise = {
  __typename?: 'WorkoutHistoryExercise';
  completedSets: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  exercise: Exercise;
  exerciseId: Scalars['String']['output'];
  exerciseName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  order: Scalars['Float']['output'];
  plannedSets: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workoutHistory: WorkoutHistory;
  workoutHistoryExerciseSets: Array<WorkoutHistoryExerciseSet>;
  workoutHistoryId: Scalars['String']['output'];
};

export type WorkoutHistoryExerciseSet = {
  __typename?: 'WorkoutHistoryExerciseSet';
  createdAt: Scalars['DateTime']['output'];
  executedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  isFailure: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  plannedRepsMax?: Maybe<Scalars['Float']['output']>;
  plannedRepsMin?: Maybe<Scalars['Float']['output']>;
  reps?: Maybe<Scalars['Float']['output']>;
  restSeconds?: Maybe<Scalars['Float']['output']>;
  setNumber: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
  workoutHistoryExercise: WorkoutHistoryExercise;
  workoutHistoryExerciseId: Scalars['String']['output'];
};

export type WorkoutHistoryExerciseSetType = {
  __typename?: 'WorkoutHistoryExerciseSetType';
  createdAt: Scalars['DateTime']['output'];
  executedAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  isFailure: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  plannedRepsMax?: Maybe<Scalars['Int']['output']>;
  plannedRepsMin?: Maybe<Scalars['Int']['output']>;
  reps: Scalars['Int']['output'];
  restSeconds?: Maybe<Scalars['Int']['output']>;
  setNumber: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
  workoutHistoryExerciseId: Scalars['ID']['output'];
};

export type WorkoutHistoryExerciseType = {
  __typename?: 'WorkoutHistoryExerciseType';
  completedSets: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  exerciseId: Scalars['ID']['output'];
  exerciseName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
  plannedSets: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  workoutHistoryExerciseSets: Array<WorkoutHistoryExerciseSetType>;
  workoutHistoryId: Scalars['ID']['output'];
};

export type WorkoutHistoryType = {
  __typename?: 'WorkoutHistoryType';
  createdAt: Scalars['DateTime']['output'];
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  executedAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  trainingDayName: Scalars['String']['output'];
  trainingDayOrder: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  userId: Scalars['ID']['output'];
  workoutHistoryExercises: Array<WorkoutHistoryExerciseType>;
  workoutId: Scalars['ID']['output'];
  workoutName: Scalars['String']['output'];
};

export type WorkoutType = {
  __typename?: 'WorkoutType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  trainingDays?: Maybe<Array<TrainingDay>>;
  trainingDaysBitfield?: Maybe<Scalars['Int']['output']>;
  userId: Scalars['String']['output'];
  weekEnd: Scalars['DateTime']['output'];
  weekStart: Scalars['DateTime']['output'];
};
