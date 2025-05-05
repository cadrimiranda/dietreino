import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveColumnsFromWorkoutExercise1746393134585
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "workout_exercises" 
          DROP COLUMN "workout_id",
          DROP COLUMN "exercise_id",
          DROP COLUMN "repetitions",
          DROP COLUMN "raw_reps",
          DROP COLUMN "rest"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "workout_exercises" 
          ADD COLUMN "workout_id" integer,
          ADD COLUMN "exercise_id" integer,
          ADD COLUMN "repetitions" character varying(100),
          ADD COLUMN "raw_reps" character varying(100),
          ADD COLUMN "rest" character varying(100)
        `);

    // Recriando as foreign keys que serão perdidas
    await queryRunner.query(`
          ALTER TABLE "workout_exercises" 
          ADD CONSTRAINT "FK_workout_exercises_workout" 
          FOREIGN KEY ("workout_id") 
          REFERENCES "workouts"("id") 
          ON DELETE CASCADE
        `);

    await queryRunner.query(`
          ALTER TABLE "workout_exercises" 
          ADD CONSTRAINT "FK_workout_exercises_exercise" 
          FOREIGN KEY ("exercise_id") 
          REFERENCES "exercises"("id")
        `);
  }
}
