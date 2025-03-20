/**
 * Export module for interacting with the file system and export data.
 * @module Export
 */
const fs = require("fs");
const chalk = require("chalk");
const { parse } = require("json2csv");

/**
 * Saves data to a file in JSON format.
 * @async
 * @function saveAsJSON
 * @param {string} name - The name of the file to save, including the extension.
 * @param {Object|Array} data - The data to save, can be an object or an array.
 * @returns {Promise<void>} - Resolves when the file is successfully saved.
 */
async function saveAsJSON(name, data) {
  try {
    const stringifyData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(name, stringifyData);
    console.log(chalk.green(`Data saved to ${name}`));
  } catch (error) {
    console.log(chalk.red(`Failed to save JSON: ${error.message}`));
  }
}

/**
 * Saves data to a file in CSV format.
 * @async
 * @function saveAsCSV
 * @param {string} name - The name of the file to save, including the extension.
 * @param {Array<Object>} data - The data to save, must be an array of objects.
 * @returns {Promise<void>} - Resolves when the file is successfully saved.
 */
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
  saveAsCSV,
};
