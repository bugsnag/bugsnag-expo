#!

set -e

./test/features/scripts/build-common.sh

cd test/features/fixtures/test-app

eas build \
  --local \
  -p android \
  --output output.apk

cd ../../../..

mkdir build
mv test/features/fixtures/test-app/output.apk build/output.apk
