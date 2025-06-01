import gql from 'graphql-tag';
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
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
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
  workoutId?: InputMaybe<Scalars['Float']['input']>;
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
  deactivateWorkout: WorkoutType;
  deleteExercise: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  deleteWorkout: Scalars['Boolean']['output'];
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
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  trainingDayExercises: Array<TrainingDayExercise>;
  updatedAt: Scalars['DateTime']['output'];
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
  phone: Scalars['String']['output'];
  role: UserRole;
  trainer?: Maybe<UserType>;
  updatedAt: Scalars['DateTime']['output'];
  workouts?: Maybe<Array<WorkoutType>>;
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
