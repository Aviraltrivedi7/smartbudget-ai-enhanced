export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {},
  clearMocks: true,
  testTimeout: 15000,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    '!routes/ai.js',
  ],
};
