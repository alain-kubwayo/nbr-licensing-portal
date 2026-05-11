import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AuditAction } from '../audit/audit-action.enum';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '../users/enums/user-role.enum';
import { UserEntity } from '../users/user.entity';
import { ApplicationStatus } from './application-status.enum';
import { ApplicationEntity } from './application.entity';
import { canTransition } from './application.utils';
import { CreateApplicationDto } from './dto/create-application.dto';
import { FinalizeApplicationDto } from './dto/finalize-application.dto';
import { RequestInfoDto } from './dto/request-info.dto';
import { ResubmitApplicationDto } from './dto/resubmit-application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  async findAll(requestingUser: UserEntity): Promise<ApplicationEntity[]> {
    if (requestingUser.role === UserRole.APPLICANT) {
      return this.applicationRepository.find({
        where: { applicant: { id: requestingUser.id } },
        relations: ['applicant', 'reviewedBy', 'approvedBy'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.applicationRepository.find({
      relations: ['applicant', 'reviewedBy', 'approvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(
    id: string,
    requestingUser: UserEntity,
  ): Promise<ApplicationEntity> {
    const application = await this.findOrThrow(
      id,
      this.applicationRepository.manager,
    );

    if (
      requestingUser.role === UserRole.APPLICANT &&
      application.applicant.id !== requestingUser.id
    ) {
      throw new ForbiddenException(
        'You do not have access to this application',
      );
    }

    return application;
  }

  async createDraft(
    dto: CreateApplicationDto,
    applicant: UserEntity,
  ): Promise<ApplicationEntity> {
    return this.dataSource.transaction(async (manager) => {
      const application = manager.create(ApplicationEntity, {
        ...dto,
        applicant,
        status: ApplicationStatus.DRAFT,
      });
      const saved = await manager.save(ApplicationEntity, application);

      await this.auditService.log(manager, {
        action: AuditAction.APPLICATION_DRAFT_CREATED,
        applicationId: saved.id,
        actor: applicant,
        previousStatus: null,
        newStatus: ApplicationStatus.DRAFT,
      });

      return saved;
    });
  }

  async submit(
    id: string,
    requestingUser: UserEntity,
  ): Promise<ApplicationEntity> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.findOrThrow(id, manager);

      this.assertOwnership(application, requestingUser);
      this.assertTransition(application.status, ApplicationStatus.SUBMITTED);

      const previousStatus = application.status;
      application.status = ApplicationStatus.SUBMITTED;
      application.submittedAt = new Date();

      const saved = await manager.save(ApplicationEntity, application);

      await this.auditService.log(manager, {
        action: AuditAction.APPLICATION_SUBMITTED,
        applicationId: saved.id,
        actor: requestingUser,
        previousStatus,
        newStatus: ApplicationStatus.SUBMITTED,
      });

      return saved;
    });
  }

  async resubmit(
    id: string,
    dto: ResubmitApplicationDto,
    requestingUser: UserEntity,
  ): Promise<ApplicationEntity> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.findOrThrow(id, manager);

      this.assertOwnership(application, requestingUser);
      this.assertTransition(application.status, ApplicationStatus.RESUBMITTED);

      const previousStatus = application.status;
      application.status = ApplicationStatus.RESUBMITTED;
      application.resubmissionNote = dto.resubmissionNote;

      const saved = await manager.save(ApplicationEntity, application);

      await this.auditService.log(manager, {
        action: AuditAction.APPLICATION_RESUBMITTED,
        applicationId: saved.id,
        actor: requestingUser,
        previousStatus,
        newStatus: ApplicationStatus.RESUBMITTED,
        metadata: { resubmissionNote: dto.resubmissionNote },
      });

      return saved;
    });
  }

  async startReview(
    id: string,
    reviewer: UserEntity,
  ): Promise<ApplicationEntity> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.findOrThrow(id, manager);

      this.assertTransition(application.status, ApplicationStatus.UNDER_REVIEW);

      const previousStatus = application.status;
      application.status = ApplicationStatus.UNDER_REVIEW;
      application.reviewedBy = reviewer;

      const saved = await manager.save(ApplicationEntity, application);

      await this.auditService.log(manager, {
        action: AuditAction.APPLICATION_REVIEW_STARTED,
        applicationId: saved.id,
        actor: reviewer,
        previousStatus,
        newStatus: ApplicationStatus.UNDER_REVIEW,
      });

      return saved;
    });
  }

  async requestInfo(
    id: string,
    dto: RequestInfoDto,
    reviewer: UserEntity,
  ): Promise<ApplicationEntity> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.findOrThrow(id, manager);

      this.assertAssignedReviewer(application, reviewer);
      this.assertTransition(
        application.status,
        ApplicationStatus.INFO_REQUESTED,
      );

      const previousStatus = application.status;
      application.status = ApplicationStatus.INFO_REQUESTED;
      application.infoRequestNote = dto.infoRequestNote;

      const saved = await manager.save(ApplicationEntity, application);

      await this.auditService.log(manager, {
        action: AuditAction.APPLICATION_INFO_REQUESTED,
        applicationId: saved.id,
        actor: reviewer,
        previousStatus,
        newStatus: ApplicationStatus.INFO_REQUESTED,
        metadata: { infoRequestNote: dto.infoRequestNote },
      });

      return saved;
    });
  }

  async completeReview(
    id: string,
    reviewer: UserEntity,
  ): Promise<ApplicationEntity> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.findOrThrow(id, manager);

      this.assertAssignedReviewer(application, reviewer);
      this.assertTransition(
        application.status,
        ApplicationStatus.REVIEW_COMPLETED,
      );

      const previousStatus = application.status;
      application.status = ApplicationStatus.REVIEW_COMPLETED;

      const saved = await manager.save(ApplicationEntity, application);

      await this.auditService.log(manager, {
        action: AuditAction.APPLICATION_REVIEW_COMPLETED,
        applicationId: saved.id,
        actor: reviewer,
        previousStatus,
        newStatus: ApplicationStatus.REVIEW_COMPLETED,
      });

      return saved;
    });
  }

  async approve(
    id: string,
    dto: FinalizeApplicationDto,
    approver: UserEntity,
  ): Promise<ApplicationEntity> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.findOrThrow(id, manager);

      this.assertNotReviewer(application, approver);
      this.assertTransition(application.status, ApplicationStatus.APPROVED);

      const previousStatus = application.status;
      application.status = ApplicationStatus.APPROVED;
      application.approvedBy = approver;
      application.decisionNote = dto.decisionNote;
      application.finalizedAt = new Date();

      const saved = await manager.save(ApplicationEntity, application);

      await this.auditService.log(manager, {
        action: AuditAction.APPLICATION_APPROVED,
        applicationId: saved.id,
        actor: approver,
        previousStatus,
        newStatus: ApplicationStatus.APPROVED,
        metadata: { decisionNote: dto.decisionNote },
      });

      return saved;
    });
  }

  async reject(
    id: string,
    dto: FinalizeApplicationDto,
    approver: UserEntity,
  ): Promise<ApplicationEntity> {
    return this.dataSource.transaction(async (manager) => {
      const application = await this.findOrThrow(id, manager);

      this.assertNotReviewer(application, approver);
      this.assertTransition(application.status, ApplicationStatus.REJECTED);

      const previousStatus = application.status;
      application.status = ApplicationStatus.REJECTED;
      application.approvedBy = approver;
      application.decisionNote = dto.decisionNote;
      application.finalizedAt = new Date();

      const saved = await manager.save(ApplicationEntity, application);

      await this.auditService.log(manager, {
        action: AuditAction.APPLICATION_REJECTED,
        applicationId: saved.id,
        actor: approver,
        previousStatus,
        newStatus: ApplicationStatus.REJECTED,
        metadata: { decisionNote: dto.decisionNote },
      });

      return saved;
    });
  }

  private async findOrThrow(
    id: string,
    manager: EntityManager,
  ): Promise<ApplicationEntity> {
    const application = await manager.findOne(ApplicationEntity, {
      where: { id },
      relations: ['applicant', 'reviewedBy', 'approvedBy'],
    });

    if (!application) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }

    return application;
  }

  private assertTransition(
    from: ApplicationStatus,
    to: ApplicationStatus,
  ): void {
    if (!canTransition(from, to)) {
      throw new BadRequestException(
        `Cannot transition application from "${from}" to "${to}"`,
      );
    }
  }

  private assertOwnership(
    application: ApplicationEntity,
    user: UserEntity,
  ): void {
    if (application.applicant.id !== user.id) {
      throw new ForbiddenException('You are not the owner of this application');
    }
  }

  private assertAssignedReviewer(
    application: ApplicationEntity,
    user: UserEntity,
  ): void {
    if (!application.reviewedBy || application.reviewedBy.id !== user.id) {
      throw new ForbiddenException(
        'You are not the assigned reviewer for this application',
      );
    }
  }

  private assertNotReviewer(
    application: ApplicationEntity,
    approver: UserEntity,
  ): void {
    if (application.reviewedBy && application.reviewedBy.id === approver.id) {
      throw new ForbiddenException(
        'The reviewer of an application cannot also be its approver',
      );
    }
  }
}
