export const CATEGORIES = [
  {
    id: 'food',
    label: 'Food & Pantry',
    icon: '🍎',
    color: '#22c55e',
    subcategories: ['Fruits & Veg', 'Dairy', 'Grains & Pasta', 'Canned Goods', 'Snacks', 'Beverages', 'Condiments', 'Spices', 'Frozen', 'Baking'],
  },
  {
    id: 'electronics',
    label: 'Electronics',
    icon: '📱',
    color: '#3b82f6',
    subcategories: ['TV & Audio', 'Computers', 'Phones & Tablets', 'Gaming', 'Cameras', 'Smart Home', 'Cables & Accessories'],
  },
  {
    id: 'furniture',
    label: 'Furniture',
    icon: '🛋️',
    color: '#8b5cf6',
    subcategories: ['Seating', 'Tables', 'Beds', 'Storage', 'Outdoor', 'Office'],
  },
  {
    id: 'appliances',
    label: 'Appliances',
    icon: '🫙',
    color: '#64748b',
    subcategories: ['Kitchen Appliances', 'Laundry', 'HVAC', 'Water Heaters'],
  },
  {
    id: 'clothing',
    label: 'Clothing & Accessories',
    icon: '👕',
    color: '#ec4899',
    subcategories: ["Men's", "Women's", "Kids'", 'Shoes', 'Jewelry', 'Bags'],
  },
  {
    id: 'tools',
    label: 'Tools & Equipment',
    icon: '🔧',
    color: '#f59e0b',
    subcategories: ['Power Tools', 'Hand Tools', 'Garden', 'Automotive', 'Safety'],
  },
  {
    id: 'documents',
    label: 'Documents & Records',
    icon: '📄',
    color: '#0d9488',
    subcategories: ['Insurance', 'Legal', 'Medical', 'Financial', 'Warranties'],
  },
  {
    id: 'collectibles',
    label: 'Collectibles & Art',
    icon: '🏺',
    color: '#d97706',
    subcategories: ['Art', 'Antiques', 'Books', 'Music', 'Sports Cards'],
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    icon: '🚗',
    color: '#1e3a5f',
    subcategories: ['Cars', 'Motorcycles', 'Bicycles', 'Boats', 'RVs'],
  },
  {
    id: 'kitchenware',
    label: 'Kitchenware & Cutlery',
    icon: '🍳',
    color: '#ef4444',
    subcategories: ['Cookware', 'Bakeware', 'Cutlery', 'Dishes', 'Glassware', 'Small Appliances'],
  },
  {
    id: 'sports',
    label: 'Sports & Fitness',
    icon: '⚽',
    color: '#10b981',
    subcategories: ['Exercise Equipment', 'Sports Gear', 'Outdoor Recreation', 'Swimming'],
  },
  {
    id: 'medical',
    label: 'Medical & Health',
    icon: '💊',
    color: '#f43f5e',
    subcategories: ['Medications', 'Medical Devices', 'First Aid', 'Supplements'],
  },
  {
    id: 'storage',
    label: 'Storage & Seasonal',
    icon: '📦',
    color: '#78716c',
    subcategories: ['Holiday Decor', 'Seasonal Clothing', 'Moving Boxes', 'Archive'],
  },
  {
    id: 'cleaning',
    label: 'Cleaning Supplies',
    icon: '🧹',
    color: '#06b6d4',
    subcategories: ['Cleaning Products', 'Laundry', 'Paper Products'],
  },
  {
    id: 'other',
    label: 'Other',
    icon: '📋',
    color: '#94a3b8',
    subcategories: ['Miscellaneous'],
  },
]

export const ITEM_CONDITIONS = ['New', 'Excellent', 'Good', 'Fair', 'Poor']

export const STORAGE_LOCATIONS = [
  { id: 'bedroom', label: 'Bedroom', icon: '🛏️' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
  { id: 'living_room', label: 'Living Room', icon: '🛋️' },
  { id: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { id: 'garage', label: 'Garage', icon: '🚗' },
  { id: 'basement', label: 'Basement', icon: '⬇️' },
  { id: 'attic', label: 'Attic', icon: '⬆️' },
  { id: 'office', label: 'Office', icon: '💼' },
  { id: 'outdoor', label: 'Outdoor', icon: '🌿' },
  { id: 'storage_unit', label: 'Storage Unit', icon: '📦' },
  { id: 'vehicle', label: 'Vehicle', icon: '🚙' },
]

export const getCategoryById = (id) => CATEGORIES.find(c => c.id === id)
export const getCategoryIcon = (id) => getCategoryById(id)?.icon || '📋'
export const getCategoryLabel = (id) => getCategoryById(id)?.label || id
export const getCategoryColor = (id) => getCategoryById(id)?.color || '#94a3b8'
