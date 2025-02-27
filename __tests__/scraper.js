const runScraper = require('../scraper')

async function init () {
  await runScraper('alkosto')
  // await runScraper('exito')
}

init()
