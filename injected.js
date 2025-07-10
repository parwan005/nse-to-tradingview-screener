(function () {
  const MAX_JQUERY_ATTEMPTS = 10;

  function waitForjQuery(callback) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof window.jQuery !== "undefined") {
        clearInterval(interval);
        callback();
      } else if (attempts >= MAX_JQUERY_ATTEMPTS) {
        console.warn("❌ jQuery not detected after 10 attempts. Aborting.");
        clearInterval(interval);
      } else {
        console.log(`⏳ Waiting for jQuery... Attempt ${attempts}/${MAX_JQUERY_ATTEMPTS}`);
      }
    }, 1000);
  }

  function initializeLinkEnhancer() {
    console.log("🚀 Initializing NSE symbol hover enhancer...");

    let currentMenu = null;
    let hideTimeout;

    function removeExistingMenu() {
      if (currentMenu) {
        currentMenu.remove();
        currentMenu = null;
      }
    }

    function bindHoverMenus() {
      $("a.symbol-word-break").off("mouseenter mouseleave").each(function () {
        const symbol = $(this).text().trim();

        $(this).on("mouseenter", function (e) {
          clearTimeout(hideTimeout);
          removeExistingMenu();

          const rect = this.getBoundingClientRect();
          const menu = document.createElement("div");
          menu.className = "stock-popup-menu";
          menu.innerHTML = `
            <a href="https://in.tradingview.com/chart/?symbol=NSE:${symbol}" target="_blank">📈 TradingView</a> |
            <a href="https://www.screener.in/company/${symbol}/" target="_blank">🔍 Screener</a>
          `;

          menu.style.top = `${window.scrollY + rect.top - 5}px`;
          menu.style.left = `${window.scrollX + rect.right + 10}px`;
          document.body.appendChild(menu);

          currentMenu = menu;

          menu.addEventListener("mouseenter", () => clearTimeout(hideTimeout));
          menu.addEventListener("mouseleave", () => {
            hideTimeout = setTimeout(removeExistingMenu, 300);
          });
        });

        $(this).on("mouseleave", function () {
          hideTimeout = setTimeout(removeExistingMenu, 300);
        });
      });
    }

    function waitForLinksAndBind(attempts = 0) {
      const links = $("a.symbol-word-break");
      if (links.length > 1) {
        bindHoverMenus();
      } else if (attempts < 10) {
        setTimeout(() => waitForLinksAndBind(attempts + 1), 1000);
      } else {
        console.warn("❌ NSE links not found after 10 attempts.");
      }
    }

    // Initial load
    waitForLinksAndBind();

    // After pagination clicks
    $(document).on("click", ".paginationWrap button.btn", () => {
      console.log("🔄 Pagination clicked. Rebinding after delay...");
      setTimeout(waitForLinksAndBind, 1500);
    });
  }

  waitForjQuery(initializeLinkEnhancer);
})();

