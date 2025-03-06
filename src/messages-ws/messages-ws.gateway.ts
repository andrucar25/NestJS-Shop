import { Server, Socket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient( client, payload.id );

    } catch (error) {
      client.disconnect();
      return;
    }
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients()) //cada vez que un cliente se conecta el servidor emite ese evento 

  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
  }

  @SubscribeMessage('message-from-client')  //escuchar evento del cliente
  onMessageFromClient(client: Socket, payload: NewMessageDto) {

    //emite unicamente al cliente inicial (el que emite el mensaje originalmente)
    // client.emit('message-from-server', {
    //   message: payload.message || 'no-message'
    // })

    //emitir a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   message: payload.message || 'no-message'
    // })

    //emitir a todos incluyendo al cliente inicial
    this.wss.emit('message-from-server', {
        fullName: this.messagesWsService.getUserFullName(client.id),
        message: payload.message || 'no-message'
      })
 
  }
  
}
