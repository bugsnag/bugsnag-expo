const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  'expo': `${__dirname}/node_modules/expo`,
  'expo-modules-core': `${__dirname}/node_modules/expo-modules-core`,
  'react-native': `${__dirname}/node_modules/react-native`,
  'react': `${__dirname}/node_modules/react`,
  '@babel/runtime': `${__dirname}/node_modules/@babel/runtime`,
  'promise': `${__dirname}/node_modules/promise`,
  '@unimodules/core': `${__dirname}/node_modules/@unimodules/core`,
}

module.exports = defaultConfig;
