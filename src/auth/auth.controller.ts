import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Put,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { ResponseUtil } from '../common/utils/response.util'
import { Public } from '../common/decorators/public.decorator'
import { RegisterDTO } from './dto/register.dto'
import { BasicLoginDTO } from './dto/basicLogin.dto'
import { OauthLoginDTO } from './dto/oauth.dto'
import { GetUser } from '../common/decorators/getUser.decorator'
import { User } from '@prisma/client'
import { UpdateUserDTO } from './dto/updateUser.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseUtil: ResponseUtil,
  ) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() body: RegisterDTO) {
    const result = await this.authService.register(body)

    return this.responseUtil.response(
      {
        code: HttpStatus.CREATED,
        message: 'Berhasil membuat akun!',
      },
      result,
    )
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('basic-login')
  async basicLogin(@Body() body: BasicLoginDTO) {
    const { email, password } = body

    const result = await this.authService.basicLogin(
      email.toLowerCase(),
      password,
    )

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
        message: 'Login berhasil!',
      },
      result,
    )
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('oauth')
  async OAuthLogin(@Body() body: OauthLoginDTO) {
    const { firebaseToken } = body

    const result = await this.authService.OAuthLogin(firebaseToken)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
        message: 'Login berhasil!',
      },
      result,
    )
  }

  @HttpCode(HttpStatus.OK)
  @Get('user')
  async getUser(@GetUser() user: User) {
    const result = await this.authService.getUser(user)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
      },
      result,
    )
  }

  @HttpCode(HttpStatus.OK)
  @Put('user')
  async updateUser(@GetUser() user: User, @Body() body: UpdateUserDTO) {
    const result = await this.authService.updateUser(user, body)

    return this.responseUtil.response(
      {
        code: HttpStatus.OK,
        message: 'Berhasil mengubah data!',
      },
      { user: result },
    )
  }
}
