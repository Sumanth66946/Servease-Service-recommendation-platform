const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./servease.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database');
});

db.serialize(() => {

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Providers table
  db.run(`CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    service TEXT NOT NULL,
    experience TEXT,
    price TEXT,
    rating REAL DEFAULT 5.0,
    location TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Bookings table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    provider_id INTEGER,
    service TEXT,
    date TEXT,
    time_slot TEXT,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'unpaid',
    total_amount TEXT,
    stripe_payment_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(provider_id) REFERENCES providers(id)
  )`);

  // Payments table
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER,
    user_id INTEGER,
    stripe_payment_intent_id TEXT,
    amount TEXT,
    currency TEXT DEFAULT 'inr',
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(booking_id) REFERENCES bookings(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

});

module.exports = db;