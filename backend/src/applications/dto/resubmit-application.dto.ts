import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResubmitApplicationDto {
  @ApiProperty({
    description:
      'Notes from the applicant explaining what was updated in the resubmission',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  resubmissionNote: string;
}
