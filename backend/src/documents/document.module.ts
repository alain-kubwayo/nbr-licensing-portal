import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEntity } from '../applications/application.entity';
import { AuditModule } from '../audit/audit.module';
import { DocumentController } from './document.controller';
import { DocumentEntity } from './document.entity';
import { DocumentService } from './document.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity, ApplicationEntity]),
    AuditModule,
  ],
  providers: [DocumentService],
  controllers: [DocumentController],
  exports: [DocumentService],
})
export class DocumentModule {}
