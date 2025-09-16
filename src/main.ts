import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import IORedis from 'ioredis'

import { AppModule } from './app.module'
import { swaggerSetup } from './libs/common/utils/swagger.util'
import { getSessionConfig } from './libs/config/session.config'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)
	const redis = new IORedis(config.getOrThrow<string>('REDIS_URI'))

	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.useGlobalPipes(new ValidationPipe({ transform: true }))

	app.use(session(getSessionConfig(config, redis)))

	swaggerSetup(app)

	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
		credentials: true,
		exposedHeaders: ['set-cookie']
	})

	await app.listen(config.getOrThrow<number>('APP_PORT'))
}
void bootstrap()
