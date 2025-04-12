#!/bin/bash
# 恢复脚本 - 用于从备份恢复网站

# 配置
SITE_DIR="/var/www/fency"
BACKUP_DIR="/var/backups/fency"
LOG_FILE="/var/log/restore.log"
TEMP_DIR="/tmp/fency_restore"

# 确保日志目录存在
mkdir -p $(dirname $LOG_FILE)

# 记录日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 显示可用备份
show_backups() {
    echo "可用备份文件:"
    ls -lt $BACKUP_DIR/*.tar.gz 2>/dev/null | awk '{print NR":", $9, "(" $5 ")", $6, $7, $8}' || echo "没有找到备份文件"
}

# 检查参数
if [ $# -ne 1 ]; then
    echo "用法: $0 <备份文件>"
    echo "例如: $0 /var/backups/fency/fency_backup_2023-01-01_12-00-00.tar.gz"
    echo ""
    show_backups
    exit 1
fi

BACKUP_FILE=$1

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    log "错误: 备份文件 $BACKUP_FILE 不存在"
    show_backups
    exit 1
fi

# 创建临时目录
mkdir -p $TEMP_DIR
log "创建临时目录: $TEMP_DIR"

# 解压备份到临时目录
log "解压备份文件 $BACKUP_FILE 到临时目录..."
tar -xzf $BACKUP_FILE -C $TEMP_DIR 2>> $LOG_FILE

# 检查解压是否成功
if [ $? -ne 0 ]; then
    log "错误: 解压备份文件失败"
    rm -rf $TEMP_DIR
    exit 1
fi

# 确认恢复操作
echo "警告: 此操作将用备份内容替换当前网站内容。"
echo "备份文件: $BACKUP_FILE"
echo "目标目录: $SITE_DIR"
read -p "确定要继续吗? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    log "恢复操作已取消"
    rm -rf $TEMP_DIR
    exit 0
fi

# 备份当前网站（以防万一）
CURRENT_BACKUP="$BACKUP_DIR/pre_restore_$(date +%Y-%m-%d_%H-%M-%S).tar.gz"
log "备份当前网站到 $CURRENT_BACKUP..."
tar -czf $CURRENT_BACKUP -C $(dirname $SITE_DIR) $(basename $SITE_DIR) 2>> $LOG_FILE

# 替换网站内容
log "替换网站内容..."
if [ -d "$SITE_DIR" ]; then
    rm -rf $SITE_DIR
fi

# 移动恢复的内容到网站目录
mv $TEMP_DIR/fency $SITE_DIR

# 设置适当的权限
log "设置权限..."
chown -R www-data:www-data $SITE_DIR
find $SITE_DIR -type d -exec chmod 755 {} \;
find $SITE_DIR -type f -exec chmod 644 {} \;

# 清理
rm -rf $TEMP_DIR

log "恢复操作完成"
echo "网站已从备份 $BACKUP_FILE 恢复"
exit 0
