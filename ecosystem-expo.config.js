module.exports = {
  apps: [
    {
      name: 'wildpals-backend',
      script: 'dist/backend/src/app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      cwd: '/home/ubuntu/wildpals-backend'
    },
    {
      name: 'wildpals-expo',
      script: 'npx',
      args: 'expo start --tunnel --port 8081',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0'
      },
      cwd: '/home/ubuntu/wildpals'
    }
  ]
}; 