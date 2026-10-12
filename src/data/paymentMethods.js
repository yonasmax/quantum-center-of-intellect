// src/data/paymentMethods.js
// Ethiopian payment methods for Quantum Center of Intellect

export const PAYMENT_METHODS = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    fullName: 'Telebirr - Ethio Telecom Mobile Money',
    type: 'phone',
    icon: '📱',
    color: 'orange',
    accountNumber: '+251921639261',
    accountName: 'Meskey Hizunan Medhanealem Monastery School',
    instructions: [
      'Open Telebirr app on your phone',
      'Select "Send Money"',
      'Enter the phone number above',
      'Enter the amount shown',
      'Confirm with your PIN',
      'Save the transaction reference',
    ],
  },
  {
    id: 'cbe',
    name: 'CBE',
    fullName: 'Commercial Bank of Ethiopia',
    type: 'account',
    icon: '🏦',
    color: 'purple',
    accountNumber: '1000213472392',
    accountName: 'Meskey Hizunan Medhanealem Monastery School',
    instructions: [
      'Open CBE Birr app OR visit any CBE branch',
      'Enter the account number above',
      'Enter the amount shown',
      'Confirm the transaction',
      'Save the transaction reference',
    ],
  },
  {
    id: 'abyssinia',
    name: 'Abyssinia',
    fullName: 'Bank of Abyssinia',
    type: 'account',
    icon: '🏛️',
    color: 'yellow',
    accountNumber: '117871509',
    accountName: 'Meskey Hizunan Medhanealem Monastery School',
    instructions: [
      'Open Abyssinia Mobile Banking',
      'Choose "Transfer"',
      'Enter the account number above',
      'Enter the amount shown',
      'Confirm the transfer',
      'Save the transaction reference',
    ],
  },
  {
    id: 'bunna',
    name: 'Bunna',
    fullName: 'Bunna Bank',
    type: 'account',
    icon: '💰',
    color: 'orange',
    accountNumber: '1000456789012',
    accountName: 'Meskey Hizunan Medhanealem Monastery School',
    instructions: [
      'Open Bunna Mobile app',
      'Select "Transfer"',
      'Enter the account number above',
      'Enter the amount',
      'Confirm with your PIN',
      'Save the transaction reference',
    ],
  },
  {
    id: 'nisir',
    name: 'Nisir',
    fullName: 'Nisir Bank (formerly Lion Bank)',
    type: 'account',
    icon: '🦁',
    color: 'yellow',
    accountNumber: '0132012345678',
    accountName: 'Meskey Hizunan Medhanealem Monastery School',
    instructions: [
      'Open Nisir Bank mobile app',
      'Choose "Send Money"',
      'Enter the account number above',
      'Enter the amount',
      'Confirm the transfer',
      'Save the transaction reference',
    ],
  },
];

// Get a method by ID
export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find((m) => m.id === id) || null;
}
