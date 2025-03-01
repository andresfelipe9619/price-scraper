const BaseScraper = require("../interfaces/BaseScraper");
const {join} = require("path");

class FalabellaScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 20,
      baseUrl: "https://www.falabella.com.co",
      outputDir: join(__dirname, "../../extracted-data/falabella"),
      categories: {
        // "iphone": "/falabella-co/category/cat1660941/Celulares-y-Telefonos?f.product.brandName=apple",
        "computadores-apple": "/falabella-co/category/cat171006/Computadores?facetSelected=true&f.product.brandName=apple",
      },
      nextPageText: 'siguiente',
      selectors: {
        productCard: '.search-results-4-grid.grid-pod',
        title: "b.copy2",
        price: "span.copy10.primary.medium",
        specialPrice: "span.copy10.primary.high",
        discount: '.discount-badge',
        image: 'picture > img',
        link: 'a.pod-link',
      },
    };
    super(browser, config);
  }
}

module.exports = FalabellaScraper;