module.exports = {
  apps: [{
    name: 'isoftstone-news',
    script: 'server/index.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '3G',
    env: {
      NODE_ENV: 'production',
    },
    // 日志
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    // 优雅关闭
    kill_timeout: 10000,
    listen_timeout: 10000,
  }],
};
