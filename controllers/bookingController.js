const pool = require('../config/db');

/**
 * Create a new booking and mark a room as booked
 * @param {string} guestName
 * @param {string} roomType - 'single', 'double', 'suite'
 * @param {string} checkIn - date string YYYY-MM-DD
 * @param {string} checkOut - date string YYYY-MM-DD
 * @param {string} paymentStatus - 'pending' or 'paid'
 * @returns {object} booking info including room number and booking id
 */
async function createBooking(guestName, roomType, checkIn, checkOut, paymentStatus) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Find an available room for the requested type that is not booked
    const [availableRooms] = await conn.query(
      'SELECT * FROM rooms WHERE room_type = ? AND is_booked = FALSE LIMIT 1',
      [roomType]
    );

    if (availableRooms.length === 0) {
      throw new Error('No available rooms of the selected type');
    }

    const room = availableRooms[0];

    // Insert booking record
    const [bookingResult] = await conn.query(
      `INSERT INTO bookings 
      (guest_name, room_id, check_in, check_out, payment_status) 
      VALUES (?, ?, ?, ?, ?)`,
      [guestName, room.id, checkIn, checkOut, paymentStatus]
    );

    // Update room as booked
    await conn.query(
      'UPDATE rooms SET is_booked = TRUE WHERE id = ?',
      [room.id]
    );

    await conn.commit();

    ;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Get all bookings with room info
 * @returns {Array} list of bookings
 */
async function getAllBookings() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT b.id, b.guest_name, b.check_in, b.check_out, b.payment_status, b.created_at,
              r.room_number, r.room_type
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       ORDER BY b.created_at DESC`
    );
    return rows;
  } finally {
    conn.release();
  }
}

/**
 * Get a single booking by ID with room info
 * @param {number} id
 * @returns {object|null} booking or null if not found
 */
async function getBookingById(id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT b.id, b.guest_name, b.check_in, b.check_out, b.payment_status,
              r.room_number, r.room_type
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

/**
 * Update a booking. Only allows update of guestName, checkIn, checkOut, paymentStatus.
 * Note: For simplicity, it does NOT change room assignment in this method.
 * @param {number} id - booking id
 * @param {object} data - fields to update (guestName, checkIn, checkOut, paymentStatus)
 * @returns {boolean} true if updated, false if no booking found
 */
async function updateBooking(id, data) {
  const { guestName, checkIn, checkOut, paymentStatus } = data;
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `UPDATE bookings
       SET guest_name = ?, check_in = ?, check_out = ?, payment_status = ?
       WHERE id = ?`,
      [guestName, checkIn, checkOut, paymentStatus, id]
    );
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
}

/**
 * Delete a booking by ID and mark its room as not booked
 * @param {number} id - booking id to delete
 * @returns {boolean} true if deleted, false if no booking found
 */
async function deleteBooking(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Find the booking with room id
    const [bookings] = await conn.query(
      'SELECT room_id FROM bookings WHERE id = ?',
      [id]
    );

    if (bookings.length === 0) {
      await conn.rollback();
      return false;
    }

    const roomId = bookings[0].room_id;

    // Delete the booking
    const [deleteResult] = await conn.query(
      'DELETE FROM bookings WHERE id = ?',
      [id]
    );

    // Update room as not booked
    await conn.query(
      'UPDATE rooms SET is_booked = FALSE WHERE id = ?',
      [roomId]
    );

    await conn.commit();

    return deleteResult.affectedRows > 0;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
