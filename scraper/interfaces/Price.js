const chalk = require("chalk");
const {
  normalizePrice,
  normalizePriceAndDiscount,
  pick,
} = require("../../utils");

/**
 * Calculates the original price, final price, discount percentage, and special discount.
 * It ensures missing values are inferred based on the available data.
 *
 * @param {Object} product - The product object containing price details.
 * @param {string} product.finalPrice - The final displayed price.
 * @param {string} [product.discountPrice] - The old price before discount (optional).
 * @param {string} [product.specialDiscountPrice] - The special promotional price (optional).
 * @param {string} [product.discountPercentage] - The discount as a percentage or fixed amount (optional).
 * @param {string} [product.specialDiscountPercentage] - The special discount percentage (optional).
 * @returns {Object} An object containing calculated price details.
 */
function calculatePriceAndDiscounts(product) {
  console.log(chalk.blue.bold("\n[INFO] Calculating Price and Discounts..."));
  console.log(
    "📊 Price data:",
    JSON.stringify(
      pick(product, [
        "finalPrice",
        "discountPrice",
        "discountPercentage",
        "specialDiscountPrice",
        "specialDiscountPercentage",
      ]),
    ),
  );

  // Normalize inputs
  const finalPrice = normalizePrice(product.finalPrice);
  const discountPrice = normalizePrice(product.discountPrice);
  const specialDiscountPrice = normalizePrice(product.specialDiscountPrice);
  const { percentage: discountPercentage, amount: discountAmount } =
    normalizePriceAndDiscount(product.discountPercentage);
  const {
    percentage: specialDiscountPercentage,
    amount: specialDiscountAmount,
  } = normalizePriceAndDiscount(product.specialDiscountPercentage);

  let originalPrice = discountPrice || discountAmount || finalPrice; // Start assuming discountPrice is the original
  let computedDiscountPercentage = discountPercentage;
  let computedSpecialDiscountPercentage = specialDiscountPercentage;

  // Infer missing values for discount
  if (!discountPrice && discountPercentage) {
    originalPrice = finalPrice / (1 - discountPercentage / 100);
  } else if (discountPrice && !discountPercentage) {
    computedDiscountPercentage =
      ((discountPrice - finalPrice) / discountPrice) * 100;
  }

  let specialPrice = specialDiscountPrice || specialDiscountAmount;
  // Infer missing values for special discount
  if (!specialPrice && specialDiscountPercentage) {
    computedSpecialDiscountPercentage =
      ((originalPrice - finalPrice) / originalPrice) * 100;
  } else if (specialPrice && !specialDiscountPercentage) {
    computedSpecialDiscountPercentage =
      ((originalPrice - specialPrice) / originalPrice) * 100;
  }

  return {
    originalPrice: originalPrice.toFixed(2),
    finalPrice: finalPrice.toFixed(2),
    specialDiscountPrice: specialPrice ? specialPrice.toFixed(2) : null,
    discountPercentage: computedDiscountPercentage
      ? computedDiscountPercentage.toFixed(2)
      : null,
    specialDiscountPercentage: computedSpecialDiscountPercentage
      ? computedSpecialDiscountPercentage.toFixed(2)
      : null,
  };
}

module.exports = { calculatePriceAndDiscounts };
