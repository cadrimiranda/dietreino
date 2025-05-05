import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWorkoutExercisesRelations1746451677118
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "workout_exercises" 
          ADD COLUMN IF NOT EXISTS "workoutId" integer,
          ADD COLUMN IF NOT EXISTS "exerciseId" integer
        `);

    try {
      await queryRunner.query(`
            ALTER TABLE "workout_exercises" 
            DROP CONSTRAINT IF EXISTS "FK_workout_exercises_workout"
          `);

      await queryRunner.query(`
            ALTER TABLE "workout_exercises" 
            DROP CONSTRAINT IF EXISTS "FK_workout_exercises_exercise"
          `);
    } catch (error) {
      console.log('Constraints não existiam ou erro ao remover:', error);
    }

    await queryRunner.query(`
          ALTER TABLE "workout_exercises" 
          ADD CONSTRAINT "FK_workout_exercises_workoutId" 
          FOREIGN KEY ("workoutId") 
          REFERENCES "workout"("id") 
          ON DELETE CASCADE
        `);

    await queryRunner.query(`
          ALTER TABLE "workout_exercises" 
          ADD CONSTRAINT "FK_workout_exercises_exerciseId" 
          FOREIGN KEY ("exerciseId") 
          REFERENCES "exercises"("id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "workout_exercises" 
          DROP CONSTRAINT IF EXISTS "FK_workout_exercises_workoutId"
        `);

    await queryRunner.query(`
          ALTER TABLE "workout_exercises" 
          DROP CONSTRAINT IF EXISTS "FK_workout_exercises_exerciseId"
        `);
  }
}
