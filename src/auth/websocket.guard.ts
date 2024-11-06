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

    const client = context.switchToWs().getClient()

    try {
      const rawToken = this.extractTokenFromHeader(client)
      if (!rawToken) {
        throw new WsException('token not provided')
      }

      const { token, expiredAt, status, blackListedAt } =
        await this.prisma.token.findUniqueOrThrow({
          where: {
            token: rawToken,
          },
        })

      if (!token) {
        throw new WsException(`Invalid Token`)
      }

      if (new Date(expiredAt) < new Date()) {
        throw new WsException('Token expired')
      }

      if (status === TokenStatus.BLACKLISTED) {
        throw new WsException(
          `Token has been blacklisted since ${blackListedAt}`,
        )
      }

      const { sub: email } = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })

      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { email: true, role: true },
      })
      client.data.user = user
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        client.emit('error', new WsException('token has expired'))
      } else {
        client.emit('error', new WsException(err.message))
      }
    }
    return true
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const [type, token] =
      client.handshake?.headers?.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
