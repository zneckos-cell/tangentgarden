/* ==========================================================
   Tangentgarden — site script (vanilla JS, no dependencies)
   ========================================================== */

/* ---------- Configuration: edit these values ---------- */
const CONFIG = {
  // Replace with your GitHub Release, Itch.io or direct download URL.
  // Leave as "" to keep the URL written in index.html.
  downloadUrl: "",
  // Words shown in the hero typing animation
  typingWords: ["sunflower", "carrot", "lavender", "pumpkin", "tulip", "harvest"],
};

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Download URL ---------- */
  const downloadBtn = document.getElementById("downloadBtn");
  if (CONFIG.downloadUrl) downloadBtn.href = CONFIG.downloadUrl;
  downloadBtn.addEventListener("click", (e) => {
    if (downloadBtn.getAttribute("href") === "#DOWNLOAD_URL") {
      e.preventDefault();
      alert("The download link isn't available yet — check back soon!");
    }
  });

  /* ---------- Sticky nav shadow ---------- */
  const navbar = document.getElementById("navbar");
  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile hamburger menu ---------- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); toggle.focus(); }
  });

  /* ---------- Smooth scrolling (with sticky nav offset) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2 || id === "#DOWNLOAD_URL") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Active nav link highlighting ---------- */
  const navLinks = [...menu.querySelectorAll('a:not(.btn)')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger siblings slightly for a softer effect
          const siblings = [...entry.target.parentElement.children];
          entry.target.style.transitionDelay = `${Math.min(siblings.indexOf(entry.target), 8) * 60}ms`;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      const isOpen = item.classList.contains("open");

      // Close all others (one open at a time)
      document.querySelectorAll(".faq-item.open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-a").style.maxHeight = null;
        }
      });

      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? null : panel.scrollHeight + "px";
    });
  });

  // Keep an open FAQ answer sized correctly when the window is resized
  window.addEventListener("resize", () => {
    document.querySelectorAll(".faq-item.open .faq-a").forEach((a) => { a.style.maxHeight = a.scrollHeight + "px"; });
  });

  /* ---------- Hero typing animation ---------- */
  const typed = document.getElementById("typedText");
  if (reduceMotion) { typed.textContent = CONFIG.typingWords[0]; return; }
  let wordIndex = 0, charIndex = 0, deleting = false;
  const tick = () => {
    const word = CONFIG.typingWords[wordIndex];
    typed.textContent = word.slice(0, charIndex);
    let delay = deleting ? 60 : 120;
    if (!deleting && charIndex === word.length) { delay = 1400; deleting = true; }
    else if (deleting && charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % CONFIG.typingWords.length; delay = 400; }
    else charIndex += deleting ? -1 : 1;
    setTimeout(tick, delay);
  };
  tick();
});
