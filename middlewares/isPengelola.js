// middlewares/isPengelola.js
module.exports = (req, res, next) => {
  if (req.user?.role === 'pengelola') {
    return next();
  }

  return res.status(403).json({ message: 'Akses ditolak: hanya pengelola yang diizinkan' });
};
