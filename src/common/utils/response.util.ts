import { Injectable, Logger } from '@nestjs/common'
import { HttpStatus } from '@nestjs/common/enums'
import { ResponseInterface } from './utils.interface'

@Injectable()
export class ResponseUtil {
  response(
    {
      code = HttpStatus.OK,
      message = 'Berhasil mendapatkan data!',
    }: ResponseInterface,
    data?: any,
  ) {
    const responsePayload = {
      code: code,
      success: code >= 200 && code < 300,
      message: message,
      data: {
        ...data,
      },
    }

    Logger.log(responsePayload, `Response Body`)

    return responsePayload
  }
}
