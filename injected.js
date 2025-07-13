(function () {
  const MAX_JQUERY_ATTEMPTS = 10;
  const MAX_PAGINATION_RETRIES = 10;

  function waitForjQuery(callback) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof window.jQuery !== "undefined") {
        console.log("✅ jQuery detected.");
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

  function enhanceNseLinks() {
    const $links = $('a.symbol-word-break');

    if ($links.length > 0) {
      console.log(`🔗 Enhancing ${$links.length} NSE links...`);

      const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
      const storedDate = localStorage.getItem("clickedSymbolsDate");

      if (storedDate !== today) {
        // Reset storage for new day
        localStorage.setItem("clickedSymbolsDate", today);
        localStorage.setItem("clickedSymbols", JSON.stringify([]));
      }

      const clickedSymbols = JSON.parse(localStorage.getItem("clickedSymbols") || "[]");

      $links.each(function () {
        const $link = $(this);
        const originalSymbol = $link.text().trim();
        const tvSymbol = originalSymbol.replace("-", "_");
        const tvUrl = `https://in.tradingview.com/chart/?symbol=NSE:${tvSymbol}`;
        const screenerUrl = `https://www.screener.in/company/${originalSymbol}/`;

        // Set TradingView link
        $link.attr("href", tvUrl).attr("target", "_blank");

        // Add "clicked" highlight if applicable
        if (clickedSymbols.includes(originalSymbol)) {
          $link.addClass("clicked-symbol");
        }

        // On TradingView click, mark as clicked
        $link.off("click").on("click", function () {
          if (!clickedSymbols.includes(originalSymbol)) {
            clickedSymbols.push(originalSymbol);
            localStorage.setItem("clickedSymbols", JSON.stringify(clickedSymbols));
          }
          $link.addClass("clicked-symbol");
        });

        // Add Screener icon if not present
        if ($link.next(".screener-link").length === 0) {
          const screenerLink = $(
            `<a class="screener-link" href="${screenerUrl}" target="_blank" title="View on Screener" style="margin-left: 5px; text-decoration: none;">🔍</a>`
          );
          $link.after(screenerLink);
        }
      });
    }
  }

  function observePaginationClicks() {
    $('#first, #prev, #next, #last').on('click', () => {
      console.log("🔄 Pagination button clicked. Monitoring DOM...");

      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const links = $('a.symbol-word-break');
        if (links.length > 1) {
          console.log("✅ Links found after pagination. Enhancing...");
          enhanceNseLinks();
          clearInterval(interval);
        } else if (attempts >= MAX_PAGINATION_RETRIES) {
          console.warn("❌ Pagination retry limit reached. Aborting.");
          clearInterval(interval);
        } else {
          console.log(`⏳ Waiting for links... Retry ${attempts}/${MAX_PAGINATION_RETRIES}`);
        }
      }, 1000);
    });
  }

  function initialize() {
    console.log("🚀 Initializing NSE symbol enhancer...");
    enhanceNseLinks();
    observePaginationClicks();
  }

  waitForjQuery(initialize);
})();
