interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

interface KvStore {
  get(key: string, type: "json"): Promise<unknown>;
  get(key: string, type?: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

interface Env {
  ASSETS: AssetFetcher;
  ICHING_KV: KvStore;
  ADMIN_TOKEN?: string;
}

interface ArticleRecord {
  slug: string;
  categoryZh: string;
  categoryEn: string;
  titleZh: string;
  titleEn: string;
  authorZh: string;
  authorEn: string;
  abstractZh: string;
  abstractEn: string;
  issueLabelZh: string;
  issueLabelEn: string;
  pdfUrl: string;
  doiUrl: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const INDEX_KEY = "articles:index";
const ARTICLE_PREFIX = "article:";
const BLOCKED_PATHS = [
  "/README.md",
  "/wrangler.jsonc",
  "/package.json",
  "/package-lock.json",
  "/tsconfig.json",
  "/.DS_Store",
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (isBlockedPath(url.pathname)) {
      return new Response("Not found", { status: 404 });
    }

    if (
      url.pathname === "/api/articles" ||
      url.pathname.startsWith("/api/articles/")
    ) {
      return handleArticlesApi(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleArticlesApi(
  request: Request,
  env: Env,
  url: URL,
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  const slug = getSlugFromPath(url.pathname);

  if (request.method === "GET") {
    if (slug) {
      return getSingleArticle(env, slug);
    }

    return getArticleList(env, url);
  }

  if (request.method === "POST") {
    return upsertArticle(request, env);
  }

  if (request.method === "DELETE" && slug) {
    return deleteArticle(request, env, slug);
  }

  return json(
    {
      error:
        request.method === "DELETE"
          ? "DELETE /api/articles/:slug is supported."
          : "Method not allowed.",
    },
    405,
  );
}

async function getArticleList(env: Env, url: URL): Promise<Response> {
  const articles = await getArticleIndex(env);
  const limitValue = Number(url.searchParams.get("limit") || "");
  const limit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 12;

  return json({
    articles: articles.slice(0, limit),
    count: articles.length,
  });
}

async function getSingleArticle(env: Env, slug: string): Promise<Response> {
  const article = await env.ICHING_KV.get(articleKey(slug), "json");

  if (!article || typeof article !== "object") {
    return json({ error: "Article not found." }, 404);
  }

  return json({ article });
}

async function upsertArticle(request: Request, env: Env): Promise<Response> {
  const authError = ensureAuthorized(request, env);
  if (authError) {
    return authError;
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  let existing: ArticleRecord | null = null;
  const requestedSlug =
    payload && typeof payload === "object" && "slug" in payload
      ? slugify(String((payload as { slug?: unknown }).slug || ""))
      : "";

  if (requestedSlug) {
    const current = await env.ICHING_KV.get(articleKey(requestedSlug), "json");
    if (current && typeof current === "object") {
      existing = current as ArticleRecord;
    }
  }

  let article: ArticleRecord;
  try {
    article = normalizeArticle(payload, existing);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid article payload.";
    return json({ error: message }, 400);
  }

  const index = await getArticleIndex(env);
  const nextIndex = updateIndex(index, article);

  await Promise.all([
    env.ICHING_KV.put(articleKey(article.slug), JSON.stringify(article)),
    env.ICHING_KV.put(INDEX_KEY, JSON.stringify(nextIndex)),
  ]);

  return json(
    {
      ok: true,
      article,
    },
    existing ? 200 : 201,
  );
}

async function deleteArticle(
  request: Request,
  env: Env,
  slug: string,
): Promise<Response> {
  const authError = ensureAuthorized(request, env);
  if (authError) {
    return authError;
  }

  const index = await getArticleIndex(env);
  const nextIndex = index.filter((article) => article.slug !== slug);

  await Promise.all([
    env.ICHING_KV.delete(articleKey(slug)),
    env.ICHING_KV.put(INDEX_KEY, JSON.stringify(nextIndex)),
  ]);

  return json({
    ok: true,
    deleted: slug,
  });
}

async function getArticleIndex(env: Env): Promise<ArticleRecord[]> {
  const stored = await env.ICHING_KV.get(INDEX_KEY, "json");

  if (!Array.isArray(stored)) {
    return [];
  }

  return stored
    .filter((item): item is ArticleRecord => Boolean(item && typeof item === "object"))
    .sort(compareArticles);
}

function updateIndex(
  index: ArticleRecord[],
  article: ArticleRecord,
): ArticleRecord[] {
  const filtered = index.filter((item) => item.slug !== article.slug);
  filtered.push(article);
  filtered.sort(compareArticles);
  return filtered;
}

function compareArticles(a: ArticleRecord, b: ArticleRecord): number {
  return parseDate(b.publishedAt) - parseDate(a.publishedAt);
}

function normalizeArticle(
  payload: unknown,
  existing: ArticleRecord | null,
): ArticleRecord {
  if (!payload || typeof payload !== "object") {
    throw new Error("Article payload must be an object.");
  }

  const source = payload as Record<string, unknown>;
  const now = new Date().toISOString();
  const titleZh = readText(source.titleZh, existing?.titleZh);
  const titleEn = readText(source.titleEn, existing?.titleEn);
  const abstractZh = readText(source.abstractZh, existing?.abstractZh);
  const abstractEn = readText(source.abstractEn, existing?.abstractEn);
  const slug = slugify(
    readText(source.slug, existing?.slug) || titleEn || titleZh,
  );

  if (!slug) {
    throw new Error("Please provide slug or titleEn.");
  }

  if (!titleZh && !titleEn) {
    throw new Error("Please provide at least one title.");
  }

  if (!abstractZh && !abstractEn) {
    throw new Error("Please provide at least one abstract.");
  }

  const finalTitleZh = titleZh || titleEn;
  const finalTitleEn = titleEn || titleZh;
  const finalAbstractZh = abstractZh || abstractEn;
  const finalAbstractEn = abstractEn || abstractZh;
  const categoryZh = readText(source.categoryZh, existing?.categoryZh) || "研究论文";
  const categoryEn = readText(source.categoryEn, existing?.categoryEn) || "Research Article";
  const authorZh = readText(source.authorZh, existing?.authorZh);
  const authorEn = readText(source.authorEn, existing?.authorEn);
  const issueLabelZh = readText(source.issueLabelZh, existing?.issueLabelZh);
  const issueLabelEn = readText(source.issueLabelEn, existing?.issueLabelEn);
  const pdfUrl = readUrl(source.pdfUrl, existing?.pdfUrl);
  const doiUrl = readUrl(source.doiUrl, existing?.doiUrl);
  const publishedAt = normalizeDate(
    readText(source.publishedAt, existing?.publishedAt) || now,
  );

  return {
    slug,
    categoryZh,
    categoryEn,
    titleZh: finalTitleZh,
    titleEn: finalTitleEn,
    authorZh: authorZh || authorEn,
    authorEn: authorEn || authorZh,
    abstractZh: finalAbstractZh,
    abstractEn: finalAbstractEn,
    issueLabelZh: issueLabelZh || issueLabelEn,
    issueLabelEn: issueLabelEn || issueLabelZh,
    pdfUrl,
    doiUrl,
    publishedAt,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
}

function ensureAuthorized(request: Request, env: Env): Response | null {
  const expectedToken = env.ADMIN_TOKEN?.trim();

  if (!expectedToken) {
    return json(
      {
        error:
          "ADMIN_TOKEN is not configured. Run `wrangler secret put ADMIN_TOKEN` first.",
      },
      500,
    );
  }

  const authorization = request.headers.get("authorization") || "";

  if (authorization !== `Bearer ${expectedToken}`) {
    return json({ error: "Unauthorized." }, 401);
  }

  return null;
}

function isBlockedPath(pathname: string): boolean {
  return (
    BLOCKED_PATHS.includes(pathname) ||
    pathname.startsWith("/.git") ||
    pathname.startsWith("/src/") ||
    pathname.startsWith("/node_modules/")
  );
}

function getSlugFromPath(pathname: string): string {
  if (!pathname.startsWith("/api/articles/")) {
    return "";
  }

  return slugify(decodeURIComponent(pathname.slice("/api/articles/".length)));
}

function articleKey(slug: string): string {
  return `${ARTICLE_PREFIX}${slug}`;
}

function readText(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim();
  }

  return fallback;
}

function readUrl(value: unknown, fallback = ""): string {
  const text = readText(value, fallback);

  if (!text) {
    return "";
  }

  try {
    const url = new URL(text);
    return url.toString();
  } catch {
    throw new Error(`Invalid URL: ${text}`);
  }
}

function normalizeDate(value: string): string {
  const timestamp = parseDate(value);

  if (!Number.isFinite(timestamp)) {
    throw new Error("publishedAt must be a valid date.");
  }

  return new Date(timestamp).toISOString();
}

function parseDate(value: string): number {
  return Date.parse(value);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      ...corsHeaders(),
    },
  });
}

function corsHeaders(): HeadersInit {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
  };
}
