import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthMethod, User } from '@prisma/__generated__'
import { verify } from 'argon2'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import type { Request, Response } from 'express'

import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ResponseDto } from './dto/response.dto'
import { ProviderService } from './provider/provider.service'

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name)
	constructor(
		private readonly prismaService: PrismaService,
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly providerService: ProviderService
	) {}

	public async register(
		req: Request,
		dto: RegisterDto
	): Promise<Record<string, unknown>> {
		const { email, password, name } = dto
		const user = await this.userService.findByEmail(email)

		if (user) {
			throw new ConflictException('User with such email already exists')
		}

		const newUser = await this.userService.create(
			email,
			password,
			name,
			'',
			'CREDENTIALS',
			false
		)

		await this.saveSession(req, newUser)

		this.logger.log(
			`User: ${newUser.email}, ${newUser.displayName}, ${newUser.authMethod}, was registered`
		)

		return instanceToPlain(plainToInstance(ResponseDto, newUser))
	}

	public async login(
		req: Request,
		dto: LoginDto
	): Promise<Record<string, unknown>> {
		const { email, password } = dto
		const user = await this.userService.findByEmail(email)

		if (!user || !user.password)
			throw new NotFoundException('User Not Found')

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword)
			throw new UnauthorizedException('Invalid Password')

		await this.saveSession(req, user)

		this.logger.log(
			`User: ${user.id}, ${user.email}, ${user.authMethod}, logged in`
		)

		return instanceToPlain(plainToInstance(ResponseDto, user))
	}

	public async logout(req: Request, res: Response): Promise<void> {
		return new Promise((resolve, reject) => {
			this.logger.log(`User: ${req.session.userId}, logged out`)
			req.session.destroy(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Failed to destroy session. Check if session params are correct'
						)
					)
				}
				res.clearCookie(
					this.configService.getOrThrow<string>('SESSION_NAME')
				)
				resolve()
			})
		})
	}

	public async extractProfileFromCode(
		req: Request,
		provider: string,
		code: string
	) {
		const providerInstance = this.providerService.findByService(provider)

		const profile = await providerInstance?.findUserByCode(code)

		const account = await this.prismaService.account.findFirst({
			where: {
				id: profile?.id,
				provider: profile?.provider
			}
		})

		let user = account?.userId
			? await this.userService.findById(account.userId)
			: null

		if (user) {
			return this.saveSession(req, user)
		}

		user = await this.userService.create(
			profile?.email as string,
			'',
			profile?.name as string,
			profile?.picture as string,
			AuthMethod[
				profile?.provider.toUpperCase() as keyof typeof AuthMethod
			],
			true
		)

		if (!account) {
			await this.prismaService.account.create({
				data: {
					userId: user.id,
					type: 'oauth',
					provider: profile?.provider as string,
					accessToken: profile?.access_token,
					refreshToken: profile?.refresh_token,
					expiresAt: Number(profile?.expires_at)
				}
			})
		}

		return this.saveSession(req, user)
	}

	private async saveSession(req: Request, user: User): Promise<unknown> {
		return new Promise((resolve, reject) => {
			req.session.userId = user.id

			req.session.save(err => {
				if (err) {
					this.logger.error('Session saving error', err)
					return reject(
						new InternalServerErrorException(
							'Failed to save session. Check if session params are correct'
						)
					)
				}

				resolve({ user })
			})
		})
	}
}
