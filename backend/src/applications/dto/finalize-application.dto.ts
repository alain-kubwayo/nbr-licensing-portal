import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class FinalizeApplicationDto {
  @ApiProperty({
    description:
      'Final decision note from the approver (reason for approval or rejection)',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  decisionNote: string;
}
