# @bugnsnag/expo contributing guide

## Keeping dependencies in sync

The Expo notifier depends on some modules whose native code, if it exists, is bundled with Expo core. That means the version we depend on must match, otherwise we get conflicts and/or there are native/JS interface differences.

When a new version of the Expo SDK is released, the dependencies we use must be checked to see if they are up to date.

The following modules are currently used:

- `@react-native-community/netinfo` (`@bugsnag/delivery-expo`, `@bugsnsag/plugin-expo-connectivity-breadcrumbs`)
- `expo-application` (`@bugsnag/plugin-expo-app`)
- `expo-constants` (`@bugsnag/expo`, `@bugsnag/plugin-expo-app`, `@bugsnag/plugin-expo-device`)
- `expo-crypto` (`@bugsnag/expo`, `@bugsnag/delivery-expo`)
- `expo-device` (`@bugsnag/plugin-expo-device`)
- `expo-file-system` (`@bugsnag/delivery-expo`)

If you add a new dependency please add it to this list.

To check what native module versions are bundled with Expo, check this file:

https://github.com/expo/expo/blob/master/packages/expo/bundledNativeModules.json

## Updating the CLI to install a compatible notifier version

When a new Expo SDK is released, a new matching `@bugsnag/expo` version needs to be published. For example, for SDK 44 there is a `@bugsnag/expo` v44. To mark the new SDK as supported, update the CLI's `LATEST_SUPPORTED_EXPO_SDK` in [`packages/expo-cli/lib/version-information.js`](../expo-cli/lib/version-information.js)
