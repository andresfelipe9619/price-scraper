const BaseScraper = require("../interfaces/BaseScraper");
const {join} = require("path");

class OlimpicaScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 20,
      baseUrl: "https://www.olimpica.com",
      outputDir: join(__dirname, "../../extracted-data/olimpica"),
      categories: {
        iphone: "/iphone?_q=iphone&map=ft",
      },
      nextPageText: 'Mostrar más',
      selectors: {
        productCard: 'section.vtex-product-summary-2-x-container',
        title: ".vtex-product-summary-2-x-brandName t-body",
        price: ".olimpica-dinamic-flags-0-x-priceContainer",
        specialPrice: ".olimpica-dinamic-flags-0-x-currencyContainer",
        discount: null,
        image: 'img.vtex-product-summary-2-x-image',
        link: null,
        nextPage: 'button',
      },
    };
    super(browser, config);
  }
}

module.exports = OlimpicaScraper;