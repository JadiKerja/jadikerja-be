import { Module } from '@nestjs/common';
import { KerjainService } from './kerjain.service';
import { KerjainController } from './kerjain.controller';

@Module({
  controllers: [KerjainController],
  providers: [KerjainService],
})
export class KerjainModule {}
