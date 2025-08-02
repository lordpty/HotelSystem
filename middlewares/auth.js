// middlewares/auth.js

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }
  
  // Middleware to allow only admin users
  function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    res.status(403).send('Access denied.');
  }
  
  // Middleware to allow admin and receptionist
  function ensureReceptionistOrAdmin(req, res, next) {
    if (
      req.isAuthenticated() &&
      (req.user.role === 'admin' || req.user.role === 'receptionist')
    ) {
      return next();
    }
    res.status(403).send('Access denied.');
  }
  
  module.exports = {
    ensureAuthenticated,
    ensureAdmin,
    ensureReceptionistOrAdmin,
  };
  