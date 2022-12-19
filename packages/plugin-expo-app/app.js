const Application = require('expo-application')
const Constants = require('expo-constants').default
const { AppState } = require('react-native')

const appStart = new Date()

module.exports = {
  load: client => {
    let lastEnteredForeground = appStart
    let lastState = AppState.currentState

    AppState.addEventListener('change', newState => {
      if (newState === 'active' && lastState !== 'active') {
        lastEnteredForeground = new Date()
      }
      lastState = newState
    })

    let bundleVersion, versionCode

    if (Constants.appOwnership !== 'expo') {
      if (Constants.platform.ios) {
        bundleVersion = Application.nativeBuildVersion
      } else if (Constants.platform.android) {
        versionCode = Application.nativeBuildVersion
      }
    }

    client.addOnSession(session => {
      session.app.versionCode = versionCode
      session.app.bundleVersion = bundleVersion

      if (client._config.codeBundleId) {
        session.app.codeBundleId = client._config.codeBundleId
      }
    })

    client.addOnError(event => {
      const now = new Date()
      const inForeground = AppState.currentState === 'active'

      event.app.inForeground = inForeground
      event.app.duration = now - appStart

      if (inForeground) {
        event.app.durationInForeground = now - lastEnteredForeground
      }

      if (client._config.codeBundleId) {
        event.app.codeBundleId = client._config.codeBundleId
      }

      event.app.versionCode = versionCode
      event.app.bundleVersion = bundleVersion

      event.addMetadata('app', { nativeBundleVersion: bundleVersion, nativeVersionCode: versionCode })
    }, true)
  }
}
