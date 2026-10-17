import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class UpdateProjectContextDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  problem?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  targetPopulation?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  location?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  proposedSolution?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  expectedResults?: string

  @ApiPropertyOptional({
    example: 3,
    description:
      'Cantidad exacta de objetivos específicos que tendrá el proyecto',
    minimum: 2,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(5)
  objectiveCount?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  initialScope?: string

  @ApiPropertyOptional({
    example: '12 meses',
    description: 'Duración total disponible para ejecutar el proyecto',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  projectDuration?: string
}
