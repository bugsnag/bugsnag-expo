#!/bin/bash -e

# Lets make sure the build folder was cleared out correctly
rm -rf $BUILDKITE_BUILD_CHECKOUT_PATH/build/*
# And all previous packages are removed
git clean -xfdf
# And the yarn cache is clean
yarn cache clean --all

# Install repo dependencies
yarn install

cd features/fixtures/test-app

# Set the api key via the CLI
./run-bugsnag-expo-cli

# Set EAS Project ID
sed -i '' "s/EXPO_EAS_PROJECT_ID/$EXPO_EAS_PROJECT_ID/g" app.json

# set bugsnag-js override versions if this build was triggered from the bugsnag-js repo
./set-bugsnag-js-overrides $BUGSNAG_JS_BRANCH $BUGSNAG_JS_COMMIT

./run-bugsnag-expo-cli-install

cp $EXPO_UNIVERSAL_CREDENTIALS_DIR/* .

echo "Common setup complete"
