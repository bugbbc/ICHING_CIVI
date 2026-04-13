(function () {
  const body = document.body;
  const html = document.documentElement;
  const langSwitch = document.getElementById("lang-switch");
  const menuToggle = document.getElementById("menu-toggle");
  const navPanel = document.getElementById("nav-panel");
  const titleText = {
    zh: body.dataset.titleZh || document.title,
    en: body.dataset.titleEn || document.title,
  };
  const submissionForms = Array.from(
    document.querySelectorAll(".js-submission-form"),
  );
  const articleGrid = document.querySelector(".js-article-grid");
  const articleStatus = document.querySelector("[data-article-status]");
  const articleTypeLabels = {
    zh: {
      placeholder: "请选择稿件类型",
      research: "研究论文",
      textual: "文本札记",
      translation: "译介与评注",
      review: "书评或综述",
      report: "学术动态",
    },
    en: {
      placeholder: "Select manuscript type",
      research: "Research Article",
      textual: "Textual Note",
      translation: "Translation and Commentary",
      review: "Review Essay or Book Review",
      report: "Scholarly Report",
    },
  };
  const formMessages = {
    invalid: {
      zh: "请至少填写姓名、邮箱、稿件标题和摘要。",
      en: "Please provide your name, email, manuscript title, and abstract.",
    },
    opened: {
      zh: "已为你准备投稿邮件，请在弹出的邮件客户端中附上稿件文件后发送。",
      en: "A submission draft has been prepared. Attach your manuscript file in your email client before sending.",
    },
    fallback: {
      zh: "若未自动打开邮件客户端，请直接发送至 submission@ichingandcivilization.org。",
      en: "If your email client does not open automatically, send your submission to submission@ichingandcivilization.org.",
    },
  };
  const articleMessages = {
    loading: {
      zh: "正在从数据库读取文章列表……",
      en: "Loading articles from the database...",
    },
    empty: {
      zh: "数据库已连接，但暂时还没有已发布文章。",
      en: "The database is connected, but no published articles are available yet.",
    },
    error: {
      zh: "文章列表暂时无法读取，请稍后重试。",
      en: "The article list is temporarily unavailable. Please try again later.",
    },
  };

  function updatePlaceholders(lang) {
    document
      .querySelectorAll("[data-placeholder-zh][data-placeholder-en]")
      .forEach((field) => {
        const placeholder =
          field.getAttribute(
            lang === "zh" ? "data-placeholder-zh" : "data-placeholder-en",
          ) || "";
        field.setAttribute("placeholder", placeholder);
      });
  }

  function updateSelectLabels(lang) {
    document
      .querySelectorAll('select[name="articleType"] option')
      .forEach((option) => {
        const key = option.value || "placeholder";
        if (articleTypeLabels[lang][key]) {
          option.textContent = articleTypeLabels[lang][key];
        }
      });
  }

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
      createPillLink("内容整理中", "Content in Preparation", ""),
      createPillLink("目录稍后更新", "Index Updates Soon", ""),
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
        article.pdfUrl ? "查看 PDF" : "PDF 待上线",
        article.pdfUrl ? "View PDF" : "PDF Coming Soon",
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
            "Cloudflare KV 已连接成功。等你写入第一批文章元数据后，这里会自动显示最新目录。",
            "Cloudflare KV is connected. This section will populate automatically once you publish the first article records.",
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
          zh: `已从数据库载入 ${articles.length} 篇文章。`,
          en: `Loaded ${articles.length} articles from the database.`,
        },
        false,
      );
    } catch (error) {
      articleGrid.replaceChildren(
        createStateCard(
          "文章列表暂时不可用",
          "Article List Temporarily Unavailable",
          "数据库接口还没有部署完成，或当前请求失败。完成 Cloudflare 绑定后，这里会自动切换为真实文章列表。",
          "The database API has not been deployed yet, or the current request failed. This section will switch to the live article list once Cloudflare binding is ready.",
        ),
      );
      setArticleStatusMessage(articleMessages.error, true);
    }
  }

  function setLanguage(lang) {
    body.dataset.lang = lang;
    html.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = titleText[lang];
    updatePlaceholders(lang);
    updateSelectLabels(lang);

    if (langSwitch) {
      langSwitch.textContent = lang === "zh" ? "EN" : "中文";
      langSwitch.setAttribute(
        "aria-label",
        lang === "zh" ? "Switch to English" : "切换到中文",
      );
    }

    try {
      localStorage.setItem("journal-language", lang);
    } catch (error) {
      // Ignore storage failures.
    }
  }

  if (langSwitch) {
    langSwitch.addEventListener("click", () => {
      const nextLang = body.dataset.lang === "zh" ? "en" : "zh";
      setLanguage(nextLang);
    });
  }

  if (menuToggle && navPanel) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navPanel.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    Array.from(document.querySelectorAll(".nav-links a")).forEach((link) => {
      link.addEventListener("click", () => {
        navPanel.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (!navPanel.contains(event.target) && event.target !== menuToggle) {
        navPanel.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) {
        navPanel.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  submissionForms.forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    const recipient =
      form.dataset.recipient || "submission@ichingandcivilization.org";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const lang = body.dataset.lang === "en" ? "en" : "zh";
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const affiliation = String(data.get("affiliation") || "").trim();
      const manuscriptTitle = String(data.get("manuscriptTitle") || "").trim();
      const articleType = String(data.get("articleType") || "").trim();
      const keywords = String(data.get("keywords") || "").trim();
      const abstract = String(data.get("abstract") || "").trim();
      const note = String(data.get("note") || "").trim();

      if (!name || !email || !manuscriptTitle || !abstract) {
        if (status) {
          status.textContent = formMessages.invalid[lang];
        }
        return;
      }

      const typeLabel = articleTypeLabels[lang][articleType] || articleType;
      const subject =
        lang === "zh"
          ? `《易經與文明》投稿：${manuscriptTitle}`
          : `Submission to I CHING AND CIVILIZATION: ${manuscriptTitle}`;
      const lines =
        lang === "zh"
          ? [
              "《易經與文明》编辑部：",
              "",
              "您好，以下是我的投稿信息，请查收。",
              "",
              `姓名：${name}`,
              `邮箱：${email}`,
              `机构：${affiliation || "-"}`,
              `稿件标题：${manuscriptTitle}`,
              `稿件类型：${typeLabel || "-"}`,
              `关键词：${keywords || "-"}`,
              "",
              "摘要：",
              abstract,
              "",
              "补充说明：",
              note || "-",
              "",
              "我将把稿件文件作为附件一并发送。",
            ]
          : [
              "To the editorial office of I CHING AND CIVILIZATION,",
              "",
              "Please find my submission details below.",
              "",
              `Name: ${name}`,
              `Email: ${email}`,
              `Affiliation: ${affiliation || "-"}`,
              `Manuscript title: ${manuscriptTitle}`,
              `Manuscript type: ${typeLabel || "-"}`,
              `Keywords: ${keywords || "-"}`,
              "",
              "Abstract:",
              abstract,
              "",
              "Additional note:",
              note || "-",
              "",
              "I will attach the manuscript file in this email.",
            ];

      if (status) {
        status.textContent = formMessages.opened[lang];
      }

      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;

      window.setTimeout(() => {
        if (status) {
          status.textContent = `${formMessages.opened[lang]} ${formMessages.fallback[lang]}`;
        }
      }, 400);
    });
  });

  let initialLang = "zh";
  try {
    initialLang =
      localStorage.getItem("journal-language") ||
      localStorage.getItem("center-language") ||
      "zh";
  } catch (error) {
    initialLang = "zh";
  }

  setLanguage(initialLang === "en" ? "en" : "zh");
  loadLatestArticles();
})();
