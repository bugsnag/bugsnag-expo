const withFixture = require('./lib/with-fixture')
const detectInstalled = require('../detect-installed')

describe('expo-cli: detect-installed', () => {
  it('should work on a fresh project', async () => {
    await withFixture('blank-00', async (projectRoot) => {
      const version = await detectInstalled(projectRoot)
      expect(version).toBe(undefined)
    })
  })

  it('should work on project with Bugsnag installed', async () => {
    await withFixture('already-configured-00', async (projectRoot) => {
      const version = await detectInstalled(projectRoot)
      expect(version).toBe('^7.0.0')
    })

    await withFixture('already-configured-01', async (projectRoot) => {
      const version = await detectInstalled(projectRoot)
      expect(version).toBe('7.0.0')
    })
  })
})
