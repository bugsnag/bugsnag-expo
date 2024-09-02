set -e

./features/scripts/build-common.sh

# specifying a working directory for the local eas build helps to avoid caching issues with metro
if [[ -z ${EAS_LOCAL_BUILD_WORKINGDIR:-} ]]; then
  EAS_LOCAL_BUILD_WORKINGDIR=$BUILDKITE_BUILD_CHECKOUT_PATH/features/fixtures/build
  export EAS_LOCAL_BUILD_WORKINGDIR
  export EAS_LOCAL_BUILD_SKIP_CLEANUP=1
fi

pushd features/fixtures/test-app

eas build \
  --local \
  -p ios \
  --output output.ipa \
  --non-interactive

popd

mkdir build
mv features/fixtures/test-app/output.ipa build/output.ipa
