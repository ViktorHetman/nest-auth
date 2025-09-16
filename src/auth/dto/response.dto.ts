import { ApiProperty } from '@nestjs/swagger'
import { Account, AuthMethod, UserRole } from '@prisma/__generated__'
import { Exclude, Expose, Transform } from 'class-transformer'

export class ResponseDto {
	@ApiProperty({
		title: 'id',
		type: String,
		description: 'User id',
		example: 'John Doe'
	})
	@Expose()
	id: string

	@ApiProperty({
		title: 'email',
		type: String,
		description: 'Displayed user name',
		example: 'example@test.com'
	})
	@Expose()
	email: string

	@ApiProperty({
		title: 'displayName',
		type: String,
		description: 'Displayed user name',
		example: 'John Doe'
	})
	@Expose()
	displayName: string

	@Exclude()
	password: string

	@ApiProperty({
		title: 'avatar',
		type: String,
		description: 'Displayed user avatar',
		example: '',
		default: ''
	})
	@Expose()
	avatar: string

	@ApiProperty({
		title: 'role',
		description: 'User role',
		enum: UserRole,
		example: UserRole.REGULAR,
		default: UserRole.REGULAR
	})
	@Expose()
	role: UserRole

	@ApiProperty({
		title: 'isVerified',
		description: 'Indicates either email is verified or no',
		type: Boolean,
		example: false,
		default: false
	})
	@Expose()
	isVerified: boolean

	@ApiProperty({
		title: 'isTwoFactorEnabled',
		description: 'Indicates either two factor is enabled or no',
		type: Boolean,
		example: false,
		default: false
	})
	@Expose()
	isTwoFactorEnabled: boolean

	@ApiProperty({
		title: 'authMethod',
		description: 'User auth method',
		enum: AuthMethod,
		example: AuthMethod.CREDENTIALS,
		default: AuthMethod.CREDENTIALS
	})
	@Expose()
	authMethod: AuthMethod

	@ApiProperty({
		title: 'createdAt',
		description: 'Unix based time of account creation',
		example: 163865805,
		type: Number
	})
	@Expose()
	@Transform(
		({ value }) =>
			value instanceof Date
				? value.getTime() / 1000
				: new Date(value).getTime() / 1000,
		{ toPlainOnly: true }
	)
	createdAt: Date

	@ApiProperty({
		title: 'updatedAt',
		description: 'Unix based time of account updating',
		example: 163865805,
		type: Number
	})
	@Expose()
	@Transform(
		({ value }) =>
			value instanceof Date
				? value.getTime() / 1000
				: new Date(value).getTime() / 1000,
		{ toPlainOnly: true }
	)
	updatedAt: Date

	@ApiProperty({
		title: 'accounts',
		description: 'User accounts',
		isArray: true,
		example: []
	})
	@Expose()
	accounts: Account[]
}
