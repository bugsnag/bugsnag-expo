/**
 * @jest-environment jsdom
 */

const delivery = require('@bugsnag/delivery-expo')

jest.mock('expo-constants', () => ({
  default: {
    platform: {},
    expoConfig: {},
    expoGoConfig: null
  }
}))

jest.mock('../../plugin-expo-device/node_modules/expo-constants', () => ({
  default: {
    platform: {},
    expoConfig: {},
    expoGoConfig: null
  }
}))

jest.mock('../../plugin-expo-app/node_modules/expo-application', () => ({}))

jest.mock('../../plugin-expo-app/node_modules/expo-constants', () => ({
  default: {
    platform: {},
    expoConfig: {},
    expoGoConfig: null
  }
}))

jest.mock('@bugsnag/delivery-expo')
jest.mock('../../delivery-expo/node_modules/expo-crypto', () => ({}))

jest.mock('react-native', () => ({
  NativeModules: {
    BugsnagReactNative: {
      configure: jest.fn(() => ({
        apiKey: '030bab153e7c2349be364d23b5ae93b5'
      })),
      updateCodeBundleId: jest.fn(),
      resumeSession: jest.fn(),
      leaveBreadcrumb: jest.fn(),
      getPayloadInfo: jest.fn().mockReturnValue({}),
      dispatch: jest.fn().mockResolvedValue(true)
    }
  },
  Dimensions: {
    addEventListener: function () {},
    get: function () {
      return { width: 1024, height: 768 }
    }
  },
  AppState: {
    addEventListener: jest.fn(),
    currentState: 'active'
  },
  Platform: {
    OS: 'android'
  }
}))

jest.mock('../../delivery-expo/node_modules/expo-file-system', () => ({
  cacheDirectory: 'file://var/data/foo.bar.app/',
  downloadAsync: jest.fn(() => Promise.resolve({ md5: 'md5', uri: 'uri' })),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, md5: 'md5', uri: 'uri' })),
  readAsStringAsync: jest.fn(() => Promise.resolve()),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  readDirectoryAsync: jest.fn(() => Promise.resolve()),
  createDownloadResumable: jest.fn(() => Promise.resolve())
}))

jest.mock('../../delivery-expo/node_modules/@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: () => Promise.resolve({ isConnected: true })
}))

jest.mock('../../plugin-expo-connectivity-breadcrumbs/node_modules/@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: () => Promise.resolve({ isConnected: true })
}))

jest.doMock('../../plugin-expo-device/node_modules/expo-device', () => ({
  manufacturer: 'Google',
  modelName: 'Pixel 4'
}))

global.ErrorUtils = {
  setGlobalHandler: jest.fn(),
  getGlobalHandler: jest.fn()
}

const API_KEY = '030bab153e7c2349be364d23b5ae93b5'

describe('expo notifier', () => {
  let Bugsnag
  let _delivery

  beforeAll(() => {
    jest.spyOn(console, 'debug').mockImplementation(() => {})
  })

  beforeEach(() => {
    delivery.mockImplementation(() => {
      _delivery = {
        sendSession: jest.fn((p, cb) => { cb && cb() }),
        sendEvent: jest.fn((p, cb) => { cb && cb() })
      }
      return _delivery
    })

    jest.isolateModules(() => {
      Bugsnag = require('..')
    })
  })

  describe('isStarted property', () => {
    it('returns false when Bugsnag has not been initialised', () => {
      expect(Bugsnag.isStarted()).toBe(false)
    })
    it('returns true when Bugsnag has been initialised', () => {
      Bugsnag.start({ apiKey: API_KEY })
      expect(Bugsnag.isStarted()).toBe(true)
    })
  })

  it('accepts plugins', () => {
    Bugsnag.start({
      apiKey: API_KEY,
      plugins: [{
        name: 'foobar',
        load: client => 10
      }]
    })
    expect(Bugsnag.getPlugin('foobar')).toBe(10)
  })

  it('notifies handled errors', (done) => {
    Bugsnag.start({
      apiKey: API_KEY,
      appVersion: '1.2.3',
      codeBundleId: '691f4728-4bf5-4da3-a954-ea9a10fa17d2',
      appType: 'worker',
      autoDetectErrors: true,
      enabledErrorTypes: {
        unhandledExceptions: true,
        unhandledRejections: true
      },
      onError: [
        event => true
      ],
      onBreadcrumb: () => false,
      onSession: () => true,
      endpoints: { notify: 'https://notify.bugsnag.com', sessions: 'https://sessions.bugsnag.com' },
      autoTrackSessions: true,
      enabledReleaseStages: ['production'],
      releaseStage: 'production',
      maxBreadcrumbs: 20,
      enabledBreadcrumbTypes: ['manual', 'log', 'request'],
      user: null,
      metadata: {},
      logger: undefined,
      redactedKeys: ['foo', /bar/]
    })

    const onError = jest.fn()

    Bugsnag.notify(new Error('123'), onError, () => {
      expect(onError).toHaveBeenCalled()

      expect(_delivery.sendSession).toHaveBeenCalledWith(expect.objectContaining({
        app: expect.objectContaining({ releaseStage: 'production', version: '1.2.3', type: 'worker', codeBundleId: '691f4728-4bf5-4da3-a954-ea9a10fa17d2' }),
        device: expect.objectContaining({ manufacturer: 'Google', model: 'Pixel 4', modelNumber: undefined, osName: 'android', totalMemory: undefined }),
        sessions: expect.arrayContaining([expect.objectContaining({ id: expect.any(String), startedAt: expect.any(Date) })])
      }))

      expect(_delivery.sendEvent).toHaveBeenCalledWith(expect.objectContaining({
        apiKey: '030bab153e7c2349be364d23b5ae93b5',
        events: expect.arrayContaining([
          expect.objectContaining({
            app: expect.objectContaining({ releaseStage: 'production', version: '1.2.3', type: 'worker', codeBundleId: '691f4728-4bf5-4da3-a954-ea9a10fa17d2' }),
            breadcrumbs: [],
            device: expect.objectContaining({ manufacturer: 'Google', model: 'Pixel 4', modelNumber: undefined, osName: 'android', totalMemory: undefined }),
            errors: expect.arrayContaining([
              expect.objectContaining({
                errorClass: 'Error',
                errorMessage: '123',
                stacktrace: expect.any(Array)
              })
            ])
          })
        ]),
        notifier: { name: 'Bugsnag Expo', url: 'https://github.com/bugsnag/bugsnag-expo', version: expect.any(String) }
      }), expect.any(Function))
      done()
    })
  })

  it('sets a default value for app.type correctly (android)', (done) => {
    Bugsnag.start({
      apiKey: API_KEY,
      appVersion: '1.2.3',
      releaseStage: 'production'
    })

    Bugsnag.notify(new Error('123'), () => {}, () => {
      expect(_delivery.sendSession).toHaveBeenCalledWith(expect.objectContaining({
        app: expect.objectContaining({ releaseStage: 'production', version: '1.2.3', type: 'android' }),
        device: expect.objectContaining({ manufacturer: 'Google', model: 'Pixel 4', modelNumber: undefined, osName: 'android', totalMemory: undefined }),
        sessions: expect.arrayContaining([expect.objectContaining({ id: expect.any(String), startedAt: expect.any(Date) })])
      }))

      expect(_delivery.sendEvent).toHaveBeenCalledWith(expect.objectContaining({
        apiKey: '030bab153e7c2349be364d23b5ae93b5',
        events: expect.arrayContaining([
          expect.objectContaining({
            app: expect.objectContaining({ releaseStage: 'production', version: '1.2.3', type: 'android' }),
            breadcrumbs: [],
            device: expect.objectContaining({ manufacturer: 'Google', model: 'Pixel 4', modelNumber: undefined, osName: 'android', totalMemory: undefined }),
            errors: expect.arrayContaining([
              expect.objectContaining({
                errorClass: 'Error',
                errorMessage: '123',
                stacktrace: expect.any(Array)
              })
            ])
          })
        ]),
        notifier: { name: 'Bugsnag Expo', url: 'https://github.com/bugsnag/bugsnag-expo', version: expect.any(String) }
      }), expect.any(Function))

      done()
    })
  })

  describe('configuration', () => {
    beforeEach(() => {
      jest.resetModules()
    })

    it('sets a default value for releaseStage correctly (production)', () => {
      jest.mock('expo-constants', () => ({
        default: {
          platform: {},
          expoConfig: {},
          expoGoConfig: null
        }
      }))

      const config = require('../src/config')
      expect(config.releaseStage.defaultValue()).toBe('production')
    })

    it('sets a default value for releaseStage correctly (local-dev)', () => {
      jest.mock('expo-constants', () => ({
        default: {
          platform: {},
          expoConfig: null,
          expoGoConfig: {
            developer: {
              tool: 'expo-cli'
            }
          }
        }
      }))

      global.__DEV__ = true
      const config = require('../src/config')
      expect(config.releaseStage.defaultValue()).toBe('local-dev')
    })

    it('sets a default value for releaseStage correctly (local-prod)', () => {
      jest.mock('expo-constants', () => ({
        default: {
          platform: {},
          expoConfig: {
            developer: {
              tool: 'expo-cli'
            }
          },
          expoGoConfig: null
        }
      }))

      global.__DEV__ = false
      const config = require('../src/config')
      expect(config.releaseStage.defaultValue()).toBe('local-prod')
    })
  })
})
