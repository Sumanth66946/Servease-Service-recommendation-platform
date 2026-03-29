import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProvidersPage({ service, onSelectProvider }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const serviceLabels = {
    plumber: '🔧 Nearby Plumbers',
    electrician: '⚡ Nearby Electricians',
    carpenter: '🪵 Nearby Carpenters',
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  const fetchProviders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/providers/${service}`);
      setProviders(res.data);
    } catch (err) {
      setError('Failed to load providers');
    }
    setLoading(false);
  };

  if (loading) return <div style={styles.center}>Loading providers...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div>
      <h2 style={styles.title}>{serviceLabels[service]}</h2>
      <p style={styles.subtitle}>
        {providers.length === 0
          ? 'No providers registered yet'
          : `${providers.length} provider(s) available`}
      </p>

      {providers.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🔍</div>
          <p style={styles.emptyText}>No providers available yet.</p>
          <p style={styles.emptySubText}>Check back later!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {providers.map(provider => (
            <div key={provider.id} style={styles.card}>

              {/* Photo */}
              <div style={styles.photo}>
                {provider.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={styles.name}>{provider.name}</div>

              <div style={styles.row}>
                <span style={styles.rating}>⭐ {provider.rating}</span>
                <span style={styles.location}>📍 {provider.location || 'N/A'}</span>
              </div>

              <div style={styles.row}>
                <span style={styles.experience}>🕒 {provider.experience}</span>
                <span style={styles.price}>{provider.price}</span>
              </div>

              {provider.phone && (
                <div style={styles.phone}>📞 {provider.phone}</div>
              )}

              <button
                style={styles.btn}
                onClick={() => onSelectProvider(provider)}
              >
                Book Now
              </button>

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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: '#1a3c5e',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a3c5e',
    marginBottom: 10,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  rating: {
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: 600,
  },
  location: {
    fontSize: 13,
    color: '#888',
  },
  experience: {
    fontSize: 13,
    color: '#888',
  },
  price: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1a3c5e',
  },
  phone: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  btn: {
    width: '100%',
    padding: '10px',
    borderRadius: 8,
    border: 'none',
    background: '#1a3c5e',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 12,
  },
};