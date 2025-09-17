module.exports = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: './',
	testRegex: '.*\\.spec\\.ts$',
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest'
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@prisma/__generated__$': '<rootDir>/prisma/__generated__',
		'^@prisma/__generated__/(.*)$': '<rootDir>/prisma/__generated__/$1'
	},
	collectCoverageFrom: ['**/*.(t|j)s'],
	coverageDirectory: '../coverage',
	testEnvironment: 'node'
}
