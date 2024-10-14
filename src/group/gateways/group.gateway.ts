import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { GroupService } from '../group.service';
import { UserService } from 'src/user/user.service';
import { Socket, Namespace, Server } from 'socket.io';
import { GroupWebsocketFilter } from '../filters/group-websocket.filter';
import {
  ConflictException,
  NotFoundException,
  ParseUUIDPipe,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { MessageService } from '../message/message.service';
import { SocketAuthGuard } from 'src/auth/guards/socketAuth.guard';
import { GROUP_PICTURE_DEFAULT_PATH } from 'src/constants/constants';
import { GroupParticipantService } from '../participant/group-participant.service';
import { SocketValidationPipe } from './pipes/socket-validation.pipe';
import { UpdateGroupMvcDto } from './dto/update-group-mvc.dto';

@UseGuards(SocketAuthGuard)
@UseFilters(GroupWebsocketFilter)
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
export class GroupGateway implements OnGatewayInit {
  @WebSocketServer() io: Server;
  @WebSocketServer() menu: Namespace;

  constructor(
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly redisService: RedisService,
    private readonly messageService: MessageService,
    private readonly participantService: GroupParticipantService,
  ) {}

  afterInit() {
    this.menu = this.io.server.of('/menu');
  }

  @SubscribeMessage('joinToGroup')
  public handleJoinToGroup(
    @MessageBody(ParseUUIDPipe) groupId: string,
    @ConnectedSocket() socket: Socket,
  ): void {
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
  ): Promise<void> {
    const msg = await this.messageService.addMessage({
      content,
      groupId,
      senderId: socket.user.sub,
      createdAt: new Date(),
    });

    const senderUsername = await this.messageService.getSenderUsername(
      socket.user.sub,
    );

    this.io.in(msg.groupId).emit('sendMessage', {
      senderUsername,
      content: msg.content,
      senderId: msg.senderId,
      createdAt: msg.createdAt,
    });

    this.menu.emit('sendNewMessage', {
      groupId,
      senderUsername,
      content: msg.content,
      senderId: msg.senderId,
      createdAt: msg.createdAt,
    });
  }

  @SubscribeMessage('sendAllMessages')
  public async handleSendAllMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() groupId,
  ): Promise<void> {
    const allMessages = await Promise.all(
      (await this.messageService.getAllMessagesForGroup(groupId)).map(
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

    /* this.io.in(groupId).emit('sendAllMessages', {
      allMessages,
    }); */
    socket.emit('sendAllMessages', { allMessages });
  }

  @SubscribeMessage('getGroupInfo')
  public async handleGetGroupInfo(
    @MessageBody() groupId: string,
  ): Promise<void> {
    const group = await this.groupService.findGroupInfo(groupId);

    this.io.in(groupId).emit('sendGroupInfo', group);
  }

  @SubscribeMessage('updateGroupInfo')
  public async handleUpdateGroupInfo(
    @ConnectedSocket() socket: Socket,
    @MessageBody(SocketValidationPipe) updateGroupDto: UpdateGroupMvcDto,
  ): Promise<void> {
    if (updateGroupDto.name || updateGroupDto.pictureName) {
      await this.updateGroupInfo(updateGroupDto);
    }

    if (updateGroupDto.usersToAdd) {
      await this.addParticipantsToGroup(socket, updateGroupDto);
    }
  }

  //#region private methods
  private async updateGroupInfo(
    updateGroupDto: UpdateGroupMvcDto,
  ): Promise<void> {
    await this.groupService.updateGroup(updateGroupDto.groupId, updateGroupDto);

    const updatedInfo = this.createUpdatedInfo(updateGroupDto);

    this.io.in(updateGroupDto.groupId).emit('getGroupUpdates', updatedInfo);
    this.menu.emit('getGroupUpdates', updatedInfo);
  }

  private createUpdatedInfo(updateGroupDto: UpdateGroupMvcDto): {
    groupId: string;
    groupName: string;
    picture;
  } {
    return {
      groupId: updateGroupDto.groupId,
      ...(updateGroupDto.name && { groupName: updateGroupDto.name }),
      ...(updateGroupDto.pictureName && {
        picture: `${GROUP_PICTURE_DEFAULT_PATH}/${updateGroupDto.pictureName}`,
      }),
    };
  }

  private async addParticipantsToGroup(
    socket: Socket,
    updateGroupDto: UpdateGroupMvcDto,
  ): Promise<void> {
    const participantIds = await this.getParticipantIds(
      socket,
      updateGroupDto.usersToAdd,
    );

    await this.participantService.createParticipants(
      updateGroupDto.groupId,
      participantIds,
    );

    this.io
      .in(updateGroupDto.groupId)
      .emit('getGroupUpdates', { participants: updateGroupDto.usersToAdd });

    await this.notifyOnlineParticipants(updateGroupDto.groupId, participantIds);
  }

  private async getParticipantIds(
    socket: Socket,
    usersToAdd: string[],
  ): Promise<string[]> {
    return Promise.all(
      usersToAdd.map(async (participant) => {
        const userId = (await this.userService.findByUsername(participant))?.id;

        if (!userId) {
          throw new NotFoundException(
            `There is no user with username "${participant}"`,
          );
        }

        if (userId === socket.user.sub) {
          throw new ConflictException(`Group creator cannot be a participant.`);
        }

        return userId;
      }),
    );
  }

  private async notifyOnlineParticipants(
    groupId: string,
    participantIds: string[],
  ): Promise<void> {
    const onlineParticipants =
      await this.redisService.getSockets(participantIds);

    if (!onlineParticipants || onlineParticipants.length === 0) {
      return;
    }

    const groupInfo = await this.groupService.findGroup(groupId);
    const lastMessage = await this.messageService.getLastMessage(groupId);

    const lastMessageSender = lastMessage
      ? await this.userService.findUserById(lastMessage.senderId)
      : null;

    const messageContent = lastMessage ? lastMessage.content : null;
    const messageCreatedAt = lastMessage ? lastMessage.createdAt : null;
    const messageSenderUsername = lastMessageSender
      ? lastMessageSender.username
      : null;

    const payload = {
      id: groupInfo.id,
      name: groupInfo.name,
      picture: groupInfo.picture,
      lastMessage: messageContent,
      lastMessageCreatedAt: messageCreatedAt,
      lastMessageSender: messageSenderUsername,
    };

    onlineParticipants.forEach((socketId: string) => {
      this.menu.to(socketId).emit('sendNewGroup', payload);
    });
  }
  //#endregion
}
