import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
	Req,
	Res,
	UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Recaptcha } from '@nestlab/google-recaptcha'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { Authorization } from './decorators/auth.decorator'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ResponseDto } from './dto/response.dto'
import { AuthProviderGuard } from './guards/provider.guard'
import { ProviderService } from './provider/provider.service'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly providerService: ProviderService,
		private readonly configService: ConfigService
	) {}

	@ApiOperation({
		summary: 'Account creation',
		description: 'Creates new user account '
	})
	@ApiCreatedResponse({ description: 'Created', type: ResponseDto })
	@ApiConflictResponse({ description: 'User with such email already exists' })
	@Recaptcha()
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
	@Recaptcha()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(@Req() req: Request, @Body() dto: LoginDto) {
		return this.authService.login(req, dto)
	}

	@UseGuards(AuthProviderGuard)
	@Get('/oauth/callback/:provider')
	@HttpCode(HttpStatus.OK)
	public async callback(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Query('code') code: string,
		@Param('provider') provider: string
	) {
		if (!code) throw new BadRequestException('Code is required')

		await this.authService.extractProfileFromCode(
			req,
			provider.toLowerCase(),
			code
		)

		return res.redirect(
			`${this.configService.getOrThrow<string>('ALLOWED_ORIGIN')}/dashboard/settings`
		)
	}

	@ApiOperation({
		summary: 'OAuth provider connect',
		description: 'Get OAuth provider authorization URL'
	})
	@ApiOkResponse({
		description: 'OK'
	})
	@ApiNotFoundResponse({ description: 'Provider Not Found' })
	@UseGuards(AuthProviderGuard)
	@Get('/oauth/connect/:provider')
	@HttpCode(HttpStatus.OK)
	public async connect(@Param('provider') provider: string) {
		const providerInstance = this.providerService.findByService(
			provider.toLowerCase()
		)
		return {
			url: providerInstance?.getAuthUrl()
		}
	}

	@ApiOperation({
		summary: 'User logout',
		description: 'Log out from existing account'
	})
	@ApiOkResponse({ description: 'OK' })
	@Authorization()
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		return this.authService.logout(req, res)
	}
}
