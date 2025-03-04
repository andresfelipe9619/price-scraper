const Alkosto = require('./Alkosto')
const Exito = require('./Exito')
const Falabella = require('./Falabella')
const IShop = require('./IShop')
const Jumbo = require('./Jumbo')
const Makro = require('./Makro')
const Ebay = require('./Ebay')
const Claro = require('./Claro')
const MacCenter = require('./MacCenter')
const MercadoLibre = require('./MercadoLibre')
const Movistar = require('./Movistar')
const Tigo = require('./Tigo')
const Olimpica = require('./Olimpica')

/** @type {Map<string, import('../interfaces/BaseScraper')>} */
const Scrapers = new Map([
  ['exito', Exito],
  ['alkosto', Alkosto],
  ['falabella', Falabella],
  ['ishop', IShop],
  ['movistar', Movistar],
  ['jumbo', Jumbo],
  ['makro', Makro],
  ['olimpica', Olimpica],
  ['mercadolibre', MercadoLibre],
  ['tigo', Tigo],
  ['ebay', Ebay],
  ['claro', Claro],
  ['maccenter', MacCenter]
])

module.exports = Scrapers