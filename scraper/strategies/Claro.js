const BaseScraper = require("../interfaces/BaseScraper");
const {join} = require("path");

class ClaroScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 20,
      baseUrl: "https://tienda.claro.com.co",
      outputDir: join(__dirname, "../../extracted-data/claro"),
      categories: {
        iphone: "/claro/celulares?facet=manufacturer.raw%253A%2522Apple%2522&urlCategory=celulares",
      },
      nextPageText: null,
      selectors: {
        productCard: '.equipoElement',
        title: ".container-name--red > p",
        price: ".span-pnow1--red",
        specialDiscountPrice: ".span-pbefore1--red",
        discount: null,
        image: 'img.img-product',
        link: null, //TODO: Need to build the link dynamically, maybe using slugify?
        nextPage: null,
      },
    };
    super(browser, config);
  }
}

module.exports = ClaroScraper;