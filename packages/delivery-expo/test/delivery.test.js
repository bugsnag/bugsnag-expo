const fetch = require('node-fetch')
const http = require('http')
const delivery = require('../')
const UndeliveredPayloadQueue = require('../queue')
const NetworkStatus = require('../network-status')
const RedeliveryLoop = require('../redelivery')

const noopLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}

jest.mock('expo-file-system', () => ({
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

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA1: 'sha1' },
  digestStringAsync: jest.fn((algorithm, input) => {
    if (algorithm === 'sha1') {
      return Promise.resolve(input)
    }

    return Promise.reject(new Error(`Invalid algorithm '${algorithm}'`))
  })
}))

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: () => new Promise(resolve => setTimeout(() => resolve({ isConnected: true }), 1))
}))

jest.mock('../queue')
jest.mock('../redelivery')
jest.mock('../network-status')

const mockServer = (statusCode = 200) => {
  const requests = []
  return {
    requests,
    server: http.createServer((req, res) => {
      let body = ''
      req.on('data', b => { body += b })
      req.on('end', () => {
        requests.push({
          url: req.url,
          method: req.method,
          headers: req.headers,
          body
        })
        res.statusCode = statusCode
        res.end(http.STATUS_CODES[statusCode])
      })
    })
  }
}

describe('delivery: expo', () => {
  let enqueueSpy

  beforeEach(() => {
    enqueueSpy = jest.fn().mockResolvedValue(true)

    UndeliveredPayloadQueue.mockImplementation(() => ({
      init: () => Promise.resolve(true),
      enqueue: enqueueSpy
    }))

    NetworkStatus.mockImplementation(() => ({
      isConnected: true,
      watch: fn => { fn(true) }
    }))
  })

  it('sends events successfully', done => {
    const { requests, server } = mockServer()
    server.listen(err => {
      expect(err).toBeUndefined()

      const payload = {
        events: [{ errors: [{ errorClass: 'Error', errorMessage: 'foo is not a function' }] }]
      }

      const config = {
        apiKey: 'aaaaaaaa',
        endpoints: { notify: `http://0.0.0.0:${server.address().port}/notify/` },
        redactedKeys: []
      }

      delivery({ _config: config, _logger: noopLogger }, fetch).sendEvent(payload, (err) => {
        expect(err).toBe(null)
        expect(requests.length).toBe(1)
        expect(requests[0].method).toBe('POST')
        expect(requests[0].url).toMatch('/notify/')
        expect(requests[0].headers['content-type']).toEqual('application/json')
        expect(requests[0].headers['bugsnag-api-key']).toEqual('aaaaaaaa')
        expect(requests[0].headers['bugsnag-integrity']).toEqual('sha1 {"events":[{"errors":[{"errorClass":"Error","errorMessage":"foo is not a function"}]}]}')
        expect(requests[0].headers['bugsnag-payload-version']).toEqual('4')
        expect(requests[0].headers['bugsnag-sent-at']).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        expect(requests[0].body).toBe(JSON.stringify(payload))

        server.close()
        done()
      })
    })
  })

  it('sends sessions successfully', done => {
    const { requests, server } = mockServer(202)
    server.listen(err => {
      expect(err).toBeUndefined()

      const payload = {
        events: [{ errors: [{ errorClass: 'Error', errorMessage: 'foo is not a function' }] }]
      }

      const config = {
        apiKey: 'aaaaaaaa',
        endpoints: { notify: 'blah', sessions: `http://0.0.0.0:${server.address().port}/sessions/` },
        redactedKeys: []
      }

      delivery({ _config: config, _logger: noopLogger }, fetch).sendSession(payload, (err) => {
        expect(err).toBe(null)
        expect(requests.length).toBe(1)
        expect(requests[0].method).toBe('POST')
        expect(requests[0].url).toMatch('/sessions/')
        expect(requests[0].headers['content-type']).toEqual('application/json')
        expect(requests[0].headers['bugsnag-api-key']).toEqual('aaaaaaaa')
        expect(requests[0].headers['bugsnag-integrity']).toEqual('sha1 {"events":[{"errors":[{"errorClass":"Error","errorMessage":"foo is not a function"}]}]}')
        expect(requests[0].headers['bugsnag-payload-version']).toEqual('1')
        expect(requests[0].headers['bugsnag-sent-at']).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        expect(requests[0].body).toBe(JSON.stringify(payload))

        server.close()
        done()
      })
    })
  })

  it('handles errors gracefully (ECONNREFUSED)', done => {
    const payload = {
      events: [{ errors: [{ errorClass: 'Error', errorMessage: 'foo is not a function' }] }]
    }

    const config = {
      apiKey: 'aaaaaaaa',
      endpoints: { notify: 'http://0.0.0.0:9999/notify/' },
      redactedKeys: []
    }

    let didLog = false
    const log = () => { didLog = true }

    delivery({ _config: config, _logger: { error: log, info: () => {} } }, fetch).sendEvent(payload, (err) => {
      expect(didLog).toBe(true)
      expect(err).toBeTruthy()
      expect(err.code).toBe('ECONNREFUSED')
      expect(enqueueSpy).toHaveBeenCalled()
      done()
    })
  })

  it('handles errors gracefully (400)', done => {
    const { requests, server } = mockServer(400)
    server.listen(err => {
      expect(err).toBeUndefined()

      const payload = {
        events: [{ errors: [{ errorClass: 'Error', errorMessage: 'foo is not a function' }] }]
      }

      const config = {
        apiKey: 'aaaaaaaa',
        endpoints: { notify: `http://0.0.0.0:${server.address().port}/notify/` },
        redactedKeys: []
      }

      let didLog = false
      const log = () => { didLog = true }

      delivery({ _config: config, _logger: { error: log, info: () => {} } }, fetch).sendEvent(payload, (err) => {
        expect(didLog).toBe(true)
        expect(enqueueSpy).not.toHaveBeenCalled()
        expect(err).toBeTruthy()
        expect(requests.length).toBe(1)
        server.close()
        done()
      })
    })
  })

  it('handles errors gracefully for sessions (ECONNREFUSED)', done => {
    const payload = {
      events: [{ errors: [{ errorClass: 'Error', errorMessage: 'foo is not a function' }] }]
    }

    const config = {
      apiKey: 'aaaaaaaa',
      endpoints: { sessions: 'http://0.0.0.0:9999/sessions/' },
      redactedKeys: []
    }

    let didLog = false
    const log = () => { didLog = true }

    delivery({ _config: config, _logger: { error: log, info: () => {} } }, fetch).sendSession(payload, (err) => {
      expect(didLog).toBe(true)
      expect(err).toBeTruthy()
      expect(err.code).toBe('ECONNREFUSED')
      expect(enqueueSpy).toHaveBeenCalled()
      done()
    })
  })

  it('handles errors gracefully (socket hang up)', done => {
    const server = http.createServer((req, res) => {
      req.connection.destroy()
    })

    server.listen(err => {
      expect(err).toBeFalsy()

      const payload = {
        events: [{ errors: [{ errorClass: 'Error', errorMessage: 'foo is not a function' }] }]
      }

      const config = {
        apiKey: 'aaaaaaaa',
        endpoints: { notify: `http://0.0.0.0:${server.address().port}/notify/` },
        redactedKeys: []
      }

      let didLog = false
      const log = () => { didLog = true }

      delivery({ _config: config, _logger: { error: log, info: () => {} } }, fetch).sendEvent(payload, (err) => {
        expect(didLog).toBe(true)
        expect(err).toBeTruthy()
        expect(err.code).toBe('ECONNRESET')
        expect(enqueueSpy).toHaveBeenCalled()

        server.close()
        done()
      })
    })
  })

  it('handles errors gracefully (HTTP 503)', done => {
    const server = http.createServer((req, res) => {
      res.statusCode = 503
      res.end('NOT OK')
    })

    server.listen(err => {
      expect(err).toBeFalsy()

      const payload = {
        events: [{ errors: [{ errorClass: 'Error', errorMessage: 'foo is not a function' }] }]
      }

      const config = {
        apiKey: 'aaaaaaaa',
        endpoints: { notify: `http://0.0.0.0:${server.address().port}/notify/` },
        redactedKeys: []
      }

      let didLog = false
      const log = () => { didLog = true }

      delivery({ _config: config, _logger: { error: log, info: () => {} } }, fetch).sendEvent(payload, (err) => {
        expect(didLog).toBe(true)
        expect(err).toBeTruthy()
        expect(enqueueSpy).toHaveBeenCalled()

        server.close()
        done()
      })
    })
  })

  it('does not send an event marked with event.attemptImmediateDelivery=false', done => {
    const payload = {
      events: [{ errors: [{ errorClass: 'Error', errorMessage: 'foo is not a function' }] }],
      attemptImmediateDelivery: false
    }

    const config = {
      apiKey: 'aaaaaaaa',
      endpoints: { notify: 'https://some-address.com' },
      redactedKeys: []
    }

    delivery({ _config: config, _logger: noopLogger }, fetch).sendEvent(payload, (err) => {
      expect(err).not.toBeTruthy()
      expect(enqueueSpy).toHaveBeenCalled()
      done()
    })
  })

  // eslint-disable-next-line jest/expect-expect
  it('starts the redelivery loop if there is a connection', done => {
    RedeliveryLoop.mockImplementation(() => ({
      start: done
    }))

    delivery({ _logger: noopLogger }, fetch)
  })

  it('stops the redelivery loop if there is not a connection', done => {
    const startSpy = jest.fn()
    const stopSpy = jest.fn()

    RedeliveryLoop.mockImplementation(() => ({
      start: startSpy,
      stop: stopSpy
    }))

    let watcher

    NetworkStatus.mockImplementation(() => ({
      isConnected: false,
      watch: fn => {
        watcher = fn
        onWatch()
      }
    }))

    delivery({ _logger: noopLogger }, fetch)

    const onWatch = () => {
      expect(typeof watcher).toBe('function')
      watcher(true)
      expect(startSpy).toHaveBeenCalled()
      expect(stopSpy).not.toHaveBeenCalled()
      watcher(false)
      expect(stopSpy).toHaveBeenCalled()
      done()
    }
  })

  it('doesn’t attempt to send when not connected', done => {
    NetworkStatus.mockImplementation(() => ({
      isConnected: false,
      watch: () => {}
    }))

    const payload = {
      events: [{ errors: [{ errorClass: 'Error', errorMessage: 'foo is not a function' }] }]
    }

    const config = {
      apiKey: 'aaaaaaaa',
      endpoints: { notify: 'http://some-address.com' },
      redactedKeys: []
    }

    const d = delivery({ _config: config, _logger: noopLogger }, fetch)

    d.sendEvent(payload, (err) => {
      expect(err).not.toBeTruthy()
      expect(enqueueSpy).toHaveBeenCalledTimes(1)

      d.sendSession(payload, (err) => {
        expect(err).not.toBeTruthy()
        expect(enqueueSpy).toHaveBeenCalledTimes(2)
        done()
      })
    })
  })
})
