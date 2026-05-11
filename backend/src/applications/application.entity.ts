import { Column, Entity, JoinColumn, ManyToOne, VersionColumn } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';
import { UserEntity } from '../users/user.entity';
import { ApplicationStatus } from './application-status.enum';

@Entity('applications')
export class ApplicationEntity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  status: ApplicationStatus;

  @Column({ length: 255 })
  institutionName: string;

  @Column({ length: 100 })
  licenseType: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  infoRequestNote?: string;

  @Column({ type: 'text', nullable: true })
  resubmissionNote?: string;

  @Column({ type: 'text', nullable: true })
  decisionNote?: string;

  @Column({ type: 'int', default: 1 })
  revisionNumber: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  applicant: UserEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn()
  reviewedBy?: UserEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn()
  approvedBy?: UserEntity;

  @VersionColumn()
  version: number;

  @Column({ nullable: true, type: 'timestamptz' })
  submittedAt?: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  finalizedAt?: Date;
}
