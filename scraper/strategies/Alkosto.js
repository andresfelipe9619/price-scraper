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
        "computadores-apple": '/computadores-tablet/c/BI_COMP_ALKOS?sort=relevance&q=%3Arelevance%3Abrand%3AAPPLE',
        // "lacteos-huevos-y-refrigerados": '/mercado/lacteos-huevos-y-refrigerados?category-1=mercado&category-2=lacteos-huevos-y-refrigerados&facets=category-1%2Ccategory-2&sort=score_des',
      },
      nextPageText: 'mostrar más productos',
      selectors: {
        productCard: '.ais-InfiniteHits-item',
        title: ".product__item__top__title",
        price: ".price",
        specialPrice: '.price-contentPlp',
        discount: '.label-offer',
        image: '.product__item__information__image > img',
        link: '.product__item__top__link',
      },
    };
    super(browser, config);
  }
}

module.exports = AlkostoScraper;
