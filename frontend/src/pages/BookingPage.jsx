import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM',
];

function CheckoutForm({ provider, service, user, date, timeSlot, onBookingDone, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amount = parseInt(provider.price?.replace(/[^0-9]/g, '')) || 300;

  const handlePay = async (e) => {
    e.preventDefault();
    if (!date || !timeSlot) { setError('Please select date and time slot'); return; }
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Step 1 - Create booking
      const bookingRes = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/bookings`,
        { provider_id: provider.id, service, date, time_slot: timeSlot, total_amount: provider.price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const bookingId = bookingRes.data.booking_id;

      // Step 2 - Create payment intent
      const intentRes = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payment/create-intent`,
        { amount, booking_id: bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const clientSecret = intentRes.data.clientSecret;

      // Step 3 - Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: user.name, email: user.email },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      // Step 4 - Confirm payment in backend
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payment/confirm`,
        {
          booking_id: bookingId,
          stripe_payment_intent_id: result.paymentIntent.id,
          amount: provider.price,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLoading(false);
      onBookingDone();

    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay}>

      {/* Provider Info */}
      <div style={styles.providerCard}>
        <div style={styles.providerAvatar}>
          {provider.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={styles.providerName}>{provider.name}</div>
          <div style={styles.providerDetail}>⭐ {provider.rating} &nbsp;|&nbsp; {provider.price} &nbsp;|&nbsp; {provider.experience}</div>
        </div>
      </div>

      {/* Date */}
      <div style={styles.field}>
        <label style={styles.label}>Select Date</label>
        <input
          type="date"
          style={styles.input}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => document.getElementById('date-val').value = e.target.value}
          required
        />
        <input type="hidden" id="date-val" />
      </div>

      {/* Time Slots */}
      <div style={styles.field}>
        <label style={styles.label}>Select Time Slot</label>
        <div style={styles.slotsGrid}>
          {timeSlots.map(slot => (
            <div
              key={slot}
              id={`slot-${slot}`}
              style={styles.slot}
              onClick={() => {
                timeSlots.forEach(s => {
                  const el = document.getElementById(`slot-${s}`);
                  if (el) el.style.background = '#f0f4f8';
                  if (el) el.style.color = '#333';
                  if (el) el.style.borderColor = '#ddd';
                });
                const el = document.getElementById(`slot-${slot}`);
                if (el) el.style.background = '#1a3c5e';
                if (el) el.style.color = '#fff';
                if (el) el.style.borderColor = '#1a3c5e';
                document.getElementById('slot-val').value = slot;
              }}
            >
              {slot}
            </div>
          ))}
        </div>
        <input type="hidden" id="slot-val" />
      </div>

      {/* Payment */}
      <div style={styles.field}>
        <label style={styles.label}>Card Details</label>
        <div style={styles.cardBox}>
          <CardElement options={{ style: { base: { fontSize: '16px', color: '#333' } } }} />
        </div>
      </div>

      {/* Amount */}
      <div style={styles.amountBox}>
        <span style={styles.amountLabel}>Total Amount</span>
        <span style={styles.amountValue}>₹{amount}</span>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.btnRow}>
        <button type="button" style={styles.backBtn} onClick={onBack}>← Back</button>
        <button
          type="submit"
          style={loading ? styles.btnDisabled : styles.btn}
          disabled={loading}
          onClick={(e) => {
            const date = document.getElementById('date-val').value;
            const slot = document.getElementById('slot-val').value;
            if (!date) { e.preventDefault(); setError('Please select a date'); return; }
            if (!slot) { e.preventDefault(); setError('Please select a time slot'); return; }
          }}
        >
          {loading ? 'Processing...' : `Pay ₹${amount}`}
        </button>
      </div>

    </form>
  );
}

export default function BookingPage({ provider, service, user, onBack, onBookingDone }) {
  // eslint-disable-next-line no-unused-vars
  const [date, setDate] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [timeSlot, setTimeSlot] = useState('');

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📅 Book Appointment</h2>
      <p style={styles.subtitle}>Complete your booking and payment below</p>

      <div style={styles.card}>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            provider={provider}
            service={service}
            user={user}
            date={date}
            timeSlot={timeSlot}
            onBookingDone={onBookingDone}
            onBack={onBack}
          />
        </Elements>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
  },
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
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '2rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  providerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: '#f0f4f8',
    borderRadius: 12,
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  providerAvatar: {
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
  providerName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a3c5e',
    marginBottom: 4,
  },
  providerDetail: {
    fontSize: 13,
    color: '#666',
  },
  field: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: 13,
    color: '#555',
    fontWeight: 500,
    marginBottom: 8,
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
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
  },
  slot: {
    padding: '10px 6px',
    borderRadius: 8,
    border: '1px solid #ddd',
    background: '#f0f4f8',
    fontSize: 13,
    textAlign: 'center',
    cursor: 'pointer',
    color: '#333',
  },
  cardBox: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '14px',
  },
  amountBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f0f4f8',
    borderRadius: 8,
    padding: '12px 16px',
    marginBottom: '1.25rem',
  },
  amountLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: 500,
  },
  amountValue: {
    fontSize: 20,
    color: '#1a3c5e',
    fontWeight: 700,
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
  btnRow: {
    display: 'flex',
    gap: 12,
  },
  backBtn: {
    padding: '12px 20px',
    borderRadius: 8,
    border: '1px solid #ddd',
    background: '#fff',
    color: '#555',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btn: {
    flex: 1,
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    background: '#1a3c5e',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnDisabled: {
    flex: 1,
    padding: '12px',
    borderRadius: 8,
    border: 'none',
    background: '#6a8fad',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'not-allowed',
  },
};