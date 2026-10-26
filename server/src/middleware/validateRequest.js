import { AppError } from '../utils/errors.js';

export function validateRequest(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(new AppError(400, result.error.issues.map((issue) => `${issue.path.join('.') || 'request'}: ${issue.message}`).join('; '), 'INVALID_REQUEST'));
    req.validatedBody = result.data;
    next();
  };
}
