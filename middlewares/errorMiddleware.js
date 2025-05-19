// middlewares/errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
  console.error('[ERROR]', err.stack);

  const statusCode = err.status || 500;
  const message = err.message || 'Terjadi kesalahan pada server';

  res.status(statusCode).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;
