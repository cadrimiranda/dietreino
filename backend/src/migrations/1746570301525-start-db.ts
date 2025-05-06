import { MigrationInterface, QueryRunner } from 'typeorm';

export class StartDb1746570301525 implements MigrationInterface {
  name = 'StartDb1746570301525';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Para PostgreSQL, não podemos criar banco de dados dentro de transações
    // A criação do banco deve ser feita manualmente ou via script separado

    // Habilitar extensão uuid-ossp para IDs UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Criar tabela users
    await queryRunner.query(`
          CREATE TABLE "users" (
            "id" SERIAL PRIMARY KEY,
            "name" varchar(255) NOT NULL,
            "email" varchar(255) NOT NULL UNIQUE,
            "password" varchar(255) NOT NULL,
            "phone" varchar(255) NULL,
            "is_password_auto_generated" boolean NOT NULL DEFAULT false,
            "role" varchar(20) NOT NULL DEFAULT 'CLIENT',
            "trainer_id" integer NULL,
            "nutritionist_id" integer NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NULL
          )
        `);

    // Adicionar foreign keys após criar a tabela users (auto-referência)
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

    // Criar tabela workout
    await queryRunner.query(`
          CREATE TABLE "workout" (
            "id" SERIAL PRIMARY KEY,
            "user_id" integer NOT NULL,
            "name" varchar(100) NOT NULL,
            "week_start" TIMESTAMP WITH TIME ZONE NOT NULL,
            "week_end" TIMESTAMP WITH TIME ZONE NOT NULL,
            "created_at" date NOT NULL DEFAULT CURRENT_DATE,
            "is_active" boolean NOT NULL DEFAULT false,
            "training_days_bitfield" integer NOT NULL DEFAULT 0,
            "created_at_timestamp" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NULL,
            CONSTRAINT "FK_workout_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
          )
        `);

    // Criar tabela training_days
    await queryRunner.query(`
          CREATE TABLE "training_days" (
            "id" SERIAL PRIMARY KEY,
            "workout_id" integer NOT NULL,
            "dayOfWeek" integer NOT NULL,
            "focus" text NULL,
            "name" varchar(100) NOT NULL,
            "order" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NULL,
            CONSTRAINT "FK_training_days_workout" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE
          )
        `);

    // Criar tabela exercises
    await queryRunner.query(`
          CREATE TABLE "exercises" (
            "id" SERIAL PRIMARY KEY,
            "name" varchar(100) NOT NULL,
            "videoLink" text NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NULL
          )
        `);

    // Criar tabela training_day_exercises
    await queryRunner.query(`
          CREATE TABLE "training_day_exercises" (
            "id" SERIAL PRIMARY KEY,
            "training_day_id" integer NOT NULL,
            "exercise_id" integer NOT NULL,
            "order" integer NOT NULL,
            "sets" integer NOT NULL,
            "notes" text NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NULL,
            CONSTRAINT "FK_training_day_exercises_training_day" FOREIGN KEY ("training_day_id") REFERENCES "training_days"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_training_day_exercises_exercise" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id")
          )
        `);

    // Criar tabela weekly_loads
    await queryRunner.query(`
          CREATE TABLE "weekly_loads" (
            "id" SERIAL PRIMARY KEY,
            "training_day_exercise_id" integer NOT NULL,
            "week" integer NOT NULL,
            "load" varchar(100) NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NULL,
            CONSTRAINT "FK_weekly_loads_training_day_exercise" FOREIGN KEY ("training_day_exercise_id") REFERENCES "training_day_exercises"("id") ON DELETE CASCADE
          )
        `);

    // Criar tabela rep_schemes
    await queryRunner.query(`
          CREATE TABLE "rep_schemes" (
            "id" SERIAL PRIMARY KEY,
            "training_day_exercise_id" integer NOT NULL,
            "sets" integer NOT NULL,
            "minReps" integer NOT NULL,
            "maxReps" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NULL,
            CONSTRAINT "FK_rep_schemes_training_day_exercise" FOREIGN KEY ("training_day_exercise_id") REFERENCES "training_day_exercises"("id") ON DELETE CASCADE
          )
        `);

    // Criar tabela rest_intervals
    await queryRunner.query(`
          CREATE TABLE "rest_intervals" (
            "id" SERIAL PRIMARY KEY,
            "training_day_exercise_id" integer NOT NULL,
            "intervalTime" varchar(30) NOT NULL,
            "order" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NULL,
            CONSTRAINT "FK_rest_intervals_training_day_exercise" FOREIGN KEY ("training_day_exercise_id") REFERENCES "training_day_exercises"("id") ON DELETE CASCADE
          )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tabelas em ordem reversa para evitar problemas com foreign keys
    await queryRunner.query(`DROP TABLE IF EXISTS "rest_intervals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rep_schemes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "weekly_loads"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "training_day_exercises"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "exercises"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "training_days"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workout"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
