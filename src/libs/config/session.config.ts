import { ConfigService } from '@nestjs/config'
import RedisStore from 'connect-redis'
import session from 'express-session'
import IORedis from 'ioredis'

import { ms, StringValue } from '../common/utils/ms.util'
import { parseBoolean } from '../common/utils/parse-boolean.util'

export function getSessionConfig(
	config: ConfigService,
	redis: IORedis
): session.SessionOptions {
	return {
		secret: config.getOrThrow<string>('SESSION_SECRET'),
		name: config.getOrThrow<string>('SESSION_NAME'),
		resave: true,
		saveUninitialized: false,
		cookie: {
			domain: config.getOrThrow<string>('SESSION_DOMAIN'),
			maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
			httpOnly: parseBoolean(
				config.getOrThrow<string>('SESSION_HTTP_ONLY')
			),
			secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
			sameSite: 'lax'
		},
		store: new RedisStore({
			client: redis,
			prefix: config.getOrThrow<string>('SESSION_PREFIX')
		}) as session.Store
	}
}
