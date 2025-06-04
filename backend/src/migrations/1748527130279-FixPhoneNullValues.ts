import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPhoneNullValues1748527130279 implements MigrationInterface {
  name = 'FixPhoneNullValues1748527130279';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update any null phone values to empty string to ensure GraphQL compatibility
    await queryRunner.query(`
      UPDATE "users" 
      SET "phone" = '' 
      WHERE "phone" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert empty strings back to null if needed
    await queryRunner.query(`
      UPDATE "users" 
      SET "phone" = NULL 
      WHERE "phone" = ''
    `);
  }
}