# Testing the Bugsnag Expo notifier

## Initial setup

Clone and navigate to this repo:

```sh
git clone git@github.com:bugsnag/bugsnag-expo.git
cd bugsnag-expo
```

Install top level dependencies:

```js
npm i
```

## Unit tests

Runs the unit tests for each package.

```sh
npm run test:unit
```

## Linting

Lints the entire repo with ESLint. On JavaScript files this uses the [standard](https://github.com/standard/eslint-config-standard) ruleset and on TypeScript files this uses the [@typescript/eslint](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin) recommended set of rules.

```sh
npm run test:lint
```

## End to end

These tests are implemented with our notifier testing tool [Maze runner](https://github.com/bugsnag/maze-runner).

End to end tests are written in cucumber-style `.feature` files, and need Ruby-backed "steps" in order to know what to run. The tests are located in the top level [`features`](/features/) directory.

Maze runner's CLI and the test fixtures are containerised so you'll need Docker (and Docker Compose) to run them.

__Note: only Bugsnag employees can run the end-to-end tests.__ We have dedicated test infrastructure and private BrowserStack credentials which can't be shared outside of the organisation.

### Building the test fixtures

The requirements for a machine building the test fixture on CLI can be found within our private `platforms-ansible` repository.

Once the machine is set up, depending on the build type, run either `features/scripts/build-android.sh` or `features/scripts/build-ios.sh`.

### Authenticating with the private container registry

You'll need to set the credentials for the aws profile in order to access the private docker registry:

```
aws configure --profile=opensource
```

Subsequently you'll need to run the following command to authenticate with the registry:

```
npm run test:test-container-registry-login
```

__Your session will periodically expire__, so you'll need to run this command to re-authenticate when that happens.

### Running the tests

The Expo tests drive real, remote mobile devices using BrowserStack. As a Bugsnag employee you can access the necessary credentials in our shared password manager.

They also require access to the Expo ecosystem in order to publish, then build, the installable app packages. As above, these credentials can also be found in the shared password manager.

The following environment variables need to be set:

- `DEVICE_TYPE`: the mobile operating system you want to test on – one of ANDROID_5_0, ANDROID_6_0, ANDROID_7_1, ANDROID_8_1, ANDROID_9_0, IOS_10, IOS_11, IOS_12
- `BROWSER_STACK_USERNAME`
- `BROWSER_STACK_ACCESS_KEY`
- `EXPO_USERNAME`
- `EXPO_PASSWORD`

To run against an android device:

```sh
DEVICE_TYPE=ANDROID_9_0 \
EXPO_USERNAME=xxx \
EXPO_PASSWORD=xxx \
  npm run test:expo:android
```

Running tests against an iOS device locally is not currently supported.
