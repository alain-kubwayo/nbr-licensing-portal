import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource, Repository } from 'typeorm';
import { ApplicationEntity } from '../applications/application.entity';
import { AuditAction } from '../audit/audit-action.enum';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '../users/enums/user-role.enum';
import { UserEntity } from '../users/user.entity';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  UPLOAD_ALLOWED_STATUSES,
} from './document.constants';
import { DocumentEntity } from './document.entity';
import { getStorageDir } from './document.multer';
import { UploadedFile } from './uploaded-file.interface';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  async upload(
    applicationId: string,
    file: UploadedFile,
    uploader: UserEntity,
  ): Promise<DocumentEntity> {
    this.validateFile(file);

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['applicant'],
    });

    if (!application) {
      this.cleanupFile(file.path);
      throw new NotFoundException(`Application "${applicationId}" not found`);
    }

    if (application.applicant.id !== uploader.id) {
      this.cleanupFile(file.path);
      throw new ForbiddenException('You are not the owner of this application');
    }

    if (!UPLOAD_ALLOWED_STATUSES.includes(application.status)) {
      this.cleanupFile(file.path);
      throw new BadRequestException(
        `Documents cannot be uploaded when application is in "${application.status}" status`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const document = manager.create(DocumentEntity, {
        application,
        uploadedBy: uploader,
        revisionNumber: application.revisionNumber,
        originalName: file.originalname,
        storedName: path.basename(file.path),
        storagePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
      });

      const saved = await manager.save(DocumentEntity, document);

      await this.auditService.log(manager, {
        action: AuditAction.DOCUMENT_UPLOADED,
        applicationId: application.id,
        actor: uploader,
        previousStatus: application.status,
        newStatus: application.status,
        metadata: {
          documentId: saved.id,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          revisionNumber: application.revisionNumber,
        },
      });

      return saved;
    });
  }

  async findByApplication(
    applicationId: string,
    requestingUser: UserEntity,
  ): Promise<DocumentEntity[]> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['applicant'],
    });

    if (!application) {
      throw new NotFoundException(`Application "${applicationId}" not found`);
    }

    if (
      requestingUser.role === UserRole.APPLICANT &&
      application.applicant.id !== requestingUser.id
    ) {
      throw new ForbiddenException(
        'You do not have access to this application',
      );
    }

    return this.documentRepository.find({
      where: { application: { id: applicationId } },
      relations: ['uploadedBy'],
      order: { uploadedAt: 'ASC' },
    });
  }

  async getDocumentForDownload(
    documentId: string,
    requestingUser: UserEntity,
  ): Promise<{ document: DocumentEntity; filePath: string }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['application', 'application.applicant', 'uploadedBy'],
    });

    if (!document) {
      throw new NotFoundException(`Document "${documentId}" not found`);
    }

    if (
      requestingUser.role === UserRole.APPLICANT &&
      document.application.applicant.id !== requestingUser.id
    ) {
      throw new ForbiddenException('You do not have access to this document');
    }

    if (!fs.existsSync(document.storagePath)) {
      throw new NotFoundException('Document file not found on storage');
    }

    return { document, filePath: document.storagePath };
  }

  getStorageDir(applicationId: string, revisionNumber: number): string {
    return getStorageDir(applicationId, revisionNumber);
  }

  private validateFile(file: UploadedFile): void {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File size exceeds the 5MB limit (received ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type "${file.mimetype}" is not allowed. Accepted types: PDF, DOCX, PNG, JPEG`,
      );
    }
  }

  private cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      Logger.error(`Failed to clean up file at ${filePath}`, e);
    }
  }
}
