import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainingDayExercises1746491933921
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar nova tabela
    await queryRunner.query(`
      CREATE TABLE "training_day_exercises" (
        "id" SERIAL NOT NULL,
        "training_day_id" integer NOT NULL,
        "exercise_id" integer NOT NULL,
        "order" integer NOT NULL,
        "sets" integer NOT NULL,
        "notes" text,
        CONSTRAINT "PK_training_day_exercises" PRIMARY KEY ("id")
      )
    `);

    // Adicionar FKs
    await queryRunner.query(`
      ALTER TABLE "training_day_exercises" 
      ADD CONSTRAINT "FK_training_day_exercises_training_days" 
      FOREIGN KEY ("training_day_id") 
      REFERENCES "training_days"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "training_day_exercises" 
      ADD CONSTRAINT "FK_training_day_exercises_exercise" 
      FOREIGN KEY ("exercise_id") 
      REFERENCES "exercises"("id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "training_day_exercises" 
      DROP CONSTRAINT "FK_training_day_exercises_exercise"
    `);

    await queryRunner.query(`
      ALTER TABLE "training_day_exercises" 
      DROP CONSTRAINT "FK_training_day_exercises_training_days"
    `);

    await queryRunner.query(`
      DROP TABLE "training_day_exercises"
    `);
  }
}
