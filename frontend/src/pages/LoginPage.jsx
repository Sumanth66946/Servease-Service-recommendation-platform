import React, { useState } from 'react';
import axios from 'axios';

export default function LoginPage({ onLogin, onProviderClick }) {
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (tab === 'signup' && !name) { setError('Please enter your name.'); return; }

    setLoading(true);
    try {
      let res;
      if (tab === 'login') {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, { email, password });
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_URL}/api/register`, { name, email, password, location });
      }
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>🔧 ServEase</div>
        <p style={styles.tagline}>Book trusted home services near you</p>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={tab === 'login' ? styles.activeTab : styles.tab}
            onClick={() => { setTab('login'); setError(''); }}
          >Sign In</button>
          <button
            style={tab === 'signup' ? styles.activeTab : styles.tab}
            onClick={() => { setTab('signup'); setError(''); }}
          >Sign Up</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {tab === 'signup' && (
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {tab === 'signup' && (
            <div style={styles.field}>
              <label style={styles.label}>Your Location</label>
              <input
                style={styles.input}
                type="text"
                placeholder="eg. Bangalore, HSR Layout"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={loading ? styles.btnDisabled : styles.btn}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (tab === 'login' ? 'Sign In' : 'Create Account')}
          </button>

        </form>

        {/* Switch Tab */}
        <p style={styles.switchText}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            style={styles.switchLink}
            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {tab === 'login' ? 'Sign Up' : 'Sign In'}
          </span>
        </p>

        {/* Divider */}
        <div style={styles.divider}>─────── or ───────</div>

        {/* Provider Button */}
        <button
          style={styles.providerBtn}
          onClick={onProviderClick}
        >
          Are you a Provider? Login / Register here
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f0f4f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '2.5rem',
    width: 400,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  logo: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1a3c5e',
    textAlign: 'center',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  tabs: {
    display: 'flex',
    background: '#f0f4f8',
    borderRadius: 10,
    padding: 4,
    marginBottom: '1.5rem',
  },
  tab: {
    flex: 1,
    padding: '9px 0',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    background: 'transparent',
    color: '#888',
  },
  activeTab: {
    flex: 1,
    padding: '9px 0',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    background: '#fff',
    color: '#1a3c5e',
    fontWeight: 600,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  field: {
    marginBottom: 14,
  },
  label: {
    display: 'block',
    fontSize: 13,
    color: '#555',
    marginBottom: 5,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 14,
    color: '#333',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: {
    background: '#fff0f0',
    border: '1px solid #fca5a5',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#c0392b',
    marginBottom: 14,
  },
  btn: {
    width: '100%',
    padding: 13,
    borderRadius: 8,
    border: 'none',
    background: '#1a3c5e',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 14,
  },
  btnDisabled: {
    width: '100%',
    padding: 13,
    borderRadius: 8,
    border: 'none',
    background: '#6a8fad',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'not-allowed',
    marginBottom: 14,
  },
  switchText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
  },
  switchLink: {
    color: '#1a3c5e',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  divider: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 13,
    margin: '12px 0',
  },
  providerBtn: {
    width: '100%',
    padding: 11,
    borderRadius: 8,
    border: '1px solid #1a3c5e',
    background: 'transparent',
    color: '#1a3c5e',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};