require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('./database');

const app = express();
const SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// ─── AUTH MIDDLEWARE ───────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── USER REGISTER ─────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { name, email, password, location } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const hashed = await bcrypt.hash(password, 10);
  db.run(
    `INSERT INTO users (name, email, password, location) VALUES (?, ?, ?, ?)`,
    [name, email, hashed, location || ''],
    function (err) {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      const token = jwt.sign({ id: this.lastID, name, email }, SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: this.lastID, name, email } });
    }
  );
});

// ─── USER LOGIN ────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
});

// ─── PROVIDER REGISTER ─────────────────────────────────────
app.post('/api/provider/register', async (req, res) => {
  const { name, email, password, service, experience, price, location, phone } = req.body;
  if (!name || !email || !password || !service) return res.status(400).json({ error: 'All fields required' });
  const hashed = await bcrypt.hash(password, 10);
  db.run(
    `INSERT INTO providers (name, email, password, service, experience, price, location, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, hashed, service, experience, price, location || '', phone || ''],
    function (err) {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      res.json({ message: 'Provider registered successfully', id: this.lastID });
    }
  );
});

// ─── PROVIDER LOGIN ────────────────────────────────────────
app.post('/api/provider/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM providers WHERE email = ?`, [email], async (err, provider) => {
    if (err || !provider) return res.status(400).json({ error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, provider.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: provider.id, name: provider.name, email: provider.email, role: 'provider' }, SECRET, { expiresIn: '7d' });
    res.json({ token, provider: { id: provider.id, name: provider.name, email: provider.email, service: provider.service } });
  });
});

// ─── GET PROVIDERS BY SERVICE ───────────────────────────────
app.get('/api/providers/:service', (req, res) => {
  const { service } = req.params;
  db.all(
    `SELECT id, name, service, experience, price, rating, location, phone FROM providers WHERE service = ?`,
    [service],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json(rows);
    }
  );
});

// ─── CREATE BOOKING ────────────────────────────────────────
app.post('/api/bookings', auth, (req, res) => {
  const { provider_id, service, date, time_slot, total_amount } = req.body;
  db.run(
    `INSERT INTO bookings (user_id, provider_id, service, date, time_slot, total_amount) VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, provider_id, service, date, time_slot, total_amount],
    function (err) {
      if (err) return res.status(500).json({ error: 'Booking failed' });
      res.json({ booking_id: this.lastID, message: 'Booking created' });
    }
  );
});

// ─── GET MY BOOKINGS ───────────────────────────────────────
app.get('/api/bookings', auth, (req, res) => {
  db.all(
    `SELECT b.*, p.name as provider_name, p.phone as provider_phone 
     FROM bookings b 
     JOIN providers p ON b.provider_id = p.id 
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json(rows);
    }
  );
});

// ─── STRIPE PAYMENT ────────────────────────────────────────
app.post('/api/payment/create-intent', auth, async (req, res) => {
  const { amount, booking_id } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
      metadata: { booking_id, user_id: req.user.id },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CONFIRM PAYMENT ───────────────────────────────────────
app.post('/api/payment/confirm', auth, (req, res) => {
  const { booking_id, stripe_payment_intent_id, amount } = req.body;

  db.run(
    `UPDATE bookings SET payment_status = 'paid', status = 'confirmed', stripe_payment_id = ? WHERE id = ?`,
    [stripe_payment_intent_id, booking_id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Payment confirm failed' });

      db.run(
        `INSERT INTO payments (booking_id, user_id, stripe_payment_intent_id, amount, status) VALUES (?, ?, ?, ?, 'success')`,
        [booking_id, req.user.id, stripe_payment_intent_id, amount],
        function (err) {
          if (err) return res.status(500).json({ error: 'Payment record failed' });
          res.json({ message: 'Payment confirmed and booking updated' });
        }
      );
    }
  );
});
// ─── GET PROVIDER BOOKINGS ─────────────────────────────────
app.get('/api/provider/bookings', auth, (req, res) => {
  db.all(
    `SELECT b.*, u.name as customer_name, u.email as customer_email
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     WHERE b.provider_id = ?
     ORDER BY b.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json(rows);
    }
  );
});

// ─── START SERVER ──────────────────────────────────────────
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});