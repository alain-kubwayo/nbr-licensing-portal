import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RequestInfoDto {
  @ApiProperty({
    description:
      'Explanation of what additional information is required from the applicant',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  infoRequestNote: string;
}
