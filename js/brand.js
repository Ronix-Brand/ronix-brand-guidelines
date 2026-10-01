/* Reveal-on-scroll for the brand cover. Elements marked .rx-reveal fade up
   once, in document order, with a small stagger inside each group. */

(function () {
  "use strict";

  function run() {
    var items = document.querySelectorAll(".rx-reveal");
    if (!items.length) return;

    var reduced = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.dataset.revealDelay || "0", 10);
        setTimeout(function () { el.classList.add("is-in"); }, delay);
        observer.unobserve(el);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    items.forEach(function (el, i) {
      /* Stagger siblings so a row of cards arrives in sequence. */
      if (!el.dataset.revealDelay) {
        var sibs = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.dataset.revealDelay = String(Math.min(sibs, 5) * 90);
      }
      observer.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
