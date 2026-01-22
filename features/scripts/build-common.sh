#!/bin/bash -e

# Lets make sure the build folders were cleared out correctly
rm -rf $BUILDKITE_BUILD_CHECKOUT_PATH/build/*
rm -rf $BUILDKITE_BUILD_CHECKOUT_PATH/features/fixtures/build

# And all previous packages are removed
git clean -xfdf

# And the yarn cache is clean
yarn cache clean --all

# set bugsnag-js override versions if this build was triggered from the bugsnag-js repo
#./features/scripts/set-bugsnag-js-overrides $BUGSNAG_JS_BRANCH $BUGSNAG_JS_COMMIT
./features/scripts/set-bugsnag-js-overrides "hotfix/xhr-handle-reponse" "d4f24e84e7cfddb99f70f90e747694d047f38094"

# Install repo dependencies
yarn install

cd features/fixtures/test-app

# Set the api key via the CLI
./run-bugsnag-expo-cli

# Set EAS Project ID
sed -i '' "s/EXPO_EAS_PROJECT_ID/$EXPO_EAS_PROJECT_ID/g" app.json

./run-bugsnag-expo-cli-install

cp $EXPO_CREDENTIALS_DIR/* .

echo "Common setup complete"

