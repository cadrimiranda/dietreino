import { MigrationInterface, QueryRunner } from 'typeorm';

export class SafeUuidMigration1748527130278 implements MigrationInterface {
  name = 'SafeUuidMigration1748527130278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration is designed to safely convert from SERIAL to UUID
    // while preserving all existing data and relationships
    
    // NOTE: This migration should only be run if you want to convert to UUIDs
    // and should be run INSTEAD of the current FixIdTypesToUuid migration
    
    // 1. First, add new UUID columns alongside existing integer columns
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "uuid_id" UUID DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "workout" ADD COLUMN "uuid_id" UUID DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "training_days" ADD COLUMN "uuid_id" UUID DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "exercises" ADD COLUMN "uuid_id" UUID DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" ADD COLUMN "uuid_id" UUID DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "weekly_loads" ADD COLUMN "uuid_id" UUID DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "rep_schemes" ADD COLUMN "uuid_id" UUID DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "rest_intervals" ADD COLUMN "uuid_id" UUID DEFAULT uuid_generate_v4()`);

    // 2. Add new UUID foreign key columns
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "uuid_trainer_id" UUID`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "uuid_nutritionist_id" UUID`);
    await queryRunner.query(`ALTER TABLE "workout" ADD COLUMN "uuid_user_id" UUID`);
    await queryRunner.query(`ALTER TABLE "training_days" ADD COLUMN "uuid_workout_id" UUID`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" ADD COLUMN "uuid_training_day_id" UUID`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" ADD COLUMN "uuid_exercise_id" UUID`);
    await queryRunner.query(`ALTER TABLE "weekly_loads" ADD COLUMN "uuid_training_day_exercise_id" UUID`);
    await queryRunner.query(`ALTER TABLE "rep_schemes" ADD COLUMN "uuid_training_day_exercise_id" UUID`);
    await queryRunner.query(`ALTER TABLE "rest_intervals" ADD COLUMN "uuid_training_day_exercise_id" UUID`);

    // 3. Populate UUID foreign keys based on existing integer relationships
    // Users self-references
    await queryRunner.query(`
      UPDATE "users" SET "uuid_trainer_id" = trainer."uuid_id" 
      FROM "users" trainer 
      WHERE "users"."trainer_id" = trainer."id"
    `);
    
    await queryRunner.query(`
      UPDATE "users" SET "uuid_nutritionist_id" = nutritionist."uuid_id" 
      FROM "users" nutritionist 
      WHERE "users"."nutritionist_id" = nutritionist."id"
    `);

    // Workout relationships
    await queryRunner.query(`
      UPDATE "workout" SET "uuid_user_id" = users."uuid_id" 
      FROM "users" 
      WHERE "workout"."user_id" = users."id"
    `);

    // Training days relationships
    await queryRunner.query(`
      UPDATE "training_days" SET "uuid_workout_id" = workout."uuid_id" 
      FROM "workout" 
      WHERE "training_days"."workout_id" = workout."id"
    `);

    // Training day exercises relationships
    await queryRunner.query(`
      UPDATE "training_day_exercises" SET "uuid_training_day_id" = training_days."uuid_id" 
      FROM "training_days" 
      WHERE "training_day_exercises"."training_day_id" = training_days."id"
    `);
    
    await queryRunner.query(`
      UPDATE "training_day_exercises" SET "uuid_exercise_id" = exercises."uuid_id" 
      FROM "exercises" 
      WHERE "training_day_exercises"."exercise_id" = exercises."id"
    `);

    // Weekly loads relationships
    await queryRunner.query(`
      UPDATE "weekly_loads" SET "uuid_training_day_exercise_id" = training_day_exercises."uuid_id" 
      FROM "training_day_exercises" 
      WHERE "weekly_loads"."training_day_exercise_id" = training_day_exercises."id"
    `);

    // Rep schemes relationships
    await queryRunner.query(`
      UPDATE "rep_schemes" SET "uuid_training_day_exercise_id" = training_day_exercises."uuid_id" 
      FROM "training_day_exercises" 
      WHERE "rep_schemes"."training_day_exercise_id" = training_day_exercises."id"
    `);

    // Rest intervals relationships
    await queryRunner.query(`
      UPDATE "rest_intervals" SET "uuid_training_day_exercise_id" = training_day_exercises."uuid_id" 
      FROM "training_day_exercises" 
      WHERE "rest_intervals"."training_day_exercise_id" = training_day_exercises."id"
    `);

    // 4. Drop old foreign key constraints
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_trainer"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_nutritionist"`);
    await queryRunner.query(`ALTER TABLE "workout" DROP CONSTRAINT IF EXISTS "FK_workout_user"`);
    await queryRunner.query(`ALTER TABLE "training_days" DROP CONSTRAINT IF EXISTS "FK_training_days_workout"`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" DROP CONSTRAINT IF EXISTS "FK_training_day_exercises_training_day"`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" DROP CONSTRAINT IF EXISTS "FK_training_day_exercises_exercise"`);
    await queryRunner.query(`ALTER TABLE "weekly_loads" DROP CONSTRAINT IF EXISTS "FK_weekly_loads_training_day_exercise"`);
    await queryRunner.query(`ALTER TABLE "rep_schemes" DROP CONSTRAINT IF EXISTS "FK_rep_schemes_training_day_exercise"`);
    await queryRunner.query(`ALTER TABLE "rest_intervals" DROP CONSTRAINT IF EXISTS "FK_rest_intervals_training_day_exercise"`);

    // 5. Drop old integer columns and rename UUID columns to replace them
    // Primary keys first
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "uuid_id" TO "id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD PRIMARY KEY ("id")`);

    await queryRunner.query(`ALTER TABLE "workout" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "workout" RENAME COLUMN "uuid_id" TO "id"`);
    await queryRunner.query(`ALTER TABLE "workout" ADD PRIMARY KEY ("id")`);

    await queryRunner.query(`ALTER TABLE "training_days" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "training_days" RENAME COLUMN "uuid_id" TO "id"`);
    await queryRunner.query(`ALTER TABLE "training_days" ADD PRIMARY KEY ("id")`);

    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "exercises" RENAME COLUMN "uuid_id" TO "id"`);
    await queryRunner.query(`ALTER TABLE "exercises" ADD PRIMARY KEY ("id")`);

    await queryRunner.query(`ALTER TABLE "training_day_exercises" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" RENAME COLUMN "uuid_id" TO "id"`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" ADD PRIMARY KEY ("id")`);

    await queryRunner.query(`ALTER TABLE "weekly_loads" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "weekly_loads" RENAME COLUMN "uuid_id" TO "id"`);
    await queryRunner.query(`ALTER TABLE "weekly_loads" ADD PRIMARY KEY ("id")`);

    await queryRunner.query(`ALTER TABLE "rep_schemes" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "rep_schemes" RENAME COLUMN "uuid_id" TO "id"`);
    await queryRunner.query(`ALTER TABLE "rep_schemes" ADD PRIMARY KEY ("id")`);

    await queryRunner.query(`ALTER TABLE "rest_intervals" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "rest_intervals" RENAME COLUMN "uuid_id" TO "id"`);
    await queryRunner.query(`ALTER TABLE "rest_intervals" ADD PRIMARY KEY ("id")`);

    // Foreign keys
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "trainer_id"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "uuid_trainer_id" TO "trainer_id"`);
    
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nutritionist_id"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "uuid_nutritionist_id" TO "nutritionist_id"`);

    await queryRunner.query(`ALTER TABLE "workout" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "workout" RENAME COLUMN "uuid_user_id" TO "user_id"`);

    await queryRunner.query(`ALTER TABLE "training_days" DROP COLUMN "workout_id"`);
    await queryRunner.query(`ALTER TABLE "training_days" RENAME COLUMN "uuid_workout_id" TO "workout_id"`);

    await queryRunner.query(`ALTER TABLE "training_day_exercises" DROP COLUMN "training_day_id"`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" RENAME COLUMN "uuid_training_day_id" TO "training_day_id"`);
    
    await queryRunner.query(`ALTER TABLE "training_day_exercises" DROP COLUMN "exercise_id"`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" RENAME COLUMN "uuid_exercise_id" TO "exercise_id"`);

    await queryRunner.query(`ALTER TABLE "weekly_loads" DROP COLUMN "training_day_exercise_id"`);
    await queryRunner.query(`ALTER TABLE "weekly_loads" RENAME COLUMN "uuid_training_day_exercise_id" TO "training_day_exercise_id"`);

    await queryRunner.query(`ALTER TABLE "rep_schemes" DROP COLUMN "training_day_exercise_id"`);
    await queryRunner.query(`ALTER TABLE "rep_schemes" RENAME COLUMN "uuid_training_day_exercise_id" TO "training_day_exercise_id"`);

    await queryRunner.query(`ALTER TABLE "rest_intervals" DROP COLUMN "training_day_exercise_id"`);
    await queryRunner.query(`ALTER TABLE "rest_intervals" RENAME COLUMN "uuid_training_day_exercise_id" TO "training_day_exercise_id"`);

    // 6. Recreate foreign key constraints with UUID types
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_trainer" 
      FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_nutritionist" 
      FOREIGN KEY ("nutritionist_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "workout" 
      ADD CONSTRAINT "FK_workout_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "training_days" 
      ADD CONSTRAINT "FK_training_days_workout" 
      FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "training_day_exercises" 
      ADD CONSTRAINT "FK_training_day_exercises_training_day" 
      FOREIGN KEY ("training_day_id") REFERENCES "training_days"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "training_day_exercises" 
      ADD CONSTRAINT "FK_training_day_exercises_exercise" 
      FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id")
    `);

    await queryRunner.query(`
      ALTER TABLE "weekly_loads" 
      ADD CONSTRAINT "FK_weekly_loads_training_day_exercise" 
      FOREIGN KEY ("training_day_exercise_id") REFERENCES "training_day_exercises"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "rep_schemes" 
      ADD CONSTRAINT "FK_rep_schemes_training_day_exercise" 
      FOREIGN KEY ("training_day_exercise_id") REFERENCES "training_day_exercises"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "rest_intervals" 
      ADD CONSTRAINT "FK_rest_intervals_training_day_exercise" 
      FOREIGN KEY ("training_day_exercise_id") REFERENCES "training_day_exercises"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration is complex to reverse and would require
    // converting back to integer types, which is not recommended
    // after UUIDs are in use
    throw new Error('This UUID migration cannot be easily reverted. Please restore from backup if needed.');
  }
}