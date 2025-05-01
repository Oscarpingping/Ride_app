const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Optimize Metro Bundler configuration
config.maxWorkers = 4; // Adjust based on your CPU cores
config.transformer.minifierConfig = {
  compress: {
    drop_console: true, // Remove console.log in production
    drop_debugger: true,
  },
};

// Enable RAM bundle for better performance
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = true;

module.exports = config; 