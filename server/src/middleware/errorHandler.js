export function notFound(_req, _res, next) { next(Object.assign(new Error('Route not found'), { status: 404, code: 'NOT_FOUND' })); }

export function errorHandler(error, req, res, _next) {
  const status = Number(error.status) || (error.name === 'ValidationError' || error.name === 'ZodError' ? 400 : 500);
  const requestId = req.requestId;
  console.error(JSON.stringify({ level: 'error', requestId, status, code: error.code || 'INTERNAL_ERROR', message: error.message }));
  res.status(status).json({ success: false, error: { code: error.code || 'INTERNAL_ERROR', message: status >= 500 ? 'The request could not be completed. Please try again.' : error.message, requestId } });
}
