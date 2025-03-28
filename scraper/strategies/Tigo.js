const BaseScraper = require("../interfaces/BaseScraper");
const { join } = require("path");

class TigoScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 10,
      baseUrl: "https://compras.tigo.com.co",
      outputDir: join(__dirname, "../../extracted-data/tigo"),
      categories: {
        iphone: "/celulares/apple?O=OrderByTopSaleDESC&PS=24",
      },
      nextPageText: null,
      selectors: {
        productCard: ".celulares---tigo-colombia",
        title: ".containerVersionReact--contentTitle__productName",
        price: ".containerVersionReact--contentPrice__bestPrice",
        discountPrice: ".containerVersionReact--contentPrice__listPrice",
        discountPercentage:
          ".containerVersionReact--contentDiscount--highlightPrice",
        specialDiscountPrice: null,
        image: "a.item-image > img",
        link: "a.item-image",
        nextPage: null,
      },
    };
    super(browser, config);
  }
}

module.exports = TigoScraper;
