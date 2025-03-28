const BaseScraper = require("../interfaces/BaseScraper");
const { join } = require("path");

class JumboScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 10,
      baseUrl: "https://www.jumbocolombia.com",
      outputDir: join(__dirname, "../../extracted-data/jumbo"),
      categories: {
        iphone: "/iphone?_q=iphone&map=ft&order=OrderByPriceDESC",
      },
      autoScroll: true,
      nextPageText: null,
      selectors: {
        productCard: "section.vtex-product-summary-2-x-container",
        title: ".vtex-product-summary-2-x-productNameContainer",
        price: ".tiendasjumboqaio-jumbo-minicart-2-x-price",
        specialDiscountPrice: ".tiendasjumboqaio-jumbo-minicart-2-x-price",
        discount:
          ".tiendasjumboqaio-jumbo-minicart-2-x-containerPercentageFlag",
        image: "img.vtex-product-summary-2-x-imageNormal",
        link: "a.vtex-product-summary-2-x-clearLink",
        nextPage: ".tiendasjumboqaio-jumbo-fetch-more-paginator-0-x-contentSvg",
      },
    };
    super(browser, config);
  }
}

module.exports = JumboScraper;
