import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService, TokenExpiredError } from '@nestjs/jwt'
import { TokenStatus } from '@prisma/client'
import { Request } from 'express'
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AuthGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest()
    const rawToken = this.extractTokenFromHeader(request)
    if (!rawToken) {
      throw new UnauthorizedException('token not provided')
    }

    try {
      const { token, expiredAt, status, blackListedAt } =
        await this.prisma.token.findUniqueOrThrow({
          where: {
            token: rawToken,
          },
        })

      if (!token) {
        throw new UnauthorizedException(`Invalid Token`)
      }

      if (new Date(expiredAt) < new Date()) {
        throw new UnauthorizedException('Token expired')
      }

      if (status === TokenStatus.BLACKLISTED) {
        throw new UnauthorizedException(
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
      request['user'] = user
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('token has expired')
      } else {
        throw new UnauthorizedException(err.message)
      }
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
