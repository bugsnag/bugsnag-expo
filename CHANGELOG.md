# Changelog

## TBD

### Fixed

- (bugsnag-expo-cli) CLI tool now installs a sourcemap plugin version that matches the Expo SDK version [#111](https://github.com/bugsnag/bugsnag-expo/pull/111)
- (plugin-expo-eas-sourcemaps) Use EAS Build lifecycle hook for Android source map uploads [#112](https://github.com/bugsnag/bugsnag-expo/pull/112)

## v47.1.1 (2023-03-02)

(plugin-expo-eas-sourcemaps) Restrict Bugsnag Android Gradle Plugin dependency to v7 [#104](https://github.com/bugsnag/bugsnag-expo/pull/104)

## v47.1.0 (2023-01-09)

### Fixed

- Fixed an issue with source map matching for standalone Android apps built using EAS Build [#92](https://github.com/bugsnag/bugsnag-expo/pull/92)

### Added

- Added `app.versionCode` (Android) and `app.bundleVersion` (iOS) metadata for standalone apps [#92](https://github.com/bugsnag/bugsnag-expo/pull/92)
- Added `codeBundleId` configuration option [#92](https://github.com/bugsnag/bugsnag-expo/pull/92)

## v47.0.0 (2022-11-21)

This release adds support for expo 47

## v46.0.2 (2022-11-21)

### Fixed

- (bugsnag-expo-cli) Fix issue with automated installation when using app.config.js [#71](https://github.com/bugsnag/bugsnag-expo/pull/71)

## v46.0.1 (2022-09-22)

### Fixed

- (bugsnag-expo-cli) Improve monorepo compatibility for plugin-expo-eas-sourcemaps installation [#59](https://github.com/bugsnag/bugsnag-expo/pull/59)

## v46.0.0 (2022-09-09)

This release adds support for expo 46

## v45.1.1 (2022-08-04)

### Added

- Added `Bugsnag.isStarted()` to check whether Bugsnag has initialized [#34](https://github.com/bugsnag/bugsnag-expo/pull/34)
- (plugin-expo-eas-sourcemaps) Add minimum version check to sourcemap plugin [#45](https://github.com/bugsnag/bugsnag-expo/pull/45)

## v45.1.0 (2022-07-28)

This release adds support for sourcemap uploads when using EAS Build

### Added

- Added new `@bugsnag/plugin-expo-eas-sourcemaps` plugin [#40](https://github.com/bugsnag/bugsnag-expo/pull/40)
- Updated CLI tool to automate installation of sourcemap plugin [#40](https://github.com/bugsnag/bugsnag-expo/pull/40)

## v45.0.0 (2022-05-23)

This release adds support for expo 45

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
