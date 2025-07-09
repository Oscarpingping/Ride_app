const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Basic configuration for web export
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Exclude backend from watching
config.resolver.blockList = [
  /backend\/.*/,
];

module.exports = config; 