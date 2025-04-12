#!/bin/bash
# 版本控制脚本 - 用于管理网站代码的版本

# 配置
SITE_DIR="/var/www/fency"
LOG_FILE="/var/log/version-control.log"
GIT_USER="自动版本控制"
GIT_EMAIL="auto@example.com"

# 确保日志目录存在
mkdir -p $(dirname $LOG_FILE)

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

# 进入网站目录
cd $SITE_DIR

# 检查是否为 Git 仓库
if [ ! -d ".git" ]; then
    log "初始化 Git 仓库..."
    git init
    git config user.name "$GIT_USER"
    git config user.email "$GIT_EMAIL"
    
    # 创建 .gitignore 文件
    cat > .gitignore << EOF
# 日志文件
*.log
logs/

# 临时文件
*.tmp
*.temp
.DS_Store
Thumbs.db

# 缓存目录
cache/
.cache/

# 配置文件（可能包含敏感信息）
config.php
.env

# 备份文件
*.bak
backup/
EOF
    
    # 初始提交
    git add .
    git commit -m "初始提交: 网站初始化"
    log "Git 仓库初始化完成"
else
    log "检查文件更改..."
    
    # 检查是否有更改
    if git status --porcelain | grep -q '^'; then
        # 有文件更改，进行提交
        git add .
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        git commit -m "自动提交: $TIMESTAMP 的更改"
        log "已提交更改"
    else
        log "没有检测到更改，跳过提交"
    fi
fi

# 创建或切换到 production 分支
if ! git show-ref --quiet refs/heads/production; then
    # production 分支不存在，创建它
    git checkout -b production
    log "创建了 production 分支"
else
    # 检查当前是否在 production 分支
    if [ "$(git symbolic-ref --short HEAD)" != "production" ]; then
        git checkout production
        log "切换到 production 分支"
    fi
fi

log "版本控制操作完成"
exit 0
