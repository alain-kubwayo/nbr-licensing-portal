import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'Legal name of the institution applying for a banking license',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  institutionName: string;

  @ApiProperty({
    description:
      'Type of banking license being applied for (e.g. Commercial Bank, Microfinance)',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  licenseType: string;

  @ApiPropertyOptional({
    description: 'Additional notes or description provided by the applicant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
