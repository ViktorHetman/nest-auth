/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-require-imports */
import { ConflictException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthMethod, UserRole } from '@prisma/__generated__'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { v4 as uuid } from 'uuid'

import { UserService } from '@/user/user.service'

import { AuthService } from './auth.service'
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

			const result = await authService.register(registerDto)

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

			await expect(authService.register(registerDto)).rejects.toThrow(
				ConflictException
			)
			expect(userService.findByEmail).toHaveBeenCalledWith(
				registerDto.email
			)
			expect(userService.create).not.toHaveBeenCalled()
		})
	})
})
