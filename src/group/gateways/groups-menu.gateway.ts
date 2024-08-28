import {
  ConnectedSocket,
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { GroupService } from '../group.service';
import { UserService } from 'src/user/user.service';
import { MessageService } from '../message/message.service';
import { SocketAuthGuard } from 'src/auth/guards/socketAuth.guard';

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
export class GroupsMenuGateway implements OnGatewayConnection {
  constructor(
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly messageService: MessageService,
  ) {}
  @WebSocketServer() server: Namespace;

  handleConnection(client: Socket) {
    const sockets = this.server.sockets;

    console.log(
      `Client was connected. Client id: ${client.id}.\nAmount of clients: ${sockets.size}`,
    );
  }

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
}
