const BaseScraper = require("../interfaces/BaseScraper");
const {join} = require("path");

class IShopScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 20,
      baseUrl: "https://co.tiendasishop.com/",
      outputDir: join(__dirname, "../../extracted-data/ishop"),
      categories: {
        iphone: "/search?q=iphone&options%5Bprefix%5D=last&filter.p.vendor=Apple&filter.v.price.gte=&filter.v.price.lte=&sort_by=relevance",
        "computadores-apple": "/search?q=macbook&options%5Bprefix%5D=last&filter.p.vendor=Apple&filter.v.price.gte=&filter.v.price.lte=&sort_by=relevance",
      },
      nextPageText: 'página siguiente',
      selectors: {
        productCard: '.search-product-card',
        title: ".card-head",
        price: ".price__container_carousel",
        specialPrice: ".price-old-class-1",
        discount: '.price-segment-discount-1',
        image: 'img.price__container_carousel',
        link: 'a.full-unstyled-link',
        nextPage: 'a',
      },
    };
    super(browser, config);
  }
}

module.exports = IShopScraper;