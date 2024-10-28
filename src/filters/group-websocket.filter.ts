import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch(BadRequestException, NotFoundException, ConflictException)
export class GroupWebsocketFilter implements ExceptionFilter {
  catch(
    exception: BadRequestException | NotFoundException | ConflictException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToWs();
    const client: Socket = ctx.getClient();
    const response = exception.getResponse();

    let exceptionMessage;

    if (exception instanceof BadRequestException) {
      exceptionMessage = 'Validation error';
    }

    client.emit('error', {
      message: exception.message ? exception.message : exceptionMessage,
      details: response,
    });
  }
}
