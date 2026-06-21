/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/../core/src/$1',
    '^@renderer/(.*)$': '<rootDir>/../renderer/src/$1',
    '^@diagrammatic-lab/core$': '<rootDir>/../core/src/index.ts',
    '^@diagrammatic-lab/renderer$': '<rootDir>/../renderer/src/index.ts'
  },
  // All source logic is covered by default; only the non-unit-tested files are
  // excluded - React components (.tsx) are skipped automatically, hooks are thin
  // DOM wrappers, and .d.ts has nothing to run.
  collectCoverageFrom: ['src/**/*.ts', '!src/hooks/**', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
}
