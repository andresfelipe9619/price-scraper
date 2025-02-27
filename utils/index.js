function normalizePrice(price, defaultPrice = "$0") {
  try {
    return parseFloat((price || defaultPrice).trim().replace(/[$,\s]/g, '').replace(/\./g, '')) || 0;
  } catch (error) {
    console.error('Error normalizing price:', error);
    return 0;
  }
}

function normalizeDiscount(discount) {
  if (!discount || discount.trim() === '') return {percentage: 0, amount: 0};

  const cleaned = discount.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

  const percentageMatch = cleaned.match(/(\d+)%/);
  const amountMatch = cleaned.match(/\$\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d*)?)/);

  let amount = amountMatch ? amountMatch[1].replace(/[.,]/g, '') : 0;

  return {
    percentage: percentageMatch ? parseInt(percentageMatch[1]) : 0,
    amount: parseFloat(amount)
  };
}

function chunkArray(arr, size) {
  return Array.from({length: Math.ceil(arr.length / size)}, (_, i) =>
      arr.slice(i * size, i * size + size)
  );
}

// console.log(normalizePrice("$ 11.600"));
// console.log(normalizePrice("$ 8.190.000"));
// console.log(normalizeDiscount("-\n\n20\n\n%"));
// console.log(normalizeDiscount("-\n\n27\n\n%\n\n$ 15.500"));

module.exports = {normalizePrice, normalizeDiscount, chunkArray};
