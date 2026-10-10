// Indian Rupee currency and number formatting utility

export const formatINR = (amount) => {
  const num = Number(amount || 0);
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  });
};

export const formatPrice = formatINR;

export default formatINR;
