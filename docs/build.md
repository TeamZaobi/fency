# React 应用构建与部署方案

## 1. 服务器环境检查

*   **CPU:** 2 vCPUs (Intel Xeon Platinum)
*   **内存 (RAM):** 总计 1.6 GB (注意: 对于复杂的构建过程或运行多个服务，内存可能比较紧张)
*   **硬盘 (Disk):** 总计 40 GB, 可用约 33 GB。空间充足。
*   **操作系统 (OS):** Linux (根据环境上下文推断)
*   **权限:** 目录 `/var/www/` 的所有权已设置为用户 `jxkcook`。

## 2. 技术栈

*   **前端框架:** 可能包含 React (用于 `index.html`) 或其他 JS 库 (用于特定页面)
*   **构建工具:** Vite (存在 `vite.config.js`, 可能用于开发或特定任务, 但部署不依赖其构建输出)
*   **包管理器:** npm 或 yarn
*   **Node.js:** Vite 和 npm/yarn 需要。
*   **Web 服务器 (生产环境):** Nginx (当前配置使用)。

## 3. 设置与开发步骤

### 3.1 安装 Node.js 和 npm/yarn

如果尚未安装，请安装 Node.js (其中包含 npm)。推荐使用 Node Version Manager (nvm) 来管理 Node 版本。

```bash
# 使用 nvm 的示例 (如果需要，请先安装 nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash )
# 安装后执行 source ~/.bashrc # 或 ~/.zshrc 等
nvm install --lts
nvm use --lts
# 验证安装
node -v
npm -v

# 或者，安装 yarn (可选)
# npm install -g yarn
# yarn -v
```

### 3.2 项目设置

导航到项目根目录 (`/var/www`) 并根据需要运行:

```bash
cd /var/www
# 如果项目依赖需要安装 (例如用于运行脚本)
npm install # 或 yarn install
```

### 3.3 开发工作流 (如果使用 Vite 进行开发)

1.  **导航到项目目录:** `cd /var/www`
2.  **启动开发服务器 (如果配置了):** `npm run dev` (或 `yarn dev`)
3.  在浏览器中访问开发服务器提供的 URL。

**注意:** 当前的部署模型不依赖于 Vite 的生产构建 (`npm run build`) 输出到 `dist` 目录。部署直接使用 `/var/www` 目录下的文件。

## 4. 部署策略 (使用 Nginx - 当前配置)

### 4.1 安装 Nginx

如果尚未安装 Nginx:
```bash
sudo apt update # 或 CentOS/RHEL 使用 yum update
sudo apt install nginx -y # 或 sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx # 设置 Nginx 开机启动
```

### 4.2 配置 Nginx (与当前 `/etc/nginx/sites-enabled/default` 匹配)

确保 Nginx 配置指向项目根目录 (`/var/www`)。

1.  检查或创建 Nginx 服务器块配置文件 (例如，`/etc/nginx/sites-available/default`)。

    ```nginx
    server {
        listen 80 default_server;
        listen [::]:80 default_server;

        server_name _; # 或者你的域名

        # *** 关键：网站根目录指向项目根目录 ***
        root /var/www;

        # 默认索引文件
        index index.html;

        location / {
            # 尝试直接服务文件，然后是目录，最后回退到根目录的 index.html
            # 这适用于单页应用模式或需要将所有未找到的路径指向 index.html 的情况
            try_files $uri $uri/ /index.html;
            # 如果不是 SPA，并且希望对未找到的文件返回 404，可以使用:
            # try_files $uri $uri/ =404;
        }

        # 可选增强配置:
        # 启用 gzip 压缩以加快加载速度
        # gzip on;
        # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # 为静态资源设置浏览器缓存头
        # location ~* \.(?:css|js)$ {
        #   expires 1y;
        #   add_header Cache-Control "public";
        # }

        # 安全相关的 HTTP 头 (示例)
        # add_header X-Frame-Options "SAMEORIGIN";
        # add_header X-Content-Type-Options "nosniff";
        # add_header Referrer-Policy "strict-origin-when-cross-origin";
        # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    }
    ```

2.  启用站点 (如果使用的是非默认文件):
    ```bash
    # sudo rm /etc/nginx/sites-enabled/default # 如果需要移除默认配置
    # sudo ln -s /etc/nginx/sites-available/your-config-file /etc/nginx/sites-enabled/
    ```

3.  测试 Nginx 配置:
    ```bash
    sudo nginx -t
    ```

4.  重新加载 Nginx:
    ```bash
    sudo systemctl reload nginx
    ```

### 4.3 文件放置

确保所有需要部署的文件 (包括 `index.html`, `metadata.json`, `pages/` 目录, `assets/`, `js/` 等) 都位于 Nginx 配置中 `root` 指令指定的 `/var/www` 目录下，并且 Git 的 `develop` 分支包含这些最新文件。

## 5. 未来考虑事项

*   **CI/CD:** 设置持续集成/持续部署流水线 (例如，使用 GitHub Actions, GitLab CI, Jenkins) 以便在推送代码更改时自动执行测试和部署。
*   **HTTPS:** 使用 Let's Encrypt (Certbot) 配置 SSL/TLS 证书以实现安全的 HTTPS 连接。需要更新 Nginx 配置以监听 443 端口并指定证书路径。
*   **状态管理:** 对于较大的应用程序，集成状态管理库，如 Redux Toolkit 或 Zustand。
*   **路由:** 使用 React Router 等库实现客户端路由。
*   **监控与日志:** 设置监控 (例如 Prometheus, Grafana) 并审查 Nginx 访问/错误日志 (`/var/log/nginx/`)。
*   **环境变量:** 使用 `.env` 文件 (Vite 支持) 来管理特定于环境的配置 (API 密钥等)。
