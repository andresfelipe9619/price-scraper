const Browser = require('./browser')
const Scrapers = require('./strategies')

async function init (scraper) {
  try {
    const browser = await Browser.startBrowser()
    const PageScraper = Scrapers.get(scraper)
    await PageScraper.scraper(browser)
  } catch (error) {
    console.error(error)
  } finally {
    process.exit(1)
  }
}

module.exports = init
