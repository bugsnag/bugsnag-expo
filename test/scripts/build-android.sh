#!

set -e

./test/scripts/build-common.sh

mkdir build

eas build \
  --local \
  -p android \
  --output build/output.ipa
