import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { IS_DEV_ENV } from '@/libs/common/utils/is-dev.util'
import { getMailerConfig } from '@/libs/config/mailer.config'

import { MailService } from './mail.service'

@Module({
	imports: IS_DEV_ENV
		? [ConfigModule]
		: [
				MailerModule.forRootAsync({
					imports: [ConfigModule],
					useFactory: getMailerConfig,
					inject: [ConfigService]
				})
			],
	providers: [MailService],
	exports: [MailService]
})
export class MailModule {}
