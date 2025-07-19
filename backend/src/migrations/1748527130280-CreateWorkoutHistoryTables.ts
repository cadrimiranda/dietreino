import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkoutHistoryTables1748527130280
  implements MigrationInterface
{
  name = 'CreateWorkoutHistoryTables1748527130280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela workout_history
    await queryRunner.query(`
      CREATE TABLE "workout_history" (
        "id" SERIAL PRIMARY KEY,
        "user_id" uuid NOT NULL,
        "workout_id" uuid NOT NULL,
        "executed_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "workout_name" varchar(100) NOT NULL,
        "training_day_order" integer NOT NULL,
        "training_day_name" varchar(100) NOT NULL,
        "notes" text NULL,
        "duration_minutes" integer NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NULL,
        CONSTRAINT "FK_workout_history_user" 
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_workout_history_workout" 
          FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE
      )
    `);

    // Criar tabela workout_history_exercises
    await queryRunner.query(`
      CREATE TABLE "workout_history_exercises" (
        "id" SERIAL PRIMARY KEY,
        "workout_history_id" integer NOT NULL,
        "exercise_id" uuid NOT NULL,
        "order" integer NOT NULL,
        "exercise_name" varchar(100) NOT NULL,
        "planned_sets" integer NOT NULL,
        "completed_sets" integer NOT NULL DEFAULT 0,
        "notes" text NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NULL,
        CONSTRAINT "FK_workout_history_exercises_workout_history" 
          FOREIGN KEY ("workout_history_id") REFERENCES "workout_history"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_workout_history_exercises_exercise" 
          FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE
      )
    `);

    // Criar tabela workout_history_exercise_sets
    await queryRunner.query(`
      CREATE TABLE "workout_history_exercise_sets" (
        "id" SERIAL PRIMARY KEY,
        "workout_history_exercise_id" integer NOT NULL,
        "set_number" integer NOT NULL,
        "weight" decimal(8,2) NULL,
        "reps" integer NOT NULL,
        "planned_reps_min" integer NULL,
        "planned_reps_max" integer NULL,
        "rest_seconds" integer NULL,
        "is_completed" boolean NOT NULL DEFAULT false,
        "is_failure" boolean NOT NULL DEFAULT false,
        "notes" text NULL,
        "executed_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NULL,
        CONSTRAINT "FK_workout_history_exercise_sets_workout_history_exercise" 
          FOREIGN KEY ("workout_history_exercise_id") REFERENCES "workout_history_exercises"("id") ON DELETE CASCADE
      )
    `);

    // Criar índices para performance
    await queryRunner.query(`
      CREATE INDEX "IDX_workout_history_user_id" ON "workout_history" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_workout_history_executed_at" ON "workout_history" ("executed_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_workout_history_exercises_workout_history_id" ON "workout_history_exercises" ("workout_history_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_workout_history_exercise_sets_workout_history_exercise_id" ON "workout_history_exercise_sets" ("workout_history_exercise_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(
      `DROP INDEX "IDX_workout_history_exercise_sets_workout_history_exercise_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_workout_history_exercises_workout_history_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_workout_history_executed_at"`);
    await queryRunner.query(`DROP INDEX "IDX_workout_history_user_id"`);

    // Remover tabelas (ordem inversa devido às foreign keys)
    await queryRunner.query(`DROP TABLE "workout_history_exercise_sets"`);
    await queryRunner.query(`DROP TABLE "workout_history_exercises"`);
    await queryRunner.query(`DROP TABLE "workout_history"`);
  }
}
