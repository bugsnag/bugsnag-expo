# Bugsnag error monitoring & reporting for Expo

Automatically detect JavaScript errors in Expo. Get cross-platform error detection for handled and unhandled errors with real-time error alerts and detailed diagnostic reports.

---

This repository contains our Expo client [`@bugsnag/expo`](./packages/expo), our Expo helper CLI [`bugsnag-expo-cli`](./packages/expo-cli) and dependent plugins. See [packages](./packages) for a full list of contents.

## Getting started

1. [Create a Bugsnag account](https://www.bugsnag.com)
2. Complete the instructions in the [integration guide](https://docs.bugsnag.com/platforms/react-native/expo/)
3. Report handled exceptions using
   [`Bugsnag.notify()`](https://docs.bugsnag.com/platforms/react-native/expo/#reporting-handled-errors)
4. Customize your integration using the
   [configuration options](https://docs.bugsnag.com/platforms/react-native/expo/configuration-options/)

## Support

* Check out the [configuration options](https://docs.bugsnag.com/platforms/react-native/expo/configuration-options)
* [Search open and closed issues](https://github.com/bugsnag/bugsnag-expo/issues?q=+) for similar problems
* [Report a bug or request a feature](https://github.com/bugsnag/bugsnag-expo/issues/new/choose)

## Contributing

Most updates to this repo will be made by Bugsnag employees. We are unable to accommodate significant external PRs such as features additions or any large refactoring, however minor fixes are welcome. See [contributing](CONTRIBUTING.md) for more information.

## Development quick start

```sh
# Clone the repository
git clone git@github.com:bugsnag/bugsnag-expo.git
cd bugsnag-expo

# Install top-level dependencies
npm i

# Bootstrap all of the packages
npm run bootstrap

# Run the unit tests
npm run test:unit

# Run tests for a specific package
npm run test:unit -- --testPathPattern="packages/expo"

# Generate a code coverage report
npm run test:unit -- --coverage

# Run the linter
npm run test:lint
```

See [contributing](CONTRIBUTING.md) for more information.

## License

All packages in this repository are released under the MIT License. See [LICENSE.txt](./LICENSE.txt) for details.
