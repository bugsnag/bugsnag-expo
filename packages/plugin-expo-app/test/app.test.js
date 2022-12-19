const Client = require('@bugsnag/core/client')

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
    currentState: 'active'
  }
}))

describe('plugin: expo app', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('should record nativeVersionCode and versionCode on android', done => {
    const VERSION_CODE = '1.0'

    jest.doMock('expo-application', () => ({ nativeBuildVersion: VERSION_CODE }))
    jest.doMock('expo-constants', () => ({
      default: {
        platform: {
          android: {}
        },
        manifest: { version: '1.0.0' },
        appOwnership: null
      }
    }))

    const plugin = require('..')

    const c = new Client({ apiKey: 'api_key', plugins: [plugin] })

    c._sessionDelegate = {
      startSession: (client, session) => {
        client._delivery.sendSession(session)
      }
    }

    c._setDelivery(client => ({
      sendEvent: (payload) => {
        const r = JSON.parse(JSON.stringify(payload))
        expect(r).toBeTruthy()
        expect(r.events[0].metaData.app.nativeVersionCode).toBe(VERSION_CODE)
        expect(r.events[0].metaData.app.versionCode).toBe(VERSION_CODE)
        done()
      },
      sendSession: (session) => {
        expect(session).toBeTruthy()
        expect(session.app.versionCode).toBe(VERSION_CODE)
      }
    }))
    c.startSession()
    c.notify(new Error('flip'))
  })

  it('should record nativeBundleVersion and bundleVersion on ios', done => {
    const BUNDLE_VERSION = '1.0'

    jest.doMock('expo-application', () => ({ nativeBuildVersion: BUNDLE_VERSION }))
    jest.doMock('expo-constants', () => ({
      default: {
        platform: {
          ios: {}
        },
        manifest: { version: '1.0.0' },
        appOwnership: null
      }
    }))

    const plugin = require('..')

    const c = new Client({ apiKey: 'api_key', plugins: [plugin] })

    c._sessionDelegate = {
      startSession: (client, session) => {
        client._delivery.sendSession(session)
      }
    }

    c._setDelivery(client => ({
      sendEvent: (payload) => {
        const r = JSON.parse(JSON.stringify(payload))
        expect(r).toBeTruthy()
        expect(r.events[0].metaData.app.nativeBundleVersion).toBe(BUNDLE_VERSION)
        expect(r.events[0].metaData.app.bundleVersion).toBe(BUNDLE_VERSION)
        done()
      },
      sendSession: (session) => {
        expect(session).toBeTruthy()
        expect(session.app.bundleVersion).toBe(BUNDLE_VERSION)
      }
    }))
    c.startSession()
    c.notify(new Error('flip'))
  })

  it('detects whether the app is inForeground', done => {
    const AppState = {
      addEventListener: jest.fn(),
      currentState: 'active'
    }

    jest.doMock('expo-application', () => ({}))
    jest.doMock('expo-constants', () => ({
      default: {
        platform: {},
        manifest: {}
      }
    }))

    jest.doMock('react-native', () => ({
      AppState
    }))

    const plugin = require('..')

    const c = new Client({ apiKey: 'api_key', plugins: [plugin] })

    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

    const listener = AppState.addEventListener.mock.calls[0][1]

    const events = []
    c._setDelivery(client => ({
      sendEvent: (payload) => {
        const r = JSON.parse(JSON.stringify(payload))
        expect(r).toBeTruthy()
        events.push(r)
        if (events.length < 3) return
        expect(events[0].events[0].app.inForeground).toBe(true)
        expect(events[1].events[0].app.inForeground).toBe(false)
        expect(events[2].events[0].app.inForeground).toBe(true)
        done()
      },
      sendSession: () => {}
    }))
    c.notify(new Error('flip'))
    setTimeout(() => {
      listener('inactive')
      AppState.currentState = 'inactive'
      c.notify(new Error('flop'))
      setTimeout(() => {
        listener('active')
        AppState.currentState = 'active'
        c.notify(new Error('flooop'))
      }, 20)
    }, 20)
  })

  it('includes duration in event.app', done => {
    const start = Date.now()

    jest.doMock('expo-application', () => ({}))
    jest.doMock('expo-constants', () => ({
      default: {
        platform: {},
        manifest: {}
      }
    }))

    const plugin = require('..')

    const client = new Client({ apiKey: 'api_key', plugins: [plugin] })

    // Delay sending the notification by this many milliseconds to ensure
    // 'duration' will always have a useful value
    const delayMs = 10

    client._setDelivery(client => ({
      sendEvent: (payload) => {
        // The maximum number of milliseconds 'duration' should be
        const maximum = Date.now() - start

        expect(payload.events[0].app.duration).toBeGreaterThanOrEqual(delayMs)
        expect(payload.events[0].app.duration).toBeLessThanOrEqual(maximum)

        done()
      },
      sendSession: () => {}
    }))

    setTimeout(() => client.notify(new Error('flooopy doo')), delayMs)
  })

  it('should record codeBundleId if configured', done => {
    const CODE_BUNDLE_ID = '691f4728-4bf5-4da3-a954-ea9a10fa17d2'

    jest.doMock('expo-application', () => ({}))
    jest.doMock('expo-constants', () => ({
      default: {
        platform: {},
        manifest: {}
      }
    }))

    const plugin = require('..')

    const c = new Client({ apiKey: 'api_key', plugins: [plugin] })
    c._config.codeBundleId = CODE_BUNDLE_ID

    c._sessionDelegate = {
      startSession: (client, session) => {
        client._delivery.sendSession(session)
      }
    }

    c._setDelivery(client => ({
      sendEvent: (payload) => {
        const r = JSON.parse(JSON.stringify(payload))
        expect(r).toBeTruthy()
        expect(r.events[0].app.codeBundleId).toBe(CODE_BUNDLE_ID)
        done()
      },
      sendSession: (session) => {
        expect(session).toBeTruthy()
        expect(session.app.codeBundleId).toBe(CODE_BUNDLE_ID)
      }
    }))
    c.startSession()
    c.notify(new Error('flip'))
  })

  it('should not record codeBundleId if not configured', done => {
    jest.doMock('expo-application', () => ({}))
    jest.doMock('expo-constants', () => ({
      default: {
        platform: {},
        manifest: {}
      }
    }))

    const plugin = require('..')

    const c = new Client({ apiKey: 'api_key', plugins: [plugin] })

    c._sessionDelegate = {
      startSession: (client, session) => {
        client._delivery.sendSession(session)
      }
    }

    c._setDelivery(client => ({
      sendEvent: (payload) => {
        const r = JSON.parse(JSON.stringify(payload))
        expect(r).toBeTruthy()
        expect(r.events[0].app.codeBundleId).toBe(undefined)
        done()
      },
      sendSession: (session) => {
        expect(session).toBeTruthy()
        expect(session.app.codeBundleId).toBe(undefined)
      }
    }))
    c.startSession()
    c.notify(new Error('flip'))
  })
})
