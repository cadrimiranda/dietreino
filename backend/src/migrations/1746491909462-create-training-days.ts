import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainingDays1746491909462 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE "training_days" (
            "id" SERIAL NOT NULL,
            "workout_id" integer NOT NULL,
            "day_of_week" integer NOT NULL,
            "focus" text,
            "name" character varying(100) NOT NULL,
            "order" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_training_days" PRIMARY KEY ("id")
          )
        `);

    await queryRunner.query(`
          ALTER TABLE "training_days" ADD CONSTRAINT "FK_training_days_workout" 
          FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "training_days" DROP CONSTRAINT "FK_training_days_workout"
        `);

    await queryRunner.query(`
          DROP TABLE "training_days"
        `);
  }
}
