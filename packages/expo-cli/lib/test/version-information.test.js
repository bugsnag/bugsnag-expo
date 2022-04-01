const { getBugsnagVersionForExpoVersion } = require('../version-information')

describe('expo-cli: version-information', () => {
  describe('getBugsnagVersionForExpoVersion', () => {
    it('should throw an error for SDK versions <33', () => {
      const expected = new Error('Expo SDK <33 is no longer supported')
      const testWith = version => () => getBugsnagVersionForExpoVersion(version)

      expect(testWith('32.0.0')).toThrow(expected)
      expect(testWith('32.99.99')).toThrow(expected)
      expect(testWith('0.0.0')).toThrow(expected)
      expect(testWith('1.0.0')).toThrow(expected)
      expect(testWith('20.0.0')).toThrow(expected)
      expect(testWith('33.0.0')).not.toThrow()
    })

    it.each([
      ['35.0.0', '6.4.4', 36],
      ['36.1.2', '6.5.3', 37],
      ['37.0.5', '7.1.1', 38],
      ['38.6.0', '7.3.5', 39],
      ['39.89.82', '7.5.5', 40],
      ['40.2.3', '7.11.0', 42],
      ['42.2.0', '7.13.2', 43],
      ['43.0.3', '7.14.2', 44]
    ])('should return "%s" for SDK version %d', (expoVersion, expectedBugsnagVersion, expectedSdkVersion) => {
      const version = getBugsnagVersionForExpoVersion(expoVersion)

      expect(version.bugsnagVersion).toBe(expectedBugsnagVersion)
      expect(version.expoSdkVersion).toBe(expectedSdkVersion)
      expect(version.isLegacy).toBe(true)
    })

    it('should return null for unsupported SDK versions', () => {
      expect(getBugsnagVersionForExpoVersion('999.999.999')).toBeNull()
    })

    it('should return the correct @bugsnag/expo version for supported SDKs >= 44', () => {
      const version = getBugsnagVersionForExpoVersion('44.1.2')

      expect(version.bugsnagVersion).toBe('^44.0.0')
      expect(version.expoSdkVersion).toBe(44)
      expect(version.isLegacy).toBe(false)
    })
  })
})
