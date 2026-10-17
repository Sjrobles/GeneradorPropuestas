import { IsString, MinLength } from 'class-validator'

export class UpdateProjectComponentDto {
  @IsString()
  @MinLength(20)
  content!: string
}
