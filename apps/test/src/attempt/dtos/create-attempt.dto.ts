import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AttemptStatus } from '../../../generated/client/client';

export class CreateAttemptDto {
  @ApiProperty({
    description: 'Quiz test id this attempt belongs to',
    format: 'uuid',
  })
  @IsUUID()
  testId: string;

  @ApiProperty({
    description: 'User id who owns this attempt',
    format: 'uuid',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Initial attempt status; defaults to in progress',
    enum: AttemptStatus,
  })
  @IsOptional()
  @IsEnum(AttemptStatus)
  status?: (typeof AttemptStatus)[keyof typeof AttemptStatus];
}
