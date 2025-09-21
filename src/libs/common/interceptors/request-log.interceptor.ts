import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor
} from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import { CustomLogger } from '../logger/logger.service'

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
	constructor(private readonly logger: CustomLogger) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req: Request = context.switchToHttp().getRequest()
		const { method, url, headers, ip } = req

		const userAgent = headers['user-agent'] || 'unknown'
		const startTime = Date.now()

		return next.handle().pipe(
			tap(() => {
				const duration = Date.now() - startTime
				const message = `METHOD: ${method} URL: ${url} | IP: ${ip} | UA: ${userAgent} | ${duration}ms`
				this.logger.log(message, '')
			})
		)
	}
}
