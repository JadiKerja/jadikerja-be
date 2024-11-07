import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { KerjainService } from './kerjain.service'
import { ResponseUtil } from '../common/utils/response.util'
import { ApplyKerjainDTO } from './dto/applyKerjain.dto'
import { GetUser } from '../common/decorators/getUser.decorator'
import { User } from '@prisma/client'
import { CreateKerjainDTO } from './dto/createKerjain.dto'
import { MarkDoneKerjainDTO } from './dto/markDoneKerjain.dto'

@Controller('kerjain')
export class KerjainController {
  constructor(
    private readonly kerjainService: KerjainService,
    private readonly responseUtil: ResponseUtil,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllKerjain(@Query('search') search: string) {
    const result = await this.kerjainService.getAllKerjain(search)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
      },
      result,
    )
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/apply')
  async applyKerjain(@GetUser() user: User, @Body() body: ApplyKerjainDTO) {
    const result = await this.kerjainService.applyKerjain(user, body)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
        message: 'Berhasil apply KerjaIN',
      },
      { kerjain: result },
    )
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async createKerjain(@GetUser() user: User, @Body() body: CreateKerjainDTO) {
    const result = await this.kerjainService.createKerjain(user, body)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
        message: 'Berhasil membuat KerjaIN',
      },
      { kerjain: result },
    )
  }

  @HttpCode(HttpStatus.OK)
  @Get('/author')
  async getMyKerjain(@GetUser() user: User) {
    const result = await this.kerjainService.getMyKerjain(user)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
      },
      { kerjain: result },
    )
  }

  @HttpCode(HttpStatus.OK)
  @Get('/client')
  async getMyAppliedKerjain(@GetUser() user: User) {
    const result = await this.kerjainService.getMyAppliedKerjain(user)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
      },
      { kerjain: result },
    )
  }

  @HttpCode(HttpStatus.OK)
  @Get('/message/:id')
  async getKerjainApplyMessage(@Param('id') id: string, @GetUser() user: User) {
    const result = await this.kerjainService.getKerjainApplyMessage(id, user)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
      },
      result,
    )
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('mark-as-done')
  async markDoneKerjain(@Body() body: MarkDoneKerjainDTO) {
    const result = await this.kerjainService.markDoneKerjain(body)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
        message: 'KerjaIN ditutup',
      },
      { kerjain: result },
    )
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getKerjainDetail(@Param('id') id: string) {
    const result = await this.kerjainService.getKerjainDetail(id)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
      },
      { kerjain: result },
    )
  }
}
