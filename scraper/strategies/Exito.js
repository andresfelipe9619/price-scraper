const fs = require('fs')
const Scraper = require('./ScraperClass')

const baseURL = 'https://www.exito.com'
const path = '/mercado/lacteos-huevos-y-refrigerados'

const contentSelector = '.vtex-product-summary-2-x-container'
const productTitleSelector = 'span.vtex-store-components-3-x-productBrand'
const productPriceSelector = 'span.exito-vtex-components-4-x-currencyContainer'
const citySelector = '.MuiInput-input.exito-autocomplete-2'
const fallback = 'div.exito-vtex-components-4-x-selling-price span'

function normalizePrice (price = '') {
  try {
    return parseFloat(price.trim().replace(/(\.|\$)/gi, ''))
  } catch (error) {
    console.error(error)
    return 0
  }
}

// Parte el array en chunks de tamaño 'size'
function chunkArray (arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

const defaultPrice = '$0'

async function getPrice (page) {
  let price = defaultPrice
  try {
    await page.waitForSelector(productPriceSelector)
    price = await page.$eval(productPriceSelector, div => div?.textContent)
  } catch (error) {
    console.error('Product Price Selector NOT FOUND!', error)
    try {
      await page.waitForSelector(fallback)
      price = await page.$eval(fallback, span => span?.textContent)
    } catch (fallbackerror) {
      console.error('Fallback Price Selector FAILED!', error)
      price = defaultPrice
    } finally {
      price = normalizePrice(price || defaultPrice)
      return price
    }
  }
}

async function bypassModal (page) {
  console.log(`Waiting selector...`)
  await page.waitForSelector(citySelector)

  console.log(`Typing city...`)
  await page.type(`${citySelector} input`, 'Cali')
  page.keyboard.press('Enter')
}

async function scraper (browser) {
  const page = await browser.newPage()
  const url = this.baseURL + this.path

  console.log(`Navigating to ${url}...`)
  await page.goto(url)

  await this.bypassModal(page)
  console.log(`Waiting Main Page...`)

  await page.click('.shippingaddress-confirmar')
  await page.waitForSelector(contentSelector)

  console.log(`Page Loaded...`)

  let uris = await page.$$eval(contentSelector, options =>
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
    await newPage.waitForSelector(productTitleSelector)
    console.log(`Tab Loaded ...`)

    dataObj['title'] = await newPage.$eval(productTitleSelector, text =>
      text?.textContent?.trim()
    )

    dataObj['price'] = await getPrice(newPage)

    // dataObj['imageUrl'] = await newPage.$eval(
    //   '#product_gallery img',
    //   img => img.src
    // )
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

module.exports = new Scraper(baseURL, path, scraper, bypassModal)
