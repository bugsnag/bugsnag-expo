# Changelog

## TBD

### Enhancements

- Added `Bugsnag.isStarted()` to check whether Bugsnag has initialized [#34](https://github.com/bugsnag/bugsnag-expo/pull/34)
- (expo) Add promise v8 as a peer dependency [#80](https://github.com/bugsnag/bugsnag-expo/pull/80)

### Fixes

- (bugsnag-expo-cli) Fix issue with automated installation when using app.config.js [#74](https://github.com/bugsnag/bugsnag-expo/pull/74)

## v44.0.1 (2022-05-12)

### Fixes

- Fixed an issue in the `bugsnag-expo-cli` install script when reporting an unsupported version of expo [#31](https://github.com/bugsnag/bugsnag-expo/pull/31)

## v44.0.0 (2022-04-19)

This release marks a change in the version scheme used by `@bugsnag/expo` and a move to its own repo, [`bugsnag-expo`](https://github.com/bugsnag/bugsnag-expo)

From this version onwards, `@bugsnag/expo` will match the Expo SDK version number. For example, `@bugsnag/expo` v44 supports Expo SDK 44. When updating to a new Expo SDK version, you should also update `@bugsnag/expo`

### Breaking Changes

- `@bugsnag/expo` now uses peer dependencies for the Expo packages it depends on. Run the bugsnag-expo-cli to add these dependencies to your project:

    ```
    $ npx bugsnag-expo-cli install
    ```

    Alternatively, you can use `expo install`:

    ```
    $ expo install @react-native-community/netinfo expo-application expo-constants expo-crypto expo-device expo-file-system
    ```
