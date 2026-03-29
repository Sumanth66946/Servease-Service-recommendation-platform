import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      setError('Failed to load bookings');
    }
    setLoading(false);
  };

  const serviceIcons = {
    plumber: '🔧',
    electrician: '⚡',
    carpenter: '🪵',
  };

  const statusColors = {
    confirmed: { bg: '#f0fff4', color: '#22863a' },
    pending: { bg: '#fff8e1', color: '#b45309' },
    cancelled: { bg: '#fff0f0', color: '#c0392b' },
  };

  if (loading) return <div style={styles.center}>Loading bookings...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div>
      <h2 style={styles.title}>📅 My Bookings</h2>
      <p style={styles.subtitle}>
        {bookings.length === 0
          ? 'No bookings yet'
          : `${bookings.length} booking(s) found`}
      </p>

      {bookings.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📭</div>
          <p style={styles.emptyText}>No bookings yet</p>
          <p style={styles.emptySubText}>Book a service to see it here!</p>
        </div>
      ) : (
        <div style={styles.list}>
          {bookings.map(booking => (
            <div key={booking.id} style={styles.card}>

              {/* Left */}
              <div style={styles.left}>
                <div style={styles.serviceIcon}>
                  {serviceIcons[booking.service] || '🔧'}
                </div>
              </div>

              {/* Middle */}
              <div style={styles.middle}>
                <div style={styles.providerName}>{booking.provider_name}</div>
                <div style={styles.service}>
                  {booking.service?.charAt(0).toUpperCase() + booking.service?.slice(1)}
                </div>
                <div style={styles.details}>
                  📅 {booking.date} &nbsp;|&nbsp; 🕒 {booking.time_slot}
                </div>
                {booking.provider_phone && (
                  <div style={styles.details}>📞 {booking.provider_phone}</div>
                )}
              </div>

              {/* Right */}
              <div style={styles.right}>
                <div style={styles.amount}>{booking.total_amount}</div>
                <div style={{
                  ...styles.status,
                  background: statusColors[booking.status]?.bg || '#f0f4f8',
                  color: statusColors[booking.status]?.color || '#555',
                }}>
                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                </div>
                <div style={{
                  ...styles.paymentStatus,
                  color: booking.payment_status === 'paid' ? '#22863a' : '#b45309',
                }}>
                  {booking.payment_status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  title: {
    fontSize: 22,
    color: '#1a3c5e',
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: '1.5rem',
  },
  center: {
    textAlign: 'center',
    padding: '3rem',
    color: '#888',
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    background: '#fff',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#444',
    fontWeight: 600,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '1.25rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  left: {
    flexShrink: 0,
  },
  serviceIcon: {
    fontSize: 36,
    width: 56,
    height: 56,
    background: '#f0f4f8',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a3c5e',
    marginBottom: 4,
  },
  service: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  details: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  right: {
    textAlign: 'right',
    flexShrink: 0,
  },
  amount: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1a3c5e',
    marginBottom: 6,
  },
  status: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: 600,
  },
};