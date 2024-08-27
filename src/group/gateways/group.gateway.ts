import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { SocketAuthGuard } from 'src/auth/guards/socketAuth.guard';
import { MessageService } from '../message/message.service';
import { RedisService } from 'src/redis/redis.service';

@UseGuards(SocketAuthGuard)
@WebSocketGateway(3001, {
  namespace: '/group',
  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization',
    });
    res.end();
  },
})
export class GroupGateway {
  constructor(
    private readonly messageService: MessageService,
    private readonly redisService: RedisService,
  ) {}
  @WebSocketServer() server: Namespace;

  @SubscribeMessage('joinToGroup')
  public handleJoinToGroup(
    @MessageBody() groupId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(groupId);
    socket.emit('user', socket.user.sub);
  }

  @SubscribeMessage('getMessage')
  public async handleGetMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      groupId,
      content,
    }: {
      groupId: string;
      content: string;
    },
  ) {
    /* this.messageService
      .createMessage({
        content,
        groupId,
        senderId: socket.user.sub,
      })
      .then(async (msg) => {
        const senderUsername = await this.messageService.getSenderUsername(
          socket.user.sub,
        );
        this.server.in(msg.groupId).emit('sendMessage', {
          senderUsername,
          content: msg.content,
          senderId: msg.senderId,
          createdAt: msg.createdAt,
        });
      }); */
    await this.redisService
      .addMessageToCache({
        content,
        groupId,
        senderId: socket.user.sub,
        createdAt: new Date(),
      })
      .then(async (msg) => {
        const senderUsername = await this.messageService.getSenderUsername(
          socket.user.sub,
        );
        this.server.in(msg.groupId).emit('sendMessage', {
          senderUsername,
          content: msg.content,
          senderId: msg.senderId,
          createdAt: msg.createdAt,
        });
      });
  }

  @SubscribeMessage('sendAllMessages')
  public async handleSendAllMessages(@MessageBody() groupId) {
    const allMessages = await Promise.all(
      (await this.messageService.getAllMessagesFromGroup(groupId)).map(
        async (x) => {
          const senderUsername = await this.messageService.getSenderUsername(
            x.senderId,
          );
          return {
            content: x.content,
            createdAt: x.createdAt,
            senderUsername: senderUsername,
            userId: x.senderId,
          };
        },
      ),
    );

    this.server.in(groupId).emit('sendAllMessages', {
      allMessages,
    });
  }
}
