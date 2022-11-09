#!/bin/bash -e

# Lets make sure the build folder was cleared out correctly
rm -rf $BUILDKITE_BUILD_CHECKOUT_PATH/build/*
# And all previous packages are removed
git clean -xfdf
# And the yarn cache is clean
yarn cache clean --all

# Install expo requirements
npm install

# Bump package versions to a high value so only our values will match
npx lerna version 999.999.999 --no-git-tag-version --no-push --no-changelog --yes

# Pack the packages and move them to the test fixture
npm pack packages/*/
mv *.tgz test/features/fixtures/test-app

cd test/features/fixtures/test-app

# Install the bugsnag-expo-cli and run setup
npm install bugsnag-expo-cli*.tgz
./run-bugsnag-expo-cli

# Set EAS Project ID
sed -i'' -e "s/EXPO_EAS_PROJECT_ID/$EXPO_EAS_PROJECT_ID/g" app.json

# set bugsnag-js override versions if this build was triggered from the bugsnag-js repo
./set-bugsnag-js-overrides $BUGSNAG_JS_BRANCH $BUGSNAG_JS_COMMIT

# install the remaining packages, this also re-installs the correct @bugsnag/expo version
npm install *.tgz
npm install
yarn import

./run-bugsnag-expo-cli-install

cp $EXPO_CREDENTIALS_DIR/* .

echo "Common setup complete"
