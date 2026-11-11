// =============================================
// Deck Estimator — Shared Standard Hours of Operation
// =============================================
// Single source of truth for Contracting Services & Office Hours
// displayed across Customer and Contractor portals.

export const OPERATING_HOURS_SCHEDULES = [
  {
    id: 'contracting',
    title: 'Standard Hours of Operation (Contracting Services)',
    shortTitle: 'Contracting Services',
    badge: 'Mon – Thu Field Ops',
    summary: 'Mon – Thu: 8:00am - 5:00pm | Fri – Sun: CLOSED',
    accentColor: '#1E3A63',
    tintBg: '#EFF6FF',
    tintBorder: '#BFDBFE',
    days: [
      { day: 'Monday', hours: '8:00am - 5:00pm', closed: false },
      { day: 'Tuesday', hours: '8:00am - 5:00pm', closed: false },
      { day: 'Wednesday', hours: '8:00am - 5:00pm', closed: false },
      { day: 'Thursday', hours: '8:00am - 5:00pm', closed: false },
      { day: 'Friday', hours: 'CLOSED', closed: true },
      { day: 'Saturday', hours: 'CLOSED', closed: true },
      { day: 'Sunday', hours: 'CLOSED', closed: true },
    ],
  },
  {
    id: 'office',
    title: 'Standard Hours of Operation (Office Hours)',
    shortTitle: 'Office Hours',
    badge: 'Mon – Fri Support',
    summary: 'Mon – Fri: 8:00am - 4:00pm | Sat – Sun: CLOSED',
    accentColor: '#E08131',
    tintBg: '#FFF7ED',
    tintBorder: '#FED7AA',
    days: [
      { day: 'Monday', hours: '8:00am - 4:00pm', closed: false },
      { day: 'Tuesday', hours: '8:00am - 4:00pm', closed: false },
      { day: 'Wednesday', hours: '8:00am - 4:00pm', closed: false },
      { day: 'Thursday', hours: '8:00am - 4:00pm', closed: false },
      { day: 'Friday', hours: '8:00am - 4:00pm', closed: false },
      { day: 'Saturday', hours: 'CLOSED', closed: true },
      { day: 'Sunday', hours: 'CLOSED', closed: true },
    ],
  },
];

export const OPERATING_HOURS_PRINT_LINES = {
  contracting: 'Contracting Services: Mon – Thu 8:00am - 5:00pm (Fri – Sun: CLOSED)',
  office: 'Office Hours: Mon – Fri 8:00am - 4:00pm (Sat – Sun: CLOSED)',
};

