import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import {
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiOperation
} from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { ResponseDto } from './dto/response.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({
		summary: 'Account creation',
		description: 'Creates new user account '
	})
	@ApiCreatedResponse({ description: 'Created', type: ResponseDto })
	@ApiConflictResponse({ description: 'User with such email already exists' })
	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	public async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}
}
