import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApplicationStatus } from '../applications/application-status.enum';
import { UserEntity } from '../users/user.entity';
import { AuditAction } from './audit-action.enum';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  actor: UserEntity;

  @Column({ type: 'enum', enum: ApplicationStatus, nullable: true })
  previousStatus: ApplicationStatus | null;

  @Column({ type: 'enum', enum: ApplicationStatus })
  newStatus: ApplicationStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;
}
