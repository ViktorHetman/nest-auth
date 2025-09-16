import { DocumentBuilder } from '@nestjs/swagger'

export function getSwaggerConfig() {
	return new DocumentBuilder()
		.setTitle('Nest-Auth')
		.setDescription('API documentation for the Nest-Auth')
		.setVersion('1.0.0')
		.setContact(
			'Viktor Hetman',
			'https://github.com/ViktorHetman/nest-auth',
			'getmanviktor110@gmail.com'
		)
		.build()
}
