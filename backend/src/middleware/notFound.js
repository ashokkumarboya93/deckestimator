// =============================================
// DECK PRO — 404 Not Found Handler
// =============================================
// Catches requests to undefined routes.

/**
 * Respond with 404 for any route not matched by the application.
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found.`,
    },
  });
}

module.exports = { notFound };
