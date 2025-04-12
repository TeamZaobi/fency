# React 应用构建与部署方案

## 1. 服务器环境检查

*   **CPU:** 2 vCPUs (Intel Xeon Platinum)
*   **内存 (RAM):** 总计 1.6 GB (注意: 对于复杂的构建过程或运行多个服务，内存可能比较紧张)
*   **硬盘 (Disk):** 总计 40 GB, 可用约 33 GB。空间充足。
*   **操作系统 (OS):** Linux (根据环境上下文推断)
*   **权限:** 目录 `/var/www/react-app` 的所有权已设置为用户 `jxkcook`。

## 2. 技术栈

*   **前端框架:** React
*   **构建工具:** Vite (推荐，速度快且功能现代)
*   **包管理器:** npm 或 yarn
*   **Node.js:** Vite 和 npm/yarn 需要。推荐使用 LTS 版本 (例如 18.x 或 20.x)。
*   **Web 服务器 (生产环境):** Nginx (推荐) 或 Apache。

## 3. 设置步骤

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

### 3.2 使用 Vite 创建 React 项目

导航到父目录 (`/var/www/react-app`) 并运行:

```bash
# 使用 npm
npm create vite@latest my-react-app --template react
# 或者使用 yarn
# yarn create vite my-react-app --template react

cd my-react-app
npm install # 或 yarn install
```
*将 `my-react-app` 替换为你的实际项目名称。*

### 3.3 开发工作流

1.  **导航到项目目录:** `cd my-react-app`
2.  **启动开发服务器:** `npm run dev` (或 `yarn dev`)
3.  在浏览器中访问应用 (Vite 会提供 URL，通常是 `http://localhost:5173` 或类似地址)。开发服务器支持热模块替换 (HMR)，可实现快速更新。

### 3.4 生产环境构建

1.  **导航到项目目录:** `cd my-react-app`
2.  **运行构建命令:** `npm run build` (或 `yarn build`)
3.  此命令将在项目文件夹内的 `dist` 目录 (`my-react-app/dist`) 中生成优化后的静态资源 (HTML, CSS, JavaScript)。

## 4. 部署策略 (使用 Nginx)

### 4.1 安装 Nginx

如果尚未安装 Nginx:
```bash
sudo apt update # 或 CentOS/RHEL 使用 yum update
sudo apt install nginx -y # 或 sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx # 设置 Nginx 开机启动
```

### 4.2 配置 Nginx

1.  为你的应用创建一个新的 Nginx 服务器块配置文件 (例如，`/etc/nginx/sites-available/react-app`)。

    ```nginx
    server {
        listen 80;
        # 替换为你的服务器域名或公网 IP 地址
        server_name _;

        # 如果你的项目名称不是 'my-react-app' 或选择了不同的构建输出目录，请调整 root 路径
        root /var/www/react-app/my-react-app/dist;
        index html/index.html index.html index.htm;

        location / {
            # 对单页应用 (SPA) 很重要
            # 尝试直接提供请求的文件，如果找不到，
            # 则提供 html/index.html 让客户端路由处理。
            try_files $uri $uri/ /html/index.html;
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

2.  通过创建符号链接来启用站点:
    ```bash
    # 如果默认站点存在且与端口 80 冲突，则移除
    # sudo rm /etc/nginx/sites-enabled/default
    sudo ln -s /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/
    ```

3.  测试 Nginx 配置是否存在语法错误:
    ```bash
    sudo nginx -t
    ```

4.  如果测试成功，重新加载 Nginx 以应用更改:
    ```bash
    sudo systemctl reload nginx
    ```

### 4.3 放置构建文件

运行 `npm run build` 后，确保 `my-react-app/dist` 目录的内容存在于 Nginx 配置中 `root` 指令指定的位置 (`/var/www/react-app/my-react-app/dist`)。如果你的构建过程输出到其他地方，你可能需要复制或移动它们，或者调整 Nginx 的 `root` 指令。

*注意: 你之前创建了一个 `fency` 目录。如果打算将其作为最终部署位置而不是 Vite 生成的标准 `dist` 文件夹，则需要相应调整 Nginx 的 `root` 指令，并确保将构建产物复制到 `fency` 中。*

## 5. 未来考虑事项

*   **CI/CD:** 设置持续集成/持续部署流水线 (例如，使用 GitHub Actions, GitLab CI, Jenkins) 以便在推送代码更改时自动执行测试和部署。
*   **HTTPS:** 使用 Let's Encrypt (Certbot) 配置 SSL/TLS 证书以实现安全的 HTTPS 连接。需要更新 Nginx 配置以监听 443 端口并指定证书路径。
*   **状态管理:** 对于较大的应用程序，集成状态管理库，如 Redux Toolkit 或 Zustand。
*   **路由:** 使用 React Router 等库实现客户端路由。
*   **监控与日志:** 设置监控 (例如 Prometheus, Grafana) 并审查 Nginx 访问/错误日志 (`/var/log/nginx/`)。
*   **环境变量:** 使用 `.env` 文件 (Vite 支持) 来管理特定于环境的配置 (API 密钥等)。
