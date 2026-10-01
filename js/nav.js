/* Ronix Style Guide — chapter navigation, mobile drawer and scroll spy.
   The sidebar is rendered from one source so every page stays in sync. */

(function () {
  "use strict";

  var CHAPTERS = [
    {
      label: "Brand",
      items: [
        { href: "index.html", text: "Brand Guidelines" }
      ]
    },
    {
      label: "Corporate Identity",
      items: [
        { href: "ci-logotype.html", text: "Logotype" },
        { href: "ci-misuse.html", text: "Misuse" },
        { href: "ci-construction.html", text: "Clear space & size" },
        { href: "ci-colour.html", text: "Colour" },
        { href: "ci-typography.html", text: "Typography" },
        { href: "ci-usage.html", text: "Backgrounds" }
      ]
    },
    {
      label: "User Interface · Foundations",
      items: [
        { href: "ui-introduction.html", text: "UI Introduction" },
        { href: "colour.html", text: "Colour" },
        { href: "typography.html", text: "Typography" },
        { href: "layout.html", text: "Layout & Grid" }
      ]
    },
    {
      label: "User Interface · Components",
      items: [
        { href: "components.html", text: "Banner, buttons & cards" },
        { href: "product-card.html", text: "Product card" },
        { href: "product-grid.html", text: "Product grid" },
        { href: "product-line.html", text: "Product line" },
        { href: "categories.html", text: "Category tile" },
        { href: "product-information.html", text: "Product information" },
        { href: "images.html", text: "Images with overlay text" },
        { href: "zigzag.html", text: "Zigzag card" },
        { href: "news.html", text: "News card" },
        { href: "office.html", text: "Office card" },
        { href: "information-cards.html", text: "Information cards" },
        { href: "form.html", text: "Form" },
        { href: "navigation.html", text: "Navigation & footer" },
        { href: "modal.html", text: "Modal & catalogue card" },
        { href: "unrefine.html", text: "Additional components" },
        { href: "production.html", text: "Production components" }
      ]
    },
    {
      label: "Resources",
      items: [
        { href: "tokens.html", text: "Token reference" },
        { href: "inventory.html", text: "Component index" }
      ]
    }
  ];

  function currentPage() {
    var file = window.location.pathname.split("/").pop();
    return file === "" ? "index.html" : file;
  }

  function buildSidebar(sidebar) {
    var page = currentPage();

    CHAPTERS.forEach(function (chapter) {
      var group = document.createElement("div");
      group.className = "sg-sidebar__group";

      var label = document.createElement("p");
      label.className = "sg-sidebar__label";
      label.textContent = chapter.label;
      group.appendChild(label);

      var list = document.createElement("ul");
      list.className = "sg-sidebar__list";

      chapter.items.forEach(function (item) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = item.href;
        a.textContent = item.text;

        if (item.href === page) {
          a.setAttribute("aria-current", "page");
          li.appendChild(a);
          li.appendChild(buildSectionList());
        } else {
          li.appendChild(a);
        }

        list.appendChild(li);
      });

      group.appendChild(list);
      sidebar.appendChild(group);
    });
  }

  /* Sub-navigation: every h2 inside the document column becomes an anchor. */
  function buildSectionList() {
    var sub = document.createElement("ul");
    sub.className = "sg-sidebar__sub";

    document.querySelectorAll(".sg-section > h2[id]").forEach(function (heading) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + heading.id;
      a.textContent = heading.textContent;
      a.dataset.section = heading.id;
      li.appendChild(a);
      sub.appendChild(li);
    });

    return sub;
  }

  function wireDrawer(sidebar) {
    var toggle = document.querySelector(".sg-nav-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    sidebar.addEventListener("click", function (event) {
      if (event.target.tagName === "A" && window.innerWidth <= 767) {
        sidebar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function wireScrollSpy() {
    var links = document.querySelectorAll(".sg-sidebar__sub a[data-section]");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var byId = {};
    links.forEach(function (link) { byId[link.dataset.section] = link; });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = byId[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (other) { other.classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-96px 0px -70% 0px" }
    );

    document.querySelectorAll(".sg-section > h2[id]").forEach(function (heading) {
      observer.observe(heading);
    });
  }

  /* Filter the chapter list from the header search field. */
  function wireSearch(sidebar) {
    var field = document.querySelector(".sg-search input");
    if (!field) return;

    field.addEventListener("input", function () {
      var term = field.value.trim().toLowerCase();

      sidebar.querySelectorAll(".sg-sidebar__list > li").forEach(function (li) {
        var text = li.textContent.toLowerCase();
        li.hidden = term !== "" && text.indexOf(term) === -1;
      });

      sidebar.querySelectorAll(".sg-sidebar__group").forEach(function (group) {
        var visible = group.querySelectorAll(".sg-sidebar__list > li:not([hidden])").length;
        group.hidden = visible === 0;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var sidebar = document.getElementById("sgSidebar");
    if (!sidebar) return;

    buildSidebar(sidebar);
    wireDrawer(sidebar);
    wireScrollSpy();
    wireSearch(sidebar);
  });
})();
