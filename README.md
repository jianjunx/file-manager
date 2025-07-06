# 文件管理器

一个基于 Fresh 框架构建的现代化文件管理器，支持文件上传、下载、重命名、移动、复制、删除等功能。

## 功能特性

- 📁 目录浏览和导航
- 📤 文件上传（支持多文件）
- 📥 文件下载
- ✏️ 文件重命名
- 📋 文件复制
- 🔄 文件移动
- 🗑️ 文件删除
- 📂 新建文件夹
- 🔍 面包屑导航
- 📱 响应式设计
- 🌙 支持暗色模式
- 🔐 用户身份验证（可选）
- 🐳 Docker 部署支持

## 环境要求

- Deno 1.45.5+
- 或者 Docker

## 本地开发

1. 克隆项目
```bash
git clone <repository-url>
cd file-manager
```

2. 确保 `data` 目录存在（可选，会自动创建）
```bash
mkdir -p data
```

3. 启动开发服务器
```bash
deno task start
```

4. 访问 http://localhost:8000

**注意**：本地开发时，文件管理器会使用 `./data` 目录作为根目录，这与Docker部署时的行为保持一致。

## 环境变量配置

可选的环境变量：
- `PORT`: 应用运行端口（默认为8000）
- `AUTH_USERNAME`: 身份验证用户名（设置后启用身份验证）
- `AUTH_PASSWORD`: 身份验证密码（设置后启用身份验证）
- `SESSION_SECRET`: Session密钥（可选，未设置时自动生成）
- `FILE_MANAGER_ROOT`: 文件管理器的根目录路径（Docker部署时默认为/data，本地开发时默认为./data）

### 身份验证

文件管理器支持可选的用户身份验证功能：

- **启用身份验证**: 设置 `AUTH_USERNAME` 和 `AUTH_PASSWORD` 环境变量
- **禁用身份验证**: 不设置 `AUTH_USERNAME` 和 `AUTH_PASSWORD`，任何人都可以访问
- **Session管理**: 登录后使用cookie存储session，默认有效期7天

示例配置：
```bash
# 启用身份验证
export AUTH_USERNAME=admin
export AUTH_PASSWORD=your_secure_password

# 可选：自定义session密钥
export SESSION_SECRET=your_random_secret_key
```

## Docker 部署

### 使用预构建镜像（推荐）

项目已配置GitHub Actions自动构建多平台镜像，支持amd64和arm64架构：

```bash
# 拉取最新镜像
docker pull ghcr.io/your-username/file-manager:latest

# 运行容器
docker run -d \
  --name file-manager \
  -p 8000:8000 \
  -v /path/to/your/files:/data \
  ghcr.io/your-username/file-manager:latest

# 启用身份验证
docker run -d \
  --name file-manager \
  -p 8000:8000 \
  -e AUTH_USERNAME=admin \
  -e AUTH_PASSWORD=your_secure_password \
  -v /path/to/your/files:/data \
  ghcr.io/your-username/file-manager:latest
```

### 快速开始

使用提供的示例脚本快速启动：
```bash
# 运行示例（使用 ./example-data 作为数据目录）
./run-example.sh

# 或者测试部署
./test-deployment.sh
```

### 使用 Docker Compose（推荐）

项目提供两个Docker Compose配置文件：

#### 方案一：使用预构建镜像（推荐）

使用`docker-compose.ghcr.yml`从GitHub Container Registry拉取预构建镜像：

```bash
# 1. 创建数据目录
mkdir -p ./data

# 2. 修改docker-compose.ghcr.yml中的GitHub用户名
# 将 'your-username' 替换为实际的GitHub用户名

# 3. 启动服务
docker-compose -f docker-compose.ghcr.yml up -d
```

#### 方案二：本地构建

使用`docker-compose.yml`本地构建镜像：

```bash
# 1. 创建数据目录
mkdir -p ./data

# 2. 修改 docker-compose.yml 中的卷映射（可选）
# volumes:
#   - /path/to/your/files:/data

# 3. 启动服务
docker-compose up -d
```

### 本地构建

如果您需要自行构建镜像：

1. 构建镜像
```bash
docker build -t file-manager .
```

2. 运行容器
```bash
docker run -d \
  --name file-manager \
  -p 8000:8000 \
  -v /path/to/your/files:/data \
  file-manager
```

### 环境变量

Docker 部署时可以使用以下环境变量：

- `PORT`: 应用端口（默认 8000）
- `AUTH_USERNAME`: 身份验证用户名（可选）
- `AUTH_PASSWORD`: 身份验证密码（可选）
- `SESSION_SECRET`: Session密钥（可选）

容器会自动使用 `/data` 目录作为文件管理器的根目录，你只需要将宿主机目录映射到 `/data` 即可。

#### 启用身份验证的Docker命令示例

```bash
docker run -d \
  --name file-manager \
  -p 8000:8000 \
  -e AUTH_USERNAME=admin \
  -e AUTH_PASSWORD=your_secure_password \
  -v /path/to/your/files:/data \
  file-manager
```

## 使用说明

1. **浏览文件**: 点击文件夹进入，点击 "..." 返回上级目录
2. **上传文件**: 点击"上传文件"按钮选择文件
3. **创建文件夹**: 点击"新建文件夹"按钮
4. **文件操作**: 选中文件后可以进行移动、复制、删除操作
5. **右键菜单**: 右键点击文件可以进行重命名、下载等操作

## 安全特性

- 🔐 可选的用户身份验证
- 🛡️ 路径遍历攻击防护
- 🔒 文件访问权限控制
- 📋 安全的文件上传处理
- ✅ 用户输入验证
- 🍪 安全的Session管理

## 技术栈

- [Fresh](https://fresh.deno.dev/) - 现代化的 Deno Web 框架
- [Deno](https://deno.land/) - 安全的 JavaScript/TypeScript 运行时
- [Tailwind CSS](https://tailwindcss.com/) - 实用程序优先的 CSS 框架
- [Preact](https://preactjs.com/) - 轻量级的 React 替代品

## CI/CD

项目配置了GitHub Actions自动化流水线：

- ✅ 自动构建多平台Docker镜像（amd64, arm64）
- 📦 自动推送到GitHub Container Registry
- 🏷️ 自动标签管理（latest, version tags）
- 🔒 安全的构建流程和签名验证

每次推送到main分支或创建新的版本标签时，都会自动触发构建流程。

## 开发

### 项目结构

```
├── .github/                # GitHub配置
│   └── workflows/          # GitHub Actions工作流
│       └── docker-build.yml # 多平台Docker镜像构建
├── components/              # 可重用组件
│   ├── Breadcrumb.tsx      # 面包屑导航
│   ├── ContextMenu.tsx     # 右键菜单
│   ├── DirectorySelector.tsx # 目录选择器
│   ├── FileList.tsx        # 文件列表
│   ├── LoginForm.tsx       # 登录表单
│   └── UploadModal.tsx     # 上传对话框
├── islands/                # 交互组件
│   ├── AuthWrapper.tsx     # 身份验证包装器
│   └── FileManager.tsx     # 文件管理器主组件
├── routes/                 # 路由和API
│   ├── api/auth/           # 身份验证API
│   │   ├── login.ts        # 用户登录
│   │   ├── logout.ts       # 用户登出
│   │   └── status.ts       # 认证状态
│   ├── api/files/          # 文件管理API
│   │   ├── copy.ts         # 复制文件
│   │   ├── create-dir.ts   # 创建目录
│   │   ├── delete.ts       # 删除文件
│   │   ├── download.ts     # 下载文件
│   │   ├── list.ts         # 列出文件
│   │   ├── move.ts         # 移动文件
│   │   ├── rename.ts       # 重命名文件
│   │   └── upload.ts       # 上传文件
│   └── index.tsx           # 主页面
├── static/                 # 静态资源
├── auth.ts                 # 身份验证工具
├── config.ts               # 配置文件
├── main.ts                 # 应用入口
├── Dockerfile              # Docker配置
├── docker-compose.yml      # Docker Compose配置（本地构建）
├── docker-compose.ghcr.yml # Docker Compose配置（预构建镜像）
├── run-example.sh          # 示例启动脚本
├── test-deployment.sh      # 部署测试脚本
├── env.example             # 环境变量示例
└── README.md               # 说明文档
```

### 开发命令

```bash
# 启动开发服务器
deno task start

# 启动开发服务器（监听文件变化）
deno task dev

# 构建生产版本
deno task build

# 运行测试
deno task test
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
