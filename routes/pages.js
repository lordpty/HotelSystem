const express = require('express');
const router = express.Router();
const { createBooking } = require('../controllers/bookingController');
const pool = require('../config/db');
const {
  ensureAuthenticated,
  ensureAdmin,
  ensureReceptionistOrAdmin,
} = require('../middlewares/auth');

// Render login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Render signup page
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up', errors:[] });
});

// Render receptionist booking page
router.get('/booking', (req, res) => {
  res.render('booking', { title: 'New Booking', booking: null, error:null});
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
        },
        error: null
      });
    } catch (error) {
      res.render('booking', { title: 'New Booking', error: error.message, booking: null });
    }
  });
  
module.exports = router;
