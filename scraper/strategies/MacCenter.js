const BaseScraper = require("../interfaces/BaseScraper");
const { join } = require("path");

class MacCenterScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 20,
      baseUrl: "https://mac-center.com",
      outputDir: join(__dirname, "../../extracted-data/mac-center"),
      categories: {
        iphone: "/search?sort=price%7Edesc&q=iphone",
        "computadores-apple": "/search?sort=price%7Edesc&q=macbook",
      },
      nextPageText: "página siguiente",
      selectors: {
        productCard: ".search-product-card",
        title: ".card-head",
        price: ".price__container_carousel",
        specialDiscountPrice: ".price-old-class-1",
        discountPercentage: ".price-segment-discount-1",
        image: "img.price__container_carousel",
        link: "a.full-unstyled-link",
        nextPage: "a",
      },
    };
    super(browser, config);
  }
}

module.exports = MacCenterScraper;
