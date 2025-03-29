const { Command } = require("commander");
const inquirer = require("inquirer");
const runScraper = require("../scraper");

const program = new Command();

const scraperGroups = [
  ["alkosto", "maccenter"], // DEMO group
  ["ishop", "exito", "mercadolibre", "falabella"],
  ["movistar", "claro", "tigo", "makro"],
  ["olimpica", "jumbo"], // TO FIX
];

const allScrapers = scraperGroups.flat();

program
  .option("-a, --all", "Run all scrapers")
  .option("-s, --scraper <names...>", "Specify scrapers to run")
  .parse(process.argv);

const options = program.opts();

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

async function main() {
  let scrapersToRun = [];

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

  await Promise.allSettled(scraperGroups[0].map(runScraper)); // DEMO group
  await Promise.allSettled(scraperGroups[1].map(runScraper)); // Second group
  await Promise.allSettled(scraperGroups[2].map(runScraper)); // Third group
  await Promise.allSettled(scraperGroups[3].map(runScraper)); // TO FIX group

  console.log("🏁 All selected scrapers finished!");
}

main();
