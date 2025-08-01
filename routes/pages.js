const express = require('express');
const router = express.Router();
const { createBooking } = require('../controllers/bookingController');
const pool = require('../config/db');

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
  res.render('booking', { title: 'New Booking', booking: null});
});

router.post('/booking', async (req, res) => {
    const { guestName, roomType, checkIn, checkOut, paymentStatus } = req.body;
    console.log(guestName, roomType, checkIn, checkOut, paymentStatus)
    try {
      const { bookingId, roomNumber } = await createBooking(
        guestName,
        roomType,
        checkIn,
        checkOut,
        paymentStatus
      );
      console.log("Booking ID:", bookingId)
  
      // Send booking data including assigned room number to the template
      res.render('booking', {
        title: 'New Booking',
        booking: {
          guestName,
          roomType,
          checkIn,
          checkOut,
          paymentStatus,
          roomNumber,
          bookingId
        }
      });
    } catch (error) {
      console.error(error)
      // Handle errors, e.g. no rooms available
      res.render('booking', {
        title: 'New Booking',
        error: error.message,
        booking: null
      });
    }
  });
  

// Render admin panel page
router.get('/admin', (req, res) => {
  res.render('admin', { title: 'Admin Panel' });
});

module.exports = router;
