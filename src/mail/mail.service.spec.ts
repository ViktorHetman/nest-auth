/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Resend } from 'resend'

import { MailService } from './mail.service'

const isDev = require('@/libs/common/utils/is-dev.util').isDev

jest.mock('resend')
jest.mock('@/libs/common/utils/is-dev.util', () => ({
	isDev: jest.fn()
}))

describe('MailService', () => {
	let service: MailService
	let configService: ConfigService
	let mailerService: MailerService

	beforeEach(async () => {
		configService = {
			getOrThrow: jest.fn().mockReturnValue('fake-api-key')
		} as any
		mailerService = {
			sendMail: jest.fn()
		} as any
		;(Resend as jest.Mock).mockImplementation(() => ({
			emails: {
				send: jest.fn()
			}
		}))
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MailService,
				{ provide: ConfigService, useValue: configService },
				{ provide: MailerService, useValue: mailerService }
			]
		}).compile()

		service = module.get<MailService>(MailService)
		resendMock = (service as any).resend
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	it('should use Resend in dev mode', async () => {
		isDev.mockReturnValue(true)
		const sendMock = resendMock.emails.send as jest.Mock
		sendMock.mockResolvedValue('sent')
		const result = await service.sendEmail(
			'test@example.com',
			'Test',
			'<b>Hi</b>'
		)
		expect(sendMock).toHaveBeenCalledWith({
			from: 'noreply@nest-auth.dev',
			to: 'test@example.com',
			subject: 'Test',
			html: '<b>Hi</b>'
		})
		expect(result).toBe('sent')
	})

	it('should use mailerService in prod mode', async () => {
		isDev.mockReturnValue(false)
		const sendMailMock = mailerService.sendMail as jest.Mock
		sendMailMock.mockResolvedValue(undefined)
		await service.sendEmail('prod@example.com', 'Prod', '<b>Hello</b>')
		expect(sendMailMock).toHaveBeenCalledWith({
			to: 'prod@example.com',
			subject: 'Prod',
			html: '<b>Hello</b>'
		})
	})

	it('should log when sending email', async () => {
		isDev.mockReturnValue(false)
		const loggerSpy = jest.spyOn((service as any).logger, 'log')
		const sendMailMock = mailerService.sendMail as jest.Mock
		sendMailMock.mockResolvedValue(undefined)
		await service.sendEmail('log@example.com', 'Log', '<b>Log</b>')
		expect(loggerSpy).toHaveBeenCalledWith(
			'Email sent to log@example.com with subject: Log'
		)
	})
})
