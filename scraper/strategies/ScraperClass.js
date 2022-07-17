class Scraper {
  constructor (baseURL, path, scraper, bypassModal) {
    this.baseURL = baseURL
    this.path = path
    this.scraper = scraper
    this.bypassModal = bypassModal
  }
  //   // Getter
  //   get area() {
  //     return this.calcArea();
  //   }
  //  // Método
  //  calcArea () {
  //    return this.alto * this.ancho;
  //  }
}

module.exports = Scraper
