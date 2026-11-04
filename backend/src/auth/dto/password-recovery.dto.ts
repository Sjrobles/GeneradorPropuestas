import { Transform } from 'class-transformer'
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

export class ForgotPasswordDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(160)
  email!: string
}

export class ResetPasswordDto {
  @IsString()
  @Matches(/^[a-f0-9]{64}$/, {
    message: 'El enlace de recuperación no es válido. Solicita uno nuevo.',
  })
  token!: string

  @IsString()
  @MinLength(10)
  @MaxLength(72)
  password!: string
}
