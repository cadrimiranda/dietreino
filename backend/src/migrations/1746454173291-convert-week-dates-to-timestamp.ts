import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertWeekDatesToTimestamp1746454173291
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primeiro, adicione novas colunas temporárias
    await queryRunner.query(`
          ALTER TABLE "workout" 
          ADD COLUMN "week_start_date" TIMESTAMP WITH TIME ZONE,
          ADD COLUMN "week_end_date" TIMESTAMP WITH TIME ZONE
        `);

    // Converta os valores inteiros existentes para timestamps
    await queryRunner.query(`
          UPDATE "workout"
          SET 
            "week_start_date" = to_timestamp("week_start" / 1000),
            "week_end_date" = to_timestamp("week_end" / 1000)
        `);

    // Remova as colunas antigas
    await queryRunner.query(`
          ALTER TABLE "workout"
          DROP COLUMN "week_start",
          DROP COLUMN "week_end"
        `);

    // Renomeie as novas colunas para os nomes originais
    await queryRunner.query(`
      ALTER TABLE "workout"
      RENAME COLUMN "week_start_date" TO "week_start"
    `);

    await queryRunner.query(`
      ALTER TABLE "workout"
      RENAME COLUMN "week_end_date" TO "week_end"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Crie colunas temporárias para reverter
    await queryRunner.query(`
          ALTER TABLE "workout" 
          ADD COLUMN "week_start_int" INTEGER,
          ADD COLUMN "week_end_int" INTEGER
        `);

    // Converta os timestamps de volta para inteiros
    await queryRunner.query(`
          UPDATE "workout"
          SET 
            "week_start_int" = EXTRACT(EPOCH FROM "week_start") * 1000,
            "week_end_int" = EXTRACT(EPOCH FROM "week_end") * 1000
        `);

    // Remova as colunas de timestamp
    await queryRunner.query(`
          ALTER TABLE "workout"
          DROP COLUMN "week_start",
          DROP COLUMN "week_end"
        `);

    // Renomeie as colunas inteiras para os nomes originais
    await queryRunner.query(`
          ALTER TABLE "workout"
          RENAME COLUMN "week_start_int" TO "week_start"
        `);

    await queryRunner.query(`
          ALTER TABLE "workout"
          RENAME COLUMN "week_end_int" TO "week_end"
        `);
  }
}
