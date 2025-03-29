const chalk = require("chalk");
const pidusage = require("pidusage");
const path = require("path");
const fs = require("fs");

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

// Function to get a log file stream per strategy
function getLogStream(strategy) {
  const logsDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir); // Ensure logs folder exists

  const logFilePath = path.join(logsDir, `${strategy}.log`);
  return fs.createWriteStream(logFilePath, { flags: "a" }); // Append mode
}

// Function to log to both console and file
function logToFile(strategy, message) {
  const logStream = getLogStream(strategy);
  console.log(message);
  // eslint-disable-next-line no-control-regex
  logStream.write(message.replace(/\x1B\[[0-9;]*[mK]/g, "") + "\n"); // Remove chalk color codes before writing
  logStream.end(); // Close stream after writing
}

// Logs performance metrics (CPU & RAM)
async function logPerformanceMetrics(strategy) {
  const usage = await pidusage(process.pid);
  logToFile(strategy, chalk.yellow(`📊 Resource usage:`));
  logToFile(strategy, chalk.cyan(`   🖥 CPU: ${usage.cpu.toFixed(2)}%`));
  logToFile(
    strategy,
    chalk.cyan(`   🏗 RAM: ${(usage.memory / 1024 / 1024).toFixed(2)} MB`),
  );
}

// Logs execution time
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
