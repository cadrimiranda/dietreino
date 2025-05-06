import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatedWorkoutRelations1746492023343
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Primeiro, remover as constraints que dependem da tabela workout_exercises
    await queryRunner.query(`
      ALTER TABLE weekly_loads DROP CONSTRAINT IF EXISTS "FK_03dcea57586ad593b3c1cb3bff1"
    `);

    await queryRunner.query(`
      ALTER TABLE rep_schemes DROP CONSTRAINT IF EXISTS "fk_workout_exercise_rep_scheme"
    `);

    await queryRunner.query(`
      ALTER TABLE rest_intervals DROP CONSTRAINT IF EXISTS "fk_workout_exercise_rest_interval"
    `);

    // 2. Atualizar rep_schemes
    await queryRunner.query(`
      ALTER TABLE rep_schemes
      RENAME COLUMN workout_exercise_id TO training_day_exercise_id
    `);

    // Adicionar nova constraint FK
    await queryRunner.query(`
      ALTER TABLE rep_schemes
      ADD CONSTRAINT "FK_rep_schemes_training_day_exercises"
      FOREIGN KEY ("training_day_exercise_id")
      REFERENCES "training_day_exercises"("id") ON DELETE CASCADE
    `);

    // 3. Atualizar rest_intervals
    await queryRunner.query(`
      ALTER TABLE rest_intervals
      RENAME COLUMN workout_exercise_id TO training_day_exercise_id
    `);

    // Adicionar nova constraint FK
    await queryRunner.query(`
      ALTER TABLE rest_intervals
      ADD CONSTRAINT "FK_rest_intervals_training_day_exercises"
      FOREIGN KEY ("training_day_exercise_id")
      REFERENCES "training_day_exercises"("id") ON DELETE CASCADE
    `);

    // 4. Atualizar weekly_loads
    await queryRunner.query(`
      ALTER TABLE weekly_loads
      RENAME COLUMN workout_exercise_id TO training_day_exercise_id
    `);

    // Adicionar nova constraint FK
    await queryRunner.query(`
      ALTER TABLE weekly_loads
      ADD CONSTRAINT "FK_weekly_loads_training_day_exercises"
      FOREIGN KEY ("training_day_exercise_id")
      REFERENCES "training_day_exercises"("id") ON DELETE CASCADE
    `);

    // 5. Agora podemos remover a tabela workout_exercises com segurança
    await queryRunner.query(`
      DROP TABLE IF EXISTS workout_exercises
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Recriar a tabela workout_exercises
    await queryRunner.query(`
      CREATE TABLE "workout_exercises" (
        "id" SERIAL NOT NULL,
        "workout_id" integer NOT NULL,
        "exercise_id" integer NOT NULL,
        "order" integer NOT NULL,
        "sets" integer NOT NULL,
        "notes" text,
        CONSTRAINT "PK_workout_exercises" PRIMARY KEY ("id")
      )
    `);

    // 2. Adicionar FKs para workout_exercises
    await queryRunner.query(`
      ALTER TABLE "workout_exercises" 
      ADD CONSTRAINT "FK_workout_exercises_workout" 
      FOREIGN KEY ("workout_id") 
      REFERENCES "workout"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "workout_exercises" 
      ADD CONSTRAINT "FK_workout_exercises_exercise" 
      FOREIGN KEY ("exercise_id") 
      REFERENCES "exercises"("id")
    `);

    // 3. Remover constraints das tabelas relacionadas
    await queryRunner.query(`
      ALTER TABLE rep_schemes DROP CONSTRAINT IF EXISTS "FK_rep_schemes_training_day_exercises"
    `);

    await queryRunner.query(`
      ALTER TABLE rest_intervals DROP CONSTRAINT IF EXISTS "FK_rest_intervals_training_day_exercises"
    `);

    await queryRunner.query(`
      ALTER TABLE weekly_loads DROP CONSTRAINT IF EXISTS "FK_weekly_loads_training_day_exercises"
    `);

    // 4. Renomear colunas
    await queryRunner.query(`
      ALTER TABLE rep_schemes
      RENAME COLUMN training_day_exercise_id TO workout_exercise_id
    `);

    await queryRunner.query(`
      ALTER TABLE rest_intervals
      RENAME COLUMN training_day_exercise_id TO workout_exercise_id
    `);

    await queryRunner.query(`
      ALTER TABLE weekly_loads
      RENAME COLUMN training_day_exercise_id TO workout_exercise_id
    `);

    // 5. Adicionar constraints originais
    await queryRunner.query(`
      ALTER TABLE rep_schemes
      ADD CONSTRAINT "fk_workout_exercise_rep_scheme"
      FOREIGN KEY ("workout_exercise_id")
      REFERENCES "workout_exercises"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE rest_intervals
      ADD CONSTRAINT "fk_workout_exercise_rest_interval"
      FOREIGN KEY ("workout_exercise_id")
      REFERENCES "workout_exercises"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE weekly_loads
      ADD CONSTRAINT "FK_03dcea57586ad593b3c1cb3bff1"
      FOREIGN KEY ("workout_exercise_id")
      REFERENCES "workout_exercises"("id") ON DELETE CASCADE
    `);
  }
}
