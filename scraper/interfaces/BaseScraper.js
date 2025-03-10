/**
 * BaseScraper - A generic web scraper for extracting product data across multiple categories.
 * Handles pagination, product extraction, and saving results in multiple formats.
 */
const chalk = require('chalk');
const {saveAsJSON, saveAsCSV} = require("./Export");
const {mkdirSync, existsSync} = require("node:fs");
const {join} = require("node:path");
const {calculatePriceAndDiscounts} = require("./Price");
const {sleep, formatPercentage} = require("../../utils");

/**
 * Configuration object for the web scraper.
 *
 * @typedef {Object} ScraperConfig
 * @property {number} maxPages - The maximum number of pages to scrape.
 * @property {string} baseUrl - The base URL of the site to scrape.
 * @property {string} outputDir - The directory path to save the extracted data.
 * @property {Object.<string, string>} categories - A map of category names to their respective URL paths.
 * @property {string} nextPageText - The text or ARIA label of the "next page" button.
 * @property {string} autoScroll - Whether to scroll to the end of page for the next page button to appear.
 * @property {Object} selectors - CSS selectors for extracting product data.
 * @property {string} selectors.productCard - Selector for the product card container.
 * @property {string} selectors.title - Selector for the product title.
 * @property {string} selectors.price - Selector for the product price.
 * @property {string} selectors.specialPrice - Selector for the special/discounted price.
 * @property {string} selectors.discount - Selector for the discount badge.
 * @property {string} selectors.image - Selector for the product image.
 * @property {string} selectors.link - Selector for the product link.
 * @property {string} selectors.nextPage - Selector for the next page button.
 */

class BaseScraper {
  /**
   * @constructor
   * @param {import('puppeteer').Browser} browser - The Puppeteer browser instance.
   * @param {ScraperConfig} config - The configuration object for the scraper.
   */
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
      await page.exposeFunction("productNormalizer", this.normalizeProducts);

      let pageIndex = 0;
      let allProducts = [];

      while (pageIndex < this.config.maxPages) {
        const url = `${this.config.baseUrl}${pageIndex === 0 ? categoryPath : `${categoryPath}&page=${pageIndex}`}`;
        console.log(chalk.blue.bold('\n[INFO] Navigating to page:'), chalk.cyan(url));
        await page.goto(url);

        console.log(chalk.yellow(`Waiting for page #${pageIndex} to load...`));
        await sleep(2000);

        try {
          await page.waitForSelector(this.config.selectors.productCard, {timeout: 5000});
          console.log(chalk.green(`Page #${pageIndex} loaded successfully!`));
        } catch (error) {
          console.log(chalk.red.bold(`[ERROR] Failed to load products on page #${pageIndex}: ${error.message}`));
          console.log(chalk.yellow.bold(`[INFO] Saving the collected products so far for category: ${categoryName}`));
          break; // Exit the loop but continue to save results
        }

        const products = await this.extractProducts(page);
        console.log(chalk.cyan(`Adding ${products.length} products from page #${pageIndex}...`));

        if (!products?.length) {
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
      // await sleep(30000)
      await page.close();
    }
  }

  /**
   * Checks if there is a next page in pagination.
   * @param {import('puppeteer').Page} page - The Puppeteer page instance.
   * @returns {Promise<boolean>} True if next page exists, false otherwise.
   */
  async hasNextPage(page) {
    let nextPage = false;
    const {selectors, nextPageText: text} = this.config
    if (!text && !selectors.nextPage) return nextPage
    try {
      if (this.config.autoScroll) await this.autoScroll(page)
      nextPage = await page.evaluate((nextPageText, nextPageSelector) => {
        console.log({nextPageText, nextPageSelector})
        if (nextPageText) {
          const buttons = document.querySelectorAll(nextPageSelector || 'button');
          return Array.from(buttons).some(button =>
              button.innerText.trim().toLowerCase() === nextPageText ||
              button.getAttribute('aria-label')?.trim().toLowerCase() === nextPageText
          );
        } else if (nextPageSelector) {
          const button = document.querySelector(nextPageSelector);
          return !!button
        }

      }, text, selectors.nextPage);

      if (nextPage) {
        console.log(chalk.green(`[INFO] Found "${text}" button (by text or aria-label). Loading more products...`));
      } else {
        console.log(chalk.red.bold(`[STOP] NOT Found "${text}|${selectors.nextPage}" button (by text or aria-label). Stopping scraper.`));
      }

      return !!nextPage;
    } catch (e) {
      console.error(chalk.red.bold(`[ERROR] Failed to check for "${this.config.nextPageText}":`), e);
      return false;
    }
  }

  async autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100; // Scroll step
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100); // Scroll speed
      });
    });
  }

  /**
   * Extracts product data from the current page.
   * @param {import('puppeteer').Page} page - The Puppeteer page instance.
   * @returns {Promise<Array>} List of scraped products.
   */
  async extractProducts(page) {
    console.log(chalk.yellow(`Extracting products...`));
    console.log(chalk.yellow(this.config.selectors.productCard));
    // await sleep(500)
    return page.evaluate(async (selectors, baseUrl) => {
      const elements = document.querySelectorAll(selectors.productCard);

      return await window.productNormalizer(Array.from(elements || []).map(product => ({
            title: product.querySelector(selectors.title)?.innerText.trim() || null,
            price: product.querySelector(selectors.price)?.innerText.trim() || null,
            discount: selectors.discount ? product.querySelector(selectors.discount)?.innerText.trim() : null,
            specialPrice: selectors.specialPrice ? product.querySelector(selectors.specialPrice)?.innerText.trim() : null,
            image: product.querySelector(selectors.image)?.getAttribute('src') || null,
            link: selectors.link && product.querySelector(selectors.link)?.getAttribute('href') ? baseUrl + product.querySelector(selectors.link).getAttribute('href') : null,
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
      console.log({price, discount, special})
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
        realPrice,
        price: finalPrice,
        specialDiscount: formatPercentage(specialDiscountPercentage),
        discount: formatPercentage(discountPercentage),
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

  /**
   * Intercepts and handles network requests for the given Puppeteer page.
   * Blocks requests to Google Tag Manager to avoid unnecessary loading.
   *
   * @async
   * @param {import('puppeteer').Page} page - The Puppeteer page instance to intercept requests on.
   * @returns {Promise<void>} - A promise that resolves once the interception is set up.
   */
  async interceptRequests(page) {
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      const url = req.url();

      if (url.includes('www.googletagmanager.com')) {
        console.log(`Blocking request to: ${url}`);
        req.abort();
      } else {
        req.continue();
      }
    });
  }
}

module.exports = BaseScraper;
