#!

set -e

./test/scripts/build-common.sh

cd test/features/fixtures/test-app

eas build \
  --local \
  -p android \
  --output output.aab

cd ../../../..

mkdir build
mv test/features/fixtures/test-app/output.ipa build/output.aab
