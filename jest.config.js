const testsForPackage = (packageName) => `<rootDir>/packages/${packageName}/**/*.test.[jt]s?(x)`

const project = (displayName, packageNames, config = {}) => ({
  roots: ['<rootDir>/packages'],
  displayName,
  testMatch: packageNames.map(testsForPackage),
  ...config
})

const extensions = 'js,jsx,ts,tsx'

module.exports = {
  collectCoverageFrom: [
    `**/packages/*/**/*.{${extensions}}`,
    `!**/*.test.{${extensions}}`,
    `!**/*.test-*.{${extensions}}`,
    '!**/*.d.ts',
    '!**/dist/**',
    '!**/packages/js/**',
    '!<rootDir>/packages/plugin-angular/**/*',
    '!<rootDir>/packages/expo-cli/lib/test/fixtures/**/*',
    '!<rootDir>/packages/expo-cli/lib/test/lib/**/*',
    '!<rootDir>/packages/react-native/src/test/setup.js',
    '!<rootDir>/packages/plugin-node-surrounding-code/test/fixtures/**/*'
  ],
  coverageReporters: [
    'json-summary', 'json', 'lcov', 'text', 'clover'
  ],
  projects: [
    project('expo', [
      'delivery-expo',
      'expo',
      'expo-cli',
      'plugin-expo-app',
      'plugin-expo-device',
      'plugin-react-native-connectivity-breadcrumbs'
    ])
  ]
}
