import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import OpenAI from 'openai'

@Injectable()
export class OpenaiService {
  constructor(@Inject('OpenAI') private readonly openAI: OpenAI) {}

  async sendMessage(messages: Array<{ role: string; content: string }>) {
    try {
      const messageSent = [
        {
          role: 'system',
          content:
            'Saya ingin kamu berperan sebagai asisten dalam hal karir. Nama kamu adalah Jed dan kamu harus menjawab dengan menggunakan bahasa Indonesia.',
        },
        ...messages,
      ] as { role: 'system' | 'user' | 'assistant'; content: string }[]

      const completion = await this.openAI.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messageSent,
      })

      const completionResponse = completion.choices[0].message

      if (completionResponse.refusal) {
        console.log(completionResponse.refusal)
      }

      return completionResponse
    } catch (error) {
      console.error('An error occurred:', error.message)
      throw new InternalServerErrorException('Failed to process OpenAI request')
    }
  }
}
