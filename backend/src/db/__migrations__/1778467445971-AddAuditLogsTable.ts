import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditLogsTable1778467445971 implements MigrationInterface {
  name = 'AddAuditLogsTable1778467445971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('APPLICATION_DRAFT_CREATED', 'APPLICATION_SUBMITTED', 'APPLICATION_REVIEW_STARTED', 'APPLICATION_INFO_REQUESTED', 'APPLICATION_RESUBMITTED', 'APPLICATION_REVIEW_COMPLETED', 'APPLICATION_APPROVED', 'APPLICATION_REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_previousstatus_enum" AS ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED', 'RESUBMITTED', 'REVIEW_COMPLETED', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_newstatus_enum" AS ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED', 'RESUBMITTED', 'REVIEW_COMPLETED', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "action" "public"."audit_logs_action_enum" NOT NULL, "applicationId" uuid NOT NULL, "previousStatus" "public"."audit_logs_previousstatus_enum", "newStatus" "public"."audit_logs_newstatus_enum" NOT NULL, "metadata" jsonb, "actorId" uuid NOT NULL, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_2dc33f7f3c22e2e7badafca1d12" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_2dc33f7f3c22e2e7badafca1d12"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_newstatus_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."audit_logs_previousstatus_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
  }
}
