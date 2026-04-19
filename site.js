(function () {
  const body = document.body;
  const html = document.documentElement;
  const langSwitch = document.getElementById("lang-switch");
  const titleText = {
    zh: body.dataset.titleZh || document.title,
    en: body.dataset.titleEn || document.title,
  };
  const articleGrid = document.querySelector(".js-article-grid");
  const articleStatus = document.querySelector("[data-article-status]");
  const archiveDirectory = document.querySelector(".js-archive-directory");
  const archiveStatus = document.querySelector("[data-archive-status]");
  const pageLinks = Array.from(document.querySelectorAll('a[href]'));
  const articleMessages = {
    loading: {
      zh: "正在加载最新文章……",
      en: "Loading latest articles...",
    },
    empty: {
      zh: "当前尚无已发布文章。",
      en: "No published articles are available at the moment.",
    },
    error: {
      zh: "最新文章暂时无法显示，请稍后再试。",
      en: "Latest articles are temporarily unavailable. Please try again later.",
    },
  };
  const archiveMessages = {
    loading: {
      zh: "正在加载第一卷目录……",
      en: "Loading the Volume 1 table of contents...",
    },
    empty: {
      zh: "第一卷目录暂未发布。",
      en: "The Volume 1 table of contents has not been published yet.",
    },
    error: {
      zh: "第一卷目录暂时无法显示，请稍后再试。",
      en: "The Volume 1 table of contents is temporarily unavailable. Please try again later.",
    },
  };

  function appendLangSpans(parent, zh, en) {
    const zhSpan = document.createElement("span");
    zhSpan.className = "lang-zh";
    zhSpan.textContent = zh;

    const enSpan = document.createElement("span");
    enSpan.className = "lang-en";
    enSpan.textContent = en;

    parent.append(zhSpan, enSpan);
  }

  function setStatusMessage(node, message, isError) {
    if (!node) {
      return;
    }

    node.classList.toggle("is-error", Boolean(isError));
    node.replaceChildren();
    appendLangSpans(node, message.zh, message.en);
  }

  function setArticleStatusMessage(message, isError) {
    setStatusMessage(articleStatus, message, isError);
  }

  function setArchiveStatusMessage(message, isError) {
    setStatusMessage(archiveStatus, message, isError);
  }

  function normalizeLang(value) {
    return value === "zh" ? "zh" : "en";
  }

  function getInitialLanguage() {
    const params = new URLSearchParams(window.location.search);
    return normalizeLang(params.get("lang"));
  }

  function isJournalPageLink(link) {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
      return false;
    }

    const url = new URL(href, window.location.href);
    const isSameOrigin = url.origin === window.location.origin;
    const isHtmlPage =
      url.pathname.endsWith(".html") || url.pathname === "/" || url.pathname === "";

    return isSameOrigin && isHtmlPage;
  }

  function updateInternalLinks(lang) {
    pageLinks.forEach((link) => {
      if (!isJournalPageLink(link)) {
        return;
      }

      const url = new URL(link.getAttribute("href"), window.location.href);

      if (lang === "zh") {
        url.searchParams.set("lang", "zh");
      } else {
        url.searchParams.delete("lang");
      }

      link.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
    });
  }

  function updateCurrentUrl(lang) {
    const url = new URL(window.location.href);

    if (lang === "zh") {
      url.searchParams.set("lang", "zh");
    } else {
      url.searchParams.delete("lang");
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function formatArticleDate(value, locale) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  function excerptText(value, maxLength) {
    const text = String(value || "").trim();

    if (!text || text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength).trimEnd()}...`;
  }

  function createPillLink(labelZh, labelEn, href) {
    const element = href
      ? document.createElement("a")
      : document.createElement("span");
    element.className = "pill-link";

    if (href) {
      element.href = href;
      element.target = "_blank";
      element.rel = "noreferrer";
    } else {
      element.classList.add("is-disabled");
    }

    appendLangSpans(element, labelZh, labelEn);
    return element;
  }

  function createStateCard(titleZh, titleEn, copyZh, copyEn) {
    const card = document.createElement("article");
    card.className = "article-card article-empty-card";

    const meta = document.createElement("span");
    meta.className = "article-meta";
    appendLangSpans(meta, "Publishing Queue", "Publishing Queue");

    const title = document.createElement("h3");
    appendLangSpans(title, titleZh, titleEn);

    const copy = document.createElement("p");
    appendLangSpans(copy, copyZh, copyEn);

    const actions = document.createElement("div");
    actions.className = "article-actions";
    actions.append(
      createPillLink("刊载通知", "Publication Notice", ""),
      createPillLink("卷册目录", "Volume Listing", ""),
    );

    card.append(meta, title, copy, actions);
    return card;
  }

  function createArchiveStateCard(titleZh, titleEn, copyZh, copyEn) {
    const card = document.createElement("article");
    card.className = "archive-entry archive-entry-empty";

    const body = document.createElement("div");
    body.className = "archive-entry-body";

    const meta = document.createElement("p");
    meta.className = "archive-entry-meta";
    appendLangSpans(meta, "Volume 1", "Volume 1");

    const title = document.createElement("h3");
    title.className = "archive-entry-title";
    appendLangSpans(title, titleZh, titleEn);

    const copy = document.createElement("p");
    copy.className = "archive-entry-summary";
    appendLangSpans(copy, copyZh, copyEn);

    const actions = document.createElement("div");
    actions.className = "archive-entry-actions";
    actions.append(
      createPillLink("卷册说明", "Volume Overview", ""),
      createPillLink("作者指南", "Author Guidelines", "author-guidelines.html"),
    );

    body.append(meta, title, copy, actions);
    card.append(body);
    return card;
  }

  function renderArticleCard(article) {
    const card = document.createElement("article");
    card.className = "article-card";

    const categoryZh = article.categoryZh || article.categoryEn || "研究论文";
    const categoryEn = article.categoryEn || article.categoryZh || "Article";
    const titleZh = article.titleZh || article.titleEn || "未命名文章";
    const titleEn = article.titleEn || article.titleZh || "Untitled Article";
    const abstractZh = article.abstractZh || article.abstractEn || "";
    const abstractEn = article.abstractEn || article.abstractZh || "";
    const authorZh = article.authorZh || article.authorEn || "";
    const authorEn = article.authorEn || article.authorZh || "";
    const dateZh = formatArticleDate(article.publishedAt, "zh-CN");
    const dateEn = formatArticleDate(article.publishedAt, "en-US");
    const bylineZh = [authorZh, dateZh].filter(Boolean).join(" · ");
    const bylineEn = [authorEn, dateEn].filter(Boolean).join(" · ");

    const meta = document.createElement("span");
    meta.className = "article-meta";
    appendLangSpans(meta, categoryZh, categoryEn);

    const title = document.createElement("h3");
    appendLangSpans(title, titleZh, titleEn);

    const byline = document.createElement("p");
    byline.className = "article-byline";
    appendLangSpans(byline, bylineZh, bylineEn);

    const abstract = document.createElement("p");
    appendLangSpans(abstract, abstractZh, abstractEn);

    const actions = document.createElement("div");
    actions.className = "article-actions";
    actions.append(
      createPillLink(
        article.pdfUrl ? "查看 PDF" : "PDF 未提供",
        article.pdfUrl ? "View PDF" : "PDF Unavailable",
        article.pdfUrl || "",
      ),
    );

    if (article.doiUrl) {
      actions.append(createPillLink("DOI 链接", "DOI Link", article.doiUrl));
    } else if (article.issueLabelZh || article.issueLabelEn) {
      actions.append(
        createPillLink(
          article.issueLabelZh || article.issueLabelEn,
          article.issueLabelEn || article.issueLabelZh,
          "",
        ),
      );
    }

    card.append(meta, title);

    if (bylineZh || bylineEn) {
      card.append(byline);
    }

    card.append(abstract, actions);
    return card;
  }

  function renderArchiveEntry(article, index) {
    const entry = document.createElement("article");
    entry.className = "archive-entry";

    const entryNumber = document.createElement("div");
    entryNumber.className = "archive-entry-number";
    entryNumber.textContent = String(index + 1).padStart(2, "0");

    const body = document.createElement("div");
    body.className = "archive-entry-body";

    const head = document.createElement("div");
    head.className = "archive-entry-head";

    const heading = document.createElement("div");

    const meta = document.createElement("p");
    meta.className = "archive-entry-meta";
    appendLangSpans(
      meta,
      `${article.categoryZh || article.categoryEn || "研究论文"} · ${article.issueLabelZh || article.issueLabelEn || "2027年第一卷"}`,
      `${article.categoryEn || article.categoryZh || "Research Article"} · ${article.issueLabelEn || article.issueLabelZh || "Volume 1 (2027)"}`,
    );

    const title = document.createElement("h3");
    title.className = "archive-entry-title";
    appendLangSpans(
      title,
      article.titleZh || article.titleEn || "未命名文章",
      article.titleEn || article.titleZh || "Untitled Article",
    );

    const byline = document.createElement("p");
    byline.className = "archive-entry-author";
    appendLangSpans(
      byline,
      article.authorZh || article.authorEn || "",
      article.authorEn || article.authorZh || "",
    );

    const dateLine = document.createElement("p");
    dateLine.className = "archive-entry-date";
    appendLangSpans(
      dateLine,
      formatArticleDate(article.publishedAt, "zh-CN"),
      formatArticleDate(article.publishedAt, "en-US"),
    );

    heading.append(meta, title);
    if (article.authorZh || article.authorEn) {
      heading.append(byline);
    }
    if (article.publishedAt) {
      heading.append(dateLine);
    }

    const actions = document.createElement("div");
    actions.className = "archive-entry-actions";
    actions.append(
      createPillLink(
        article.pdfUrl ? "查看 PDF" : "PDF 未提供",
        article.pdfUrl ? "View PDF" : "PDF Unavailable",
        article.pdfUrl || "",
      ),
      createPillLink(
        article.issueLabelZh || article.issueLabelEn || "2027年第一卷",
        article.issueLabelEn || article.issueLabelZh || "Volume 1 (2027)",
        "",
      ),
    );

    const summary = document.createElement("p");
    summary.className = "archive-entry-summary";
    appendLangSpans(
      summary,
      excerptText(article.abstractZh || article.abstractEn || "", 240),
      excerptText(article.abstractEn || article.abstractZh || "", 240),
    );

    head.append(heading, actions);
    body.append(head, summary);
    entry.append(entryNumber, body);
    return entry;
  }

  function sortArticles(articles) {
    return [...articles].sort((left, right) => {
      const leftTime = Date.parse(left.publishedAt || "");
      const rightTime = Date.parse(right.publishedAt || "");

      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
        return String(left.titleEn || left.titleZh || "").localeCompare(
          String(right.titleEn || right.titleZh || ""),
        );
      }

      return rightTime - leftTime;
    });
  }

  async function requestArticleSource(url) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status} for ${url}`);
    }

    const payload = await response.json();
    return Array.isArray(payload.articles) ? payload.articles : [];
  }

  async function getArticleCollection() {
    const sources = ["/api/articles?limit=12", "/articles.json"];
    let sawSuccess = false;
    let lastError = null;

    for (const source of sources) {
      try {
        const articles = await requestArticleSource(source);
        sawSuccess = true;

        if (articles.length) {
          return sortArticles(articles);
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError && !sawSuccess) {
      throw lastError;
    }

    return [];
  }

  async function loadArticleCollections() {
    if (!articleGrid && !archiveDirectory) {
      return;
    }

    if (articleGrid) {
      setArticleStatusMessage(articleMessages.loading, false);
    }

    if (archiveDirectory) {
      setArchiveStatusMessage(archiveMessages.loading, false);
    }

    try {
      const articles = await getArticleCollection();

      if (!articles.length) {
        if (articleGrid) {
          articleGrid.replaceChildren(
            createStateCard(
              "暂未发布正式文章",
              "No Published Articles Yet",
              "本栏将在文章正式刊发后发布题名、作者、摘要与访问链接。",
              "This section will publish titles, authors, abstracts, and access links once articles are formally released.",
            ),
          );
        }

        if (archiveDirectory) {
          archiveDirectory.replaceChildren(
            createArchiveStateCard(
              "第一卷目录暂未发布",
              "The Volume 1 Contents Are Not Yet Published",
              "卷内目录将在文章正式上线后列出题名、作者、摘要与 PDF 访问入口。",
              "The volume directory will list titles, authors, abstracts, and PDF access links once the articles are formally published.",
            ),
          );
        }

        setArticleStatusMessage(articleMessages.empty, false);
        setArchiveStatusMessage(archiveMessages.empty, false);
        return;
      }

      if (articleGrid) {
        articleGrid.replaceChildren(
          ...articles.map((article) => renderArticleCard(article)),
        );
        setArticleStatusMessage(
          {
            zh: `已载入 ${articles.length} 篇最新文章。`,
            en: `Loaded ${articles.length} latest articles.`,
          },
          false,
        );
      }

      if (archiveDirectory) {
        archiveDirectory.replaceChildren(
          ...articles.map((article, index) => renderArchiveEntry(article, index)),
        );
        setArchiveStatusMessage(
          {
            zh: `已载入第一卷 ${articles.length} 篇文章。`,
            en: `Loaded ${articles.length} articles for Volume 1.`,
          },
          false,
        );
      }
    } catch (error) {
      if (articleGrid) {
        articleGrid.replaceChildren(
          createStateCard(
            "文章列表暂时不可用",
            "Article List Temporarily Unavailable",
            "当前文章目录正在更新中，请稍后刷新页面，或先浏览过刊目录与作者指南。",
            "The article list is currently being updated. Please refresh later, or browse the archives and author guidelines in the meantime.",
          ),
        );
        setArticleStatusMessage(articleMessages.error, true);
      }

      if (archiveDirectory) {
        archiveDirectory.replaceChildren(
          createArchiveStateCard(
            "第一卷目录暂时不可用",
            "The Volume 1 Table of Contents Is Temporarily Unavailable",
            "当前目录正在更新中，请稍后刷新页面，或先浏览最新文章与作者指南。",
            "The directory is currently being updated. Please refresh later, or browse the latest articles and author guidelines in the meantime.",
          ),
        );
        setArchiveStatusMessage(archiveMessages.error, true);
      }
    }
  }

  function setLanguage(lang) {
    const nextLang = normalizeLang(lang);

    body.dataset.lang = nextLang;
    html.dataset.preferredLang = nextLang;
    html.lang = nextLang === "zh" ? "zh-CN" : "en";
    document.title = titleText[nextLang];
    updateInternalLinks(nextLang);
    updateCurrentUrl(nextLang);

    if (langSwitch) {
      langSwitch.textContent = nextLang === "zh" ? "EN" : "中文";
      langSwitch.setAttribute(
        "aria-label",
        nextLang === "zh" ? "Switch to English" : "切换到中文",
      );
    }
  }

  if (langSwitch) {
    langSwitch.addEventListener("click", () => {
      const nextLang = body.dataset.lang === "zh" ? "en" : "zh";
      setLanguage(nextLang);
    });
  }

  setLanguage(getInitialLanguage());
  loadArticleCollections();
})();
