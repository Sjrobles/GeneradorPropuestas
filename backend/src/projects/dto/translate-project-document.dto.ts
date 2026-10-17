import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

export class TranslateProjectDocumentDto {
  @ApiProperty({ enum: ['en'] })
  @IsIn(['en'])
  targetLanguage!: 'en'
}
