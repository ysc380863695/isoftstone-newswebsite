#!/bin/bash
# isoftstone-news 部署脚本
# 用法: bash scripts/deploy.sh

set -euo pipefail

APP_DIR="/home/ubuntu/isoftstone-news"
NGINX_CONF="nginx/isoftstone-news.conf"

echo "=== isoftstone-news 部署 ==="

# 1. 同步代码
echo "[1/5] Syncing files..."
rsync -avz --exclude='node_modules' --exclude='data' --exclude='.env' \
  ./ ubuntu@82.156.232.19:$APP_DIR/

# 2. 安装依赖
echo "[2/5] Installing dependencies..."
ssh ubuntu@82.156.232.19 "cd $APP_DIR && npm install --production"

# 3. 确保 .env 存在
echo "[3/5] Checking .env..."
ssh ubuntu@82.156.232.19 "cd $APP_DIR && test -f .env || cp .env.example .env && echo 'WARN: Please edit .env with real API keys'"

# 4. 配置 Nginx
echo "[4/5] Configuring Nginx..."
ssh ubuntu@82.156.232.19 "sudo cp $APP_DIR/$NGINX_CONF /etc/nginx/sites-available/isoftstone-news && sudo ln -sf /etc/nginx/sites-available/isoftstone-news /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx"

# 5. 启动/重启 pm2
echo "[5/5] Starting pm2..."
ssh ubuntu@82.156.232.19 "cd $APP_DIR && npx pm2 startOrRestart ecosystem.config.js && npx pm2 save"

echo "=== 部署完成 ==="
echo "访问: http://82.156.232.19"
echo "日志: ssh ubuntu@82.156.232.19 'cd $APP_DIR && npx pm2 logs'"
