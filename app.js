const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // if you're using layouts
const pool = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

// Use express-ejs-layouts middleware if used previously
app.use(expressLayouts);
app.set('layout', 'layout'); // default layout

// Set EJS view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Import your pages router
const pagesRouter = require('./routes/pages');
const bookingRouter = require('./routes/bookings');
const roomsRouter = require('./routes/rooms');

// Use the pagesRouter for related routes
app.use('/', pagesRouter);
app.use('/', bookingRouter);
app.use('/', roomsRouter);

// Example home route
async function getDashboardStats() {
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM rooms) AS total_rooms,
      (SELECT COUNT(*) FROM bookings) AS total_reservations,
      (SELECT COUNT(*) FROM rooms WHERE is_booked = FALSE) AS available_rooms,
      (SELECT COUNT(*) FROM rooms WHERE is_booked = TRUE) AS booked_rooms,
      (SELECT COUNT(*) FROM rooms WHERE room_type = 'suite') AS vip_rooms;
  `);
  return rows[0];
}
app.get('/', async (req, res) => {
  const stats = await getDashboardStats();
  console.log(stats)
  res.render('admin', {
    title: 'Dashboard',
    stats
  });
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
