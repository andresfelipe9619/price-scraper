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

// Store open file streams
const logStreams = new Map();

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

async function logPerformanceMetrics(strategy) {
  const usage = await pidusage(process.pid);
  logToFile(strategy, chalk.yellow(`📊 Resource usage:`));
  logToFile(strategy, chalk.cyan(`   🖥 CPU: ${usage.cpu.toFixed(2)}%`));
  logToFile(
    strategy,
    chalk.cyan(`   🏗 RAM: ${(usage.memory / 1024 / 1024).toFixed(2)} MB`),
  );
}

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
