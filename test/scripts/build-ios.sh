#!

set -e

./test/scripts/build-common.sh

cd test/features/fixtures/test-app

eas build \
  --local \
  -p ios \
  --output output.ipa

cd ../../../..

mkdir build
mv test/features/fixtures/test-app/output.ipa build/output.ipa
