// the purpose of this file is to create an installable
// asset out of the development version of @bugsnag/expo
// which can be used to for manual local testing

// usage:
//   node packages/expo/support/bundle-dev.js
//
// output:
//   bugsnag-expo-maj.min.patch.tar.gz in the cwd

const { execFileSync } = require('child_process')
const { copyFileSync, readFileSync, unlinkSync, writeFileSync } = require('fs')

const PKG_PATH = `${__dirname}/../package.json`

// make a backup of the package.json cuz we're gonna mutate it
copyFileSync(PKG_PATH, `${PKG_PATH}.bak`)

// read in the current package.json and copy over any of the dependencies that
// start with @bugsnag/ into the bundleDependencies property
const pkg = JSON.parse(readFileSync(PKG_PATH))
pkg.bundleDependencies = Object.keys(pkg.dependencies).reduce((accum, k) => {
  if (!/^@bugsnag\//.test(k)) return accum
  return accum.concat(k)
}, [])

// write the updated package.json to disk
writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2))

// package up the module including the bundleDependencies (this lands in the cwd)
// of wherever this script is run from
console.log('> npm pack')
execFileSync('npm', ['pack', `${__dirname}/..`], { stdio: 'inherit' })

// restore the original package.json and remove the backup
copyFileSync(`${PKG_PATH}.bak`, PKG_PATH)
unlinkSync(`${PKG_PATH}.bak`)
