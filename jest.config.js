module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 75,
      functions: 85,
      statements: 80,
    },
  },
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 60000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
