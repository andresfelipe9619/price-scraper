const fs = require('fs')
const Scraper = require('./ScraperClass')
const { normalizePrice, chunkArray } = require('../../utils')

const BASE_URL = 'https://www.exito.com'
const PATH = '/mercado/lacteos-huevos-y-refrigerados'

const Selectors = {
  Content: '.vtex-product-summary-2-x-container',
  City: '.MuiInput-input.exito-autocomplete-2',
  Detail: '.exito-product-details-3-x-contentOptions'
}

const ProductSelectors = {
  Title: 'span.vtex-store-components-3-x-productBrand',
  Discount: `div.exito-vtex-components-4-x-badgeDiscount`,
  Images: 'img.exito-product-details-3-x-productImageTag--main',
  Price: `${Selectors.Detail} div.exito-vtex-components-4-x-valuePLPAllied span`,
  RealPrice: `${Selectors.Detail} div.vtex-flex-layout-0-x-flexRowContent--summaryPercentage span`,
  PriceFallback: 'div.exito-vtex-components-4-x-selling-price span'
}

async function getDiscount (page) {
  let discount = null
  try {
    await page.waitForSelector(Selectors.Discount)
    discount = await page.$eval(Selectors.Discount, div => div?.textContent)
  } catch (error) {
    console.error('Discount Selector NOT FOUND!')
  } finally {
    return discount
  }
}

async function getRealPrice (page) {
  let price = 0
  try {
    await page.waitForSelector(ProductSelectors.RealPrice)
    price = await page.$eval(
      ProductSelectors.RealPrice,
      div => div?.textContent
    )
  } catch (error) {
    console.error('Product Real Price Selector NOT FOUND!', error)
  } finally {
    price = normalizePrice(price)
    return price
  }
}

async function getPrice (page) {
  let price = 0
  try {
    await page.waitForSelector(ProductSelectors.Price)
    price = await page.$eval(ProductSelectors.Price, div => div?.textContent)
  } catch (error) {
    console.error('Product Price Selector NOT FOUND!', error)
    try {
      await page.waitForSelector(ProductSelectors.PriceFallback)
      price = await page.$eval(
        ProductSelectors.PriceFallback,
        span => span?.textContent
      )
    } catch (fallbackerror) {
      console.error('Fallback Price Selector FAILED!', error)
    }
  } finally {
    price = normalizePrice(price)
    return price
  }
}

function getImages (page) {
  return page.$$eval(ProductSelectors.Images, imgs =>
    (imgs || []).map(img => {
      let src = img.getAttribute('src')
      return src
    })
  )
}

async function bypassModal (page) {
  console.log(`Waiting selector...`)
  await page.waitForSelector(Selectors.City)

  console.log(`Typing city...`)
  await page.type(`${Selectors.City} input`, 'Cali')
  page.keyboard.press('Enter')
}

function calculateDiscount (price, realPrice) {
  const proceed = price < realPrice
  if (!proceed) return 0
  const discount = 100 - (price * 100) / realPrice
  return discount
}

async function scraper (browser) {
  const page = await browser.newPage()
  const url = this.baseURL + this.path

  console.log(`Navigating to ${url}...`)
  await page.goto(url)

  await this.bypassModal(page)
  console.log(`Waiting Main Page...`)

  await page.click('.shippingaddress-confirmar')
  await page.waitForSelector(Selectors.Content)

  console.log(`Page Loaded...`)

  let uris = await page.$$eval(Selectors.Content, options =>
    options.map(option => {
      if (option.firstChild) {
        let children = option.firstChild
        let link = children.getAttribute('href')
        return link
      }
      return null
    })
  )
  console.log(`uris`, uris)
  // Loop through each of those links, open a new page instance and get the relevant data from them
  let pagePromise = async link => {
    let dataObj = {}
    let newPage = await browser.newPage()
    await newPage.goto(link)
    dataObj['link'] = link

    console.log(`Loading Tab ${link}...`)
    await newPage.waitForSelector(ProductSelectors.Title)
    console.log(`Tab Loaded ...`)

    dataObj['title'] = await newPage.$eval(ProductSelectors.Title, text =>
      text?.textContent?.trim()
    )

    await newPage.waitForSelector(Selectors.Detail)

    const [
      price = 0,
      discount = null,
      realPrice = 0,
      images = []
    ] = await Promise.all(
      [getPrice, getDiscount, getRealPrice, getImages].map(fn => fn(newPage))
    )

    const calculatedDiscount = calculateDiscount(price, realPrice)

    dataObj['price'] = price
    dataObj['date'] = new Date()
    dataObj['discount'] = discount || calculatedDiscount
    dataObj['realPrice'] = realPrice

    dataObj['images'] = images
    await newPage.close()
    return dataObj
  }

  const chunks = chunkArray(uris, 4)
  console.log('chunks', chunks)
  let result = await chunks.reduce(async (acc, chunk) => {
    let accumulated = await acc
    const chunkResult = await Promise.all(
      chunk.map(uri => pagePromise(this.baseURL + uri))
    )
    accumulated.push(chunkResult)
    return accumulated
  }, Promise.resolve([]))
  console.log(`result`, result)
  result = result.flatMap(chunk => chunk)
  const object2write = { data: result }
  let data = JSON.stringify(object2write, null, 2)
  await fs.promises.writeFile('exito-results.json', data)
  console.log(`That's All Folks!!!`)
}

module.exports = new Scraper(BASE_URL, PATH, scraper, bypassModal)
