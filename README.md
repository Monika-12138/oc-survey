# OC / Field Notes 问卷

这是一份面向 OC、动漫、游戏和同人爱好者的分支问卷。

- 代码保存在 GitHub。
- 网页运行在 Cloudflare Workers。
- 答卷和自愿留下的联系方式保存在 Cloudflare D1。
- 普通答题者不需要 ChatGPT、GitHub 或 Cloudflare 账号。
- `/admin` 和 `/api/admin/*` 使用服务器端管理员账号保护。

旧版纯静态问卷保存在 `legacy-static/`，只作历史备份；它不会保存真实答卷。

## 已上线地址

- 公开问卷：<https://oc-survey.liuzicheng357.workers.dev>
- 答卷后台：<https://oc-survey.liuzicheng357.workers.dev/admin>
- 原 GitHub Pages 地址会自动跳转到上面的公开问卷。

后台账号和密码保存在 Cloudflare Secrets，不会进入 GitHub。管理员用户名是部署时设置的邮箱；密码需要从部署者安全保存的位置取得或重新设置。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

## 第一次部署

1. 登录 Cloudflare：

   ```bash
   npx wrangler login
   npx wrangler whoami
   ```

2. 创建 D1 数据库，并把返回的 `database_id` 写入 `wrangler.jsonc`：

   ```bash
   npx wrangler d1 create oc-survey-responses --location apac
   ```

3. 初始化远程数据库：

   ```bash
   npm run db:migrate:remote
   ```

4. 部署公开问卷：

   ```bash
   npm run deploy
   ```

5. 设置后台账号和密码（只保存在 Cloudflare，不要写进 GitHub）：

   ```bash
   npx wrangler secret put ADMIN_USERNAME
   npx wrangler secret put ADMIN_PASSWORD
   ```

6. 再运行一次 `npm run deploy`。部署完成后，Cloudflare 会给出公开的
   `https://oc-survey.<你的子域名>.workers.dev` 地址。

## 管理答卷

- 问卷：`/`
- 答卷后台：`/admin`
- CSV 导出：`/api/admin/responses.csv?limit=5000`

浏览器打开后台时会要求输入管理员账号和密码。密码不会进入 GitHub；如果忘记，重新运行
`npx wrangler secret put ADMIN_PASSWORD` 即可更换。

## 检查

```bash
npm run lint
npm test
```

`dist/`、`.wrangler/`、`.env*` 和本地数据库状态都已被忽略，避免把答卷、联系方式或秘密值提交到 GitHub。
