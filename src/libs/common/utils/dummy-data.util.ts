import { AuthMethod, UserRole } from '@prisma/__generated__'
import { v4 as uuid } from 'uuid'

import { LoginDto } from '@/auth/dto/login.dto'
import { RegisterDto } from '@/auth/dto/register.dto'
import { ResponseDto } from '@/auth/dto/response.dto'

export const user: Partial<ResponseDto> = {
	id: uuid(),
	email: 'newuser@gmail.com',
	displayName: 'New User',
	avatar: '',
	authMethod: AuthMethod.CREDENTIALS,
	isVerified: false,
	role: UserRole.REGULAR,
	createdAt: new Date(),
	updatedAt: new Date(),
	accounts: []
}

export const registerDto: RegisterDto = {
	email: 'newuser@gmail.com',
	name: 'new user',
	password: '123456',
	passwordRepeat: '123456'
}

export const loginDto: LoginDto = {
	email: 'newuser@gmail.com',
	password: '123456'
}
