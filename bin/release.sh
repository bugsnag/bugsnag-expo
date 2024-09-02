#!/usr/bin/env bash

set -euxo pipefail

error_missing_field () {
  echo "Missing required env var: $1"
  exit 1
}

# Ensure all required variables are set before doing any work
if [[ -z ${GITHUB_USER:-} ]]; then error_missing_field "GITHUB_USER"; fi
if [[ -z ${GITHUB_ACCESS_TOKEN:-} ]]; then error_missing_field "GITHUB_ACCESS_TOKEN"; fi
if [[ -z ${RELEASE_BRANCH:-} ]]; then error_missing_field "RELEASE_BRANCH"; fi
if [[ -z ${VERSION:-} ]]; then error_missing_field "VERSION"; fi

git clone --single-branch \
  --branch "$RELEASE_BRANCH" \
  https://"$GITHUB_USER":"$GITHUB_ACCESS_TOKEN"@github.com/bugsnag/bugsnag-expo.git

cd /app/bugsnag-expo

npm install --package-lock false

if [ -v RETRY_PUBLISH ]; then
  npx lerna publish from-package
else
  case $VERSION in
    "prerelease" | "prepatch" | "preminor" | "premajor")
      npx lerna publish "$VERSION" --dist-tag next
      ;;

    *)
      npx lerna publish "$VERSION"
      ;;
  esac
fi
