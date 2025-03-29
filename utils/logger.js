const chalk = require("chalk");
const pidusage = require("pidusage");
const path = require("path");
const fs = require("fs");

/**
 * Logs product data to the console with colorful formatting
 * @param {Object} product - The product data to log
 * @param {string} product.title - The product title
 * @param {string} product.finalPrice - The final price of the product
 * @param {string} product.originalPrice - The original price of the product
 * @param {string} [product.discountPercentage] - The discount percentage
 * @param {string} [product.specialDiscountPrice] - The special discount price
 * @param {string} [product.specialDiscountPercentage] - The special discount percentage
 */
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

/**
 * Logs an error when loading page products fails
 * @param {number} pageIndex - The index of the page that failed to load
 * @param {string} categoryName - The name of the category being processed
 * @param {Error} error - The error that occurred
 */
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

/**
 * Logs the result of checking for a next page
 * @param {boolean} nextPage - Whether a next page was found
 * @param {string} text - The text of the next page button
 * @param {Object} selectors - The selectors used to find the next page button
 */
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

// Store open file streams
const logStreams = new Map();

/**
 * Gets or creates a log file stream for a given strategy
 * @param {string} strategy - The strategy name used for the log file
 * @returns {fs.WriteStream} The write stream for the log file
 */
function getLogStream(strategy) {
  const logsDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

  if (!logStreams.has(strategy)) {
    const logFilePath = path.join(logsDir, `${strategy}.log`);
    const stream = fs.createWriteStream(logFilePath, { flags: "a" });
    logStreams.set(strategy, stream);
  }
  return logStreams.get(strategy);
}

/**
 * Logs a message to both console and strategy-specific log file
 * @param {string} strategy - The strategy name for the log file
 * @param {string} message - The message to log
 */
function logToFile(strategy, message) {
  const logStream = getLogStream(strategy);
  console.log(message);
  // eslint-disable-next-line no-control-regex
  logStream.write(message.replace(/\x1B\[[0-9;]*[mK]/g, "") + "\n"); // Remove ANSI color codes
}

// Gracefully close log streams when process exits
process.on("exit", () => {
  for (const stream of logStreams.values()) {
    stream.end();
  }
});

/**
 * Logs performance metrics (CPU and memory usage) to the strategy log file
 * @param {string} strategy - The strategy name for the log file
 * @returns {Promise<void>}
 */
async function logPerformanceMetrics(strategy) {
  const usage = await pidusage(process.pid);
  logToFile(strategy, chalk.yellow(`📊 Resource usage:`));
  logToFile(strategy, chalk.cyan(`   🖥 CPU: ${usage.cpu.toFixed(2)}%`));
  logToFile(
    strategy,
    chalk.cyan(`   🏗 RAM: ${(usage.memory / 1024 / 1024).toFixed(2)} MB`),
  );
}

/**
 * Logs the execution time to the strategy log file
 * @param {string} strategy - The strategy name for the log file
 * @param {number} startTime - The start time of execution (performance.now())
 */
function logExecutionTime(strategy, startTime) {
  const endTime = performance.now();
  const executionTime = (endTime - startTime) / 1000;
  logToFile(
    strategy,
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
