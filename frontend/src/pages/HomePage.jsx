import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ProvidersPage from './ProvidersPage';
import BookingPage from './BookingPage';
import MyBookings from './MyBookings';

export default function HomePage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setActiveTab('booking');
  };

  const handleBookingDone = () => {
    setSelectedProvider(null);
    setActiveTab('mybookings');
  };

  const handleBack = () => {
    setSelectedProvider(null);
    setActiveTab('home');
  };

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      {/* Main Content */}
      <div style={styles.main}>

        {/* Top Bar */}
        <div style={styles.topbar}>
          <h2 style={styles.welcome}>Welcome, {user?.name} 👋</h2>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
        </div>

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div>
            <div style={styles.banner}>
              <h2 style={styles.bannerTitle}>What service do you need today?</h2>
              <p style={styles.bannerSub}>Choose a service from the sidebar to find nearby professionals</p>
            </div>

            <h3 style={styles.sectionTitle}>Our Services</h3>
            <div style={styles.adGrid}>
              {ads.map((ad, i) => (
                <div key={i} style={{ ...styles.adCard, background: ad.bg }}>
                  <div style={styles.adIcon}>{ad.icon}</div>
                  <div style={styles.adTitle}>{ad.title}</div>
                  <div style={styles.adDesc}>{ad.desc}</div>
                  <button
                    style={styles.adBtn}
                    onClick={() => setActiveTab(ad.tab)}
                  >
                    Find Providers
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Tabs */}
        {(activeTab === 'plumber' || activeTab === 'electrician' || activeTab === 'carpenter') && (
          <ProvidersPage service={activeTab} onSelectProvider={handleProviderSelect} />
        )}

        {/* Booking Tab */}
        {activeTab === 'booking' && selectedProvider && (
          <BookingPage
            provider={selectedProvider}
            service={activeTab}
            user={user}
            onBack={handleBack}
            onBookingDone={handleBookingDone}
          />
        )}

        {/* My Bookings Tab */}
        {activeTab === 'mybookings' && (
          <MyBookings user={user} />
        )}

      </div>
    </div>
  );
}

const ads = [
  { icon: '🔧', title: 'Plumbing Services', desc: 'Fix leaks, pipes & more', bg: '#e8f4fd', tab: 'plumber' },
  { icon: '⚡', title: 'Electrical Services', desc: 'Wiring, repairs & installation', bg: '#fff8e1', tab: 'electrician' },
  { icon: '🪵', title: 'Carpentry Services', desc: 'Furniture, doors & custom work', bg: '#f0fff4', tab: 'carpenter' },
];

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f0f4f8',
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
  banner: {
    background: '#1a3c5e',
    borderRadius: 16,
    padding: '2rem',
    marginBottom: '2rem',
    color: '#fff',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  bannerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1a3c5e',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  adGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  adCard: {
    borderRadius: 12,
    padding: '1.5rem',
    textAlign: 'center',
  },
  adIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a3c5e',
    marginBottom: 6,
  },
  adDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 14,
  },
  adBtn: {
    padding: '8px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#1a3c5e',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};