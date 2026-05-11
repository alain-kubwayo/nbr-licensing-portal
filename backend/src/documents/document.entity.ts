import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApplicationEntity } from '../applications/application.entity';
import { UserEntity } from '../users/user.entity';

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  uploadedAt: Date;

  @ManyToOne(() => ApplicationEntity, { nullable: false })
  @JoinColumn()
  application: ApplicationEntity;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  uploadedBy: UserEntity;

  @Column({ type: 'int' })
  revisionNumber: number;

  @Column({ length: 512 })
  originalName: string;

  @Column({ length: 512 })
  storedName: string;

  @Column({ length: 1024 })
  storagePath: string;

  @Column({ length: 128 })
  mimeType: string;

  @Column({ type: 'int' })
  size: number;
}
