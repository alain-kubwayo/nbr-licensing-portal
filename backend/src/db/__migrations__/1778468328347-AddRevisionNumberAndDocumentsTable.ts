import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRevisionNumberAndDocumentsTable1778468328347 implements MigrationInterface {
    name = 'AddRevisionNumberAndDocumentsTable1778468328347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "uploadedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "revisionNumber" integer NOT NULL, "originalName" character varying(512) NOT NULL, "storedName" character varying(512) NOT NULL, "storagePath" character varying(1024) NOT NULL, "mimeType" character varying(128) NOT NULL, "size" integer NOT NULL, "applicationId" uuid NOT NULL, "uploadedById" uuid NOT NULL, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "applications" ADD "revisionNumber" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum" RENAME TO "audit_logs_action_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('APPLICATION_DRAFT_CREATED', 'APPLICATION_SUBMITTED', 'APPLICATION_REVIEW_STARTED', 'APPLICATION_INFO_REQUESTED', 'APPLICATION_RESUBMITTED', 'APPLICATION_REVIEW_COMPLETED', 'APPLICATION_APPROVED', 'APPLICATION_REJECTED', 'DOCUMENT_UPLOADED')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "public"."audit_logs_action_enum" USING "action"::"text"::"public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum_old"`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_a46d9e1edf44fe362a14bd5344d" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_5aad3bc717a4f483887ec61dbc8" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_5aad3bc717a4f483887ec61dbc8"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_a46d9e1edf44fe362a14bd5344d"`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum_old" AS ENUM('APPLICATION_DRAFT_CREATED', 'APPLICATION_SUBMITTED', 'APPLICATION_REVIEW_STARTED', 'APPLICATION_INFO_REQUESTED', 'APPLICATION_RESUBMITTED', 'APPLICATION_REVIEW_COMPLETED', 'APPLICATION_APPROVED', 'APPLICATION_REJECTED')`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "action" TYPE "public"."audit_logs_action_enum_old" USING "action"::"text"::"public"."audit_logs_action_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."audit_logs_action_enum_old" RENAME TO "audit_logs_action_enum"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "revisionNumber"`);
        await queryRunner.query(`DROP TABLE "documents"`);
    }

}
