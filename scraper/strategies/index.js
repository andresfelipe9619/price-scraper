const Alkosto = require('./Alkosto')
const Exito = require('./Exito')
const Falabella = require('./Falabella')
const Jumbo = require('./Jumbo')
const Makro = require('./Makro')
const Olimpica = require('./Olimpica')

const Scrapers = new Map([
  ['exito', Exito],
  ['jumbo', Jumbo],
  ['makro', Makro],
  ['alkosto', Alkosto],
  ['olimpica', Olimpica],
  ['falabella', Falabella]
])

module.exports = Scrapers
