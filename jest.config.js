/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/unit/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
          },
        }],
      },
    },
    {
      displayName: 'integration',
      testEnvironment: '@edge-runtime/jest-environment',
      testMatch: ['<rootDir>/tests/integration/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
          },
        }],
      },
    },
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
};

module.exports = config;