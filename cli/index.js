const { Command } = require("commander");
const inquirer = require("inquirer");
const runScraper = require("../scraper");

/**
 * The main CLI program instance
 * @type {Command}
 */
const program = new Command();

/**
 * Groups of scrapers organized by category or purpose
 * @type {Array<Array<string>>}
 */
const scraperGroups = [
  ["alkosto", "maccenter"], // DEMO group
  ["ishop", "exito", "mercadolibre", "falabella"],
  ["movistar", "claro", "tigo", "makro"],
  ["olimpica", "jumbo"], // TO FIX
];

/**
 * Flattened array of all available scrapers
 * @type {Array<string>}
 */
const allScrapers = scraperGroups.flat();

// Configure CLI options
program
  .option("-a, --all", "Run all scrapers")
  .option("-s, --scraper <names...>", "Specify scrapers to run")
  .parse(process.argv);

/**
 * Parsed command line options
 * @type {Object}
 */
const options = program.opts();

/**
 * Prompts the user to select which scrapers to run via interactive CLI
 * @returns {Promise<Array<string>>} Array of selected scraper names
 */
async function getScraperSelection() {
  const { selectedScrapers } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedScrapers",
      message: "Select the scrapers to run:",
      choices: [
        { name: "Run All Scrapers", value: "all" },
        new inquirer.Separator(),
        ...allScrapers.map((s) => ({ name: s, value: s })),
      ],
    },
  ]);

  return selectedScrapers.includes("all") ? allScrapers : selectedScrapers;
}

/**
 * Main execution function that handles scraper selection and execution
 * @returns {Promise<void>}
 */
async function main() {
  /** @type {Array<string>} */
  let scrapersToRun = [];

  // Determine which scrapers to run based on CLI options or user selection
  if (options.all) {
    scrapersToRun = allScrapers;
  } else if (options.scraper) {
    scrapersToRun = options.scraper;
  } else {
    scrapersToRun = await getScraperSelection();
  }

  if (scrapersToRun.length === 0) {
    console.log("❌ No scrapers selected. Exiting...");
    process.exit(1);
  }

  console.log(`🚀 Running ${scrapersToRun.length} scraper(s)...`);

  // Execute scrapers in their respective groups
  for (const group of scraperGroups) {
    await Promise.allSettled(
      group
        .filter((scraper) => scrapersToRun.includes(scraper))
        .map(runScraper),
    );
  }

  console.log("🏁 All selected scrapers finished!");
}

// Start the program
main().catch((err) => {
  console.error("❌ Error in main execution:", err);
  process.exit(1);
});
