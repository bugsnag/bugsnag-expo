const process = require('process')

module.exports = {
  onCancel: () => process.exit(),
  DEPENDENCIES: [
    '@react-native-community/netinfo',
    'expo-application',
    'expo-constants',
    'expo-crypto',
    'expo-device',
    'expo-file-system'
  ]
}
