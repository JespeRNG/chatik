import { ServerOptions } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

@Injectable()
export class SocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'DELETE', 'PATCH'],
        credentials: true,
      },
    });
    return server;
  }
}
