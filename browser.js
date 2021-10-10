const puppeteer = require('puppeteer')

async function startBrowser () {
  let browser
  try {
    console.log('Opening the browser......')
    browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true
    })
  } catch (err) {
    console.log('Could not create a browser instance => : ', err)
    process.exit(1)
  }
  return browser
}

module.exports = {
  startBrowser
}
