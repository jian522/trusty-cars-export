# Trusty Used Cars - 部署指南

## 快速部署到 Vercel（免费）

### 方法1：手动部署

1. 注册 Vercel 账号（https://vercel.com），用 GitHub 账号登录
2. New Project → Import Project → 选择 GitHub 仓库
3. Deploy，等待 1-2 分钟
4. 自动分配 `.vercel.app` 域名

### 方法2：本地 CLI 部署

```bash
npm i -g vercel
vercel login
vercel          # 首次部署
vercel --prod   # 部署到生产
```

### 方法3：GitHub Actions 全自动部署（推荐，已配置好工作流）

项目已内置 `.github/workflows/deploy.yml`：push 到 `main` 分支（或手动触发）时，
自动执行 `npm ci` → `npm run build` → `npm run lint` → 部署到 Vercel 生产环境。

**首次配置步骤（一次性）：**

1. **推送代码到 GitHub**
   ```bash
   git init
   git add -A
   git commit -m "init: trusty-cars-export"
   git branch -M main
   git remote add origin https://github.com/<你的账号>/<仓库名>.git
   git push -u origin main
   ```

2. **在 Vercel 创建项目**（不需要点 Deploy，只需创建项目以拿到 Project ID）
   - Vercel 控制台 → Add New → Project → Import 仓库
   - 复制三个值：
     - `VERCEL_TOKEN`：Vercel → Settings → Tokens → Create Token
     - `VERCEL_ORG_ID`：Vercel → Settings → General → **View Builder**（或运行 `vercel teams ls` 查看）
     - `VERCEL_PROJECT_ID`：运行 `vercel link` 后查看 `.vercel/project.json`

3. **配置 GitHub Secrets**
   - GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret
   - 依次添加：`VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID`

4. **验证**：再次 push（或 Actions 页手动 Run workflow），看到绿色对勾即部署成功。

## 绑定自定义域名

Vercel 后台 → Settings → Domains → 添加 `trustyusedcars.com` → 按提示配置 DNS。

## 注意事项

- Vercel 免费版：每月 100GB 流量。
- **数据库**：后台管理页使用 SQLite（`data/trusty.db`）。在 Vercel 无服务器环境 SQLite 文件不持久化，
  生产环境请切换到托管数据库（Turso/Supabase），详见 `DATABASE.md`。
- **环境变量**：`NEXT_PUBLIC_SITE_URL`（如 `https://trustyusedcars.com`）用于 sitemap/SEO 生成。

## 项目配置

- 框架：Next.js 16（App Router + TypeScript + Tailwind CSS 4）
- 多语言：中文 / English / العربية / Русский（RTL）
- 数据：100 台车库存（燃油 50 + 新能源 50），后台 SQLite 可增删改
- 图片：二手车之家(che168.com)实拍图，本地 `public/cars/{id}/`（详见 `IMAGES.md`）
