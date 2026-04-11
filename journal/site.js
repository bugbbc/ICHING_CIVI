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
      zh: "若未自动打开邮件客户端，请直接发送至 htxia0413@gmail.com。",
      en: "If your email client does not open automatically, send your submission to htxia0413@gmail.com.",
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
    const recipient = form.dataset.recipient || "htxia0413@gmail.com";

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
})();
