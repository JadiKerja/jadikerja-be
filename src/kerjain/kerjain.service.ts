import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ApplyKerjainDTO } from './dto/applyKerjain.dto'
import { User } from '@prisma/client'
import { CreateKerjainDTO } from './dto/createKerjain.dto'
import { HttpService } from '@nestjs/axios'
import { MarkDoneKerjainDTO } from './dto/markDoneKerjain.dto'

@Injectable()
export class KerjainService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async getAllKerjain(search: string) {
    if (!search) {
      const kerjain = await this.prisma.kerjain.findMany({
        where: {
          isOpen: true,
        },
      })

      return { kerjain }
    } else {
      const RADIUS_IN_METERS = 5000

      try {
        const response = await this.httpService.axiosRef.get(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
          {
            params: {
              input: search,
              inputtype: 'textquery',
              fields: 'formatted_address,geometry',
              key: 'AIzaSyAcRvHJpfGRPIL18NHCyKdrmc4R0oR5Zug',
            },
          },
        )

        const location = response.data.candidates[0].geometry.location

        if (!location) {
          throw new BadRequestException('Lokasi tidak ditemukan')
        }

        const nearbyKerjain = await this.prisma.$queryRaw`
          SELECT *
          FROM "Kerjain"
          WHERE ST_DWithin(
            ST_Transform(ST_SetSRID(ST_MakePoint("lng"::DOUBLE PRECISION, "lat"::DOUBLE PRECISION), 4326), 3857),
            ST_Transform(ST_SetSRID(ST_MakePoint(${location.lng}::DOUBLE PRECISION, ${location.lat}::DOUBLE PRECISION), 4326), 3857),
            ${RADIUS_IN_METERS}
          )
        `

        return { kerjain: nearbyKerjain, searchLocation: location }
      } catch (error) {
        console.error(error)
      }
    }
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

    if (!kerjain.isOpen) {
      throw new BadRequestException('KerjaIN sudah ditutup')
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

    if (!kerjainApply) {
      throw new BadRequestException('KerjaIN Apply tidak ditemukan')
    }

    const message = await this.prisma.kerjainApplyChat.findMany({
      where: { kerjainApplyId: kerjainApply.id },
      orderBy: { createdAt: 'asc' },
    })

    const peerName =
      userClient.id === kerjainApply.client.id
        ? kerjainApply.kerjain.author.fullName
        : kerjainApply.client.fullName
    const peerProfileUrl =
      userClient.id === kerjainApply.client.id
        ? kerjainApply.kerjain.author.profileUrl
        : kerjainApply.client.profileUrl
    const authorEmail = kerjainApply.kerjain.author.userEmail

    return {
      peerName,
      peerProfileUrl,
      authorEmail,
      message,
    }
  }

  async markDoneKerjain(body: MarkDoneKerjainDTO) {
    return await this.prisma.kerjain.update({
      where: { id: body.id },
      data: { isOpen: false },
    })
  }

  async getKerjainDetail(id: string) {
    return await this.prisma.kerjain.findUnique({
      where: { id },
      include: { kerjainApply: { select: { client: true } } },
    })
  }
}
