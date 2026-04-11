// Dummy data for Circular Construction OS — isolated from existing app data

export const OS_USER = {
  name: 'Alex Morgan',
  email: 'alex@circularos.io',
  role: 'Contractor',
  avatar: 'AM',
  plan: 'Pro',
};

export const OS_STATS = [
  { label: 'Waste Uploaded', value: '142', unit: 'tonnes', delta: '+12%', trend: 'up', color: 'emerald' },
  { label: 'Active Listings', value: '38', unit: 'items', delta: '+5', trend: 'up', color: 'blue' },
  { label: 'Carbon Saved', value: '9,840', unit: 'kg CO₂', delta: '+18%', trend: 'up', color: 'teal' },
  { label: 'Revenue Generated', value: '$24,500', unit: 'USD', delta: '+9%', trend: 'up', color: 'violet' },
];

export const OS_RECENT_UPLOADS = [
  { id: '1', material: 'Structural Steel', weight: '12.4t', status: 'listed', confidence: 94, date: '2 hours ago' },
  { id: '2', material: 'Concrete Rubble', weight: '34.1t', status: 'pending', confidence: 87, date: '5 hours ago' },
  { id: '3', material: 'Timber Beams', weight: '8.7t', status: 'sold', confidence: 91, date: '1 day ago' },
  { id: '4', material: 'Copper Wiring', weight: '2.1t', status: 'listed', confidence: 96, date: '1 day ago' },
  { id: '5', material: 'Glass Panels', weight: '5.3t', status: 'sold', confidence: 89, date: '2 days ago' },
];

export const OS_MARKETPLACE_ITEMS = [
  { id: '1', title: 'Structural Steel I-Beams', material: 'Metal Waste', weight: '12.4t', price: 4800, purity: 94, seller: 'BuildCo NYC', location: 'New York, NY', status: 'available', image: 'metal' },
  { id: '2', title: 'Crushed Concrete Mix', material: 'Concrete Waste', weight: '34.1t', price: 1200, purity: 87, seller: 'DemoTech Ltd', location: 'Brooklyn, NY', status: 'available', image: 'concrete' },
  { id: '3', title: 'Reclaimed Oak Timber', material: 'Wood Waste', weight: '8.7t', price: 3200, purity: 91, seller: 'GreenBuild Co', location: 'Queens, NY', status: 'available', image: 'wood' },
  { id: '4', title: 'Copper Cable Scrap', material: 'Metal Waste', weight: '2.1t', price: 6400, purity: 96, seller: 'ElecReclaim', location: 'Newark, NJ', status: 'available', image: 'metal' },
  { id: '5', title: 'Float Glass Sheets', material: 'Glass Waste', weight: '5.3t', price: 900, purity: 89, seller: 'ClearCycle', location: 'Hoboken, NJ', status: 'sold', image: 'glass' },
  { id: '6', title: 'Red Clay Bricks', material: 'Brick Waste', weight: '18.0t', price: 2100, purity: 82, seller: 'MasonRec', location: 'Jersey City, NJ', status: 'available', image: 'brick' },
];

export const OS_ANALYTICS_MONTHLY = [
  { month: 'Jan', uploaded: 18, sold: 12, carbon: 820 },
  { month: 'Feb', uploaded: 24, sold: 18, carbon: 1100 },
  { month: 'Mar', uploaded: 31, sold: 22, carbon: 1340 },
  { month: 'Apr', uploaded: 28, sold: 20, carbon: 1200 },
  { month: 'May', uploaded: 42, sold: 31, carbon: 1890 },
  { month: 'Jun', uploaded: 38, sold: 28, carbon: 1650 },
];

export const OS_MATERIAL_BREAKDOWN = [
  { name: 'Metal', value: 38, color: '#64748b' },
  { name: 'Concrete', value: 27, color: '#6b7280' },
  { name: 'Wood', value: 16, color: '#92400e' },
  { name: 'Glass', value: 10, color: '#0891b2' },
  { name: 'Other', value: 9, color: '#10b981' },
];

export const OS_RESULTS_SAMPLE = [
  {
    id: 'r1', filename: 'site_photo_01.jpg', material: 'Structural Steel', confidence: 94,
    weight_est: '12.4t', carbon_saved: 1820, value_est: '$4,800', status: 'listed',
    breakdown: [{ type: 'Metal Waste', pct: 94 }, { type: 'Rubber Waste', pct: 6 }],
  },
  {
    id: 'r2', filename: 'demolition_heap.jpg', material: 'Concrete Rubble', confidence: 87,
    weight_est: '34.1t', carbon_saved: 5420, value_est: '$1,200', status: 'pending',
    breakdown: [{ type: 'Concrete Waste', pct: 87 }, { type: 'Sand', pct: 13 }],
  },
  {
    id: 'r3', filename: 'timber_stack.jpg', material: 'Reclaimed Timber', confidence: 91,
    weight_est: '8.7t', carbon_saved: 3880, value_est: '$3,200', status: 'sold',
    breakdown: [{ type: 'Wood Waste', pct: 91 }, { type: 'Insulation Waste', pct: 9 }],
  },
];
