function normalizePrice(price, defaultPrice = '$0') {
  try {
    const cleanedPrice = price ? price.trim().replace(/([.$,])/gi, '') : defaultPrice.trim().replace(/([.$,])/gi, '');
    return parseFloat(cleanedPrice) || 0;
  } catch (error) {
    console.error('Error normalizing price:', error);
    return 0;
  }
}

function normalizeDiscount(discount) {
  if (!discount || discount.trim() === '') return { percentage: 0, amount: 0 };

  // Remove unnecessary newlines and spaces
  const cleaned = discount.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

  // Match percentage and amount patterns
  const percentageMatch = cleaned.match(/(\d+)%/);
  const amountMatch = cleaned.match(/\$\s?(\d+[.,]?\d*)/);

  // Extract values
  const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 0;
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;

  return { percentage, amount };
}

// Split array into chunks of size 'size'
function chunkArray(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
  );
}

module.exports = { normalizePrice, normalizeDiscount, chunkArray };
