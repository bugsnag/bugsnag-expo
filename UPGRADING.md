# Upgrading

## v50.x to v51.x

This release contains an additional peer dependency on `expo-secure-store` for persistence of a device ID between app launches (previously provided by the deprecated `Constants.installationId` field) for User Stability calculations.

Run the bugsnag-expo-cli to add this dependency to your project:

```sh
npx bugsnag-expo-cli install
```

Alternatively, you can use `expo install`:

```sh
expo install expo-secure-store
```
