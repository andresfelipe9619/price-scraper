const chalk = require('chalk');
const {normalizePrice, normalizeDiscount} = require('../../utils');

/**
 * Calculates the final price, real price, and applicable discount percentages.
 *
 * Mathematical breakdown:
 * - **Real Price (original price before discount):**
 *   - If discount is an amount: `realPrice = finalPrice + amount`
 *   - If discount is a percentage: `realPrice = finalPrice / (1 - percentage / 100)`
 *
 * - **Discount Percentage:**
 *   - `discountPercentage = ((realPrice - finalPrice) / realPrice) * 100`
 *
 * - **Special Discount Percentage:**
 *   - `specialDiscountPercentage = ((realPrice - specialPrice) / realPrice) * 100`
 *
 * @param {number} price - The base price of the item.
 * @param {number} special - The special promotional price (optional).
 * @param {number} discount - The discount as a percentage or fixed amount.
 * @returns {Object} An object containing the final, special, and real prices, along with discount percentages.
 */
function calculatePriceAndDiscounts(price, special, discount) {
  console.log(chalk.blue.bold('\n[INFO] Calculating Price and Discounts...'));

  // Normalize inputs
  const finalPrice = normalizePrice(price);
  const specialPrice = normalizePrice(special);
  const {percentage, amount} = normalizeDiscount(discount);

  // Calculate the real (original) price
  let realPrice = amount || (percentage ? finalPrice / (1 - percentage / 100) : finalPrice);
  realPrice = realPrice && realPrice > 0 ? realPrice : finalPrice; // Handle edge cases

  // Calculate discount percentage
  const discountPercentage = (!special && percentage)
      ? percentage
      : ((realPrice - finalPrice) / realPrice * 100).toFixed(2);

  // Calculate special discount percentage
  const specialDiscountPercentage = special
      ? ((realPrice - specialPrice) / realPrice * 100).toFixed(2)
      : 0;

  return {
    finalPrice,
    specialPrice,
    realPrice,
    discountPercentage,
    specialDiscountPercentage
  };
}

module.exports = {calculatePriceAndDiscounts};
