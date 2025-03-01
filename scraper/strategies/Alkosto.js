const chalk = require('chalk');
const {join} = require("node:path");
const BaseScraper = require("../interfaces/BaseScraper");


class AlkostoScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 20,
      baseUrl: "https://www.alkosto.com",
      outputDir: join(__dirname, "../../extracted-data/alkosto"),
      categories: {
        // "celulares": '/coleccion/10996?productClusterIds=10996&facets=productClusterIds&sort=score_desc',
        "computadores-apple": '/computadores-tablet/c/BI_COMP_ALKOS?sort=relevance',
        // "lacteos-huevos-y-refrigerados": '/mercado/lacteos-huevos-y-refrigerados?category-1=mercado&category-2=lacteos-huevos-y-refrigerados&facets=category-1%2Ccategory-2&sort=score_des',
      },
      selectors: {
        productCard: '.ais-InfiniteHits-item.product__item',
        title: ".ais-InfiniteHits-item product__item  ",
        price: ".price",
        specialPrice: '.price-contentPlp',
        discount: '.label-offer',
        image: '.product__item__information__image > img',
        link: '.product__item__top__link',
        nextPageButton: 'button',
      },
    };
    super(browser, config);
  }

  async hasNextPage(page) {
    let nextPage = false
    try {
      nextPage = await page.evaluate(() => {
        const button = document.querySelector('button');
        return button && button.innerText.trim().toLowerCase() === 'siguiente';
      });
      if (nextPage) {
        console.log(chalk.green('[INFO] Found "Siguiente" button. Loading more products...'));
      } else {
        console.log(chalk.red.bold('[STOP] No more products found. Stopping scraper.'));
      }
      return nextPage
    } catch (e) {
      console.error(chalk.red.bold('[ERROR] Failed to check for "Siguiente":'), e);
      return false
    }
  }
}

module.exports = AlkostoScraper;
