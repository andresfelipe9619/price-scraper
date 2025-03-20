const chalk = require("chalk");
const Browser = require("./browser");
const Scrapers = require("./strategies");

async function init(strategy) {
  let browser = null;
  try {
    console.log(chalk.blue(`Starting scraper with strategy: ${strategy}`));
    browser = await Browser.startBrowser();
    const scraperStrategy = Scrapers.get(strategy);
    const Scraper = new scraperStrategy(browser);
    await Scraper.exec();
    console.log(chalk.green("Scraping completed successfully!"));
  } catch (error) {
    console.error(chalk.red("An error occurred during scraping:"));
    console.error(chalk.red(error));
  } finally {
    if (browser) await browser.close();
    console.log(chalk.yellow("Browser closed. Exiting process."));
    // process.exit(1)
  }
}

module.exports = init;
