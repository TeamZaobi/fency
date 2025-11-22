#!/bin/bash

# Deployment Script for Fency Project

# 1. Push to GitHub
echo "🚀 Deploying to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ GitHub deployment successful."
else
    echo "❌ GitHub deployment failed."
    exit 1
fi

# 2. Push to Aliyun Server (using rsync)
echo "🚀 Deploying to Aliyun Server..."
# Uses the SSH config we found: User jxkcook, Port 2279, Key ~/.ssh/id_ed25519
# Excludes .git directory and other dev files
rsync -avz -e "ssh -p 2279 -i ~/.ssh/id_ed25519" \
    --exclude '.git' \
    --exclude '.DS_Store' \
    --exclude 'node_modules' \
    --exclude 'backup' \
    --exclude 'deploy.exp' \
    --exclude 'setup_ssh.exp' \
    ./ jxkcook@101.200.131.64:/var/www/

if [ $? -eq 0 ]; then
    echo "✅ Aliyun deployment successful."
else
    echo "❌ Aliyun deployment failed."
    exit 1
fi

echo "🎉 All deployments complete!"
