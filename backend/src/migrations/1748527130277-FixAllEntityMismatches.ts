import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAllEntityMismatches1748527130277 implements MigrationInterface {
  name = 'FixAllEntityMismatches1748527130277';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Fix User table role constraints to match UserRole enum
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "CHK_user_role" 
      CHECK ("role" IN ('CLIENT', 'TRAINER', 'NUTRITIONIST'))
    `);

    // 2. Fix workout table - remove redundant created_at column
    await queryRunner.query(`
      ALTER TABLE "workout" 
      DROP COLUMN IF EXISTS "created_at"
    `);
    
    // Rename created_at_timestamp to created_at to match BaseEntity
    await queryRunner.query(`
      ALTER TABLE "workout" 
      RENAME COLUMN "created_at_timestamp" TO "created_at"
    `);

    // 3. Fix all updated_at columns to have proper auto-update behavior
    // This ensures TypeORM's @UpdateDateColumn works correctly
    
    // Users table
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create triggers for all tables to auto-update updated_at
    const tables = [
      'users', 'workout', 'training_days', 'exercises', 
      'training_day_exercises', 'weekly_loads', 'rep_schemes', 'rest_intervals'
    ];

    for (const table of tables) {
      await queryRunner.query(`
        CREATE TRIGGER update_${table}_updated_at 
        BEFORE UPDATE ON "${table}" 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
      `);
    }

    // 4. Fix training_day_exercises table structure
    // Remove the sets column that shouldn't be there (it's in rep_schemes)
    await queryRunner.query(`
      ALTER TABLE "training_day_exercises" 
      DROP COLUMN IF EXISTS "sets"
    `);

    // Remove notes column that's not in the entity
    await queryRunner.query(`
      ALTER TABLE "training_day_exercises" 
      DROP COLUMN IF EXISTS "notes"
    `);

    // 5. Add missing indexes for performance (foreign keys)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_trainer_id" ON "users" ("trainer_id")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_nutritionist_id" ON "users" ("nutritionist_id")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_workout_user_id" ON "workout" ("user_id")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_training_days_workout_id" ON "training_days" ("workout_id")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_training_day_exercises_training_day_id" ON "training_day_exercises" ("training_day_id")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_training_day_exercises_exercise_id" ON "training_day_exercises" ("exercise_id")
    `);

    // 6. Fix column types to match entities better
    // Ensure exercise names can be longer if needed
    await queryRunner.query(`
      ALTER TABLE "exercises" 
      ALTER COLUMN "name" TYPE varchar(255)
    `);

    // Ensure user names can be longer
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "name" TYPE varchar(255)
    `);

    // 7. Add proper unique constraints that match entities
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email_unique" ON "users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove role constraint
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP CONSTRAINT IF EXISTS "CHK_user_role"
    `);

    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_trainer_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_nutritionist_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_workout_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_training_days_workout_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_training_day_exercises_training_day_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_training_day_exercises_exercise_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email_unique"`);

    // Remove triggers
    const tables = [
      'users', 'workout', 'training_days', 'exercises', 
      'training_day_exercises', 'weekly_loads', 'rep_schemes', 'rest_intervals'
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON "${table}"`);
    }

    // Remove function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // Revert column changes
    await queryRunner.query(`
      ALTER TABLE "exercises" 
      ALTER COLUMN "name" TYPE varchar(100)
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "name" TYPE varchar(255)
    `);

    // Note: Cannot easily revert the workout table changes without data loss
    // This would require restoring the redundant created_at column
  }
}