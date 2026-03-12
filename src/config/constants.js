export const APP_NAME = 'HomeVault'
export const LOW_STOCK_THRESHOLD = 2
export const EXPIRY_WARNING_DAYS = 7
export const MAINTENANCE_WARNING_DAYS = 14
export const WARRANTY_WARNING_DAYS = 30
export const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2/product'

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
]

export const UNIT_OPTIONS = [
  'units', 'pcs', 'pairs', 'sets',
  'kg', 'g', 'lb', 'oz',
  'L', 'mL', 'gal', 'fl oz',
  'boxes', 'bags', 'bottles', 'cans', 'packs',
  'rolls', 'sheets', 'bunches',
]

export const RECURRENCE_OPTIONS = [
  { value: 'once', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (every 3 months)' },
  { value: 'biannual', label: 'Bi-annual (every 6 months)' },
  { value: 'annual', label: 'Annually' },
]
