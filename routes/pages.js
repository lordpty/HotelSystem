const express = require('express');
const router = express.Router();

// Render login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Render signup page
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});

// Render receptionist booking page
router.get('/booking', (req, res) => {
  res.render('booking', { title: 'New Booking' });
});

// Render admin panel page
router.get('/admin', (req, res) => {
  res.render('admin', { title: 'Admin Panel' });
});

module.exports = router;
