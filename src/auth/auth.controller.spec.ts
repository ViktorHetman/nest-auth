import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthMethod, UserRole } from '@prisma/__generated__'
import { v4 as uuid } from 'uuid'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { ResponseDto } from './dto/response.dto'

const dto: RegisterDto = {
	email: 'newuser@gmail.com',
	name: 'new user',
	password: '123456',
	passwordRepeat: '123456'
}

const newUser: Partial<ResponseDto> = {
	id: uuid(),
	isTwoFactorEnabled: false,
	isVerified: false,
	role: UserRole.REGULAR,
	email: 'newuser@gmail.com',
	displayName: 'new user',
	avatar: '',
	authMethod: AuthMethod.CREDENTIALS,
	createdAt: new Date(),
	updatedAt: new Date()
}

describe('Auth Controller', () => {
	let controller: AuthController
	let service: AuthService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: {
						register: jest.fn().mockResolvedValue(newUser)
					}
				}
			]
		}).compile()

		controller = module.get<AuthController>(AuthController)
		service = module.get<AuthService>(AuthService)
	})

	it('should be defined', () => {
		expect(AuthController).toBeDefined()
	})

	it('should register new user', async () => {
		const result = await controller.register(dto)
		expect(result).toEqual(newUser)
	})

	it('should throw bad request exception if invalid data was provided', async () => {
		jest.spyOn(service, 'register').mockRejectedValueOnce(
			new BadRequestException()
		)

		try {
			const invalidUser: RegisterDto = {
				email: '123',
				name: '123',
				password: '123',
				passwordRepeat: '123'
			}

			await controller.register(invalidUser)
		} catch (err) {
			expect(err).toBeInstanceOf(BadRequestException)
			const error = err as BadRequestException
			expect(error.message).toBe('Bad Request')
		}
	})
})
