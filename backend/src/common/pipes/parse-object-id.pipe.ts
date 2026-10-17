import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common'
import { isValidObjectId } from 'mongoose'

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(
        'El identificador suministrado no es válido',
      )
    }

    return value
  }
}
