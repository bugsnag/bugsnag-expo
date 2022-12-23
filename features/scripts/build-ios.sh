#!

set -e

./features/scripts/build-common.sh

cd features/fixtures/test-app

eas build \
  --local \
  -p ios \
  --output output.ipa \
  --non-interactive

cd ../../..

mkdir build
mv features/fixtures/test-app/output.ipa build/output.ipa
