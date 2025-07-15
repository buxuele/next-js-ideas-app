# GitHub OAuth 配置指南


https://github.com/settings/developers

新建app,  填写应用信息：


我的是
Authorization callback URL =
https://next-js-ideas-app.vercel.app/api/auth/callback/github
 
#### 重要：授权回调 URL
- **Authorization callback URL**:
  - 开发环境：`http://localhost:3000/api/auth/callback/github`
  - 生产环境：`https://your-domain.com/api/auth/callback/github`


### 2.1 获取 Client ID ， Client Secret
修改  .env.local

```bash
# GitHub OAuth - 替换为你的实际值
GITHUB_ID=xxx
GITHUB_SECRET=xxx
``` 

2. **在 Vercel 中设置环境变量**：
https://vercel.com/fanchuangs-projects/next-js-ideas-app/settings/environment-variables



