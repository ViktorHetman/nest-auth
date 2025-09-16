import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Length,
	Validate
} from 'class-validator'

import { IsPasswordMatchingConstraint } from '@/libs/common/decorators/is-password-matching.decorator'

export class RegisterDto {
	@ApiProperty({
		title: 'User name',
		type: String,
		description: 'Displayed user name',
		example: 'John Doe'
	})
	@IsString({ message: 'Name should be a string' })
	@IsNotEmpty({ message: 'Name is required' })
	name: string

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

	@ApiProperty({
		title: 'Confirmation password',
		type: String,
		description: 'Password used for confirmation',
		example: '123456',
		minLength: 6,
		maxLength: 40
	})
	@IsString({ message: 'Password confirmation should be a string' })
	@IsNotEmpty({ message: 'Password confirmation is required' })
	@Length(6, 40, {
		message:
			'Password confirmation length should be longer than 6 and less than 40'
	})
	@Validate(IsPasswordMatchingConstraint, {
		message: 'Passwords should be equal'
	})
	passwordRepeat: string
}
