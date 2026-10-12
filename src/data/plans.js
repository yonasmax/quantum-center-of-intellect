// src/data/plans.js
// Pricing plans for Quantum Center of Intellect

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'ETB',
    duration: 'Forever',
    durationDays: null,
    color: 'gray',
    popular: false,
    features: [
      '3 lessons per subject',
      'All quizzes',
      'Progress tracking',
      'No certificates',
      'Ad-supported',
    ],
    limitations: ['Limited to 3 lessons per subject'],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 149,
    currency: 'ETB',
    duration: '30 days',
    durationDays: 30,
    color: 'blue',
    popular: false,
    features: [
      'All lessons in 1 subject',
      'All quizzes',
      'Progress tracking',
      'Achievements',
      'No ads',
    ],
    limitations: ['Limited to 1 subject'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 349,
    currency: 'ETB',
    duration: '30 days',
    durationDays: 30,
    color: 'orange',
    popular: true,
    features: [
      'All lessons in ALL subjects',
      'All quizzes',
      'Progress tracking',
      'Achievements',
      'Certificates',
      'No ads',
    ],
    limitations: [],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 599,
    currency: 'ETB',
    duration: '30 days',
    durationDays: 30,
    color: 'purple',
    popular: false,
    features: [
      'Everything in Plus',
      'AI Tutor',
      'Priority support',
      'Weekly parent reports',
      'Exam prep bundles',
    ],
    limitations: [],
  },
];

export const FAMILY_PLAN = {
  id: 'family',
  name: 'Family Pass',
  price: 1500,
  currency: 'ETB',
  duration: '30 days',
  durationDays: 30,
  color: 'green',
  popular: false,
  maxChildren: 5,
  features: [
    'Up to 5 children',
    'All lessons for all grades',
    'All subjects',
    'All certificates',
    'AI Tutor for all',
    'Priority support',
  ],
};

export const REGISTRATION_FEE = {
  amount: 200,
  currency: 'ETB',
  description: 'One-time registration fee',
};

// Get a plan by ID
export function getPlan(id) {
  if (id === 'family') return FAMILY_PLAN;
  return PLANS.find((p) => p.id === id) || null;
}

// Get all plans (including family)
export function getAllPlans() {
  return [...PLANS, FAMILY_PLAN];
}
