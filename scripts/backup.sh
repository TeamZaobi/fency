#!/bin/bash
# 备份脚本 - 用于创建网站文件的备份

# 配置
SITE_DIR="/var/www/fency"
BACKUP_DIR="/var/backups/fency"
LOG_FILE="/var/log/backup.log"
RETENTION_DAYS=30  # 保留备份的天数
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/fency_backup_$DATE.tar.gz"

# 确保日志目录和备份目录存在
mkdir -p $(dirname $LOG_FILE)
mkdir -p $BACKUP_DIR

# 记录日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 检查网站目录是否存在
if [ ! -d "$SITE_DIR" ]; then
    log "错误: 网站目录 $SITE_DIR 不存在"
    exit 1
fi

# 创建备份
log "开始备份 $SITE_DIR 到 $BACKUP_FILE"
tar -czf $BACKUP_FILE -C $(dirname $SITE_DIR) $(basename $SITE_DIR) 2>> $LOG_FILE

# 检查备份是否成功
if [ $? -eq 0 ]; then
    log "备份成功完成: $BACKUP_FILE ($(du -h $BACKUP_FILE | cut -f1))"
    
    # 设置适当的权限
    chmod 600 $BACKUP_FILE
    
    # 清理旧备份
    log "清理超过 $RETENTION_DAYS 天的旧备份..."
    find $BACKUP_DIR -name "fency_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # 可选: 将备份复制到远程位置
    # rsync -avz $BACKUP_FILE user@remote-server:/path/to/backup/
else
    log "错误: 备份失败"
    exit 1
fi

# 创建备份清单
MANIFEST_FILE="$BACKUP_DIR/backup_manifest.txt"
echo "备份日期: $(date '+%Y-%m-%d %H:%M:%S')" > $MANIFEST_FILE
echo "备份文件: $BACKUP_FILE" >> $MANIFEST_FILE
echo "文件大小: $(du -h $BACKUP_FILE | cut -f1)" >> $MANIFEST_FILE
echo "备份内容: $SITE_DIR" >> $MANIFEST_FILE
echo "可用备份:" >> $MANIFEST_FILE
ls -lh $BACKUP_DIR/*.tar.gz | awk '{print $9, "(" $5 ")"}' >> $MANIFEST_FILE

log "备份操作完成"
exit 0
