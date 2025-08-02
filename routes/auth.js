const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const pool = require('../config/db'); // Your MySQL connection pool

// Show signup form
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up', errors: [] });
});

// Handle signup POST
router.post('/signup', async (req, res) => {
  const { username, password, confirmPassword, role } = req.body;
  let errors = [];

  // Basic validation
  if (!username || !password || !confirmPassword) {
    errors.push('Please fill all fields');
  }
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }


  if (errors.length > 0) {
    return res.render('signup', { title: 'Sign Up', errors, username, role });
  }

  try {
    // Check if username already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      errors.push('Username already registered');
      return res.render('signup', { title: 'Sign Up', errors, username, role });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into DB
    await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, "receptionist")',
      [username, hashedPassword]
    );

    // Redirect to login after successful signup
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    errors.push('Server error. Please try again later.');
    res.render('signup', { title: 'Sign Up', errors, username, role });
  }
});

// Show login form
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login',
    error: req.flash('error')  // passport sends failure message here
  });
});

// Handle login POST with Passport local strategy
router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true // enable flash messages for errors
  }),
  (req, res) => {
    // On successful login, redirect based on role
    if (req.user.role === 'admin') return res.redirect('/');
    if (req.user.role === 'receptionist') return res.redirect('/booking');
    res.redirect('/');
  }
);

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

module.exports = router;
