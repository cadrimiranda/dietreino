import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainingDaysBitfield1746491900323
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workout" ADD COLUMN "training_days_bitfield" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workout" DROP COLUMN "training_days_bitfield"`,
    );
  }
}
