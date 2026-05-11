import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  UPLOADS_ROOT,
} from './document.constants';

export function getStorageDir(
  applicationId: string,
  revisionNumber: number,
): string {
  return path.join(
    UPLOADS_ROOT,
    'applications',
    applicationId,
    `revision-${revisionNumber}`,
  );
}

export function buildMulterOptions(): MulterOptions {
  return {
    storage: diskStorage({
      destination: (
        req: Request,
        _file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void,
      ) => {
        const applicationId = String(req.params['applicationId']);
        const revisionNumber =
          (req as Request & { revisionNumber?: number }).revisionNumber ?? 1;
        const dir = getStorageDir(applicationId, revisionNumber);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void,
      ) => {
        const ext = path.extname(file.originalname);
        cb(null, `${randomUUID()}${ext}`);
      },
    }),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(
          new BadRequestException(
            `File type "${file.mimetype}" is not allowed. Accepted types: PDF, DOCX, PNG, JPEG`,
          ),
          false,
        );
      }
      cb(null, true);
    },
  };
}
