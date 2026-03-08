const express = require('express');
const path = require('path');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// static assets
app.use(express.static(path.join(__dirname, 'public')));

// simple routes to render pages
app.get('/', (req, res) => res.render('home'));
app.get('/products', (req, res) => res.render('products'));
app.get('/cart', (req, res) => res.render('cart'));
app.get('/register', (req, res) => res.render('register'));
app.get('/profile', (req, res) => res.render('profile'));
app.get('/admin/dashboard', (req, res) => res.render('adminDashboard'));

// catch-all for unhandled routes (optional)
app.use((req, res) => {
  res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});