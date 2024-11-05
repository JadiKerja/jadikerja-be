import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ApplyKerjainDTO } from './dto/applyKerjain.dto'
import { User } from '@prisma/client'
import { CreateKerjainDTO } from './dto/createKerjain.dto'

@Injectable()
export class KerjainService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllKerjain(search: string) {
    return this.prisma.kerjain.findMany({
      where: {
        isOpen: true,
        title: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      include: { author: true },
    })
  }

  async applyKerjain(user: User, body: ApplyKerjainDTO) {
    const { kerjainId, bidPrice } = body

    const client = await this.prisma.client.findUnique({
      where: { userEmail: user.email },
    })

    const kerjain = await this.prisma.kerjain.findUnique({
      where: { id: kerjainId },
      include: { author: true },
    })

    if (!kerjain) {
      throw new BadRequestException('KerjaIN tidak ditemukan.')
    }

    if (kerjain.author.id === client.id) {
      throw new BadRequestException(
        'Anda tidak bisa melamar di KerjaIN anda sendiri.',
      )
    }

    const existingApply = await this.prisma.kerjainApply.findFirst({
      where: { kerjainId, clientId: client.id },
    })

    if (existingApply) {
      throw new BadRequestException('Kamu sudah apply KerjaIN ini!')
    }

    const finalPrice = bidPrice ? bidPrice : kerjain.salary
    const message = bidPrice
      ? `Hi ${kerjain.author.fullName}, saya bersedia untuk mengerjakan pekerjaan ${kerjain.title} namun dengan tawaran Rp${finalPrice.toLocaleString('de-DE')}. Apakah Anda mau?`
      : `Hi ${kerjain.author.fullName}, saya bersedia untuk mengerjakan pekerjaan ${kerjain.title} dengan bayaran Rp${finalPrice.toLocaleString('de-DE')}`

    return await this.prisma.kerjainApply.create({
      data: {
        kerjainId,
        clientId: client.id,
        bidPrice: finalPrice,
        kerjainApplyChat: {
          create: {
            role: 'CLIENT',
            message,
          },
        },
      },
    })
  }

  async createKerjain(user: User, body: CreateKerjainDTO) {
    const author = await this.prisma.client.findUnique({
      where: { userEmail: user.email },
    })

    return await this.prisma.kerjain.create({
      data: { authorId: author.id, isOpen: true, ...body },
    })
  }

  async getMyKerjain(user: User) {
    const userClient = await this.prisma.client.findUnique({
      where: { userEmail: user.email },
    })

    return await this.prisma.kerjain.findMany({
      where: { authorId: userClient.id },
    })
  }

  async getMyAppliedKerjain(user: User) {
    const userClient = await this.prisma.client.findUnique({
      where: { userEmail: user.email },
    })

    return await this.prisma.kerjainApply.findMany({
      where: { clientId: userClient.id },
    })
  }

  async getKerjainApplyMessage(id: string, user: User) {
    const userClient = await this.prisma.client.findUnique({
      where: { userEmail: user.email },
    })

    const kerjainApply = await this.prisma.kerjainApply.findUnique({
      where: { id },
      select: { id: true, client: true, kerjain: { select: { author: true } } },
    })

    const message = await this.prisma.kerjainApplyChat.findMany({
      where: { kerjainApplyId: kerjainApply.id },
    })

    const peerName =
      userClient.id === kerjainApply.client.id
        ? kerjainApply.kerjain.author.fullName
        : kerjainApply.client.fullName
    const peerProfileUrl =
      userClient.id === kerjainApply.client.id
        ? kerjainApply.kerjain.author.profileUrl
        : kerjainApply.client.profileUrl

    return {
      peerName,
      peerProfileUrl,
      message,
    }
  }
}
