import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ApplicationStatus } from '../../applications/application-status.enum';
import { ApplicationEntity } from '../../applications/application.entity';
import { AuditAction } from '../../audit/audit-action.enum';
import { AuditLogEntity } from '../../audit/audit-log.entity';
import { UserEntity } from '../../users/user.entity';
import { SEED_USERS } from './user.seeder';

interface SeedApp {
  institutionName: string;
  licenseType: string;
  notes: string;
  applicantEmail: string;
  targetStatus: ApplicationStatus;
  reviewerEmail?: string;
  approverEmail?: string;
  infoRequestNote?: string;
  resubmissionNote?: string;
  decisionNote?: string;
}

const SEED_APPS: SeedApp[] = [
  {
    institutionName: 'Kigali Commercial Bank Ltd',
    licenseType: 'Commercial Bank',
    notes: 'Application for a full commercial banking license.',
    applicantEmail: SEED_USERS.applicant1.email,
    targetStatus: ApplicationStatus.DRAFT,
  },
  {
    institutionName: 'Rwanda Microfinance Corp',
    licenseType: 'Microfinance Institution',
    notes: 'Seeking microfinance license to serve rural communities.',
    applicantEmail: SEED_USERS.applicant1.email,
    targetStatus: ApplicationStatus.SUBMITTED,
  },
  {
    institutionName: 'East Africa Savings Bank',
    licenseType: 'Savings Bank',
    notes: 'Regional savings bank targeting SME sector.',
    applicantEmail: SEED_USERS.applicant2.email,
    reviewerEmail: SEED_USERS.reviewer1.email,
    targetStatus: ApplicationStatus.UNDER_REVIEW,
  },
  {
    institutionName: 'Horizon Digital Finance',
    licenseType: 'Digital Bank',
    notes: 'Mobile-first digital banking platform.',
    applicantEmail: SEED_USERS.applicant2.email,
    reviewerEmail: SEED_USERS.reviewer1.email,
    infoRequestNote:
      'Please provide audited financial statements for the last 3 years and proof of minimum capital requirement.',
    targetStatus: ApplicationStatus.INFO_REQUESTED,
  },
  {
    institutionName: 'Great Lakes Investment Bank',
    licenseType: 'Investment Bank',
    notes: 'Investment banking services for infrastructure projects.',
    applicantEmail: SEED_USERS.applicant1.email,
    reviewerEmail: SEED_USERS.reviewer2.email,
    targetStatus: ApplicationStatus.REVIEW_COMPLETED,
  },
  {
    institutionName: 'Umurenge Cooperative Bank',
    licenseType: 'Cooperative Bank',
    notes: 'Community cooperative bank serving agricultural sector.',
    applicantEmail: SEED_USERS.applicant2.email,
    reviewerEmail: SEED_USERS.reviewer2.email,
    approverEmail: SEED_USERS.approver.email,
    decisionNote:
      'All requirements met. Capital adequacy confirmed. License approved.',
    targetStatus: ApplicationStatus.APPROVED,
  },
  {
    institutionName: 'Frontier Forex Bureau',
    licenseType: 'Foreign Exchange Bureau',
    notes: 'Foreign exchange services for tourism and trade.',
    applicantEmail: SEED_USERS.applicant1.email,
    reviewerEmail: SEED_USERS.reviewer1.email,
    approverEmail: SEED_USERS.approver.email,
    decisionNote:
      'Application rejected due to insufficient capital reserves and incomplete compliance documentation.',
    targetStatus: ApplicationStatus.REJECTED,
  },
];

export class ApplicationSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const appRepo = dataSource.getRepository(ApplicationEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    for (const seed of SEED_APPS) {
      const existing = await appRepo.findOneBy({
        institutionName: seed.institutionName,
      });
      if (existing) continue;

      const applicant = await userRepo.findOneByOrFail({
        email: seed.applicantEmail,
      });
      const reviewer = seed.reviewerEmail
        ? await userRepo.findOneByOrFail({ email: seed.reviewerEmail })
        : undefined;
      const approver = seed.approverEmail
        ? await userRepo.findOneByOrFail({ email: seed.approverEmail })
        : undefined;

      await dataSource.transaction(async (manager) => {
        const app = manager.create(ApplicationEntity, {
          institutionName: seed.institutionName,
          licenseType: seed.licenseType,
          notes: seed.notes,
          applicant,
          status: seed.targetStatus,
          reviewedBy: reviewer,
          approvedBy: approver,
          infoRequestNote: seed.infoRequestNote,
          resubmissionNote: seed.resubmissionNote,
          decisionNote: seed.decisionNote,
          submittedAt: this.needsSubmittedAt(seed.targetStatus)
            ? new Date()
            : undefined,
          finalizedAt: this.needsFinalizedAt(seed.targetStatus)
            ? new Date()
            : undefined,
        });

        const saved = await manager.save(ApplicationEntity, app);

        const auditEntries = this.buildAuditTrail(
          saved,
          applicant,
          reviewer,
          approver,
          seed,
        );

        for (const entry of auditEntries) {
          const log = manager.create(AuditLogEntity, {
            ...entry,
            applicationId: saved.id,
          });
          await manager.save(AuditLogEntity, log);
        }
      });
    }
  }

  private needsSubmittedAt(status: ApplicationStatus): boolean {
    return [
      ApplicationStatus.SUBMITTED,
      ApplicationStatus.UNDER_REVIEW,
      ApplicationStatus.INFO_REQUESTED,
      ApplicationStatus.RESUBMITTED,
      ApplicationStatus.REVIEW_COMPLETED,
      ApplicationStatus.APPROVED,
      ApplicationStatus.REJECTED,
    ].includes(status);
  }

  private needsFinalizedAt(status: ApplicationStatus): boolean {
    return [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED].includes(
      status,
    );
  }

  private buildAuditTrail(
    app: ApplicationEntity,
    applicant: UserEntity,
    reviewer: UserEntity | undefined,
    approver: UserEntity | undefined,
    seed: SeedApp,
  ): Partial<AuditLogEntity>[] {
    const entries: Partial<AuditLogEntity>[] = [
      {
        action: AuditAction.APPLICATION_DRAFT_CREATED,
        actor: applicant,
        previousStatus: null,
        newStatus: ApplicationStatus.DRAFT,
      },
    ];

    if (seed.targetStatus === ApplicationStatus.DRAFT) return entries;

    entries.push({
      action: AuditAction.APPLICATION_SUBMITTED,
      actor: applicant,
      previousStatus: ApplicationStatus.DRAFT,
      newStatus: ApplicationStatus.SUBMITTED,
    });

    if (seed.targetStatus === ApplicationStatus.SUBMITTED) return entries;

    entries.push({
      action: AuditAction.APPLICATION_REVIEW_STARTED,
      actor: reviewer!,
      previousStatus: ApplicationStatus.SUBMITTED,
      newStatus: ApplicationStatus.UNDER_REVIEW,
    });

    if (seed.targetStatus === ApplicationStatus.UNDER_REVIEW) return entries;

    if (seed.targetStatus === ApplicationStatus.INFO_REQUESTED) {
      entries.push({
        action: AuditAction.APPLICATION_INFO_REQUESTED,
        actor: reviewer!,
        previousStatus: ApplicationStatus.UNDER_REVIEW,
        newStatus: ApplicationStatus.INFO_REQUESTED,
        metadata: { infoRequestNote: seed.infoRequestNote },
      });
      return entries;
    }

    entries.push({
      action: AuditAction.APPLICATION_REVIEW_COMPLETED,
      actor: reviewer!,
      previousStatus: ApplicationStatus.UNDER_REVIEW,
      newStatus: ApplicationStatus.REVIEW_COMPLETED,
    });

    if (seed.targetStatus === ApplicationStatus.REVIEW_COMPLETED)
      return entries;

    if (seed.targetStatus === ApplicationStatus.APPROVED) {
      entries.push({
        action: AuditAction.APPLICATION_APPROVED,
        actor: approver!,
        previousStatus: ApplicationStatus.REVIEW_COMPLETED,
        newStatus: ApplicationStatus.APPROVED,
        metadata: { decisionNote: seed.decisionNote },
      });
    } else if (seed.targetStatus === ApplicationStatus.REJECTED) {
      entries.push({
        action: AuditAction.APPLICATION_REJECTED,
        actor: approver!,
        previousStatus: ApplicationStatus.REVIEW_COMPLETED,
        newStatus: ApplicationStatus.REJECTED,
        metadata: { decisionNote: seed.decisionNote },
      });
    }

    return entries;
  }
}
