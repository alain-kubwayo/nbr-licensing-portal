import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ApplicationStatus } from '../applications/application-status.enum';
import { UserEntity } from '../users/user.entity';
import { AuditAction } from './audit-action.enum';
import { AuditLogEntity } from './audit-log.entity';

export interface CreateAuditLogParams {
  action: AuditAction;
  applicationId: string;
  actor: UserEntity;
  previousStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  log(
    manager: EntityManager,
    params: CreateAuditLogParams,
  ): Promise<AuditLogEntity> {
    const entry = manager.create(AuditLogEntity, {
      action: params.action,
      applicationId: params.applicationId,
      actor: params.actor,
      previousStatus: params.previousStatus ?? null,
      newStatus: params.newStatus,
      metadata: params.metadata ?? null,
    });
    return manager.save(AuditLogEntity, entry);
  }

  findByApplication(applicationId: string): Promise<AuditLogEntity[]> {
    return this.dataSource.manager.find(AuditLogEntity, {
      where: { applicationId },
      relations: ['actor'],
      order: { createdAt: 'ASC' },
    });
  }
}
