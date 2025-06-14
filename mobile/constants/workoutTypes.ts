export const WORKOUT_DAY_TYPES = {
  REST: 'REST',
  PUSH: 'PUSH',
  PULL: 'PULL',
  LEGS: 'LEGS',
  UPPER: 'UPPER',
  LOWER: 'LOWER',
  FULL_BODY: 'FULL_BODY'
} as const;

export type WorkoutDayType = typeof WORKOUT_DAY_TYPES[keyof typeof WORKOUT_DAY_TYPES];