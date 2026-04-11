# ICHING_CIVI

这个项目现在已经接入了 Cloudflare Worker + KV 的结构，用来保存并展示期刊文章元数据。

## 现在的结构

- `src/index.ts`
  Cloudflare Worker 入口。负责：
  - 提供 `/api/articles` 接口
  - 读写 `ICHING_KV`
  - 继续托管当前静态网站页面
- `wrangler.jsonc`
  Cloudflare 部署配置
- `latest-articles.html`
  改成从 `/api/articles` 动态读取文章列表

## 你要做的 Cloudflare 配置

### 1. 找到 KV Namespace ID

你已经创建了 KV，名称是 `ICHING_KV`。
现在去 Cloudflare Dashboard 里复制它的 **Namespace ID**，然后把 `wrangler.jsonc` 里的：

```json
"id": "REPLACE_WITH_YOUR_KV_NAMESPACE_ID"
```

替换成你的真实 ID。

### 2. 安装并登录 Wrangler

如果你本机还没有安装：

```bash
npm install -g wrangler
wrangler login
```

### 3. 设置后台写入密钥

这个项目把新增/删除文章接口保护起来了，必须带管理员 token 才能写入：

```bash
wrangler secret put ADMIN_TOKEN
```

执行后输入你自己设置的一串密码，例如：

```text
iching-admin-2026
```

### 4. 本地预览

```bash
wrangler dev
```

这里已经把 KV 绑定设成了 `remote: true`，所以你本地预览时读取的就是 Cloudflare 上那一个真实的 `ICHING_KV`。

打开本地地址后：

- 首页和其他静态页面会继续显示
- `latest-articles.html` 会请求 `/api/articles`
- 如果 KV 里还没有数据，会显示“暂未发布正式文章”

### 5. 部署到 Cloudflare

```bash
wrangler deploy
```

部署后，把你的自定义域名绑定到这个 Worker 即可。

## API 用法

### 读取文章列表

```bash
curl https://你的域名/api/articles
```

### 新增一篇文章

```bash
curl -X POST https://你的域名/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的ADMIN_TOKEN" \
  --data '{
    "slug": "silk-manuscript-zhouyi",
    "categoryZh": "文本研究",
    "categoryEn": "Textual Study",
    "titleZh": "帛书《周易》异文与卦辞层次再检",
    "titleEn": "Variants in the Silk Manuscript Zhouyi and the Layering of Hexagram Statements",
    "authorZh": "张三",
    "authorEn": "Zhang San",
    "abstractZh": "从帛书材料与传世本对读入手，重新考察若干卦辞的层次关系与传抄路径。",
    "abstractEn": "Re-examines selected hexagram statements by reading silk-manuscript evidence against received editions and tracing possible lines of transmission.",
    "issueLabelZh": "创刊专题",
    "issueLabelEn": "Founding Dossier",
    "pdfUrl": "https://你的域名/papers/silk-manuscript-zhouyi.pdf",
    "doiUrl": "https://doi.org/10.xxxx/example",
    "publishedAt": "2026-04-11"
  }'
```

### 删除文章

```bash
curl -X DELETE https://你的域名/api/articles/silk-manuscript-zhouyi \
  -H "Authorization: Bearer 你的ADMIN_TOKEN"
```

## KV 里保存的内容

当前实现把文章信息保存为两类 key：

- `articles:index`
  整个文章列表，用来让首页快速读取
- `article:<slug>`
  单篇文章详情

## 重要说明

- 现在这个 KV 更适合保存“文章元数据”，例如标题、作者、摘要、PDF 链接、DOI 链接。
- 如果以后要保存论文文件本身，建议把 PDF 放到 Cloudflare R2，而不是直接塞进 KV。
- 如果以后要做真正的投稿系统、审稿状态、作者后台、检索筛选，KV 会开始吃力，那时更适合换成 D1。
