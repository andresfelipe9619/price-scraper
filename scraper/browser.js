const puppeteer = require('puppeteer')

async function startBrowser () {
  try {
    console.log('Opening the browser...')
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true
    })
    console.log('Browser instance created...')
    return browser
  } catch (error) {
    console.log('Could not create a browser instance => : ', error)
    process.exit(1)
  }
}

module.exports = {
  startBrowser
}
