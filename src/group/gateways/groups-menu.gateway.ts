import {
  ConnectedSocket,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { GroupService } from '../group.service';

@WebSocketGateway(3001, {
  namespace: '/menu',
  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': false,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization',
    });
  },
})
export class GroupsMenuGateway implements OnGatewayConnection {
  constructor(private readonly groupService: GroupService) {}
  @WebSocketServer() server: Namespace;

  handleConnection(client: Socket) {
    const sockets = this.server.sockets;

    console.log(
      `Client was conencted. Client id: ${client.id}.\nAmount of clients: ${sockets.size}`,
    );
  }

  @SubscribeMessage('getAllGroups')
  public async getAllGroups(@ConnectedSocket() socket: Socket) {
    const groups = await this.groupService.findAll();
    socket.emit('sendGroups', groups);
  }

  /* @SubscribeMessage('hihi')
  public async hihi(@ConnectedSocket() socket: Socket) {
    socket.emit('getMsg', 'hihihihi');
  } */
}
