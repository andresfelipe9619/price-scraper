const chalk = require('chalk')
const puppeteer = require('puppeteer')

const DEMO_MODE = process.env.DEMO_MODE === 'true';

async function startBrowser() {
  try {
    console.log(chalk.blue('Starting browser instance...'))
    // @type {import('puppeteer').Browser} browser - The Puppeteer browser instance.
    const browser = await puppeteer.launch({
      headless: !DEMO_MODE,
      args: ['--disable-setuid-sandbox', '--window-size=1920,1080'],
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      ignoreHTTPSErrors: true
    })
    console.log(chalk.green('Browser instance created successfully...'))
    return browser
  } catch (error) {
    console.error(chalk.red('Failed to create a browser instance:'))
    console.error(chalk.red(error))
    throw new Error(chalk.bgRed('Could not create a browser instance!'))
  }
}

module.exports = {
  startBrowser
}
