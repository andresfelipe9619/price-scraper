const chalk = require("chalk");

function logProductData({
  title,
  finalPrice,
  originalPrice,
  discountPercentage,
  specialDiscountPrice,
  specialDiscountPercentage,
}) {
  console.log(
    chalk.magenta("\n[PRODUCT] Processed product:"),
    chalk.yellow(title || "Unknown"),
  );
  console.log(chalk.cyan(`  💲 Final Price: ${chalk.yellow(finalPrice)}`));
  console.log(
    chalk.cyan(`  🏷️ Original Price: ${chalk.yellow(originalPrice)}`),
  );
  console.log(
    chalk.cyan(`  📉 Discount: ${chalk.yellow(discountPercentage || "0")}%`),
  );
  if (specialDiscountPrice) {
    console.log(
      chalk.cyan(
        `  ✨ Special Discount: ${chalk.yellow(
          specialDiscountPercentage || "0",
        )}%`,
      ),
    );
  }
}

function logErrorLoadingPageProducts(pageIndex, categoryName, error) {
  console.log(
    chalk.red.bold(
      `[ERROR] Failed to load products on page #${pageIndex}: ${error.message}`,
    ),
  );
  console.log(
    chalk.yellow.bold(
      `[INFO] Saving the collected products so far for category: ${categoryName}`,
    ),
  );
}

function logNextPageResult(nextPage, text, selectors) {
  if (nextPage) {
    console.log(
      chalk.green(
        `[INFO] Found "${text}" button (by text or aria-label). Loading more products...`,
      ),
    );
  } else {
    console.log(
      chalk.red.bold(
        `[STOP] NOT Found "${text}|${selectors.nextPage}" button (by text or aria-label). Stopping scraper.`,
      ),
    );
  }
}

module.exports = {
  logProductData,
  logErrorLoadingPageProducts,
  logNextPageResult,
};
