import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as admin from 'firebase-admin'

async function bootstrap() {
  // const whitelistUrls: any[] = (
  //   process.env.APP_WHITELIST || 'http://localhost:3000'
  // ).split(',')

  // const corsOptions = {
  //   credentials: true,
  //   origin: whitelistUrls,
  //   methods: '*',
  // }

  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  // app.enableCors(corsOptions)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID,
    }),
  })

  await app.listen(process.env.PORT || process.env.APP_PORT || 3001)
}
bootstrap()
