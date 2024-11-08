import { Module } from '@nestjs/common'
import { KerjainService } from './kerjain.service'
import { KerjainController } from './kerjain.controller'
import { KerjainGateway } from './kerjain.gateway'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [KerjainController],
  providers: [KerjainService, KerjainGateway],
})
export class KerjainModule {}
