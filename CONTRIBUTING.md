# Contributing

Thanks for stopping by! This document should cover most topics surrounding contributing to this repo.

* [How to contribute](#how-to-contribute)
  * [Reporting issues](#reporting-issues)
  * [Fixing issues](#fixing-issues)
  * [Adding features](#adding-features)
* [System requirements](#system-requirements)
* [Testing](#testing)

## Reporting issues
Are you having trouble getting started? Please [contact us directly](mailto:support@bugsnag.com?subject=%5BGitHub%5D%20bugsnag-expo%20-%20having%20trouble%20getting%20started%20with%20Bugsnag) for assistance with integrating Bugsnag into your application.
If you have spotted a problem with this module, feel free to open a [new issue](https://github.com/bugsnag/bugsnag-expo/issues/new?template=Bug_report.md). Here are a few things to check before doing so:

* Are you using the latest version of Bugsnag? If not, does updating to the latest version fix your issue?
* Has somebody else [already reported](https://github.com/bugsnag/bugsnag-expo/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen) your issue? Feel free to add additional context to or check-in on an existing issue that matches your own.
* Is your issue caused by this module? Only things related to `@bugsnag/expo` (including `@bugsnag/plugin-*` plugins to support various frameworks) should be reported here. For anything else, please [contact us directly](mailto:support@bugsnag.com) and we'd be happy to help you out.

### Fixing issues

If you've identified a fix to a new or existing issue, we welcome contributions!
Here are some helpful suggestions on contributing that help us merge your PR quickly and smoothly:

* [Fork](https://help.github.com/articles/fork-a-repo) the [library on GitHub](https://github.com/bugsnag/bugsnag-expo)
* Build and test your changes. We have automated tests for many scenarios but its also helpful to use `npm pack` to build the module locally and install it in a real app.
* Commit and push until you are happy with your contribution
* [Make a pull request](https://help.github.com/articles/using-pull-requests)
* Ensure the automated checks pass (and if it fails, please try to address the cause)

### Adding features

Unfortunately we’re unable to accept PRs that add features or refactor the library at this time.
However, we’re very eager and welcome to hearing feedback about the library so please contact us directly to discuss your idea, or open a
[feature request](https://github.com/bugsnag/bugsnag-expo/issues/new?template=Feature_request.md) to help us improve the library.

Here’s a bit about our process designing and building the Bugsnag libraries:

* We have an internal roadmap to plan out the features we build, and sometimes we will already be planning your suggested feature!
* Our open source libraries span many languages and frameworks so we strive to ensure they are idiomatic on the given platform, but also consistent in terminology between platforms. That way the core concepts are familiar whether you adopt Bugsnag for one platform or many.
* Finally, one of our goals is to ensure our libraries work reliably, even in crashy, multi-threaded environments. Oftentimes, this requires an intensive engineering design and code review process that adheres to our style and linting guidelines.


## System requirements

In order to develop on the project you’ll need to be on Mac/Linux٭. You’ll need:
- [node](https://nodejs.org) `v8+` (which includes [npm](https://www.npmjs.com/get-npm) 5+)
- [git](https://git-scm.com/)

If you want to run the end-to-end tests locally you'll need [Docker](https://www.docker.com/products/docker-desktop) (including Docker Compose), and the [AWS CLI](https://aws.amazon.com/cli/). Note that you'll also need some BrowserStack and AWS credentials which are only available to Bugsnag employees.

## Testing

A full guide to testing can be found in the [testing](./TESTING.md) document

## CI

CI runs on Buildkite. Tests are run automatically on any branch from within this repo. PRs from external repos do not run on the private test infrastructure. Once an external PR has been reviewed by a Bugsnag employee, a branch can be created within this repo in order to run on CI.

⚠️ __Caution__: exercise due-diligence before creating a branch based on an external contribution – for example, be sure not to merge a bitcoin miner disguised as a bug fix!

## Keeping dependencies in sync

The Expo notifier depends on some modules whose native code, if it exists, is bundled with Expo core. That means the version we depend on must match, otherwise we get conflicts and/or there are native/JS interface differences.

When a new version of the Expo SDK is released, the dependencies we use must be checked to see if they are up to date.

The following modules are currently used:

- `@react-native-community/netinfo` (`@bugsnag/delivery-expo`, `@bugsnsag/plugin-expo-connectivity-breadcrumbs`)
- `expo-application` (`@bugsnag/plugin-expo-app`)
- `expo-constants` (`@bugsnag/expo`, `@bugsnag/plugin-expo-app`, `@bugsnag/plugin-expo-device`)
- `expo-crypto` (`@bugsnag/delivery-expo`)
- `expo-device` (`@bugsnag/plugin-expo-device`)
- `expo-file-system` (`@bugsnag/delivery-expo`)

If you add a new dependency please add it to this list.

To check what native module versions are bundled with Expo, check this file:

https://github.com/expo/expo/blob/main/packages/expo/bundledNativeModules.json

Additionally, `@bugsnag/expo` has a dependency on `promise` that must resolve to the same version used by `react-native` to ensure that we attach our unhandled rejection handler to the same instance of promise used by react-native.

## Updating the CLI to install a compatible notifier version

When a new Expo SDK is released, a new matching `@bugsnag/expo` version needs to be published. For example, for SDK 44 there is a `@bugsnag/expo` v44. To mark the new SDK as supported, update the CLI's `LATEST_SUPPORTED_EXPO_SDK` in [`packages/expo-cli/lib/version-information.js`](./packages/expo-cli/lib/version-information.js)

## Releases

To start a release:

- create and push a new branch (e.g. `v46`) from the latest previous branch (e.g. `v45` or `v45-next`)
- create a new next branch from which the release PR is to be made (e.g. `v46-next`)
- make the required dependency and CLI changes (see above) for the latest expo version
- regenerate the expo e2e test fixture using the expo create app cli
- update the version number and date in the changelog
- make a PR from your release branch (e.g. `v46-next`) to `v46` entitled `Release v46`
- get the release PR reviewed
- consider shipping a [prerelease](#prereleases) to aid testing the release

Once the release PR has been approved:

- merge the PR

You are now ready to make the release. Releases are done using Docker and Docker compose. You do not need to have the release branch checked out on your local machine to make a release – the container pulls a fresh clone of the repo down from GitHub. Prerequisites:

- You will need to clone the repository and have Docker running on your local machine.
- Ensure you are logged in to npm and that you have access to publish to the following on npm
  - any packages in the `@bugsnag` namespace
  - the `bugsnag-expo-cli` package
- Ensure your `.gitconfig` file in your home directory is configured to contain your name and email address
- Generate a [personal access token](https://github.com/settings/tokens/new) on GitHub and store it somewhere secure

Build the release container:

`docker-compose build release`

Then make the release:

```
GITHUB_USER=<your github username> \
GITHUB_ACCESS_TOKEN=<generate a personal access token> \
RELEASE_BRANCH=<the branch to publish a new release from> \
VERSION=patch \
  docker-compose run release
```

This process is interactive and will require you to confirm that you want to publish the changed packages. It will also prompt for 2FA.

Browser bundles are automatically uploaded to the CDN if they have changed.

<small>Note: if a prerelease was made, to graduate it into a normal release you will want to use `patch` as the version.</small>

Finally:

- create a release on GitHub https://github.com/bugsnag/bugsnag-expo/releases/new
- use the tag vX.Y.Z as the name of the release
- copy the release notes from `CHANGELOG.md`
- publish the release
- update and push `next`:
    ```
    git checkout next
    git merge master
    git push
    ```

### Prereleases

If you are starting a new prerelease, use one of the following values for the `VERSION` variable in the release command:

```
VERSION=[premajor | preminor | prepatch]
```

For subsequent iterations on that release, use:

```
VERSION=prerelease
```

For example:

```
GITHUB_USER=<your github username> \
GITHUB_ACCESS_TOKEN=<generate a personal access token> \
RELEASE_BRANCH=<the branch to publish a new release from> \
VERSION=preminor \
  docker-compose run release
```

Prereleases will automatically be published to npm with the dist tag `next`.

The dist tag ensures that prereleases are not installed by unsuspecting users who do not specify a version – npm automatically adds the `latest` tag to a published module unless one is specified.
