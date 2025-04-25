import { UserRole } from '../utils/roles.enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionarRelacionamentosProfissionais1745592300463
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE "user_role_enum" AS ENUM('${UserRole.CLIENT}', '${UserRole.TRAINER}', '${UserRole.NUTRITIONIST}')
    `);

    // Adicionar papel do usuário
    await queryRunner.query(`
        ALTER TABLE "users" ADD "role" "user_role_enum" NOT NULL DEFAULT 'client'
    `);

    // Adicionar colunas de referência
    await queryRunner.query(`ALTER TABLE "users" ADD "trainer_id" uuid NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "nutritionist_id" uuid NULL`,
    );

    // Adicionar chaves estrangeiras
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_trainer" FOREIGN KEY ("trainer_id") REFERENCES "users"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_nutritionist" FOREIGN KEY ("nutritionist_id") REFERENCES "users"("id")`,
    );

    // Adicionar constraint para garantir que pelo menos um profissional esteja associado
    await queryRunner.query(`
        ALTER TABLE "users" ADD CONSTRAINT "CHK_at_least_one_professional" 
        CHECK ((role != 'client') OR (trainer_id IS NOT NULL OR nutritionist_id IS NOT NULL))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover constraint
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "CHK_at_least_one_professional"`,
    );

    // Remover chaves estrangeiras
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_nutritionist"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_trainer"`,
    );

    // Remover colunas
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "nutritionist_id"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "trainer_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);

    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
