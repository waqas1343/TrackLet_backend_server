/**
 * Utility helper functions for the Tracklet backend
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validatePassword(password) {
  // At least 6 characters
  return password.length >= 6;
}

/**
 * Format error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted error response
 */
function formatErrorResponse(message, statusCode = 400) {
  return {
    success: false,
    error: message,
    statusCode
  };
}

/**
 * Format success response
 * @param {any} data - Data to return
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted success response
 */
function formatSuccessResponse(data, message = 'Success', statusCode = 200) {
  return {
    success: true,
    message,
    data,
    statusCode
  };
}

/**
 * Generate random string
 * @param {number} length - Length of string to generate
 * @returns {string} - Random string
 */
function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  validateEmail,
  validatePassword,
  formatErrorResponse,
  formatSuccessResponse,
  generateRandomString
};