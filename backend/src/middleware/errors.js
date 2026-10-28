function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'ROUTE_NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` }
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Request body contains invalid JSON' }
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    const field = String(err.message).includes('email') ? 'email' : 'phone';
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_AGENT_FIELD', message: `An agent with this ${field} already exists` }
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected server error occurred' }
  });
}

module.exports = { notFound, errorHandler };
