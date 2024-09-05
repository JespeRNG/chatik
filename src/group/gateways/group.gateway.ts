import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { GroupService } from '../group.service';
import { UserService } from 'src/user/user.service';
import { Socket, Namespace, Server } from 'socket.io';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { MessageService } from '../message/message.service';
import { SocketAuthGuard } from 'src/auth/guards/socketAuth.guard';
import { GROUP_PICTURE_DEFAULT_PATH } from 'src/constants/constants';
import { GroupParticipantService } from '../participant/group-participant.service';

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
export class GroupGateway implements OnGatewayInit {
  @WebSocketServer() io: Server;
  @WebSocketServer() menu: Namespace;

  constructor(
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly messageService: MessageService,
    private readonly participantService: GroupParticipantService,
  ) {}

  afterInit() {
    this.menu = this.io.server.of('/menu');
  }

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
    await this.messageService
      .addMessage({
        content,
        groupId,
        senderId: socket.user.sub,
        createdAt: new Date(),
      })
      .then(async (msg) => {
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
      });
  }

  @SubscribeMessage('sendAllMessages')
  public async handleSendAllMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() groupId,
  ) {
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
  public async handleGetGroupInfo(@MessageBody() groupId: string) {
    const group = await this.groupService.findGroupInfo(groupId);

    this.io.in(groupId).emit('sendGroupInfo', group);
  }

  @SubscribeMessage('updateGroupInfo')
  public async handleUpdateGroupInfo(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    payload: {
      groupId;
      groupName;
      participants;
      picture;
    },
  ) {
    try {
      if (payload.groupName || payload.picture) {
        const updateGroupDto = new UpdateGroupDto();
        updateGroupDto.name = payload.groupName;
        updateGroupDto.pictureName = payload.picture;

        await this.groupService.updateGroup(payload.groupId, updateGroupDto);

        const updatedInfo: any = {
          groupId: payload.groupId,
        };

        if (payload.groupName) {
          updatedInfo.groupName = payload.groupName;
        }

        if (payload.picture) {
          updatedInfo.picture = `${GROUP_PICTURE_DEFAULT_PATH}/${payload.picture}`;
        }

        this.io.in(payload.groupId).emit('getGroupUpdates', updatedInfo);
        this.menu.emit('getGroupUpdates', updatedInfo);
      }

      if (payload.participants) {
        const participantIds = await Promise.all(
          payload.participants.map(async (participant) => {
            return (await this.userService.findByUsername(participant)).id;
          }),
        );

        const participants = payload.participants;

        await this.participantService.createParticipants(
          payload.groupId,
          participantIds,
        );

        this.io.in(payload.groupId).emit('getGroupUpdates', { participants });
      }
    } catch (err) {
      socket.emit('error', { message: err.message || 'Error.' });
    }
  }
}
