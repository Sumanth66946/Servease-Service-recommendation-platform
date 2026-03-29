import React from 'react';

const menuItems = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'plumber', icon: '🔧', label: 'Plumber' },
  { id: 'electrician', icon: '⚡', label: 'Electrician' },
  { id: 'carpenter', icon: '🪵', label: 'Carpenter' },
  { id: 'mybookings', icon: '📅', label: 'My Bookings' },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  return (
    <div style={styles.sidebar}>

      {/* Logo */}
      <div style={styles.logo}>🔧 ServEase</div>

      {/* Menu Items */}
      <div style={styles.menu}>
        {menuItems.map(item => (
          <div
            key={item.id}
            style={activeTab === item.id ? styles.activeItem : styles.item}
            onClick={() => setActiveTab(item.id)}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div style={styles.logout} onClick={onLogout}>
        <span style={styles.icon}>🚪</span>
        <span style={styles.label}>Logout</span>
      </div>

    </div>
  );
}

const styles = {
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
    marginBottom: '2rem',
    paddingLeft: 8,
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
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
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 15,
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
    marginTop: 'auto',
  },
};