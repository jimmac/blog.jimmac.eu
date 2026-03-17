// Archive search — filters the articles already rendered on the page.
// No external index needed; works in both `zola serve` and `zola build`.

(function () {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  if (!searchInput || !searchResults) return;

  const articles = Array.from(document.querySelectorAll(".post-item")).map((el) => ({
    el,
    text: el.textContent.toLowerCase(),
  }));

  function updateYearHeadings() {
    document.querySelectorAll("main h2").forEach((h2) => {
      let next = h2.nextElementSibling;
      let hasVisible = false;
      while (next && next.tagName !== "H2") {
        if (next.classList.contains("post-item") && next.style.display !== "none") {
          hasVisible = true;
          break;
        }
        next = next.nextElementSibling;
      }
      h2.style.display = hasVisible ? "" : "none";
    });
  }

  function doFilter(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      articles.forEach(({ el }) => (el.style.display = ""));
      document.querySelectorAll("main h2").forEach((h) => (h.style.display = ""));
      searchResults.innerHTML = "";
      return;
    }

    let matches = 0;
    articles.forEach(({ el, text }) => {
      const visible = text.includes(q);
      el.style.display = visible ? "" : "none";
      if (visible) matches++;
    });

    updateYearHeadings();
    searchResults.innerHTML = matches === 0 ? "<li>No results found.</li>" : "";
  }

  let debounceTimer;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doFilter(e.target.value), 150);
  });
})();
