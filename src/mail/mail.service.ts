import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

import { isDev } from '@/libs/common/utils/is-dev.util'

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name)
	private readonly resend: Resend

	public constructor(
		private readonly configService: ConfigService,
		private readonly mailerService: MailerService
	) {
		this.resend = new Resend(
			this.configService.getOrThrow<string>('RESEND_API_KEY')
		)
	}

	async sendEmail(to: string, subject: string, html: string) {
		this.logger.log(`Email sent to ${to} with subject: ${subject}`)

		if (isDev(this.configService)) {
			return await this.resend.emails.send({
				from: 'noreply@nest-auth.dev',
				to,
				subject,
				html
			})
		}

		await this.mailerService.sendMail({
			to,
			subject,
			html
		})
	}
}
