module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    setupFilesAfterEnv: ['./tests/setup.ts'],
    collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
    testTimeout: 30000,
};