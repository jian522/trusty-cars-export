# 后台数据持久化（SQLite）

后台管理页（`/admin`）现在通过 API 真正读写数据库，不再是前端 mock。

## 技术选型

- 数据库：**SQLite**，使用 Node 22+ 内置的 `node:sqlite`（无需安装原生依赖）。
- 数据层：`src/lib/db.ts`（建表、自动播种、CRUD）。
- API 路由（Next.js Route Handlers，Node.js runtime）：
  - `GET/POST /api/cars` —— 列出 / 新增车辆
  - `GET/PUT/DELETE /api/cars/[id]` —— 详情 / 更新 / 删除
- 数据库文件：`data/trusty.db`（首次访问 API 时自动创建，并从 `src/data/cars.ts` 播种 100 台车）。

## 本地使用

```bash
npm run dev
# 打开 http://localhost:3000/admin 即可增删改车辆，改动持久化到 data/trusty.db
```

## 数据结构

`cars` 表每行对应一台车，额外包含 `type` 字段（`fuel` 燃油车 / `ne` 新能源）。
`images`、`exportCountries` 以 JSON 文本存储。

## 发布改动到公开站点（重要）

公开站点（首页/列表/详情）采用静态生成（SSG），读取的是 `src/data/cars.ts`。
后台改动只写入数据库，要让线上站点反映最新库存，执行：

```bash
node scripts/sync-db.mjs   # 把数据库内容写回 src/data/cars.ts
npm run build              # 重新生成静态页面
```

## Vercel 部署注意事项

- `node:sqlite` 的数据库文件位于服务器文件系统，**在 Vercel 无服务器环境不会持久化**（每次冷启动可能丢失，且多实例不共享）。
- 生产环境建议把数据层换成托管数据库，例如：
  - **Turso**（libSQL，兼容 SQLite，有免费额度）
  - **Supabase / Neon / Vercel Postgres**
  - 替换点仅需改动 `src/lib/db.ts` 的实现与 API 路由，前端/后台无需改动。

## 恢复数据库

若删除 `data/trusty.db`，下次访问 API 会自动从 `src/data/cars.ts` 重新播种。
