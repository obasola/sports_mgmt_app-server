module.exports = {
  apps: [
    {
      name: 'dpa-app-server',
      script: 'npm',
      args: 'run prod',
      cwd: '/var/www/sports_mgmt_app-server',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'dpa-app-client',
      script: 'npm',
      args: 'run prod',
      cwd: '/var/www/sports_mgmt_app-client',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'dpa-player-loader',
      script: 'npm',
      args: 'run dev',
      cwd: '/var/www/nfl-player-loader',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 7000
      }
    }
  ]
};
