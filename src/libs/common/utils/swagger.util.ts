import { INestApplication } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'

import { getSwaggerConfig } from '@/libs/config/swagger.config'

export function swaggerSetup(app: INestApplication) {
	const document = SwaggerModule.createDocument(app, getSwaggerConfig())

	SwaggerModule.setup('docs', app, document, {
		customSiteTitle: 'Nest-Auth Docs',
		jsonDocumentUrl: 'swagger/json'
	})
}
