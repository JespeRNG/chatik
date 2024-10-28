import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const type = context.getType();
    const response: Response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof UnauthorizedException) {
          const accessToken = request.cookies?.accessToken;
          const refreshToken = request.cookies?.refreshToken;

          if (!accessToken && !refreshToken) {
            response.redirect('/auth/signin');
          } else if (refreshToken) {
            response.redirect('/auth/refreshToken');
          } else {
            response.redirect('/auth/signin');
          }
        }

        return throwError(() => error);
      }),
    );
  }
}
