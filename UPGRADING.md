# Upgrading

## v52.x to v53.x

This release upgrades `@bugsnag/core` and internal plugin dependencies from v7.x to v8.x, which introduces some breaking changes:

### `request` replaced with `url` and `method` in network breadcrumb metadata

Prior to v8, network breadcrumb metadata included a field named `request`, which contained the request URL prepended with the HTTP method (e.g. `"GET https://request-url.com/`). This has been replaced with two separate metadata fields named `url` and `method`, which contain the request URL and HTTP method respectively.

### Validation of BugSnag endpoints

As of v8, for consistency with other BugSnag platforms, if only one [endpoint](https://docs.bugsnag.com/platforms/javascript/configuration-options/#endpoints) is set in configuration, no events **or** sessions will be sent. To correctly setup BugSnag for on-premise, both `notify` and `sessions` endpoint should be set. This change reduces the possibility of a misconfigured client leaking data to the wrong BugSnag server.

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
