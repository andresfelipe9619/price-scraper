const chalk = require('chalk');
const {normalizePrice, normalizeDiscount} = require('../../utils')

/**
 * Calculates the final price, real price, and applicable discount percentages.
 *
 * @param {number} price - The base price of the item.
 * @param {number} special - The special promotional price (optional).
 * @param {number} discount - The discount as a percentage.
 * @returns {Object} An object containing the final, special, and real prices, along with discount percentages.
 */
function calculatePriceAndDiscounts(price, special, discount) {
  const finalPrice = normalizePrice(price);
  const specialPrice = normalizePrice(special);
  const {percentage, amount} = normalizeDiscount(discount);

  console.log(chalk.blue.bold('\n[INFO] Calculating Price and Discounts...'));

  // Calculate real price from discount amount or percentage
  let realPrice = amount || (percentage ? finalPrice / (1 - percentage / 100) : finalPrice);

  // Handle edge cases where realPrice might be invalid
  realPrice = realPrice && realPrice > 0 ? realPrice : finalPrice;

  // Calculate discount percentage and handle special price scenario
  const discountPercentage = !special && percentage
      ? percentage
      : ((realPrice - finalPrice) / realPrice * 100).toFixed(2);

  const specialDiscountPercentage = special
      ? ((realPrice - specialPrice) / realPrice * 100).toFixed(2)
      : 0;

  return {finalPrice, specialPrice, realPrice, discountPercentage, specialDiscountPercentage};
}

module.exports = {calculatePriceAndDiscounts};