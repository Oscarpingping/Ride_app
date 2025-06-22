module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Optimize imports
      [
        'transform-inline-environment-variables',
        {
          include: ['NODE_ENV', 'EXPO_RUNTIME_VERSION'],
        },
      ],
      // Enable React Native web support
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'], // Remove console.log in production
      },
    },
  };
}; 