import {
  ConnectedSocket,
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GroupService } from '../group.service';
import { UserService } from 'src/user/user.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { MessageService } from '../message/message.service';
import { ConflictException, UseGuards } from '@nestjs/common';
import { SocketAuthGuard } from 'src/auth/guards/socketAuth.guard';
import { GroupParticipantService } from '../participant/group-participant.service';

@UseGuards(SocketAuthGuard)
@WebSocketGateway(3001, {
  namespace: '/menu',
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
export class GroupsMenuGateway {
  @WebSocketServer() io: Server;

  constructor(
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly messageService: MessageService,
    private readonly participantService: GroupParticipantService,
  ) {}

  @SubscribeMessage('getRelatedGroups')
  public async getRelatedGroups(@ConnectedSocket() socket: Socket) {
    const userId = socket.user.sub;
    const groups = await this.groupService.findRelated(userId);

    const groupsInfo = await Promise.all(
      groups.map(async (group) => {
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
    @MessageBody()
    payload: { groupName: string; usersToAdd: string[]; groupPicName: string },
  ) {
    try {
      const createGroupDto = new CreateGroupDto();
      createGroupDto.name = payload.groupName;
      createGroupDto.pictureName = payload.groupPicName;

      const userIds = await Promise.all(
        payload.usersToAdd.map(async (username) => {
          const userId = (await this.userService.findByUsername(username)).id;

          if (userId === socket.user.sub) {
            throw new ConflictException(
              `Group creator cannot be a participant.`,
            );
          }
          return userId;
        }),
      );

      const createdGroup = await this.groupService.create(
        createGroupDto,
        socket.user.sub,
      );

      if (userIds) {
        await this.participantService.createParticipants(
          createdGroup.id,
          userIds,
        );
      }

      userIds.forEach((userId) => {
        const sockets = this.io.sockets;
        sockets.forEach((userSocket) => {
          if (
            userSocket.user.sub === userId ||
            userSocket.user.sub === createdGroup.creatorId
          ) {
            userSocket.emit('sendNewGroup', createdGroup);
          }
        });
      });
    } catch (err) {
      socket.emit('error', { message: err.message || 'Error.' });
    }
  }
}
