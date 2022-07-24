const Koa = require('koa')
const Router = require('@koa/router')
const API = require('./routes')
const logger = require('koa-logger')
const usePriceScraping = require('./scraper')

const app = new Koa()
const router = new Router()

const PORT = 4000

app.use(logger())
app.use(router.routes())
app.use(router.allowedMethods())
app.use('/api', API)

router
  .get('/', ctx => {
    ctx.body = 'Hello World'
  })
  .get('/scraper', ctx => {
    ctx.body = 'Hello World'
  })
  .get('/scrapers/:scraper', async ctx => {
    const { scraper } = ctx.params
    if (!scraper) throw new Error('No scraper provided')
    await usePriceScraping(scraper)
    ctx.body = 'ok'
  })
  .get('/status', ctx => {
    ctx.status = 200
    ctx.body = 'ok'
  })

app.listen(PORT, () => {
  console.log('Server started at port', PORT)
})
