import { Test, TestingModule } from '@nestjs/testing'

import { user } from '@/libs/common/utils/dummy-data.util'

import { UserController } from './user.controller'
import { UserService } from './user.service'

describe('User Controller', () => {
	let controller: UserController
	let service: UserService

	beforeEach(async () => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: {
						findById: jest.fn().mockResolvedValue(user),
						findByEmail: jest.fn().mockResolvedValue(user),
						create: jest.fn().mockResolvedValue(undefined)
					}
				}
			]
		}).compile()

		controller = module.get<UserController>(UserController)
		service = module.get<UserService>(UserService)
	})

	afterAll(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
		expect(service).toBeDefined()
	})
})
