const ApiError = require('../utils/ApiError');

/**
 * validate(schema, 'body' | 'query')
 * Parsed (trimmed / coerced / defaulted) values land on req.validated[source].
 */
const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source] ?? {});
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message,
    }));
    return next(ApiError.validation(details));
  }
  req.validated = { ...(req.validated || {}), [source]: result.data };
  return next();
};

const validateObjectId = (param = 'id') => (req, _res, next) => {
  if (!/^[a-f\d]{24}$/i.test(req.params[param])) {
    return next(ApiError.badRequest('Invalid ticket id', [{ field: param, message: 'Must be a valid id' }], 'INVALID_ID'));
  }
  return next();
};

module.exports = { validate, validateObjectId };
