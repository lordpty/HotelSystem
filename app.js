const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // <-- import

const app = express();
const PORT = process.env.PORT || 3000;

// Use express-ejs-layouts middleware
app.use(expressLayouts);
app.set('layout', 'layout'); // default layout file

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
