/* Lumis Media — lightweight i18n engine (no build step, no fetch/CORS issues). */
(function () {
  "use strict";

  var DICTS = window.LUMIS_I18N || {};
  var SUPPORTED = Object.keys(DICTS);
  var STORAGE_KEY = "lumis-lang";
  var LANG_LABELS = { en: "EN", de: "DE" };

  function resolve(dict, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, dict);
  }

  function detectLang() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) !== -1 ? nav : "en";
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "en";
    var dict = DICTS[lang];
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = resolve(dict, el.getAttribute("data-i18n"));
      if (value !== undefined) el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var value = resolve(dict, el.getAttribute("data-i18n-placeholder"));
      if (value !== undefined) el.setAttribute("placeholder", value);
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      var value = resolve(dict, el.getAttribute("data-i18n-aria-label"));
      if (value !== undefined) el.setAttribute("aria-label", value);
    });

    var titleEl = document.querySelector("[data-page-title]");
    if (titleEl) {
      var titleValue = resolve(dict, titleEl.getAttribute("data-page-title"));
      if (titleValue !== undefined) document.title = titleValue;
    }

    document.querySelectorAll("[data-lang-option]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-lang-option") === lang;
      btn.setAttribute("aria-current", isActive ? "true" : "false");
    });
    document.querySelectorAll("[data-lang-current]").forEach(function (el) {
      el.textContent = LANG_LABELS[lang] || lang.toUpperCase();
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent("lumis:langchange", { detail: { lang: lang } }));
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(detectLang());

    document.querySelectorAll("[data-lang-option]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang-option"));
        var switcher = btn.closest("[data-lang-switch]");
        if (switcher) switcher.classList.remove("open");
      });
    });

    document.querySelectorAll("[data-lang-toggle]").forEach(function (toggle) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var switcher = toggle.closest("[data-lang-switch]");
        if (switcher) switcher.classList.toggle("open");
      });
    });

    document.addEventListener("click", function () {
      document.querySelectorAll("[data-lang-switch].open").forEach(function (s) {
        s.classList.remove("open");
      });
    });
  });
})();
