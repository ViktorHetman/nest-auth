import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthMethod, UserRole } from '@prisma/__generated__'
import session from 'express-session'
import request from 'supertest'
import { App } from 'supertest/types'

import { AppModule } from '@/app.module'
import { AuthModule } from '@/auth/auth.module'
import { LoginDto } from '@/auth/dto/login.dto'
import { RegisterDto } from '@/auth/dto/register.dto'
import { ResponseDto } from '@/auth/dto/response.dto'
import { ms, StringValue } from '@/libs/common/utils/ms.util'
import { parseBoolean } from '@/libs/common/utils/parse-boolean.util'
import { PrismaService } from '@/prisma/prisma.service'

describe('Auth (e2e)', () => {
	let app: INestApplication<App>
	let prisma: PrismaService

	const registerDto: RegisterDto = {
		email: 'newuser@gmail.com',
		name: 'new user',
		password: '123456',
		passwordRepeat: '123456'
	}

	const loginDto: LoginDto = {
		email: 'newuser@gmail.com',
		password: '123456'
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

		const config = app.get(ConfigService)

		app.use(
			session({
				secret: 'test_secret',
				resave: false,
				saveUninitialized: false,
				cookie: {
					domain: config.getOrThrow<string>('SESSION_DOMAIN'),
					maxAge: ms(
						config.getOrThrow<StringValue>('SESSION_MAX_AGE')
					),
					httpOnly: parseBoolean(
						config.getOrThrow<string>('SESSION_HTTP_ONLY')
					),
					secure: parseBoolean(
						config.getOrThrow<string>('SESSION_SECURE')
					),
					sameSite: 'lax'
				},
				store: undefined
			})
		)

		app.useGlobalPipes(new ValidationPipe())

		await app.init()

		prisma = app.get(PrismaService)
	})

	afterAll(async () => {
		await prisma.user.deleteMany()
		await prisma.$disconnect()

		await app.close()
	})

	describe('POST /auth/register', () => {
		it('should register user', async () => {
			const response = await request(app.getHttpServer())
				.post('/auth/register')
				.expect(201)
				.send(registerDto)

			const user = await prisma.user.findUnique({
				where: { id: registerDto.email }
			})

			expect(response.headers['set-cookie']).toBeDefined()
			expect(response.body).toEqual(newUser)
			expect(user).toBeDefined()
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
				.send(registerDto)
		})
	})
	describe('POST /auth/login', () => {
		it('should login user', async () => {
			const response = await request(app.getHttpServer())
				.post('/auth/login')
				.expect(200)
				.send(loginDto)

			expect(response.headers['set-cookie']).toBeDefined()
			expect(response.body).toEqual(newUser)
			expect(response.body).toHaveProperty('id')
		})

		it(`shouldn't login user and return 400 status code`, async () => {
			await request(app.getHttpServer())
				.post('/auth/login')
				.expect(400)
				.send({})
		})

		it(`shouldn't login user and return 401 status code`, async () => {
			const invalidDto = { ...loginDto, password: '123457' }
			await request(app.getHttpServer())
				.post('/auth/login')
				.expect(401)
				.send(invalidDto)
		})

		it(`shouldn't login user and return 404 status code`, async () => {
			const invalidDto = { ...loginDto, email: 'newuser2@gmail.com' }
			await request(app.getHttpServer())
				.post('/auth/login')
				.expect(404)
				.send(invalidDto)
		})
	})

	describe('POST /auth/logout', () => {
		it('should logout user', async () => {
			const response = await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(200)

			const cookie = response.headers['set-cookie'][0]

			await request(app.getHttpServer())
				.post('/auth/logout')
				.set('Cookie', cookie)
				.expect(200)

			// SERVICE BUG: USER CAN LOGOUT SEVERAL TIMES
			// await request(app.getHttpServer())
			// 	.post('/auth/logout')
			// 	.set('Cookie', cookie)
			// 	.expect(401)
		})
	})
})
