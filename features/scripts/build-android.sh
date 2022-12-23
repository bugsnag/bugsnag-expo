#!

set -e

./features/scripts/build-common.sh

cd features/fixtures/test-app

eas build \
  --local \
  -p android \
  --output output.apk

cd ../../../..

mkdir build
mv features/fixtures/test-app/output.apk build/output.apk
