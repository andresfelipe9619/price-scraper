const BaseScraper = require("../interfaces/BaseScraper");
const { join } = require("path");

class ExitoScraper extends BaseScraper {
  constructor(browser) {
    const config = {
      maxPages: 10,
      baseUrl: "https://www.exito.com",
      outputDir: join(__dirname, "../../extracted-data/exito"),
      categories: {
        celulares:
          "/coleccion/10996?productClusterIds=10996&facets=productClusterIds&sort=score_desc",
        "computadores-apple":
          "/tecnologia/computadores?category-2=computadores&brand=apple&category-1=tecnologia&facets=category-2%2Cbrand%2Ccategory-1&sort=score_desc",
        "lacteos-huevos-y-refrigerados":
          "/mercado/lacteos-huevos-y-refrigerados?category-1=mercado&category-2=lacteos-huevos-y-refrigerados&facets=category-1%2Ccategory-2&sort=score_desc",
      },
      nextPageText: "siguiente",
      selectors: {
        firstVisitModal: ".modal_fs-modal__zQHxL",
        productCard: 'article[class^="productCard_"]',
        title: ".styles_name__qQJiK",
        price: "[data-fs-container-price-otros]",
        specialDiscountPrice: "[data-fs-price]",
        discountPercentage: '[class^="priceSection_container-promotion"]',
        image: 'img[alt="Imagen del producto"]',
        link: 'a[data-testid="product-link"]',
      },
    };
    super(browser, config);
  }
}

module.exports = ExitoScraper;
