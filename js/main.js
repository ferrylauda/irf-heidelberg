(function () {
  "use strict";

  var SUPPORTED = ["en", "id", "de"];
  var STORAGE_KEY = "irf-lang";
  var html = document.documentElement;
  var header = document.querySelector(".site-header");

  /* ---------- Language ---------- */

  function storageGetKey(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSetKey(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }
  function storageGet() { return storageGetKey(STORAGE_KEY); }
  function storageSet(value) { storageSetKey(STORAGE_KEY, value); }

  function detectLanguage() {
    var fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED.indexOf(fromUrl) !== -1) return fromUrl;

    var saved = storageGet();
    if (SUPPORTED.indexOf(saved) !== -1) return saved;

    var browser = (navigator.languages || [navigator.language || "en"]);
    for (var i = 0; i < browser.length; i++) {
      var code = String(browser[i]).slice(0, 2).toLowerCase();
      if (code === "in") code = "id"; // legacy code for Indonesian
      if (SUPPORTED.indexOf(code) !== -1) return code;
    }
    return "en";
  }

  function applyLanguage(lang) {
    var dict = (window.I18N && window.I18N[lang]) || {};
    var fallback = (window.I18N && window.I18N.en) || {};

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var text = dict[key] || fallback[key];
      if (text) el.textContent = text;
    });

    html.setAttribute("lang", lang);

    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });

    renderNews(lang);
  }

  /* ---------- News & breaking-news pop-up (data in js/news.js) ---------- */

  var NOTICE_KEY = "irf-notice-closed";

  function pick(texts, lang) {
    if (!texts) return "";
    return texts[lang] || texts.en || "";
  }

  function formatDate(iso, lang) {
    var d = new Date(iso + "T12:00:00");
    if (isNaN(d)) return iso;
    var locale = { en: "en-GB", id: "id-ID", de: "de-DE" }[lang] || lang;
    return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  }

  function newsItem(title, text, meta, breaking) {
    var li = document.createElement("li");
    li.className = "news-item" + (breaking ? " is-breaking" : "");
    var m = document.createElement("p");
    m.className = "news-meta";
    m.textContent = meta;
    var h = document.createElement("h3");
    h.textContent = title;
    var p = document.createElement("p");
    p.textContent = text;
    li.appendChild(m);
    li.appendChild(h);
    li.appendChild(p);
    return li;
  }

  function renderNews(lang) {
    var news = window.NEWS || {};
    var dict = (window.I18N && window.I18N[lang]) || {};
    var breaking = news.breaking && news.breaking.active ? news.breaking : null;

    var list = document.getElementById("news-list");
    if (list) {
      list.innerHTML = "";
      if (breaking) {
        list.appendChild(newsItem(pick(breaking.title, lang), pick(breaking.text, lang),
          dict["notice.label"] || window.I18N.en["notice.label"], true));
      }
      (news.items || []).forEach(function (item) {
        list.appendChild(newsItem(pick(item.title, lang), pick(item.text, lang), formatDate(item.date, lang), false));
      });
      var empty = document.getElementById("news-empty");
      if (empty) empty.hidden = list.children.length > 0;
    }

    var dialog = document.getElementById("notice-dialog");
    if (dialog && breaking) {
      document.getElementById("notice-title").textContent = pick(breaking.title, lang);
      document.getElementById("notice-text").textContent = pick(breaking.text, lang);
    }
  }

  function showBreakingNews() {
    var news = window.NEWS || {};
    var breaking = news.breaking;
    var dialog = document.getElementById("notice-dialog");
    if (!dialog || !breaking || !breaking.active || typeof dialog.showModal !== "function") return;
    if (storageGetKey(NOTICE_KEY) === String(breaking.id)) return;

    dialog.addEventListener("close", function () { storageSetKey(NOTICE_KEY, String(breaking.id)); });
    // Clicking the dark backdrop also closes the pop-up
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
    dialog.showModal();
  }

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      storageSet(lang);
      applyLanguage(lang);
    });
  });

  applyLanguage(detectLanguage());
  showBreakingNews();

  /* ---------- Header & mobile menu ---------- */

  var toggle = document.querySelector(".nav-toggle");

  function setMenu(open) {
    if (!header || !toggle) return;
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!header.classList.contains("menu-open"));
    });
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link & reveal animations ---------- */

  if ("IntersectionObserver" in window) {
    var links = {};
    document.querySelectorAll('.main-nav a[href^="#"]').forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].classList.remove("active"); });
        var link = links[entry.target.id];
        if (link) link.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    document.querySelectorAll("main section[id]").forEach(function (s) { sectionObserver.observe(s); });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll(".section .container").forEach(function (el) {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }

  /* ---------- Click-to-load map (no third-party request before consent) ---------- */

  document.querySelectorAll(".map-load").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var frame = btn.closest(".map-frame");
      var iframe = document.createElement("iframe");
      iframe.src = frame.getAttribute("data-src");
      iframe.title = "Map";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer";
      frame.innerHTML = "";
      frame.appendChild(iframe);
    });
  });

  /* ---------- Contact form ----------
     Messages go to a small AWS backend (backend/contact-form.yaml) that e-mails
     them to a private mailbox; nothing is stored and no address is shown on the site.
     Paste the "ContactEndpoint" URL of the deployed stack below. While it is empty
     the form only validates and says honestly that nothing was sent. */

  var CONTACT_ENDPOINT = "";
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function t(key) {
    var lang = html.getAttribute("lang");
    var dict = (window.I18N && window.I18N[lang]) || {};
    var fallback = (window.I18N && window.I18N.en) || {};
    return dict[key] || fallback[key] || key;
  }

  function setI18n(el, key) {
    el.setAttribute("data-i18n", key); // so it is re-translated when the language changes
    el.textContent = t(key);
  }

  function sendContactMessage(form) {
    if (!CONTACT_ENDPOINT) return Promise.resolve("demo");
    return fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        subject: form.elements.subject.value,
        message: form.elements.message.value.trim(),
        consent: form.elements.consent.checked,
        website: form.elements.website.value, // honeypot, normally empty
        lang: html.getAttribute("lang")
      })
    }).then(function (res) { return res.ok ? "sent" : "failed"; },
            function () { return "failed"; });
  }

  function validateField(field) {
    var value = field.type === "checkbox" ? field.checked : field.value.trim();
    switch (field.name) {
      case "name": return value ? "" : "contact.errorName";
      case "email":
        if (!value) return "contact.errorEmail";
        return EMAIL_PATTERN.test(value) ? "" : "contact.errorEmailInvalid";
      case "subject": return value ? "" : "contact.errorSubject";
      case "message": return value.length >= 10 ? "" : "contact.errorMessage";
      case "consent": return value ? "" : "contact.errorConsent";
      default: return "";
    }
  }

  function showFieldError(field, key) {
    var error = document.getElementById("error-" + field.name);
    field.setAttribute("aria-invalid", String(Boolean(key)));
    field.closest(".field").classList.toggle("has-error", Boolean(key));
    if (key) {
      setI18n(error, key);
    } else {
      error.removeAttribute("data-i18n");
      error.textContent = "";
    }
  }

  (function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var fields = Array.prototype.filter.call(form.querySelectorAll("input, select, textarea"),
      function (f) { return f.name !== "website"; });
    var summary = document.getElementById("form-error-summary");
    var status = document.getElementById("form-status");
    var submitButton = form.querySelector("button[type=submit]");
    var prayerHint = document.getElementById("prayer-hint");
    var submitted = false;
    var sending = false;

    function showStatus(state) {
      setI18n(document.getElementById("form-status-title"), "contact." + state + "Title");
      setI18n(document.getElementById("form-status-text"), "contact." + state + "Text");
      status.classList.toggle("is-success", state === "sent");
      status.classList.toggle("is-error", state === "failed");
      status.hidden = false;
      status.focus();
    }

    // After the first submit attempt, re-check fields while typing
    fields.forEach(function (field) {
      var evt = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(evt, function () {
        if (submitted) showFieldError(field, validateField(field));
        status.hidden = true;
      });
    });

    // Extra confidentiality note for prayer requests
    form.elements.subject.addEventListener("change", function (e) {
      prayerHint.hidden = e.target.value !== "prayer";
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (sending) return;
      submitted = true;

      var invalid = fields.filter(function (field) {
        var key = validateField(field);
        showFieldError(field, key);
        return Boolean(key);
      });
      if (invalid.length) {
        setI18n(summary, "contact.errorSummary");
        summary.hidden = false;
        status.hidden = true;
        invalid[0].focus();
        return;
      }

      summary.hidden = true;
      sending = true;
      submitButton.disabled = true;
      setI18n(submitButton, "contact.sending");

      sendContactMessage(form).then(function (state) {
        sending = false;
        submitButton.disabled = false;
        setI18n(submitButton, "contact.submit");
        if (state === "sent") {
          form.reset();
          submitted = false;
          prayerHint.hidden = true;
        }
        showStatus(state); // on "failed" the entries are kept so people can retry
      });
    });
  })();

  /* ---------- Footer year ---------- */

  document.querySelectorAll(".year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
