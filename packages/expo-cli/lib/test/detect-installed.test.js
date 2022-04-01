const withFixture = require('./lib/with-fixture')
const { InstalledState, detectInstalledState, detectInstalledVersion } = require('../detect-installed')

describe('expo-cli: detect-installed', () => {
  describe('detectInstalledVersion', () => {
    it('should work on a fresh project', async () => {
      await withFixture('blank-00', async (projectRoot) => {
        const version = await detectInstalledVersion(projectRoot)
        expect(version).toBe(undefined)
      })
    })

    it('should work on project with Bugsnag installed', async () => {
      await withFixture('already-configured-00', async (projectRoot) => {
        const version = await detectInstalledVersion(projectRoot)
        expect(version).toBe('^7.0.0')
      })

      await withFixture('already-configured-01', async (projectRoot) => {
        const version = await detectInstalledVersion(projectRoot)
        expect(version).toBe('7.0.0')
      })
    })
  })

  describe('detectInstalledState', () => {
    it('should return "NONE" when Bugsnag and dependencies are missing', async () => {
      await withFixture('blank-00', async (projectRoot) => {
        const state = await detectInstalledState(projectRoot)
        expect(state).toBe(InstalledState.NONE)
      })
    })

    it('should return "BUGSNAG_EXPO" when Bugsnag is installed but dependencies are missing', async () => {
      await withFixture('already-installed-00', async (projectRoot) => {
        const state = await detectInstalledState(projectRoot)
        expect(state).toBe(InstalledState.BUGSNAG_EXPO)
      })
    })

    it('should return "ALL_DEPENDENCIES" when Bugsnag is not installed but dependencies are', async () => {
      await withFixture('dependencies-only-00', async (projectRoot) => {
        const state = await detectInstalledState(projectRoot)
        expect(state).toBe(InstalledState.ALL_DEPENDENCIES)
      })
    })

    it('should return "BUGSNAG_EXPO | ALL_DEPENDENCIES" when both Bugsnag and dependencies are installed', async () => {
      await withFixture('already-installed-01', async (projectRoot) => {
        const state = await detectInstalledState(projectRoot)
        expect(state).toBe(InstalledState.BUGSNAG_EXPO | InstalledState.ALL_DEPENDENCIES)
      })
    })
  })
})
