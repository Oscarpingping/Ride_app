module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Optimize imports for Expo's built-in environment variables
      [
        'transform-inline-environment-variables',
        {
          include: ['NODE_ENV', 'EXPO_RUNTIME_VERSION'],
        },
      ],
      // Enable React Native web support
      'react-native-reanimated/plugin',
      // Plugin for custom environment variables from .env file (暂时注释，排查问题)
      // ["module:react-native-dotenv", {
      //   "envName": "APP_ENV",
      //   "moduleName": "@env",
      //   "path": ".env",
      //   "safe": false,
      //   "allowUndefined": true,
      //   "verbose": false
      // }]
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'], // Remove console.log in production
      },
    },
  };
}; 