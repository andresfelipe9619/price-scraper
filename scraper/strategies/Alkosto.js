const fs = require('fs')
const {
  calculateDiscount,
  getPrice,
  getDiscount,
  getRealPrice,
  getImages,
  getTitle,
  bypassModal,
  isElementVisible
} = require('./interface')
const { chunkArray } = require('../../utils')

const BASE_URL = 'https://www.exito.com'
const PATH = '/mercado/lacteos-huevos-y-refrigerados'

const Selectors = {
  Content: '.vtex-product-summary-2-x-container',
  City: '.MuiInput-input.exito-autocomplete-2',
  Detail: '.exito-product-details-3-x-contentOptions',
  LoadMore: '.vtex-search-result-3-x-buttonShowMore button'
}

const ProductSelectors = {
  Title: 'span.vtex-store-components-3-x-productBrand',
  Discount: `div.exito-vtex-components-4-x-badgeDiscount`,
  Images: 'img.exito-product-details-3-x-productImageTag--main',
  Price: `${Selectors.Detail} div.exito-vtex-components-4-x-valuePLPAllied span`,
  RealPrice: `${Selectors.Detail} div.vtex-flex-layout-0-x-flexRowContent--summaryPercentage span`,
  PriceFallback: 'div.exito-vtex-components-4-x-selling-price span'
}

async function scraper (browser) {
  const page = await browser.newPage()
  const url = BASE_URL + PATH

  console.log(`Navigating to ${url}...`)
  await page.goto(url)

  await bypassModal(page, { Selectors })
  console.log(`Waiting Main Page...`)

  await page.click('.shippingaddress-confirmar')
  await page.waitForSelector(Selectors.Content)

  console.log(`Page Loaded...`)

  let loadMoreVisible = await isElementVisible(page, Selectors.LoadMore)
  while (loadMoreVisible) {
    await page.click(Selectors.LoadMore).catch(() => {})
    loadMoreVisible = await isElementVisible(page, Selectors.LoadMore)
  }

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
  const pagePromise = async link => {
    const dataObj = {}
    const newPage = await browser.newPage()
    await newPage.goto(link)
    dataObj['link'] = link

    console.log(`Loading Tab ${link}...`)
    await newPage.waitForSelector(ProductSelectors.Title)
    console.log(`Tab Loaded ...`)

    dataObj['title'] = await getTitle()

    await newPage.waitForSelector(Selectors.Detail)

    const [
      price = 0,
      discount = null,
      realPrice = 0,
      images = []
    ] = await Promise.all(
      [getPrice, getDiscount, getRealPrice, getImages].map(fn =>
        fn(newPage, { Selectors, ProductSelectors })
      )
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
      chunk.map(uri => pagePromise(BASE_URL + uri))
    )
    accumulated.push(chunkResult)
    return accumulated
  }, Promise.resolve([]))
  console.log(`result`, result)
  result = result.flatMap(chunk => chunk)

  const object2write = { data: result }
  const data = JSON.stringify(object2write, null, 2)
  await fs.promises.writeFile('alkosto-results.json', data)
  console.log(`That's All Folks!!!`)
}

module.exports = scraper
