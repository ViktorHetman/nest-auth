import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { UserRole } from '@prisma/__generated__'

import { Authorization } from '@/auth/decorators/auth.decorator'
import { Authorized } from '@/auth/decorators/authorized.decorator'
import { user } from '@/libs/common/utils/dummy-data.util'

import { UserService } from './user.service'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({
		summary: 'User profile',
		description: 'Getting all user information, requires authorization'
	})
	@ApiOkResponse({
		description: 'OK',
		example: user
	})
	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get('profile')
	public async findProfile(@Authorized('id') userId: string) {
		return this.userService.findById(userId)
	}

	@ApiOperation({
		summary: 'User profile',
		description:
			'Getting all user information by param id, requires authorization, and admin role'
	})
	@ApiOkResponse({
		description: 'OK',
		example: user
	})
	@Authorization(UserRole.ADMIN)
	@HttpCode(HttpStatus.OK)
	@Get('profile/:id')
	public async findById(@Param('id') id: string) {
		return this.userService.findById(id)
	}
}
