import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateProjectDto {
  @ApiProperty({ example: 'international-calls' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  selectedSkillId!: string

  @ApiProperty({ example: 'Fortalecimiento de capacidades CTeI' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string
}
