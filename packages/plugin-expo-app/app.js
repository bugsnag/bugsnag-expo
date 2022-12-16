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

    let nativeBundleVersion, nativeVersionCode, bundleVersion, versionCode

    if (Constants.appOwnership !== 'expo') {
      if (Constants.platform.ios) {
        nativeBundleVersion = Application.nativeBuildVersion
        bundleVersion = Application.nativeBuildVersion
      }

      if (Constants.platform.android) {
        nativeVersionCode = Application.nativeBuildVersion
        versionCode = Application.nativeBuildVersion
      }
    }

    client.addOnSession(session => {
      if (client._config.codeBundleId) {
        session.app.codeBundleId = client._config.codeBundleId
      }
      if (versionCode) {
        session.app.versionCode = versionCode
      } else if (bundleVersion) {
        session.app.bundleVersion = bundleVersion
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

      event.addMetadata('app', { nativeBundleVersion, nativeVersionCode, bundleVersion, versionCode })
    }, true)
  }
}
