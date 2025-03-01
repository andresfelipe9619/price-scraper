/**
 * BaseScraper - A generic web scraper for extracting product data across multiple categories.
 * Handles pagination, product extraction, and saving results in multiple formats.
 */
const chalk = require('chalk');
const {saveAsJSON, saveAsCSV} = require("./Export");
const {mkdirSync, existsSync} = require("node:fs");
const {join} = require("node:path");
const {calculatePriceAndDiscounts} = require("./Price");

class BaseScraper {
  constructor(browser, config) {
    this.config = config;
    this.browser = browser;
  }

  /**
   * Starts the scraping process for all categories.
   */
  async exec() {
    for (const [categoryName, categoryPath] of Object.entries(this.config.categories)) {
      const categoryDir = join(this.config.outputDir, categoryName);
      if (!existsSync(categoryDir)) mkdirSync(categoryDir, {recursive: true});

      console.log(chalk.blue.bold(`\n[INFO] Scraping category: ${categoryName}`));
      const page = await this.browser.newPage();
      // await page.setRequestInterception(true)
      //
      // page.on('request', (req) => {
      //   const url = req.url()
      //
      //   if (url.includes('www.googletagmanager.com')) {
      //     console.log(`Blocking request to: ${url}`)
      //     req.abort()
      //   } else {
      //     req.continue()
      //   }
      // })

      let pageIndex = 0;
      let allProducts = [];

      while (pageIndex < this.config.maxPages) {
        const url = `${this.config.baseUrl}${pageIndex === 0 ? categoryPath.split("?")[0] : `${categoryPath}&page=${pageIndex}`}`;
        console.log(chalk.blue.bold('\n[INFO] Navigating to page:'), chalk.cyan(url));

        await page.goto(url);

        console.log(chalk.yellow(`Waiting for page #${pageIndex} to load...`));
        await page.waitForSelector(this.config.selectors.productCard);
        console.log(chalk.green(`Page #${pageIndex} loaded successfully!`));

        const products = await this.extractProducts(page);
        console.log(chalk.cyan(`Adding ${products.length} products from page #${pageIndex}...`));

        if (products.length === 0) {
          console.log(chalk.red.bold('[STOP] No more products found. Stopping scraper.'));
          break;
        }
        allProducts = allProducts.concat(products);
        const hasNextPage = await this.hasNextPage(page);
        if (!hasNextPage) break;
        pageIndex++;
      }

      console.log(chalk.green.bold(`\n[SUCCESS] Total products scraped for ${categoryName}: ${allProducts.length}`));
      await this.saveResults(categoryDir, categoryName, allProducts);
      await page.close();
    }
  }

  /**
   * Checks if there is a next page in pagination.
   * @param {Object} page - The Puppeteer page instance.
   * @returns {Promise<boolean>} True if next page exists, false otherwise.
   */
  async hasNextPage(page) {
    return page.evaluate((nextPageSelector) => {
      const nextPageButton = document.querySelector(nextPageSelector);
      return nextPageButton && nextPageButton.innerText.trim().toLowerCase() === 'siguiente';
    }, this.config.selectors.nextPageButton);
  }

  /**
   * Extracts product data from the current page.
   * @param {Object} page - The Puppeteer page instance.
   * @returns {Promise<Array>} List of scraped products.
   */
  async extractProducts(page) {
    console.log(chalk.yellow(`Extracting products...`));
    console.log(chalk.yellow(this.config.selectors.productCard));
    await page.exposeFunction("productNormalizer", this.normalizeProducts)
    return page.evaluate(async (selectors, baseUrl) => {
      console.log(`Selector: ${selectors.productCard}`)
      const elements = document.querySelectorAll(selectors.productCard);
      console.log(elements)

      return await window.productNormalizer(Array.from(elements || []).map(product => ({
            title: product.querySelector(selectors.title)?.innerText.trim() || null,
            price: product.querySelector(selectors.price)?.innerText.trim() || null,
            discount: product.querySelector(selectors.discount)?.innerText.trim() || null,
            specialPrice: product.querySelector(selectors.specialPrice)?.innerText.trim() || null,
            image: product.querySelector(selectors.image)?.getAttribute('src') || null,
            link: product.querySelector(selectors.link)?.getAttribute('href') ? baseUrl + product.querySelector(selectors.link).getAttribute('href') : null,
          }))
      )
    }, this.config.selectors, this.config.baseUrl);
  }

  /**
   * Extracts product data from the current page.
   * @param {Array<Object>} products - The products extracted.
   * @returns {Array<Object>} List of scraped products with normalized prices.
   */
  async normalizeProducts(products) {
    console.log(chalk.yellow(`Normalizing products...`));
    return (products || []).map(({title, image, price, discount, specialPrice: special, link}) => {
      let {
        finalPrice,
        specialPrice,
        realPrice,
        discountPercentage,
        specialDiscountPercentage
      } = calculatePriceAndDiscounts(price, special, discount);

      console.log(chalk.magenta('\n[PRODUCT] Processed product:'), chalk.yellow(title || 'Unknown'));
      console.log(chalk.cyan(`  - Final Price: ${chalk.yellow(finalPrice)}`));
      console.log(chalk.cyan(`  - Real Price: ${chalk.yellow(realPrice)}`));
      console.log(chalk.cyan(`  - Discount: ${chalk.yellow(discountPercentage || '0')}%`));
      if (special) console.log(chalk.cyan(`  - Special Discount: ${chalk.yellow(specialDiscountPercentage || '0')}%`));

      return {
        title,
        image,
        link,
        specialPrice,
        price: finalPrice,
        realPrice,
        specialDiscount: specialDiscountPercentage ? `${specialDiscountPercentage}%` : null,
        discount: discountPercentage ? `${discountPercentage}%` : null
      };
    });
  }


  /**
   * Saves scraped results as JSON and CSV files.
   * @param {string} dir - Directory to save the results.
   * @param {string} categoryName - Name of the scraped category.
   * @param {Array} products - List of scraped products.
   */
  async saveResults(dir, categoryName, products) {
    const jsonPath = join(dir, `${categoryName}-results.json`);
    const csvPath = join(dir, `${categoryName}-results.csv`);
    await saveAsJSON(jsonPath, products);
    console.log(chalk.blue(`[INFO] Saved results as JSON: ${jsonPath}`));
    await saveAsCSV(csvPath, products);
    console.log(chalk.blue(`[INFO] Saved results as CSV: ${csvPath}`));
  }
}

module.exports = BaseScraper;
