const BaseScraper = require("../interfaces/BaseScraper");
const {join} = require("path");

class MovistarScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 20,
      baseUrl: "https://tienda.movistar.com.co",
      outputDir: join(__dirname, "../../extracted-data/movistar"),
      categories: {
        iphone: "/celulares/iphone.html",
      },
      nextPageText: null,
      selectors: {
        productCard: '.card_link',
        title: ".cat-card__name",
        price: ".c-card__price",
        specialPrice:null,
        discount: null,
        image: 'img.product-image-photo',
        link: null, //TODO: Need to build the link dynamically, maybe using slugify?
      },
    };
    super(browser, config);
  }
}

module.exports = MovistarScraper;