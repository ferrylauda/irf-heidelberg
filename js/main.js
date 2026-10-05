(function () {
  "use strict";

  var SUPPORTED = ["en", "id", "de"];
  var STORAGE_KEY = "irf-lang";
  var html = document.documentElement;
  var header = document.querySelector(".site-header");

  /* ---------- Language ---------- */

  function storageGet() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function storageSet(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ignore */ }
  }

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
  }

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      storageSet(lang);
      applyLanguage(lang);
    });
  });

  applyLanguage(detectLanguage());

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

  /* ---------- Footer year ---------- */

  document.querySelectorAll(".year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
