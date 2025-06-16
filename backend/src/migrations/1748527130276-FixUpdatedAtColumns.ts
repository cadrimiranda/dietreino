import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUpdatedAtColumns1748527130276 implements MigrationInterface {
  name = 'FixUpdatedAtColumns1748527130276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix updated_at columns to have proper default values and NOT NULL constraint

    // Users table - set default value for existing null records and add constraint
    await queryRunner.query(`
      UPDATE "users" 
      SET "updated_at" = "created_at" 
      WHERE "updated_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "updated_at" SET DEFAULT now(),
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

    // Workout table
    await queryRunner.query(`
      UPDATE "workout" 
      SET "updated_at" = "created_at_timestamp" 
      WHERE "updated_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "workout" 
      ALTER COLUMN "updated_at" SET DEFAULT now(),
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

    // Training days table
    await queryRunner.query(`
      UPDATE "training_days" 
      SET "updated_at" = "created_at" 
      WHERE "updated_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "training_days" 
      ALTER COLUMN "updated_at" SET DEFAULT now(),
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

    // Exercises table
    await queryRunner.query(`
      UPDATE "exercises" 
      SET "updated_at" = "created_at" 
      WHERE "updated_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "exercises" 
      ALTER COLUMN "updated_at" SET DEFAULT now(),
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

    // Training day exercises table
    await queryRunner.query(`
      UPDATE "training_day_exercises" 
      SET "updated_at" = "created_at" 
      WHERE "updated_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "training_day_exercises" 
      ALTER COLUMN "updated_at" SET DEFAULT now(),
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

    // Weekly loads table
    await queryRunner.query(`
      UPDATE "weekly_loads" 
      SET "updated_at" = "created_at" 
      WHERE "updated_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "weekly_loads" 
      ALTER COLUMN "updated_at" SET DEFAULT now(),
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

    // Rep schemes table
    await queryRunner.query(`
      UPDATE "rep_schemes" 
      SET "updated_at" = "created_at" 
      WHERE "updated_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "rep_schemes" 
      ALTER COLUMN "updated_at" SET DEFAULT now(),
      ALTER COLUMN "updated_at" SET NOT NULL
    `);

    // Rest intervals table
    await queryRunner.query(`
      UPDATE "rest_intervals" 
      SET "updated_at" = "created_at" 
      WHERE "updated_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "rest_intervals" 
      ALTER COLUMN "updated_at" SET DEFAULT now(),
      ALTER COLUMN "updated_at" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert all updated_at columns back to nullable
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT, ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "workout" ALTER COLUMN "updated_at" DROP DEFAULT, ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "training_days" ALTER COLUMN "updated_at" DROP DEFAULT, ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ALTER COLUMN "updated_at" DROP DEFAULT, ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "training_day_exercises" ALTER COLUMN "updated_at" DROP DEFAULT, ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "weekly_loads" ALTER COLUMN "updated_at" DROP DEFAULT, ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rep_schemes" ALTER COLUMN "updated_at" DROP DEFAULT, ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rest_intervals" ALTER COLUMN "updated_at" DROP DEFAULT, ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
  }
}
