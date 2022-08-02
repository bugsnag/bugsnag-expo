
const withFixture = require('./lib/with-fixture')
const uploadSourcemaps = require('../../commands/upload-sourcemaps')

describe('expo-cli: upload-sourcemaps', () => {
  it('should return an error message when installing with expo-v44', async () => {
    await withFixture('install-with-v44', async (projectRoot) => {
      const msg = await uploadSourcemaps(undefined, { yarn: true, 'project-root': projectRoot })
      expect(msg).toBe(undefined)
    })
  })
})
