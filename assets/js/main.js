(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var menuPanel = document.querySelector("[data-mobile-menu]");
  var menuClose = document.querySelector("[data-menu-close]");

  function openMenu() {
    if (!menuPanel) return;
    menuPanel.classList.add("open");
    document.body.style.overflow = "hidden";
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    if (!menuPanel) return;
    menuPanel.classList.remove("open");
    document.body.style.overflow = "";
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }
  if (menuToggle) menuToggle.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (menuPanel) {
    menuPanel.addEventListener("click", function (e) {
      if (e.target === menuPanel) closeMenu();
    });
    menuPanel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------- Animated stat counters ---------- */
  var counters = document.querySelectorAll("[data-counter]");
  function animateCounter(el) {
    var raw = el.getAttribute("data-counter");
    var match = raw.match(/^([^\d]*)(\d+)(.*)$/);
    if (!match) { return; }
    var prefix = match[1], target = parseInt(match[2], 10), suffix = match[3];
    if (prefersReducedMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var start = null;
    var duration = 1200;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- Hero background blob follows pointer (desktop only) ---------- */
  var blob = document.querySelector("[data-hero-blob]");
  var heroSection = document.querySelector("[data-hero]");
  if (blob && heroSection && !prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    heroSection.addEventListener("mousemove", function (e) {
      var rect = heroSection.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      blob.style.transform = "translate(" + (x * 40) + "px, " + (y * 40) + "px)";
    });
  }

  /* ---------- Work filter ---------- */
  var filterButtons = document.querySelectorAll("[data-filter]");
  var projectCards = document.querySelectorAll("[data-project-cat]");
  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var filter = btn.getAttribute("data-filter");
        projectCards.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-project-cat") === filter;
          card.style.display = match ? "" : "none";
        });
      });
    });
  }

  /* ---------- Contact form validation + submission ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[data-required]").forEach(function (field) {
        var wrapper = field.closest(".field");
        var isEmail = field.type === "email";
        var value = field.value.trim();
        var ok = value.length > 0 && (!isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
        if (wrapper) wrapper.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });
      if (!valid) return;

      var submitBtn = form.querySelector("button[type=submit]");
      var successEl = form.querySelector("[data-form-success]");
      var errorEl = form.querySelector("[data-form-error]");
      if (errorEl) errorEl.style.display = "none";
      if (submitBtn) { submitBtn.disabled = true; }

      var endpoint = form.getAttribute("action") || "";
      var ajaxEndpoint = endpoint.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/");

      fetch(ajaxEndpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          if (successEl) successEl.classList.add("show");
          form.reset();
        })
        .catch(function () {
          if (errorEl) errorEl.style.display = "block";
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; }
        });
    });
    form.querySelectorAll("[data-required]").forEach(function (field) {
      field.addEventListener("input", function () {
        var wrapper = field.closest(".field");
        if (wrapper && wrapper.classList.contains("invalid")) {
          wrapper.classList.remove("invalid");
        }
      });
    });
  }

  /* ---------- Newsletter form (front-end only placeholder) ---------- */
  var newsletterForm = document.querySelector("[data-newsletter-form]");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = newsletterForm.querySelector("button");
      var input = newsletterForm.querySelector("input");
      if (input && input.value.trim()) {
        var original = btn.textContent;
        btn.textContent = "✓";
        setTimeout(function () { btn.textContent = original; }, 2200);
        newsletterForm.reset();
      }
    });
  }

  /* ---------- Lazy-fade images once loaded ---------- */
  document.querySelectorAll("img[loading='lazy']").forEach(function (img) {
    if (img.complete) return;
    img.style.opacity = "0";
    img.addEventListener("load", function () {
      img.style.transition = "opacity 400ms ease";
      img.style.opacity = "1";
    });
  });
})();
