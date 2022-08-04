#!

set -e

# Lets make sure the build folder was cleared out correctly
rm -rf $BUILDKITE_BUILD_CHECKOUT_PATH/build/*

cd test/features/fixtures/test-app

echo $EXPO_CREDENTIALS_BASE64 | base64 -d > credentials.json

mkdir build

npm install

eas build \
  --local \
  -p android \
  --output build/output.ipa
