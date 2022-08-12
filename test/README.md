# Detailed test-fixture build steps

The following steps will attempt to outline the current build process for the Expo test fixture contained within this repo for future reference.

## Requirements

The requirements for a machine building the test fixture on CLI can be found within our private `platforms-ansible` repository.

## Build process

Depending on the build type, the build is initiated via calling the `test/scripts/build-android.sh` or `test/scripts/build-ios.sh` scripts.

### Common steps

Each script initially calls the `test/scripts/build-common.sh` script.  This sets up the bugsnag expo packages by:

1. Clearing any `build` directory that may have been created previously
2. Installing the `bugsnag-expo` package requirements
3. Packaging the repository into `.tgz` installable packages and moving them into the test fixture

All subsequent steps are executed within the test-fixture directory, `test/features/fixtures/test-app`

4. The `bugsnag-expo-cli` package is installed from the tarball, and a script executes the following commands:
    - `bugsnag-expo-cli set-api-key` to set a pre-defined test api key in the app configuration
    - `bugsnag-expo-cli add-hook` to add source-map upload hooks into the app configuration
5. The `set-bugsnag-js-overrides` script is invoked with a `bugsnag-js` branch and commit details if present. If required this will update the `bugsnag-js` package present in the test app, and is used for acceptance testing from that repository
6. Afterwards, to ensure changing the `bugsnag-js` version hasn't modified any `bugsnag-expo` packages we reinstall the `.tgz` packages present in the fixture
7. As EAS uses `yarn` as part of its initial processing we run `yarn install` independently to ensure a suitable `yarn.lock` file pre-exists, and so we have more control over the process
8. To ensure peer-dependencies are installed we then invoke the `./run-bugsnag-expo-cli-install` script, which in turn calls the command:
    - `bugsnag-expo-cli install` to install all peer dependencies
9. Finally, to ensure the apps are signed correctly for use on third-party testing services we copy a pre-written `credentials.json` into the repo, which is referenced in `eas.json`.
    - More information about this file can be found within the `platforms-ansible` repository

### Android steps

Following the completion of the common steps, the `test/scripts/build-android.sh` script will:

1. Move to the `test-app` fixture directory
2. Invoke `eas build` using local credentials, outputting the file `output.apk`
    - By default this would produce a `.aab` file, but the `build.production.android.buildType` setting in `eas.json` overrides this to produce a usable `.apk` file
    - We don't currently define a separate build scheme within the `eas.json`, simply using the default `production` scheme for the time being
3. We then copy the product `output.apk` to `build/output.apk` at the top level of this repository to be consumed in later CI stages

### iOS steps

Following the completion of the common steps, then `test/scripts/build-ios.sh` script will:

1. Move to the `test-app` fixture directory
2. Invoke `eas build` using local credentials, outputting the file `output.ipa`
    - The above notes for android regarding build schemes are also relevant to this build
    - By default Expo adds push notification entitlements which we don't wish to use as it complicates our signing process and ability to install on third party test devices.
    - To remedy this we add a plugin to the `app.json`, `config-plugins/withRemoveiOSNotificationEntitlement`
    - This plugin adds a hook to receive the configuration and entitlements file, removing the `aps-environment` entitlement from the final entitlements file
3. We then copy the product `output.ipa` to `build/output.ipa` at the top level of this repository to be consumed in later CI stages.
