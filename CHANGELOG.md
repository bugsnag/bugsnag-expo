# Changelog

## [55.0.0] - 2026-03-26

This release adds support for Expo 55

## [54.1.0] - 2026-03-24

### Changed

- (delivery-expo) Migrate from legacy Expo FileSystem API to new API [#257](https://github.com/bugsnag/bugsnag-expo/pull/257)

- Migrate from the `@bugsnag/source-map` tool over to `@bugsnag/cli` for the EAS sourcemap plugin [#247](https://github.com/bugsnag/bugsnag-expo/pull/247)

### Fixed

- (plugin-expo-device) Use `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` keychain accessibility for SecureStore so that Bugsnag works during background tasks [#256](https://github.com/bugsnag/bugsnag-expo/pull/256)

## [54.0.0] - 2025-09-15

This release adds support for Expo 54

### Fixed

- (delivery-expo) Fix import for legacy FileSystem API [#231](https://github.com/bugsnag/bugsnag-expo/pull/231)

## [53.0.0] - 2025-05-21

This release adds support for Expo 53

### Breaking Changes

`@bugsnag/core` and internal plugins have been updated from v7.x to v8.x. See the [upgrade guide](UPGRADING.md) for more information.

## [52.0.1] - 2025-02-20

### Changed

- (plugin-expo-eas-sourcemaps) Update `@expo/config` peer dependency to `~10.0.2` [#209](https://github.com/bugsnag/bugsnag-expo/pull/209)

### Fixed

- (expo-cli) Support App.tsx files in `bugsnag-expo-cli` [#206](https://github.com/bugsnag/bugsnag-expo/pull/206)

## [52.0.0] - 2024-11-28

This release adds support for Expo 52

### Changed

- (delivery-expo) Change "Redeliveryloop error" message to "An error occurred attempting to redeliver a payload" [#193](https://github.com/bugsnag/bugsnag-expo/pull/193)
- (plugin-expo-app) Remove duplicate `nativeBundleVersion` and `nativeVersionCode` app metadata [#204](https://github.com/bugsnag/bugsnag-expo/pull/204)

## [51.0.1] - 2024-08-29

### Fixed

- (plugin-expo-device) Do not use expo-secure-store on unsupported platforms [#185](https://github.com/bugsnag/bugsnag-expo/pull/185)
- (plugin-expo-device, plugin-expo-app) Replace Constants.platform usage with Platform API [#185](https://github.com/bugsnag/bugsnag-expo/pull/185)

## [51.0.0] - 2024-05-16

This release adds support for Expo 51

### Breaking Changes

This release contains an additional peer dependency on `expo-secure-store`. See the [upgrade guide](UPGRADING.md) for more information.

### Changed

- (plugin-expo-device) Replace `Constants.installationId` with a generated device id [#181](https://github.com/bugsnag/bugsnag-expo/pull/181)

## [50.0.0] - 2024-02-07

This release adds support for expo 50

## [49.0.2] - 2023-12-07

### Added

- (delivery-expo) Explicitly mark failed payloads >1MB as not retryable [#65](https://github.com/bugsnag/bugsnag-expo/pull/65)

### Fixed

- (plugin-expo-eas-sourcemaps) Ensure EAS sourcemap config plugin is idempotent [#156](https://github.com/bugsnag/bugsnag-expo/pull/156)

## [49.0.1] - 2023-08-03

### Fixed

- Fix a crash in configuration when Constants.expoGoConfig is null [#145](https://github.com/bugsnag/bugsnag-expo/pull/145)

## [49.0.0] - 2023-07-13

This release adds support for expo 49

### Changed

- Replace deprecated Constants.manifest [#141](https://github.com/bugsnag/bugsnag-expo/pull/141)

## [48.1.0] - 2023-03-27

### Added

- (bugsnag-expo-cli) Updated bugsnag-expo-cli to support Typescript [#98](https://github.com/bugsnag/bugsnag-expo/pull/98)
- Read API key and app version from `Constants.expoConfig` [#119](https://github.com/bugsnag/bugsnag-expo/pull/119)

### Fixed

- (plugin-expo-eas-sourcemaps) Reinstate API key in Android manifest [#117](https://github.com/bugsnag/bugsnag-expo/pull/117)
- (plugin-expo-eas-sourcemaps) Support dynamic configuration files in EAS Build lifecycle hook [#117](https://github.com/bugsnag/bugsnag-expo/pull/117)

## [48.0.0] - 2023-03-07

This release adds support for expo 48

### Fixed

- (bugsnag-expo-cli) CLI tool now installs a sourcemap plugin version that matches the Expo SDK version [#111](https://github.com/bugsnag/bugsnag-expo/pull/111)
- (plugin-expo-eas-sourcemaps) Use EAS Build lifecycle hook for Android source map uploads [#112](https://github.com/bugsnag/bugsnag-expo/pull/112)

## [47.1.1] - 2023-03-02

### Fixed

- (plugin-expo-eas-sourcemaps) Restrict Bugsnag Android Gradle Plugin dependency to v7 [#104](https://github.com/bugsnag/bugsnag-expo/pull/104)

## [47.1.0] - 2023-01-09

### Fixed

- Fixed an issue with source map matching for standalone Android apps built using EAS Build [#92](https://github.com/bugsnag/bugsnag-expo/pull/92)

### Added

- Added `app.versionCode` (Android) and `app.bundleVersion` (iOS) metadata for standalone apps [#92](https://github.com/bugsnag/bugsnag-expo/pull/92)
- Added `codeBundleId` configuration option [#92](https://github.com/bugsnag/bugsnag-expo/pull/92)

## [47.0.0] - 2022-11-21

This release adds support for expo 47

## [46.0.2] - 2022-11-21

### Fixed

- (bugsnag-expo-cli) Fix issue with automated installation when using app.config.js [#71](https://github.com/bugsnag/bugsnag-expo/pull/71)

## [46.0.1] - 2022-09-22

### Fixed

- (bugsnag-expo-cli) Improve monorepo compatibility for plugin-expo-eas-sourcemaps installation [#59](https://github.com/bugsnag/bugsnag-expo/pull/59)

## [46.0.0] - 2022-09-09

This release adds support for expo 46

## [45.1.1] - 2022-08-04

### Added

- Added `Bugsnag.isStarted()` to check whether Bugsnag has initialized [#34](https://github.com/bugsnag/bugsnag-expo/pull/34)
- (plugin-expo-eas-sourcemaps) Add minimum version check to sourcemap plugin [#45](https://github.com/bugsnag/bugsnag-expo/pull/45)

## [45.1.0] - 2022-07-28

This release adds support for sourcemap uploads when using EAS Build

### Added

- Added new `@bugsnag/plugin-expo-eas-sourcemaps` plugin [#40](https://github.com/bugsnag/bugsnag-expo/pull/40)
- Updated CLI tool to automate installation of sourcemap plugin [#40](https://github.com/bugsnag/bugsnag-expo/pull/40)

## [45.0.0] - 2022-05-23

This release adds support for expo 45

## [44.0.1] - 2022-05-12

### Fixed

- Fixed an issue in the `bugsnag-expo-cli` install script when reporting an unsupported version of expo [#31](https://github.com/bugsnag/bugsnag-expo/pull/31)

## [44.0.0] - 2022-04-19

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
