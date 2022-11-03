#!

set -e

# Switch Node Version; Default to Node 14
[ "${IN_SUBSHELL}" != "$0" ] && exec env IN_SUBSHELL="$0" nave use "${NODE_VERSION:-14}" bash "$0" "$@" || :

./test/scripts/build-common.sh

cd test/features/fixtures/test-app

eas build \
  --local \
  -p android \
  --output output.apk

cd ../../../..

mkdir build
mv test/features/fixtures/test-app/output.apk build/output.apk
