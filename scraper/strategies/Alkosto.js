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
        "iphone": '/celulares/smartphones/celulares-iphone/c/BI_M009_ALKOS?sort=relevance',
        // "computadores-apple": '/computadores-tablet/c/BI_COMP_ALKOS?sort=relevance&q=%3Arelevance%3Abrand%3AAPPLE',
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
