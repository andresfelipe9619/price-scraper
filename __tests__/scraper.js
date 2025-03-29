const runScraper = require("../scraper");

async function init() {
  await Promise.allSettled([
    runScraper("alkosto"), // DEMO
    runScraper("maccenter"), // DEMO
  ]);

  await Promise.allSettled([
    runScraper("ishop"),
    runScraper("exito"),
    runScraper("mercadolibre"),
    runScraper("falabella"),
  ]);

  await Promise.allSettled([
    runScraper("movistar"),
    runScraper("claro"),
    runScraper("tigo"),
    runScraper("makro"),
  ]);

  // Run these separately since they need fixing
  await Promise.allSettled([runScraper("olimpica"), runScraper("jumbo")]);
}

init();
