const ApiError = require('../utils/ApiError');

/**
 * Every error leaves the API in the same shape:
 * { "error": { "code": "...", "message": "...", "details": [{ "field", "message" }] } }
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong on our side. Please try again.';
  let details;

  if (err instanceof ApiError) {
    ({ status, code, message, details } = err);
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Request body is not valid JSON';
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    status = 400;
    code = 'INVALID_ID';
    message = 'Invalid identifier';
  }

  if (status >= 500) console.error(err);

  const body = { error: { code, message } };
  if (details && details.length) body.error.details = details;
  res.status(status).json(body);
}

function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { errorHandler, notFoundHandler };
