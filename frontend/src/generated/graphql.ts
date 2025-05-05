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

export type CreateExerciseInput = {
  muscleGroup: Scalars['String']['input'];
  name: Scalars['String']['input'];
  videoLink?: InputMaybe<Scalars['String']['input']>;
};

export type CreateWorkoutExerciseInput = {
  exerciseId: Scalars['Int']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  order: Scalars['Int']['input'];
  repetitions: Scalars['String']['input'];
  rest: Scalars['String']['input'];
  sets: Scalars['Int']['input'];
  workoutId: Scalars['Int']['input'];
};

export type CreateWorkoutInput = {
  isActive?: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  weekEnd: Scalars['Int']['input'];
  weekStart: Scalars['Int']['input'];
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
  muscleGroup: Scalars['String']['output'];
  name: Scalars['String']['output'];
  videoLink?: Maybe<Scalars['String']['output']>;
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
  addWorkoutToUser: WorkoutType;
  assignNutritionist: UserType;
  assignTrainer: UserType;
  createExercise: ExerciseType;
  createWorkoutExercise: WorkoutExerciseType;
  deleteExercise: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  deleteWorkout: Scalars['Boolean']['output'];
  deleteWorkoutExercise: Scalars['Boolean']['output'];
  extractWorkoutSheet: Array<SheetExercises>;
  importXlsxAndCreateWorkout: WorkoutType;
  login: LoginResponse;
  me: UserType;
  refreshToken: LoginResponse;
  updateExercise?: Maybe<ExerciseType>;
  updateWorkout?: Maybe<WorkoutType>;
  updateWorkoutExercise?: Maybe<WorkoutExerciseType>;
  upsertUser: UserType;
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


export type MutationCreateExerciseArgs = {
  createExerciseInput: CreateExerciseInput;
};


export type MutationCreateWorkoutExerciseArgs = {
  createWorkoutExerciseInput: CreateWorkoutExerciseInput;
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


export type MutationDeleteWorkoutExerciseArgs = {
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


export type MutationUpdateExerciseArgs = {
  updateExerciseInput: UpdateExerciseInput;
};


export type MutationUpdateWorkoutArgs = {
  updateWorkoutInput: UpdateWorkoutInput;
};


export type MutationUpdateWorkoutExerciseArgs = {
  updateWorkoutExerciseInput: UpdateWorkoutExerciseInput;
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
  workoutExercise?: Maybe<WorkoutExerciseType>;
  workoutExercises: Array<WorkoutExerciseType>;
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


export type QueryWorkoutExerciseArgs = {
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

export type RepSchemeType = {
  __typename?: 'RepSchemeType';
  id: Scalars['ID']['output'];
  max_reps: Scalars['Int']['output'];
  min_reps: Scalars['Int']['output'];
  sets: Scalars['Int']['output'];
};

export type RestIntervalType = {
  __typename?: 'RestIntervalType';
  id: Scalars['ID']['output'];
  interval_time: Scalars['String']['output'];
  order: Scalars['Int']['output'];
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

export type UpdateExerciseInput = {
  id: Scalars['ID']['input'];
  muscleGroup?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  videoLink?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWorkoutExerciseInput = {
  exerciseId?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  repetitions?: InputMaybe<Scalars['String']['input']>;
  rest?: InputMaybe<Scalars['String']['input']>;
  sets?: InputMaybe<Scalars['Int']['input']>;
  workoutId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateWorkoutInput = {
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  weekEnd?: InputMaybe<Scalars['Int']['input']>;
  weekStart?: InputMaybe<Scalars['Int']['input']>;
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

export type WorkoutExerciseType = {
  __typename?: 'WorkoutExerciseType';
  exercise?: Maybe<ExerciseType>;
  exerciseId: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
  repSchemes?: Maybe<Array<RepSchemeType>>;
  repetitions: Scalars['String']['output'];
  rest: Scalars['String']['output'];
  restIntervals?: Maybe<Array<RestIntervalType>>;
  sets: Scalars['Int']['output'];
  workoutId: Scalars['Int']['output'];
};

export type WorkoutType = {
  __typename?: 'WorkoutType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  userId: Scalars['String']['output'];
  weekEnd: Scalars['Int']['output'];
  weekStart: Scalars['Int']['output'];
  workoutExercises?: Maybe<Array<WorkoutExerciseType>>;
};
