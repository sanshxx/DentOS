/**
 * Async handler to wrap async functions for Express route handlers
 * This eliminates the need for try/catch blocks in route handlers
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - The wrapped function
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;