import {
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class SocketValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    let transformedValue;
    try {
      transformedValue = await super.transform(value, metadata);

      const errors = await validate(plainToClass(metadata.metatype, value));
      if (errors.length > 0) {
        const messages = errors.map((error) => {
          return {
            property: error.property,
            constraints: error.constraints,
          };
        });
        throw new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      }
      return transformedValue;
    } catch (err) {
      throw new BadRequestException('Validation failed');
    }
  }
}
