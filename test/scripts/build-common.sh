# Lets make sure the build folder was cleared out correctly
rm -rf $BUILDKITE_BUILD_CHECKOUT_PATH/build/*

# Install expo requirements
npm install

# Pack the packages and move them to the test fixture
npm pack packages/*/
mv *.tgz test/features/fixtures/test-app

cd test/features/fixtures/test-app

# Install the bugsnag-expo-cli and run setup
npm install bugsnag-expo-cli*.tgz && rm bugsnag-expo-cli*.tgz && ./run-bugsnag-expo-cli

# set bugsnag-js override versions if this build was triggered from the bugsnag-js repo
./set-bugsnag-js-overrides $BUGSNAG_JS_BRANCH $BUGSNAG_JS_COMMIT

# install the remaining packages, this also re-installs the correct @bugsnag/expo version
npm install *.tgz && rm *.tgz

echo $EXPO_CREDENTIALS_BASE64 | base64 -d > credentials.json
