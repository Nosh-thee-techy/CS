/**
 * Global error handling middleware.
 * Catches all unhandled errors from routes/controllers and sends
 * a standardized JSON error response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  console.error('❌ Unhandled Error:', err);

  const url = String(req.originalUrl || req.url || '');
  if (/\/(api\/)?ussd/.test(url)) {
    res.status(200);
    res.set('Content-Type', 'text/plain; charset=utf-8');
    return res.send('END Service is busy. Try again shortly.');
  }
  if (/\/(api\/)?voice/.test(url)) {
    res.status(200);
    res.set('Content-Type', 'text/plain; charset=utf-8');
    return res.send(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Service is busy. Try USSD.</Say></Response>',
    );
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export default errorHandler;
