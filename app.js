const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // if you're using layouts

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

// Import your pages router
const pagesRouter = require('./routes/pages');
const bookingRouter = require('./routes/bookings');

// Use the pagesRouter for related routes
app.use('/', pagesRouter);
app.use('/', bookingRouter);

// Example home route
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
