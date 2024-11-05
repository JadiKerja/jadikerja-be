import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaClient, TokenStatus, User } from '@prisma/client'
import { compare, hash } from 'bcrypt'
import { RegisterDTO } from './dto/register.dto'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import * as admin from 'firebase-admin'
import { UpdateUserDTO } from './dto/updateUser.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  private TIME_UNIT = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  async register(body: RegisterDTO) {
    const { email, password, confirmationPassword, ...restDTO } = body

    const existingUser = await this.prisma.user.findUnique({ where: { email } })

    if (password !== confirmationPassword) {
      throw new BadRequestException('Invalid credential')
    }

    if (existingUser?.firebaseId) {
      throw new BadRequestException('Akun ini login menggunakan metode lain')
    }

    if (existingUser) {
      throw new BadRequestException('Email tidak tersedia!')
    }

    const hashedPassord = await hash(
      password,
      parseInt(process.env.SALT_LENGTH as string),
    )

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassord,
          client: { create: { ...restDTO } },
        },
        select: {
          email: true,
          role: true,
          client: true,
          partner: true,
        },
      })

      const accessToken = await this._generateToken(user.email, prisma)

      const additionalUserInformation =
        user.role === 'CLIENT'
          ? { client: user.client }
          : user.role === 'PARTNER'
            ? { partner: user.partner }
            : undefined

      return {
        accessToken,
        user: {
          email: user.email,
          role: user.role,
          ...additionalUserInformation,
        },
      }
    })
  }

  async basicLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { client: true, partner: true },
    })

    if (!user) {
      throw new BadRequestException('Invalid credential')
    }

    if (!user?.password || user?.firebaseId) {
      throw new BadRequestException('Akun ini login menggunakan metode lain')
    }

    const match = await compare(password, user.password)

    if (!match) {
      throw new BadRequestException('Invalid credential')
    }

    return await this.prisma.$transaction(async (prisma: PrismaClient) => {
      await this._blackListAllToken(user.email, prisma)
      const accessToken = await this._generateToken(email, prisma)

      const additionalUserInformation =
        user.role === 'CLIENT'
          ? { client: user.client }
          : user.role === 'PARTNER'
            ? { partner: user.partner }
            : undefined

      return {
        accessToken,
        user: {
          email: user.email,
          role: user.role,
          ...additionalUserInformation,
        },
      }
    })
  }

  async OAuthLogin(firebaseToken: string) {
    const { email, uid: firebaseId } = await admin
      .auth()
      .verifyIdToken(firebaseToken)

    if (!email) {
      throw new InternalServerErrorException('Verifikasi firebase token gagal')
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { email: true, role: true, client: true, partner: true },
    })

    if (existingUser) {
      return await this.prisma.$transaction(async (prisma: PrismaClient) => {
        await this._blackListAllToken(existingUser.email, prisma)
        const accessToken = await this._generateToken(email, prisma)

        const additionalUserInformation =
          existingUser.role === 'CLIENT'
            ? { client: existingUser.client }
            : existingUser.role === 'PARTNER'
              ? { partner: existingUser.partner }
              : undefined

        return {
          accessToken,
          user: {
            email: existingUser.email,
            role: existingUser.role,
            ...additionalUserInformation,
          },
        }
      })
    } else {
      return await this.prisma.$transaction(async (prisma: PrismaClient) => {
        await prisma.user.create({
          data: { email, firebaseId },
        })

        const accessToken = await this._generateToken(email, prisma)

        return { accessToken, goToOnboarding: true }
      })
    }
  }

  async getUser(user: User) {
    return await this.prisma.user.findUnique({
      where: { email: user.email },
      select: {
        email: true,
        role: true,
        client: user.role === 'CLIENT',
        partner: user.role === 'PARTNER',
      },
    })
  }

  async updateUser(user: User, body: UpdateUserDTO) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    })

    if (!existingUser) {
      throw new BadRequestException('User tidak ditemukan')
    }

    const updatedUser = await this.prisma.user.update({
      where: { email: existingUser.email },
      data: { client: { update: { ...body } } },
      select: { email: true, role: true, client: true },
    })

    return updatedUser
  }

  private async _generateToken(email: string, prisma?: PrismaClient) {
    const token = await this.jwtService.signAsync(
      { sub: email },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '30m',
      },
    )

    const tokenIssuedTime = Date.now()

    await (prisma ?? this.prisma).token.create({
      data: {
        token: token,
        expiredAt: new Date(
          tokenIssuedTime +
            this._getExpiry(process.env.JWT_EXPIRES_IN ?? '30m'),
        ),
        userEmail: email,
      },
    })

    return token
  }

  private _getExpiry(data: string): number {
    const duration = parseInt(data.substring(0, data.length - 1))
    const unit = data[data.length - 1]
    return duration * this.TIME_UNIT[unit as 's' | 'm' | 'h' | 'd']
  }

  private async _blackListAllToken(email: string, prisma?: PrismaClient) {
    await (prisma ?? this.prisma).token.updateMany({
      where: { userEmail: email },
      data: { status: 'BLACKLISTED', blackListedAt: new Date() },
    })
  }

  private async _getUserFromToken(rawToken: string) {
    const token = await this._validateToken(rawToken)

    const { sub: email } = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    })

    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new NotFoundException('Akun tidak ditemukan!')
    }

    return user
  }

  private async _validateToken(rawToken: string, prisma?: PrismaClient) {
    const { token, expiredAt, status, blackListedAt } = await (
      prisma ?? this.prisma
    ).token.findUniqueOrThrow({
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

    return token
  }
}
