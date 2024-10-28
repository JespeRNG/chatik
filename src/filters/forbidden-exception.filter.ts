import {
  Catch,
  HttpStatus,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { ForbiddenError } from '@casl/ability';
import { AppAbility } from 'src/casl/casl-ability.factory';

@Catch(ForbiddenError<AppAbility>)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenError<AppAbility>, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = HttpStatus.FORBIDDEN;

    response.status(status).json({
      statusCode: status,
      message: 'You do not have permission to perform this action.',
    });
  }
}
