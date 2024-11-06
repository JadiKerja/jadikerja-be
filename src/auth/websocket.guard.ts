import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { WsException } from '@nestjs/websockets'
import { TokenStatus } from '@prisma/client'
import { Socket } from 'socket.io'
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AuthWebSocketGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) return true

    const client = context.switchToWs().getClient<Socket>()

    try {
      const rawToken = this.extractTokenFromHeader(client)
      if (!rawToken) {
        client.emit('error', new WsException('Token not provided'))
        client.disconnect()
        return false
      }

      const tokenRecord = await this.prisma.token.findUnique({
        where: { token: rawToken },
      })

      if (!tokenRecord) {
        client.emit('error', new WsException('Invalid Token'))
        client.disconnect()
        return false
      }

      const { expiredAt, status, blackListedAt } = tokenRecord

      if (new Date(expiredAt) < new Date()) {
        client.emit('error', new WsException('Token expired'))
        client.disconnect()
        return false
      }

      if (status === TokenStatus.BLACKLISTED) {
        client.emit(
          'error',
          new WsException(`Token has been blacklisted since ${blackListedAt}`),
        )
        client.disconnect()
        return false
      }

      const { sub: email } = await this.jwtService.verifyAsync(
        tokenRecord.token,
        {
          secret: process.env.JWT_SECRET,
        },
      )

      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { email: true, role: true },
      })

      if (!user) {
        client.emit('error', new WsException('User not found'))
        client.disconnect()
        return false
      }

      client.data.user = user
      return true
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        client.emit('error', new WsException('Token has expired'))
      } else {
        client.emit('error', new WsException(err.message))
      }
      client.disconnect()
      return false
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const [type, token] =
      client.handshake?.headers?.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
