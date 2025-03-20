/****
 * BaseScraper - A generic web scraper for extracting product data across multiple categories.
 * Handles pagination, product extraction, and saving results in multiple formats.
 */
const chalk = require("chalk");
const { saveAsJSON, saveAsCSV } = require("./Export");
const { mkdirSync, existsSync } = require("node:fs");
const { join } = require("node:path");
const { calculatePriceAndDiscounts } = require("./Price");
const { sleep, formatPercentage } = require("../../utils");

const DEMO_MODE = process.env.DEMO_MODE === "true";
const DEMO_TIMING = 300;
const FIRST_LOAD_WAIT_TIME = 2000;

function logProductData({
  title,
  finalPrice,
  originalPrice,
  discountPercentage,
  specialDiscountPrice,
  specialDiscountPercentage,
}) {
  console.log(
    chalk.magenta("\n[PRODUCT] Processed product:"),
    chalk.yellow(title || "Unknown"),
  );
  console.log(chalk.cyan(`  💲 Final Price: ${chalk.yellow(finalPrice)}`));
  console.log(
    chalk.cyan(`  🏷️ Original Price: ${chalk.yellow(originalPrice)}`),
  );
  console.log(
    chalk.cyan(`  📉 Discount: ${chalk.yellow(discountPercentage || "0")}%`),
  );
  if (specialDiscountPrice) {
    console.log(
      chalk.cyan(
        `  ✨ Special Discount: ${chalk.yellow(
          specialDiscountPercentage || "0",
        )}%`,
      ),
    );
  }
}

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
 * @property {string} selectors.specialDiscountPrice - Selector for the special/discounted price.
 * @property {string} selectors.discountPercentage - Selector for the discount percentage.
 * @property {string} selectors.discountPrice - Selector for the final price after applying the discount.
 * @property {string} selectors.image - Selector for the product image.
 * @property {string} selectors.link - Selector for the product link.
 * @property {string} selectors.nextPage - Selector for the next page button.
 * @property {string} selectors.specialDiscountPercentage - Selector for the special discount percentage.
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
    for (const [categoryName, categoryPath] of Object.entries(
      this.config.categories,
    )) {
      const categoryDir = join(this.config.outputDir, categoryName);
      if (!existsSync(categoryDir)) mkdirSync(categoryDir, { recursive: true });

      console.log(
        chalk.blue.bold(`\n[INFO] Scraping category: ${categoryName}`),
      );
      const page = await this.browser.newPage();
      await page.exposeFunction("productNormalizer", this.normalizeProduct);

      let pageIndex = 0;
      let allProducts = [];

      while (pageIndex < this.config.maxPages) {
        const url = `${this.config.baseUrl}${pageIndex === 0 ? categoryPath : `${categoryPath}&page=${pageIndex}`}`;
        console.log(
          chalk.blue.bold("\n[INFO] Navigating to page:"),
          chalk.cyan(url),
        );
        await page.goto(url);

        console.log(chalk.yellow(`Waiting for page #${pageIndex} to load...`));
        await sleep(FIRST_LOAD_WAIT_TIME);
        const modalSelector = this.config.selectors.firstVisitModal;

        if (modalSelector) {
          console.log(chalk.yellow(`Closing first visit modal...`));
          try {
            await page.waitForSelector(modalSelector, {
              timeout: FIRST_LOAD_WAIT_TIME * 2,
            });
            await page.click(modalSelector + " button");
            await sleep(500);
          } catch (error) {
            console.log(
              chalk.red.bold(
                `[ERROR] Failed to close the first visit modal: ${error.message}`,
              ),
            );
          }
        }

        try {
          await page.waitForSelector(this.config.selectors.productCard, {
            timeout: FIRST_LOAD_WAIT_TIME * 2,
          });
          console.log(chalk.green(`Page #${pageIndex} loaded successfully!`));
        } catch (error) {
          console.log(
            chalk.red.bold(
              `[ERROR] Failed to load products on page #${pageIndex}: ${error.message}`,
            ),
          );
          console.log(
            chalk.yellow.bold(
              `[INFO] Saving the collected products so far for category: ${categoryName}`,
            ),
          );
          break; // Exit the loop but continue to save results
        }

        const products = await this.extractProducts(page);
        console.log(
          chalk.cyan(
            `Adding ${products.length} products from page #${pageIndex}...`,
          ),
        );

        if (!products?.length) {
          console.log(
            chalk.red.bold("[STOP] No more products found. Stopping scraper."),
          );
          break;
        }
        allProducts = allProducts.concat(products);

        const hasNextPage = await this.hasNextPage(page);
        if (!hasNextPage) break;
        pageIndex++;
      }

      console.log(
        chalk.green.bold(
          `\n[SUCCESS] Total products scraped for ${categoryName}: ${allProducts.length}`,
        ),
      );
      await this.saveResults(categoryDir, categoryName, allProducts);
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
    const { selectors, nextPageText: text } = this.config;
    if (!text && !selectors.nextPage) return nextPage;
    try {
      if (this.config.autoScroll) await this.autoScroll(page);
      nextPage = await page.evaluate(
        (nextPageText, nextPageSelector) => {
          console.log({ nextPageText, nextPageSelector });
          if (nextPageText) {
            const buttons = document.querySelectorAll(
              nextPageSelector || "button",
            );
            return Array.from(buttons).some(
              (button) =>
                button.innerText.trim().toLowerCase() === nextPageText ||
                button.getAttribute("aria-label")?.trim().toLowerCase() ===
                  nextPageText,
            );
          } else if (nextPageSelector) {
            const button = document.querySelector(nextPageSelector);
            return !!button;
          }
        },
        text,
        selectors.nextPage,
      );

      if (nextPage) {
        console.log(
          chalk.green(
            `[INFO] Found "${text}" button (by text or aria-label). Loading more products...`,
          ),
        );
      } else {
        console.log(
          chalk.red.bold(
            `[STOP] NOT Found "${text}|${selectors.nextPage}" button (by text or aria-label). Stopping scraper.`,
          ),
        );
      }

      return !!nextPage;
    } catch (e) {
      console.error(
        chalk.red.bold(
          `[ERROR] Failed to check for "${this.config.nextPageText}":`,
        ),
        e,
      );
      return false;
    }
  }

  /**
   * Scrolls the page to the bottom, loading all dynamically loaded content.
   * @async
   * @function autoScroll
   * @param {import('puppeteer').Page} page - The Puppeteer page instance.
   * @returns {Promise<void>} - A promise that resolves when the page has finished scrolling.
   */
  async autoScroll(page) {
    await page.evaluate(
      async (DEMO_MODE, DEMO_TIMING) => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100; // Scroll step
          const timer = setInterval(
            () => {
              const scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;
              if (totalHeight >= scrollHeight) {
                clearInterval(timer);
                resolve();
              }
            },
            DEMO_MODE ? DEMO_TIMING : 200,
          ); // Scroll speed
        });
      },
      DEMO_MODE,
      DEMO_TIMING,
    );
  }

  /**
   * Extracts product data from the current page and highlights the product in the DOM.
   * @param {import('puppeteer').Page} page - The Puppeteer page instance.
   * @returns {Promise<Array>} List of scraped products.
   */
  async extractProducts(page) {
    console.log(chalk.yellow(`Extracting products...`));
    console.log(chalk.yellow(this.config.selectors.productCard));
    return page.evaluate(
      async (selectors, baseUrl, DEMO_MODE) => {
        const elements = document.querySelectorAll(selectors.productCard);

        const products = [];
        for (const product of elements) {
          if (DEMO_MODE) {
            //TODO: Fix Conflict with autoscroll config
            product.scrollIntoView({ behavior: "smooth", block: "center" });
            // Highlight the current product with a red border
            product.style.border = "2px solid red";
            product.style.transition = "border 0.5s ease";
            await new Promise((resolve) => setTimeout(resolve, 600)); // Delay for demo effect
          }

          // We have a `finalPrice` field, this is the final price; the one is displayed on the store.
          // Also, we have the `discountPercentage` and `discountPrice`;
          // this means a store can display both or just one of them, so if we have both is nice, but if not,
          // we should calculate the other one based on the final price,
          // this is the same to `specialDiscountPrice` and `specialDiscountPercentage`.
          const productData = {
            title:
              product.querySelector(selectors.title)?.innerText.trim() || null,
            image: selectors.image
              ? product.querySelector(selectors.image)?.getAttribute("src") ||
                null
              : null,
            link:
              selectors.link &&
              product.querySelector(selectors.link)?.getAttribute("href")
                ? baseUrl +
                  product.querySelector(selectors.link).getAttribute("href")
                : null,
            finalPrice:
              product.querySelector(selectors.price)?.innerText.trim() || null,
            discountPercentage: selectors.discountPercentage
              ? product
                  .querySelector(selectors.discountPercentage)
                  ?.innerText.trim()
              : null,
            discountPrice: selectors.discountPrice
              ? product.querySelector(selectors.discountPrice)?.innerText.trim()
              : null,
            specialDiscountPrice: selectors.specialDiscountPrice
              ? product
                  .querySelector(selectors.specialDiscountPrice)
                  ?.innerText.trim()
              : null,
            specialDiscountPercentage: selectors.specialDiscountPercentage
              ? product
                  .querySelector(selectors.specialDiscountPercentage)
                  ?.innerText.trim()
              : null,
          };

          products.push(await window.productNormalizer(productData));

          if (DEMO_MODE) {
            // Remove the highlight after processing
            product.style.border = "";
            await new Promise((resolve) => setTimeout(resolve, 600)); // Delay for demo effect // Delay before moving to the next product
          }
        }
        return products;
      },
      this.config.selectors,
      this.config.baseUrl,
      DEMO_MODE,
    );
  }

  /**
   * Extracts product data from the current page.
   * @param {Object} product - The extracted product.
   * @returns {Object} Scraped product with normalized prices.
   */
  async normalizeProduct(product) {
    const delimiterChar = "-";
    const delimiterLength = 80;
    const delimiter = delimiterChar.repeat(delimiterLength);

    console.log(delimiter);
    console.log(chalk.yellow("🔧 Normalizing product..."));

    const calculatedData = calculatePriceAndDiscounts(product);

    logProductData({
      title: product.title,
      ...calculatedData,
    });
    console.log(delimiter);

    if (DEMO_MODE) await sleep(DEMO_TIMING);
    let { discountPercentage, specialDiscountPercentage } = calculatedData;

    return {
      title: product.title,
      image: product.image,
      link: product.link,
      ...calculatedData,
      discountPercentage: formatPercentage(discountPercentage),
      specialDiscountPercentage: formatPercentage(specialDiscountPercentage),
    };
  }

  /**
   * Saves scraped results as JSON and CSV files.
   * @param {string} dir - Directory to save the results.
   * @param {string} categoryName - Name of the scraped category.
   * @param {Array} products - List of scraped products.
   */
  async saveResults(dir, categoryName, products) {
    try {
      const dateFolder = new Date()
        .toLocaleDateString("en-GB")
        .split("/")
        .reverse()
        .join("-"); // "31-12-2024"
      const outputDir = join(dir, dateFolder);
      const jsonPath = join(outputDir, `${categoryName}-results.json`);
      const csvPath = join(outputDir, `${categoryName}-results.csv`);

      mkdirSync(outputDir, { recursive: true });

      await saveAsJSON(jsonPath, products);
      await saveAsCSV(csvPath, products);
    } catch (error) {
      console.error(
        chalk.red(`[ERROR] Failed to save results: ${error.message}`),
      );
    }
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

    page.on("request", (req) => {
      const url = req.url();

      if (url.includes("www.googletagmanager.com")) {
        console.log(`Blocking request to: ${url}`);
        req.abort();
      } else {
        req.continue();
      }
    });
  }
}

module.exports = BaseScraper;
