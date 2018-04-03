const name = 'Bugsnag Expo'
const version = '__VERSION__'
const url = 'https://github.com/bugsnag/bugsnag-expo'

const jsonStringify = require('fast-safe-stringify')
const Client = require('bugsnag-js/base/client')
const { isoDate } = require('bugsnag-js/base/lib/es-utils')

const pluginGlobalErrorHandler = {
  init: (client) => {
    if (ErrorUtils) {
      const handler = (error, isFatal) => {
        const handledState = { severity: 'error', unhandled: true, severityReason: { type: 'unhandledException' } }
        let report = new client.BugsnagReport(error.name, error.message, error.stack, handledState)

        client.notify(report)

        if (typeof prevHandler === 'function') {
          prevHandler(error, isFatal)
        }
      }
      const prevHandler = ErrorUtils.getGlobalHandler()
      ErrorUtils.setGlobalHandler(handler)
    }
  }
}

const xmlHttpRequestTransport = {
  name: 'XMLHttpRequest',
  sendReport: (logger, config, report, cb = () => {}) => {
    const url = config.endpoint
    const req = new XMLHttpRequest()
    req.onreadystatechange = () => {
        if (req.readyState === XMLHttpRequest.DONE) {
          cb(null, req.responseText)
        }
    }
    req.open('POST', url)
    req.setRequestHeader('Content-Type', 'application/json')
    req.setRequestHeader('Bugsnag-Api-Key', report.apiKey || config.apiKey)
    req.setRequestHeader('Bugsnag-Payload-Version', '4.0')
    req.setRequestHeader('Bugsnag-Sent-At', isoDate())
    try {
      req.send(jsonStringify(report))
    } catch (e) {
      throw e
    }
  },
  sendSession: (logger, config, session, cd = () => {}) => {
    cb(null, "")
  }
}

const bugsnag = new Client({ name, version, url })
bugsnag.transport(xmlHttpRequestTransport)
bugsnag.use(pluginGlobalErrorHandler)

module.exports = (opts) => {
  return bugsnag.configure(opts)
}
module.exports['default'] = module.exports
