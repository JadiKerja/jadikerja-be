import { UseGuards } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuthWebSocketGuard } from '../auth/websocket.guard'

@UseGuards(AuthWebSocketGuard)
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
  },
})
export class KerjainGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server

  handleConnection(client: Socket) {
    // const { payload } = client.handshake.query

    // console.log(payload, 'PAYLOADD')
    console.log(client.handshake)

    // client.join()
    console.log(`Client ${client.id} joined room`)

    // client.data.payload = payload
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('chat')
  handleMessage(client: Socket, payloads: any) {
    console.log(client.data, payloads)
  }
}
