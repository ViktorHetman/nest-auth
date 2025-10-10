/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha'

import { getRecaptchaConfig } from '@/libs/config/recaptcha.config'
import { UserService } from '@/user/user.service'

import {
	loginDto,
	user as newUser,
	registerDto
} from '../libs/common/utils/dummy-data.util'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('Auth Controller', () => {
	let controller: AuthController
	let service: AuthService

	beforeEach(async () => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			imports: [
				GoogleRecaptchaModule.forRootAsync({
					imports: [ConfigModule],
					useFactory: getRecaptchaConfig,
					inject: [ConfigService]
				})
			],
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: {
						register: jest.fn().mockResolvedValue(newUser),
						login: jest.fn().mockResolvedValue(newUser),
						logout: jest.fn().mockResolvedValue(undefined)
					}
				},
				{
					provide: UserService,
					useValue: {
						findById: jest.fn().mockResolvedValue(newUser)
					}
				}
			]
		}).compile()

		controller = module.get<AuthController>(AuthController)
		service = module.get<AuthService>(AuthService)
	})

	afterAll(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(AuthController).toBeDefined()
	})

	describe('register', () => {
		it('should register new user', async () => {
			const req = { session: { save: jest.fn(cb => cb(null)) } } as any

			const result = await controller.register(req, registerDto)
			expect(result).toEqual(newUser)
			expect(service.register).toHaveBeenCalledWith(req, registerDto)
		})

		it('should throw BadRequestException if invalid data was provided', async () => {
			jest.spyOn(service, 'register').mockRejectedValueOnce(
				new BadRequestException()
			)
			const req = { session: { save: jest.fn(cb => cb(null)) } } as any

			await expect(
				controller.register(req, {
					email: '123',
					name: '123',
					password: '123',
					passwordRepeat: '123'
				})
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('login', () => {
		it('should login existing user', async () => {
			const req = {
				session: { save: jest.fn(cb => cb(null)) }
			} as any

			const result = await controller.login(req, loginDto)

			expect(result).toEqual(newUser)
			expect(service.login).toHaveBeenCalledWith(req, loginDto)
		})

		it('should throw error if login fails', async () => {
			jest.spyOn(service, 'login').mockRejectedValueOnce(
				new Error('Login fail')
			)
			const req = {
				session: { save: jest.fn(cb => cb(null)) }
			} as any

			await expect(controller.login(req, loginDto)).rejects.toThrow(
				'Login fail'
			)
		})
	})

	describe('logout', () => {
		it('should call service.logout and return undefined', async () => {
			const req = {
				session: {
					destroy: jest.fn(cb => cb(null)),
					save: jest.fn(cb => cb(null))
				}
			} as any
			const res = { clearCookie: jest.fn() } as any

			const result = await controller.logout(req, res)

			expect(result).toBeUndefined()
			expect(service.logout).toHaveBeenCalledWith(req, res)
		})

		it('should throw error if logout fails', async () => {
			jest.spyOn(service, 'logout').mockRejectedValueOnce(
				new Error('Logout fail')
			)
			const req = {
				session: {
					destroy: jest.fn(cb => cb(null)),
					save: jest.fn(cb => cb(null))
				}
			} as any
			const res = { clearCookie: jest.fn() } as any

			await expect(controller.logout(req, res)).rejects.toThrow(
				'Logout fail'
			)
		})
	})
})
