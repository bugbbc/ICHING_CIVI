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

const SEEDED_ARTICLES: ArticleRecord[] = [
  {
    slug: "sun-and-yi",
    categoryZh: "研究论文",
    categoryEn: "Research Article",
    titleZh: "The Way of Sun and Yi in the Zhouyi and Wilson’s Administration",
    titleEn: "The Way of Sun and Yi in the Zhouyi and Wilson’s Administration",
    authorZh: "Zhang Ruoshui (Peking University)",
    authorEn: "Zhang Ruoshui (Peking University)",
    abstractZh:
      "The Sun and Yi hexagrams in the Zhouyi discuss the relationship of loss and gain between the ruler above and the people below. When the ruler diminishes the people below and augments himself, this is in fact to augment the people below. Therefore, diminishing the people must be moderated: what is taken from the people must be used for the people. Only by bestowing benefits upon the people can one win the hearts of the people.",
    abstractEn:
      "The Sun and Yi hexagrams in the Zhouyi discuss the relationship of loss and gain between the ruler above and the people below. When the ruler diminishes the people below and augments himself, this is in fact to augment the people below. Therefore, diminishing the people must be moderated: what is taken from the people must be used for the people. Only by bestowing benefits upon the people can one win the hearts of the people.",
    issueLabelZh: "2026年第一卷",
    issueLabelEn: "Volume 1 (2026)",
    pdfUrl: "/papers/sun-and-yi.pdf",
    doiUrl: "",
    publishedAt: "2026-04-19T07:00:00.000Z",
    createdAt: "2026-04-19T07:00:00.000Z",
    updatedAt: "2026-04-19T07:00:00.000Z",
  },
  {
    slug: "tai-and-pi",
    categoryZh: "研究论文",
    categoryEn: "Research Article",
    titleZh: "The Law of Tai and Pi in the Zhouyi and the Road of Western Democracy",
    titleEn: "The Law of Tai and Pi in the Zhouyi and the Road of Western Democracy",
    authorZh: "Wen Ruyu (Hebei University)",
    authorEn: "Wen Ruyu (Hebei University)",
    abstractZh:
      "The natural law contained in the Tai and Pi hexagrams of the Zhouyi is that the root cause of a nation’s order or chaos lies in whether the ruler respects God and benefits the people. Germany and the United States are two important countries with different traditions, and their rise and decline before and after World War II fully conform to the law of Tai and Pi.",
    abstractEn:
      "The natural law contained in the Tai and Pi hexagrams of the Zhouyi is that the root cause of a nation’s order or chaos lies in whether the ruler respects God and benefits the people. Germany and the United States are two important countries with different traditions, and their rise and decline before and after World War II fully conform to the law of Tai and Pi.",
    issueLabelZh: "2026年第一卷",
    issueLabelEn: "Volume 1 (2026)",
    pdfUrl: "/papers/tai-and-pi.pdf",
    doiUrl: "",
    publishedAt: "2026-04-19T06:00:00.000Z",
    createdAt: "2026-04-19T06:00:00.000Z",
    updatedAt: "2026-04-19T06:00:00.000Z",
  },
  {
    slug: "the-hexagram-song",
    categoryZh: "研究论文",
    categoryEn: "Research Article",
    titleZh: "The Hexagram Song in the Book of Changes and Administrative Litigation",
    titleEn: "The Hexagram Song in the Book of Changes and Administrative Litigation",
    authorZh: "Wang Yulin (Fudan University)",
    authorEn: "Wang Yulin (Fudan University)",
    abstractZh:
      "The Way of the Song hexagram applies not only to modern civil litigation but also to modern administrative litigation. The Song hexagram advocates having no litigation and stopping litigation, while opposing being fond of litigation and exhausting litigation. It offers practical insights for plaintiffs, defendants, and judges in administrative litigation.",
    abstractEn:
      "The Way of the Song hexagram applies not only to modern civil litigation but also to modern administrative litigation. The Song hexagram advocates having no litigation and stopping litigation, while opposing being fond of litigation and exhausting litigation. It offers practical insights for plaintiffs, defendants, and judges in administrative litigation.",
    issueLabelZh: "2026年第一卷",
    issueLabelEn: "Volume 1 (2026)",
    pdfUrl: "/papers/the-hexagram-song.pdf",
    doiUrl: "",
    publishedAt: "2026-04-19T05:00:00.000Z",
    createdAt: "2026-04-19T05:00:00.000Z",
    updatedAt: "2026-04-19T05:00:00.000Z",
  },
  {
    slug: "kan-and-li-hexagrams",
    categoryZh: "研究论文",
    categoryEn: "Research Article",
    titleZh: "The Shang-Zhou Stories in the Kan and Li Hexagrams of the Zhouyi (I Ching)",
    titleEn: "The Shang-Zhou Stories in the Kan and Li Hexagrams of the Zhouyi (I Ching)",
    authorZh: "Ban Kezhen (Tongji University)",
    authorEn: "Ban Kezhen (Tongji University)",
    abstractZh:
      "This article analyzes the hexagram images and line statements of the Kan and Li hexagrams in the Zhouyi, combining them with historical events from the transition period between the Shang and Zhou dynasties, to reveal the humanistic connotations behind these two hexagrams. It argues that the Kan and Li hexagrams serve as metaphors for the power transition and cultural transformation between the Shang and Zhou dynasties.",
    abstractEn:
      "This article analyzes the hexagram images and line statements of the Kan and Li hexagrams in the Zhouyi, combining them with historical events from the transition period between the Shang and Zhou dynasties, to reveal the humanistic connotations behind these two hexagrams. It argues that the Kan and Li hexagrams serve as metaphors for the power transition and cultural transformation between the Shang and Zhou dynasties.",
    issueLabelZh: "2026年第一卷",
    issueLabelEn: "Volume 1 (2026)",
    pdfUrl: "/papers/kan-and-li-hexagrams.pdf",
    doiUrl: "",
    publishedAt: "2026-04-19T04:00:00.000Z",
    createdAt: "2026-04-19T04:00:00.000Z",
    updatedAt: "2026-04-19T04:00:00.000Z",
  },
  {
    slug: "hexagrams-qian",
    categoryZh: "研究论文",
    categoryEn: "Research Article",
    titleZh:
      "On the Similarities between the Hexagrams Qian, Shihe, and Zhongfu in the Book of Changes and Modern Rule of Law Thought",
    titleEn:
      "On the Similarities between the Hexagrams Qian, Shihe, and Zhongfu in the Book of Changes and Modern Rule of Law Thought",
    authorZh: "Zhang Yuanhe (Shanghai Ocean University)",
    authorEn: "Zhang Yuanhe (Shanghai Ocean University)",
    abstractZh:
      "Through the elucidation of the hexagrams Qian, Shihe, and Zhongfu in the Book of Changes, together with an overview of modern rule of law thought, this article argues that these hexagrams share substantial common ground with principles of due process, administration according to law, proportionality, rationality, and trust protection.",
    abstractEn:
      "Through the elucidation of the hexagrams Qian, Shihe, and Zhongfu in the Book of Changes, together with an overview of modern rule of law thought, this article argues that these hexagrams share substantial common ground with principles of due process, administration according to law, proportionality, rationality, and trust protection.",
    issueLabelZh: "2026年第一卷",
    issueLabelEn: "Volume 1 (2026)",
    pdfUrl: "/papers/hexagrams-qian.pdf",
    doiUrl: "",
    publishedAt: "2026-04-19T03:00:00.000Z",
    createdAt: "2026-04-19T03:00:00.000Z",
    updatedAt: "2026-04-19T03:00:00.000Z",
  },
  {
    slug: "leibniz-to-bouvet",
    categoryZh: "文献译介",
    categoryEn: "Translated Text",
    titleZh: "1703年5月18日莱布尼茨致白晋的一封信",
    titleEn: "A Letter from Leibniz to Bouvet, May 18, 1703",
    authorZh: "李婷玉 译（上海海洋大学）",
    authorEn: "Translated by Li Tingyu (Shanghai Ocean University)",
    abstractZh:
      "本文为1703年5月18日莱布尼茨致白晋书信的中文译稿，内容涉及中西知识交流、中国技艺与术语整理、欧洲时局、力学原理，以及二进制算术与伏羲卦象之间的关系，呈现早期中欧思想互动的重要历史材料。",
    abstractEn:
      "This translated document presents Leibniz’s letter to Bouvet dated May 18, 1703. It addresses intellectual exchange between China and Europe, Chinese arts and terminology, the European political situation, principles of dynamics, and the relationship between binary arithmetic and the Fuxi hexagrams.",
    issueLabelZh: "2026年第一卷",
    issueLabelEn: "Volume 1 (2026)",
    pdfUrl: "/papers/leibniz-to-bouvet.pdf",
    doiUrl: "",
    publishedAt: "2026-04-19T00:00:00.000Z",
    createdAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
  },
  {
    slug: "kun-hexagram",
    categoryZh: "研究论文",
    categoryEn: "Research Article",
    titleZh: "The Right-Thought in the Kun Hexagram of the Zhouyi",
    titleEn: "The Right-Thought in the Kun Hexagram of the Zhouyi",
    authorZh: "Li Zhilong (Nanjing University)",
    authorEn: "Li Zhilong (Nanjing University)",
    abstractZh:
      "The Qian and Kun hexagrams are the gateway of the Zhouyi, symbolizing the ruler and the subjects respectively. The Kun hexagram possesses ultimate value and does not subordinate itself to the Qian hexagram. The purport of using six in the Kun hexagram is faith in Heaven, which serves as the spiritual foundation for realizing individual freedom and equality among all people.",
    abstractEn:
      "The Qian and Kun hexagrams are the gateway of the Zhouyi, symbolizing the ruler and the subjects respectively. The Kun hexagram possesses ultimate value and does not subordinate itself to the Qian hexagram. The purport of using six in the Kun hexagram is faith in Heaven, which serves as the spiritual foundation for realizing individual freedom and equality among all people.",
    issueLabelZh: "2026年第一卷",
    issueLabelEn: "Volume 1 (2026)",
    pdfUrl: "/papers/kun-hexagram.pdf",
    doiUrl: "",
    publishedAt: "2026-04-19T01:00:00.000Z",
    createdAt: "2026-04-19T01:00:00.000Z",
    updatedAt: "2026-04-19T01:00:00.000Z",
  },
];

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
  const articles = await getMergedArticleIndex(env);
  const limitValue = Number(url.searchParams.get("limit") || "");
  const limit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 12;

  return json({
    articles: articles.slice(0, limit),
    count: articles.length,
  });
}

async function getSingleArticle(env: Env, slug: string): Promise<Response> {
  const stored = await env.ICHING_KV.get(articleKey(slug), "json");
  const article =
    stored && typeof stored === "object"
      ? stored
      : SEEDED_ARTICLES.find((item) => item.slug === slug);

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

async function getMergedArticleIndex(env: Env): Promise<ArticleRecord[]> {
  const stored = await getArticleIndex(env);
  const bySlug = new Map<string, ArticleRecord>();

  for (const article of SEEDED_ARTICLES) {
    bySlug.set(article.slug, article);
  }

  for (const article of stored) {
    bySlug.set(article.slug, article);
  }

  return Array.from(bySlug.values()).sort(compareArticles);
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
