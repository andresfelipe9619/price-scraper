const fs = require("fs");
const chalk = require("chalk");
const {parse} = require('json2csv');

async function saveAsJSON(name, data) {
  try {
    const stringifyData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(name, stringifyData);
    console.log(chalk.green(`Data saved to ${name}`));
  } catch (error) {
    console.log(chalk.red(`Failed to save JSON: ${error.message}`));
  }
}

async function saveAsCSV(name, data) {
  try {
    const csv = parse(data);
    await fs.promises.writeFile(name, csv);
    console.log(chalk.green(`Data saved to ${name}`));
  } catch (error) {
    console.log(chalk.red(`Failed to save CSV: ${error.message}`));
  }
}

module.exports = {
  saveAsJSON,
  saveAsCSV
}