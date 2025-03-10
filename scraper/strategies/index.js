const Alkosto = require('./Alkosto');
const Exito = require('./Exito');
const Falabella = require('./Falabella');
const IShop = require('./IShop');
const Jumbo = require('./Jumbo');
const Makro = require('./Makro');
const Ebay = require('./Ebay');
const Claro = require('./Claro');
const MacCenter = require('./MacCenter');
const MercadoLibre = require('./MercadoLibre');
const Movistar = require('./Movistar');
const Tigo = require('./Tigo');
const Olimpica = require('./Olimpica');

// const Homecenter = require('./Homecenter');
// const Zara = require('./Zara');
// const Adidas = require('./Adidas');
// const Nike = require('./Nike');
// const ArturoCalle = require('./ArturoCalle');
// const PepeGanga = require('./PepeGanga');
// const LaRebaja = require('./LaRebaja');
// const Farmatodo = require('./Farmatodo');
// const CruzVerde = require('./CruzVerde');
// const D1 = require('./D1');
// const Ara = require('./Ara');
// const JustoBueno = require('./JustoBueno');
// const Carulla = require('./Carulla');
// const Panamericana = require('./Panamericana');
// const Koaj = require('./Koaj');
// const SpringStep = require('./SpringStep');
// const Chevignon = require('./Chevignon');

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
  ['maccenter', MacCenter],
  // ['larebaja', LaRebaja],
  // ['farmatodo', Farmatodo],
  // ['cruzverde', CruzVerde],
  // ['homecenter', Homecenter],
  // ['d1', D1],
  // ['carulla', Carulla],
  // ['ara', Ara],
  // ['justobueno', JustoBueno],
  // ['pepeganga', PepeGanga],
  // ['panamericana', Panamericana],
  // ['arturocalle', ArturoCalle],
  // ['nike', Nike],
  // ['adidas', Adidas],
  // ['koaj', Koaj],
  // ['zara', Zara],
  // ['springstep', SpringStep],
  // ['chevignon', Chevignon],
]);

module.exports = Scrapers;