const chalk = require("chalk");
const { performance } = require("perf_hooks");
const pidusage = require("pidusage"); // Import pidusage
const Browser = require("./browser");
const Scrapers = require("./strategies");

async function init(strategy) {
  let browser = null;
  console.log(
    chalk.blue(`🚀 Starting scraper with strategy: ${chalk.bold(strategy)}`),
  );

  const startTime = performance.now(); // Start timing
  const startUsage = await pidusage(process.pid); // Get initial resource usage

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
    const endUsage = await pidusage(process.pid); // Get final resource usage

    console.log(
      chalk.blue(
        `⏱ Total execution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`,
      ),
    );
    console.log(chalk.yellow(`📊 Resource usage:`));
    console.log(chalk.cyan(`   🖥 CPU: ${endUsage.cpu.toFixed(2)}%`));
    console.log(
      chalk.cyan(`   🏗 RAM: ${(endUsage.memory / 1024 / 1024).toFixed(2)} MB`),
    );

    console.log(chalk.gray("📌 Process finished."));
  }
}

module.exports = init;
