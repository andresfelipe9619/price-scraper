const chalk = require("chalk");
const { performance } = require("perf_hooks");
const Browser = require("./browser");
const Scrapers = require("./strategies");

async function init(strategy) {
  let browser = null;
  console.log(
    chalk.blue(`🚀 Starting scraper with strategy: ${chalk.bold(strategy)}`),
  );

  const startTime = performance.now(); // Start timing

  try {
    browser = await Browser.startBrowser();
    console.log(chalk.cyan("🖥  Browser initialized successfully."));

    const scraperStrategy = Scrapers.get(strategy);
    const Scraper = new scraperStrategy(browser);

    console.log(chalk.magenta("🔍 Executing scraping strategy..."));
    await Scraper.exec();

    console.log(chalk.green("✅ Scraping completed successfully!"));
  } catch (error) {
    console.error(chalk.red("❌ An error occurred during scraping:"));
    console.error(chalk.red(error.stack || error.message || error));
  } finally {
    if (browser) {
      await browser.close();
      console.log(chalk.yellow("🔒 Browser closed."));
    }

    const endTime = performance.now(); // End timing
    console.log(
      chalk.blue(
        `⏱ Total execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`,
      ),
    );

    console.log(chalk.gray("📌 Process finished."));
  }
}

module.exports = init;
