import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixIdTypesToUuid1748527130275 implements MigrationInterface {
  name = 'FixIdTypesToUuid1748527130275';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Temporarily disable foreign key constraints
    await queryRunner.query(`SET session_replication_role = replica;`);

    // Drop all foreign key constraints first
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_trainer"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_nutritionist"`);
    await queryRunner.query(`ALTER TABLE "workout" DROP CONSTRAINT IF EXISTS "FK_workout_user"`);
    await queryRunner.query(`ALTER TABLE "training_days" DROP CONSTRAINT IF EXISTS "FK_training_days_workout"`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" DROP CONSTRAINT IF EXISTS "FK_training_day_exercises_training_day"`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" DROP CONSTRAINT IF EXISTS "FK_training_day_exercises_exercise"`);
    await queryRunner.query(`ALTER TABLE "weekly_loads" DROP CONSTRAINT IF EXISTS "FK_weekly_loads_training_day_exercise"`);
    await queryRunner.query(`ALTER TABLE "rep_schemes" DROP CONSTRAINT IF EXISTS "FK_rep_schemes_training_day_exercise"`);
    await queryRunner.query(`ALTER TABLE "rest_intervals" DROP CONSTRAINT IF EXISTS "FK_rest_intervals_training_day_exercise"`);

    // Change all ID columns from SERIAL to UUID
    
    // Users table
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "id" UUID NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "users" ADD PRIMARY KEY ("id")`);
    
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "trainer_id" TYPE UUID USING NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "nutritionist_id" TYPE UUID USING NULL`);

    // Workout table
    await queryRunner.query(`ALTER TABLE "workout" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "workout" ADD COLUMN "id" UUID NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "workout" ADD PRIMARY KEY ("id")`);
    
    await queryRunner.query(`ALTER TABLE "workout" ALTER COLUMN "user_id" TYPE UUID USING NULL`);

    // Training days table
    await queryRunner.query(`ALTER TABLE "training_days" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "training_days" ADD COLUMN "id" UUID NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "training_days" ADD PRIMARY KEY ("id")`);
    
    await queryRunner.query(`ALTER TABLE "training_days" ALTER COLUMN "workout_id" TYPE UUID USING NULL`);

    // Exercises table
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "exercises" ADD COLUMN "id" UUID NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "exercises" ADD PRIMARY KEY ("id")`);

    // Training day exercises table
    await queryRunner.query(`ALTER TABLE "training_day_exercises" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" ADD COLUMN "id" UUID NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" ADD PRIMARY KEY ("id")`);
    
    await queryRunner.query(`ALTER TABLE "training_day_exercises" ALTER COLUMN "training_day_id" TYPE UUID USING NULL`);
    await queryRunner.query(`ALTER TABLE "training_day_exercises" ALTER COLUMN "exercise_id" TYPE UUID USING NULL`);

    // Weekly loads table
    await queryRunner.query(`ALTER TABLE "weekly_loads" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "weekly_loads" ADD COLUMN "id" UUID NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "weekly_loads" ADD PRIMARY KEY ("id")`);
    
    await queryRunner.query(`ALTER TABLE "weekly_loads" ALTER COLUMN "training_day_exercise_id" TYPE UUID USING NULL`);

    // Rep schemes table
    await queryRunner.query(`ALTER TABLE "rep_schemes" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "rep_schemes" ADD COLUMN "id" UUID NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "rep_schemes" ADD PRIMARY KEY ("id")`);
    
    await queryRunner.query(`ALTER TABLE "rep_schemes" ALTER COLUMN "training_day_exercise_id" TYPE UUID USING NULL`);

    // Rest intervals table
    await queryRunner.query(`ALTER TABLE "rest_intervals" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "rest_intervals" ADD COLUMN "id" UUID NOT NULL DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "rest_intervals" ADD PRIMARY KEY ("id")`);
    
    await queryRunner.query(`ALTER TABLE "rest_intervals" ALTER COLUMN "training_day_exercise_id" TYPE UUID USING NULL`);

    // Re-enable foreign key constraints
    await queryRunner.query(`SET session_replication_role = DEFAULT;`);

    // Recreate foreign key constraints
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
    // This migration is not easily reversible due to data loss
    // Would need to recreate the tables with integer IDs
    throw new Error('This migration cannot be reverted as it would cause data loss');
  }
}