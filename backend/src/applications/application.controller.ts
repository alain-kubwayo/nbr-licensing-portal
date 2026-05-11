import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExtractUserFromRequest } from '../common/decorators/extract-user.decorator';
import { RequiredRoles } from '../common/decorators/required-roles.decorator';
import { GenericResponse } from '../common/utils/http.utils';
import { UserRole } from '../users/enums/user-role.enum';
import { UserEntity } from '../users/user.entity';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { FinalizeApplicationDto } from './dto/finalize-application.dto';
import { RequestInfoDto } from './dto/request-info.dto';
import { ResubmitApplicationDto } from './dto/resubmit-application.dto';

@ApiBearerAuth()
@ApiTags('Applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @RequiredRoles(
    UserRole.APPLICANT,
    UserRole.REVIEWER,
    UserRole.APPROVER,
    UserRole.ADMIN,
  )
  @ApiOperation({ summary: 'List applications (scoped by role)' })
  async findAll(@ExtractUserFromRequest() user: UserEntity) {
    const payload = await this.applicationService.findAll(user);
    return new GenericResponse('Applications retrieved successfully', payload);
  }

  @Get(':id')
  @RequiredRoles(
    UserRole.APPLICANT,
    UserRole.REVIEWER,
    UserRole.APPROVER,
    UserRole.ADMIN,
  )
  @ApiOperation({ summary: 'Get a single application by id' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.applicationService.findOne(id, user);
    return new GenericResponse('Application retrieved successfully', payload);
  }

  @Get(':id/audit-trail')
  @RequiredRoles(UserRole.REVIEWER, UserRole.APPROVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get the full audit trail for an application' })
  async getAuditTrail(@Param('id', ParseUUIDPipe) id: string) {
    const payload = await this.auditService.findByApplication(id);
    return new GenericResponse('Audit trail retrieved successfully', payload);
  }

  @Post()
  @RequiredRoles(UserRole.APPLICANT)
  @ApiOperation({ summary: 'Create a new application draft' })
  async createDraft(
    @Body() createApplicationDto: CreateApplicationDto,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.applicationService.createDraft(
      createApplicationDto,
      user,
    );
    return new GenericResponse('Draft created successfully', payload);
  }

  @Patch(':id/submit')
  @RequiredRoles(UserRole.APPLICANT)
  @ApiOperation({ summary: 'Submit a draft application' })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.applicationService.submit(id, user);
    return new GenericResponse('Application submitted successfully', payload);
  }

  @Patch(':id/resubmit')
  @RequiredRoles(UserRole.APPLICANT)
  @ApiOperation({ summary: 'Resubmit an application after info was requested' })
  async resubmit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResubmitApplicationDto,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.applicationService.resubmit(id, dto, user);
    return new GenericResponse('Application resubmitted successfully', payload);
  }

  @Patch(':id/start-review')
  @RequiredRoles(UserRole.REVIEWER)
  @ApiOperation({ summary: 'Assign yourself as reviewer and start reviewing' })
  async startReview(
    @Param('id', ParseUUIDPipe) id: string,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.applicationService.startReview(id, user);
    return new GenericResponse('Review started successfully', payload);
  }

  @Patch(':id/request-info')
  @RequiredRoles(UserRole.REVIEWER)
  @ApiOperation({
    summary: 'Request additional information from the applicant',
  })
  async requestInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestInfoDto,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.applicationService.requestInfo(id, dto, user);
    return new GenericResponse(
      'Additional information requested successfully',
      payload,
    );
  }

  @Patch(':id/complete-review')
  @RequiredRoles(UserRole.REVIEWER)
  @ApiOperation({ summary: 'Mark review as complete and forward to approver' })
  async completeReview(
    @Param('id', ParseUUIDPipe) id: string,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.applicationService.completeReview(id, user);
    return new GenericResponse('Review completed successfully', payload);
  }

  @Patch(':id/approve')
  @RequiredRoles(UserRole.APPROVER)
  @ApiOperation({ summary: 'Approve a reviewed application' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FinalizeApplicationDto,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.applicationService.approve(id, dto, user);
    return new GenericResponse('Application approved successfully', payload);
  }

  @Patch(':id/reject')
  @RequiredRoles(UserRole.APPROVER)
  @ApiOperation({ summary: 'Reject a reviewed application' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FinalizeApplicationDto,
    @ExtractUserFromRequest() user: UserEntity,
  ) {
    const payload = await this.applicationService.reject(id, dto, user);
    return new GenericResponse('Application rejected successfully', payload);
  }
}
