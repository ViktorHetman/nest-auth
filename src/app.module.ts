import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AuthModule } from './auth/auth.module'
import { ProviderModule } from './auth/provider/provider.module'
import { CustomLogger } from './libs/common/logger/logger.service'
import { IS_DEV_ENV } from './libs/common/utils/is-dev.util'
import { MailModule } from './mail/mail.module'
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		PrismaModule,
		AuthModule,
		UserModule,
		ProviderModule,
		MailModule
	],
	providers: [CustomLogger]
})
export class AppModule {}
