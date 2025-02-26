const {normalizePrice, normalizeDiscount} = require('../../utils')

async function getDiscount(page, {Selectors}) {
  let discount = null
  try {
    await page.waitForSelector(Selectors.Discount)
    discount = await page.$eval(Selectors.Discount, div => div?.textContent)
  } catch (error) {
    console.error('Discount Selector NOT FOUND!')
    return null
  }
  return discount
}

function getTitle(page, {ProductSelectors}) {
  return page.$eval(ProductSelectors.Title, text => text?.textContent?.trim())
}

async function getRealPrice(page, {ProductSelectors}) {
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

async function getPrice(page, {ProductSelectors}) {
  let price = 0
  try {
    await page.waitForSelector(ProductSelectors.Price)
    price = await page.$eval(ProductSelectors.Price, div => div?.textContent)
  } catch (error) {
    console.error('Product Price Selector NOT FOUND!', error)
    if (!ProductSelectors.PriceFallback) return null
    try {
      await page.waitForSelector(ProductSelectors.PriceFallback)
      price = await page.$eval(
          ProductSelectors.PriceFallback,
          span => span?.textContent
      )
    } catch (fallbackerror) {
      console.error('Fallback Price Selector FAILED!', fallbackerror)
    }
  } finally {
    price = normalizePrice(price)
  }
  return price
}

function getImages(page, {ProductSelectors}) {
  return page.$$eval(ProductSelectors.Images, images =>
      (images || []).map(img => {
        let src = img.getAttribute('src')
        return src
      })
  )
}

async function bypassModal(page, {Selectors}) {
  console.log(`Waiting selector...`)
  await page.waitForSelector(Selectors.City)

  console.log(`Typing city...`)
  await page.type(`${Selectors.City} input`, 'Cali')
  page.keyboard.press('Enter')
}

async function isElementVisible(page, selector) {
  let visible = true
  await page
      .waitForSelector(selector, {visible: true, timeout: 4000})
      .catch(() => {
        visible = false
      })
  console.log(`Element "${selector}" is ${visible ? "" : "NOT "}Visible`)
  return visible
}

function calculateDiscount(price, realPrice) {
  const proceed = price < realPrice
  if (!proceed) return 0
  const discount = 100 - (price * 100) / realPrice
  console.log("Calculated Discount: ", discount)
  return discount
}

function calculatePriceAndDiscounts(price, special, discount) {
  const finalPrice = normalizePrice(price);
  const specialPrice = normalizePrice(special);
  const {percentage, amount} = normalizeDiscount(discount);
  console.log({finalPrice, percentage, amount})
  // Calculate real price from discount amount or percentage
  let realPrice = amount || (percentage ? finalPrice / (1 - percentage / 100) : finalPrice);

  // Handle edge cases where realPrice might be invalid
  realPrice = realPrice && realPrice > 0 ? realPrice : finalPrice;

  // Calculate discount percentage, if not directly provided, also check for special price, if present the discount is for it and not for others
  const discountPercentage = !special && percentage ? percentage : ((realPrice - finalPrice) / realPrice * 100).toFixed(2);
  const specialDiscountPercentage = special ? ((realPrice - specialPrice) / realPrice * 100).toFixed(2) : 0;
  return {finalPrice, specialPrice, realPrice, discountPercentage, specialDiscountPercentage};
}


module.exports = {
  getDiscount,
  getRealPrice,
  getPrice,
  getTitle,
  getImages,
  bypassModal,
  isElementVisible,
  calculateDiscount,
  calculatePriceAndDiscounts
}
