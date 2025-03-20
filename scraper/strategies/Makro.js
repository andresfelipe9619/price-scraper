const BaseScraper = require("../interfaces/BaseScraper");
const {join} = require("path");

class MakroScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 20,
      baseUrl: "https://tienda.makro.com.co",
      outputDir: join(__dirname, "../../extracted-data/makro"),
      categories: {
        "refrigerados": "/ca/lacteos-huevos-y-refrigerados/CP_17",
      },
      nextPageText: null, //TODO: I need to work on infinite scroll
      selectors: {
        productCard: '.card-product-vertical',
        title: '[class^="CardName"]',
        price: '[class^="CardBasePrice"]',
        specialDiscountPrice: null,
        discount: null,
        image: 'img.prod__figure__img',
        link: null,
        nextPage: null,
      },
    };
    super(browser, config);
  }
}

module.exports = MakroScraper;