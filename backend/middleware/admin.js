// backend/middleware/admin.js
module.exports = (req, res, next) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  };
  