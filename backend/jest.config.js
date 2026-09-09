module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/helpers/jest.setup.js'],
  verbose: true,
  testTimeout: 20000,
};