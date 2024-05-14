set -e

./features/scripts/build-common.sh

pushd features/fixtures/test-app

npx eas-cli@latest build \
  --local \
  -p ios \
  --output output.ipa \
  --non-interactive \
  --build-logger-level debug

popd

mkdir build
mv features/fixtures/test-app/output.ipa build/output.ipa
