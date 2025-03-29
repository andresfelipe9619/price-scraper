const chalk = require("chalk");
const pidusage = require("pidusage");

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

async function logPerformanceMetrics() {
  const usage = await pidusage(process.pid);
  console.log(chalk.yellow(`📊 Resource usage:`));
  console.log(chalk.cyan(`   🖥 CPU: ${usage.cpu.toFixed(2)}%`));
  console.log(
    chalk.cyan(`   🏗 RAM: ${(usage.memory / 1024 / 1024).toFixed(2)} MB`),
  );
}

function logExecutionTime(startTime) {
  const endTime = performance.now();
  const executionTime = (endTime - startTime) / 1000;
  console.log(
    chalk.green(`🕒 Execution time: ${executionTime.toFixed(2)} seconds`),
  );
}

module.exports = {
  logProductData,
  logExecutionTime,
  logPerformanceMetrics,
  logErrorLoadingPageProducts,
  logNextPageResult,
};
