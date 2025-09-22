import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res
} from '@nestjs/common'
import {
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiUnauthorizedResponse
} from '@nestjs/swagger'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
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
	public async register(@Req() req: Request, @Body() dto: RegisterDto) {
		return this.authService.register(req, dto)
	}

	@ApiOperation({
		summary: 'User login',
		description: 'Sign in an existing account'
	})
	@ApiOkResponse({ description: 'OK', type: ResponseDto })
	@ApiNotFoundResponse({ description: 'User Not Found' })
	@ApiUnauthorizedResponse({ description: 'Invalid Password' })
	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(@Req() req: Request, @Body() dto: LoginDto) {
		return this.authService.login(req, dto)
	}

	@ApiOperation({
		summary: 'User logout',
		description: 'Log out from existing account'
	})
	@ApiOkResponse({ description: 'OK' })
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authService.logout(req, res)
	}
}
