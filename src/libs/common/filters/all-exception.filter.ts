import {
	ArgumentsHost,
	BadRequestException,
	Catch,
	ExceptionFilter,
	HttpException
} from '@nestjs/common'
import { Request, Response } from 'express'

import { CustomLogger } from '../logger/logger.service'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(private readonly logger: CustomLogger) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const req: Request = ctx.getRequest<Request>()
		const res: Response = ctx.getResponse()

		const { method, url, headers, ip } = req
		const userAgent = headers['user-agent'] || 'unknown'
		let status: number
		let message: string | object

		if (exception instanceof BadRequestException) {
			status = exception.getStatus()
			message = exception.getResponse()
		} else if (exception instanceof HttpException) {
			status = exception.getStatus()
			message = exception.getResponse()
		} else {
			status = 500
			message = 'Internal server error'
		}

		this.logger.error(
			`${method} ${url} | IP: ${ip} | UA: ${userAgent} | STATUS: ${status} | MESSAGE: ${JSON.stringify(message)}`
		)

		// Отправляем ответ клиенту
		res.status(status).json({
			statusCode: status,
			message
		})
	}
}
