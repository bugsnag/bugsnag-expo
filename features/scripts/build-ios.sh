set -e

./features/scripts/build-common.sh

# EAS local builds spawn `pod` directly rather than via `bundle exec`, so the Ruby
# gem pins in the Gemfile only reach the "Install pods" phase if the whole build
# runs inside Bundler. See PLAT-17253.
BUNDLE_GEMFILE=$PWD/Gemfile
#export BUNDLE_GEMFILE
# Vendor in-tree: the shared Ruby install isn't reliably writable by the build user.
BUNDLE_PATH=$PWD/vendor/bundle
export BUNDLE_GEMFILE BUNDLE_PATH
bundle install

# specifying a working directory for the local eas build helps to avoid caching issues with metro
if [[ -z ${EAS_LOCAL_BUILD_WORKINGDIR:-} ]]; then
  EAS_LOCAL_BUILD_WORKINGDIR=$BUILDKITE_BUILD_CHECKOUT_PATH/features/fixtures/build
  export EAS_LOCAL_BUILD_WORKINGDIR
  export EAS_LOCAL_BUILD_SKIP_CLEANUP=1
fi

pushd features/fixtures/test-app

bundle exec npx eas-cli@24.0.0 build \
  --local \
  -p ios \
  --output output.ipa \
  --non-interactive

popd

mkdir build
mv features/fixtures/test-app/output.ipa build/output.ipa
