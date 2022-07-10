const fs = require('fs')
const ScraperClass = require('./ScraperClass')

const baseURL = 'https://www.exito.com'
const path = '/mercado/lacteos-huevos-y-refrigerados'

async function bypassModal (page) {
  const citySelector = '.MuiInput-input.exito-autocomplete-2'
  console.log(`Waiting selector...`)

  await page.waitForSelector(citySelector)

  console.log(`Typing city...`)

  await page.type(`${citySelector} input`, 'Cali')
  page.keyboard.press('Enter')
}

async function scraper (browser) {
  const contentSelector = '.vtex-product-summary-2-x-container'
  const productTitleSelector = 'div.exito-product-details-3-x-productName'
  const productPriceSelector = 'div.exito-components-4-x-priceProductPDP'

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

    dataObj['title'] = await newPage.$eval(
      productTitleSelector,
      text => text.textContent
    )

    try {
      await newPage.waitForSelector(productPriceSelector)
      dataObj['price'] = await newPage.$eval(
        productPriceSelector,
        div => div.textContent
      )
    } catch (error) {
      console.error('productPriceSelector NOT FOUND!')
      try {
        let fallback =
          '.product-detail-exito-vtex-components-selling-price span'

        await newPage.waitForSelector(fallback)
        dataObj['price'] = await newPage.$eval(
          fallback,
          span => span.textContent
        )
      } catch (fallbackerror) {
        console.error('FALLBACK SELECTOR FAILED!')

        dataObj['price'] = '$ 0'
      }
    }

    // dataObj['imageUrl'] = await newPage.$eval(
    //   '#product_gallery img',
    //   img => img.src
    // )
    await newPage.close()
    return dataObj
  }
  const result = await Promise.all(
    uris.map(uri => pagePromise(this.baseURL + uri))
  )
  console.log(`result`, result)
  const object2write = { data: result }
  let data = JSON.stringify(object2write, null, 2)
  await fs.promises.writeFile('exito-results.json', data)
  console.log(`That's All Folks!!!`)
}

module.exports = new ScraperClass(baseURL, path, scraper, bypassModal)
