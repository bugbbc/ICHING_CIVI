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

  function appendLangSpans(parent, zh, en) {
    const zhSpan = document.createElement("span");
    zhSpan.className = "lang-zh";
    zhSpan.textContent = zh;

    const enSpan = document.createElement("span");
    enSpan.className = "lang-en";
    enSpan.textContent = en;

    parent.append(zhSpan, enSpan);
  }

  function setArticleStatusMessage(message, isError) {
    if (!articleStatus) {
      return;
    }

    articleStatus.classList.toggle("is-error", Boolean(isError));
    articleStatus.replaceChildren();
    appendLangSpans(articleStatus, message.zh, message.en);
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

  async function loadLatestArticles() {
    if (!articleGrid || !articleStatus) {
      return;
    }

    setArticleStatusMessage(articleMessages.loading, false);

    try {
      const response = await fetch("/api/articles?limit=12", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Unexpected status ${response.status}`);
      }

      const payload = await response.json();
      const articles = Array.isArray(payload.articles) ? payload.articles : [];

      if (!articles.length) {
        articleGrid.replaceChildren(
          createStateCard(
            "暂未发布正式文章",
            "No Published Articles Yet",
            "本栏将在文章正式刊发后发布题名、作者、摘要与访问链接。",
            "This section will publish titles, authors, abstracts, and access links once articles are formally released.",
          ),
        );
        setArticleStatusMessage(articleMessages.empty, false);
        return;
      }

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
    } catch (error) {
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
  loadLatestArticles();
})();
