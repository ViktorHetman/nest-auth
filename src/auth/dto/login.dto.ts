import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class LoginDto {
	@ApiProperty({
		title: 'User email',
		type: String,
		description: 'User email for notifications',
		example: 'example@email.com'
	})
	@IsEmail({}, { message: 'Invalid email format' })
	@IsString({ message: 'Email should be a string' })
	@IsNotEmpty({ message: 'Email is required' })
	email: string

	@ApiProperty({
		title: 'User password',
		type: String,
		description: 'User password to be hashed',
		example: '123456',
		minLength: 6,
		maxLength: 40
	})
	@IsString({ message: 'Password should be a string' })
	@IsNotEmpty({ message: 'Password is required' })
	@Length(6, 40, {
		message: 'Password length should be longer than 6 and less than 40'
	})
	password: string
}
