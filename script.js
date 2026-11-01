/* =====================================================================
   Tangentgarden — script.js
   Vanilla JS: sticky nav state, mobile menu, scroll progress,
   scroll reveal, animated stat counters, back-to-top, year-agnostic.
   ===================================================================== */

(function () {
  "use strict";

  /* ---------- Screenshot lightbox ---------- */
  var lightbox = document.getElementById("imageLightbox");
  var lightboxImage = document.getElementById("lightboxImage");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxTrigger = null;

  if (lightbox && typeof lightbox.showModal === "function") {
    document.querySelectorAll("a.shot").forEach(function (link) {
      link.setAttribute("aria-haspopup", "dialog");
      link.addEventListener("click", function (event) {
        // Preserve the browser's open-in-new-tab shortcuts.
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        var thumbnail = link.querySelector("img");
        lightboxTrigger = link;
        lightboxImage.src = link.href;
        lightboxImage.alt = thumbnail.alt;
        lightboxCaption.textContent = link.querySelector(".shot-label").textContent;
        lightbox.showModal();
        document.documentElement.classList.add("lightbox-open");
      });
    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", function () {
      lightbox.close();
    });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) lightbox.close();
    });
    // Native dialog handles Escape and keeps keyboard focus inside the modal.
    lightbox.addEventListener("close", function () {
      document.documentElement.classList.remove("lightbox-open");
      lightboxImage.removeAttribute("src");
      if (lightboxTrigger) lightboxTrigger.focus({ preventScroll: true });
    });
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  var header = document.getElementById("siteHeader");
  var progress = document.getElementById("scrollProgress");
  var backToTop = document.getElementById("backToTop");

  function onScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progress) progress.style.width = pct + "%";

    if (header) header.classList.toggle("scrolled", scrollTop > 8);

    if (backToTop) {
      var show = scrollTop > 600;
      backToTop.classList.toggle("show", show);
      backToTop.hidden = !show;
    }
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");

  function closeNav() {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    /* Close on link click (mobile) */
    primaryNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href === "#") return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    closeNav();
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Animated stat counters ---------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var suffix = el.textContent.replace(/[0-9]/g, "").trim();
    var start = 0;
    var duration = 1400;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progressVal = Math.min((ts - startTime) / duration, 1);
      // easeOutQuad
      var eased = 1 - (1 - progressVal) * (1 - progressVal);
      var value = Math.round(start + (target - start) * eased);
      el.textContent = value + suffix;
      if (progressVal < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  var statNums = document.querySelectorAll(".stat-num[data-count]");
  if ("IntersectionObserver" in window && statNums.length) {
    var statIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            statIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    statNums.forEach(function (el) {
      statIO.observe(el);
    });
  }

  /* ---------- FAQ: allow only one open at a time (optional nicety) ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Back to top ---------- */
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Wire scroll (rAF-throttled) ---------- */
  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  onScroll();
})();
