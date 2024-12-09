import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1733717363808 implements MigrationInterface {
  name = 'Init1733717363808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "iam_user" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar NOT NULL, "expiration_time" datetime NOT NULL, "has_login_profile" boolean NOT NULL DEFAULT (0), "policy_name" varchar)`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("permission" varchar CHECK( "permission" IN ('console.create','console.delete','programmatic.create','programmatic.delete','role-management.all','audit-logs.all','admin') ) NOT NULL, "role_id" varchar NOT NULL, PRIMARY KEY ("permission", "role_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar NOT NULL, "password_hash" varchar NOT NULL, "is_accepted" boolean NOT NULL, "role_id" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_User_username" ON "user" ("username") `,
    );
    await queryRunner.query(
      `CREATE TABLE "request_response_history" ("id" varchar PRIMARY KEY NOT NULL, "method" varchar NOT NULL, "ip" varchar NOT NULL, "url" varchar NOT NULL, "user_agent" varchar NOT NULL, "response_status_code" integer, "time_taken" bigint, "request_arrival_time" datetime NOT NULL DEFAULT (datetime('now')), "user_id" varchar)`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_role_permissions" ("permission" varchar CHECK( "permission" IN ('console.create','console.delete','programmatic.create','programmatic.delete','role-management.all','audit-logs.all','admin') ) NOT NULL, "role_id" varchar NOT NULL, CONSTRAINT "FK_Role_Permissions_role_id" FOREIGN KEY ("role_id") REFERENCES "role" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("permission", "role_id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_role_permissions"("permission", "role_id") SELECT "permission", "role_id" FROM "role_permissions"`,
    );
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_role_permissions" RENAME TO "role_permissions"`,
    );
    await queryRunner.query(`DROP INDEX "UQ_User_username"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_user" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar NOT NULL, "password_hash" varchar NOT NULL, "is_accepted" boolean NOT NULL, "role_id" varchar NOT NULL, CONSTRAINT "FK_User_role_id" FOREIGN KEY ("role_id") REFERENCES "role" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_user"("id", "username", "password_hash", "is_accepted", "role_id") SELECT "id", "username", "password_hash", "is_accepted", "role_id" FROM "user"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_User_username" ON "user" ("username") `,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_request_response_history" ("id" varchar PRIMARY KEY NOT NULL, "method" varchar NOT NULL, "ip" varchar NOT NULL, "url" varchar NOT NULL, "user_agent" varchar NOT NULL, "response_status_code" integer, "time_taken" bigint, "request_arrival_time" datetime NOT NULL DEFAULT (datetime('now')), "user_id" varchar, CONSTRAINT "FK_6346ad7f8985710e627214e421b" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_request_response_history"("id", "method", "ip", "url", "user_agent", "response_status_code", "time_taken", "request_arrival_time", "user_id") SELECT "id", "method", "ip", "url", "user_agent", "response_status_code", "time_taken", "request_arrival_time", "user_id" FROM "request_response_history"`,
    );
    await queryRunner.query(`DROP TABLE "request_response_history"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_request_response_history" RENAME TO "request_response_history"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "request_response_history" RENAME TO "temporary_request_response_history"`,
    );
    await queryRunner.query(
      `CREATE TABLE "request_response_history" ("id" varchar PRIMARY KEY NOT NULL, "method" varchar NOT NULL, "ip" varchar NOT NULL, "url" varchar NOT NULL, "user_agent" varchar NOT NULL, "response_status_code" integer, "time_taken" bigint, "request_arrival_time" datetime NOT NULL DEFAULT (datetime('now')), "user_id" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "request_response_history"("id", "method", "ip", "url", "user_agent", "response_status_code", "time_taken", "request_arrival_time", "user_id") SELECT "id", "method", "ip", "url", "user_agent", "response_status_code", "time_taken", "request_arrival_time", "user_id" FROM "temporary_request_response_history"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_request_response_history"`);
    await queryRunner.query(`DROP INDEX "UQ_User_username"`);
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
    await queryRunner.query(
      `CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "username" varchar NOT NULL, "password_hash" varchar NOT NULL, "is_accepted" boolean NOT NULL, "role_id" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "user"("id", "username", "password_hash", "is_accepted", "role_id") SELECT "id", "username", "password_hash", "is_accepted", "role_id" FROM "temporary_user"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_user"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_User_username" ON "user" ("username") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" RENAME TO "temporary_role_permissions"`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("permission" varchar CHECK( "permission" IN ('console.create','console.delete','programmatic.create','programmatic.delete','role-management.all','audit-logs.all','admin') ) NOT NULL, "role_id" varchar NOT NULL, PRIMARY KEY ("permission", "role_id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "role_permissions"("permission", "role_id") SELECT "permission", "role_id" FROM "temporary_role_permissions"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_role_permissions"`);
    await queryRunner.query(`DROP TABLE "request_response_history"`);
    await queryRunner.query(`DROP INDEX "UQ_User_username"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "iam_user"`);
  }
}
