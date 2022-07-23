const Browser = require('./browser')
const Scrapers = require('./strategies')

async function init (strategy) {
  let browser = null
  try {
    browser = await Browser.startBrowser()
    const scraper = Scrapers.get(strategy)
    await scraper(browser)
  } catch (error) {
    console.error(error)
  } finally {
    if (browser) await browser.close()
    process.exit(1)
  }
}

module.exports = init
