const fs = require('fs');
const path = require('path');
const {saveAsJSON, saveAsCSV} = require("../scraper/interfaces/Export");

const inputDir = path.join(__dirname, '../extracted-data');
const outputDir = path.join(__dirname, '../all-in');

// Helper function to read and parse JSON
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

// Recursive function to gather product data
function collectDataByCategory(dir) {
  const categories = {};

  fs.readdirSync(dir).forEach((store) => {
    const storePath = path.join(dir, store);

    if (fs.statSync(storePath).isDirectory()) {
      fs.readdirSync(storePath).forEach((category) => {
        const categoryPath = path.join(storePath, category);

        if (fs.statSync(categoryPath).isDirectory()) {
          const jsonFile = path.join(categoryPath, category + '-results.json');

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

// Write combined data to files
function writeOutputFiles(categories) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  Object.entries(categories).forEach(async ([category, products]) => {
    const outputFile = path.join(outputDir, category);
    await saveAsJSON(outputFile, products);
    await saveAsCSV(outputFile, products);
    console.log(`✅ Combined data for ${category} saved to ${outputFile}`);
  });
}

// Main function to run the script
function main() {
  console.log('🔍 Scanning directory and collecting product data...');
  const categories = collectDataByCategory(inputDir);
  writeOutputFiles(categories);
  console.log('🚀 Data aggregation complete!');
}

main();

// Let me know if you’d like me to add CSV handling or tweak anything else! 🚀
