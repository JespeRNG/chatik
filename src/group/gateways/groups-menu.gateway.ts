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
  constructor(private readonly groupService: GroupService) {}
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
    socket.emit('sendGroupsToClient', groups);
  }
}
