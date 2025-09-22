import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthMethod, UserRole } from '@prisma/__generated__'
import request from 'supertest'
import { App } from 'supertest/types'

import { AppModule } from '@/app.module'
import { AuthModule } from '@/auth/auth.module'
import { RegisterDto } from '@/auth/dto/register.dto'
import { ResponseDto } from '@/auth/dto/response.dto'
import { PrismaService } from '@/prisma/prisma.service'

describe('Auth (e2e)', () => {
	let app: INestApplication<App>
	let prisma: PrismaService

	const dto: RegisterDto = {
		email: 'newuser@gmail.com',
		name: 'new user',
		password: '123456',
		passwordRepeat: '123456'
	}

	const newUser: Partial<ResponseDto> = {
		id: expect.any(String) as string,
		email: 'newuser@gmail.com',
		displayName: 'new user',
		avatar: '',
		role: UserRole.REGULAR,
		isVerified: false,
		isTwoFactorEnabled: false,
		authMethod: AuthMethod.CREDENTIALS,
		createdAt: expect.any(Number) as Date,
		updatedAt: expect.any(Number) as Date,
		accounts: []
	}

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule]
		}).compile()

		app = moduleFixture.createNestApplication()

		app.useGlobalPipes(new ValidationPipe())

		await app.init()

		prisma = app.get(PrismaService)
	})

	afterAll(async () => {
		await prisma.user.deleteMany()

		await app.close()
	})
	describe('POST /auth/register', () => {
		it('should register user', async () => {
			const response = await request(app.getHttpServer())
				.post('/auth/register')
				.expect(201)
				.send(dto)

			expect(response.body).toEqual(newUser)
			expect(response.body).toHaveProperty('id')
		})

		it("shouldn't register user and return 400 status code", async () => {
			await request(app.getHttpServer())
				.post('/auth/register')
				.expect(400)
				.send({})
		})

		it("shouldn't register user and return 409 status code", async () => {
			await request(app.getHttpServer())
				.post('/auth/register')
				.expect(409)
				.send(dto)
		})
	})
})
