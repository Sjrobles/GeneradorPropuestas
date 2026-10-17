import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class SendChatMessageDto {
  @ApiProperty({
    example: 'La iniciativa busca reducir la brecha de acceso digital rural.',
    maxLength: 4000,
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string
}
