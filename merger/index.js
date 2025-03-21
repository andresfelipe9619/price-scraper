const fs = require("fs");
const path = require("path");
const { saveAsJSON, saveAsCSV } = require("../scraper/interfaces/Export");

const inputDir = path.join(__dirname, "../extracted-data");
const outputDir = path.join(__dirname, "../all-in");

/**
 * Reads and parses a JSON file.
 *
 * @param {string} filePath - The path to the JSON file.
 * @returns {Array<Object>} Parsed JSON data as an array of objects, or an empty array if an error occurs.
 */
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

/**
 * Recursively collects product data from JSON files within category directories.
 *
 * @param {string} dir - The root directory containing store and category subdirectories.
 * @returns {Object<string, Object[]>} An object where keys are category names and values are arrays of product data.
 */
function collectDataByCategory(dir) {
  const categories = {};

  fs.readdirSync(dir).forEach((store) => {
    const storePath = path.join(dir, store);

    if (fs.statSync(storePath).isDirectory()) {
      fs.readdirSync(storePath).forEach((category) => {
        const categoryPath = path.join(storePath, category);

        if (fs.statSync(categoryPath).isDirectory()) {
          const jsonFile = path.join(categoryPath, category + "-results.json");

          if (fs.existsSync(jsonFile)) {
            const products = readJsonFile(jsonFile);
            const productsWithStore = products.map((product) => ({
              ...product,
              storeName: store,
            }));

            if (!categories[category]) {
              categories[category] = [];
            }

            categories[category].push(...productsWithStore);
          }
        }
      });
    }
  });

  return categories;
}

/**
 * Writes combined product data to JSON and CSV files.
 *
 * @param {Object<string, Object[]>} categories - An object mapping category names to arrays of product data.
 * @returns {Promise<void>} Resolves once all files have been written.
 */
async function writeOutputFiles(categories) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [category, products] of Object.entries(categories)) {
    const outputFile = path.join(outputDir, category);
    await saveAsJSON(outputFile, products);
    await saveAsCSV(outputFile, products);
    console.log(`✅ Combined data for ${category} saved to ${outputFile}`);
  }
}

/**
 * Main function to scan directories, collect product data, and write output files.
 */
function main() {
  console.log("🔍 Scanning directory and collecting product data...");
  const categories = collectDataByCategory(inputDir);
  writeOutputFiles(categories);
  console.log("🚀 Data aggregation complete!");
}

// Execute the script
main();
