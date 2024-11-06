import { UseGuards } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { AuthWebSocketGuard } from '../auth/websocket.guard'
import { PrismaService } from '../prisma/prisma.service'

const corsOptions = {
  credentials: true,
  origin: ['http://localhost:3000', 'https://jadikerja-fe.vercel.app'],
  methods: '*',
}

@UseGuards(AuthWebSocketGuard)
@WebSocketGateway({
  namespace: '/api/chat',
  cors: corsOptions,
  transports: ['websocket'],
  pingInterval: 5000,
  pingTimeout: 10000,
})
export class KerjainGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly prisma: PrismaService) {}

  @WebSocketServer() server: Server

  handleConnection(client: Socket) {
    const { roomId } = client.handshake.query

    client.join(roomId)
    console.log(`Client ${client.id} joined room`)

    client.data.roomId = roomId
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('ping') // Listen for ping messages from the client
  handlePing(client: Socket, payload: any) {
    console.log('Received ping from client:', payload)
    client.emit('pong', { message: 'pong' }) // Respond with pong to keep connection alive
  }

  @SubscribeMessage('chat')
  async handleMessage(client: Socket, payload: any) {
    try {
      const roomId = client.data.roomId

      const { id, message } = payload

      const kerjainApply = await this.prisma.kerjainApply.findUnique({
        where: { id: roomId },
        include: { client: true, kerjain: { include: { author: true } } },
      })

      if (!kerjainApply) {
        throw new WsException('KerjaIN Apply tidak ditemukan')
      }

      const role =
        client.data.user.email === kerjainApply.client.userEmail
          ? 'CLIENT'
          : 'AUTHOR'

      const chat = await this.prisma.kerjainApplyChat.create({
        data: { id, message, role, kerjainApplyId: kerjainApply.id },
      })

      this.server.to(roomId).emit('chat', chat)
    } catch (e) {
      client.emit('error', e.message)
    }
  }
}
