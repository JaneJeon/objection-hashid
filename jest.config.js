process.env.JEST_JUNIT_OUTPUT_DIR = 'reports/jest'

module.exports = {
  coverageThreshold: {
    global: {
      branches: 80
    }
  },
  reporters: ['default', 'jest-junit'],
  errorOnDeprecated: true,
  notify: true,
  globalTeardown: './__utils__/teardown-db.js',
  setupFilesAfterEnv: ['./__utils__/teardown-db.js']
}
