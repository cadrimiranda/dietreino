import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBilateralExerciseSupportOnly1753795499204 implements MigrationInterface {
    name = 'AddBilateralExerciseSupportOnly1753795499204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workout_history_exercise_sets" ADD "weight_left" numeric(8,2)`);
        await queryRunner.query(`ALTER TABLE "workout_history_exercise_sets" ADD "reps_left" integer`);
        await queryRunner.query(`ALTER TABLE "workout_history_exercise_sets" ADD "weight_right" numeric(8,2)`);
        await queryRunner.query(`ALTER TABLE "workout_history_exercise_sets" ADD "reps_right" integer`);
        await queryRunner.query(`ALTER TABLE "workout_history_exercise_sets" ADD "is_bilateral" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workout_history_exercise_sets" DROP COLUMN "is_bilateral"`);
        await queryRunner.query(`ALTER TABLE "workout_history_exercise_sets" DROP COLUMN "reps_right"`);
        await queryRunner.query(`ALTER TABLE "workout_history_exercise_sets" DROP COLUMN "weight_right"`);
        await queryRunner.query(`ALTER TABLE "workout_history_exercise_sets" DROP COLUMN "reps_left"`);
        await queryRunner.query(`ALTER TABLE "workout_history_exercise_sets" DROP COLUMN "weight_left"`);
    }
}