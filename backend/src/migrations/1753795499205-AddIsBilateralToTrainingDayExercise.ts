import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsBilateralToTrainingDayExercise1753795499205 implements MigrationInterface {
    name = 'AddIsBilateralToTrainingDayExercise1753795499205'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_day_exercises" ADD "is_bilateral" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_day_exercises" DROP COLUMN "is_bilateral"`);
    }
}