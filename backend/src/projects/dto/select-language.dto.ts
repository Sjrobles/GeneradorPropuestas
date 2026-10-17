import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

export class SelectLanguageDto {
  @ApiProperty({ enum: ['es'], example: 'es' })
  @IsIn(['es'])
  language!: 'es'
}
