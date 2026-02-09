module.exports = {
  apps: [
    {
      name: 'website-builder',
      script: 'dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 7777,
      },
    },
  ],
};
