/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthMethod } from '@prisma/__generated__'
import { hash } from 'argon2'

import { PrismaService } from '@/prisma/prisma.service'

import { user as newUser } from '../libs/common/utils/dummy-data.util'

import { UserService } from './user.service'

const db = {
	user: {
		create: jest.fn(),
		findUnique: jest.fn()
	}
}

describe('User Service', () => {
	let service: UserService
	let prisma: PrismaService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: PrismaService,
					useValue: db
				}
			]
		}).compile()
		service = module.get<UserService>(UserService)
		prisma = module.get<PrismaService>(PrismaService)
	})

	afterAll(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
		expect(prisma).toBeDefined()
	})

	it('should return a user when found', async () => {
		const mockUser = {
			id: '1',
			email: 'test@example.com',
			displayName: 'Test User',
			avatar: 'avatar.png',
			accounts: []
		}
		//@ts-expect-error mocks
		prisma.user.findUnique.mockResolvedValue(mockUser)

		const result = await service.findById('1')

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: '1' },
			include: { accounts: true }
		})
		expect(result).toEqual(mockUser)
	})

	it('should throw NotFoundException when user is not found', async () => {
		//@ts-expect-error mocks
		prisma.user.findUnique.mockResolvedValue(null)

		await expect(service.findById('1')).rejects.toThrow(NotFoundException)
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: '1' },
			include: { accounts: true }
		})
	})

	describe('findByEmail', () => {
		it('should return a user when found', async () => {
			const mockUser = {
				id: '1',
				email: 'test@example.com',
				displayName: 'Test User'
			}
			//@ts-expect-error mocks
			prisma.user.findUnique.mockResolvedValue(mockUser)

			const result = await service.findByEmail('test@example.com')
			expect(result).toEqual(mockUser)
		})

		it('should return null when user is not found', async () => {
			//@ts-expect-error mocks
			prisma.user.findUnique.mockResolvedValue(null)

			const result = await service.findByEmail('nonexistent@example.com')

			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('should create and return a new user with hashed password', async () => {
			jest.spyOn(require('argon2'), 'hash').mockResolvedValue(
				'hashedPassword'
			)
			//@ts-expect-error mocks
			prisma.user.create.mockResolvedValue(newUser)

			const result = await service.create(
				'test@example.com',
				'password123',
				'Test User',
				'avatar.png',
				AuthMethod.CREDENTIALS,
				true
			)

			expect(prisma.user.create).toHaveBeenCalledWith({
				data: {
					email: 'test@example.com',
					password: 'hashedPassword',
					displayName: 'Test User',
					avatar: 'avatar.png',
					authMethod: AuthMethod.CREDENTIALS,
					isVerified: true
				},
				include: { accounts: true }
			})
			expect(hash).toHaveBeenCalledWith('password123')
			expect(result).toEqual(newUser)
		})
	})
})
