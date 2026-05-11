import {
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExtractUserFromRequest } from '../common/decorators/extract-user.decorator';
import { RequiredRoles } from '../common/decorators/required-roles.decorator';
import { GenericResponse } from '../common/utils/http.utils';
import { UserRole } from '../users/enums/user-role.enum';
import { UserEntity } from '../users/user.entity';
import { MAX_FILE_SIZE_BYTES } from './document.constants';
import { buildMulterOptions } from './document.multer';
import { DocumentService } from './document.service';
import type { UploadedFile as UploadedFileType } from './uploaded-file.interface';

@ApiBearerAuth()
@ApiTags('Documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications/:applicationId/documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @RequiredRoles(UserRole.APPLICANT)
  @ApiOperation({
    summary: 'Upload a document to an application (APPLICANT only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF, DOCX, PNG or JPEG — max 5 MB',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', buildMulterOptions()))
  async upload(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
        ],
      }),
    )
    file: UploadedFileType,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.documentService.upload(
      applicationId,
      file,
      user,
    );
    return new GenericResponse('Document uploaded successfully', payload);
  }

  @Get()
  @RequiredRoles(
    UserRole.APPLICANT,
    UserRole.REVIEWER,
    UserRole.APPROVER,
    UserRole.ADMIN,
  )
  @ApiOperation({ summary: 'List all documents for an application' })
  async findAll(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.documentService.findByApplication(
      applicationId,
      user,
    );
    return new GenericResponse('Documents retrieved successfully', payload);
  }

  @Get(':documentId/download')
  @RequiredRoles(
    UserRole.APPLICANT,
    UserRole.REVIEWER,
    UserRole.APPROVER,
    UserRole.ADMIN,
  )
  @ApiOperation({ summary: 'Download a document by id' })
  async download(
    @Param('applicationId', ParseUUIDPipe) _applicationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @ExtractUserFromRequest() user: UserEntity,
    @Res() res: Response,
  ) {
    const { document, filePath } =
      await this.documentService.getDocumentForDownload(documentId, user);

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(document.originalName)}"`,
    );
    res.sendFile(filePath, { root: '/' });
  }
}
