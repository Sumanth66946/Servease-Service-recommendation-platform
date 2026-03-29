import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProviderHomePage({ provider, onLogout }) {
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
      const token = localStorage.getItem('providerToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/provider/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      setError('Failed to load bookings');
    }
    setLoading(false);
  };

  const statusColors = {
    confirmed: { bg: '#f0fff4', color: '#22863a' },
    pending: { bg: '#fff8e1', color: '#b45309' },
    cancelled: { bg: '#fff0f0', color: '#c0392b' },
  };

  const serviceIcons = {
    plumber: '🔧',
    electrician: '⚡',
    carpenter: '🪵',
  };

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>🔧 ServEase</div>
        <div style={styles.providerBadge}>Provider Portal</div>

        <div style={styles.menu}>
          <div style={styles.activeItem}>
            <span>📅</span>
            <span>My Bookings</span>
          </div>
        </div>

        <div style={styles.logout} onClick={onLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>

        {/* Top Bar */}
        <div style={styles.topbar}>
          <div>
            <h2 style={styles.welcome}>Welcome, {provider?.name} 👋</h2>
            <p style={styles.providerService}>
              {serviceIcons[provider?.service]} {provider?.service?.charAt(0).toUpperCase() + provider?.service?.slice(1)}
            </p>
          </div>
          <div style={styles.avatar}>
            {provider?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{bookings.length}</div>
            <div style={styles.statLabel}>Total Bookings</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div style={styles.statLabel}>Confirmed</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {bookings.filter(b => b.payment_status === 'paid').length}
            </div>
            <div style={styles.statLabel}>Paid</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div style={styles.statLabel}>Pending</div>
          </div>
        </div>

        {/* Bookings */}
        <h3 style={styles.sectionTitle}>📅 Customer Bookings</h3>

        {loading && <div style={styles.center}>Loading bookings...</div>}
        {error && <div style={styles.center}>{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyText}>No bookings yet</p>
            <p style={styles.emptySubText}>Customers will book your service soon!</p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div style={styles.list}>
            {bookings.map(booking => (
              <div key={booking.id} style={styles.card}>

                {/* Left */}
                <div style={styles.cardLeft}>
                  <div style={styles.customerAvatar}>
                    {booking.customer_name?.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Middle */}
                <div style={styles.cardMiddle}>
                  <div style={styles.customerName}>{booking.customer_name}</div>
                  <div style={styles.detail}>📧 {booking.customer_email}</div>
                  <div style={styles.detail}>📅 {booking.date} &nbsp;|&nbsp; 🕒 {booking.time_slot}</div>
                </div>

                {/* Right */}
                <div style={styles.cardRight}>
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
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f0f4f8',
  },
  sidebar: {
    width: 220,
    background: '#1a3c5e',
    minHeight: '100vh',
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    paddingLeft: 8,
  },
  providerBadge: {
    background: 'rgba(245,158,11,0.2)',
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 20,
    marginBottom: '2rem',
    marginLeft: 8,
    display: 'inline-block',
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  activeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    color: '#fff',
    fontSize: 15,
    background: 'rgba(255,255,255,0.15)',
    fontWeight: 600,
  },
  logout: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
  main: {
    flex: 1,
    padding: '2rem',
  },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  welcome: {
    fontSize: 22,
    color: '#1a3c5e',
    fontWeight: 600,
    marginBottom: 4,
  },
  providerService: {
    fontSize: 14,
    color: '#888',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: '#1a3c5e',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 18,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: '2rem',
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '1.25rem',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a3c5e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1a3c5e',
    fontWeight: 600,
    marginBottom: '1rem',
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
  cardLeft: {
    flexShrink: 0,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: '#1a3c5e',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 700,
  },
  cardMiddle: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a3c5e',
    marginBottom: 4,
  },
  detail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  cardRight: {
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