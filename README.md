# 社交平台

基于 GitHub 认证的社交分享平台，支持文本和图片分享。

## 功能特色

- 🔐 GitHub OAuth 认证
- 📝 文本帖子发布（280 字符限制）
- 🖼️ 图片上传（最多 5 张，自动压缩优化）
- 📱 响应式 3 列瀑布流布局
- 🔍 探索发现页面
- 🗑️ 帖子管理和删除
- 🎨 优雅的用户界面

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **认证**: NextAuth.js v5 + GitHub OAuth
- **数据库**: Neon PostgreSQL
- **存储**: Vercel Blob Storage
- **部署**: Vercel Platform

## 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 环境变量配置

复制 \`.env.local.example\` 为 \`.env.local\` 并填入相应的值：

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

需要配置的环境变量：

- \`NEXTAUTH_SECRET\`: NextAuth.js 密钥
- \`GITHUB_ID\`: GitHub OAuth App ID
- \`GITHUB_SECRET\`: GitHub OAuth App Secret
- \`DATABASE_URL\`: Neon PostgreSQL 连接字符串
- \`BLOB_READ_WRITE_TOKEN\`: Vercel Blob 存储令牌

### 3. 数据库初始化

\`\`\`bash
npm run db:init
\`\`\`

### 4. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

\`\`\`
├── app/ # Next.js App Router
│ ├── (auth)/ # 认证相关页面
│ ├── (dashboard)/ # 主应用页面
│ └── api/ # API 路由
├── components/ # React 组件
│ ├── layout/ # 布局组件
│ ├── posts/ # 帖子相关组件
│ └── ui/ # UI 组件
├── lib/ # 工具库
│ ├── auth.ts # 认证配置
│ ├── db/ # 数据库相关
│ ├── validations.ts # 数据验证
│ └── image-utils.ts # 图片处理
└── types/ # TypeScript 类型定义
\`\`\`

## 部署

项目已针对 Vercel 平台优化，可以直接部署：

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 部署完成

## 开发说明

- 使用 TypeScript 确保类型安全
- 遵循 Next.js 13+ App Router 最佳实践
- 使用 Tailwind CSS 进行样式设计
- 实现了完整的错误处理和用户反馈
- 支持响应式设计，移动端友好

## 许可证

MIT License
