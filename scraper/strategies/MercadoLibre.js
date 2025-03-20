const BaseScraper = require("../interfaces/BaseScraper");
const {join} = require("path");

class MercadoLibreScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 1,
      baseUrl: "https://listado.mercadolibre.com.co",
      outputDir: join(__dirname, "../../extracted-data/mercadolibre"),
      categories: {
        iphone: "/iphone-15#D[A:iphone%2015]",
        // "computadores-apple": "/search?q=macbook&options%5Bprefix%5D=last&filter.p.vendor=Apple&filter.v.price.gte=&filter.v.price.lte=&sort_by=relevance",
      },
      nextPageText: 'siguiente', //TODO: Pagination not working as normal, they have a very different way
      selectors: {
        productCard: '.poly-card--list',
        title: ".poly-component__title",
        price: ".poly-price__current",
        specialDiscountPrice: ".poly-rebates__pill",
        discountPercentage: '.andes-money-amount__discount',
        image: 'img.poly-component__picture',
        link: 'a.poly-component__title',
        nextPage: 'span',
      },
    };
    super(browser, config);
  }
}

module.exports = MercadoLibreScraper;