const Device = require('expo-device')
const Constants = require('expo-constants').default
const { Dimensions, Platform } = require('react-native')
const rnVersion = require('react-native/package.json').version
const cuid = require('@bugsnag/cuid')
const SecureStore = require('expo-secure-store')

const DEVICE_ID_KEY = 'bugsnag-anonymous-id'

module.exports = {
  load: client => {
    let orientation
    const updateOrientation = () => {
      const { height, width } = Dimensions.get('screen')
      if (height > width) {
        orientation = 'portrait'
      } else if (height < width) {
        orientation = 'landscape'
      } else {
        orientation = undefined
      }
    }
    Dimensions.addEventListener('change', updateOrientation)

    // get the initial orientation
    updateOrientation()

    let deviceId
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      const storeOptions = {
        requireAuthentication: false,
        keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY
      }

      deviceId = SecureStore.getItem(DEVICE_ID_KEY, storeOptions)
      if (!deviceId || !cuid.isCuid(deviceId)) {
        deviceId = cuid()
        SecureStore.setItem(DEVICE_ID_KEY, deviceId, storeOptions)
      }
    }

    const device = {
      id: deviceId,
      manufacturer: Device.manufacturer,
      model: Device.modelName,
      modelNumber: Device.modelId || undefined,
      osName: Platform.OS,
      osVersion: Device.osVersion,
      runtimeVersions: {
        reactNative: rnVersion,
        expoApp: Constants.expoVersion,
        expoSdk: Constants.expoConfig?.sdkVersion,
        androidApiLevel: Platform.OS === 'android' ? String(Platform.Version) : undefined
      },
      totalMemory: Device.totalMemory
    }

    client.addOnSession(session => {
      session.device = { ...session.device, ...device }
      addDefaultAppType(session)
      addDefaultUserId(session)
    })

    client.addOnError(event => {
      event.device = { ...event.device, time: new Date(), orientation, ...device }
      event.addMetadata('device', {
        isDevice: Device.isDevice,
        appOwnership: Constants.appOwnership
      })
      addDefaultAppType(event)
      addDefaultUserId(event)
    }, true)
  }
}

function addDefaultAppType (eventOrSession) {
  // default app.type to device.osName
  if (eventOrSession.device && eventOrSession.device.osName) {
    eventOrSession.app = eventOrSession.app || {}

    if (!eventOrSession.app.type) {
      eventOrSession.app.type = eventOrSession.device.osName
    }
  }
}

function addDefaultUserId (eventOrSession) {
  // device id is also used to populate the user id field, if it's not already set
  const user = eventOrSession.getUser()
  if (!user || !user.id) {
    eventOrSession.setUser(eventOrSession.device.id)
  }
}
