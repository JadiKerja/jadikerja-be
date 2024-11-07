import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { OpenaiService } from './openai.service'
import { ResponseUtil } from '../common/utils/response.util'

@Controller('openai')
export class OpenaiController {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly responseUtil: ResponseUtil,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async handleMessage(
    @Body('messages') messages: Array<{ role: string; content: string }>,
  ) {
    const result = await this.openaiService.sendMessage(messages)

    return this.responseUtil.response(
      {
        code: HttpStatus.CREATED,
        message: 'Berhasil prompt ke OpenAI!',
      },
      result,
    )
  }
}
