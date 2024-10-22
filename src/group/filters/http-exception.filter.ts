import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const message = exception.message;

    if (exception instanceof UnauthorizedException || status === 401) {
      const refreshToken = request.cookies['refreshToken'];

      if (refreshToken) {
        return response.redirect('/refresh');
      }

      return response.redirect('/signin');
    }

    return response.status(status).send(`
      <script>
        alert('Error: ${message}');
        window.location.href = '${request.originalUrl}';
      </script>
    `);
  }
}
