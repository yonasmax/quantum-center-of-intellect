// src/services/paymentsAPI.js
// Frontend helpers for Chapa payments via Telebirr

// Initialize a payment session with Chapa
export const initPayment = async (paymentData) => {
  const res = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');
  return data;
};

// Verify a completed payment
export const verifyPayment = async (verifyData) => {
  const res = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verifyData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to verify payment');
  return data;
};
