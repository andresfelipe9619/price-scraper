class Scraper {
  constructor (baseURL, path, scraper, bypassModal) {
    this.baseURL = baseURL
    this.path = path
    this.scraper = scraper
    this.bypassModal = bypassModal
  }
}

module.exports = Scraper
