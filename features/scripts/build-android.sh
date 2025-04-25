set -e

./features/scripts/build-common.sh

pushd features/fixtures/test-app

npm config get registry --no-workspaces
npm config ls -l --no-workspaces

eas build \
  --local \
  -p android \
  --output output.apk

popd

mkdir build
mv features/fixtures/test-app/output.apk build/output.apk
