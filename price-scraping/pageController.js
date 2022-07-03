async function scrapeAll (browserInstance, pageScraper) {
  let browser
  try {
    browser = await browserInstance
    await pageScraper.scraper(browser)
  } catch (error) {
    console.log('Could not resolve the browser instance => ', error)
  } finally {
    process.exit(1)
  }
}

module.exports = browserInstance => scrapeAll(browserInstance)
