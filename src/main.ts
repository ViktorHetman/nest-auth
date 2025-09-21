import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import IORedis from 'ioredis'

import { AppModule } from './app.module'
import { AllExceptionsFilter } from './libs/common/filters/all-exception.filter'
import { RequestLogInterceptor } from './libs/common/interceptors/request-log.interceptor'
import { CustomLogger } from './libs/common/logger/logger.service'
import { swaggerSetup } from './libs/common/utils/swagger.util'
import { getSessionConfig } from './libs/config/session.config'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true
	})

	const config = app.get(ConfigService)
	const redis = new IORedis(config.getOrThrow<string>('REDIS_URI'))
	const logger = app.get(CustomLogger)

	app.useLogger(logger)

	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.useGlobalInterceptors(new RequestLogInterceptor(logger))

	app.useGlobalPipes(new ValidationPipe({ transform: true }))

	app.useGlobalFilters(new AllExceptionsFilter(logger))

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
