const puppeteer = require('puppeteer')

const isTest = process.env.NODE_ENV === 'test'

async function startBrowser () {
  try {
    console.log('Starting browser instance...')
    const browser = await puppeteer.launch({
      headless: isTest ? false : true,
      args: ['--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true
    })
    console.log('Browser instance created...')
    return browser
  } catch (error) {
    console.error(error)
    throw new Error('Could not create a browser instance')
  }
}

module.exports = {
  startBrowser
}
