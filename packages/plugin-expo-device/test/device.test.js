const Client = require('@bugsnag/core/client')

describe('plugin: expo device', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('should extract the expected properties from expo/react native (android)', done => {
    const REACT_NATIVE_VERSION = '0.57.1'
    const SDK_VERSION = '32.0.0'
    const EXPO_VERSION = '2.10.6'
    const ANDROID_API_LEVEL = 28
    const ANDROID_VERSION = '8.0.0'

    jest.doMock('expo-constants', () => ({
      default: {
        installationId: '123',
        platform: { android: {} },
        expoConfig: { sdkVersion: SDK_VERSION },
        expoVersion: EXPO_VERSION,
        appOwnership: 'standalone'
      }
    }))
    jest.doMock('expo-device', () => ({
      manufacturer: 'Google',
      modelName: 'Pixel 4',
      isDevice: true,
      osVersion: ANDROID_VERSION
    }))
    jest.doMock('react-native', () => ({
      Dimensions: {
        addEventListener: function () {},
        get: function () {
          return { width: 1024, height: 768 }
        }
      },
      Platform: { OS: 'android', Version: ANDROID_API_LEVEL }
    }))
    jest.doMock('react-native/package.json', () => ({ version: REACT_NATIVE_VERSION }))

    const plugin = require('..')

    const c = new Client({ apiKey: 'api_key', plugins: [plugin] })
    const before = (new Date()).toISOString()
    c._setDelivery(client => ({
      sendEvent: (payload) => {
        const r = JSON.parse(JSON.stringify(payload))
        expect(r).toBeTruthy()
        expect(r.events[0].device).toBeTruthy()
        const now = (new Date()).toISOString()
        expect(now >= r.events[0].device.time).toBe(true)
        expect(before <= r.events[0].device.time).toBe(true)
        expect(r.events[0].device.manufacturer).toBe('Google')
        expect(r.events[0].device.model).toBe('Pixel 4')
        expect(r.events[0].device.modelNumber).toBe(undefined)
        expect(r.events[0].device.osName).toBe('android')
        expect(r.events[0].app.type).toEqual('android')
        expect(r.events[0].device.osVersion).toBe(ANDROID_VERSION)
        expect(r.events[0].device.runtimeVersions).toEqual({
          reactNative: REACT_NATIVE_VERSION,
          expoSdk: SDK_VERSION,
          expoApp: EXPO_VERSION,
          androidApiLevel: String(ANDROID_API_LEVEL)
        })
        expect(r.events[0].metaData.device.isDevice).toBe(true)
        expect(r.events[0].metaData.device.appOwnership).toBe('standalone')
        expect(r.events[0].device.id).toBe('123')
        expect(r.events[0].user.id).toBe('123')
        done()
      },
      sendSession: () => {}
    }))
    c.notify(new Error('device testing'))
  })

  it('should extract the expected properties from expo/react native (apple)', done => {
    const REACT_NATIVE_VERSION = '0.57.1'
    const SDK_VERSION = '32.3.0'
    const EXPO_VERSION = '2.10.4'
    const IOS_MODEL = 'iPhone 7 Plus'
    const IOS_PLATFORM = 'iPhone1,1'
    const IOS_VERSION = '11.2'

    jest.doMock('expo-constants', () => ({
      default: {
        platform: { ios: {} },
        expoConfig: { sdkVersion: SDK_VERSION },
        expoVersion: EXPO_VERSION,
        appOwnership: 'expo'
      }
    }))
    jest.doMock('expo-device', () => ({
      manufacturer: 'Apple',
      isDevice: false,
      modelName: IOS_MODEL,
      modelId: IOS_PLATFORM,
      osVersion: IOS_VERSION
    }))
    jest.doMock('react-native', () => ({
      Dimensions: {
        addEventListener: function () {},
        get: function () {
          return { width: 1024, height: 768 }
        }
      },
      Platform: { OS: 'ios' }
    }))
    jest.doMock('react-native/package.json', () => ({ version: REACT_NATIVE_VERSION }))

    const plugin = require('..')

    const c = new Client({ apiKey: 'api_key', plugins: [plugin] })
    const before = (new Date()).toISOString()
    c._setDelivery(client => ({
      sendEvent: (payload) => {
        const r = JSON.parse(JSON.stringify(payload))
        expect(r).toBeTruthy()
        expect(r.events[0].device).toBeTruthy()
        const now = (new Date()).toISOString()
        expect(now >= r.events[0].device.time).toBe(true)
        expect(before <= r.events[0].device.time).toBe(true)
        expect(r.events[0].device.manufacturer).toBe('Apple')
        expect(r.events[0].device.model).toBe(IOS_MODEL)
        expect(r.events[0].device.modelNumber).toBe(IOS_PLATFORM)
        expect(r.events[0].device.osName).toBe('ios')
        expect(r.events[0].app.type).toEqual('ios')
        expect(r.events[0].device.osVersion).toBe(IOS_VERSION)
        expect(r.events[0].device.runtimeVersions).toEqual({
          reactNative: REACT_NATIVE_VERSION,
          expoSdk: SDK_VERSION,
          expoApp: EXPO_VERSION
        })
        expect(r.events[0].metaData.device.isDevice).toBe(false)
        expect(r.events[0].metaData.device.appOwnership).toBe('expo')
        done()
      },
      sendSession: () => {}

    }))
    c.notify(new Error('device testing'))
  })

  it('does not overwrite app.type when one is already set', done => {
    const REACT_NATIVE_VERSION = '0.57.1'
    const SDK_VERSION = '32.3.0'
    const EXPO_VERSION = '2.10.4'

    jest.doMock('expo-constants', () => ({
      default: {
        platform: { ios: {} },
        expoConfig: { sdkVersion: SDK_VERSION },
        expoVersion: EXPO_VERSION,
        appOwnership: 'expo'
      }
    }))
    jest.doMock('expo-device', () => ({
      manufacturer: 'Apple',
      isDevice: true
    }))
    jest.doMock('react-native', () => ({
      Dimensions: {
        addEventListener: function () {},
        get: function () {
          return { width: 1024, height: 768 }
        }
      },
      Platform: { OS: 'ios' }
    }))
    jest.doMock('react-native/package.json', () => ({ version: REACT_NATIVE_VERSION }))

    const plugin = require('..')

    const c = new Client({ apiKey: 'api_key', plugins: [plugin], appType: 'custom app type' })
    c._setDelivery(client => ({
      sendEvent: (payload) => {
        const r = JSON.parse(JSON.stringify(payload))
        expect(r).toBeTruthy()
        expect(r.events[0].device).toBeTruthy()
        expect(r.events[0].device.osName).toBe('ios')
        expect(r.events[0].app.type).toEqual('custom app type')
        done()
      },
      sendSession: () => {}

    }))
    c.notify(new Error('device testing'))
  })

  it('does not overwrite user.id when one is already set', done => {
    const REACT_NATIVE_VERSION = '0.57.1'
    const SDK_VERSION = '32.3.0'
    const EXPO_VERSION = '2.10.4'

    jest.doMock('expo-constants', () => ({
      default: {
        installationId: '123',
        platform: { ios: {} },
        expoConfig: { sdkVersion: SDK_VERSION },
        expoVersion: EXPO_VERSION,
        appOwnership: 'expo'
      }
    }))
    jest.doMock('expo-device', () => ({
      manufacturer: 'Apple',
      isDevice: true
    }))
    jest.doMock('react-native', () => ({
      Dimensions: {
        addEventListener: function () {},
        get: function () {
          return { width: 1024, height: 768 }
        }
      },
      Platform: { OS: 'ios' }
    }))
    jest.doMock('react-native/package.json', () => ({ version: REACT_NATIVE_VERSION }))

    const plugin = require('..')

    const c = new Client({ apiKey: 'api_key', plugins: [plugin] })
    c.setUser('345')
    c._setDelivery(client => ({
      sendEvent: (payload) => {
        const r = JSON.parse(JSON.stringify(payload))
        expect(r).toBeTruthy()
        expect(r.events[0].device).toBeTruthy()
        expect(r.events[0].device.osName).toBe('ios')
        expect(r.events[0].user.id).toBe('345')
        done()
      },
      sendSession: () => {}

    }))
    c.notify(new Error('device testing'))
  })

  it('updates orientation when the screen dimensions change', done => {
    const REACT_NATIVE_VERSION = '0.57.1'
    const SDK_VERSION = '32.3.0'
    const EXPO_VERSION = '2.10.4'

    class Dimensions {
      constructor (w = 768, h = 1024) {
        this._listeners = { change: [] }
        this._set(w, h)
      }

      addEventListener (event, cb) {
        this._listeners[event].push(cb)
      }

      get (type) {
        expect(type).toBe('screen')
        return { width: this._width, height: this._height }
      }

      _set (w, h) {
        this._width = w
        this._height = h
        this._listeners.change.forEach(handler => handler({
          screen: this.get('screen'),
          window: {}
        }))
      }
    }

    const d = new Dimensions()

    jest.doMock('expo-constants', () => ({
      default: {
        platform: { ios: {} },
        expoConfig: { sdkVersion: SDK_VERSION },
        expoVersion: EXPO_VERSION,
        appOwnership: 'guest'
      }
    }))
    jest.doMock('expo-device', () => ({ isDevice: true }))

    jest.doMock('react-native', () => ({
      Dimensions: d,
      Platform: { OS: 'ios' }
    }))

    jest.doMock('react-native/package.json', () => ({ version: REACT_NATIVE_VERSION }))

    const plugin = require('..')

    const c = new Client({ apiKey: 'api_key', plugins: [plugin] })
    const events = []
    c._setDelivery(client => ({
      sendEvent: (payload) => {
        const r = JSON.parse(JSON.stringify(payload))
        events.push(r)
        if (events.length === 4) {
          expect(events[0].events[0].device.orientation).toBe('portrait')
          expect(events[1].events[0].device.orientation).toBe('landscape')
          expect(events[2].events[0].device.orientation).toBe('landscape')
          expect(events[3].events[0].device.orientation).toBe(undefined)
          done()
        }
      },
      sendSession: () => {}
    }))
    expect(d._listeners.change.length).toBe(1)
    c.notify(new Error('device testing'))
    d._set(1024, 768)
    c.notify(new Error('device testing'))
    d._set(1024, 100)
    c.notify(new Error('device testing'))
    d._set(100, 100)
    c.notify(new Error('device testing'))
  })
})
