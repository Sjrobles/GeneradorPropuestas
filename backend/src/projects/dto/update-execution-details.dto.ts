import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateExecutionDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10000, {
    message: 'La respuesta admite máximo 10.000 caracteres.',
  })
  activityDevelopment?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10000, {
    message: 'La respuesta admite máximo 10.000 caracteres.',
  })
  participants?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10000, {
    message: 'La respuesta admite máximo 10.000 caracteres.',
  })
  locationsAndParticipants?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10000, {
    message: 'La respuesta admite máximo 10.000 caracteres.',
  })
  requiredResources?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10000, {
    message: 'La respuesta admite máximo 10.000 caracteres.',
  })
  timelineAndDependencies?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10000, {
    message: 'La respuesta admite máximo 10.000 caracteres.',
  })
  expectedDeliverables?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10000, {
    message: 'La respuesta admite máximo 10.000 caracteres.',
  })
  verificationMethods?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10000, {
    message: 'La respuesta admite máximo 10.000 caracteres.',
  })
  knownEconomicInformation?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(10000, {
    message: 'La respuesta admite máximo 10.000 caracteres.',
  })
  specialConditions?: string
}
