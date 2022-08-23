#!/bin/bash -e

# Lets make sure the build folder was cleared out correctly
rm -rf $BUILDKITE_BUILD_CHECKOUT_PATH/build/*

# Install expo requirements
npm install

# Pack the packages and move them to the test fixture
npm pack packages/*/
mv *.tgz test/features/fixtures/test-app

cd test/features/fixtures/test-app

# Install the bugsnag-expo-cli and run setup
BUGSNAG_EXPO_CLI=$(ls | grep -e bugsnag-expo-cli*.tgz)
yarn add file:$BUGSNAG_EXPO_CLI
./run-bugsnag-expo-cli

# set bugsnag-js override versions if this build was triggered from the bugsnag-js repo
./set-bugsnag-js-overrides $BUGSNAG_JS_BRANCH $BUGSNAG_JS_COMMIT

# install the remaining packages, this also re-installs the correct @bugsnag/expo version
for FILE in *.tgz; do
    yarn add file:$FILE
done


# As EAS uses yarn, pre-run the install for the sake of my sanity
yarn install

./run-bugsnag-expo-cli-install

cp $EXPO_CREDENTIALS_PATH credentials.json

echo "Common setup complete"
