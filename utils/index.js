/**
 * Normalizes a price string to a float value.
 * @param {string} price - The price string to normalize.
 * @param {string} [defaultPrice="$0"] - The default price to use if the input is falsy.
 * @returns {number} The normalized price as a number.
 */
function normalizePrice(price, defaultPrice = "$0") {
  try {
    return parseFloat(clean(price || defaultPrice).replace(/[$,\s]/g, '').replace(/\./g, '')) || 0;
  } catch (error) {
    console.error('Error normalizing price:', error);
    return 0;
  }
}

/**
 * Extracts and normalizes a discount percentage from a string.
 * @param {string} discount - The discount string to normalize.
 * @returns {number} The discount percentage as a number.
 */
function normalizeDiscount(discount) {
  const cleaned = clean(discount);
  const percentageMatch = cleaned.match(/(\d+)%/);
  return percentageMatch ? parseInt(percentageMatch[1], 10) : 0;
}

/**
 * Normalizes a discount string into percentage and amount values.
 * @param {string} discount - The discount string to normalize.
 * @returns {{percentage: number, amount: number}} An object containing the discount percentage and amount.
 */
function normalizePriceAndDiscount(discount) {
  const cleaned = clean(discount);
  if (!cleaned) return {percentage: 0, amount: 0};

  const percentage = normalizeDiscount(cleaned);
  const amountMatch = cleaned.match(/\$\s?([\d.,]+)/);
  const amount = normalizePrice(amountMatch ? amountMatch[1] : "0");

  return {percentage, amount};
}

/**
 * Cleans a string by removing newlines, excessive spaces, and trimming.
 * @param {string} str - The string to clean.
 * @returns {string} The cleaned string.
 */
function clean(str) {
  return str ? str.replace(/\n/g, '').replace(/\s+/g, ' ').trim() : '';
}

/**
 * Splits an array into smaller chunks of a given size.
 * @param {Array} arr - The array to chunk.
 * @param {number} size - The size of each chunk.
 * @returns {Array[]} An array of chunks.
 */
function chunkArray(arr, size) {
  return Array.from({length: Math.ceil(arr.length / size)}, (_, i) =>
      arr.slice(i * size, i * size + size)
  );
}

/**
 * Pauses execution for a specified amount of time.
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>} A promise that resolves after the specified time.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formats a number as a percentage string.
 * @param {number} value - The value to format.
 * @returns {string|null} The formatted percentage string or null if the value is falsy.
 */
function formatPercentage(value) {
  return value ? `${value}%` : null;
}

/**
 * Converts a string into a URL-friendly slug.
 * - Converts the string to lowercase.
 * - Replaces spaces with hyphens.
 * - Removes any non-alphanumeric characters except hyphens.
 *
 * @param {string} input - The string to be converted into a slug.
 * @returns {string} The slugified version of the input string.
 *
 * @example
 * const input = "LIBRE IPHONE 13 128GB";
 * const slug = slugify(input);
 * console.log(slug); // Output: "libre-iphone-13-128gb"
 */
function slugify(input) {
  return input
      .toLowerCase() // Convert to lowercase
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, ''); // Remove any non-alphanumeric characters except hyphens
}

function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj.hasOwnProperty(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

module.exports = {
  normalizePrice,
  normalizePriceAndDiscount,
  sleep,
  pick,
  chunkArray,
  slugify,
  formatPercentage
};
