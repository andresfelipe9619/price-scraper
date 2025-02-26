const chalk = require('chalk');
const { saveAsJSON, saveAsCSV } = require("../interfaces/Export");
const { calculatePriceAndDiscounts } = require("../interfaces/Price");

const BASE_URL = 'https://www.exito.com';
const PATH = '/mercado/lacteos-huevos-y-refrigerados';
const MAX_PAGES = 20;

/**
 * Scrapes product data from the website, navigating through pages and collecting products.
 * @param {Object} browser - The Puppeteer browser instance.
 */
async function scraper(browser) {
  const page = await browser.newPage();
  let pageIndex = 0;
  let allProducts = [];

  while (pageIndex < MAX_PAGES) {
    const url = `${BASE_URL}${PATH}?category-1=mercado&category-2=lacteos-huevos-y-refrigerados&facets=category-1%2Ccategory-2&sort=score_desc&page=${pageIndex + 1}`;

    console.log(chalk.blue.bold('\n[INFO] Navigating to page:'), chalk.cyan(url));
    await page.goto(url);

    console.log(chalk.yellow(`Waiting for page #${pageIndex + 1} to load...`));
    await page.waitForSelector('[class^="productCard_"]');
    console.log(chalk.green(`Page #${pageIndex + 1} loaded successfully!`));

    const products = await getProductsFromPage(page, pageIndex);
    console.log(chalk.cyan(`Adding ${products.length} products from page #${pageIndex + 1}...`));

    allProducts = allProducts.concat(products);

    if (products.length === 0) {
      console.log(chalk.red.bold('[STOP] No more products found. Stopping scraper.'));
      break;
    }

    pageIndex++;
  }

  console.log(chalk.green.bold(`\n[SUCCESS] Total products scraped: ${allProducts.length}`));

  await saveAsJSON('exito-results.json', allProducts);
  console.log(chalk.blue('[INFO] Saved results as JSON.'));
  await saveAsCSV('exito-results.csv', allProducts);
  console.log(chalk.blue('[INFO] Saved results as CSV.'));

  await page.close();
}

/**
 * Extracts product data from the current page.
 * @param {Object} page - The Puppeteer page instance.
 * @param {number} index - The current page index.
 * @returns {Promise<Array>} Promise resolving to a list of scraped products with pricing and discounts calculated.
 */
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

      const linkElement = product.querySelector('a[data-testid="product-link"]');
      const href = linkElement ? linkElement.getAttribute("href") : null;

      return { name, image, price, discount, specialPrice, link: href };
    });
  });

  products = products.map(({ name, image, price, discount, specialPrice: special, link }) => {
    let {
      finalPrice,
      specialPrice,
      realPrice,
      discountPercentage,
      specialDiscountPercentage
    } = calculatePriceAndDiscounts(price, special, discount);

    console.log(chalk.magenta('\n[PRODUCT] Processed product:'), chalk.yellow(name || 'Unknown'));
    console.log(chalk.cyan(`  - Final Price: ${chalk.yellow(finalPrice)}`));
    console.log(chalk.cyan(`  - Real Price: ${chalk.yellow(realPrice)}`));
    console.log(chalk.cyan(`  - Discount: ${chalk.yellow(discountPercentage || '0')}%`));
    if (special) console.log(chalk.cyan(`  - Special Discount: ${chalk.yellow(specialDiscountPercentage || '0')}%`));

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

  console.log(chalk.green.bold(`\n[INFO] Found ${products.length} products on page #${index + 1}`));
  return products;
}

module.exports = scraper;
