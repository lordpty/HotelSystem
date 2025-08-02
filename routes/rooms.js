// routes/rooms.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const {
  ensureAuthenticated,
  ensureAdmin,
  ensureReceptionistOrAdmin,
} = require('../middlewares/auth');

// List all rooms
router.get('/rooms', async (req, res) => {
  try {
    const [rooms] = await pool.query('SELECT * FROM rooms ORDER BY room_number ASC');
    // res.render('rooms', { title: 'Rooms', rooms });
    res.render('rooms', {title: null, rooms});
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).send('Error fetching rooms');
  }
});

// Show form to create a new room
router.get('/rooms/new', ensureAdmin,(req, res) => {
  res.render('roomForm', { title: 'Add New Room', room: {}, errors: null });
});

// Create a new room
router.post('/rooms', async(req, res) => {
  const { room_number, room_type } = req.body;

  // Basic validation
  let errors = [];
  if (!room_number || room_number.trim() === '') errors.push('Room number is required.');
  if (!['single', 'double', 'suite'].includes(room_type)) errors.push('Invalid room type.');

  if (errors.length > 0) {
    return res.render('roomForm', { title: 'Add New Room', room: req.body, errors });
  }

  try {
    await pool.query(
      'INSERT INTO rooms (room_number, room_type, is_booked) VALUES (?, ?, FALSE)',
      [room_number.trim(), room_type]
    );
    res.redirect('/rooms');
  } catch (error) {
    console.error('Error creating room:', error);
    // Handle duplicate room_number error gracefully
    if (error.code === 'ER_DUP_ENTRY') {
      errors.push('Room number already exists.');
      return res.render('roomForm', { title: 'Add New Room', room: req.body, errors });
    }
    res.status(500).send('Error creating room');
  }
});

// Show a single room's details
router.get('/rooms/:id', ensureAdmin,async (req, res) => {
  const roomId = req.params.id;
  try {
    const [rooms] = await pool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (rooms.length === 0) {
      return res.status(404).send('Room not found');
    }
    res.render('roomDetails', { title: `Room ${rooms[0].room_number}`, room: rooms[0] });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).send('Error fetching room');
  }
});

// Show edit form for a room
router.get('/rooms/:id/edit', ensureAdmin, async (req, res) => {
  const roomId = req.params.id;
  try {
    const [rooms] = await pool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (rooms.length === 0) {
      return res.status(404).send('Room not found');
    }
    res.render('roomForm', { title: `Edit Room ${rooms[0].room_number}`, room: rooms[0], errors: null });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).send('Error fetching room');
  }
});

// Update the room
router.post('/rooms/:id/edit', ensureAdmin, async (req, res) => {
  const roomId = req.params.id;
  const { room_number, room_type, is_booked } = req.body;

  // Basic validation
  let errors = [];
  if (!room_number || room_number.trim() === '') errors.push('Room number is required.');
  if (!['single', 'double', 'suite'].includes(room_type)) errors.push('Invalid room type.');
  const booked = (is_booked === 'true' || is_booked === 'on') ? 1 : 0;

  if (errors.length > 0) {
    return res.render('roomForm', {
      title: `Edit Room ${room_number}`,
      room: { id: roomId, room_number, room_type, is_booked: booked },
      errors,
    });
  }

  try {
    // Update room
    const [result] = await pool.query(
      'UPDATE rooms SET room_number = ?, room_type = ?, is_booked = ? WHERE id = ?',
      [room_number.trim(), room_type, booked, roomId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).send('Room not found');
    }

    res.redirect('/rooms');
  } catch (error) {
    console.error('Error updating room:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      errors.push('Room number already exists.');
      return res.render('roomForm', {
        title: `Edit Room ${room_number}`,
        room: { id: roomId, room_number, room_type, is_booked: booked },
        errors,
      });
    }
    res.status(500).send('Error updating room');
  }
});

// Delete a room
router.post('/rooms/:id/delete', ensureAdmin, async (req, res) => {
  const roomId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM rooms WHERE id = ?', [roomId]);
    if (result.affectedRows === 0) {
      return res.status(404).send('Room not found');
    }
    res.redirect('/rooms');
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).send('Error deleting room');
  }
});

module.exports = router;
