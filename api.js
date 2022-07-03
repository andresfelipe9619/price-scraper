const Koa = require('koa')
const Router = require('@koa/router')
const logger = require('koa-logger')

const app = new Koa()
const router = new Router()

const PORT = 4000

app.use(logger())
app.use(router.routes())
app.use(router.allowedMethods())

router
  .get('/', ctx => {
    ctx.body = 'Hello World'
  })
  .get('/scrape', ctx => {
    ctx.body = 'Hello World'
  })
  .get('/scrape/:scraper', ctx => {
    ctx.body = 'Hello World'
  })
  .get('/companies', ctx => {
    ctx.body = 'Hello World'
  })
  .get('/products', ctx => {
    ctx.body = 'Hello World'
  })
  .get('/products/:id', ctx => {
    ctx.body = 'Hello World'
  })
  .get('/status', ctx => {
    ctx.status = 200
    ctx.body = 'ok'
  })

app.listen(PORT, () => {
  console.log('Server started at port', PORT)
})
