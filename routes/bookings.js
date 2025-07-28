const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create booking
router.post('/booking', async (req, res) => {
  const { guestName, roomType, checkIn, checkOut, paymentStatus } = req.body;
  try {
    const { bookingId, roomNumber } = await bookingController.createBooking(
      guestName,
      roomType,
      checkIn,
      checkOut,
      paymentStatus
    );
    res.render('booking', {
      title: 'New Booking',
      booking: { guestName, roomType, checkIn, checkOut, paymentStatus, roomNumber, bookingId },
      error: null,
    });
  } catch (error) {
    res.render('booking', { title: 'New Booking', error: error.message, booking: null });
  }
});

// List all bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await bookingController.getAllBookings();
    res.render('allBookings', { title: 'All Bookings', bookings });
  } catch (error) {
    res.status(500).send('Error fetching bookings');
  }
});

// Get single booking (e.g., for editing)
router.get('/booking/:id', async (req, res) => {
  try {
    const booking = await bookingController.getBookingById(req.params.id);
    if (!booking) return res.status(404).send('Booking not found');
    res.render('bookingEdit', { title: 'Edit Booking', booking });
  } catch (error) {
    res.status(500).send('Error fetching booking');
  }
});

// Update booking
router.post('/booking/:id/edit', async (req, res) => {
  try {
    const updated = await bookingController.updateBooking(req.params.id, req.body);
    if (!updated) return res.status(404).send('Booking not found');
    res.redirect('/bookings');
  } catch (error) {
    res.status(500).send('Error updating booking');
  }
});

// Delete booking
router.post('/booking/:id/delete', async (req, res) => {
  try {
    const deleted = await bookingController.deleteBooking(req.params.id);
    if (!deleted) return res.status(404).send('Booking not found');
    res.redirect('/bookings');
  } catch (error) {
    res.status(500).send('Error deleting booking');
  }
});

module.exports = router;
