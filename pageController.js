const pageScraper = require('./pageScraper')
async function scrapeAll (browserInstance) {
  let browser
  try {
    browser = await browserInstance
    await pageScraper.scraper(browser)
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err)
  } finally {
    process.exit(1)
  }
}

module.exports = browserInstance => scrapeAll(browserInstance)
