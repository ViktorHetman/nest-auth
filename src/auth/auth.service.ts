import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/__generated__'
import { verify } from 'argon2'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import type { Request, Response } from 'express'

import { UserService } from '@/user/user.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ResponseDto } from './dto/response.dto'

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name)
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService
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
