import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApplicationBusinessFields1778466879967 implements MigrationInterface {
  name = 'AddApplicationBusinessFields1778466879967';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "institutionName" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "licenseType" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "applications" ADD "notes" text`);
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "infoRequestNote" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "resubmissionNote" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "decisionNote" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "submittedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "submittedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "finalizedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "finalizedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "finalizedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "finalizedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "submittedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "submittedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "decisionNote"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "resubmissionNote"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "infoRequestNote"`,
    );
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "notes"`);
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "licenseType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "institutionName"`,
    );
  }
}
