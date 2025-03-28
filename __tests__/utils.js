// Import Jest (if needed in the environment)
const { test, expect } = require("@jest/globals");
const { normalizePrice, normalizePriceAndDiscount } = require("../utils");

// Test normalizePrice function
test("normalizePrice should convert string price to number", () => {
  expect(normalizePrice("$ 11.600")).toBe(11600);
  expect(normalizePrice("$ 8.190.000")).toBe(8190000);
});

// Test normalizePriceAndDiscount function
test("normalizePriceAndDiscount should convert string discount to number", () => {
  expect(normalizePriceAndDiscount("-\n\n20\n\n%")).toEqual({
    percentage: 20,
    amount: 0,
  });
  expect(normalizePriceAndDiscount("-\n\n27\n\n%\n\n$ 15.500")).toEqual({
    percentage: 27,
    amount: 15500,
  });
});
