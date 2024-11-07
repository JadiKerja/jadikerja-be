import { Module } from '@nestjs/common'
import { OpenaiService } from './openai.service'
import { OpenaiController } from './openai.controller'
import OpenAI from 'openai'

@Module({
  controllers: [OpenaiController],
  providers: [
    {
      provide: 'OpenAI',
      useFactory: () => {
        return new OpenAI({ apiKey: process.env.OPEN_API_KEY })
      },
    },
    OpenaiService,
  ],
  exports: ['OpenAI'],
})
export class OpenaiModule {}
