// Helper function to generate a random 4-digit verification code
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit number
};

module.exports = generateVerificationCode;
