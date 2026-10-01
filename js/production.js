/* Ronix Style Guide — behaviour for the production components.
   Each block is the minimum interaction the component needs to be usable;
   nothing here is decorative. */

(function () {
  "use strict";

  /* ---- Announcement bar ------------------------------------------------ */

  function initAnnounce(root) {
    var bar = root.querySelector(".rx-announce");
    var reset = root.querySelector("[data-announce-reset]");
    var dismiss = bar && bar.querySelector(".rx-announce__dismiss");
    if (!bar || !dismiss) return;

    dismiss.addEventListener("click", function (e) {
      e.preventDefault();
      bar.hidden = true;
      if (reset) reset.hidden = false;
    });

    if (reset) {
      reset.addEventListener("click", function () {
        bar.hidden = false;
        reset.hidden = true;
      });
    }
  }

  /* ---- Similar-model chips --------------------------------------------- */

  function initChips(group) {
    var panel = document.getElementById(group.dataset.chipsTarget);
    if (!panel) return;

    var fields = {
      model: panel.querySelector("[data-field=model]"),
      title: panel.querySelector("[data-field=title]"),
      barcode: panel.querySelector("[data-field=barcode]"),
      image: panel.querySelector("[data-field=image]")
    };

    group.addEventListener("click", function (e) {
      var chip = e.target.closest(".rx-chip");
      if (!chip || !group.contains(chip)) return;
      e.preventDefault();

      group.querySelectorAll(".rx-chip").forEach(function (c) {
        c.setAttribute("aria-current", String(c === chip));
      });

      if (fields.model) fields.model.textContent = "Model : " + chip.dataset.model;
      if (fields.title) fields.title.textContent = chip.dataset.title;
      if (fields.barcode) fields.barcode.textContent = "Barcode for colour box: " + chip.dataset.barcode;
      if (fields.image && chip.dataset.image) fields.image.src = chip.dataset.image;
    });
  }

  /* ---- Chevron rail ----------------------------------------------------- */

  function initRail(rail) {
    var track = rail.querySelector(".rx-rail__track");
    var prev = rail.querySelector("[data-rail=prev]");
    var next = rail.querySelector("[data-rail=next]");
    if (!track || !prev || !next) return;

    function step() {
      var first = track.firstElementChild;
      if (!first) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    }

    function sync() {
      var max = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= max;
    }

    prev.addEventListener("click", function () { track.scrollLeft -= step(); });
    next.addEventListener("click", function () { track.scrollLeft += step(); });
    track.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    sync();
  }

  /* ---- Video testimonial card ------------------------------------------- */

  function initVideo(player) {
    player.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      player.click();
    });

    player.addEventListener("click", function () {
      var playing = player.dataset.playing === "true";

      document.querySelectorAll(".rx-video-card__player").forEach(function (p) {
        p.dataset.playing = "false";
      });

      player.dataset.playing = playing ? "false" : "true";

      /* Restart the progress animation on each play. */
      var fill = player.querySelector(".rx-video-card__progress span");
      if (fill && !playing) {
        fill.style.animation = "none";
        void fill.offsetWidth;
        fill.style.animation = "";
      }
    });
  }

  /* ---- Review list ------------------------------------------------------ */

  function initReviews(list) {
    var write = list.querySelector(".rx-reviews__write");
    var form = list.querySelector(".rx-reviews__form");
    var more = list.querySelector(".rx-reviews__more");

    if (write && form) {
      write.addEventListener("click", function () {
        var open = form.dataset.open === "true";
        form.dataset.open = open ? "false" : "true";
        write.setAttribute("aria-expanded", String(!open));
        if (!open) {
          var field = form.querySelector("input, textarea");
          if (field) field.focus();
        }
      });

      var post = form.querySelector("[data-post]");
      if (post) {
        post.addEventListener("click", function () {
          var name = form.querySelector("[name=name]");
          var body = form.querySelector("[name=body]");
          if (!body || !body.value.trim()) { if (body) body.focus(); return; }

          var anchor = list.querySelector(".rx-review");
          var item = buildReview(
            name && name.value.trim() ? name.value.trim() : "You",
            new Date().toISOString().slice(0, 10),
            body.value.trim()
          );
          anchor.parentNode.insertBefore(item, anchor);
          bindReply(item);

          body.value = "";
          if (name) name.value = "";
          form.dataset.open = "false";
          write.setAttribute("aria-expanded", "false");
        });
      }
    }

    list.querySelectorAll(".rx-review").forEach(bindReply);

    if (more) {
      more.addEventListener("click", function () {
        var hidden = list.querySelectorAll(".rx-review[hidden]");
        Array.prototype.slice.call(hidden, 0, 3).forEach(function (r) { r.hidden = false; });
        if (list.querySelectorAll(".rx-review[hidden]").length === 0) more.hidden = true;
      });
    }
  }

  function bindReply(review) {
    var button = review.querySelector(".rx-review__reply");
    var form = review.querySelector(".rx-review__form");
    if (!button || !form) return;
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";

    button.addEventListener("click", function () {
      var open = form.dataset.open === "true";
      form.dataset.open = open ? "false" : "true";
      button.setAttribute("aria-expanded", String(!open));
      if (!open) {
        var field = form.querySelector("textarea");
        if (field) field.focus();
      }
    });

    var cancel = form.querySelector("[data-cancel]");
    if (cancel) {
      cancel.addEventListener("click", function () {
        form.dataset.open = "false";
        button.setAttribute("aria-expanded", "false");
      });
    }
  }

  function buildReview(author, date, text) {
    var el = document.createElement("article");
    el.className = "rx-review";
    el.innerHTML =
      '<p class="rx-review__meta">' +
        '<span class="rx-review__author"></span>' +
        '<span class="rx-review__date"></span>' +
      "</p>" +
      '<p class="rx-review__body"></p>' +
      '<p class="rx-review__actions">' +
        '<button class="rx-review__reply" type="button" aria-expanded="false">Reply</button>' +
      "</p>" +
      '<div class="rx-review__form">' +
        '<textarea placeholder="Write a reply"></textarea>' +
        '<div class="rx-review__form-actions">' +
          '<button class="rx-btn rx-btn--ghost" type="button" data-cancel>Cancel</button>' +
          '<button class="rx-btn rx-btn--primary" type="button">Post reply</button>' +
        "</div>" +
      "</div>";

    el.querySelector(".rx-review__author").textContent = "@" + author;
    el.querySelector(".rx-review__date").textContent = date;
    el.querySelector(".rx-review__body").textContent = text;
    return el;
  }

  /* ---- Boot -------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-announce]").forEach(initAnnounce);
    document.querySelectorAll("[data-chips-target]").forEach(initChips);
    document.querySelectorAll(".rx-rail").forEach(initRail);
    document.querySelectorAll(".rx-video-card__player").forEach(initVideo);
    document.querySelectorAll(".rx-reviews").forEach(initReviews);
  });
})();
