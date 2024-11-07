import { Module } from '@nestjs/common'
import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { CommonModule } from './common/common.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { AuthGuard } from './auth/auth.guard'
import { KerjainModule } from './kerjain/kerjain.module'
import { JobModule } from './job/job.module'
import { OpenaiModule } from './openai/openai.module'

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    AuthModule,
    KerjainModule,
    JobModule,
    OpenaiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
