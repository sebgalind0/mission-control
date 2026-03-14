module.exports = {
  apps: [{
    name: 'mission-control',
    script: 'npm',
    args: 'run start',
    cwd: '/Users/sebastiangalindo/mission-control',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      PORT: 3334,
      NODE_ENV: 'production',
      NEXT_PUBLIC_WS_URL: 'ws://localhost:3334'
    },
    error_file: '/Users/sebastiangalindo/mission-control/logs/pm2-error.log',
    out_file: '/Users/sebastiangalindo/mission-control/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
