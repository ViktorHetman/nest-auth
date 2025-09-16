import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { instanceToPlain, plainToInstance } from 'class-transformer'

import { UserService } from '@/user/user.service'

import { RegisterDto } from './dto/register.dto'
import { ResponseDto } from './dto/response.dto'

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name)
	constructor(private readonly userService: UserService) {}

	public async register(dto: RegisterDto) {
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
		this.logger.log(
			`User: ${newUser.email}, ${newUser.displayName}, ${newUser.authMethod}, was registered`
		)
		return instanceToPlain(plainToInstance(ResponseDto, newUser))
	}

	public async login() {}

	public async logout() {}

	private async saveSession() {}
}
