# 云端开发备份与恢复指南

> 本文档用于云端沙箱开发环境的项目备份、恢复和持续开发。

---

## 📦 远程仓库信息

| 项目 | 值 |
|------|-----|
| 仓库类型 | 公开仓库 (Public) |
| 仓库 URL | https://github.com/startnow-j/test-ELN-dev.git |
| 克隆命令 | `git clone https://github.com/startnow-j/test-ELN-dev.git` |

### 认证说明

| 操作 | 是否需要认证 |
|------|-------------|
| 克隆/拉取 | ❌ 不需要（公开仓库） |
| 推送 | ✅ 需要 GitHub Personal Access Token |

> ⚠️ **推送需要认证**：即使是公开仓库，推送代码也需要您的 GitHub PAT Token。

---

## 🔄 工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    每次新会话开始时                               │
│                                                                 │
│   1. AI 阅读本文档 → 了解仓库信息                                 │
│   2. 执行【恢复操作】克隆最新代码                                  │
│   3. 继续开发...                                                 │
│   4. 开发完成后执行【备份操作】推送到远程仓库                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📥 恢复操作（每次新会话开始时执行）

### 方式一：完整克隆（推荐）

```bash
# 1. 备份当前环境的关键文件（如果有需要保留的）
cp -r /home/z/my-project/src /tmp/backup_src 2>/dev/null || true

# 2. 克隆远程仓库到临时目录
cd /tmp && rm -rf test-ELN-dev
git clone https://github.com/startnow-j/test-ELN-dev.git

# 3. 将代码复制到工作目录（保留 node_modules 等）
cd /home/z/my-project
rm -rf src prisma public 2>/dev/null || true
cp -r /tmp/test-ELN-dev/src . 2>/dev/null || true
cp -r /tmp/test-ELN-dev/prisma . 2>/dev/null || true
cp -r /tmp/test-ELN-dev/public . 2>/dev/null || true

# 4. 复制其他配置文件（如果存在）
cp /tmp/test-ELN-dev/package.json . 2>/dev/null || true
cp /tmp/test-ELN-dev/tsconfig.json . 2>/dev/null || true
cp /tmp/test-ELN-dev/tailwind.config.ts . 2>/dev/null || true
cp /tmp/test-ELN-dev/next.config.ts . 2>/dev/null || true
cp /tmp/test-ELN-dev/components.json . 2>/dev/null || true
cp /tmp/test-ELN-dev/postcss.config.mjs . 2>/dev/null || true
cp /tmp/test-ELN-dev/eslint.config.mjs . 2>/dev/null || true

# 5. 安装依赖
bun install

# 6. 同步数据库（如果使用 Prisma）
bun run db:push 2>/dev/null || true
```

### 方式二：直接在项目目录初始化

```bash
cd /home/z/my-project

# 配置远程仓库
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/startnow-j/test-ELN-dev.git

# 拉取最新代码
git fetch origin
git reset --hard origin/main 2>/dev/null || git reset --hard origin/master 2>/dev/null || echo "远程分支为空，使用本地代码"

# 安装依赖
bun install
```

---

## 📤 备份操作（开发完成后执行）

### ⚠️ 前提条件

备份需要您的 **GitHub Personal Access Token (PAT)**。

**如何获取 PAT：**
1. 登录 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token

### 方式一：使用 Token URL（推荐）

```bash
# 将 YOUR_TOKEN 替换为您的实际 token
TOKEN_URL="https://YOUR_TOKEN@github.com/startnow-j/test-ELN-dev.git"

cd /home/z/my-project

# 配置带 token 的远程仓库
git remote remove origin 2>/dev/null || true
git remote add origin $TOKEN_URL

# 添加所有更改
git add .

# 提交（使用时间戳作为提交信息）
git commit -m "Backup: $(date '+%Y-%m-%d %H:%M:%S')"

# 推送到远程仓库
git push -u origin master --force

# 推送完成后，移除带 token 的 remote（安全考虑）
git remote remove origin
git remote add origin https://github.com/startnow-j/test-ELN-dev.git
```

### 方式二：直接提供 Token 给 AI

您可以这样告诉我：

```
请帮我备份项目到 GitHub，我的 PAT Token 是：ghp_xxxxxxxxxxxx
```

我会执行完整的备份流程，并在完成后清除 token 信息。

### 分支备份（可选，更安全）

```bash
# 创建带日期的备份分支
BACKUP_BRANCH="backup-$(date '+%Y%m%d-%H%M%S')"

git checkout -b $BACKUP_BRANCH
git add .
git commit -m "Backup: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin $BACKUP_BRANCH

# 切回主分支
git checkout master
```

---

## 🚀 快速指令（给 AI 使用）

### 恢复项目
```
请帮我执行项目恢复：
1. 阅读 /home/z/my-project/BACKUP_RESTORE.md
2. 从 https://github.com/startnow-j/test-ELN-dev.git 克隆代码
3. 安装依赖并准备好开发环境
```

### 备份项目
```
请帮我执行项目备份：
1. 阅读 /home/z/my-project/BACKUP_RESTORE.md
2. 将当前代码推送到远程仓库
```

---

## ⚠️ 重要提醒

1. **敏感信息**：不要将 `.env`、API keys、密码等提交到仓库
2. **大文件**：避免提交 `node_modules`、`.next`、数据库文件等（已在 .gitignore 中）
3. **提交频率**：建议每次重要功能完成后都执行备份
4. **分支策略**：重要修改建议使用分支备份，避免覆盖主分支

---

## 📋 项目文件结构

```
/home/z/my-project/
├── src/                    # 源代码目录
│   ├── app/               # Next.js App Router
│   ├── components/        # React 组件
│   ├── hooks/             # 自定义 Hooks
│   └── lib/               # 工具函数
├── prisma/                 # 数据库 Schema
├── public/                 # 静态资源
├── package.json           # 依赖配置
├── tsconfig.json          # TypeScript 配置
├── tailwind.config.ts     # Tailwind CSS 配置
├── next.config.ts         # Next.js 配置
├── components.json        # shadcn/ui 配置
└── BACKUP_RESTORE.md      # 本文档
```

---

## 🔧 .gitignore 推荐配置

```gitignore
# Dependencies
node_modules/
bun.lock

# Build
.next/
out/
build/
dist/

# Database
*.db
*.db-journal
db/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
dev.log

# Cache
.cache/
.temp/
.tmp/

# Test
coverage/
.nyc_output/
```

---

## 📅 维护记录

| 日期 | 操作 | 说明 |
|------|------|------|
| - | 初始化 | 创建备份恢复文档 |

---

*最后更新：文档创建时自动生成*
