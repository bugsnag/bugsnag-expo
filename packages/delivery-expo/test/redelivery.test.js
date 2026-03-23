const Redelivery = require('../redelivery')

describe('delivery: expo -> redelivery', () => {
  let consumer

  afterEach(() => {
    if (consumer && typeof consumer.stop === 'function') consumer.stop()
    consumer = undefined
  })

  it('should attempt to dequeue (almost) immediately', done => {
    const send = (url, opts, cb) => {
      expect(url).toBe('https://notify.bugsnag.com')
      consumer.stop()
      cb()
      done()
    }
    const queue = {
      remove: () => {},
      peek: async () => {
        return {
          id: '/path/to/payload.json',
          payload: {
            url: 'https://notify.bugsnag.com',
            opts: {},
            retries: 0
          }
        }
      },
      enqueue: () => {}
    }
    consumer = new Redelivery(send, queue, () => {}, 1, 5)
    consumer.start()
  })

  it('should clear the timeout if nothing is found on the queue', done => {
    const send = (url, opts, cb) => {
      expect(url).toBe('https://notify.bugsnag.com')
      expect(nCalls).toBe(5)
      consumer.stop()
      done()
    }
    let nCalls = 0
    const queue = {
      remove: () => {},
      enqueue: () => {},
      peek: async () => {
        nCalls++
        if (nCalls < 5) {
          setTimeout(() => {
            expect(stopSpy).toHaveBeenCalled()
            done()
          }, 0)
          return null
        }
        return {
          id: '/path/to/payload.json',
          payload: {
            url: 'https://notify.bugsnag.com',
            opts: {},
            retries: 0
          }
        }
      }
    }
    consumer = new Redelivery(send, queue, () => {}, 1, 5)
    const stopSpy = jest.spyOn(consumer, 'stop')
    consumer.start()
  })

  it('should not remove something from the queue if it fails to send', done => {
    const send = (url, opts, cb) => {
      cb(new Error('derp'))
    }

    const req = {
      id: '/path/to/payload.json',
      payload: {
        url: 'https://notify.bugsnag.com',
        opts: {},
        retries: 0
      }
    }

    const queue = {
      remove: () => {},
      enqueue: () => {},
      peek: async () => req
    }

    const removeSpy = jest.spyOn(queue, 'remove')
    consumer = new Redelivery(send, queue, () => {}, 1, 5)
    consumer.start()
    setTimeout(() => {
      expect(removeSpy).not.toHaveBeenCalled()
      done()
    }, 5)
  })

  it('removes something from the queue if it fails in a non-retryable way', done => {
    let sendCalled = false
    const send = (url, opts, cb) => {
      sendCalled = true
      const err = new Error('derp')
      err.isRetryable = false
      cb(err)
    }

    const req = {
      id: '/path/to/payload.json',
      payload: {
        url: 'https://notify.bugsnag.com',
        opts: {},
        retries: 0
      }
    }

    const queue = {
      remove: () => {},
      enqueue: () => {},
      peek: async () => req
    }

    let removedWith = null
    queue.remove = (id) => { removedWith = id }
    consumer = new Redelivery(send, queue, () => {}, 1, 5)
    consumer.start()
    setTimeout(() => {
      expect(sendCalled).toBe(true)
      expect(removedWith).toBe('/path/to/payload.json')
      consumer.stop()
      done()
    }, 5)
  })

  it('removes something from the queue if it reaches the maximum retries', done => {
    const send = (url, opts, cb) => {
      const err = new Error('derp')
      cb(err)
    }

    const req = {
      id: '/path/to/payload.json',
      payload: {
        url: 'https://notify.bugsnag.com',
        opts: {},
        retries: 5
      }
    }

    const queue = {
      remove: () => {},
      peek: async () => req
    }

    let removedWith = null
    queue.remove = (id) => { removedWith = id }
    consumer = new Redelivery(send, queue, () => {}, 1, 5)
    consumer.start()
    setTimeout(() => {
      expect(removedWith).toBe('/path/to/payload.json')
      consumer.stop()
      done()
    }, 5)
  })
})
