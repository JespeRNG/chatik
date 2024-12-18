import {
  ConflictException,
  NotFoundException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ConnectedSocket,
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GroupService } from '../group.service';
import { UserService } from 'src/user/user.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { MessageService } from '../message/message.service';
import { CookieAuthGuard } from 'src/auth/guards/cookie-auth.guard';
import { SocketValidationPipe } from './pipes/socket-validation.pipe';
import { GroupWebsocketFilter } from '../../filters/group-websocket.filter';
import { GroupParticipantService } from '../participant/group-participant.service';

@UseGuards(CookieAuthGuard)
@UseFilters(GroupWebsocketFilter)
@WebSocketGateway(3001, {
  namespace: '/menu',
  handlePreflightRequest: (res) => {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization',
    });
    res.end();
  },
})
export class GroupsMenuGateway implements OnGatewayDisconnect {
  @WebSocketServer() io: Server;

  constructor(
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly redisService: RedisService,
    private readonly messageService: MessageService,
    private readonly participantService: GroupParticipantService,
  ) {}

  handleDisconnect(socket: Socket) {
    try {
      const userId = socket.user['sub'];

      this.redisService.removeUserSocketId(userId);
    } catch (err) {}
  }

  @SubscribeMessage('getRelatedGroups')
  public async getRelatedGroups(@ConnectedSocket() socket: Socket) {
    const userId = socket.user['sub'];

    await this.redisService.setUserSocketId(userId, socket.id);

    const relatedGroups = await this.groupService.findRelated(userId);

    if (!relatedGroups) {
      socket.emit('sendGroupsToClient', null);
      return;
    }

    const groupsInfo = await Promise.all(
      relatedGroups.map(async (group) => {
        const lastMessage =
          (await this.messageService.getLastMessage(group.id)) || null;
        let creatorUsername = null;
        if (lastMessage) {
          creatorUsername =
            (await this.userService.findUserById(lastMessage.senderId))
              .username || null;
        }

        return { ...group, lastMessage, creatorUsername };
      }),
    );

    socket.emit('sendGroupsToClient', groupsInfo);
  }

  @SubscribeMessage('receiveNewGroup')
  public async createNewGroup(
    @ConnectedSocket() socket: Socket,
    @MessageBody(SocketValidationPipe)
    createGroupDto: CreateGroupDto,
  ) {
    if (createGroupDto.usersToAdd.length > 0) {
      const userIds = await Promise.all(
        createGroupDto.usersToAdd.map(async (username) => {
          const userId = (await this.userService.findByUsername(username))?.id;

          if (!userId) {
            throw new NotFoundException(
              `There is no user with username "${username}"`,
            );
          }

          if (userId === socket.user['sub']) {
            throw new ConflictException(
              `Group creator cannot be a participant.`,
            );
          }

          return userId;
        }),
      );

      const createdGroup = await this.groupService.create(
        createGroupDto,
        socket.user['sub'],
      );

      await this.participantService.createParticipants(
        createdGroup.id,
        userIds,
      );

      userIds.forEach((userId) => {
        const sockets = this.io.sockets;
        sockets.forEach((userSocket) => {
          if (userSocket.user['sub'] === userId) {
            userSocket.emit('sendNewGroup', createdGroup);
          }
        });
      });

      socket.emit('sendNewGroup', createdGroup);
      return;
    }

    const createdGroup = await this.groupService.create(
      createGroupDto,
      socket.user['sub'],
    );

    socket.emit('sendNewGroup', createdGroup);
  }
}
