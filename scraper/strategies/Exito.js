const fs = require('fs');
const {calculatePriceAndDiscounts} = require("./interface");

const BASE_URL = 'https://www.exito.com';
const PATH = '/mercado/lacteos-huevos-y-refrigerados';
const MAX_PAGES = 20;

async function scraper(browser) {
  const page = await browser.newPage();
  const url = BASE_URL + PATH;

  console.log(`Navigating to: ${url}`);
  await page.goto(url);

  console.log(`Waiting for main page to load...`);
  await page.waitForSelector('[class^="productCard_"]');
  console.log(`Main page loaded!`);

  let allProducts = [];
  let pageIndex = 0;

  do {
    console.log(`Scraping products from page #${pageIndex + 1}...`);
    const products = await getProductsFromPage(page, pageIndex);

    console.log(`Adding ${products.length} products to the list...`);
    allProducts = allProducts.concat(products);
    if (pageIndex + 1 >= MAX_PAGES) {
      console.log(`Reached the limit of ${MAX_PAGES} pages. Stopping.`);
      break;
    }

    const nextPage = await isNextPageAvailable(page);
    if (nextPage) {
      console.log(`Navigating to next page (#${pageIndex + 2})...`);
      await nextPage.click();
      await delay(3000)
    } else {
      console.log('No more pages to scrape.');
      break;
    }

    pageIndex++;
  } while (true);

  console.log(`Total products scraped: ${allProducts.length}`);

  const object2write = {data: allProducts};
  const data = JSON.stringify(object2write, null, 2);
  await fs.promises.writeFile('exito-results.json', data);
  console.log(`Data saved to exito-results.json`);

  await page.close();
}


async function getProductsFromPage(page, index = 0) {
  let products = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('article[class^="productCard_"]')).map(product => {
      const nameElement = product.querySelector('.styles_name__qQJiK');
      const name = nameElement ? nameElement.innerText.trim() : null;

      const imageElement = product.querySelector('img[alt="Imagen del producto"]');
      const image = imageElement ? imageElement.src : null;

      const priceElement = product.querySelector('[data-fs-container-price-otros]');
      const price = priceElement ? priceElement.innerText.trim() : null;

      const specialPriceElement = product.querySelector('[data-fs-price]');
      const specialPrice = specialPriceElement ? specialPriceElement.innerText.trim() : null;

      const discountElement = product.querySelector('[class^="priceSection_container-promotion"]');
      const discount = discountElement ? discountElement.innerText.trim() : null;

      const linkElement = document.querySelector('a[data-testid="product-link"]');
      const href = linkElement ? linkElement.getAttribute("href") : null

      return {name, image, price, discount, specialPrice, link: href};
    });
  });

  products = products.map(({name, image, price, discount, specialPrice: special, link}) => {
    // Normalize the base and real prices
    let {
      finalPrice,
      specialPrice,
      realPrice,
      discountPercentage,
      specialDiscountPercentage
    } = calculatePriceAndDiscounts(price, special, discount);

    return {
      name,
      image,
      link: BASE_URL + link,
      specialPrice,
      price: finalPrice,
      realPrice,
      specialDiscount: specialDiscountPercentage ? `${specialDiscountPercentage}%` : null,
      discount: discountPercentage ? `${discountPercentage}%` : null
    };
  });

  console.log(`Found ${products.length} products on page #${index + 1}`);
  return products;
}

async function isNextPageAvailable(page) {
  const nextPageButton = await page.$('[class^="Pagination_nextPreviousLink__"]');
  console.log(nextPageButton ? 'Next page button found!' : 'Next page button NOT found.');
  return nextPageButton;
}

async function delay(time) {
  return await new Promise(resolve => setTimeout(resolve, time));
}

module.exports = scraper;
