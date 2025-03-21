const Koa = require("koa");
const Router = require("@koa/router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const API = require("./routes");
const usePriceScraping = require("../scraper");

const app = new Koa();
const router = new Router();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(logger());
app.use(bodyParser());

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
    ctx.app.emit("error", err, ctx);
  }
});

// Routes
router.get("/", (ctx) => {
  ctx.body = "Hello World";
});

router.get("/status", (ctx) => {
  ctx.status = 200;
  ctx.body = "ok";
});

router.get("/scrapers/:scraper", async (ctx) => {
  const { scraper } = ctx.params;
  if (!scraper) {
    ctx.throw(400, "No scraper provided");
  }
  try {
    await usePriceScraping(scraper);
    ctx.body = { message: "Scraper executed successfully" };
  } catch (error) {
    ctx.throw(500, "Failed to execute scraper");
  }
});

// Mount API routes
app.use(router.routes());
app.use(router.allowedMethods());
// app.use('/api', API)

// Global error logging
app.on("error", (err, ctx) => {
  console.error("Server error:", err.message);
});

// Server start
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

module.exports = app;
