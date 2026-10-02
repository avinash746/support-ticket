/** Error that carries an HTTP status and a machine-readable code. */
class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details, code = 'BAD_REQUEST') {
    return new ApiError(400, code, message, details);
  }

  static validation(details) {
    return new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', details);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }
}

module.exports = ApiError;
