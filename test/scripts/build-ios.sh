#!

set -e

./test/scripts/build-common.sh

mkdir build

eas build \
  --local \
  -p ios \
  --output build/output.ipa
