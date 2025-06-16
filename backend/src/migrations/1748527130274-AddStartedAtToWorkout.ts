import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStartedAtToWorkout1748527130274 implements MigrationInterface {
  name = 'AddStartedAtToWorkout1748527130274';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workout" ADD "started_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "workout" DROP COLUMN "started_at"`);
  }
}
