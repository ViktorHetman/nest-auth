/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-require-imports */
import { ConflictException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthMethod, UserRole } from '@prisma/__generated__'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import type { Request, Response } from 'express'
import { v4 as uuid } from 'uuid'

import { UserService } from '@/user/user.service'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ResponseDto } from './dto/response.dto'

const mockUserService = {
	findByEmail: jest.fn(),
	create: jest.fn()
}

const registerDto: RegisterDto = {
	email: 'newuser@gmail.com',
	name: 'New User',
	password: '123456',
	passwordRepeat: '123456'
}

const newUser: Partial<ResponseDto> = {
	id: uuid(),
	email: 'newuser@gmail.com',
	displayName: 'New User',
	avatar: '',
	authMethod: AuthMethod.CREDENTIALS,
	isVerified: false,
	role: UserRole.REGULAR,
	createdAt: new Date(),
	updatedAt: new Date(),
	accounts: []
}

describe('AuthService', () => {
	let authService: AuthService
	let userService: UserService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				ConfigService,
				{
					provide: UserService,
					useValue: mockUserService
				}
			]
		}).compile()

		authService = module.get<AuthService>(AuthService)
		userService = module.get<UserService>(UserService)

		jest.spyOn(
			require('class-transformer'),
			'plainToInstance'
		).mockReturnValue(newUser)
		jest.spyOn(
			require('class-transformer'),
			'instanceToPlain'
		).mockReturnValue(newUser)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(authService).toBeDefined()
	})

	describe('register', () => {
		it('should register a new user successfully', async () => {
			mockUserService.findByEmail.mockResolvedValue(null)
			mockUserService.create.mockResolvedValue(newUser)
			const req = { session: { save: jest.fn(cb => cb(null)) } } as any

			const result = await authService.register(req, registerDto)

			expect(userService.findByEmail).toHaveBeenCalledWith(
				registerDto.email
			)
			expect(userService.create).toHaveBeenCalledWith(
				registerDto.email,
				registerDto.password,
				registerDto.name,
				'',
				'CREDENTIALS',
				false
			)
			expect(plainToInstance).toHaveBeenCalledWith(ResponseDto, newUser)
			expect(instanceToPlain).toHaveBeenCalledWith(newUser)
			expect(result).toEqual(newUser)
		})

		it('should throw ConflictException if email already exists', async () => {
			mockUserService.findByEmail.mockResolvedValue(newUser)
			const req = { session: { save: jest.fn(cb => cb(null)) } } as any

			await expect(
				authService.register(req, registerDto)
			).rejects.toThrow(ConflictException)
			expect(userService.findByEmail).toHaveBeenCalledWith(
				registerDto.email
			)
			expect(userService.create).not.toHaveBeenCalled()
		})
	})

	describe('login', () => {
		it('should login user with correct credentials', async () => {
			const user = { ...newUser, password: 'hashedPassword' }
			mockUserService.findByEmail.mockResolvedValue(user)
			jest.spyOn(require('argon2'), 'verify').mockResolvedValue(true)

			const dto: LoginDto = {
				email: 'newuser@gmail.com',
				password: '123456'
			}

			const req = { session: { save: jest.fn(cb => cb(null)) } } as any

			const result = await authService.login(req, dto)
			expect(userService.findByEmail).toHaveBeenCalledWith(dto.email)
			expect(result).toEqual(newUser)
		})

		it('should throw NotFoundException if user not found', async () => {
			mockUserService.findByEmail.mockResolvedValue(null)
			const dto: LoginDto = {
				email: 'newuser@gmail.com',
				password: '123456'
			}
			const req = { session: { save: jest.fn(cb => cb(null)) } } as any

			await expect(authService.login(req, dto)).rejects.toThrow(
				'User Not Found'
			)
		})
	})
	describe('logout', () => {
		it('should clear session and cookie', async () => {
			const req = {
				session: {
					userId: 'user-id',
					destroy: jest.fn(cb => cb(null))
				}
			} as any
			const res = { clearCookie: jest.fn() } as any
			jest.spyOn(
				authService['configService'],
				'getOrThrow'
			).mockReturnValue('SESSION_NAME')

			await expect(authService.logout(req, res)).resolves.toBeUndefined()
			expect(res.clearCookie).toHaveBeenCalledWith('SESSION_NAME')
		})

		it('should throw InternalServerErrorException if session destroy fails', async () => {
			const req = {
				session: {
					userId: 'user-id',
					destroy: jest.fn(cb => cb(new Error('fail')))
				}
			} as any

			const res = { clearCookie: jest.fn() } as any

			jest.spyOn(
				authService['configService'],
				'getOrThrow'
			).mockReturnValue('SESSION_NAME')

			await expect(authService.logout(req, res)).rejects.toThrow(
				'Failed to destroy session. Check if session params are correct'
			)
		})
	})
})
