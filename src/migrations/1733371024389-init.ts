import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1733371024389 implements MigrationInterface {
  name = 'Init1733371024389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "iam_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "expiration_time" TIMESTAMP WITH TIME ZONE NOT NULL, "has_login_profile" boolean NOT NULL DEFAULT false, "policy_name" character varying, CONSTRAINT "PK_1dce953388a63ca32d8e2c3f1f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_permissions_permission_enum" AS ENUM('console.create', 'console.delete', 'programmatic.create', 'programmatic.delete', 'role-management.all', 'audit-logs.all', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("permission" "public"."role_permissions_permission_enum" NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_Role_Permissions_permission_id_role_id" PRIMARY KEY ("permission", "role_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password_hash" character varying NOT NULL, "is_accepted" boolean NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_User_username" ON "user" ("username") `,
    );
    await queryRunner.query(
      `CREATE TABLE "request_response_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" character varying NOT NULL, "ip" character varying NOT NULL, "url" character varying NOT NULL, "user_agent" character varying NOT NULL, "response_status_code" integer, "time_taken" bigint, "request_arrival_time" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_b70ea63f1df95cc07ef12a98b12" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_Role_Permissions_role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_User_role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "request_response_history" ADD CONSTRAINT "FK_6346ad7f8985710e627214e421b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "request_response_history" DROP CONSTRAINT "FK_6346ad7f8985710e627214e421b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_User_role_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_Role_Permissions_role_id"`,
    );
    await queryRunner.query(`DROP TABLE "request_response_history"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_User_username"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(
      `DROP TYPE "public"."role_permissions_permission_enum"`,
    );
    await queryRunner.query(`DROP TABLE "iam_user"`);
  }
}
