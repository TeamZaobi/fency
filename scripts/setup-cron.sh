#!/bin/bash
# 设置 cron 任务脚本 - 用于配置自动版本控制和备份

# 配置
SCRIPTS_DIR="/var/www/scripts"
CRON_FILE="/tmp/fency_cron"

# 检查脚本是否存在
if [ ! -f "$SCRIPTS_DIR/version-control.sh" ] || [ ! -f "$SCRIPTS_DIR/backup.sh" ]; then
    echo "错误: 脚本文件不存在"
    exit 1
fi

# 确保脚本有执行权限
chmod +x $SCRIPTS_DIR/version-control.sh
chmod +x $SCRIPTS_DIR/backup.sh
chmod +x $SCRIPTS_DIR/restore.sh

# 创建 cron 条目
cat > $CRON_FILE << EOF
# 凿壁网站 - 自动版本控制和备份
# 每小时执行一次版本控制
0 * * * * $SCRIPTS_DIR/version-control.sh > /dev/null 2>&1

# 每天凌晨 2 点执行备份
0 2 * * * $SCRIPTS_DIR/backup.sh > /dev/null 2>&1
EOF

# 安装 cron 任务
echo "安装 cron 任务..."
crontab -l | grep -v "$SCRIPTS_DIR/version-control.sh" | grep -v "$SCRIPTS_DIR/backup.sh" > $CRON_FILE.tmp
cat $CRON_FILE >> $CRON_FILE.tmp
crontab $CRON_FILE.tmp
rm $CRON_FILE $CRON_FILE.tmp

echo "cron 任务已设置:"
echo "- 版本控制: 每小时执行一次"
echo "- 备份: 每天凌晨 2 点执行"
echo ""
echo "您可以使用以下命令查看当前的 cron 任务:"
echo "crontab -l"

exit 0
