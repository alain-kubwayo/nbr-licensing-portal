import { ApplicationStatus } from '../applications/application-status.enum';

export const UPLOAD_ALLOWED_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.DRAFT,
  ApplicationStatus.INFO_REQUESTED,
];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
];

export const UPLOADS_ROOT = 'uploads';
