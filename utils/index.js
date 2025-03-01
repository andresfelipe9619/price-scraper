/**
 * Normalizes a price string to a float value.
 * @param {string} price - The price string to normalize.
 * @param {string} [defaultPrice="$0"] - The default price to use if the input is falsy.
 * @returns {number} The normalized price as a number.
 */
function normalizePrice(price, defaultPrice = "$0") {
  try {
    return parseFloat((price || defaultPrice).trim().replace(/[$,\s]/g, '').replace(/\./g, '')) || 0;
  } catch (error) {
    console.error('Error normalizing price:', error);
    return 0;
  }
}

/**
 * Normalizes a discount string into percentage and amount values.
 * @param {string} discount - The discount string to normalize.
 * @returns {{percentage: number, amount: number}} An object containing the discount percentage and amount.
 */
function normalizeDiscount(discount) {
  if (!discount || discount.trim() === '') return { percentage: 0, amount: 0 };

  const cleaned = discount.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

  const percentageMatch = cleaned.match(/(\d+)%/);
  const amountMatch = cleaned.match(/\$\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d*)?)/);

  let amount = amountMatch ? amountMatch[1].replace(/[.,]/g, '') : 0;

  return {
    percentage: percentageMatch ? parseInt(percentageMatch[1]) : 0,
    amount: parseFloat(amount)
  };
}

/**
 * Splits an array into smaller chunks of a given size.
 * @param {Array} arr - The array to chunk.
 * @param {number} size - The size of each chunk.
 * @returns {Array[]} An array of chunks.
 */
function chunkArray(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
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

module.exports = { normalizePrice, normalizeDiscount, sleep, chunkArray, formatPercentage };
