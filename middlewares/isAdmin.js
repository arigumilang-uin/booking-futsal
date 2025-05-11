// middlewares/isAdmin.js
module.exports = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Hanya admin yang bisa mengakses ini' });
};
